"""
Management command to create a superuser.
"""
from django.core.management.base import BaseCommand
from apps.users.models import User


class Command(BaseCommand):
    help = 'Create a superuser for admin access'

    def handle(self, *args, **options):
        email = input('Email: ')
        name = input('Name: ')
        password = input('Password: ')
        
        user = User.objects.create_superuser(
            email=email,
            username=email,
            name=name,
            password=password
        )
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created superuser: {user.email}')
        )

