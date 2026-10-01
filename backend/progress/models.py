from django.db import models
from django.contrib.auth.models import User
from curriculum.models import Video


class VideoProgress(models.Model):
    STATUS_CHOICES = [
        ("not_started", "Not Started"),
        ("in_progress", "In Progress"),
        ("watched", "Watched"),
        ("reviewed", "Reviewed"),
        ("mastered", "Mastered"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="video_progress",
    )

    video = models.ForeignKey(
        Video,
        on_delete=models.CASCADE,
        related_name="progress_records",
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="not_started",
    )

    notes = models.TextField(blank=True)

    understanding_rating = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
    )

    needs_rewatch = models.BooleanField(default=False)

    watch_count = models.PositiveIntegerField(default=0)

    started_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    completed_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ["user", "video"]

    def __str__(self):
        return f"{self.user.username} - {self.video.title}"