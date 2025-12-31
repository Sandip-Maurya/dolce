# Generated migration for categories, subcategories, and tags

import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100, unique=True)),
                ('slug', models.SlugField(max_length=100, unique=True)),
                ('description', models.TextField(blank=True, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('order', models.IntegerField(default=0, help_text='Display order')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'categories',
                'ordering': ['order', 'name'],
                'verbose_name_plural': 'Categories',
            },
        ),
        migrations.CreateModel(
            name='Tag',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=50, unique=True)),
                ('slug', models.SlugField(max_length=50, unique=True)),
                ('description', models.TextField(blank=True, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'tags',
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='Subcategory',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100)),
                ('slug', models.SlugField(max_length=100)),
                ('description', models.TextField(blank=True, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('order', models.IntegerField(default=0, help_text='Display order')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='subcategories', to='products.category')),
            ],
            options={
                'db_table': 'subcategories',
                'ordering': ['category', 'order', 'name'],
                'verbose_name_plural': 'Subcategories',
                'unique_together': {('category', 'slug')},
            },
        ),
        migrations.AddIndex(
            model_name='tag',
            index=models.Index(fields=['slug'], name='tags_slug_idx'),
        ),
        migrations.AddIndex(
            model_name='tag',
            index=models.Index(fields=['is_active'], name='tags_is_active_idx'),
        ),
        migrations.AddIndex(
            model_name='subcategory',
            index=models.Index(fields=['category', 'slug'], name='subcategories_category_slug_idx'),
        ),
        migrations.AddIndex(
            model_name='subcategory',
            index=models.Index(fields=['is_active'], name='subcategories_is_active_idx'),
        ),
        migrations.AddIndex(
            model_name='category',
            index=models.Index(fields=['slug'], name='categories_slug_idx'),
        ),
        migrations.AddIndex(
            model_name='category',
            index=models.Index(fields=['is_active'], name='categories_is_active_idx'),
        ),
        # Create temporary fields for data migration
        migrations.AddField(
            model_name='product',
            name='category_new',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='products_new', to='products.category'),
        ),
        migrations.AddField(
            model_name='product',
            name='subcategory_new',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='products_new', to='products.subcategory'),
        ),
        # Create the many-to-many relationship for tags
        migrations.AddField(
            model_name='product',
            name='tags_new',
            field=models.ManyToManyField(blank=True, related_name='products_new', to='products.tag'),
        ),
    ]

