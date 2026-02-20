"""
Admin configuration for products app.
"""
import logging
from django.contrib import admin
from django.utils.html import format_html
from .models import Product, ProductImage, Category, Subcategory, Tag
from .revalidation import revalidate_products

logger = logging.getLogger(__name__)


class RevalidatingModelAdmin(admin.ModelAdmin):
    """
    Base admin class that triggers frontend revalidation on save/delete.
    """
    revalidate_on_change = True
    
    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        if self.revalidate_on_change:
            action = 'updated' if change else 'created'
            logger.info(f'{obj._meta.model_name} {action}, triggering revalidation')
            revalidate_products()
    
    def delete_model(self, request, obj):
        super().delete_model(request, obj)
        if self.revalidate_on_change:
            logger.info(f'{obj._meta.model_name} deleted, triggering revalidation')
            revalidate_products()
    
    def delete_queryset(self, request, queryset):
        super().delete_queryset(request, queryset)
        if self.revalidate_on_change:
            logger.info(f'Bulk delete of {queryset.model._meta.model_name}, triggering revalidation')
            revalidate_products()


class SubcategoryInline(admin.TabularInline):
    """Inline admin for subcategories."""
    model = Subcategory
    extra = 1
    fields = ['name', 'slug', 'order', 'is_active']
    ordering = ['order']


class ProductImageInline(admin.TabularInline):
    """Inline admin for product images."""
    model = ProductImage
    extra = 1
    fields = ['image', 'order']
    ordering = ['order']


@admin.register(Category)
class CategoryAdmin(RevalidatingModelAdmin):
    """Admin for categories."""
    inlines = [SubcategoryInline]
    list_display = ['name', 'slug', 'order', 'featured_on_homepage', 'homepage_order', 'is_active', 'product_count', 'created_at']
    list_filter = ['is_active', 'featured_on_homepage', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['order', 'name']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'name', 'slug', 'description')
        }),
        ('Settings', {
            'fields': ('is_active', 'order')
        }),
        ('Homepage', {
            'fields': ('featured_on_homepage', 'homepage_image', 'homepage_order')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def product_count(self, obj):
        """Display number of products in this category."""
        try:
            return obj.products.count()
        except Exception:
            return 0
    product_count.short_description = 'Products'


@admin.register(Subcategory)
class SubcategoryAdmin(admin.ModelAdmin):
    """Admin for subcategories."""
    list_display = ['name', 'category', 'slug', 'order', 'is_active', 'product_count', 'created_at']
    list_filter = ['category', 'is_active', 'created_at']
    search_fields = ['name', 'description', 'category__name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['category', 'order', 'name']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'category', 'name', 'slug', 'description')
        }),
        ('Settings', {
            'fields': ('is_active', 'order')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def product_count(self, obj):
        """Display number of products in this subcategory."""
        try:
            return obj.products.count()
        except Exception:
            return 0
    product_count.short_description = 'Products'


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    """Admin for tags."""
    list_display = ['name', 'slug', 'is_active', 'product_count', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['name']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'name', 'slug', 'description')
        }),
        ('Settings', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def product_count(self, obj):
        """Display number of products with this tag."""
        try:
            return obj.products.count()
        except Exception:
            return 0
    product_count.short_description = 'Products'


@admin.register(Product)
class ProductAdmin(RevalidatingModelAdmin):
    """User-friendly product admin."""
    inlines = [ProductImageInline]
    list_display = ['name', 'category', 'subcategory', 'price', 'currency', 'is_available', 'created_at', 'image_preview']
    list_filter = ['category', 'subcategory', 'is_available', 'tags', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at', 'tags_display']
    prepopulated_fields = {'slug': ('name',)}
    filter_horizontal = ['tags']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'name', 'slug', 'description', 'category', 'subcategory')
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
        tags = obj.tags.all()
        return ', '.join([tag.name for tag in tags]) if tags else '-'
    tags_display.short_description = 'Tags (Preview)'
    
    def image_preview(self, obj):
        """Display first product image as thumbnail."""
        first_image = obj.images.first()
        if first_image and first_image.image:
            return format_html(
                '<img src="{}" style="max-width: 50px; max-height: 50px;" />',
                first_image.image.url
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
        if obj.image:
            return format_html(
                '<img src="{}" style="max-width: 100px; max-height: 100px;" />',
                obj.image.url
            )
        return '-'
    image_preview.short_description = 'Preview'

