from django.db import models
from django.contrib.auth.models import User

class Donor(models.Model):
    name = models.CharField(max_length=100)
    blood_group = models.CharField(max_length=10)
    phone = models.CharField(max_length=15)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Request(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    blood_group = models.CharField(max_length=10)
    city = models.CharField(max_length=100)
    urgency = models.CharField(max_length=20, choices=[('urgent', 'Urgent'), ('non_urgent', 'Non-Urgent')])
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.blood_group} - {self.city}"

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