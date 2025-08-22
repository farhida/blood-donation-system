"""
Canonical donors API moved to backend/api.

This module contains the donor-facing API implementations used by the frontend.
Each view has a short comment describing its purpose and intended frontend route.
Keep logic unchanged; only imports adjusted for the new location.

Note: this file is intended to be the single source-of-truth for donors-related API.
"""
from rest_framework import generics, status, permissions
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth import authenticate

# Import models/serializers from the consolidated core app
from core.models import BloodInventory, Donation, UserProfile
from api.serializers_donors import (
    BloodInventorySerializer,
    DonationSerializer,
    UserProfileSerializer,
    PublicDonorProfileSerializer,
)

from django.db.models import Count, Sum
from django.db import models
from datetime import date, timedelta
import logging

logger = logging.getLogger(__name__)

# BUSINESS CONSTANTS (single place to change donor rest window)
DONOR_REST_WINDOW_DAYS = 90


# Public donor search (by blood group, no auth required)
# TASK: Exposed at GET /api/donors/search/ (frontend public donor search)
class PublicDonorSearch(generics.ListAPIView):
    serializer_class = PublicDonorProfileSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        # TASK: filter available donors by blood_group and district
        blood_group = self.request.query_params.get('blood_group')
        district = self.request.query_params.get('district')
        cutoff = date.today() - timedelta(days=DONOR_REST_WINDOW_DAYS)
        qs = UserProfile.objects.select_related('user').all()
        if blood_group:
            qs = qs.filter(blood_group__iexact=blood_group)
        if district:
            qs = qs.filter(district__iexact=district)
        # Availability: include profiles with no last_donation or last_donation older than cutoff
        qs = qs.filter(models.Q(last_donation__isnull=True) | models.Q(last_donation__lt=cutoff))
        return qs


# Request and Notification endpoints removed to simplify API surface.
# Models remain in `core.models` to preserve database compatibility.


class BloodInventoryList(generics.ListCreateAPIView):
    # TASK: GET /api/inventory/ — computed inventory of currently available donors (not DB rows)
    queryset = BloodInventory.objects.all()
    serializer_class = BloodInventorySerializer
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        cutoff = date.today() - timedelta(days=DONOR_REST_WINDOW_DAYS)
        available = UserProfile.objects.select_related('user').filter(models.Q(last_donation__isnull=True) | models.Q(last_donation__lt=cutoff))
        donors = []
        for prof in available:
            user = prof.user
            full_name = f"{user.first_name} {user.last_name}".strip() or user.username
            donors.append({
                'id': prof.id,
                'username': user.username,
                'full_name': full_name,
                'email': user.email,
                'phone': prof.phone if getattr(prof, 'share_phone', False) else None,
                'blood_group': prof.blood_group,
                'district': prof.district,
                'last_donation': prof.last_donation,
            })
        return Response(donors)


class BloodInventoryDetail(generics.RetrieveUpdateDestroyAPIView):
    # TASK: GET/PUT/DELETE for inventory record (kept for parity; not heavily used)
    queryset = BloodInventory.objects.all()
    serializer_class = BloodInventorySerializer
    permission_classes = [IsAuthenticated]


