from django.urls import path

from .views import (
    VideoProgressView,
    ProgressSummaryView,
    AllVideoProgressView,
)


urlpatterns = [
    path(
        "video/<int:video_id>/",
        VideoProgressView.as_view(),
        name="video-progress",
    ),

    path(
        "summary/",
        ProgressSummaryView.as_view(),
        name="progress-summary",
    ),

    path(
        "all/",
        AllVideoProgressView.as_view(),
        name="all-progress",
    ),
]