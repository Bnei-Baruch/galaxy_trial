from django.conf import settings
from django.shortcuts import render
from django.contrib.auth.decorators import login_required, user_passes_test

from conference import nuve


# Initializing Nuve API
nuve_client = nuve.Nuve(**settings.NUVE_CONFIG)

# Getting a room
rooms = nuve_client.getRooms()

if not rooms:
    room = nuve_client.createRoom(settings.NUVE_ROOM_NAME)
else:
    room = rooms[0]


def is_member_of(group_name):
    return lambda user: user.groups.filter(name=group_name).exists()


@login_required
@user_passes_test(is_member_of('initiator'))
def initiator(request):
    token = nuve_client.createToken(room['_id'], 'initiator', 'initiator')
    context = dict(nuve_token=token)
    return render(request, 'initiator.html', context)


@login_required
@user_passes_test(is_member_of('participant'))
def participant(request):
    token = nuve_client.createToken(room['_id'],
                                    request.user.username,
                                    'participant')
    context = dict(nuve_token=token)
    return render(request, 'participant.html', context)
