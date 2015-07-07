from django.conf.urls import patterns, url


urlpatterns = patterns(
    '',
    url(r'^initiator/?$',
        'conference.views.initiator', name='initiator'),
    url(r'^participant/?$',
        'conference.views.participant', name='participant'),
    url(r'^broadcaster/?$',
        'conference.views.broadcaster', name='broadcaster'),
    url(r'^translator/?$',
        'conference.views.translator', name='translator'),
    url(r'^player/?$',
        'conference.views.player', name='player')
)
