from rest_framework import serializers
from django.contrib.auth.models import User
from donors.models import UserProfile

class UserSerializer(serializers.ModelSerializer):
    blood_group = serializers.CharField(required=True, write_only=True)
    last_donation = serializers.DateField(required=False, allow_null=True, write_only=True)
    district = serializers.CharField(required=True, allow_blank=False, write_only=True)
    share_phone = serializers.BooleanField(required=False, write_only=True)
    phone = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'email', 'blood_group', 'last_donation', 'district', 'share_phone', 'phone']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        blood_group = validated_data.pop('blood_group')
        last_donation = validated_data.pop('last_donation', None)
        district = validated_data.pop('district')
        share_phone = validated_data.pop('share_phone', False)
        phone = validated_data.pop('phone', '')
        # Validation: if share_phone is true, phone must be provided
        if share_phone and not phone:
            raise serializers.ValidationError({'phone': 'Phone number is required when sharing phone publicly.'})
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.blood_group = blood_group
        profile.last_donation = last_donation
        profile.district = district
        profile.share_phone = share_phone
        profile.phone = phone
        profile.save()
        return user