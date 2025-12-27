"""
Management command to migrate products from old category/tag structure to new database models.
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from apps.products.models import Product, Category, Subcategory, Tag


class Command(BaseCommand):
    help = 'Migrate products from old category/tag structure to new database models'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Run migration in dry-run mode without saving changes',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        if dry_run:
            self.stdout.write(self.style.WARNING('Running in DRY-RUN mode. No changes will be saved.'))
        
        with transaction.atomic():
            # Step 1: Create Category records from existing enum values
            self.stdout.write('Step 1: Creating categories...')
            category_mapping = {}
            category_data = [
                ('COOKIE', 'Cookie'),
                ('SNACK', 'Snack'),
                ('CAKE', 'Cake'),
                ('SWEET', 'Sweet'),
                ('HAMPER', 'Hamper'),
            ]
            
            for category_value, category_name in category_data:
                category, created = Category.objects.get_or_create(
                    slug=category_value.lower(),
                    defaults={
                        'name': category_name,
                        'is_active': True,
                        'order': len(category_mapping),
                    }
                )
                category_mapping[category_value] = category
                if created:
                    self.stdout.write(self.style.SUCCESS(f'  Created category: {category_name}'))
                else:
                    self.stdout.write(self.style.WARNING(f'  Category already exists: {category_name}'))
            
            # Step 2: Create default subcategories for each category
            self.stdout.write('\nStep 2: Creating default subcategories...')
            subcategory_mapping = {}
            
            for category_value, category in category_mapping.items():
                default_subcategory_name = f'{category.name} - Default'
                subcategory, created = Subcategory.objects.get_or_create(
                    category=category,
                    slug='default',
                    defaults={
                        'name': default_subcategory_name,
                        'is_active': True,
                        'order': 0,
                    }
                )
                subcategory_mapping[category] = subcategory
                if created:
                    self.stdout.write(self.style.SUCCESS(f'  Created default subcategory for {category.name}'))
                else:
                    self.stdout.write(self.style.WARNING(f'  Default subcategory already exists for {category.name}'))
            
            # Step 3: Migrate products - update category and assign default subcategory
            self.stdout.write('\nStep 3: Migrating products...')
            from django.db import connection
            
            # Check if old category field exists using Django introspection
            from django.db import connection
            table_name = Product._meta.db_table
            field_names = [f.name for f in Product._meta.get_fields()]
            has_old_category_field = 'category' in field_names and not hasattr(Product._meta.get_field('category'), 'related_model')
            
            migrated_count = 0
            
            if has_old_category_field:
                # Use raw SQL to get old category values (works for both SQLite and PostgreSQL)
                with connection.cursor() as cursor:
                    # Try to get old category values - handle both SQLite and PostgreSQL
                    try:
                        cursor.execute(f"SELECT id, category FROM {table_name}")
                        product_data = cursor.fetchall()
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f'  Error reading old category field: {str(e)}'))
                        product_data = []
                    
                    for product_id, old_category_value in product_data:
                        try:
                            category = category_mapping.get(old_category_value)
                            if category:
                                subcategory = subcategory_mapping[category]
                                product = Product.objects.get(id=product_id)
                                
                                if not dry_run:
                                    # Check if new fields exist
                                    if hasattr(product, 'category_new'):
                                        product.category_new = category
                                        product.subcategory_new = subcategory
                                        product.save(update_fields=['category_new', 'subcategory_new'])
                                    else:
                                        # Direct assignment if migration 0003 already ran
                                        product.category = category
                                        product.subcategory = subcategory
                                        product.save(update_fields=['category', 'subcategory'])
                                
                                migrated_count += 1
                                self.stdout.write(f'  Migrated product: {product.name} -> {category.name}')
                            else:
                                self.stdout.write(self.style.ERROR(f'  Could not find category for product ID {product_id} (category: {old_category_value})'))
                        except Product.DoesNotExist:
                            self.stdout.write(self.style.ERROR(f'  Product with ID {product_id} not found'))
                        except Exception as e:
                            self.stdout.write(self.style.ERROR(f'  Error migrating product ID {product_id}: {str(e)}'))
            else:
                self.stdout.write(self.style.WARNING('  Old category field not found. Products may already be migrated.'))
            
            # Step 4: Extract and create Tag records
            self.stdout.write('\nStep 4: Creating tags from existing products...')
            tag_mapping = {}
            all_tags = set()
            
            # Check if old tags field exists (CharField, not ManyToMany)
            field_names = [f.name for f in Product._meta.get_fields()]
            has_old_tags_field = 'tags' in field_names and not hasattr(Product._meta.get_field('tags'), 'related_model')
            
            # Collect all unique tags from products using raw SQL
            if has_old_tags_field:
                with connection.cursor() as cursor:
                    table_name = Product._meta.db_table
                    try:
                        cursor.execute(f"SELECT id, tags FROM {table_name} WHERE tags IS NOT NULL AND tags != ''")
                        product_tags_data = cursor.fetchall()
                        
                        for product_id, old_tags_str in product_tags_data:
                            if old_tags_str:
                                tags_list = [tag.strip() for tag in old_tags_str.split(',') if tag.strip()]
                                all_tags.update(tags_list)
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f'  Error reading old tags field: {str(e)}'))
            
            # Create Tag records
            for tag_name in sorted(all_tags):
                tag_slug = tag_name.lower().replace(' ', '-').replace('_', '-')
                tag, created = Tag.objects.get_or_create(
                    slug=tag_slug,
                    defaults={
                        'name': tag_name,
                        'is_active': True,
                    }
                )
                tag_mapping[tag_name] = tag
                if created:
                    self.stdout.write(self.style.SUCCESS(f'  Created tag: {tag_name}'))
                else:
                    self.stdout.write(self.style.WARNING(f'  Tag already exists: {tag_name}'))
            
            # Step 5: Migrate tags to ManyToMany relationship
            self.stdout.write('\nStep 5: Migrating tags to ManyToMany relationship...')
            tag_migrated_count = 0
            
            if has_old_tags_field:
                with connection.cursor() as cursor:
                    table_name = Product._meta.db_table
                    try:
                        cursor.execute(f"SELECT id, tags FROM {table_name} WHERE tags IS NOT NULL AND tags != ''")
                        product_tags_data = cursor.fetchall()
                        
                        for product_id, old_tags_str in product_tags_data:
                            try:
                                product = Product.objects.get(id=product_id)
                                tags_list = [tag.strip() for tag in old_tags_str.split(',') if tag.strip()]
                                tag_objects = [tag_mapping[tag] for tag in tags_list if tag in tag_mapping]
                                
                                if tag_objects:
                                    if not dry_run:
                                        # Check if new field exists
                                        if hasattr(product, 'tags_new'):
                                            product.tags_new.set(tag_objects)
                                        else:
                                            # Direct assignment if migration 0003 already ran
                                            product.tags.set(tag_objects)
                                    tag_migrated_count += 1
                                    self.stdout.write(f'  Migrated tags for product: {product.name}')
                            except Product.DoesNotExist:
                                self.stdout.write(self.style.ERROR(f'  Product with ID {product_id} not found'))
                            except Exception as e:
                                self.stdout.write(self.style.ERROR(f'  Error migrating tags for product ID {product_id}: {str(e)}'))
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f'  Error reading tags: {str(e)}'))
            else:
                self.stdout.write(self.style.WARNING('  Old tags field not found. Tags may already be migrated.'))
            
            if dry_run:
                self.stdout.write(self.style.WARNING('\nDRY-RUN completed. No changes were saved.'))
                transaction.set_rollback(True)
            else:
                self.stdout.write(self.style.SUCCESS(
                    f'\nMigration completed successfully!\n'
                    f'  - Categories created: {len(category_mapping)}\n'
                    f'  - Subcategories created: {len(subcategory_mapping)}\n'
                    f'  - Products migrated: {migrated_count}\n'
                    f'  - Tags created: {len(tag_mapping)}\n'
                    f'  - Products with tags migrated: {tag_migrated_count}'
                ))
                self.stdout.write(self.style.WARNING(
                    '\nNext steps:\n'
                    '1. Review the migrated data in Django admin\n'
                    '2. Run migration 0003_migrate_product_fields.py to finalize the schema changes\n'
                    '3. Update any remaining references to old category/tag structure'
                ))

