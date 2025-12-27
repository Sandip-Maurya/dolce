# Data migration to populate category_new and subcategory_new fields
# This runs after 0002_add_categories_subcategories_tags but before 0003_migrate_product_fields

from django.db import migrations


def populate_category_data(apps, schema_editor):
    """Populate category_new and subcategory_new for existing products."""
    Product = apps.get_model('products', 'Product')
    Category = apps.get_model('products', 'Category')
    Subcategory = apps.get_model('products', 'Subcategory')
    Tag = apps.get_model('products', 'Tag')
    
    # Category mapping from old string values to new Category objects
    category_mapping = {
        'COOKIE': ('cookie', 'Cookie', 0),
        'SNACK': ('snack', 'Snack', 1),
        'CAKE': ('cake', 'Cake', 2),
        'SWEET': ('sweet', 'Sweet', 3),
        'HAMPER': ('hamper', 'Hamper', 4),
    }
    
    # ALWAYS create categories and default subcategories (even for fresh databases)
    category_objects = {}
    subcategory_objects = {}
    
    for old_value, (slug, name, order) in category_mapping.items():
        # Get or create category
        category, created = Category.objects.get_or_create(
            slug=slug,
            defaults={
                'name': name,
                'is_active': True,
                'order': order,
            }
        )
        if created:
            print(f'Created category: {name}')
        category_objects[old_value] = category
        
        # Get or create default subcategory
        subcategory, created = Subcategory.objects.get_or_create(
            category=category,
            slug='default',
            defaults={
                'name': f'{name} - Default',
                'is_active': True,
                'order': 0,
            }
        )
        if created:
            print(f'Created subcategory: {name} - Default')
        subcategory_objects[old_value] = subcategory
    
    # Create default tags
    tag_mapping = {
        'organic': 'Organic',
        'sugar-free': 'Sugar-Free',
        'eco-friendly': 'Eco-Friendly',
        'artisan': 'Artisan',
        'guilt-free': 'Guilt-Free',
    }
    
    for slug, name in tag_mapping.items():
        tag, created = Tag.objects.get_or_create(
            slug=slug,
            defaults={
                'name': name,
                'is_active': True,
            }
        )
        if created:
            print(f'Created tag: {name}')
    
    # Update products that have the old category field
    from django.db import connection
    
    # Check if old category column exists
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='products' AND column_name='category' AND data_type='character varying'
        """)
        has_old_category = cursor.fetchone() is not None
    
    if not has_old_category:
        # Old category field doesn't exist - fresh database or already migrated
        # Categories/subcategories/tags are already created above, so we're done
        print('No old category field found. Base categories, subcategories, and tags have been created.')
        return
    
    # Get all products with their old category values
    with connection.cursor() as cursor:
        cursor.execute("SELECT id, category FROM products WHERE category IS NOT NULL")
        product_data = cursor.fetchall()
    
    updated_count = 0
    for product_id, old_category_value in product_data:
        if old_category_value in category_objects:
            category = category_objects[old_category_value]
            subcategory = subcategory_objects[old_category_value]
            
            # Update using raw SQL to avoid model issues
            with connection.cursor() as cursor:
                cursor.execute(
                    "UPDATE products SET category_new_id = %s, subcategory_new_id = %s WHERE id = %s",
                    [str(category.id), str(subcategory.id), str(product_id)]
                )
                updated_count += 1
    
    if updated_count > 0:
        print(f'Updated {updated_count} products with category and subcategory data.')
    
    # Ensure all products have category and subcategory (for fresh databases, assign default)
    with connection.cursor() as cursor:
        cursor.execute("SELECT COUNT(*) FROM products WHERE category_new_id IS NULL")
        null_count = cursor.fetchone()[0]
        
        if null_count > 0:
            # Assign default category/subcategory to products without one
            default_category = category_objects.get('HAMPER') or list(category_objects.values())[0]
            default_subcategory = subcategory_objects.get('HAMPER') or list(subcategory_objects.values())[0]
            
            cursor.execute(
                "UPDATE products SET category_new_id = %s, subcategory_new_id = %s WHERE category_new_id IS NULL",
                [str(default_category.id), str(default_subcategory.id)]
            )
            print(f'Assigned default category to {null_count} products without category.')


def reverse_populate_category_data(apps, schema_editor):
    """Reverse migration - clear the new fields."""
    Product = apps.get_model('products', 'Product')
    Product.objects.update(category_new=None, subcategory_new=None)


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0002_add_categories_subcategories_tags'),
    ]

    operations = [
        migrations.RunPython(populate_category_data, reverse_populate_category_data),
    ]

