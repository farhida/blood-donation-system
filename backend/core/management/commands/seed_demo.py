from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

from core.models import UserProfile


class Command(BaseCommand):
    help = 'Seed demo admin user and a few donor profiles. Safe to run multiple times.'

    def handle(self, *args, **options):
        User = get_user_model()

        # Create or update admin user
        admin_username = 'toushi'
        admin_email = 'toushi@example.com'
        admin_password = '12345678'

        admin, created = User.objects.get_or_create(username=admin_username, defaults={'email': admin_email})
        if created:
            admin.set_password(admin_password)
            admin.is_staff = True
            admin.is_superuser = True
            admin.save()
            self.stdout.write(self.style.SUCCESS(f'Created admin user {admin_username}'))
        else:
            changed = False
            if not admin.is_staff:
                admin.is_staff = True
                changed = True
            if not admin.is_superuser:
                admin.is_superuser = True
                changed = True
            admin.set_password(admin_password)
            if changed:
                admin.save()
            self.stdout.write(self.style.SUCCESS(f'Ensured admin user {admin_username} (created={created})'))

        # Sample donors to insert if not present
        samples = [
            {'username': 'alice', 'first_name': 'Alice', 'last_name': 'Khan', 'email': 'alice@example.com', 'blood_group': 'A+', 'district': 'Dhaka'},
            {'username': 'bob', 'first_name': 'Bob', 'last_name': 'Rahman', 'email': 'bob@example.com', 'blood_group': 'B+', 'district': 'Chittagong'},
            {'username': 'charlie', 'first_name': 'Charlie', 'last_name': 'Das', 'email': 'charlie@example.com', 'blood_group': 'O+', 'district': 'Sylhet'},
        ]

        for s in samples:
            u, ucreated = User.objects.get_or_create(username=s['username'], defaults={'first_name': s['first_name'], 'last_name': s['last_name'], 'email': s['email']})
            if ucreated:
                u.set_password('password123')
                u.save()
            prof, pcreated = UserProfile.objects.get_or_create(user=u)
            prof.blood_group = s['blood_group']
            prof.district = s['district']
            prof.share_phone = False
            prof.phone = ''
            prof.last_donation = None
            # Ensure legacy flags are unset if they exist
            if hasattr(prof, 'donated_recently'):
                try:
                    setattr(prof, 'donated_recently', False)
                except Exception:
                    pass
            if hasattr(prof, 'not_ready'):
                try:
                    setattr(prof, 'not_ready', False)
                except Exception:
                    pass
            prof.save()
            self.stdout.write(self.style.SUCCESS(f'Prepared sample donor {u.username}'))

        self.stdout.write(self.style.SUCCESS('Seeding complete. Admin user password is 12345678.'))
