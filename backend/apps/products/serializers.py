"""
Serializers for products app.
"""
from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from typing import List
from .models import Product, ProductImage


class ProductImageSerializer(serializers.ModelSerializer):
    """Serializer for product images."""
    
    class Meta:
        model = ProductImage
        fields = ['image_url']


class ProductSerializer(serializers.ModelSerializer):
    """Serializer for products."""
    images = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id',
            'slug',
            'name',
            'description',
            'price',
            'currency',
            'category',
            'images',
            'tags',
            'is_available',
            'weight_grams',
        ]
    
    @extend_schema_field(serializers.ListField(child=serializers.URLField()))
    def get_images(self, obj) -> List[str]:
        """Return images as array of URLs."""
        return [img.image_url for img in obj.images.all().order_by('order')]
    
    @extend_schema_field(serializers.ListField(child=serializers.CharField()))
    def get_tags(self, obj) -> List[str]:
        """Return tags as array of strings."""
        return obj.get_tags_list()

