from django.urls import path
from .views import setup_signal, save_user_info

urlpatterns = [
    path('setup_signal/', setup_signal),  # API available at /api/test/
]

urlpatterns = [
    path('api/save_user_info', save_user_info),
]
