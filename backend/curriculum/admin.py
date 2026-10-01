from django.contrib import admin
from .models import Course, Module, Video, Concept

admin.site.register(Course)
admin.site.register(Module)
admin.site.register(Video)
admin.site.register(Concept)