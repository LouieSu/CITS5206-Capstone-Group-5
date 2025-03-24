from django.urls import path
from .views import setup_signal

urlpatterns = [
    path('setup_signal/', setup_signal),  # API available at /api/test/
]
