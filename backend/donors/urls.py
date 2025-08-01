from django.urls import path
from .views import DonorList

urlpatterns = [
    path('donors/', DonorList.as_view(), name='donor-list'),
]