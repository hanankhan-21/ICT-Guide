from rest_framework import serializers
from .models import Course, Module, Video, Concept


class ConceptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Concept
        fields = ["id", "name", "description"]


class VideoSerializer(serializers.ModelSerializer):
    concepts = ConceptSerializer(
        many=True,
        read_only=True,
    )

    module_id = serializers.IntegerField(
        source="module.id",
        read_only=True,
    )

    module_title = serializers.CharField(
        source="module.title",
        read_only=True,
    )

    course_code = serializers.CharField(
        source="module.course.code",
        read_only=True,
    )

    course_title = serializers.CharField(
        source="module.course.title",
        read_only=True,
    )

    class Meta:
        model = Video
        fields = [
            "id",
            "title",
            "video_id",
            "youtube_url",
            "playlist_title",
            "playlist_id",
            "order",
            "concepts",
            "transcript_status",
            "evidence_status",
            "notes",
            "is_required",

            "module_id",
            "module_title",
            "course_code",
            "course_title",
        ]


class ModuleSerializer(serializers.ModelSerializer):
    videos = VideoSerializer(many=True, read_only=True)

    class Meta:
        model = Module
        fields = [
            "id",
            "title",
            "description",
            "order",
            "videos",
        ]


class CourseSerializer(serializers.ModelSerializer):
    modules = ModuleSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = [
            "id",
            "code",
            "title",
            "description",
            "level",
            "order",
            "modules",
        ]