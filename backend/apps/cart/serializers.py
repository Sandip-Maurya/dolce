"""
Serializers for cart app.
"""
from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from apps.products.serializers import ProductSerializer
from .models import Cart, CartItem


class CartItemSerializer(serializers.ModelSerializer):
    """Serializer for cart items."""
    product = ProductSerializer(read_only=True)
    
    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity', 'line_total']


class CartSerializer(serializers.ModelSerializer):
    """Serializer for cart."""
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()
    
    class Meta:
        model = Cart
        fields = ['items', 'total']
    
    @extend_schema_field(serializers.FloatField())
    def get_total(self, obj) -> float:
        """Calculate and return cart total."""
        return float(obj.get_total())


class AddToCartSerializer(serializers.Serializer):
    """Serializer for adding item to cart."""
    productId = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1)


class UpdateCartItemSerializer(serializers.Serializer):
    """Serializer for updating cart item quantity."""
    quantity = serializers.IntegerField(min_value=1)

