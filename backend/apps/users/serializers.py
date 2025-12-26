"""
Serializers for user authentication.
"""
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Profile


class UserResponseSerializer(serializers.ModelSerializer):
    """Serializer for user response (without password)."""
    id = serializers.UUIDField(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'name']


class SignupSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = ['email', 'password', 'name']
    
    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            name=validated_data['name'],
            username=validated_data['email'],  # Use email as username
        )
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(request=self.context.get('request'), username=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid email or password.')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled.')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include "email" and "password".')
        
        return attrs


class LogoutResponseSerializer(serializers.Serializer):
    """Serializer for logout response."""
    success = serializers.BooleanField()


class ShippingAddressSerializer(serializers.Serializer):
    """Serializer for shipping address nested structure."""
    street = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True)
    state = serializers.CharField(required=False, allow_blank=True)
    zipCode = serializers.CharField(required=False, allow_blank=True)
    country = serializers.CharField(required=False, allow_blank=True, default='India')


class ProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile."""
    name = serializers.CharField(source='user.name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    phone = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    shippingAddress = serializers.SerializerMethodField()
    
    class Meta:
        model = Profile
        fields = ['name', 'email', 'phone', 'shippingAddress']
    
    def get_shippingAddress(self, obj):
        """Convert shipping_address JSONField to shippingAddress format."""
        address = obj.shipping_address or {}
        return {
            'street': address.get('street', ''),
            'city': address.get('city', ''),
            'state': address.get('state', ''),
            'zipCode': address.get('zipCode', ''),
            'country': address.get('country', 'India'),
        }
    
    def update(self, instance, validated_data):
        """Update profile fields."""
        # Update phone if provided
        if 'phone' in validated_data:
            instance.phone = validated_data['phone']
        
        # Update shipping address if provided
        shipping_address_data = self.initial_data.get('shippingAddress')
        if shipping_address_data:
            # Convert shippingAddress to shipping_address format
            instance.shipping_address = {
                'street': shipping_address_data.get('street', ''),
                'city': shipping_address_data.get('city', ''),
                'state': shipping_address_data.get('state', ''),
                'zipCode': shipping_address_data.get('zipCode', ''),
                'country': shipping_address_data.get('country', 'India'),
            }
        
        instance.save()
        return instance


class UpdateProfileSerializer(serializers.Serializer):
    """Serializer for updating profile (phone and shippingAddress only)."""
    phone = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    shippingAddress = ShippingAddressSerializer(required=False, allow_null=True)
