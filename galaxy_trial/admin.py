from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserCreationForm, UserChangeForm

from galaxy_trial.models import GalaxyUser


class MemberCreationForm(UserCreationForm):
    def clean_username(self):
        username = self.cleaned_data['username']
        try:
            self._meta.model._default_manager.get(username=username)
        except self._meta.model.DoesNotExist:
            return username
        raise forms.ValidationError(self.error_messages['duplicate_username'])

    class Meta:
        model = GalaxyUser
        fields = ('username',)


class MemberChangeForm(UserChangeForm):
    class Meta:
        model = GalaxyUser


class GalaxyUserAdmin(UserAdmin):
    form = MemberChangeForm
    add_form = MemberCreationForm

    list_display = UserAdmin.list_display + ('language',)
    fieldsets = UserAdmin.fieldsets + (
        ('Translation', {'fields': ('language',)}),
    )

admin.site.register(GalaxyUser, GalaxyUserAdmin)
