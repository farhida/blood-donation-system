"""
Core models consolidated from `donors.models`.

This file is a copy of the donor-related models moved into a new `core` app
as part of the full-merge plan. DO NOT remove the original `donors/` app or its
migrations until you have completed the migration plan in `backend/docs/MIGRATION_PLAN.md`.

After the migration is applied and verified, the original `donors` app can be
safely removed and `core` can become the canonical app for these models.
"""

from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    """Profile data attached to Django's User model.

    Fields:
    - phone, blood_group, last_donation, district: basic contact and donation info
    - share_phone: flag indicating whether the donor consents to share phone
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=15, blank=True, null=True)
    blood_group = models.CharField(max_length=10, blank=True, null=True)
    last_donation = models.DateField(blank=True, null=True)
    district = models.CharField(max_length=100, blank=True, null=True)
    share_phone = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username}'s profile"
    
    class Meta:
        # Map to the original donors app table to avoid immediate DB migrations
        db_table = 'donors_userprofile'


class Request(models.Model):
    """A blood request created by a user.

    - status: open / accepted / collected
    - accepted_by: the donor who accepted the request (nullable)
    """
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('accepted', 'Accepted'),
        ('collected', 'Collected'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    blood_group = models.CharField(max_length=10)
    city = models.CharField(max_length=100, blank=True, null=True)
    urgency = models.CharField(max_length=20, choices=[('urgent', 'Urgent'), ('non_urgent', 'Non-Urgent')], blank=True, null=True)

    hospital = models.CharField(max_length=150, blank=True, null=True)
    cause = models.CharField(max_length=255, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    contact_info = models.CharField(max_length=255, blank=True, null=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    accepted_by = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True, related_name='accepted_requests')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.blood_group} - {self.hospital or self.city or ''} ({self.status})"
    
    class Meta:
        db_table = 'donors_request'


class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    request = models.ForeignKey(Request, on_delete=models.CASCADE, related_name='notifications')
    message = models.CharField(max_length=255)
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"To {self.user.username}: {self.message}"
    
    class Meta:
        db_table = 'donors_notification'


class BloodInventory(models.Model):
    hospital = models.CharField(max_length=100)
    blood_group = models.CharField(max_length=10)
    units_available = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.hospital} - {self.blood_group} - {self.units_available} units"
    
    class Meta:
        db_table = 'donors_bloodinventory'


class Donation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    blood_group = models.CharField(max_length=10)
    hospital = models.CharField(max_length=100)
    units_donated = models.PositiveIntegerField(default=1)
    donation_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.blood_group} - {self.hospital} - {self.units_donated} units"
    
    class Meta:
        db_table = 'donors_donation'
