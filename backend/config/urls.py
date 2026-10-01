from django.contrib import admin
from django.urls import path, include


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("curriculum.urls")),
    path("api/progress/", include("progress.urls")),
]