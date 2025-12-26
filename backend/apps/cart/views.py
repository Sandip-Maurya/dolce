"""
Views for cart app.
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from apps.products.models import Product
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer, AddToCartSerializer, UpdateCartItemSerializer


def get_or_create_cart(user):
    """Get or create cart for user."""
    cart, created = Cart.objects.get_or_create(user=user)
    return cart


@extend_schema(
    tags=['Cart'],
    summary='Get user cart or add item to cart',
    request=AddToCartSerializer,
    responses={
        200: CartSerializer,
        201: CartItemSerializer,
        400: {'description': 'Invalid request'},
        404: {'description': 'Product not found'},
    },
)
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def cart_view(request):
    """Get cart or add item to cart."""
    if request.method == 'GET':
        return get_cart_view(request)
    else:
        return add_to_cart_view(request)


def get_cart_view(request):
    """Get user's cart."""
    cart = get_or_create_cart(request.user)
    serializer = CartSerializer(cart)
    return Response(serializer.data, status=status.HTTP_200_OK)


def add_to_cart_view(request):
    """Add item to cart."""
    product_id = request.data.get('productId')
    quantity = request.data.get('quantity', 1)
    
    if not product_id or not quantity or quantity <= 0:
        return Response(
            {'error': 'Invalid request. productId and quantity (positive number) are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        product = Product.objects.get(id=product_id, is_available=True)
    except Product.DoesNotExist:
        return Response(
            {'error': 'Product not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    cart = get_or_create_cart(request.user)
    
    # Check if item already exists in cart
    cart_item, created = CartItem.objects.get_or_create(
        cart=cart,
        product=product,
        defaults={'quantity': quantity}
    )
    
    if not created:
        # Update quantity
        cart_item.quantity += quantity
        cart_item.save()
    
    serializer = CartItemSerializer(cart_item)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@extend_schema(
    tags=['Cart'],
    summary='Update cart item quantity',
    request=UpdateCartItemSerializer,
    responses={200: CartItemSerializer, 400: {'description': 'Invalid quantity'}, 404: {'description': 'Cart item not found'}},
)
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_cart_item_view(request, id):
    """Update cart item quantity."""
    quantity = request.data.get('quantity')
    
    if not quantity or quantity <= 0:
        return Response(
            {'error': 'Quantity must be a positive number'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    cart = get_or_create_cart(request.user)
    cart_item = get_object_or_404(CartItem, id=id, cart=cart)
    
    cart_item.quantity = quantity
    cart_item.save()
    
    serializer = CartItemSerializer(cart_item)
    return Response(serializer.data, status=status.HTTP_200_OK)


@extend_schema(
    tags=['Cart'],
    summary='Remove item from cart',
    responses={200: {'type': 'object', 'properties': {'success': {'type': 'boolean'}}}, 404: {'description': 'Cart item not found'}},
)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_cart_view(request, id):
    """Remove item from cart."""
    cart = get_or_create_cart(request.user)
    cart_item = get_object_or_404(CartItem, id=id, cart=cart)
    cart_item.delete()
    
    return Response({'success': True}, status=status.HTTP_200_OK)

