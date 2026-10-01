from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from curriculum.models import Video
from .models import VideoProgress
from .serializers import VideoProgressSerializer


def get_tracker_user():
    user = User.objects.order_by("id").first()

    if user:
        return user

    user = User.objects.create(username="tracker")
    user.set_unusable_password()
    user.save()

    return user


class VideoProgressView(APIView):

    def get(self, request, video_id):
        user = get_tracker_user()

        video = get_object_or_404(
            Video,
            id=video_id,
        )

        progress, _ = VideoProgress.objects.get_or_create(
            user=user,
            video=video,
        )

        serializer = VideoProgressSerializer(progress)

        return Response(serializer.data)

    def patch(self, request, video_id):
        user = get_tracker_user()

        video = get_object_or_404(
            Video,
            id=video_id,
        )

        progress, _ = VideoProgress.objects.get_or_create(
            user=user,
            video=video,
        )

        old_status = progress.status

        serializer = VideoProgressSerializer(
            progress,
            data=request.data,
            partial=True,
        )

        serializer.is_valid(raise_exception=True)

        progress = serializer.save()

        if (
            progress.status == "in_progress"
            and progress.started_at is None
        ):
            progress.started_at = timezone.now()

        if (
            progress.status in ["watched", "reviewed", "mastered"]
            and progress.completed_at is None
        ):
            progress.completed_at = timezone.now()

        if (
            progress.status == "watched"
            and old_status != "watched"
        ):
            progress.watch_count += 1

        progress.save()

        return Response(
            VideoProgressSerializer(progress).data,
            status=status.HTTP_200_OK,
        )


class ProgressSummaryView(APIView):

    def get(self, request):
        user = get_tracker_user()

        total_videos = Video.objects.count()

        watched_videos = VideoProgress.objects.filter(
            user=user,
            status__in=[
                "watched",
                "reviewed",
                "mastered",
            ],
        ).count()

        needs_rewatch = VideoProgress.objects.filter(
            user=user,
            needs_rewatch=True,
        ).count()

        if total_videos > 0:
            completion_percentage = round(
                (watched_videos / total_videos) * 100,
                1,
            )
        else:
            completion_percentage = 0

        completed_video_ids = VideoProgress.objects.filter(
            user=user,
            status__in=[
                "watched",
                "reviewed",
                "mastered",
            ],
        ).values_list(
            "video_id",
            flat=True,
        )

        next_video = (
            Video.objects
            .exclude(id__in=completed_video_ids)
            .select_related(
                "module",
                "module__course",
            )
            .order_by(
                "module__course__order",
                "module__order",
                "order",
            )
            .first()
        )

        next_lesson = None

        if next_video:
            next_lesson = {
                "id": next_video.id,
                "title": next_video.title,
                "course": next_video.module.course.title,
                "course_code": next_video.module.course.code,
                "module": next_video.module.title,
            }

        return Response({
            "total_videos": total_videos,
            "watched_videos": watched_videos,
            "remaining_videos": total_videos - watched_videos,
            "completion_percentage": completion_percentage,
            "needs_rewatch": needs_rewatch,
            "next_lesson": next_lesson,
        })

class AllVideoProgressView(APIView):

    def get(self, request):
        user = get_tracker_user()

        records = VideoProgress.objects.filter(
            user=user
        ).values(
            "video_id",
            "status",
            "needs_rewatch",
        )

        return Response(list(records))