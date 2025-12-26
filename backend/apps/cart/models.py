"""
Cart models for Dolce Fiore.
"""
import uuid
from django.db import models
from django.db.models import Sum
from apps.users.models import User
from apps.products.models import Product


class Cart(models.Model):
    """Shopping cart model."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'carts'
    
    def get_total(self):
        """Calculate total cart value."""
        return self.items.aggregate(total=Sum('line_total'))['total'] or 0
    
    def __str__(self):
        return f"Cart for {self.user.email}"


class CartItem(models.Model):
    """Cart item model."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    line_total = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'cart_items'
        unique_together = ['cart', 'product']
    
    def save(self, *args, **kwargs):
        """Calculate line_total on save."""
        self.line_total = self.product.price * self.quantity
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.quantity}x {self.product.name}"

