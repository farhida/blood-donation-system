from django.urls import path
from .views import DonorList, RequestList

urlpatterns = [
    path('donors/', DonorList.as_view(), name='donor-list'),
    path('requests/', RequestList.as_view(), name='request-list'),
]