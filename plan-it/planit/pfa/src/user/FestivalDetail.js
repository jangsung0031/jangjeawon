/* global kakao */
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "./FestivalDetail.css";

//const IMG_BASE = "http://localhost:8080";
const IMG_BASE = "";

/** 이미지 경로 정규화 */
function getImageUrl(path) {
  const base = `${IMG_BASE}/festival-img`;
  if (!path || String(path).trim() === "") return `${base}/default_img.png`;
  if (String(path).startsWith("/festival-img/")) return `${IMG_BASE}${path}`;
  return `${base}/${String(path).replace(/^\/+/, "")}`;
}

/** 기본이미지 여부 판별 (추천에서 제외용) */
function isDefaultImage(path) {
  if (!path) return true;
  const p = String(path).trim();
  if (p === "") return true;
  const file = p.split("/").pop()?.toLowerCase();
  return (
    file === "default_img.png" ||
    file === "default.png" ||
    file === "default.jpg" ||
    file === "default_img.jpg"
  );
}

/** 주소 정규화 */
function normalizeAddr(addr = "") {
  try {
    let a = String(addr);
    a = a
      .replace(/\([^)]*\)/g, "")
      .replace(/\[[^\]]*]/g, "")
      .replace(/\{[^}]*}/g, "");
    a = a.replace(/\s+/g, " ").trim();
    if (a.length < 6) return "";
    return a;
  } catch {
    return addr || "";
  }
}

/** Kakao SDK 준비 */
function ensureKakaoReady() {
  return new Promise((resolve) => {
    const ready = () => window.kakao && window.kakao.maps && window.kakao.maps.load;
    if (ready()) {
      window.kakao.maps.load(() => resolve());
      return;
    }
    const t = setInterval(() => {
      if (ready()) {
        clearInterval(t);
        window.kakao.maps.load(() => resolve());
      }
    }, 50);
  });
}

/** 거리 계산(미터) */
function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const s1 = Math.sin(dLat / 2) ** 2;
  const s2 =
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(s1 + s2), Math.sqrt(1 - (s1 + s2)));
  return R * c;
}

/** 카테고리 이모지 */
function iconFor(category = "") {
  if (category.includes("카페")) return "☕";
  if (category.includes("분식") || category.includes("패스트푸드")) return "🍔";
  if (category.includes("한식")) return "🍚";
  if (category.includes("중식")) return "🥟";
  if (category.includes("일식")) return "🍣";
  if (category.includes("양식")) return "🍝";
  return "🍽️";
}

