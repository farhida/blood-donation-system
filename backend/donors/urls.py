from django.urls import path
from .views import DonorList, RequestList, BloodInventoryList, DonationList

urlpatterns = [
    path('donors/', DonorList.as_view(), name='donor-list'),
    path('requests/', RequestList.as_view(), name='request-list'),
    path('inventory/', BloodInventoryList.as_view(), name='inventory-list'),
    path('donations/', DonationList.as_view(), name='donation-list'),
]