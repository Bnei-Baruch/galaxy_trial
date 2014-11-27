from django.db import models
from django.contrib.auth.models import AbstractUser


class GalaxyUser(AbstractUser):
    language = models.CharField(max_length=2, blank=True)
