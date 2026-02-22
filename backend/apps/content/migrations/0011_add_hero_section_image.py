# Hero carousel: HeroSectionImage model for multiple hero slides

import uuid

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0010_imagefield_for_content_models'),
    ]

    operations = [
        migrations.CreateModel(
            name='HeroSectionImage',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('image', models.ImageField(upload_to='hero/carousel/')),
                ('order', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('hero_section', models.ForeignKey(on_delete=models.CASCADE, related_name='images', to='content.herosection')),
            ],
            options={
                'db_table': 'hero_section_images',
                'ordering': ['order', 'created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='herosectionimage',
            index=models.Index(fields=['hero_section'], name='content_hero_hero_se_idx'),
        ),
    ]
