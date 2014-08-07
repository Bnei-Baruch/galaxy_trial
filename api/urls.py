from django.conf.urls import patterns, url

from api.views import ParticipantsAPI


urlpatterns = patterns(
    '',
    url(r'^participants/?$', ParticipantsAPI.as_view()),
)
