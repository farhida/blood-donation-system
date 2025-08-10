from rest_framework import serializers
from .models import Donor, Request, BloodInventory

class DonorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donor
        fields = ['id', 'name', 'blood_group', 'phone', 'created_at']

class RequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Request
        fields = ['id', 'user', 'blood_group', 'city', 'urgency', 'created_at']
        read_only_fields = ['user', 'created_at']

class BloodInventorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BloodInventory
        fields = ['id', 'hospital', 'blood_group', 'units_available', 'updated_at']