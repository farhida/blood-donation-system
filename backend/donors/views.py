"""
Donors app views

This module implements the core donor-facing APIs used by the frontend:

- PublicDonorSearch: public listing of available donors filtered by blood group/district.
- Request endpoints: create/list/manage blood requests. When a request is created,
    matching available donors receive Notification records.
- BloodInventoryList: a computed view that returns currently available donors (not a DB-backed inventory table).
- Donation, DashboardSummary, Analytics: utility endpoints for user dashboards and simple analytics.

Business rules:
- Donor availability is governed by `not_ready` and a 90-day `last_donation` window. A donor is available only if
    `not_ready` is False and their `last_donation` is either null or older than 90 days.

"""

from rest_framework import generics, status, permissions
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Request, BloodInventory, Donation, UserProfile, Notification
from .serializers import RequestSerializer, BloodInventorySerializer, DonationSerializer, UserProfileSerializer, PublicDonorProfileSerializer, NotificationSerializer
from django.db.models import Count, Sum
from django.db import models
from datetime import date, timedelta


# Public donor search (by blood group, no auth required)
class PublicDonorSearch(generics.ListAPIView):
    serializer_class = PublicDonorProfileSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        blood_group = self.request.query_params.get('blood_group')
        district = self.request.query_params.get('district')
        three_months_ago = date.today() - timedelta(days=90)
        qs = UserProfile.objects.select_related('user').all()
        if blood_group:
            qs = qs.filter(blood_group__iexact=blood_group)
        if district:
            qs = qs.filter(district__iexact=district)
        # Exclude donors marked not ready and those whose last donation is within 3 months
        # Note: we rely on last_donation window so donors become available again automatically after 3 months
        qs = qs.filter(
            not_ready=False
        ).filter(
            models.Q(last_donation__isnull=True) | models.Q(last_donation__lt=three_months_ago)
        )
        return qs


class RequestList(generics.ListCreateAPIView):
    queryset = Request.objects.all().order_by('-created_at')
    serializer_class = RequestSerializer
    # Anyone can list, only authenticated can create
    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        req = serializer.save(user=self.request.user)
        # Create notifications to matching donors (same blood group and available)
        three_months_ago = date.today() - timedelta(days=90)
        matching = UserProfile.objects.select_related('user').filter(
            blood_group__iexact=req.blood_group,
            not_ready=False,
        ).filter(
            models.Q(last_donation__isnull=True) | models.Q(last_donation__lt=three_months_ago)
        )
        for prof in matching:
            Notification.objects.create(
                user=prof.user,
                request=req,
                message="Blood needed"
            )

class RequestDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Request.objects.all()
    serializer_class = RequestSerializer
    permission_classes = [IsAuthenticated]

class AcceptRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        req = Request.objects.filter(pk=pk).first()
        if not req:
            return Response({'error': 'Request not found'}, status=404)
        if req.status != 'open':
            return Response({'error': 'Request is not open'}, status=400)
        req.status = 'accepted'
        req.accepted_by = request.user
        req.save()
        # Notify requester with acceptor contact details
        acceptor = request.user
        full_name = f"{acceptor.first_name} {acceptor.last_name}".strip() or acceptor.username
        contact_email = acceptor.email
        contact_phone = None
        try:
            prof = UserProfile.objects.get(user=acceptor)
            contact_phone = prof.phone if getattr(prof, 'share_phone', False) else None
        except UserProfile.DoesNotExist:
            contact_phone = None
        contact_bits = [b for b in [contact_email, contact_phone] if b]
        contact_str = " | ".join(contact_bits) if contact_bits else ""
        msg = f"Your request was accepted by {full_name}." + (f" Contact: {contact_str}" if contact_str else "")
        Notification.objects.create(
            user=req.user,
            request=req,
            message=msg
        )
        return Response({'status': 'accepted'})

