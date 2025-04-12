from django.urls import path
from .views import setup_signal, save_user_info, rules_set, units


urlpatterns = [
    path('setup_signal/', setup_signal),  # API available at /api/test/
]

urlpatterns = [
    path('api/save_user_info', save_user_info),
    path('ruleset/<str:ruleset>', view=rules_set, name="rule_set"),
    path('units/<str:unit_codes>', view=units, name="units"),

]
