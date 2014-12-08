import json

from django.http import HttpResponse
from django.views.generic import View

from galaxy_trial.models import GalaxyUser


class BaseAPIView(View):
    def dispatch(self, request, *args, **kwargs):
        result = super().dispatch(request, *args, **kwargs)
        return HttpResponse(json.dumps(result),
                            content_type='application/json')


class Participants(BaseAPIView):
    def get(self, request):
        participants = GalaxyUser.objects.filter(groups__name='participant')
        result = {
            'groups': [{
                'id': participant.username,
                'name': participant.get_full_name()
            } for participant in participants]
        }
        return result


class Presets(BaseAPIView):
    def get(self, request):
        result = {
            'presets': []
        }
        return result
