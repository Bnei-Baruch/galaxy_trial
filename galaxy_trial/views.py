from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect


@login_required
def index(request):
    """Redirects users to a view depending on their role.
    """

    for group_name in ('initiator', 'broadcaster'):
        if request.user.groups.filter(name=group_name).exists():
            return redirect(group_name)
    return redirect('participant')
