"""
Serializers for orders app.
"""
from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from apps.products.serializers import ProductSerializer
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for order items (CartItem format for frontend compatibility)."""
    product = ProductSerializer(read_only=True)
    id = serializers.UUIDField(read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'line_total']


class OrderSerializer(serializers.ModelSerializer):
    """Serializer for orders."""
    items = OrderItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(format='%Y-%m-%dT%H:%M:%S.%fZ', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id',
            'items',
            'total',
            'status',
            'created_at',
        ]
    
    @extend_schema_field(serializers.FloatField())
    def get_total(self, obj) -> float:
        """Calculate and return order total."""
        return float(obj.get_total())


class CreateOrderSerializer(serializers.Serializer):
    """Serializer for creating orders."""
    items = serializers.ListField(
        child=serializers.DictField(
            child=serializers.CharField()
        )
    )
    customerDetails = serializers.DictField()
    shippingAddress = serializers.DictField()
    deliveryPreferences = serializers.DictField(required=False, allow_null=True)

