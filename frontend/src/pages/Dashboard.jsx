import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("progress/summary/")
      .then((response) => {
        setSummary(response.data);
      })
      .catch(() => {
        setError("Could not load progress.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <>
      <h1 className="page-title">
        Dashboard
      </h1>

      <p className="page-subtitle">
        Track your progress through the ICT curriculum.
      </p>

      <div className="stats-grid">

      <Link to="/rewatch">
  <StatCard
    title="Rewatch"
    value={summary.needs_rewatch}
  />
</Link>

        <StatCard
          title="Watched"
          value={summary.watched_videos}
        />

        <StatCard
          title="Remaining"
          value={summary.remaining_videos}
        />

        <StatCard
          title="Completion"
          value={`${summary.completion_percentage}%`}
          highlight
        />

        <StatCard
          title="Rewatch"
          value={summary.needs_rewatch}
        />

      </div>

      <div className="card continue-card">

        <div className="eyebrow">
          Continue Learning
        </div>

        {summary.next_lesson ? (
          <>
            <p className="muted">
              {summary.next_lesson.course_code}
              {" • "}
              {summary.next_lesson.module}
            </p>

            <h2 className="continue-title">
              {summary.next_lesson.title}
            </h2>

            <p className="muted">
              {summary.next_lesson.course}
            </p>

            <Link
              className="btn btn-primary"
              to={`/lesson/${summary.next_lesson.id}`}
            >
              Continue Lesson →
            </Link>
          </>
        ) : (
          <p>
            🎉 Curriculum complete.
          </p>
        )}

      </div>

      <div style={{ marginTop: 20 }}>

        <Link
          className="btn btn-secondary"
          to="/curriculum"
        >
          View Full Curriculum
        </Link>

      </div>
    </>
  );
}

function StatCard({
  title,
  value,
  highlight = false,
}) {
  return (
    <div
      className={
        highlight
          ? "stat-card highlight"
          : "stat-card"
      }
    >
      <p className="stat-label">
        {title}
      </p>

      <h2 className="stat-value">
        {value}
      </h2>
    </div>
  );
}

export default Dashboard;