from django.conf import settings
from django.shortcuts import render
from django.contrib.auth.decorators import login_required, user_passes_test

from initiator import nuve


# Initializing Nuve API
nuve_client = nuve.Nuve(**settings.NUVE_CONFIG)

# Getting a room
rooms = nuve_client.getRooms()

if not rooms:
    room = nuve_client.createRoom(settings.NUVE_ROOM_NAME)
else:
    room = rooms[0]


@login_required
@user_passes_test(lambda user: user.groups.filter(name='initiator').exists())
def index(request):
    token = nuve_client.createToken(room['_id'], 'initiator', 'initiator')
    context = dict(nuve_token=token)
    return render(request, 'index.html', context)
