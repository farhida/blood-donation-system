from rest_framework import serializers
from .models import Donor, Request, BloodInventory, Donation, UserProfile
from django.contrib.auth.models import User

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = UserProfile
    fields = ['username', 'email', 'phone', 'blood_group', 'last_donation']

    def update(self, instance, validated_data):
        instance.phone = validated_data.get('phone', instance.phone)
        instance.blood_group = validated_data.get('blood_group', instance.blood_group)
        instance.last_donation = validated_data.get('last_donation', instance.last_donation)
        instance.save()
        return instance


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

class DonationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donation
        fields = ['id', 'user', 'blood_group', 'hospital', 'units_donated', 'donation_date']
        read_only_fields = ['user', 'donation_date']