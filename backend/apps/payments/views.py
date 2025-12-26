"""
Views for payments app.
"""
import uuid
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from apps.orders.models import Order
from .models import Payment
from .serializers import PaymentOrderRequestSerializer, PaymentOrderResponseSerializer


@extend_schema(
    tags=['Payments'],
    summary='Create payment order',
    request=PaymentOrderRequestSerializer,
    responses={201: PaymentOrderResponseSerializer, 400: {'description': 'Invalid request'}},
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_order_view(request):
    """Create payment order (mock for now, ready for Razorpay integration)."""
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
    try:
        order = Order.objects.get(id=order_id, user=request.user)
    except Order.DoesNotExist:
        return Response(
            {'error': 'Order not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Generate mock payment order ID
    payment_order_id = f'payment-order-{uuid.uuid4().hex[:16]}'
    
    # Create payment record
    payment = Payment.objects.create(
        order=order,
        payment_order_id=payment_order_id,
        provider=Payment.Provider.RAZORPAY,
        amount=amount,
        currency=currency,
        status=Payment.Status.PENDING,
    )
    
    response_serializer = PaymentOrderResponseSerializer(payment)
    return Response(response_serializer.data, status=status.HTTP_201_CREATED)

