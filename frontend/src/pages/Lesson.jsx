
import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../services/api";

function Lesson() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [video, setVideo] = useState(null);
  const [progress, setProgress] = useState(null);

  const [previousLesson, setPreviousLesson] =
    useState(null);

  const [nextLesson, setNextLesson] =
    useState(null);

  const [lessonPosition, setLessonPosition] =
    useState(null);

  const [totalLessons, setTotalLessons] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadLesson = async () => {
      try {
        setLoading(true);
        setError("");

        const videoResponse = await api.get(
          `videos/${id}/`
        );

        const currentVideo =
          videoResponse.data;

        setVideo(currentVideo);

        const [
          progressResponse,
          moduleResponse,
        ] = await Promise.all([
          api.get(
            `progress/video/${id}/`
          ),

          api.get(
            `modules/${currentVideo.module_id}/`
          ),
        ]);

        setProgress(
          progressResponse.data
        );

        const lessons =
          moduleResponse.data.videos || [];

        const currentIndex =
          lessons.findIndex(
            (lesson) =>
              lesson.id ===
              currentVideo.id
          );

        if (currentIndex !== -1) {
          setLessonPosition(
            currentIndex + 1
          );

          setTotalLessons(
            lessons.length
          );

          if (currentIndex > 0) {
            setPreviousLesson(
              lessons[currentIndex - 1]
            );
          } else {
            setPreviousLesson(null);
          }

          if (
            currentIndex <
            lessons.length - 1
          ) {
            setNextLesson(
              lessons[currentIndex + 1]
            );
          } else {
            setNextLesson(null);
          }
        }
      } catch (err) {
        console.error(
          "Lesson loading error:",
          err
        );

        setError(
          "Could not load lesson."
        );
      } finally {
        setLoading(false);
      }
    };

    loadLesson();
  }, [id]);

  const markWatched = async () => {
    try {
      setSaving(true);
      setError("");

      const response =
        await api.patch(
          `progress/video/${id}/`,
          {
            status: "watched",
          }
        );

      setProgress(
        response.data
      );
    } catch (err) {
      console.error(err);

      setError(
        "Could not update progress."
      );
    } finally {
      setSaving(false);
    }
  };

  const saveNotes = async () => {
    try {
      setSaving(true);
      setError("");

      const response =
        await api.patch(
          `progress/video/${id}/`,
          {
            notes:
              progress?.notes || "",
          }
        );

      setProgress(
        response.data
      );
    } catch (err) {
      console.error(err);

      setError(
        "Could not save notes."
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleRewatch = async () => {
    try {
      setSaving(true);
      setError("");

      const response =
        await api.patch(
          `progress/video/${id}/`,
          {
            needs_rewatch:
              !progress?.needs_rewatch,
          }
        );

      setProgress(
        response.data
      );
    } catch (err) {
      console.error(err);

      setError(
        "Could not update rewatch status."
      );
    } finally {
      setSaving(false);
    }
  };

  const completeAndNext =
    async () => {
      try {
        setSaving(true);

        await api.patch(
          `progress/video/${id}/`,
          {
            status: "watched",
          }
        );

        if (nextLesson) {
          navigate(
            `/lesson/${nextLesson.id}`
          );
        }
      } catch (err) {
        console.error(err);

        setError(
          "Could not complete lesson."
        );
      } finally {
        setSaving(false);
      }
    };

  const isCompleted = [
    "watched",
    "reviewed",
    "mastered",
  ].includes(progress?.status);

  if (loading) {
    return (
      <div className="card">
        <p>
          Loading lesson...
        </p>
      </div>
    );
  }

  if (error && !video) {
    return (
      <div className="card">
        <h2>
          Could not load lesson
        </h2>

        <p className="muted">
          {error}
        </p>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="card">
        <h2>
          Lesson not found.
        </h2>
      </div>
    );
  }

  return (
    <div className="lesson-page">

      <Link
        to={`/module/${video.module_id}`}
        className="back-link"
      >
        ← Back to Module
      </Link>

      <div
        style={{
          marginBottom: "20px",
        }}
      >
        <div
          className="muted"
          style={{
            fontSize: "13px",
          }}
        >
          {video.course_code}
          {"  ›  "}
          {video.module_title}
        </div>
      </div>

      <div className="lesson-header">

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginBottom: "14px",
          }}
        >
          <span
            className={
              isCompleted
                ? "badge badge-green"
                : progress?.status ===
                  "in_progress"
                ? "badge badge-blue"
                : "badge badge-gray"
            }
          >
            {isCompleted
              ? "✓ Watched"
              : progress?.status ||
                "not_started"}
          </span>

          {lessonPosition && (
            <span className="badge badge-blue">
              Lesson{" "}
              {lessonPosition} of{" "}
              {totalLessons}
            </span>
          )}

          {progress?.needs_rewatch && (
            <span className="badge badge-orange">
              🔁 Rewatch
            </span>
          )}

          {progress?.watch_count > 0 && (
            <span className="badge badge-gray">
              Watched{" "}
              {progress.watch_count}{" "}
              {progress.watch_count === 1
                ? "time"
                : "times"}
            </span>
          )}
        </div>

        <h1 className="page-title">
          {video.title}
        </h1>

        <p className="page-subtitle">
          {video.playlist_title ||
            "ICT Lesson"}
        </p>

        <a
          href={
            video.youtube_url
          }
          target="_blank"
          rel="noreferrer"
          className="btn btn-primary"
        >
          ▶ Watch on YouTube
        </a>

      </div>

      <section className="lesson-section">

        <h2>Concepts</h2>

        {video.concepts?.length >
        0 ? (
          <ul className="concept-list">

            {video.concepts.map(
              (concept) => (
                <li
                  key={
                    concept.id
                  }
                  className="concept-chip"
                >
                  {
                    concept.name
                  }
                </li>
              )
            )}

          </ul>
        ) : (
          <p className="muted">
            No concepts listed for
            this lesson.
          </p>
        )}

      </section>

      <section className="lesson-section">

        <h2>
          Study Notes
        </h2>

        <p className="muted">
          Record important ideas,
          observations, rules and
          examples from the lesson.
        </p>

        <textarea
          className="notes-area"
          value={
            progress?.notes || ""
          }
          onChange={(event) =>
            setProgress({
              ...progress,
              notes:
                event.target.value,
            })
          }
          placeholder="Write what you learned..."
        />

        <div
          style={{
            marginTop: "16px",
          }}
        >
          <button
            className="btn btn-primary"
            onClick={saveNotes}
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save Notes"}
          </button>
        </div>

      </section>

      <section className="lesson-section">

        <h2>
          Lesson Progress
        </h2>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >

          {isCompleted ? (
            <span className="badge badge-green">
              ✓ Lesson Completed
            </span>
          ) : (
            <button
              className="btn btn-success"
              onClick={
                markWatched
              }
              disabled={saving}
            >
              Mark as Watched
            </button>
          )}

          <button
            className="btn btn-secondary"
            onClick={
              toggleRewatch
            }
            disabled={saving}
          >
            {progress?.needs_rewatch
              ? "✓ Rewatch Added"
              : "Add to Rewatch"}
          </button>

        </div>

      </section>

      <section className="lesson-section">

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >

          <div>
            {previousLesson ? (
              <Link
                to={`/lesson/${previousLesson.id}`}
                className="btn btn-secondary"
              >
                ← Previous Lesson
              </Link>
            ) : (
              <button
                className="btn btn-secondary"
                disabled
              >
                ← Previous Lesson
              </button>
            )}
          </div>

          <div
            className="muted"
            style={{
              fontSize: "13px",
            }}
          >
            {lessonPosition &&
              `Lesson ${lessonPosition} of ${totalLessons}`}
          </div>

          <div>
            {nextLesson ? (
              isCompleted ? (
                <Link
                  to={`/lesson/${nextLesson.id}`}
                  className="btn btn-primary"
                >
                  Next Lesson →
                </Link>
              ) : (
                <button
                  className="btn btn-success"
                  onClick={
                    completeAndNext
                  }
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Complete & Next →"}
                </button>
              )
            ) : (
              <Link
                to={`/module/${video.module_id}`}
                className="btn btn-primary"
              >
                Finish Module ✓
              </Link>
            )}
          </div>

        </div>

      </section>

      {video.notes && (
        <section className="lesson-section">

          <h2>
            Lesson Information
          </h2>

          <p
            className="muted"
            style={{
              whiteSpace:
                "pre-line",
              lineHeight: "1.7",
            }}
          >
            {video.notes}
          </p>

        </section>
      )}

      {error && (
        <div
          className="card"
          style={{
            marginTop: "20px",
          }}
        >
          <strong>
            Something went wrong
          </strong>

          <p className="muted">
            {error}
          </p>
        </div>
      )}

    </div>
  );
}

export default Lesson;
