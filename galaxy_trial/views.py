from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect


@login_required
def index(request):
    """Redirects users based on whether they are in the admins group.
    """

    if request.user.groups.filter(name='initiator').exists():
        return redirect('initiator')
    else:
        return redirect('participant')
