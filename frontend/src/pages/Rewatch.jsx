import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Rewatch() {
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [coursesResponse, progressResponse] =
          await Promise.all([
            api.get("courses/"),
            api.get("progress/all/"),
          ]);

        const courseData = Array.isArray(
          coursesResponse.data
        )
          ? coursesResponse.data
          : coursesResponse.data.results || [];

        setCourses(courseData);
        setProgress(progressResponse.data);
      } catch (err) {
        console.error(err);
        setError("Could not load rewatch queue.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const videoMap = useMemo(() => {
    const map = {};

    courses.forEach((course) => {
      course.modules?.forEach((module) => {
        module.videos?.forEach((video) => {
          map[video.id] = {
            ...video,

            courseCode: course.code,
            courseTitle: course.title,

            moduleId: module.id,
            moduleTitle: module.title,
          };
        });
      });
    });

    return map;
  }, [courses]);

  const rewatchLessons = useMemo(() => {
    return progress
      .filter((item) => item.needs_rewatch)
      .map((item) => ({
        ...item,
        video: videoMap[item.video_id],
      }))
      .filter((item) => item.video);
  }, [progress, videoMap]);

  if (loading) {
    return (
      <div className="card">
        Loading rewatch queue...
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <h2>Could not load Rewatch Queue</h2>

        <p className="muted">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">
        Rewatch Queue
      </h1>

      <p className="page-subtitle">
        Review lessons you marked for another pass.
      </p>

      <div
        style={{
          marginBottom: "24px",
        }}
      >
        <span
          className={
            rewatchLessons.length > 0
              ? "badge badge-orange"
              : "badge badge-green"
          }
        >
          {rewatchLessons.length}{" "}
          {rewatchLessons.length === 1
            ? "lesson"
            : "lessons"}{" "}
          to review
        </span>
      </div>

      {rewatchLessons.length === 0 ? (
        <div className="card">
          <h2>Rewatch queue is clear 🎉</h2>

          <p className="muted">
            When a lesson needs another review,
            use the "Add to Rewatch" button on
            its lesson page.
          </p>

          <Link
            to="/curriculum"
            className="btn btn-primary"
          >
            Browse Curriculum
          </Link>
        </div>
      ) : (
        <div className="lesson-list">
          {rewatchLessons.map((item) => {
            const video = item.video;

            return (
              <Link
                key={video.id}
                to={`/lesson/${video.id}`}
                className="lesson-row"
              >
                <div className="lesson-main">

                  <div className="lesson-icon">
                    🔁
                  </div>

                  <div>
                    <div className="lesson-title">
                      {video.title}
                    </div>

                    <div className="lesson-status">
                      {video.courseCode}
                      {" • "}
                      {video.moduleTitle}
                    </div>

                    <div
                      className="lesson-status"
                      style={{
                        marginTop: "4px",
                      }}
                    >
                      Current status:{" "}
                      {item.status.replace(
                        "_",
                        " "
                      )}
                    </div>
                  </div>

                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <span className="badge badge-orange">
                    Rewatch
                  </span>

                  <span
                    style={{
                      color: "#667085",
                      fontSize: "18px",
                    }}
                  >
                    →
                  </span>
                </div>

              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Rewatch;