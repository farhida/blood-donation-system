from django.urls import path
from .views import (
    DonorList, DonorDetail, PublicDonorSearch, MessageDonorView,
    RequestList, RequestDetail,
    BloodInventoryList, BloodInventoryDetail,
    DonationList, DonationDetail,
    AnalyticsView, UserProfileView,
    RegisterView, LoginView
)

urlpatterns = [
    # Auth
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),

    # Donors
    path('donors/', DonorList.as_view(), name='donor-list'),
    path('donors/<int:pk>/', DonorDetail.as_view(), name='donor-detail'),
    path('donors/search/', PublicDonorSearch.as_view(), name='public-donor-search'),
    path('donors/<int:donor_id>/message/', MessageDonorView.as_view(), name='message-donor'),

    # Requests
    path('requests/', RequestList.as_view(), name='request-list'),
    path('requests/<int:pk>/', RequestDetail.as_view(), name='request-detail'),

    # Inventory
    path('inventory/', BloodInventoryList.as_view(), name='inventory-list'),
    path('inventory/<int:pk>/', BloodInventoryDetail.as_view(), name='inventory-detail'),

    # Donations
    path('donations/', DonationList.as_view(), name='donation-list'),
    path('donations/<int:pk>/', DonationDetail.as_view(), name='donation-detail'),

    # Analytics & Profile
    path('analytics/', AnalyticsView.as_view(), name='analytics'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
]