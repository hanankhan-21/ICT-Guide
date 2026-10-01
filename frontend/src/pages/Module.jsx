
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

function Module() {
  const { id } = useParams();

  const [module, setModule] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [moduleResponse, progressResponse] =
          await Promise.all([
            api.get(`modules/${id}/`),
            api.get("progress/all/"),
          ]);

        setModule(moduleResponse.data);
        setProgress(progressResponse.data);
      } catch (err) {
        console.error(err);
        setError("Could not load module.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const progressMap = useMemo(() => {
    const map = {};

    progress.forEach((item) => {
      map[item.video_id] = item;
    });

    return map;
  }, [progress]);

  const getStatus = (videoId) => {
    return (
      progressMap[videoId]?.status ||
      "not_started"
    );
  };

  const isCompleted = (videoId) => {
    return [
      "watched",
      "reviewed",
      "mastered",
    ].includes(getStatus(videoId));
  };

  if (loading) {
    return (
      <div className="card">
        <p>Loading module...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <h2>Could not load module</h2>
        <p className="muted">{error}</p>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="card">
        <h2>Module not found.</h2>
      </div>
    );
  }

  const totalVideos =
    module.videos?.length || 0;

  const completedVideos =
    module.videos?.filter((video) =>
      isCompleted(video.id)
    ).length || 0;

  const percentage =
    totalVideos > 0
      ? Math.round(
          (completedVideos / totalVideos) * 100
        )
      : 0;

  return (
    <div>
      <Link
        to="/curriculum"
        className="back-link"
      >
        ← Back to Curriculum
      </Link>

      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "20px",
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1 className="page-title">
              {module.title}
            </h1>

            {module.description && (
              <p
                className="page-subtitle"
                style={{
                  marginBottom: "0",
                  lineHeight: "1.6",
                }}
              >
                {module.description}
              </p>
            )}
          </div>

          <span
            className={
              percentage === 100 &&
              totalVideos > 0
                ? "badge badge-green"
                : percentage > 0
                ? "badge badge-blue"
                : "badge badge-gray"
            }
          >
            {completedVideos}/{totalVideos} complete
          </span>
        </div>

        <div className="progress-wrapper">
          <div className="progress-info">
            <span>Module Progress</span>
            <span>{percentage}%</span>
          </div>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${percentage}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: "28px",
          marginBottom: "14px",
        }}
      >
        <h2
          style={{
            margin: 0,
          }}
        >
          Lessons
        </h2>

        <p
          className="muted"
          style={{
            marginTop: "6px",
          }}
        >
          {totalVideos} lessons in this module
        </p>
      </div>

      <div className="lesson-list">
        {module.videos?.map((video) => {
          const status = getStatus(video.id);
          const completed = isCompleted(video.id);
          const needsRewatch =
            progressMap[video.id]?.needs_rewatch;

          return (
            <Link
              key={video.id}
              to={`/lesson/${video.id}`}
              className="lesson-row"
            >
              <div className="lesson-main">
                <div className="lesson-icon">
                  {completed ? "✅" : "○"}
                </div>

                <div>
                  <div className="lesson-title">
                    {video.order}. {video.title}
                  </div>

                  <div className="lesson-status">
                    Status:{" "}
                    {completed
                      ? "completed"
                      : status.replace("_", " ")}

                    {needsRewatch && (
                      <>
                        {" "}
                        • 🔁 Rewatch
                      </>
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
                <span
                  className={
                    completed
                      ? "badge badge-green"
                      : status === "in_progress"
                      ? "badge badge-blue"
                      : needsRewatch
                      ? "badge badge-orange"
                      : "badge badge-gray"
                  }
                >
                  {completed
                    ? "Completed"
                    : status === "in_progress"
                    ? "In Progress"
                    : needsRewatch
                    ? "Rewatch"
                    : "Not Started"}
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
    </div>
  );
}

export default Module;
