from django.urls import path
from .views import RegisterView, UsernameAvailabilityView, MeView, AdminUserListView, AdminUserDetailView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('username-available/', UsernameAvailabilityView.as_view(), name='username-available'),
    path('me/', MeView.as_view(), name='me'),
    # admin
    path('admin/users/', AdminUserListView.as_view(), name='admin-users'),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
]