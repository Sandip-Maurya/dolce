"""
Views for payments app.
"""
import json
import logging
from decimal import Decimal
from django.db import transaction
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from apps.orders.models import Order
from .models import Payment
from .serializers import (
    PaymentOrderRequestSerializer,
    PaymentOrderResponseSerializer,
    PaymentVerificationRequestSerializer,
)
from .utils import get_razorpay_client, verify_payment_signature, verify_webhook_signature

logger = logging.getLogger(__name__)


@extend_schema(
    tags=['Payments'],
    summary='Create payment order',
    request=PaymentOrderRequestSerializer,
    responses={201: PaymentOrderResponseSerializer, 400: {'description': 'Invalid request'}},
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_order_view(request):
    """Create Razorpay payment order."""
    serializer = PaymentOrderRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    amount = serializer.validated_data['amount']
    currency = serializer.validated_data.get('currency', 'INR')
    order_id = serializer.validated_data.get('orderId')
    
    if not amount or amount <= 0:
        return Response(
            {'error': 'Valid amount is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Order ID is required
    if not order_id:
        return Response(
            {'error': 'Order ID is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Verify order exists and belongs to the user
    # Use select_for_update to handle race conditions
    try:
        order = Order.objects.select_related('user').get(id=order_id, user=request.user)
    except Order.DoesNotExist:
        logger.warning(f"Order not found: {order_id} for user {request.user.id}")
        return Response(
            {'error': 'Order not found', 'orderId': str(order_id)},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check if order already has a pending payment
    existing_payment = Payment.objects.filter(
        order=order,
        status=Payment.Status.PENDING
    ).first()
    
    if existing_payment:
        # Return existing payment order
        response_serializer = PaymentOrderResponseSerializer(existing_payment)
        return Response(response_serializer.data, status=status.HTTP_200_OK)
    
    try:
        # Create Razorpay order
        client = get_razorpay_client()
        
        # Convert amount to paise (smallest currency unit for INR)
        try:
            amount_in_paise = int(float(amount) * 100)
        except (ValueError, TypeError) as e:
            logger.error(f"Invalid amount format: {amount}, error: {str(e)}")
            return Response(
                {'error': 'Invalid amount format'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        razorpay_order_data = {
            'amount': amount_in_paise,
            'currency': currency,
            'receipt': f'order_{order.order_number}',
            'notes': {
                'order_id': str(order.id),
                'order_number': order.order_number,
            }
        }
        
        try:
            logger.info(f"Creating Razorpay order for amount: {amount_in_paise} paise, currency: {currency}")
            logger.debug(f"Razorpay order data: {razorpay_order_data}")
            logger.debug(f"Using Razorpay Key ID: {settings.RAZORPAY_KEY_ID[:15]}..." if settings.RAZORPAY_KEY_ID else "Key ID NOT SET")
            
            razorpay_order = client.order.create(data=razorpay_order_data)
            razorpay_order_id = razorpay_order['id']
            logger.info(f"Razorpay order created successfully: {razorpay_order_id}")
        except Exception as e:
            error_type = type(e).__name__
            error_msg = str(e)
            
            # Check for Razorpay-specific error types
            try:
                import razorpay.errors as razorpay_errors
                is_bad_request = isinstance(e, razorpay_errors.BadRequestError)
            except (ImportError, AttributeError):
                is_bad_request = False
            
            if is_bad_request:
                error_description = getattr(e, 'description', error_msg)
                logger.error(f"Razorpay BadRequestError: {error_description}")
                
                # Check for authentication errors
                if 'Authentication failed' in error_description or 'authentication' in error_description.lower():
                    logger.error(f"Razorpay authentication failed. Key ID: {settings.RAZORPAY_KEY_ID[:10]}...")
                    return Response(
                        {
                            'error': 'Razorpay authentication failed',
                            'details': 'Please verify your RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are correct. Ensure test keys are used for test mode and live keys for production.'
                        },
                        status=status.HTTP_401_UNAUTHORIZED
                    )
                
                return Response(
                    {
                        'error': 'Invalid Razorpay request',
                        'details': error_description if settings.DEBUG else 'Please check your payment details'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check for authentication errors in error message
            if 'Authentication failed' in error_msg or 'authentication' in error_msg.lower():
                logger.error(f"Razorpay authentication error: {error_msg}")
                logger.error(f"Key ID: {settings.RAZORPAY_KEY_ID[:10] if settings.RAZORPAY_KEY_ID else 'NOT SET'}...")
                return Response(
                    {
                        'error': 'Razorpay authentication failed',
                        'details': 'Please verify your RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are correct. Ensure test keys are used for test mode and live keys for production.'
                    },
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            logger.error(f"Razorpay API error ({error_type}): {error_msg}", exc_info=True)
            return Response(
                {
                    'error': 'Failed to create Razorpay order',
                    'details': error_msg if settings.DEBUG else 'Please check your Razorpay configuration'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Create payment record
        try:
            payment = Payment.objects.create(
                order=order,
                payment_order_id=razorpay_order_id,
                provider=Payment.Provider.RAZORPAY,
                amount=amount,
                currency=currency,
                status=Payment.Status.PENDING,
            )
        except Exception as e:
            error_type = type(e).__name__
            error_msg = str(e)
            logger.error(f"Database error creating payment ({error_type}): {error_msg}")
            # If database error, the Razorpay order was created but we can't save it
            # This is a critical error - log it but don't expose DB details
            return Response(
                {
                    'error': 'Failed to save payment record',
                    'details': 'Database error. Please contact support.' if not settings.DEBUG else error_msg
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        response_serializer = PaymentOrderResponseSerializer(payment)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    except ValueError as e:
        error_msg = str(e)
        logger.error(f"Razorpay configuration error: {error_msg}")
        return Response(
            {
                'error': 'Payment gateway not configured',
                'details': error_msg if 'DEBUG' in str(settings.DEBUG) else 'Please check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables'
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    except Exception as e:
        error_msg = str(e)
        error_type = type(e).__name__
        logger.error(f"Error creating Razorpay order ({error_type}): {error_msg}", exc_info=True)
        return Response(
            {
                'error': 'Failed to create payment order',
                'details': error_msg if settings.DEBUG else 'Please try again or contact support'
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    tags=['Payments'],
    summary='Verify payment',
    request=PaymentVerificationRequestSerializer,
    responses={
        200: {'description': 'Payment verified successfully'},
        400: {'description': 'Invalid request or verification failed'},
    },
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_payment_view(request):
    """Verify payment signature and update payment status."""
    serializer = PaymentVerificationRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    payment_id = serializer.validated_data['paymentId']
    order_id = serializer.validated_data['orderId']
    signature = serializer.validated_data['signature']
    
    try:
        # Get order and verify it belongs to user
        order = Order.objects.get(id=order_id, user=request.user)
    except Order.DoesNotExist:
        return Response(
            {'error': 'Order not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Get payment record - get the most recent payment for this order
    try:
        payment = Payment.objects.filter(order=order).order_by('-created_at').first()
        if not payment:
            return Response(
                {'error': 'Payment not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    except Payment.DoesNotExist:
        return Response(
            {'error': 'Payment not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Verify payment signature using Razorpay order ID
    is_valid = verify_payment_signature(
        payment_id=payment_id,
        order_id=payment.payment_order_id,  # This is the Razorpay order ID
        signature=signature
    )
    
    if not is_valid:
        payment.status = Payment.Status.FAILED
        payment.save()
        return Response(
            {'error': 'Payment verification failed'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Update payment record
    with transaction.atomic():
        payment.razorpay_payment_id = payment_id
        payment.razorpay_signature = signature
        payment.status = Payment.Status.SUCCESS
        payment.save()
        
        # Update order status to PAID
        order.status = Order.Status.PAID
        order.save()
    
    return Response(
        {'message': 'Payment verified successfully', 'paymentId': payment_id},
        status=status.HTTP_200_OK
    )


@extend_schema(
    tags=['Payments'],
    summary='Razorpay webhook handler',
    request={'application/json': {}},
    responses={
        200: {'description': 'Webhook processed successfully'},
        400: {'description': 'Invalid webhook'},
    },
)
@csrf_exempt  # Webhooks don't include CSRF tokens
@api_view(['POST'])
@permission_classes([])  # No authentication required for webhooks
def webhook_handler_view(request):
    """Handle Razorpay webhook events."""
    # Get webhook signature from headers
    webhook_signature = request.headers.get('X-Razorpay-Signature', '')
    
    if not webhook_signature:
        logger.warning("Webhook received without signature")
        return Response(
            {'error': 'Missing webhook signature'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Get raw payload
    payload = request.body
    
    # Verify webhook signature
    is_valid = verify_webhook_signature(payload, webhook_signature)
    
    if not is_valid:
        logger.warning("Invalid webhook signature")
        return Response(
            {'error': 'Invalid webhook signature'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Parse webhook payload
        event_data = json.loads(payload.decode('utf-8'))
        event_type = event_data.get('event')
        payload_data = event_data.get('payload', {}).get('payment', {}).get('entity', {})
        
        if not payload_data:
            logger.warning(f"Webhook event {event_type} has no payment entity")
            return Response({'message': 'No payment entity in webhook'}, status=status.HTTP_200_OK)
        
        payment_id = payload_data.get('id')
        order_id = payload_data.get('order_id')
        status_value = payload_data.get('status')
        
        if not payment_id or not order_id:
            logger.warning(f"Webhook missing payment_id or order_id: {event_data}")
            return Response({'message': 'Missing payment information'}, status=status.HTTP_200_OK)
        
        # Find payment record by Razorpay order ID
        try:
            payment = Payment.objects.get(payment_order_id=order_id)
        except Payment.DoesNotExist:
            logger.warning(f"Payment not found for order_id: {order_id}")
            return Response({'message': 'Payment not found'}, status=status.HTTP_200_OK)
        
        # Handle idempotency - check if we've already processed this payment
        if payment.razorpay_payment_id == payment_id and payment.webhook_received:
            logger.info(f"Webhook already processed for payment {payment_id}")
            return Response({'message': 'Webhook already processed'}, status=status.HTTP_200_OK)
        
        # Process webhook event
        with transaction.atomic():
            payment.razorpay_payment_id = payment_id
            payment.webhook_received = True
            
            if event_type == 'payment.captured' and status_value == 'captured':
                payment.status = Payment.Status.SUCCESS
                payment.order.status = Order.Status.PAID
                payment.order.save()
            elif event_type == 'payment.failed':
                payment.status = Payment.Status.FAILED
                # Keep order status as PLACED to allow retry
            
            payment.save()
        
        logger.info(f"Webhook processed: {event_type} for payment {payment_id}")
        return Response({'message': 'Webhook processed successfully'}, status=status.HTTP_200_OK)
    
    except json.JSONDecodeError:
        logger.error("Invalid JSON in webhook payload")
        return Response(
            {'error': 'Invalid JSON payload'},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        return Response(
            {'error': 'Error processing webhook'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

