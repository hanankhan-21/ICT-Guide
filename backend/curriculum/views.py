from rest_framework import generics

from .models import Course, Module, Video
from .serializers import (
    CourseSerializer,
    ModuleSerializer,
    VideoSerializer,
)


class CourseListView(generics.ListAPIView):
    queryset = Course.objects.prefetch_related(
        "modules__videos__concepts"
    )
    serializer_class = CourseSerializer


class CourseDetailView(generics.RetrieveAPIView):
    queryset = Course.objects.prefetch_related(
        "modules__videos__concepts"
    )
    serializer_class = CourseSerializer


class ModuleDetailView(generics.RetrieveAPIView):
    queryset = Module.objects.prefetch_related(
        "videos__concepts"
    )
    serializer_class = ModuleSerializer


class VideoDetailView(generics.RetrieveAPIView):
    queryset = Video.objects.prefetch_related("concepts")
    serializer_class = VideoSerializer