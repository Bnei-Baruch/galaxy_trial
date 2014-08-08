from django.conf.urls import patterns, url


urlpatterns = patterns(
    '',
    url(r'^initiator/?$', 'conference.views.initiator', name='initiator'),
    url(r'^participant/?$', 'conference.views.participant', name='participant')
)
