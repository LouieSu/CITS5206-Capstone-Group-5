from django.http import JsonResponse


def setup_signal(request):
    return JsonResponse({"message": "UWA Study Planner, Backend communication good!"})

