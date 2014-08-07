import json

from django.http import HttpResponse
from django.views.generic import View
from django.contrib.auth.models import User


class BaseAPIView(View):
    def dispatch(self, request, *args, **kwargs):
        result = super().dispatch(request, *args, **kwargs)
        return HttpResponse(json.dumps(result),
                            content_type='application/json')


class Participants(BaseAPIView):
    def get(self, request):
        participants = User.objects.filter(groups__name='participant')
        result = {
            'groups': [{
                'id': participant.username,
                'name': participant.get_full_name()
            } for participant in participants]
        }
        return result


class Presets(BaseAPIView):
    def get(self, request):
        participants = User.objects.filter(groups__name='participant')
        result = {
            'presets': [{
                'id': 1,
                'size': 1,
                'groups': [dict(id=participant.username)
                           for participant in participants]
            }]
        }
        return result
