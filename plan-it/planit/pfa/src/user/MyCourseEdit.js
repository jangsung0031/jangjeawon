import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import defaultImg from "../img/default_img.png";
import "../css/Tour.css";

function normalizeImageUrl(raw) {
    //const IMG_BASE = "http://localhost:8080";
    const IMG_BASE = "";
    try {
        if (!raw) return defaultImg;
        const s = String(raw).trim();
        if (!s) return defaultImg;
        if (s.startsWith("/festival-img/")) return `${IMG_BASE}${s}`;
        if (s.startsWith("http://")) return s.replace(/^http:/, "https:");
        if (s.startsWith("https://")) return s;
        return defaultImg;
    } catch {
        return defaultImg;
    }
}

const MyCourseEdit = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const [courseTitle, setCourseTitle] = useState("");
    const [courseDesc, setCourseDesc] = useState("");
    const [myCourse, setMyCourse] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDay, setSelectedDay] = useState(1);
    const [pageNo, setPageNo] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [collapsedDays, setCollapsedDays] = useState([]);

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                const { data } = await api.get(`/api/my-tour-courses/${courseId}`);
                setCourseTitle(data.courseTitle);
                setCourseDesc(data.courseDesc);

                const groupedByDay = data.places.reduce((acc, place) => {
                    acc[place.day] = acc[place.day] || [];
                    acc[place.day].push(place);
                    return acc;
                }, {});

                const courseData = Object.entries(groupedByDay).map(([day, places]) => ({
                    day: parseInt(day, 10),
                    places: places,
                }));

                setMyCourse(courseData);
                if (courseData.length > 0) {
                    setSelectedDay(courseData[0].day);
                }
            } catch (error) {
                console.error("코스 데이터 불러오기 실패:", error);
                alert("코스 정보를 불러올 수 없습니다.");
                navigate('/mypage/my-courses');
            }
        };
        fetchCourseData();
    }, [courseId, navigate]);

    const handleUpdateCourse = async () => {
        if (!courseTitle.trim()) return alert("코스 이름을 입력하세요.");
        if (!courseDesc.trim()) return alert("코스 설명을 입력하세요.");

        const payload = {
            courseTitle,
            courseDesc,
            places: myCourse.flatMap(d => d.places.map(p => ({ ...p, day: d.day }))),
        };

        try {
            await api.put(`/api/my-tour-courses/${courseId}`, payload);
            alert("✅ 코스 수정이 완료되었습니다!");
            navigate("/mypage/my-courses");
        } catch (err) {
            console.error(err);
            alert("코스 수정 중 오류가 발생했습니다.");
        }
    };

    const toggleDay = (day) => {
        setCollapsedDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
    };

    const handleSearch = async () => {
        if (!keyword.trim()) return alert("검색어를 입력하세요.");
        setLoading(true);
        setPageNo(1);
        try {
            //const res = await fetch(`http://localhost:8080/api/kcisa/search?keyword=${encodeURIComponent(keyword)}&pageNo=1&numOfRows=12`);
            const res = await fetch(`/api/kcisa/search?keyword=${encodeURIComponent(keyword)}&pageNo=1&numOfRows=12`);
            if (!res.ok) throw new Error("서버 응답 오류");
            const data = await res.json();
            let items = data?.items;
            let arr = Array.isArray(items) ? items : items ? [items] : [];
            arr = arr.filter((item) => item?.language?.toLowerCase() === "kor" && item?.spatial && item.spatial.trim() !== "");
            const lowerKeyword = keyword.toLowerCase();
            arr = arr.filter((item) => item?.title?.toLowerCase().includes(lowerKeyword) || item?.spatial?.toLowerCase().includes(lowerKeyword));
            setResults(arr);
            setHasMore(arr.length > 0);
        } catch (err) {
            console.error("검색 실패:", err);
            alert("검색 실패: " + err.message);
        } finally {
            setLoading(false);
        }
    };
    
    const loadMore = async () => {
        const nextPage = pageNo + 1;
        setLoading(true);
        try {
            //const res = await fetch(`http://localhost:8080/api/kcisa/search?keyword=${encodeURIComponent(keyword)}&pageNo=${nextPage}&numOfRows=12`);
            const res = await fetch(`/api/kcisa/search?keyword=${encodeURIComponent(keyword)}&pageNo=${nextPage}&numOfRows=12`);
            if (!res.ok) throw new Error("서버 응답 오류");
            const data = await res.json();
            let items = data?.items;
            let arr = Array.isArray(items) ? (items ? [items] : []) : [];
            arr = arr.filter(item => item?.language?.toLowerCase() === 'kor' && item?.spatial && item.spatial.trim() !== "");
            const lowerKeyword = keyword.toLowerCase();
            arr = arr.filter(item => item?.title?.toLowerCase().includes(lowerKeyword) || item?.spatial?.toLowerCase().includes(lowerKeyword));
            if (arr.length === 0) {
                setHasMore(false);
            } else {
                setResults(prev => [...prev, ...arr]);
                setPageNo(nextPage);
            }
        } catch (err) {
            console.error("더보기 실패:", err);
            alert("더보기 실패: " + err.message);
        } finally {
            setLoading(false);
        }
    };

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

    const removePlace = (day, index) => {
        setMyCourse((prev) =>
            prev.map((d) =>
                d.day === day ? { ...d, places: d.places.filter((_, i) => i !== index) } : d
            )
        );
    };

    const addDay = () => {
        const newDay = myCourse.length + 1;
        setMyCourse([...myCourse, { day: newDay, places: [] }]);
        setSelectedDay(newDay);
    };

    const removeDay = (day) => {
        if (myCourse.length === 1) return alert("최소 1일차는 필요합니다.");
        setMyCourse((prev) =>
            prev.filter((d) => d.day !== day).map((d, idx) => ({ ...d, day: idx + 1 }))
        );
        setSelectedDay(1);
    };

    return (
        <div className="kcisa-container">
            <h1>코스 수정하기</h1>
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

            <div className="search-box">
                <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="검색어 입력"
                />
                <button onClick={handleSearch}>검색</button>
            </div>

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

            {hasMore && !loading && results.length > 0 && (
                <div className="load-more-container">
                    <button className="load-more-btn" onClick={loadMore}>
                        🔽 더보기
                    </button>
                </div>
            )}

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
                                    🗑️ 삭제
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

            <button className="save-btn" onClick={handleUpdateCourse}>
                💾 코스 수정 완료
            </button>
        </div>
    );
};

export default MyCourseEdit;