from rest_framework import generics
from .models import Donor
from .serializers import DonorSerializer

class DonorList(generics.ListCreateAPIView):
    queryset = Donor.objects.all()
    serializer_class = DonorSerializer