import json

from django.http import HttpResponse
from django.views.generic import View
from django.contrib.auth.models import User


class BaseAPIView(View):
    pass


class ParticipantsAPI(View):
    def get(self, request):
        participants = User.objects.filter(groups__name='participant')
        result = dict(groups=[
            {
                'id': participant.username,
                'name': participant.get_full_name()
            } for participant in participants
        ])
        return HttpResponse(json.dumps(result),
                            content_type='application/json')
