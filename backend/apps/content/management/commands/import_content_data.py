"""
Management command to import content data (products, categories, blogs, testimonials) from JSON.

This command imports content-related data from a JSON file exported by export_content_data
into the current database.

Usage:
    python manage.py import_content_data --input data/content_export.json
    python manage.py import_content_data --input data/content_export.json --clear-existing
"""
import json
from django.core.management.base import BaseCommand
from django.core import serializers
from django.db import transaction
from apps.products.models import (
    Product, ProductImage, Category, Subcategory, Tag
)
from apps.content.models import (
    BlogPost, TextTestimonial, VideoTestimonial,
    SustainableGiftingItem, AboutUsSection, OurStorySection,
    OurCommitmentSection, PhotoGalleryItem
)


class Command(BaseCommand):
    help = 'Import products, categories, blogs, testimonials, and other content from JSON file'

    def add_arguments(self, parser):
        parser.add_argument(
            '--input',
            type=str,
            required=True,
            help='Input JSON file path'
        )
        parser.add_argument(
            '--clear-existing',
            action='store_true',
            help='Clear existing data before importing (WARNING: This will delete all existing data)'
        )
        parser.add_argument(
            '--skip-products',
            action='store_true',
            help='Skip importing products and related data'
        )
        parser.add_argument(
            '--skip-content',
            action='store_true',
            help='Skip importing content models (blogs, testimonials, etc.)'
        )
        parser.add_argument(
            '--only-products',
            action='store_true',
            help='Import only products and related data'
        )
        parser.add_argument(
            '--only-content',
            action='store_true',
            help='Import only content models'
        )

    def handle(self, *args, **options):
        input_path = options['input']
        clear_existing = options['clear_existing']
        skip_products = options['skip_products']
        skip_content = options['skip_content']
        only_products = options['only_products']
        only_content = options['only_content']

        if only_products and only_content:
            self.stdout.write(
                self.style.ERROR('Cannot use --only-products and --only-content together')
            )
            return

        # Determine what to import
        import_products = not skip_products and not only_content
        import_content = not skip_content and not only_products

        # Read JSON file
        try:
            with open(input_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except FileNotFoundError:
            self.stdout.write(
                self.style.ERROR(f'File not found: {input_path}')
            )
            return
        except json.JSONDecodeError as e:
            self.stdout.write(
                self.style.ERROR(f'Invalid JSON file: {e}')
            )
            return

        # Clear existing data if requested
        if clear_existing:
            self.stdout.write(
                self.style.WARNING('🗑️  Clearing existing data...')
            )
            if import_products:
                ProductImage.objects.all().delete()
                Product.objects.all().delete()
                Subcategory.objects.all().delete()
                Tag.objects.all().delete()
                Category.objects.all().delete()
                self.stdout.write('  ✅ Cleared products, categories, tags')
            
            if import_content:
                BlogPost.objects.all().delete()
                TextTestimonial.objects.all().delete()
                VideoTestimonial.objects.all().delete()
                SustainableGiftingItem.objects.all().delete()
                AboutUsSection.objects.all().delete()
                OurStorySection.objects.all().delete()
                OurCommitmentSection.objects.all().delete()
                PhotoGalleryItem.objects.all().delete()
                self.stdout.write('  ✅ Cleared content models')

        import_count = 0

        # Import products and related data
        if import_products and 'categories' in data:
            self.stdout.write('📦 Importing products and related data...')
            
            try:
                with transaction.atomic():
                    # Import in dependency order
                    if 'categories' in data and data['categories']:
                        for obj in serializers.deserialize('json', json.dumps(data['categories'])):
                            obj.save()
                        import_count += len(data['categories'])
                        self.stdout.write(
                            self.style.SUCCESS(f'  ✅ Imported {len(data["categories"])} categories')
                        )

                    if 'subcategories' in data and data['subcategories']:
                        for obj in serializers.deserialize('json', json.dumps(data['subcategories'])):
                            obj.save()
                        import_count += len(data['subcategories'])
                        self.stdout.write(
                            self.style.SUCCESS(f'  ✅ Imported {len(data["subcategories"])} subcategories')
                        )

                    if 'tags' in data and data['tags']:
                        for obj in serializers.deserialize('json', json.dumps(data['tags'])):
                            obj.save()
                        import_count += len(data['tags'])
                        self.stdout.write(
                            self.style.SUCCESS(f'  ✅ Imported {len(data["tags"])} tags')
                        )

                    if 'products' in data and data['products']:
                        for obj in serializers.deserialize('json', json.dumps(data['products'])):
                            obj.save()
                        import_count += len(data['products'])
                        self.stdout.write(
                            self.style.SUCCESS(f'  ✅ Imported {len(data["products"])} products')
                        )

                    if 'product_images' in data and data['product_images']:
                        for obj in serializers.deserialize('json', json.dumps(data['product_images'])):
                            obj.save()
                        import_count += len(data['product_images'])
                        self.stdout.write(
                            self.style.SUCCESS(f'  ✅ Imported {len(data["product_images"])} product images')
                        )

                    # Import many-to-many relationships (product-tags)
                    if 'product_tags' in data and data['product_tags']:
                        for pt in data['product_tags']:
                            try:
                                product = Product.objects.get(id=pt['product_id'])
                                tag_ids = pt['tag_ids']
                                tags = Tag.objects.filter(id__in=tag_ids)
                                product.tags.set(tags)
                            except Product.DoesNotExist:
                                self.stdout.write(
                                    self.style.WARNING(
                                        f'  ⚠️  Product {pt["product_id"]} not found, skipping tags'
                                    )
                                )
                        self.stdout.write(
                            self.style.SUCCESS(f'  ✅ Restored {len(data["product_tags"])} product-tag relationships')
                        )

            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'❌ Error importing products: {e}')
                )
                raise

        # Import content models
        if import_content:
            self.stdout.write('📝 Importing content data...')
            
            try:
                with transaction.atomic():
                    content_models = {
                        'blogs': BlogPost,
                        'text_testimonials': TextTestimonial,
                        'video_testimonials': VideoTestimonial,
                        'sustainable_gifting': SustainableGiftingItem,
                        'about_us': AboutUsSection,
                        'our_story': OurStorySection,
                        'our_commitment': OurCommitmentSection,
                        'photo_gallery': PhotoGalleryItem,
                    }

                    for key, model_class in content_models.items():
                        if key in data and data[key]:
                            for obj in serializers.deserialize('json', json.dumps(data[key])):
                                obj.save()
                            import_count += len(data[key])
                            self.stdout.write(
                                self.style.SUCCESS(f'  ✅ Imported {len(data[key])} {key.replace("_", " ")}')
                            )

            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'❌ Error importing content: {e}')
                )
                raise

        # Display metadata if available
        if '_metadata' in data:
            metadata = data['_metadata']
            self.stdout.write(
                self.style.SUCCESS(
                    f'\n📊 Import Summary:\n'
                    f'  Total objects imported: {import_count}\n'
                    f'  Original export date: {metadata.get("exported_at", "Unknown")}\n'
                    f'  Original object count: {metadata.get("total_objects", "Unknown")}'
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f'\n✅ Successfully imported {import_count} objects')
            )

