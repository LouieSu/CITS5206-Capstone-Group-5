from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from util.config_manager import get_ruleset, get_units, get_default_plan

def setup_signal(request):
    return JsonResponse({"message": "UWA Study Planner, Backend communication good!"})

@csrf_exempt
def save_user_info(request):
    if request.method == "POST":
        data = json.loads(request.body)
        print("Received data:", data)
        return JsonResponse({"message": "User info saved successfully!"})

    return JsonResponse({"error": "Invalid request"}, status=400)


def rules_set(request, ruleset_code):
    ruleset = get_ruleset(ruleset_code)
    # releset is guaranteed to be non-None
    return JsonResponse(ruleset)


def units(request, unit_codes):
    if unit_codes is None:
        return JsonResponse({})
    codes = unit_codes.split(",")
    units = get_units(codes)
    # units is guaranteed to be non-None
    return JsonResponse(units)


def default_plan(request, ruleset_code, start, specialisation):
    return JsonResponse(get_default_plan(ruleset_code, start, specialisation))

