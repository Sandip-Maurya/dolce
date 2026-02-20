# Option B: Replace URLFields with ImageFields for admin upload to S3

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0009_add_brand_story_section'),
    ]

    operations = [
        # SustainableGiftingItem
        migrations.AddField(
            model_name='sustainablegiftingitem',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='sustainable_gifting/'),
        ),
        migrations.RemoveField(
            model_name='sustainablegiftingitem',
            name='image_url',
        ),
        # TextTestimonial
        migrations.AddField(
            model_name='texttestimonial',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='testimonials/'),
        ),
        migrations.RemoveField(
            model_name='texttestimonial',
            name='image_url',
        ),
        # VideoTestimonial
        migrations.AddField(
            model_name='videotestimonial',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='testimonials/'),
        ),
        migrations.RemoveField(
            model_name='videotestimonial',
            name='image_url',
        ),
        # PhotoGalleryItem
        migrations.AddField(
            model_name='photogalleryitem',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='photo_gallery/'),
        ),
        migrations.RemoveField(
            model_name='photogalleryitem',
            name='image_url',
        ),
        # BlogPost
        migrations.AddField(
            model_name='blogpost',
            name='image',
            field=models.ImageField(blank=True, help_text='Optional image for the blog post', null=True, upload_to='blogs/'),
        ),
        migrations.RemoveField(
            model_name='blogpost',
            name='image_url',
        ),
        # HeroSection
        migrations.AddField(
            model_name='herosection',
            name='background_image',
            field=models.ImageField(blank=True, null=True, upload_to='hero/'),
        ),
        migrations.RemoveField(
            model_name='herosection',
            name='background_image_url',
        ),
        # CorporateGiftingSection
        migrations.AddField(
            model_name='corporategiftingsection',
            name='background_image',
            field=models.ImageField(blank=True, null=True, upload_to='corporate_gifting/'),
        ),
        migrations.RemoveField(
            model_name='corporategiftingsection',
            name='background_image_url',
        ),
    ]
