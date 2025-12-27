"""
Serializers for products app.
"""
from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from typing import List
from .models import Product, ProductImage, Category, Subcategory, Tag


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for categories."""
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'is_active', 'order']


class SubcategorySerializer(serializers.ModelSerializer):
    """Serializer for subcategories."""
    category = CategorySerializer(read_only=True)
    
    class Meta:
        model = Subcategory
        fields = ['id', 'name', 'slug', 'description', 'is_active', 'order', 'category']


class SubcategoryNestedSerializer(serializers.ModelSerializer):
    """Serializer for subcategories when nested in category (without category field)."""
    
    class Meta:
        model = Subcategory
        fields = ['id', 'name', 'slug', 'description', 'is_active', 'order']


class CategoryWithSubcategoriesSerializer(serializers.ModelSerializer):
    """Serializer for categories with nested subcategories."""
    subcategories = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'is_active', 'order', 'subcategories']
    
    @extend_schema_field(serializers.ListField(child=SubcategoryNestedSerializer()))
    def get_subcategories(self, obj) -> List[dict]:
        """Return subcategories as nested array."""
        subcategories = obj.subcategories.filter(is_active=True).order_by('order', 'name')
        return SubcategoryNestedSerializer(subcategories, many=True).data


class TagSerializer(serializers.ModelSerializer):
    """Serializer for tags."""
    
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug', 'description', 'is_active']


class ProductImageSerializer(serializers.ModelSerializer):
    """Serializer for product images."""
    
    class Meta:
        model = ProductImage
        fields = ['image_url']


class ProductSerializer(serializers.ModelSerializer):
    """Serializer for products."""
    images = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()
    category = CategorySerializer(read_only=True)
    subcategory = SubcategorySerializer(read_only=True)
    
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
            'subcategory',
            'images',
            'tags',
            'is_available',
            'weight_grams',
        ]
    
    @extend_schema_field(serializers.ListField(child=serializers.URLField()))
    def get_images(self, obj) -> List[str]:
        """Return images as array of URLs."""
        return [img.image_url for img in obj.images.all().order_by('order')]
    
    @extend_schema_field(serializers.ListField(child=TagSerializer()))
    def get_tags(self, obj) -> List[dict]:
        """Return tags as array of tag objects."""
        return TagSerializer(obj.tags.all(), many=True).data

