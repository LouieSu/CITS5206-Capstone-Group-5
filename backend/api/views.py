from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from util.config_manager import get_ruleset, get_units, get_default_plan
from .validator.mit2024 import validate as validate_mit2024_func
from .validator.mit2025 import validate as validate_mit2025_func
from .validator.mds2024 import validate as validate_mds2024_func
from .validator.mds2025 import validate as validate_mds2025_func
from .suggestionbox.sugestionmit2024 import generate_suggestions_mit2024
from .suggestionbox.sugestionmit2025 import generate_suggestions_mit2025
from .suggestionbox.sugestionmds2024 import generate_suggestions_mds2024
from .suggestionbox.sugestionmds2025 import generate_suggestions_mds2025
from .validator.availability_and_prereq_checker import validate_study_plan

def setup_signal(request):
    """"
    Deprecated. used only in the project setting-up phase.
    """
    
    return JsonResponse({"message": "UWA Study Planner, Backend communication good!"})


def rules_set(request, ruleset_code):
    """
    Provide ruleset to frontend according to ruleset code provided. 
    :param ruleset_code, a single ruleset code
    :return a json object containing a ruleset
    """
    ruleset = get_ruleset(ruleset_code)
    # releset is guaranteed to be non-None
    return JsonResponse(ruleset)


def units(request, unit_codes):
    """
    Provide units to frontend along with all their prerequisites.
    :param unit_codes, a list of unit codes, separeted by ","
    :return a json object containing a list of units
    """
    if unit_codes is None:
        return JsonResponse({})
    codes = unit_codes.split(",")
    units = get_units(codes)
    # units is guaranteed to be non-None
    return JsonResponse(units)


def default_plan(request, ruleset_code, start, specialisation):
    """
    Provide a default plan when the user opened the app  without importing an existing plan
    :param ruleset_code, a single ruleset code
    :param start, the start year and semester of the plan requested.
    :param specialisation, if applicable, the specialisation of the plan. else none.
    :return a json object containing a list of units
    """
    return JsonResponse(get_default_plan(ruleset_code, start, specialisation))

@csrf_exempt
def validate_mit2024(request):
    return do_validation(request, validate_mit2024_func, generate_suggestions_mit2024)

    
@csrf_exempt
def validate_mit2025(request):
    return do_validation(request, validate_mit2025_func, generate_suggestions_mit2025)

    
@csrf_exempt
def validate_mds2024(request):
    return do_validation(request, validate_mds2024_func, generate_suggestions_mds2024)



@csrf_exempt
def validate_mds2025(request):
    return do_validation(request, validate_mds2025_func, generate_suggestions_mds2025)


def do_validation(request, valid_func, suggestion_func):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            timetable = data.get("timetable", [])
            starting_sem = data.get("starting_sem", None)
            if len(timetable) == 0:
                return JsonResponse({}, safe=False) 
            valid = valid_func(timetable) if len(timetable) > 0 else {}
            prereq = validate_study_plan(timetable, starting_sem) if starting_sem is not None else {}
            suggestions = suggestion_func(timetable) if suggestion_func is not None else {}
            result = {
                "validation": valid,
                "prereq": prereq,
                "suggestion": suggestions,
            }
            return JsonResponse(result, safe=False)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    else:
        return JsonResponse({"error": "Only POST method allowed"}, status=405)