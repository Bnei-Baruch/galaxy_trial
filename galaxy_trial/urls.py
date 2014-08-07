from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns(
    '',
    url(r'^$', 'galaxy_trial.views.index', name='index'),
    url(r'^initiator/?$', 'initiator.views.index', name='initiator_index'),
    url(r'^participant/?$', 'participant.views.index', name='participant_index'),
    url(r'^auth/', include('django.contrib.auth.urls')),
    url(r'^admin/', include(admin.site.urls)),
)
