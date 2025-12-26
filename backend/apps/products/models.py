"""
Product models for Dolce Fiore.
"""
import uuid
from django.db import models
from django.utils.text import slugify


class Product(models.Model):
    """Product model for catalog."""
    
    class Category(models.TextChoices):
        COOKIE = 'COOKIE', 'Cookie'
        SNACK = 'SNACK', 'Snack'
        CAKE = 'CAKE', 'Cake'
        SWEET = 'SWEET', 'Sweet'
        HAMPER = 'HAMPER', 'Hamper'
    
    class Tag(models.TextChoices):
        ORGANIC = 'organic', 'Organic'
        SUGAR_FREE = 'sugar-free', 'Sugar-Free'
        ECO_FRIENDLY = 'eco-friendly', 'Eco-Friendly'
        ARTISAN = 'artisan', 'Artisan'
        GUILT_FREE = 'guilt-free', 'Guilt-Free'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    slug = models.SlugField(unique=True, max_length=200)
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='INR')
    category = models.CharField(max_length=20, choices=Category.choices)
    tags = models.CharField(max_length=200)  # Comma-separated tags
    is_available = models.BooleanField(default=True)
    weight_grams = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'products'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['category']),
            models.Index(fields=['is_available']),
        ]
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    def get_tags_list(self):
        """Return tags as a list."""
        return [tag.strip() for tag in self.tags.split(',') if tag.strip()]
    
    def __str__(self):
        return self.name


class ProductImage(models.Model):
    """Product image model."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE)
    image_url = models.URLField()
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'product_images'
        ordering = ['order', 'created_at']
        unique_together = ['product', 'order']
    
    def __str__(self):
        return f"{self.product.name} - Image {self.order}"

