from django.db import models


class Course(models.Model):
    LEVEL_CHOICES = [
        ("orientation", "Orientation"),
        ("foundation", "Foundation"),
        ("intermediate", "Intermediate"),
        ("applied", "Applied Core"),
        ("advanced", "Advanced"),
    ]

    code = models.CharField(max_length=20, unique=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    level = models.CharField(
        max_length=20,
        choices=LEVEL_CHOICES,
        default="foundation",
    )

    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.code} - {self.title}"


class Module(models.Model):
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="modules",
    )

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.course.code} - {self.title}"


class Concept(models.Model):
    name = models.CharField(max_length=200, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Video(models.Model):
    module = models.ForeignKey(
        Module,
        on_delete=models.CASCADE,
        related_name="videos",
    )

    title = models.CharField(max_length=500)

    video_id = models.CharField(
        max_length=50,
        unique=True,
    )

    youtube_url = models.URLField(max_length=500)

    playlist_title = models.CharField(
        max_length=500,
        blank=True,
    )

    playlist_id = models.CharField(
        max_length=100,
        blank=True,
    )

    order = models.PositiveIntegerField(default=0)

    concepts = models.ManyToManyField(
        Concept,
        related_name="videos",
        blank=True,
    )

    transcript_status = models.CharField(
        max_length=100,
        blank=True,
    )

    evidence_status = models.CharField(
        max_length=100,
        blank=True,
    )

    notes = models.TextField(blank=True)

    is_required = models.BooleanField(default=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.title