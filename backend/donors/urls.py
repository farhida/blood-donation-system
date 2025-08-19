from django.urls import path
from .views import (
    PublicDonorSearch,
    RequestList, RequestDetail, AcceptRequestView, MarkCollectedView, MyRequestsView, NotificationsView,
    BloodInventoryList, BloodInventoryDetail,
    DonationList, DonationDetail,
    AnalyticsView, UserProfileView, DashboardSummaryView,
    LoginView
)

urlpatterns = [
    # Auth
    path('login/', LoginView.as_view(), name='login'),

    # Donors (public search only)
    path('donors/search/', PublicDonorSearch.as_view(), name='public-donor-search'),

    # Requests
    path('requests/', RequestList.as_view(), name='request-list'),
    path('requests/<int:pk>/', RequestDetail.as_view(), name='request-detail'),
    path('requests/<int:pk>/accept/', AcceptRequestView.as_view(), name='request-accept'),
    path('requests/<int:pk>/collected/', MarkCollectedView.as_view(), name='request-collected'),
    path('requests/mine/', MyRequestsView.as_view(), name='my-requests'),

    # Notifications
    path('notifications/', NotificationsView.as_view(), name='notifications'),

    # Inventory
    path('inventory/', BloodInventoryList.as_view(), name='inventory-list'),
    path('inventory/<int:pk>/', BloodInventoryDetail.as_view(), name='inventory-detail'),

    # Donations
    path('donations/', DonationList.as_view(), name='donation-list'),
    path('donations/<int:pk>/', DonationDetail.as_view(), name='donation-detail'),

    # Analytics & Profile
    path('analytics/', AnalyticsView.as_view(), name='analytics'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('dashboard-summary/', DashboardSummaryView.as_view(), name='dashboard-summary'),
]