from django.shortcuts import render
from django.contrib.auth.decorators import login_required, user_passes_test


@login_required
@user_passes_test(lambda user: user.groups.filter(name='initiator').exists())
def index(request):
    context = {}
    return render(request, 'index.html', context)
