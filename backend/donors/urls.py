from django.urls import path
from .views import (
    PublicDonorSearch,
    BloodInventoryList,
    AnalyticsView, UserProfileView, DashboardSummaryView,
    LoginView,
)

urlpatterns = [
    # Minimal donor endpoints used by the frontend
    path('login/', LoginView.as_view(), name='login'),
    path('donors/search/', PublicDonorSearch.as_view(), name='public-donor-search'),
    path('inventory/', BloodInventoryList.as_view(), name='inventory-list'),
    path('analytics/', AnalyticsView.as_view(), name='analytics'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('dashboard-summary/', DashboardSummaryView.as_view(), name='dashboard-summary'),
]