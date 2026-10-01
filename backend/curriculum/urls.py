from django.urls import path

from .views import (
    CourseListView,
    CourseDetailView,
    ModuleDetailView,
    VideoDetailView,
)

urlpatterns = [
    path("courses/", CourseListView.as_view(), name="course-list"),
    path("courses/<int:pk>/", CourseDetailView.as_view(), name="course-detail"),
    path("modules/<int:pk>/", ModuleDetailView.as_view(), name="module-detail"),
    path("videos/<int:pk>/", VideoDetailView.as_view(), name="video-detail"),
]