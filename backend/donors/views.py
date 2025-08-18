
from rest_framework import generics, status, permissions
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Donor, Request, BloodInventory, Donation, UserProfile
from .serializers import DonorSerializer, RequestSerializer, BloodInventorySerializer, DonationSerializer, UserProfileSerializer
from django.db.models import Count, Q


# Public donor search (by blood group, no auth required)
class PublicDonorSearch(generics.ListAPIView):
    serializer_class = DonorSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        blood_group = self.request.query_params.get('blood_group')
        if blood_group:
            return Donor.objects.filter(blood_group__iexact=blood_group)
        return Donor.objects.all()

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
    queryset = Request.objects.all()
    serializer_class = RequestSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class RequestDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Request.objects.all()
    serializer_class = RequestSerializer
    permission_classes = [IsAuthenticated]


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
        serializer = UserProfileSerializer(profile, data=request.data)
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
        if not username or not password:
            return Response({'error': 'Username and password required.'}, status=400)
        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists.'}, status=400)
        user = User.objects.create_user(username=username, password=password, email=email)
        UserProfile.objects.create(user=user)
        return Response({'message': 'User registered successfully.'}, status=201)

# Login endpoint (returns JWT)
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
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