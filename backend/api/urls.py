from django.urls import path
from api.accounts import (
    RegisterView, MyProfileView, AdminUserListView, AdminUserDetailView,
)
from api.donors import (
    LoginView, PublicDonorSearch, BloodInventoryList, AnalyticsView, DashboardSummaryView,
)

urlpatterns = [
    # Authentication / account
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/me/', MyProfileView.as_view(), name='me'),

    # Admin user management (admin-only views)
    path('auth/admin/users/', AdminUserListView.as_view(), name='admin-users'),
    path('auth/admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),

    # Login (keeps existing donors.LoginView which supports username/email/full name)
    path('login/', LoginView.as_view(), name='login'),

    # Public donor search and inventory
    path('donors/search/', PublicDonorSearch.as_view(), name='public-donor-search'),
    path('inventory/', BloodInventoryList.as_view(), name='inventory-list'),

    # Dashboard / analytics
    path('dashboard-summary/', DashboardSummaryView.as_view(), name='dashboard-summary'),
    path('analytics/', AnalyticsView.as_view(), name='analytics'),
]
