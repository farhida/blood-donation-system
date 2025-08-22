from rest_framework import serializers
from core.models import Request, BloodInventory, Donation, UserProfile, Notification
from django.contrib.auth.models import User


class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    last_donation = serializers.DateField(allow_null=True, required=False)

    class Meta:
        model = UserProfile
        fields = ['username', 'email', 'phone', 'blood_group', 'last_donation', 'district', 'share_phone', 'donated_recently', 'not_ready']

    def update(self, instance, validated_data):
        instance.phone = validated_data.get('phone', instance.phone)
        instance.blood_group = validated_data.get('blood_group', instance.blood_group)
        instance.last_donation = validated_data.get('last_donation', instance.last_donation)
        instance.district = validated_data.get('district', instance.district)
        instance.share_phone = validated_data.get('share_phone', instance.share_phone)
        instance.donated_recently = validated_data.get('donated_recently', instance.donated_recently)
        instance.not_ready = validated_data.get('not_ready', instance.not_ready)
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


class RequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Request
        fields = [
            'id', 'user', 'blood_group', 'city', 'urgency',
            'hospital', 'cause', 'address', 'contact_info',
            'status', 'accepted_by', 'created_at'
        ]
        read_only_fields = ['user', 'status', 'accepted_by', 'created_at']

    def validate(self, attrs):
        bg = attrs.get('blood_group')
        ci = attrs.get('contact_info')
        if not bg or not str(bg).strip():
            raise serializers.ValidationError({'blood_group': 'Blood group is required.'})
        if not ci or not str(ci).strip():
            raise serializers.ValidationError({'contact_info': 'Contact info is required.'})
        return attrs


class BloodInventorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BloodInventory
        fields = ['id', 'hospital', 'blood_group', 'units_available', 'updated_at']


class DonationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donation
        fields = ['id', 'user', 'blood_group', 'hospital', 'units_donated', 'donation_date']
        read_only_fields = ['user', 'donation_date']


class NotificationSerializer(serializers.ModelSerializer):
    request_info = serializers.SerializerMethodField()
    accepted_by_info = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = ['id', 'user', 'request', 'message', 'read', 'created_at', 'request_info', 'accepted_by_info']
        read_only_fields = ['user', 'created_at']

    def get_request_info(self, obj):
        if not obj.request:
            return None
        r = obj.request
        req = self.context.get('request')
        is_owner = bool(req and getattr(req, 'user', None) and r.user_id == req.user.id)
        return {
            'id': r.id,
            'blood_group': r.blood_group,
            'hospital': r.hospital,
            'city': r.city,
            'address': r.address,
            'contact_info': r.contact_info,
            'status': r.status,
            'is_owner': is_owner,
        }

    def get_accepted_by_info(self, obj):
        r = getattr(obj, 'request', None)
        if not r or not r.accepted_by:
            return None
        user = r.accepted_by
        phone = None
        try:
            prof = UserProfile.objects.get(user=user)
            phone = prof.phone if getattr(prof, 'share_phone', False) else None
        except UserProfile.DoesNotExist:
            phone = None
        full_name = f"{user.first_name} {user.last_name}".strip() or user.username
        return {
            'name': full_name,
            'email': user.email,
            'phone': phone,
        }
