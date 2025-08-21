from rest_framework import serializers
from django.contrib.auth.models import User
from donors.models import UserProfile
import re
from datetime import date, timedelta
import logging


class UserSerializer(serializers.ModelSerializer):
    # Use full_name instead of username; username will be auto-generated
    full_name = serializers.CharField(required=True, write_only=True)
    blood_group = serializers.CharField(required=True, write_only=True)
    last_donation = serializers.DateField(required=False, allow_null=True, write_only=True)
    district = serializers.CharField(required=True, allow_blank=False, write_only=True)
    share_phone = serializers.BooleanField(required=False, write_only=True)
    phone = serializers.CharField(required=False, allow_blank=True, write_only=True)
    donated_recently = serializers.BooleanField(required=False, write_only=True)

    class Meta:
        model = User
        fields = [
            'full_name', 'password', 'email', 'blood_group', 'last_donation',
            'district', 'share_phone', 'phone', 'donated_recently'
        ]
        extra_kwargs = {'password': {'write_only': True}}

    def _slugify(self, text: str) -> str:
        text = text.strip().lower()
        # replace non-alphanumeric with underscores
        text = re.sub(r"[^a-z0-9]+", "_", text)
        text = text.strip("_") or "user"
        return text[:30]

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
        donated_recently_flag = validated_data.pop('donated_recently', False)
        full_name = validated_data.pop('full_name')
        email = validated_data.get('email', '')
        password = validated_data.get('password')

        # Validation: if share_phone is true, phone must be provided
        if share_phone and not phone:
            raise serializers.ValidationError({'phone': 'Phone number is required when sharing phone publicly.'})

        base_username = self._slugify(full_name)
        username = self._unique_username(base_username)
        parts = full_name.strip().split()
        first = parts[0] if parts else ''
        last = " ".join(parts[1:]) if len(parts) > 1 else ''

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        user.first_name = first
        user.last_name = last
        user.save()

        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.blood_group = blood_group
        profile.last_donation = last_donation
        profile.district = district
        profile.share_phone = share_phone
        profile.phone = phone
        # Determine donated_recently based on provided flag or last_donation within 90 days
        donated_recently_calc = False
        if last_donation:
            try:
                donated_recently_calc = (date.today() - last_donation) <= timedelta(days=90)
            except Exception:
                donated_recently_calc = False
        if donated_recently_flag:
            donated_recently_calc = True
        profile.donated_recently = donated_recently_calc
        # Auto-set not_ready if donated within last 3 months
        profile.not_ready = bool(donated_recently_calc)
        profile.save()
        return user


class AdminUserSerializer(serializers.ModelSerializer):
    # Embed profile fields
    phone = serializers.CharField(source='userprofile.phone', allow_blank=True, allow_null=True, required=False)
    blood_group = serializers.CharField(source='userprofile.blood_group', allow_blank=True, required=False)
    last_donation = serializers.DateField(source='userprofile.last_donation', allow_null=True, required=False)
    district = serializers.CharField(source='userprofile.district', allow_blank=True, required=False)
    share_phone = serializers.BooleanField(source='userprofile.share_phone', required=False)
    donated_recently = serializers.BooleanField(source='userprofile.donated_recently', required=False)
    not_ready = serializers.BooleanField(source='userprofile.not_ready', required=False)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'is_active', 'is_staff', 'is_superuser',
            'phone', 'blood_group', 'last_donation', 'district', 'share_phone', 'donated_recently', 'not_ready'
        ]
        read_only_fields = ['username', 'is_staff', 'is_superuser']

    def update(self, instance, validated_data):
        logging.warning(f"AdminUserSerializer.update called for user id={instance.id} with validated_data={validated_data}")
        # Update User fields
        instance.email = validated_data.get('email', instance.email)
        instance.is_active = validated_data.get('is_active', instance.is_active)
        # Update UserProfile nested
        # Accept profile updates whether they arrive under 'userprofile' or as top-level keys
        profile_data = validated_data.get('userprofile', {}) or {}
        profile, _ = UserProfile.objects.get_or_create(user=instance)
        for attr in ['phone', 'blood_group', 'district', 'share_phone', 'donated_recently', 'not_ready']:
            # prefer nested value, fall back to top-level key
            if attr in profile_data:
                val = profile_data.get(attr)
                setattr(profile, attr, val)
            elif attr in validated_data:
                val = validated_data.get(attr)
                setattr(profile, attr, val)
        # last_donation may also appear nested or top-level
        if 'last_donation' in profile_data:
            profile.last_donation = profile_data.get('last_donation')
        elif 'last_donation' in validated_data:
            profile.last_donation = validated_data.get('last_donation')

        # Auto-calc donated_recently / not_ready based on last_donation (90 days window)
        try:
            three_months_ago = date.today() - timedelta(days=90)
            if profile.last_donation:
                # if last_donation within 90 days, mark donated_recently and not_ready
                profile.donated_recently = profile.last_donation >= three_months_ago
                profile.not_ready = profile.donated_recently
            else:
                # no last_donation -> available
                profile.donated_recently = False
                # Only preserve an explicit not_ready flag if provided; otherwise default False
                if 'not_ready' not in profile_data and 'not_ready' not in validated_data:
                    profile.not_ready = False
        except Exception:
            # if any parsing error, don't change not_ready flags
            pass
        # Log saved values for debugging
        logging.warning(f"Saving profile for user id={instance.id}: phone={profile.phone!r}, blood_group={profile.blood_group!r}, district={profile.district!r}, last_donation={profile.last_donation!r}, not_ready={profile.not_ready}, donated_recently={profile.donated_recently}")
        profile.save()
        instance.save()
        return instance