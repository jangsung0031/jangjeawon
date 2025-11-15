import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import defaultImg from "../img/default_img.png";
import "../css/Tour.css";

//const IMG_BASE ="http://localhost:8080"; // 서버 상대경로(/festival-img/...) 처리용
const IMG_BASE = ""; // 서버 상대경로(/festival-img/...) 처리용
const PAGE_SIZE = 10; // ✅ 페이지당 10개 고정

// ✅ 어떤 입력이 와도 '표시 가능한 이미지 URL' 또는 기본이미지로 반환
function normalizeImageUrl(raw) {
  try {
    if (!raw) return defaultImg;
    const s = String(raw).trim();
    if (!s) return defaultImg;

    // 서버 정적 매핑 상대경로 대응
    if (s.startsWith("/festival-img/")) return `${IMG_BASE}${s}`;

    // http → https 승격(혼합콘텐츠 방지)
    if (s.startsWith("http://")) return s.replace(/^http:/, "https:");
    if (s.startsWith("https://")) return s;

    // 그 외(파일명만 오는 등)는 기본 이미지
    return defaultImg;
  } catch {
    return defaultImg;
  }
}

const KcisaCoursePage = () => {
  const navigate = useNavigate();

  // ✅ 마운트 시 로그인 여부 체크
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
    }
  }, [navigate]);

  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // 페이지네이션 상태
  const [pageNo, setPageNo] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(null); // API가 주면 사용

  const [selectedDay, setSelectedDay] = useState(1);
  const [myCourse, setMyCourse] = useState([{ day: 1, places: [] }]);

  const [courseTitle, setCourseTitle] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [collapsedDays, setCollapsedDays] = useState([]);

  const toggleDay = (day) => {
    setCollapsedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  // 🔍 검색 (첫 페이지 로드)
  const handleSearch = async () => {
    if (!keyword.trim()) return alert("검색어를 입력하세요.");
    setLoading(true);
    setPageNo(1);
    setTotalCount(null);
    try {
      const res = await fetch(
        //`http://localhost:8080/api/kcisa/search?keyword=${encodeURIComponent(
        `/api/kcisa/search?keyword=${encodeURIComponent(
          keyword
        )}&pageNo=1&numOfRows=${PAGE_SIZE}`
      );
      if (!res.ok) throw new Error("서버 응답 오류");
      const data = await res.json();

      // items는 배열 보장
      let arr = Array.isArray(data?.items) ? data.items : [];

      // 한국어 + 위치 있는 데이터만
      arr = arr.filter(
        (item) =>
          String(item?.language || "").toLowerCase() === "kor" &&
          item?.spatial &&
          String(item.spatial).trim() !== ""
      );

      // 제목/지역에 키워드 포함 (추가 필터)
      const lowerKeyword = keyword.toLowerCase();
      arr = arr.filter(
        (item) =>
          String(item?.title || "").toLowerCase().includes(lowerKeyword) ||
          String(item?.spatial || "").toLowerCase().includes(lowerKeyword)
      );

      setResults(arr);
      setTotalCount(typeof data?.totalCount === "number" ? data.totalCount : null);

      // totalCount 있으면 그걸로 판단, 없으면 "이번 페이지가 꽉 찼는지"로 판단
      if (typeof data?.totalCount === "number") {
        setHasMore(1 * PAGE_SIZE < data.totalCount);
      } else {
        setHasMore(arr.length === PAGE_SIZE);
      }
    } catch (err) {
      console.error("검색 실패:", err);
      alert("검색 실패: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔽 더보기 (다음 페이지 로드)
  const loadMore = async () => {
    const nextPage = pageNo + 1;
    setLoading(true);
    try {
      const res = await fetch(
        //`http://localhost:8080/api/kcisa/search?keyword=${encodeURIComponent(
        `/api/kcisa/search?keyword=${encodeURIComponent(
          keyword
        )}&pageNo=${nextPage}&numOfRows=${PAGE_SIZE}`
      );
      if (!res.ok) throw new Error("서버 응답 오류");
      const data = await res.json();

      let arr = Array.isArray(data?.items) ? data.items : [];
      arr = arr.filter(
        (item) =>
          String(item?.language || "").toLowerCase() === "kor" &&
          item?.spatial &&
          String(item.spatial).trim() !== ""
      );

      const lowerKeyword = keyword.toLowerCase();
      arr = arr.filter(
        (item) =>
          String(item?.title || "").toLowerCase().includes(lowerKeyword) ||
          String(item?.spatial || "").toLowerCase().includes(lowerKeyword)
      );

      const newList = [...results, ...arr];
      setResults(newList);
      setPageNo(nextPage);

      // totalCount가 있으면 정확 계산, 없으면 arr 길이로 추정
      const tc = typeof data?.totalCount === "number" ? data.totalCount : totalCount;
      if (typeof tc === "number") {
        setTotalCount(tc);
        setHasMore(nextPage * PAGE_SIZE < tc);
      } else {
        setHasMore(arr.length === PAGE_SIZE);
      }
    } catch (err) {
      console.error("더보기 실패:", err);
      alert("더보기 실패: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 장소 추가 (이미지 URL 정규화 적용)
  const addToCourse = (place) => {
    const newPlace = {
      title: place?.title || "제목 없음",
      addr: place?.spatial || "주소 없음",
      imageUrl: normalizeImageUrl(place?.referenceIdentifier),
      contentId: place?.uci || "",
      mapx: place?.mapx || "",
      mapy: place?.mapy || "",
    };

    setMyCourse((prev) =>
      prev.map((d) =>
        d.day === selectedDay ? { ...d, places: [...d.places, newPlace] } : d
      )
    );
  };

  // ✅ 장소 삭제
  const removePlace = (day, index) => {
    setMyCourse((prev) =>
      prev.map((d) =>
        d.day === day
          ? { ...d, places: d.places.filter((_, i) => i !== index) }
          : d
      )
    );
  };

  // ✅ 일차 추가/삭제
  const addDay = () => {
    const newDay = myCourse.length + 1;
    setMyCourse([...myCourse, { day: newDay, places: [] }]);
    setSelectedDay(newDay);
  };

  const removeDay = (day) => {
    if (myCourse.length === 1) return alert("최소 1일차는 필요합니다.");
    setMyCourse((prev) =>
      prev
        .filter((d) => d.day !== day)
        .map((d, idx) => ({ ...d, day: idx + 1 }))
    );
    setSelectedDay(1);
  };

  // ✅ 백엔드 저장
  const saveCourse = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return alert("로그인이 필요합니다.");

    if (!courseTitle.trim()) return alert("코스 이름을 입력하세요.");
    if (!courseDesc.trim()) return alert("코스 설명을 입력하세요.");

    const payload = {
      courseTitle,
      courseDesc,
      places: myCourse.flatMap((d) =>
        d.places.map((p) => ({
          day: d.day,
          title: p.title,
          addr: p.addr,
          imageUrl: normalizeImageUrl(p.imageUrl), // 저장 시에도 안전하게
          contentId: p.contentId,
          mapx: p.mapx,
          mapy: p.mapy,
        }))
      ),
    };

    try {
      const res = await fetch("/api/my-course/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("저장 실패");
      alert("✅ 코스 저장 완료!");
      navigate("/course/list");
    } catch (err) {
      console.error(err);
      alert("코스 저장 중 오류 발생");
    }
  };

  return (
    <div className="kcisa-container">
      {/* ✅ 코스 제목/설명 입력 */}
      <h3>📌 코스 계획하기</h3>
      <div className="course-info">
        <input
          type="text"
          value={courseTitle}
          onChange={(e) => setCourseTitle(e.target.value)}
          placeholder="코스 이름을 입력하세요"
        />
        <textarea
          value={courseDesc}
          onChange={(e) => setCourseDesc(e.target.value)}
          placeholder="코스 설명을 입력하세요"
        />
      </div>

      {/* 일차 선택 */}
      <div className="day-select">
        {myCourse.map((d) => (
          <button
            key={d.day}
            className={selectedDay === d.day ? "active" : ""}
            onClick={() => setSelectedDay(d.day)}
          >
            {d.day}일차
          </button>
        ))}
        <button className="add-day-btn" onClick={addDay}>
          ➕ 일차 추가
        </button>
      </div>

      {/* 내 코스 미리보기 */}
      <h3>📌 내 코스 미리보기</h3>
      <div className="course-preview">
        {myCourse.map((d) => (
          <div key={d.day} className="day-box">
            <div className="day-header">
              <h4>{d.day}일차</h4>
              <div className="day-actions">
                <button
                  className="toggle-btn"
                  onClick={() => toggleDay(d.day)}
                >
                  {collapsedDays.includes(d.day) ? "➕ 펼치기" : "➖ 접기"}
                </button>
                <button
                  className="remove-day-btn"
                  onClick={() => removeDay(d.day)}
                >
                  🗑 삭제
                </button>
              </div>
            </div>

            {!collapsedDays.includes(d.day) &&
              (d.places.length === 0 ? (
                <p>등록된 장소 없음</p>
              ) : (
                <div className="place-list">
                  {d.places.map((p, i) => (
                    <div key={i} className="place-card-mini">
                      <img
                        src={normalizeImageUrl(p.imageUrl)}
                        alt={p.title}
                        onError={(e) => (e.currentTarget.src = defaultImg)}
                      />
                      <div className="place-info">
                        <span className="place-title">{p.title}</span>
                        <span className="place-addr">{p.addr}</span>
                      </div>
                      <button
                        className="remove-btn"
                        onClick={() => removePlace(d.day, i)}
                      >
                        ❌
                      </button>
                    </div>
                  ))}
                </div>
              ))}
          </div>
        ))}
      </div>

      <button className="save-btn" onClick={saveCourse}>
        💾 코스 저장
      </button>

      {/* 검색창 */}
      <div className="search-box">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="검색어 입력"
        />
        <button onClick={handleSearch}>검색</button>
      </div>

      {/* 검색 결과 */}
      <h3>검색 결과</h3>
      {loading && <p>⏳ 불러오는 중...</p>}
      {!loading && results.length === 0 && <p>검색 결과가 없습니다.</p>}

      <div className="results-grid">
        {results.map((place, idx) => (
          <div key={idx} className="place-card">
            <img
              src={normalizeImageUrl(place?.referenceIdentifier)}
              alt={place?.title || "이미지"}
              onError={(e) => (e.currentTarget.src = defaultImg)}
            />
            <h4>{place?.title || "제목 없음"}</h4>
            <p>{place?.spatial || "주소 없음"}</p>
            <button onClick={() => addToCourse(place)}>➕ 추가</button>
          </div>
        ))}
      </div>

      {/* 더보기 버튼 */}
      {hasMore && !loading && results.length > 0 && (
        <div className="load-more-container">
          <button className="load-more-btn" onClick={loadMore}>
            🔽 더보기
          </button>
          {typeof totalCount === "number" && (
            <p style={{ marginTop: 8 }}>
              {pageNo * PAGE_SIZE} / {totalCount} 개
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default KcisaCoursePage;
