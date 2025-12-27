"""
URL configuration for products app.
"""
from django.urls import path
from .views import (
    product_list_view,
    product_detail_view,
    category_list_view,
    subcategory_list_view,
    tag_list_view,
)

app_name = 'products'

urlpatterns = [
    path('', product_list_view, name='list'),
    # Put specific paths before slug pattern to avoid conflicts
    path('categories/', category_list_view, name='categories'),
    path('categories/<str:category_id>/subcategories/', subcategory_list_view, name='subcategories'),
    path('tags/', tag_list_view, name='tags'),
    # Product detail must be last to avoid catching categories/tags
    path('<slug:slug>/', product_detail_view, name='detail'),
]

