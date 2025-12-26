"""
Views for orders app.
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from django.db import transaction
from django.utils.dateparse import parse_date
from apps.products.models import Product
from apps.cart.models import Cart, CartItem
from .models import Order, OrderItem
from .serializers import OrderSerializer, CreateOrderSerializer


@extend_schema(
    tags=['Orders'],
    summary='List user orders or create order',
    request=CreateOrderSerializer,
    responses={200: OrderSerializer(many=True), 201: OrderSerializer},
)
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def order_view(request):
    """Get user's orders or create new order."""
    if request.method == 'GET':
        return order_list_view(request)
    else:
        return create_order_view(request)


def order_list_view(request):
    """Get user's orders."""
    orders = Order.objects.filter(user=request.user)
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


def create_order_view(request):
    """Create order from cart or items."""
    serializer = CreateOrderSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    data = serializer.validated_data
    items_data = data['items']
    customer_details = data['customerDetails']
    shipping_address = data['shippingAddress']
    delivery_preferences = data.get('deliveryPreferences', {})
    
    # Validate items
    if not items_data or len(items_data) == 0:
        return Response(
            {'error': 'Items array is required and must not be empty'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validate required fields
    required_customer_fields = ['name', 'email', 'phone']
    required_shipping_fields = ['street', 'city', 'state', 'zipCode', 'country']
    
    if not all(field in customer_details for field in required_customer_fields):
        return Response(
            {'error': 'Customer details must include name, email, and phone'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not all(field in shipping_address for field in required_shipping_fields):
        return Response(
            {'error': 'Shipping address must include street, city, state, zipCode, and country'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        with transaction.atomic():
            # Create order
            order = Order.objects.create(
                user=request.user,
                customer_name=customer_details['name'],
                customer_email=customer_details['email'],
                customer_phone=customer_details['phone'],
                shipping_street=shipping_address['street'],
                shipping_city=shipping_address['city'],
                shipping_state=shipping_address['state'],
                shipping_zip_code=shipping_address['zipCode'],
                shipping_country=shipping_address.get('country', 'India'),
                gift_note=delivery_preferences.get('giftNote'),
                delivery_date=parse_date(delivery_preferences.get('deliveryDate')) if delivery_preferences.get('deliveryDate') else None,
            )
            
            # Create order items
            for item_data in items_data:
                product_id = item_data.get('productId')
                quantity = int(item_data.get('quantity', 1))
                
                try:
                    product = Product.objects.get(id=product_id, is_available=True)
                except Product.DoesNotExist:
                    raise ValueError(f'Product with id {product_id} not found')
                
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=quantity,
                    price_at_purchase=product.price,
                )
            
            # Clear user's cart
            try:
                cart = Cart.objects.get(user=request.user)
                CartItem.objects.filter(cart=cart).delete()
            except Cart.DoesNotExist:
                pass
            
            response_serializer = OrderSerializer(order)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    except ValueError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': f'Failed to create order: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )

