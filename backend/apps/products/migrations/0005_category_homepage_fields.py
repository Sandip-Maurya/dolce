# Generated manually for homepage premium redesign

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0004_rename_categories_slug_idx_categories_slug_b4303a_idx_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='category',
            name='featured_on_homepage',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='category',
            name='homepage_image_url',
            field=models.URLField(blank=True),
        ),
        migrations.AddField(
            model_name='category',
            name='homepage_order',
            field=models.IntegerField(default=0, help_text='Order on homepage when featured'),
        ),
        migrations.AddIndex(
            model_name='category',
            index=models.Index(fields=['featured_on_homepage'], name='products_cat_featured_idx'),
        ),
    ]
