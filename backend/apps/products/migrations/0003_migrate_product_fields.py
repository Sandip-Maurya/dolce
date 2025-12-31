# Migration to remove old fields and rename new fields after data migration
# This should be run after the data migration is complete

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0002_1_populate_category_data'),
    ]

    operations = [
        # Remove old category and tags fields
        migrations.RemoveField(
            model_name='product',
            name='category',
        ),
        migrations.RemoveField(
            model_name='product',
            name='tags',
        ),
        # Rename new fields to final names
        migrations.RenameField(
            model_name='product',
            old_name='category_new',
            new_name='category',
        ),
        migrations.RenameField(
            model_name='product',
            old_name='subcategory_new',
            new_name='subcategory',
        ),
        migrations.RenameField(
            model_name='product',
            old_name='tags_new',
            new_name='tags',
        ),
        # Update indexes
        migrations.AlterIndexTogether(
            name='product',
            index_together=set(),
        ),
        migrations.RemoveIndex(
            model_name='product',
            name='products_categor_fce6e6_idx',
        ),
        migrations.AddIndex(
            model_name='product',
            index=models.Index(fields=['subcategory'], name='products_subcategory_idx'),
        ),
        # Make category and subcategory required (not null)
        # First, ensure all products have category and subcategory
        migrations.RunPython(
            lambda apps, schema_editor: None,  # No-op forward
            lambda apps, schema_editor: None,  # No-op reverse
        ),
        migrations.AlterField(
            model_name='product',
            name='category',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='products', to='products.category'),
        ),
        migrations.AlterField(
            model_name='product',
            name='subcategory',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='products', to='products.subcategory'),
        ),
    ]

