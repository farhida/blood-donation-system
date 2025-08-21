"""
Accounts views

This module exposes user-facing and admin-facing endpoints for registration,
+
profile management, and simple admin user listing. Key endpoints:

- RegisterView: public registration (creates User + profile)
- MeView: returns basic authenticated user info (username, email, flags)
- MyProfileView: authenticated user's profile retrieve/update (uses AdminUserSerializer)
- AdminUserListView / AdminUserDetailView: admin-only list/detail endpoints for user management
+
Permissions are applied on a per-view basis; admin views require IsAdminUser.
+
"""

from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from django.contrib.auth.models import User
from .serializers import UserSerializer, AdminUserSerializer

from rest_framework.response import Response
from rest_framework import status
import logging

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        logging.warning(f"RegisterView data: {request.data}")
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            logging.error(f"RegisterView errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        self.perform_create(serializer)
        return Response({'message': 'User registered successfully.'}, status=status.HTTP_201_CREATED)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'username': user.username,
            'email': user.email,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
        })


class MyProfileView(generics.RetrieveUpdateAPIView):
    """Allow an authenticated user to view and update their profile."""
    permission_classes = [IsAuthenticated]
    serializer_class = AdminUserSerializer

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)


class AdminUserListView(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminUserSerializer

    def get_queryset(self):
        return User.objects.select_related('userprofile').all().order_by('id')


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminUserSerializer
    queryset = User.objects.select_related('userprofile').all()

    def update(self, request, *args, **kwargs):
        # Ensure the response includes the serialized updated user so clients can update local state
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)


class UsernameAvailabilityView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        username = request.query_params.get('username', '').strip()
        if not username:
            return Response({'available': False, 'error': 'username is required'}, status=status.HTTP_400_BAD_REQUEST)
        exists = User.objects.filter(username=username).exists()
        return Response({'available': not exists})