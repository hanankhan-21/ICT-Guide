from rest_framework import serializers
from .models import VideoProgress


class VideoProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoProgress
        fields = [
            "id",
            "video",
            "status",
            "notes",
            "understanding_rating",
            "needs_rewatch",
            "watch_count",
            "started_at",
            "completed_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "video",
            "updated_at",
        ]
        