from django.conf import settings
from django.shortcuts import render
from django.contrib.auth.views import redirect_to_login
from django.contrib.auth.decorators import login_required
from django.utils.cache import add_never_cache_headers
from django.template import RequestContext

from conference import nuve


# Initializing Nuve API
nuve_client = nuve.Nuve(**settings.NUVE_CONFIG)

# Getting a room
rooms = [room for room in nuve_client.getRooms()
         if room['name'] == settings.NUVE_ROOM_NAME]

if not rooms:
    room = nuve_client.createRoom(settings.NUVE_ROOM_NAME)
else:
    room = rooms[0]


def _get_role_page(request, role_name, user_name=None):
    """Creates a Nuve token and returns a page specific for the given role.
    """

    if request.user.groups.filter(name=role_name).exists():
        try:
            token = nuve_client.createToken(
                room['_id'], user_name or role_name, role_name)
        except Exception as e:
            context = dict(error=str(e))
            context_instance = RequestContext(request)
            response = render(request, 'service_down.html', context, context_instance=context_instance)
        else:
            context = dict(nuve_token=token)
            response = render(request, '{}.html'.format(role_name), context)
            add_never_cache_headers(response)
    else:
        response = redirect_to_login(request.get_full_path())
    return response


@login_required
def initiator(request):
    return _get_role_page(request, 'initiator')


@login_required
def participant(request):
    return _get_role_page(request, 'participant', request.user.username)


@login_required
def broadcaster(request):
    return _get_role_page(request, 'broadcaster')
