from rest_framework import serializers
from django.contrib.auth.models import User
import re
import logging


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(required=True, write_only=True)
    blood_group = serializers.CharField(required=True, write_only=True)
    last_donation = serializers.DateField(required=False, allow_null=True, write_only=True)
    district = serializers.CharField(required=True, allow_blank=False, write_only=True)
    share_phone = serializers.BooleanField(required=False, write_only=True)
    phone = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = User
        fields = [
            'full_name', 'password', 'email', 'blood_group', 'last_donation',
            'district', 'share_phone', 'phone'
        ]
        extra_kwargs = {'password': {'write_only': True}}

    def _slugify(self, text: str) -> str:
        s = (text or '').strip().lower()
        s = re.sub(r"[^a-z0-9]+", "_", s)
        s = s.strip("_") or "user"
        return s[:30]

    def _unique_username(self, base: str) -> str:
        candidate = base
        suffix = 1
        while User.objects.filter(username=candidate).exists():
            suffix += 1
            candidate = f"{base}_{suffix}"
            if len(candidate) > 30:
                candidate = candidate[:30]
        return candidate

    def create(self, validated_data):
        blood_group = validated_data.pop('blood_group')
        last_donation = validated_data.pop('last_donation', None)
        district = validated_data.pop('district')
        share_phone = validated_data.pop('share_phone', False)
        phone = validated_data.pop('phone', '')
        full_name = validated_data.pop('full_name')
        email = validated_data.get('email', '')
        password = validated_data.get('password')

        if share_phone and not phone:
            raise serializers.ValidationError({'phone': 'Phone number is required when sharing phone publicly.'})

        base_username = self._slugify(full_name)
        username = self._unique_username(base_username)
        parts = full_name.strip().split()
        first = parts[0] if parts else ''
        last = " ".join(parts[1:]) if len(parts) > 1 else ''

        user = User.objects.create_user(username=username, email=email, password=password)
        user.first_name = first
        user.last_name = last
        user.save()

        from api.profile_utils import get_or_create_profile
        profile, _ = get_or_create_profile(user)
        profile.blood_group = blood_group
        profile.last_donation = last_donation
        profile.district = district
        profile.share_phone = share_phone
        profile.phone = phone
        profile.save()
        return user


class AdminUserSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(source='userprofile.phone', allow_blank=True, allow_null=True, required=False)
    blood_group = serializers.CharField(source='userprofile.blood_group', allow_blank=True, required=False)
    last_donation = serializers.DateField(source='userprofile.last_donation', allow_null=True, required=False)
    district = serializers.CharField(source='userprofile.district', allow_blank=True, required=False)
    share_phone = serializers.BooleanField(source='userprofile.share_phone', required=False)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'is_active', 'is_staff', 'is_superuser',
            'phone', 'blood_group', 'last_donation', 'district', 'share_phone'
        ]
        read_only_fields = ['username', 'is_staff', 'is_superuser']

    def update(self, instance, validated_data):
        logging.debug(f"AdminUserSerializer.update user={instance.id}")
        instance.email = validated_data.get('email', instance.email)
        instance.is_active = validated_data.get('is_active', instance.is_active)

        profile_data = validated_data.get('userprofile', {}) or {}
        from api.profile_utils import get_or_create_profile
        profile, _ = get_or_create_profile(instance)

        for attr in ['phone', 'blood_group', 'district', 'share_phone', 'last_donation']:
            if attr in profile_data:
                setattr(profile, attr, profile_data.get(attr))
            elif attr in validated_data:
                setattr(profile, attr, validated_data.get(attr))

        profile.save()
        instance.save()
        return instance
