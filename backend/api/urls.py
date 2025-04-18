from django.urls import path
from .views import setup_signal, save_user_info, rules_set, units, default_plan


urlpatterns = [
    path('setup_signal/', setup_signal),  

    path('api/save_user_info', save_user_info),

    #restfule APIs providing ruleset and units.
    path('ruleset/<str:ruleset_code>', view=rules_set, name="rule_set"),
    path('units/<str:unit_codes>', view=units, name="units"),
    path('plan/<str:ruleset_code>/<str:start>/<str:specialisation>', view=default_plan, name="default_plan"),
]
