from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from galaxy_trial.models import GalaxyUser


class GalaxyUserAdmin(UserAdmin):
    model = GalaxyUser

    list_display = UserAdmin.list_display + ('language',)
    fieldsets = UserAdmin.fieldsets + (
        ('Translation', {'fields': ('language',)}),
    )

admin.site.register(GalaxyUser, GalaxyUserAdmin)
