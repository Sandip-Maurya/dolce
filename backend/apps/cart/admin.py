"""
Admin configuration for cart app.
"""
from django.contrib import admin
from .models import Cart, CartItem


class CartItemInline(admin.TabularInline):
    """Inline admin for cart items."""
    model = CartItem
    extra = 0
    readonly_fields = ['line_total']
    fields = ['product', 'quantity', 'line_total']


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    """Admin for carts."""
    list_display = ['user', 'item_count', 'total', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__email', 'user__name']
    readonly_fields = ['id', 'created_at', 'updated_at', 'total_display']
    inlines = [CartItemInline]
    
    def item_count(self, obj):
        """Return number of items in cart."""
        return obj.items.count()
    item_count.short_description = 'Items'
    
    def total(self, obj):
        """Return cart total."""
        return f"₹{obj.get_total():.2f}"
    total.short_description = 'Total'
    
    def total_display(self, obj):
        """Display total in readonly field."""
        return f"₹{obj.get_total():.2f}"
    total_display.short_description = 'Total'


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    """Admin for cart items."""
    list_display = ['cart', 'product', 'quantity', 'line_total', 'created_at']
    list_filter = ['created_at']
    search_fields = ['cart__user__email', 'product__name']
    readonly_fields = ['line_total']

