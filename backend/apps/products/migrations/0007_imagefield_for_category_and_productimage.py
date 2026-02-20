# Option B: Replace URLFields with ImageFields for admin upload to S3

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0006_rename_products_cat_featured_idx_categories_feature_34f2bc_idx'),
    ]

    operations = [
        # Category: add new field then remove old
        migrations.AddField(
            model_name='category',
            name='homepage_image',
            field=models.ImageField(blank=True, null=True, upload_to='categories/'),
        ),
        migrations.RemoveField(
            model_name='category',
            name='homepage_image_url',
        ),
        # ProductImage: add new field then remove old
        migrations.AddField(
            model_name='productimage',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='product_images/'),
        ),
        migrations.RemoveField(
            model_name='productimage',
            name='image_url',
        ),
    ]