class DonationList(generics.ListCreateAPIView):
    # TASK: GET /api/donations/ (current user's) and POST to create donation
    serializer_class = DonationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Donation.objects.filter(user=self.request.user).order_by('-donation_date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class DonationDetail(generics.RetrieveUpdateDestroyAPIView):
    # TASK: GET/PUT/DELETE for a donation record (auth required)
    queryset = Donation.objects.all()
    serializer_class = DonationSerializer
    permission_classes = [IsAuthenticated]


class DashboardSummaryView(APIView):
    # TASK: GET /api/dashboard-summary/ — small profile summary for dashboard
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            profile = UserProfile.objects.get(user=user)
        except UserProfile.DoesNotExist:
            profile = UserProfile.objects.create(user=user)
        donation_count = Donation.objects.filter(user=user).count()
        full_name = f"{user.first_name} {user.last_name}".strip()
        data = {
            'username': user.username,
            'full_name': full_name or None,
            'email': user.email,
            'blood_group': profile.blood_group,
            'district': profile.district,
            'last_donation': profile.last_donation,
            'donation_count': donation_count,
        }
        # Include phone only if the user opted to share it
        try:
            data['phone'] = profile.phone if getattr(profile, 'share_phone', False) else None
        except Exception:
            data['phone'] = None
        return Response(data)


class AnalyticsView(APIView):
    # TASK: GET /api/analytics/ — basic analytics used by admin dashboard
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Aggregate total requests per blood group.
        # The Request model / endpoints were removed from the public API to simplify the surface;
        # if the DB still contains requests, we attempt to read them dynamically to compute demand.
        demand_data = {}
        try:
            from core.models import Request as _Request
            request_counts = _Request.objects.values('blood_group').annotate(count=Count('id'))
            demand_data = {item['blood_group']: item['count'] for item in request_counts}
        except Exception:
            # If Request isn't present or inaccessible, fall back to empty demand counts
            demand_data = {}
        # Compute available donors per blood group from profiles
        cutoff = date.today() - timedelta(days=DONOR_REST_WINDOW_DAYS)
        available_qs = UserProfile.objects.filter(models.Q(last_donation__isnull=True) | models.Q(last_donation__lt=cutoff))
        inventory_counts_qs = available_qs.values('blood_group').annotate(count=Count('id'))
        inventory_totals = {item['blood_group']: item['count'] for item in inventory_counts_qs}

        # Prepare small list of donor names per blood group for analytics
        names_map = {}
        blood_groups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
        for bg in blood_groups:
            profs = available_qs.filter(blood_group__iexact=bg).select_related('user')[:50]
            names_map[bg] = [ (f"{p.user.first_name} {p.user.last_name}".strip() or p.user.username) for p in profs ]

        response_data = {
            'blood_groups': blood_groups,
            'demand': [demand_data.get(bg, 0) for bg in blood_groups],
            'inventory': [inventory_totals.get(bg, 0) for bg in blood_groups],
            'available_names': [names_map.get(bg, []) for bg in blood_groups],
        }
        return Response(response_data)


class UserProfileView(APIView):
    # TASK: GET/PUT /api/profile/ — read/update current user's profile (auto-clear recency flags)
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = UserProfile.objects.get(user=request.user)
        except UserProfile.DoesNotExist:
            profile = UserProfile.objects.create(user=request.user)
        if profile.last_donation:
            cutoff = date.today() - timedelta(days=DONOR_REST_WINDOW_DAYS)
            # Only auto-clear flags if they were previously marked as recently donated by the system
            # Availability is computed solely from last_donation; no convenience flags are modified here.
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request):
        try:
            profile = UserProfile.objects.get(user=request.user)
        except UserProfile.DoesNotExist:
            profile = UserProfile.objects.create(user=request.user)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


# Login endpoint (returns JWT)
class LoginView(APIView):
    # TASK: POST /api/login/ — authenticate by username/email/full_name
    permission_classes = [AllowAny]

    def post(self, request):
        identifier = request.data.get('username') or request.data.get('full_name') or request.data.get('email')
        password = request.data.get('password')
        user = None
        if identifier:
            # Try direct username
            user = authenticate(username=identifier, password=password)
            if user is None:
                # Try email
                try:
                    from django.contrib.auth.models import User as DjangoUser
                    u = DjangoUser.objects.filter(email__iexact=identifier).first()
                    if u:
                        user = authenticate(username=u.username, password=password)
                except Exception:
                    user = None
            if user is None:
                # Try full name
                parts = (identifier or '').strip().split()
                if len(parts) >= 1:
                    first = parts[0]
                    last = ' '.join(parts[1:])
                    try:
                        from django.contrib.auth.models import User as DjangoUser
                        qs = DjangoUser.objects.filter(first_name__iexact=first)
                        if last:
                            qs = qs.filter(last_name__iexact=last)
                        candidates = list(qs[:2])
                        if len(candidates) == 1:
                            cand = candidates[0]
                            user = authenticate(username=cand.username, password=password)
                    except Exception:
                        user = None
        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({'refresh': str(refresh), 'access': str(refresh.access_token)})
        return Response({'error': 'Invalid credentials.'}, status=401)
