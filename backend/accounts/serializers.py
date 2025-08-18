from rest_framework import serializers
from django.contrib.auth.models import User
from donors.models import UserProfile

class UserSerializer(serializers.ModelSerializer):
    blood_group = serializers.CharField(required=True)
    last_donation = serializers.DateField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'email', 'blood_group', 'last_donation']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        blood_group = validated_data.pop('blood_group')
        last_donation = validated_data.pop('last_donation', None)
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        UserProfile.objects.create(
            user=user,
            blood_group=blood_group,
            last_donation=last_donation
        )
        return user