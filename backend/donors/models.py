from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=15, blank=True, null=True)
    blood_group = models.CharField(max_length=10, blank=True, null=True)
    last_donation = models.DateField(blank=True, null=True)
    district = models.CharField(max_length=100, blank=True, null=True)
    share_phone = models.BooleanField(default=False)
    donated_recently = models.BooleanField(default=False)
    not_ready = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username}'s profile"

# Legacy Donor model removed; donor data is represented by User + UserProfile

class Request(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('accepted', 'Accepted'),
        ('collected', 'Collected'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    blood_group = models.CharField(max_length=10)
    # Legacy fields retained but optional
    city = models.CharField(max_length=100, blank=True, null=True)
    urgency = models.CharField(max_length=20, choices=[('urgent', 'Urgent'), ('non_urgent', 'Non-Urgent')], blank=True, null=True)

    # New detailed fields
    hospital = models.CharField(max_length=150, blank=True, null=True)
    cause = models.CharField(max_length=255, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    contact_info = models.CharField(max_length=255, blank=True, null=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    accepted_by = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True, related_name='accepted_requests')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.blood_group} - {self.hospital or self.city or ''} ({self.status})"

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    request = models.ForeignKey(Request, on_delete=models.CASCADE, related_name='notifications')
    message = models.CharField(max_length=255)
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"To {self.user.username}: {self.message}"

class BloodInventory(models.Model):
    hospital = models.CharField(max_length=100)
    blood_group = models.CharField(max_length=10)
    units_available = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.hospital} - {self.blood_group} - {self.units_available} units"

class Donation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    blood_group = models.CharField(max_length=10)
    hospital = models.CharField(max_length=100)
    units_donated = models.PositiveIntegerField(default=1)
    donation_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.blood_group} - {self.hospital} - {self.units_donated} units"