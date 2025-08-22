from rest_framework import serializers
from core.models import Request, BloodInventory, Donation, UserProfile, Notification
from django.contrib.auth.models import User


class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    last_donation = serializers.DateField(allow_null=True, required=False)

    class Meta:
        model = UserProfile
    fields = ['username', 'email', 'phone', 'blood_group', 'last_donation', 'district', 'share_phone']

    def update(self, instance, validated_data):
        instance.phone = validated_data.get('phone', instance.phone)
        instance.blood_group = validated_data.get('blood_group', instance.blood_group)
        instance.last_donation = validated_data.get('last_donation', instance.last_donation)
        instance.district = validated_data.get('district', instance.district)
        instance.share_phone = validated_data.get('share_phone', instance.share_phone)
        instance.save()
        return instance

    def validate(self, attrs):
        if 'last_donation' in attrs and attrs.get('last_donation') in ('', None):
            attrs['last_donation'] = None
        share_phone = attrs.get('share_phone', getattr(self.instance, 'share_phone', False))
        phone = attrs.get('phone', getattr(self.instance, 'phone', '') or '')
        errors = {}
        if share_phone and not phone:
            errors['phone'] = 'Phone number is required when sharing phone publicly.'
        if errors:
            raise serializers.ValidationError(errors)
        return attrs


class PublicDonorProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    full_name = serializers.SerializerMethodField()
    email = serializers.EmailField(source='user.email')
    phone = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ['username', 'full_name', 'email', 'blood_group', 'district', 'last_donation', 'phone']

    def get_phone(self, obj):
        return obj.phone if getattr(obj, 'share_phone', False) else None

    def get_full_name(self, obj):
        first = getattr(obj.user, 'first_name', '') or ''
        last = getattr(obj.user, 'last_name', '') or ''
        full = f"{first} {last}".strip()
        return full or getattr(obj.user, 'username', '')



class BloodInventorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BloodInventory
        fields = ['id', 'hospital', 'blood_group', 'units_available', 'updated_at']


class DonationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donation
        fields = ['id', 'user', 'blood_group', 'hospital', 'units_donated', 'donation_date']
        read_only_fields = ['user', 'donation_date']


# Request and Notification serializers removed to simplify API surface.
# Keep public profile, user profile, inventory and donation serializers above.
