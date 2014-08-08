from django.conf.urls import patterns, url

from api.views import Participants, Presets


urlpatterns = patterns(
    '',
    url(r'^participants/?$', Participants.as_view()),
    url(r'^presets/?$', Presets.as_view()),
)
