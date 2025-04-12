from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

def setup_signal(request):
    return JsonResponse({"message": "UWA Study Planner, Backend communication good!"})

@csrf_exempt
def save_user_info(request):
    if request.method == "POST":
        data = json.loads(request.body)
        print("Received data:", data)
        return JsonResponse({"message": "User info saved successfully!"})

    return JsonResponse({"error": "Invalid request"}, status=400)


def rules_set(request, ruleset):


    return JsonResponse({"error": "Invalid request"})


def units(request, unit_codes):
    pass