export default function FestivalDetail() {
  const { id } = useParams();

  const [festival, setFestival] = useState(null);
  const [coords, setCoords] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [geoError, setGeoError] = useState("");
  const [searching, setSearching] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // 추천 축제
  const [reco, setReco] = useState([]); // {id, name, imageUrl}[]

  /** 라우트가 바뀔 때마다 맨 위로 스크롤 (사용자 체감 개선) */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  /** 1) 상세 정보 로드 */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await axios.get(`/api/festival/${id}`);
        if (!alive) return;
        setFestival(data || null);
      } catch (e) {
        console.error("❌ 축제 상세 불러오기 실패:", e);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  /** 2) 좌표 확보 + 지도 렌더 */
  useEffect(() => {
    (async () => {
      if (!festival) return;

      await ensureKakaoReady();

      const container = document.getElementById("kakao-map");
      if (!container) return;

      const map = new kakao.maps.Map(container, {
        center: new kakao.maps.LatLng(37.5665, 126.978),
        level: 4,
      });

      const finishMap = (lat, lng) => {
        const pos = new kakao.maps.LatLng(lat, lng);
        new kakao.maps.Marker({ map, position: pos });
        map.setCenter(pos);
        setCoords({ lat, lng });
        setGeoError("");
      };

      const hasLatLng =
        typeof festival?.latitude === "number" &&
        typeof festival?.longitude === "number" &&
        !Number.isNaN(festival.latitude) &&
        !Number.isNaN(festival.longitude);

      if (hasLatLng) {
        finishMap(festival.latitude, festival.longitude);
        return;
      }

      const geocoder = new kakao.maps.services.Geocoder();
      const rawAddr = festival.addr || "";
      const addr = normalizeAddr(rawAddr);

      const keywordFallback = () => {
        try {
          const places = new kakao.maps.services.Places();
          const keyword =
            `${festival.name || ""} ${festival.sigungu || festival.city || ""}`.trim()
            || (addr ? addr.split(" ").slice(0, 2).join(" ") : "");

          if (!keyword) {
            setGeoError("행사 위치 좌표를 찾지 못했어요.");
            setCoords(null);
            return;
          }

          places.keywordSearch(
            keyword,
            (data, status) => {
              if (status === kakao.maps.services.Status.OK && data?.length) {
                const d = data[0];
                const lat = parseFloat(d.y);
                const lng = parseFloat(d.x);
                finishMap(lat, lng);
              } else {
                setGeoError("행사 위치 좌표를 찾지 못했어요.");
                setCoords(null);
              }
            },
            { size: 3 }
          );
        } catch {
          setGeoError("행사 위치 좌표를 찾지 못했어요.");
          setCoords(null);
        }
      };

      if (addr) {
        geocoder.addressSearch(addr, (result, status) => {
          if (status === kakao.maps.services.Status.OK && result?.[0]) {
            const lat = parseFloat(result[0].y);
            const lng = parseFloat(result[0].x);
            finishMap(lat, lng);
          } else {
            const parts = addr.split(" ");
            const shortQuery = parts.slice(0, 2).join(" ");
            if (shortQuery && shortQuery !== addr) {
              geocoder.addressSearch(shortQuery, (r2, s2) => {
                if (s2 === kakao.maps.services.Status.OK && r2?.[0]) {
                  const lat = parseFloat(r2[0].y);
                  const lng = parseFloat(r2[0].x);
                  finishMap(lat, lng);
                } else {
                  keywordFallback();
                }
              });
            } else {
              keywordFallback();
            }
          }
        });
      } else {
        keywordFallback();
      }
    })();
  }, [festival]);

  /** 3) 맛집 검색 */
  const fetchNearby = useCallback(async ({ radius = 2000, size = 6 } = {}) => {
    if (!coords || !festival) return;
    setSearching(true);
    try {
      const baseKeyword =
        (festival.city && festival.city.trim()) ||
        (festival.sigungu && festival.sigungu.trim()) ||
        (festival.addr ? festival.addr.split(" ").slice(0, 2).join(" ") : "") ||
        "맛집";
      const keyword = `${baseKeyword} 맛집`;

      const { data } = await axios.get("/api/festival/nearby", {
        params: { lat: coords.lat, lng: coords.lng, keyword, radius, size },
      });

      setExpanded(Boolean(data?.expanded));

      const docs = Array.isArray(data?.documents) ? data.documents : [];
      const items = docs.map((d) => {
        const lat = Number(d.y);
        const lng = Number(d.x);
        const dist =
          d.distance != null
            ? Number(d.distance)
            : (coords ? Math.round(haversineMeters(coords.lat, coords.lng, lat, lng)) : undefined);

        return {
          id: d.id,
          name: d.place_name,
          addr: d.road_address_name || d.address_name,
          lat, lng,
          url: d.place_url,
          category: d.category_name,
          distance: dist,
        };
      });

      items.sort((a, b) => (a.distance ?? 1e12) - (b.distance ?? 1e12));
      setRestaurants(items.slice(0, 6));
    } catch (e) {
      console.error("❌ 맛집 검색 실패:", e);
      setRestaurants([]);
    } finally {
      setSearching(false);
    }
  }, [coords, festival]);

  useEffect(() => {
    if (!coords || !festival) return;
    fetchNearby({ radius: 2000, size: 6 });
  }, [coords, festival, fetchNearby]);

  /** 4) 추천 축제: 같은 city, 기본이미지 제외, 현재 축제 제외, 최대 4개 */
  useEffect(() => {
    if (!festival?.city) {
      setReco([]);
      return;
    }
    (async () => {
      try {
        const { data } = await axios.get("/api/festival/filter", {
          params: { city: festival.city },
        });
        const list = Array.isArray(data) ? data : [];
        const filtered = list.filter(
          (f) => f.id !== festival.id && !isDefaultImage(f.imagePath)
        );
        const top = filtered.slice(0, 4).map((f) => ({
          id: f.id,
          name: f.name,
          imageUrl: getImageUrl(f.imagePath),
        }));
        setReco(top);
      } catch (e) {
        console.warn("추천 축제 로딩 실패:", e);
        setReco([]);
      }
    })();
  }, [festival?.city, festival?.id]);

  const imageUrl = useMemo(() => getImageUrl(festival?.imagePath), [festival?.imagePath]);

  if (!festival) return <div className="loading">불러오는 중…</div>;

  const handleRouteClick = () => {
    if (!coords) return;
    window.open(
      `https://map.kakao.com/link/to/${encodeURIComponent(festival.name || "목적지")},${coords.lat},${coords.lng}`,
      "_blank"
    );
  };

  return (
    <div className="festival-detail-page">
      {/* 상단 배너 */}
      <div className="detail-banner">
        <img
          src={imageUrl}
          alt={festival.name}
          onError={(e) => { e.currentTarget.src = `${IMG_BASE}/festival-img/default_img.png`; }}
        />
        <div className="banner-overlay">
          <h1 className="fest-name">{festival.name}</h1>
          <p className="fest-period">{festival.startdate} ~ {festival.enddate}</p>
          <p className="fest-addr">{festival.addr}</p>
        </div>
      </div>

      {/* 상세 정보 */}
      <div className="detail-info">
        <h2>축제 소개</h2>
        <p
  className="fest-intro"
  dangerouslySetInnerHTML={{
    __html: festival.intro || "소개글이 없습니다.",
  }}
/>


        <h2>행사 내용</h2>
        <p dangerouslySetInnerHTML={{__html: festival.detail || "행사 세부 내용이 없습니다."}}></p>
      </div>

      {/* 지도 + 길찾기 */}
      <div className="detail-section">
        <h2>길찾기</h2>
        <div id="kakao-map" className="map-box" />
        <div className="map-actions">
          <button className="route-btn" onClick={handleRouteClick} disabled={!coords}>길찾기</button>
          {geoError && <span className="map-error">{geoError}</span>}
        </div>
      </div>

      {/* 맛집 추천 */}
      <div className="detail-section">
        <div className="section-head">
          <h2>축제와 함께 즐기기 좋은 맛집</h2>
          {searching && <span className="loading-text">불러오는 중…</span>}
        </div>

        {expanded && <div className="badge-info">※ 주변 2km 내 결과가 없어 반경을 넓혀 추천했어요.</div>}

        {restaurants.length === 0 ? (
          <div className="empty">
            주변 2km 내 검색 결과가 없어요.
            <div className="empty-actions">
              <button onClick={() => fetchNearby({ radius: 5000 })} className="route-btn" disabled={searching || !coords}>
                반경 5km로 찾기
              </button>
              <button onClick={() => fetchNearby({ radius: 10000 })} className="route-btn route-btn--secondary" disabled={searching || !coords}>
                반경 10km로 찾기
              </button>
            </div>
          </div>
        ) : (
          <div className="restaurant-list">
            {restaurants.map((r) => (
              <a key={r.id} className="restaurant-card" href={r.url} target="_blank" rel="noreferrer">
                <div className="restaurant-thumb">
                  <span className="restaurant-emoji" aria-hidden>{iconFor(r.category)}</span>
                  <span className="restaurant-badge">{(r.category?.split(">")[0] ?? "맛집").trim()}</span>
                </div>
                <div className="restaurant-info">
                  <h4>{r.name}</h4>
                  <p>{r.addr}</p>
                  {typeof r.distance === "number" && (
                    <p className="restaurant-dist">약 {Math.round(r.distance)} m</p>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* 이런 축제는 어때요? */}
      {reco.length > 0 && (
        <div className="detail-section recommend-section">
          <hr className="recommend-divider" />
          <h2 className="recommend-title">이런 축제는 어때요?</h2>
          <div className="recommend-grid">
            {reco.map((f) => (
              <Link
                to={`/festival/${f.id}`}
                className="recommend-card"
                key={f.id}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                <div className="recommend-thumb">
                  <img
                    src={f.imageUrl}
                    alt={f.name}
                    onError={(e) => { e.currentTarget.src = `${IMG_BASE}/festival-img/default_img.png`; }}
                  />
                </div>
                <div className="recommend-name">{f.name}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
