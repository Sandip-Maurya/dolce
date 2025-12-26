"""
Serializers for payments app.
"""
from rest_framework import serializers
from .models import Payment


class PaymentOrderRequestSerializer(serializers.Serializer):
    """Serializer for payment order request."""
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    currency = serializers.CharField(max_length=3, default='INR', required=False)
    orderId = serializers.UUIDField(required=True)


class PaymentOrderResponseSerializer(serializers.ModelSerializer):
    """Serializer for payment order response."""
    paymentOrderId = serializers.CharField(source='payment_order_id', read_only=True)
    
    class Meta:
        model = Payment
        fields = ['paymentOrderId', 'provider', 'amount', 'currency']

