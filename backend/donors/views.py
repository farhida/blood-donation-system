from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Donor, Request, BloodInventory, Donation
from .serializers import DonorSerializer, RequestSerializer, BloodInventorySerializer, DonationSerializer
from django.db.models import Count

class DonorList(generics.ListCreateAPIView):
    queryset = Donor.objects.all()
    serializer_class = DonorSerializer
    permission_classes = [IsAuthenticated]

class RequestList(generics.ListCreateAPIView):
    queryset = Request.objects.all()
    serializer_class = RequestSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class BloodInventoryList(generics.ListCreateAPIView):
    queryset = BloodInventory.objects.all()
    serializer_class = BloodInventorySerializer
    permission_classes = [IsAuthenticated]

class DonationList(generics.ListCreateAPIView):
    queryset = Donation.objects.all()
    serializer_class = DonationSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class AnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Aggregate blood group demand from requests
        request_counts = Request.objects.values('blood_group').annotate(count=Count('id'))
        demand_data = {item['blood_group']: item['count'] for item in request_counts}

        # Aggregate inventory units by blood group
        inventory_data = BloodInventory.objects.values('blood_group').annotate(total_units=Count('units_available'))
        inventory_totals = {item['blood_group']: item['total_units'] for item in inventory_data}

        # Combine data for response
        blood_groups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
        response_data = {
            'blood_groups': blood_groups,
            'demand': [demand_data.get(bg, 0) for bg in blood_groups],
            'inventory': [inventory_totals.get(bg, 0) for bg in blood_groups],
        }
        return Response(response_data)