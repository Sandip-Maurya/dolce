"""
Admin configuration for products app.
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import Product, ProductImage


class ProductImageInline(admin.TabularInline):
    """Inline admin for product images."""
    model = ProductImage
    extra = 1
    fields = ['image_url', 'order']
    ordering = ['order']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """User-friendly product admin."""
    inlines = [ProductImageInline]
    list_display = ['name', 'category', 'price', 'currency', 'is_available', 'created_at', 'image_preview']
    list_filter = ['category', 'is_available', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at', 'tags_display']
    prepopulated_fields = {'slug': ('name',)}
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'name', 'slug', 'description', 'category')
        }),
        ('Pricing', {
            'fields': ('price', 'currency', 'weight_grams')
        }),
        ('Tags & Availability', {
            'fields': ('tags', 'tags_display', 'is_available')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['make_available', 'make_unavailable']
    
    def tags_display(self, obj):
        """Display tags as comma-separated list."""
        tags = obj.get_tags_list()
        return ', '.join(tags) if tags else '-'
    tags_display.short_description = 'Tags (Preview)'
    
    def image_preview(self, obj):
        """Display first product image as thumbnail."""
        first_image = obj.images.first()
        if first_image:
            return format_html(
                '<img src="{}" style="max-width: 50px; max-height: 50px;" />',
                first_image.image_url
            )
        return '-'
    image_preview.short_description = 'Preview'
    
    def make_available(self, request, queryset):
        """Bulk action to mark products as available."""
        queryset.update(is_available=True)
        self.message_user(request, f'{queryset.count()} product(s) marked as available.')
    make_available.short_description = 'Mark selected products as available'
    
    def make_unavailable(self, request, queryset):
        """Bulk action to mark products as unavailable."""
        queryset.update(is_available=False)
        self.message_user(request, f'{queryset.count()} product(s) marked as unavailable.')
    make_unavailable.short_description = 'Mark selected products as unavailable'


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    """Admin for product images."""
    list_display = ['product', 'order', 'image_preview', 'created_at']
    list_filter = ['product', 'created_at']
    search_fields = ['product__name']
    ordering = ['product', 'order']
    
    def image_preview(self, obj):
        """Display image as thumbnail."""
        return format_html(
            '<img src="{}" style="max-width: 100px; max-height: 100px;" />',
            obj.image_url
        )
    image_preview.short_description = 'Preview'

