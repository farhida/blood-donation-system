
from rest_framework import generics, status, permissions
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Donor, Request, BloodInventory, Donation, UserProfile, Notification
from .serializers import DonorSerializer, RequestSerializer, BloodInventorySerializer, DonationSerializer, UserProfileSerializer, PublicDonorProfileSerializer, NotificationSerializer
from django.db.models import Count, Q
from django.db import models


# Public donor search (by blood group, no auth required)
class PublicDonorSearch(generics.ListAPIView):
    serializer_class = PublicDonorProfileSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        from datetime import date, timedelta
        blood_group = self.request.query_params.get('blood_group')
        district = self.request.query_params.get('district')
        three_months_ago = date.today() - timedelta(days=90)
        qs = UserProfile.objects.select_related('user').all()
        if blood_group:
            qs = qs.filter(blood_group__iexact=blood_group)
        if district:
            qs = qs.filter(district__iexact=district)
        # Exclude donors marked not ready or recently donated
        qs = qs.filter(not_ready=False, donated_recently=False)
        # Keep the original last_donation logic as a fallback (still show if none or older than 3 months)
        qs = qs.filter(models.Q(last_donation__isnull=True) | models.Q(last_donation__lt=three_months_ago))
        return qs

# Full CRUD for Donor (auth required for create/update/delete)
class DonorList(generics.ListCreateAPIView):
    queryset = Donor.objects.all()
    serializer_class = DonorSerializer
    permission_classes = [IsAuthenticated]

class DonorDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Donor.objects.all()
    serializer_class = DonorSerializer
    permission_classes = [IsAuthenticated]


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
        matching = UserProfile.objects.select_related('user').filter(
            blood_group__iexact=req.blood_group,
            not_ready=False,
            donated_recently=False,
        )
        for prof in matching:
            Notification.objects.create(
                user=prof.user,
                request=req,
                message=f"Blood request for {req.blood_group} at {req.hospital or req.city or 'unknown location'}"
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
        # Notify requester
        Notification.objects.create(
            user=req.user,
            request=req,
            message=f"Your request has been accepted by {request.user.username}"
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
        # Notify accepter
        if req.accepted_by:
            Notification.objects.create(
                user=req.accepted_by,
                request=req,
                message=f"Requester marked the request as collected"
            )
        return Response({'status': 'collected'})

class MyRequestsView(generics.ListAPIView):
    serializer_class = RequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Request.objects.filter(user=self.request.user).order_by('-created_at')

class MatchingRequestsView(generics.ListAPIView):
    serializer_class = RequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            profile = UserProfile.objects.get(user=self.request.user)
        except UserProfile.DoesNotExist:
            return Request.objects.none()
        return Request.objects.filter(
            blood_group__iexact=profile.blood_group,
            status='open'
        ).order_by('-created_at')

class NotificationsView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')


class BloodInventoryList(generics.ListCreateAPIView):
    queryset = BloodInventory.objects.all()
    serializer_class = BloodInventorySerializer
    permission_classes = [IsAuthenticated]

class BloodInventoryDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = BloodInventory.objects.all()
    serializer_class = BloodInventorySerializer
    permission_classes = [IsAuthenticated]


class DonationList(generics.ListCreateAPIView):
    queryset = Donation.objects.all()
    serializer_class = DonationSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class DonationDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Donation.objects.all()
    serializer_class = DonationSerializer
    permission_classes = [IsAuthenticated]


class AnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        request_counts = Request.objects.values('blood_group').annotate(count=Count('id'))
        demand_data = {item['blood_group']: item['count'] for item in request_counts}
        inventory_data = BloodInventory.objects.values('blood_group').annotate(total_units=Count('units_available'))
        inventory_totals = {item['blood_group']: item['total_units'] for item in inventory_data}
        blood_groups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
        response_data = {
            'blood_groups': blood_groups,
            'demand': [demand_data.get(bg, 0) for bg in blood_groups],
            'inventory': [inventory_totals.get(bg, 0) for bg in blood_groups],
        }
        return Response(response_data)


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = UserProfile.objects.get(user=request.user)
        except UserProfile.DoesNotExist:
            profile = UserProfile.objects.create(user=request.user)
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

# Registration endpoint
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email')
        blood_group = request.data.get('blood_group')
        last_donation = request.data.get('last_donation')
        if not username or not password:
            return Response({'error': 'Username and password required.'}, status=400)
        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists.'}, status=400)
        user = User.objects.create_user(username=username, password=password, email=email)
        profile, _ = UserProfile.objects.get_or_create(user=user)
        if blood_group:
            profile.blood_group = blood_group
        if last_donation:
            profile.last_donation = last_donation
        profile.save()
        return Response({'message': 'User registered successfully.'}, status=201)

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

# Messaging endpoint (send message to donor)
class MessageDonorView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, donor_id):
        donor = Donor.objects.filter(id=donor_id).first()
        if not donor:
            return Response({'error': 'Donor not found.'}, status=404)
        message = request.data.get('message')
        contact = request.data.get('contact')
        # In a real app, send email/SMS here. For now, just return success.
        return Response({'message': f'Message sent to {donor.name} (simulated).', 'donor_contact': donor.phone})