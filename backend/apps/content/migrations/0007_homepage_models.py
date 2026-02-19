# Generated manually for homepage premium redesign

import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0006_remove_contactinfo_response_message_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='HeroSection',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('headline', models.CharField(max_length=200)),
                ('highlight_text', models.CharField(help_text='Gold-colored portion of headline', max_length=100)),
                ('subheadline', models.TextField()),
                ('primary_cta_text', models.CharField(max_length=50)),
                ('primary_cta_link', models.CharField(max_length=255)),
                ('secondary_cta_text', models.CharField(max_length=50)),
                ('secondary_cta_link', models.CharField(max_length=255)),
                ('background_image_url', models.URLField(blank=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'hero_sections',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='TrustBarItem',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('icon_name', models.CharField(help_text='Icon identifier: truck, gift, leaf, etc.', max_length=50)),
                ('text', models.CharField(max_length=100)),
                ('order', models.IntegerField(default=0)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'trust_bar_items',
                'ordering': ['order', 'created_at'],
            },
        ),
        migrations.CreateModel(
            name='FAQ',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('question', models.CharField(max_length=300)),
                ('answer', models.TextField()),
                ('order', models.IntegerField(default=0)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'faqs',
                'ordering': ['order', 'created_at'],
            },
        ),
        migrations.CreateModel(
            name='CorporateGiftingSection',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField()),
                ('features', models.JSONField(default=list, help_text="List of feature strings (e.g. Bulk orders, Custom branding)")),
                ('primary_cta_text', models.CharField(max_length=50)),
                ('primary_cta_link', models.CharField(max_length=255)),
                ('secondary_cta_text', models.CharField(max_length=50)),
                ('secondary_cta_link', models.CharField(max_length=255)),
                ('background_image_url', models.URLField(blank=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'corporate_gifting_sections',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='SeasonalSection',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=200)),
                ('subtitle', models.CharField(blank=True, max_length=300)),
                ('start_date', models.DateField()),
                ('end_date', models.DateField()),
                ('badge_text', models.CharField(blank=True, max_length=100)),
                ('cta_text', models.CharField(max_length=50)),
                ('cta_link', models.CharField(max_length=255)),
                ('background_color', models.CharField(blank=True, max_length=50)),
                ('featured_product_ids', models.JSONField(default=list, help_text='List of product UUIDs to feature')),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'seasonal_sections',
                'ordering': ['-start_date'],
            },
        ),
        migrations.AddIndex(
            model_name='herosection',
            index=models.Index(fields=['is_active'], name='content_hero_is_active_idx'),
        ),
        migrations.AddIndex(
            model_name='trustbaritem',
            index=models.Index(fields=['is_active'], name='content_trustbar_is_active_idx'),
        ),
        migrations.AddIndex(
            model_name='trustbaritem',
            index=models.Index(fields=['order'], name='content_trustbar_order_idx'),
        ),
        migrations.AddIndex(
            model_name='faq',
            index=models.Index(fields=['is_active'], name='content_faq_is_active_idx'),
        ),
        migrations.AddIndex(
            model_name='faq',
            index=models.Index(fields=['order'], name='content_faq_order_idx'),
        ),
        migrations.AddIndex(
            model_name='corporategiftingsection',
            index=models.Index(fields=['is_active'], name='content_corp_is_active_idx'),
        ),
        migrations.AddIndex(
            model_name='seasonalsection',
            index=models.Index(fields=['is_active'], name='content_seasonal_is_active_idx'),
        ),
        migrations.AddIndex(
            model_name='seasonalsection',
            index=models.Index(fields=['start_date', 'end_date'], name='content_seasonal_dates_idx'),
        ),
    ]
