from django.urls import path
from .views import RegisterView, UsernameAvailabilityView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('username-available/', UsernameAvailabilityView.as_view(), name='username-available'),
]