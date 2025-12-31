"""
Serializers for payments app.
"""
from rest_framework import serializers
from django.conf import settings
from .models import Payment


class PaymentOrderRequestSerializer(serializers.Serializer):
    """Serializer for payment order request."""
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    currency = serializers.CharField(max_length=3, default='INR', required=False)
    orderId = serializers.UUIDField(required=True)


class PaymentOrderResponseSerializer(serializers.ModelSerializer):
    """Serializer for payment order response."""
    paymentOrderId = serializers.CharField(source='payment_order_id', read_only=True)
    key = serializers.SerializerMethodField()
    
    class Meta:
        model = Payment
        fields = ['paymentOrderId', 'provider', 'amount', 'currency', 'key']
    
    def get_key(self, obj):
        """Return Razorpay key ID for frontend SDK."""
        return settings.RAZORPAY_KEY_ID


class PaymentVerificationRequestSerializer(serializers.Serializer):
    """Serializer for payment verification request."""
    paymentId = serializers.CharField(required=True)
    orderId = serializers.UUIDField(required=True)
    signature = serializers.CharField(required=True)