class MarkCollectedView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        req = Request.objects.filter(pk=pk, user=request.user).first()
        if not req:
            return Response({'error': 'Request not found or not owned by user'}, status=404)
        if req.status != 'accepted':
            return Response({'error': 'Request must be accepted before collection'}, status=400)
        req.status = 'collected'
        req.save()
        # Record donation for the accepting donor and update their profile
        if req.accepted_by:
            try:
                Donation.objects.create(
                    user=req.accepted_by,
                    blood_group=req.blood_group,
                    hospital=req.hospital or req.city or 'Unknown'
                )
            except Exception:
                pass
            try:
                prof, _ = UserProfile.objects.get_or_create(user=req.accepted_by)
                prof.last_donation = date.today()
                # Mark as recently donated and temporarily not ready
                prof.donated_recently = True
                prof.not_ready = True
                prof.save()
            except Exception:
                pass
        # Notify accepter
        if req.accepted_by:
            Notification.objects.create(
                user=req.accepted_by,
                request=req,
                message="Requester marked the request as collected"
            )
        # Remove all notifications related to this request from all users
        Notification.objects.filter(request=req).delete()
        return Response({'status': 'collected'})

class MyRequestsView(generics.ListAPIView):
    serializer_class = RequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Request.objects.filter(user=self.request.user).order_by('-created_at')

class NotificationsView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Notification.objects.filter(user=self.request.user)
        qs = qs.exclude(request__status='collected')
        return qs.order_by('-created_at')


class BloodInventoryList(generics.ListCreateAPIView):
    queryset = BloodInventory.objects.all()
    serializer_class = BloodInventorySerializer
    permission_classes = [IsAuthenticated]

    # Override list to return computed available donors instead of DB inventory rows.
    def list(self, request, *args, **kwargs):
        three_months_ago = date.today() - timedelta(days=90)
        available = UserProfile.objects.select_related('user').filter(
            not_ready=False
        ).filter(
            models.Q(last_donation__isnull=True) | models.Q(last_donation__lt=three_months_ago)
        )
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
    queryset = BloodInventory.objects.all()
    serializer_class = BloodInventorySerializer
    permission_classes = [IsAuthenticated]


class DonationList(generics.ListCreateAPIView):
    serializer_class = DonationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Donation.objects.filter(user=self.request.user).order_by('-donation_date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class DonationDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Donation.objects.all()
    serializer_class = DonationSerializer
    permission_classes = [IsAuthenticated]

class DashboardSummaryView(APIView):
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
        return Response(data)

class AnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Aggregate total requests per blood group
        request_counts = Request.objects.values('blood_group').annotate(count=Count('id'))
        demand_data = {item['blood_group']: item['count'] for item in request_counts}

        # Compute available donors per blood group from profiles (not recently donated and not marked not_ready)
        three_months_ago = date.today() - timedelta(days=90)
        available_qs = UserProfile.objects.filter(
            not_ready=False
        ).filter(
            models.Q(last_donation__isnull=True) | models.Q(last_donation__lt=three_months_ago)
        )
        inventory_counts_qs = available_qs.values('blood_group').annotate(count=Count('id'))
        inventory_totals = {item['blood_group']: item['count'] for item in inventory_counts_qs}
        # Also prepare a small list of donor names per blood group for analytics
        names_map = {}
        blood_groups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
        for bg in blood_groups:
            profs = available_qs.filter(blood_group__iexact=bg).select_related('user')[:50]
            names_map[bg] = [ (f"{p.user.first_name} {p.user.last_name}".strip() or p.user.username) for p in profs ]

        blood_groups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
        response_data = {
            'blood_groups': blood_groups,
            'demand': [demand_data.get(bg, 0) for bg in blood_groups],
            'inventory': [inventory_totals.get(bg, 0) for bg in blood_groups],
            'available_names': [names_map.get(bg, []) for bg in blood_groups],
        }
        return Response(response_data)


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = UserProfile.objects.get(user=request.user)
        except UserProfile.DoesNotExist:
            profile = UserProfile.objects.create(user=request.user)
        # Auto-clear recency flags after 90 days so donor becomes available again
        if profile.last_donation:
            three_months_ago = date.today() - timedelta(days=90)
            if profile.last_donation <= three_months_ago and (profile.donated_recently or profile.not_ready):
                profile.donated_recently = False
                profile.not_ready = False
                profile.save()
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
    permission_classes = [AllowAny]

    def post(self, request):
        identifier = request.data.get('username') or request.data.get('full_name') or request.data.get('email')
        password = request.data.get('password')
        # Allow login via username, email, or full name
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
                # Try full name: split to first/last and match case-insensitively
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
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        return Response({'error': 'Invalid credentials.'}, status=401)

## Removed legacy donor CRUD, matching-requests helper, and message endpoint for concision