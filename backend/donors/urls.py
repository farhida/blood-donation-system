from django.urls import path
from .views import DonorList

urlpatterns = [
    path('donors/', DonorList.as_view(), name='donor-list'),
]

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('donors.urls')),
]