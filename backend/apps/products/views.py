"""
Views for products app.
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from drf_spectacular.utils import extend_schema
from .models import Product, Category, Subcategory, Tag
from .serializers import (
    ProductSerializer,
    CategorySerializer,
    CategoryWithSubcategoriesSerializer,
    SubcategorySerializer,
    TagSerializer,
)


@extend_schema(
    tags=['Products'],
    summary='List all products',
    responses={200: ProductSerializer(many=True)},
)
@api_view(['GET'])
@permission_classes([AllowAny])
def product_list_view(request):
    """Get all products with optional filtering."""
    queryset = Product.objects.filter(is_available=True).select_related('category', 'subcategory').prefetch_related('tags')
    
    # Filter by category (can be ID or slug)
    category = request.query_params.get('category')
    if category:
        try:
            # Try as UUID first
            category_obj = Category.objects.get(id=category, is_active=True)
            queryset = queryset.filter(category=category_obj)
        except (Category.DoesNotExist, ValueError):
            # Try as slug
            try:
                category_obj = Category.objects.get(slug=category, is_active=True)
                queryset = queryset.filter(category=category_obj)
            except Category.DoesNotExist:
                pass
    
    # Filter by subcategory (can be ID or slug)
    subcategory = request.query_params.get('subcategory')
    if subcategory:
        try:
            # Try as UUID first
            subcategory_obj = Subcategory.objects.get(id=subcategory, is_active=True)
            queryset = queryset.filter(subcategory=subcategory_obj)
        except (Subcategory.DoesNotExist, ValueError):
            # Try as slug
            try:
                subcategory_obj = Subcategory.objects.get(slug=subcategory, is_active=True)
                queryset = queryset.filter(subcategory=subcategory_obj)
            except Subcategory.DoesNotExist:
                pass
    
    # Filter by tags (can be ID, slug, or comma-separated)
    tag = request.query_params.get('tag')
    if tag:
        tag_filters = [t.strip() for t in tag.split(',') if t.strip()]
        tag_objects = []
        for tag_value in tag_filters:
            try:
                # Try as UUID first
                tag_obj = Tag.objects.get(id=tag_value, is_active=True)
                tag_objects.append(tag_obj)
            except (Tag.DoesNotExist, ValueError):
                # Try as slug
                try:
                    tag_obj = Tag.objects.get(slug=tag_value, is_active=True)
                    tag_objects.append(tag_obj)
                except Tag.DoesNotExist:
                    pass
        
        if tag_objects:
            queryset = queryset.filter(tags__in=tag_objects).distinct()
    
    # Search by name or description
    search = request.query_params.get('search')
    if search:
        queryset = queryset.filter(
            Q(name__icontains=search) | 
            Q(description__icontains=search)
        )
    
    # Sort
    sort = request.query_params.get('sort', 'newest')
    if sort == 'price_low':
        queryset = queryset.order_by('price')
    elif sort == 'price_high':
        queryset = queryset.order_by('-price')
    else:  # newest
        queryset = queryset.order_by('-created_at')
    
    serializer = ProductSerializer(queryset, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@extend_schema(
    tags=['Products'],
    summary='Get product by slug',
    responses={200: ProductSerializer, 404: {'description': 'Product not found'}},
)
@api_view(['GET'])
@permission_classes([AllowAny])
def product_detail_view(request, slug):
    """Get product by slug."""
    product = get_object_or_404(Product.objects.select_related('category', 'subcategory').prefetch_related('tags'), slug=slug)
    serializer = ProductSerializer(product)
    return Response(serializer.data, status=status.HTTP_200_OK)


@extend_schema(
    tags=['Products'],
    summary='List all categories',
    description='Get all active categories. Use ?include=subcategories to get nested subcategories.',
    responses={200: CategorySerializer(many=True)},
)
@api_view(['GET'])
@permission_classes([AllowAny])
def category_list_view(request):
    """Get all active categories, optionally with nested subcategories."""
    include_subcategories = request.query_params.get('include') == 'subcategories'
    
    categories = Category.objects.filter(is_active=True).order_by('order', 'name')
    
    if include_subcategories:
        # Prefetch subcategories for efficiency
        categories = categories.prefetch_related('subcategories')
        serializer = CategoryWithSubcategoriesSerializer(categories, many=True)
    else:
        serializer = CategorySerializer(categories, many=True)
    
    return Response(serializer.data, status=status.HTTP_200_OK)


@extend_schema(
    tags=['Products'],
    summary='List subcategories for a category',
    responses={200: SubcategorySerializer(many=True)},
)
@api_view(['GET'])
@permission_classes([AllowAny])
def subcategory_list_view(request, category_id):
    """Get all active subcategories for a category."""
    try:
        # Try as UUID first
        category = Category.objects.get(id=category_id, is_active=True)
    except (Category.DoesNotExist, ValueError):
        # Try as slug
        try:
            category = Category.objects.get(slug=category_id, is_active=True)
        except Category.DoesNotExist:
            return Response(
                {'error': 'Category not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    subcategories = Subcategory.objects.filter(category=category, is_active=True).order_by('order', 'name')
    serializer = SubcategorySerializer(subcategories, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@extend_schema(
    tags=['Products'],
    summary='List all tags',
    responses={200: TagSerializer(many=True)},
)
@api_view(['GET'])
@permission_classes([AllowAny])
def tag_list_view(request):
    """Get all active tags."""
    tags = Tag.objects.filter(is_active=True).order_by('name')
    serializer = TagSerializer(tags, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

