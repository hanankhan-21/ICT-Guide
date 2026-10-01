import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";
import api from "../services/api";

function Curriculum() {
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [openCourses, setOpenCourses] =
    useState({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          coursesResponse,
          progressResponse,
        ] = await Promise.all([
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

        if (courseData.length > 0) {
          setOpenCourses({
            [courseData[0].id]: true,
          });
        }
      } catch (err) {
        console.error(err);
        setError(
          "Could not load curriculum."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const progressMap = useMemo(() => {
    const map = {};

    progress.forEach((item) => {
      map[item.video_id] = item;
    });

    return map;
  }, [progress]);

  const isCompleted = (videoId) => {
    const status =
      progressMap[videoId]?.status;

    return [
      "watched",
      "reviewed",
      "mastered",
    ].includes(status);
  };

  const filteredCourses = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return courses;
    }

    return courses.filter((course) => {
      const courseMatch =
        course.code
          ?.toLowerCase()
          .includes(query) ||
        course.title
          ?.toLowerCase()
          .includes(query) ||
        course.description
          ?.toLowerCase()
          .includes(query);

      const moduleMatch =
        course.modules?.some((module) => {
          const moduleTitleMatch =
            module.title
              ?.toLowerCase()
              .includes(query);

          const videoMatch =
            module.videos?.some(
              (video) =>
                video.title
                  ?.toLowerCase()
                  .includes(query)
            );

          return (
            moduleTitleMatch ||
            videoMatch
          );
        });

      return (
        courseMatch ||
        moduleMatch
      );
    });
  }, [courses, search]);

  const toggleCourse = (courseId) => {
    setOpenCourses((current) => ({
      ...current,
      [courseId]:
        !current[courseId],
    }));
  };

  const expandAll = () => {
    const allOpen = {};

    filteredCourses.forEach(
      (course) => {
        allOpen[course.id] = true;
      }
    );

    setOpenCourses(allOpen);
  };

  const collapseAll = () => {
    setOpenCourses({});
  };

  if (loading) {
    return (
      <div className="card">
        Loading curriculum...
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <h2>
          Could not load curriculum
        </h2>

        <p className="muted">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-heading-row">
        <div>
          <h1 className="page-title">
            ICT Curriculum
          </h1>

          <p className="page-subtitle">
            Follow the curriculum in
            sequence and track your
            progress.
          </p>
        </div>

        <span className="badge badge-blue">
          {courses.length} Courses
        </span>
      </div>

      <div className="curriculum-toolbar">
        <div className="search-wrapper">
          <span className="search-icon">
            🔎
          </span>

          <input
            className="search-input"
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search courses, modules or lessons..."
          />

          {search && (
            <button
              className="search-clear"
              onClick={() =>
                setSearch("")
              }
            >
              ×
            </button>
          )}
        </div>

        <div className="toolbar-actions">
          <button
            className="btn btn-secondary btn-small"
            onClick={expandAll}
          >
            Expand All
          </button>

          <button
            className="btn btn-secondary btn-small"
            onClick={collapseAll}
          >
            Collapse All
          </button>
        </div>
      </div>

      {search && (
        <p className="search-results">
          {filteredCourses.length}{" "}
          {filteredCourses.length === 1
            ? "course"
            : "courses"}{" "}
          matched
        </p>
      )}

      {filteredCourses.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon">
            🔍
          </div>

          <h2>
            No curriculum results
          </h2>

          <p className="muted">
            Try another course,
            concept, module or lesson
            name.
          </p>

          <button
            className="btn btn-secondary"
            onClick={() =>
              setSearch("")
            }
          >
            Clear Search
          </button>
        </div>
      ) : (
        filteredCourses.map(
          (course) => {
            const courseVideos =
              course.modules?.flatMap(
                (module) =>
                  module.videos || []
              ) || [];

            const completedCourseVideos =
              courseVideos.filter(
                (video) =>
                  isCompleted(video.id)
              ).length;

            const coursePercentage =
              courseVideos.length > 0
                ? Math.round(
                    (completedCourseVideos /
                      courseVideos.length) *
                      100
                  )
                : 0;

            const isOpen =
              openCourses[
                course.id
              ] || Boolean(search);

            return (
              <div
                key={course.id}
                className="course-card"
              >
                <div className="course-header">
                  <button
                    className="course-toggle"
                    onClick={() =>
                      toggleCourse(
                        course.id
                      )
                    }
                  >
                    <div className="course-toggle-main">
                      <div>
                        <h2 className="course-title">
                          {course.code}
                          {" — "}
                          {course.title}
                        </h2>

                        <div className="course-meta">
                          <span className="badge badge-blue">
                            {
                              course.level
                            }
                          </span>

                          <span className="badge badge-gray">
                            {
                              completedCourseVideos
                            }
                            /
                            {
                              courseVideos.length
                            }{" "}
                            videos
                          </span>

                          {coursePercentage ===
                            100 &&
                            courseVideos.length >
                              0 && (
                              <span className="badge badge-green">
                                ✓ Complete
                              </span>
                            )}
                        </div>
                      </div>

                      <span
                        className={`course-chevron ${
                          isOpen
                            ? "open"
                            : ""
                        }`}
                      >
                        ▾
                      </span>
                    </div>
                  </button>

                  {course.description && (
                    <p className="course-description">
                      {
                        course.description
                      }
                    </p>
                  )}

                  <div className="progress-wrapper">
                    <div className="progress-info">
                      <span>
                        Course Progress
                      </span>

                      <span>
                        {
                          coursePercentage
                        }
                        %
                      </span>
                    </div>

                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${coursePercentage}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {isOpen && (
                  <div className="module-list">
                    {course.modules?.map(
                      (module) => {
                        const total =
                          module.videos
                            ?.length ||
                          0;

                        const completed =
                          module.videos?.filter(
                            (video) =>
                              isCompleted(
                                video.id
                              )
                          ).length ||
                          0;

                        const modulePercentage =
                          total > 0
                            ? Math.round(
                                (completed /
                                  total) *
                                  100
                              )
                            : 0;

                        const moduleComplete =
                          total > 0 &&
                          completed ===
                            total;

                        return (
                          <Link
                            key={
                              module.id
                            }
                            to={`/module/${module.id}`}
                            className="module-row"
                          >
                            <div>
                              <div className="module-name">
                                {
                                  module.title
                                }
                              </div>

                              <div className="module-subtitle">
                                {
                                  completed
                                }{" "}
                                of{" "}
                                {total}{" "}
                                lessons
                                completed
                              </div>
                            </div>

                            <div className="module-row-right">
                              <span
                                className={
                                  moduleComplete
                                    ? "badge badge-green"
                                    : completed >
                                      0
                                    ? "badge badge-blue"
                                    : "badge badge-gray"
                                }
                              >
                                {
                                  modulePercentage
                                }
                                %
                              </span>

                              <span className="row-arrow">
                                →
                              </span>
                            </div>
                          </Link>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            );
          }
        )
      )}
    </div>
  );
}

export default Curriculum;