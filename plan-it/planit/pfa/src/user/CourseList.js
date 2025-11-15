import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../css/CourseList.css";
import defaultImg from "../img/default_img.png"; // ✅ 기본 이미지 import

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const size = 15;

  useEffect(() => {
    //fetch(`http://localhost:8080/api/course/list?page=${page}&size=${size}`)
    fetch(`/api/course/list?page=${page}&size=${size}`)
      .then((res) => res.json())
      .then((data) => {
        setCourses(data.content || []);
        setTotalPages(data.totalPages || 0);
      })
      .catch((err) => console.error("코스 목록 불러오기 실패:", err));
  }, [page]);

  return (
    <div className="course-container">
      {courses.length === 0 ? (
        <p>등록된 코스가 없습니다.</p>
      ) : (
        <>
          <div className="course-grid">
            {courses.map((course) => (
              <Link
                key={course.id}
                to={`/course/detail/${course.id}`}
                className="course-card-link"
              >
                <div className="course-card">
                  <img
                    src={
                      course.thumbnail && course.thumbnail.trim() !== ""
                        ? course.thumbnail
                        : defaultImg
                    }
                    alt={course.courseTitle}
                    className="course-img"
                    onError={(e) => (e.target.src = defaultImg)} // ✅ 이미지 로드 실패 시 기본 이미지
                  />

                  <span className="course-badge">
                    {course.days === 1
                      ? "당일치기"
                      : `${(course.days || 0) - 1}박 ${course.days || 0}일`}
                  </span>

                  <div className="course-info">
                    <h3>{course.courseTitle}</h3>
                    <p>{course.courseDesc}</p>
                    <small>
                      만든날짜 |{" "}
                      {typeof course.regDate === "string"
                        ? (course.regDate ?? "").substring(0, 10)
                        : (course.regDate?.toString() ?? "").substring(0, 10)}
                    </small>

                    <div className="course-meta">
                      <span>
                        ⭐ {Math.round(Number(course.avg || 0))} (
                        {course.ratingCount ?? 0})
                      </span>
                      <span>💬 {course.commentCount ?? 0}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* ✅ 페이지네이션 */}
          <div className="pagination">
            <button
              disabled={page === 0}
              onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
            >
              이전
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={page === i ? "active" : ""}
                onClick={() => setPage(i)}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={page === totalPages - 1}
              onClick={() =>
                setPage((prev) => Math.min(prev + 1, totalPages - 1))
              }
            >
              다음
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CourseList;
