import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import KakaoCourseMap from "./KakaoCourseMap";
import StarRating from "./StarRating";
import CommentBox from "./CommentBox";
import defaultImg from "../img/default_img.png"; // ✅ 기본 이미지 import
import "../css/CourseDetail.css";

const API = "/api";

const CourseDetail = () => {
  const { id } = useParams();
  const [places, setPlaces] = useState([]);

  const token = sessionStorage.getItem("token");
  const nickname = sessionStorage.getItem("nickname");

  const headers = useMemo(
    () =>
      token
        ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
        : { "Content-Type": "application/json" },
    [token]
  );

  // ✅ 코스 상세 데이터 불러오기
  useEffect(() => {
    fetch(`${API}/course/detail/${id}`)
      .then((res) => res.json())
      .then((data) => setPlaces(Array.isArray(data) ? data : []))
      .catch((err) => console.error("코스 상세 불러오기 실패:", err));
  }, [id]);

  // ✅ 일차별 그룹화
  const grouped = places.reduce((acc, place) => {
    if (!acc[place.day]) acc[place.day] = [];
    acc[place.day].push(place);
    return acc;
  }, {});

  // ✅ 이미지 로드 실패 시 기본 이미지로 대체 (무한루프 방지)
  const handleImgError = (e) => {
    if (e.currentTarget.dataset.fallbackApplied) return;
    e.currentTarget.dataset.fallbackApplied = "1";
    e.currentTarget.src = defaultImg;
  };

  return (
    <div className="course-detail">
      {/* 지도 섹션 */}
      <section className="map-section">
        <KakaoCourseMap places={places} height={360} />
      </section>

      {/* 장소 목록 */}
      {Object.keys(grouped).length === 0 ? (
        <p>장소가 없습니다.</p>
      ) : (
        Object.entries(grouped).map(([day, items]) => (
          <div key={day} className="day-section">
            <h3>{day}일차</h3>
            <ul className="place-list">
              {items.map((place) => (
                <li key={place.id} className="place-item">
                  <img
                    src={place.imageUrl || defaultImg}
                    alt={place.title}
                    className="place-image"
                    onError={handleImgError}
                  />
                  <div className="place-info">
                    <strong className="place-title">{place.title}</strong>
                    <p className="place-addr">{place.addr}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}

      {/* 별점 섹션 */}
      <section className="rating-section">
        <StarRating
          courseId={id}
          headers={headers}
          initialAvg={0}
          initialCount={0}
          disabled={!token}
        />
      </section>

      {/* 댓글 섹션 */}
      <section className="comment-section">
        <CommentBox courseId={id} headers={headers} nickname={nickname} token={token} />
      </section>
    </div>
  );
};

export default CourseDetail;
