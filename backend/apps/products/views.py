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
from .models import Product
from .serializers import ProductSerializer


@extend_schema(
    tags=['Products'],
    summary='List all products',
    responses={200: ProductSerializer(many=True)},
)
@api_view(['GET'])
@permission_classes([AllowAny])
def product_list_view(request):
    """Get all products with optional filtering."""
    queryset = Product.objects.filter(is_available=True)
    
    # Filter by category
    category = request.query_params.get('category')
    if category:
        queryset = queryset.filter(category=category)
    
    # Filter by tags
    tag = request.query_params.get('tag')
    if tag:
        queryset = queryset.filter(tags__icontains=tag)
    
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
    product = get_object_or_404(Product, slug=slug)
    serializer = ProductSerializer(product)
    return Response(serializer.data, status=status.HTTP_200_OK)

