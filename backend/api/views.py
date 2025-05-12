from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from util.config_manager import get_ruleset, get_units, get_default_plan
from .validator.mit2024 import validate as validate_mit2024_func
from .validator.mit2025 import validate as validate_mit2025_func
from .validator.mds2024 import validate as validate_mds2024_func
from .validator.mds2025 import validate as validate_mds2025_func
from .validator.availability_and_prereq_checker import validate_study_plan

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

@csrf_exempt
def validate_mit2024(request):
    return do_validation(request, validate_mit2024_func)

    
@csrf_exempt
def validate_mit2025(request):
    return do_validation(request, validate_mit2025_func)

    
@csrf_exempt
def validate_mds2024(request):
    return do_validation(request, validate_mds2024_func)


@csrf_exempt
def validate_mds2025(request):
    return do_validation(request, validate_mds2025_func)


def do_validation(request, func):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            timetable = data.get("timetable", [])
            starting_sem = data.get("starting_sem", None)
            if len(timetable) == 0:
                return JsonResponse({}, safe=False) 
            valid = func(timetable) if len(timetable) > 0 else {}
            prereq = validate_study_plan(timetable, starting_sem) if starting_sem is not None else {}
            result = {
                "validation": valid,
                "prereq": prereq
            }
            return JsonResponse(result, safe=False)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    else:
        return JsonResponse({"error": "Only POST method allowed"}, status=405)