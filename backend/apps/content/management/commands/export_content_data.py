"""
Management command to export content data (products, categories, blogs, testimonials) to JSON.

This command exports all content-related data from the database to a JSON file
that can be imported into another environment (dev/prod).

Usage:
    python manage.py export_content_data --output data/content_export.json
    python manage.py export_content_data --output data/content_export.json --exclude-products
"""
import json
import os
from django.core.management.base import BaseCommand
from django.core import serializers
from django.utils import timezone
from apps.products.models import (
    Product, ProductImage, Category, Subcategory, Tag
)
from apps.content.models import (
    BlogPost, TextTestimonial, VideoTestimonial,
    SustainableGiftingItem, AboutUsSection, OurStorySection,
    OurCommitmentSection, PhotoGalleryItem
)


class Command(BaseCommand):
    help = 'Export products, categories, blogs, testimonials, and other content to JSON file'

    def add_arguments(self, parser):
        parser.add_argument(
            '--output',
            type=str,
            default='content_data_export.json',
            help='Output file path (default: content_data_export.json)'
        )
        parser.add_argument(
            '--exclude-products',
            action='store_true',
            help='Exclude products from export (only export categories, blogs, testimonials)'
        )
        parser.add_argument(
            '--exclude-content',
            action='store_true',
            help='Exclude content models (blogs, testimonials, etc.) from export'
        )
        parser.add_argument(
            '--only-products',
            action='store_true',
            help='Export only products and related data (categories, tags, images)'
        )
        parser.add_argument(
            '--only-content',
            action='store_true',
            help='Export only content models (blogs, testimonials, etc.)'
        )

    def handle(self, *args, **options):
        output_path = options['output']
        exclude_products = options['exclude_products']
        exclude_content = options['exclude_content']
        only_products = options['only_products']
        only_content = options['only_content']

        # Determine what to export
        export_products = not exclude_products and not only_content
        export_content = not exclude_content and not only_products

        if only_products and only_content:
            self.stdout.write(
                self.style.ERROR('Cannot use --only-products and --only-content together')
            )
            return

        data = {}
        export_count = 0

        # Export products and related data
        if export_products:
            self.stdout.write('📦 Exporting products and related data...')
            
            # Export in dependency order: Categories -> Subcategories -> Tags -> Products -> ProductImages
            categories = Category.objects.all()
            subcategories = Subcategory.objects.all()
            tags = Tag.objects.all()
            products = Product.objects.all()
            product_images = ProductImage.objects.all()

            data['categories'] = json.loads(
                serializers.serialize('json', categories, use_natural_foreign_keys=True)
            )
            data['subcategories'] = json.loads(
                serializers.serialize('json', subcategories, use_natural_foreign_keys=True)
            )
            data['tags'] = json.loads(
                serializers.serialize('json', tags, use_natural_foreign_keys=True)
            )
            data['products'] = json.loads(
                serializers.serialize('json', products, use_natural_foreign_keys=True)
            )
            data['product_images'] = json.loads(
                serializers.serialize('json', product_images, use_natural_foreign_keys=True)
            )

            # Export many-to-many relationships for products-tags
            data['product_tags'] = []
            for product in products:
                tag_ids = list(product.tags.values_list('id', flat=True))
                if tag_ids:
                    data['product_tags'].append({
                        'product_id': str(product.id),
                        'tag_ids': [str(tid) for tid in tag_ids]
                    })

            export_count += (
                categories.count() + subcategories.count() + tags.count() +
                products.count() + product_images.count()
            )
            self.stdout.write(
                self.style.SUCCESS(
                    f'  ✅ Exported {categories.count()} categories, '
                    f'{subcategories.count()} subcategories, {tags.count()} tags, '
                    f'{products.count()} products, {product_images.count()} product images'
                )
            )

        # Export content models
        if export_content:
            self.stdout.write('📝 Exporting content data...')
            
            blogs = BlogPost.objects.all()
            text_testimonials = TextTestimonial.objects.all()
            video_testimonials = VideoTestimonial.objects.all()
            sustainable_gifting = SustainableGiftingItem.objects.all()
            about_us = AboutUsSection.objects.all()
            our_story = OurStorySection.objects.all()
            our_commitment = OurCommitmentSection.objects.all()
            photo_gallery = PhotoGalleryItem.objects.all()

            data['blogs'] = json.loads(
                serializers.serialize('json', blogs, use_natural_foreign_keys=True)
            )
            data['text_testimonials'] = json.loads(
                serializers.serialize('json', text_testimonials, use_natural_foreign_keys=True)
            )
            data['video_testimonials'] = json.loads(
                serializers.serialize('json', video_testimonials, use_natural_foreign_keys=True)
            )
            data['sustainable_gifting'] = json.loads(
                serializers.serialize('json', sustainable_gifting, use_natural_foreign_keys=True)
            )
            data['about_us'] = json.loads(
                serializers.serialize('json', about_us, use_natural_foreign_keys=True)
            )
            data['our_story'] = json.loads(
                serializers.serialize('json', our_story, use_natural_foreign_keys=True)
            )
            data['our_commitment'] = json.loads(
                serializers.serialize('json', our_commitment, use_natural_foreign_keys=True)
            )
            data['photo_gallery'] = json.loads(
                serializers.serialize('json', photo_gallery, use_natural_foreign_keys=True)
            )

            export_count += (
                blogs.count() + text_testimonials.count() + video_testimonials.count() +
                sustainable_gifting.count() + about_us.count() + our_story.count() +
                our_commitment.count() + photo_gallery.count()
            )
            self.stdout.write(
                self.style.SUCCESS(
                    f'  ✅ Exported {blogs.count()} blogs, '
                    f'{text_testimonials.count()} text testimonials, '
                    f'{video_testimonials.count()} video testimonials, '
                    f'{sustainable_gifting.count()} sustainable gifting items, '
                    f'{about_us.count()} about us sections, '
                    f'{our_story.count()} our story sections, '
                    f'{our_commitment.count()} our commitment sections, '
                    f'{photo_gallery.count()} photo gallery items'
                )
            )

        # Add metadata
        data['_metadata'] = {
            'exported_at': timezone.now().isoformat(),
            'total_objects': export_count,
            'version': '1.0'
        }

        # Create output directory if it doesn't exist
        output_dir = os.path.dirname(output_path)
        if output_dir and not os.path.exists(output_dir):
            os.makedirs(output_dir)
            self.stdout.write(f'📁 Created directory: {output_dir}')

        # Write to file
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        file_size = os.path.getsize(output_path)
        file_size_mb = file_size / (1024 * 1024)

        self.stdout.write(
            self.style.SUCCESS(
                f'\n✅ Successfully exported {export_count} objects to {output_path} '
                f'({file_size_mb:.2f} MB)'
            )
        )

