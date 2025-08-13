from rest_framework import serializers
from .models import Donor, Request, BloodInventory, Donation, UserProfile
from django.contrib.auth.models import User

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    email = serializers.EmailField(source='user.email')

    class Meta:
        model = UserProfile
        fields = ['username', 'email', 'phone', 'blood_group']

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        instance.user.username = user_data.get('username', instance.user.username)
        instance.user.email = user_data.get('email', instance.user.email)
        instance.user.save()
        instance.phone = validated_data.get('phone', instance.phone)
        instance.blood_group = validated_data.get('blood_group', instance.blood_group)
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