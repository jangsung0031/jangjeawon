import React, { useEffect, useRef, useState, useCallback } from "react";
import "../css/MapPage.css";

/** 카카오 카테고리 코드 (주차장 포함) */
const CODES = {
    TOUR: { code: "AT4", label: "관광지", shortLabel: "관광" },
    FOOD: { code: "FD6", label: "음식점", shortLabel: "음식" },
    CAFE: { code: "CE7", label: "카페", shortLabel: "카페" },
    HOTEL: { code: "AD5", label: "숙소", shortLabel: "숙소" },
    PARK: { code: "PK6", label: "주차장", shortLabel: "주차" },
};

const defaultActive = {
    TOUR: true,
    FOOD: false,
    CAFE: false,
    HOTEL: false,
    PARK: false,
};

/** 카테고리별 컬러 (마커/칩/리스트 공통) */
const CAT_COLORS = {
    TOUR: "#3B82F6",
    FOOD: "#EF4444",
    CAFE: "#A855F7",
    HOTEL: "#10B981",
    PARK: "#6B7280",
    HIGHLIGHT: "#111827",
};

/** 카테고리별 마커 이미지 생성 (SVG → data URL) */
function getMarkerImageByCat(catKey, kakao, scale = 1) {
    const fill = CAT_COLORS[catKey] || "#111827";
    const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;
    const baseW = isMobile ? 20 : 22;
    const baseH = isMobile ? 30 : 32;
    const WIDTH = Math.round(baseW * scale);
    const HEIGHT = Math.round(baseH * scale);

    const svg = encodeURIComponent(`
    <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 28 40" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="s" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-opacity="0.25"/>
        </filter>
      </defs>
      <path filter="url(#s)" d="M14 0C6.82 0 1 5.82 1 13c0 9.41 12.2 25.35 12.72 26.01a.4.4 0 0 0 .56 0C14.8 38.35 27 22.41 27 13 27 5.82 21.18 0 14 0Z" fill="${fill}"/>
      <circle cx="14" cy="13" r="6" fill="#fff"/>
    </svg>
  `);
    const src = `data:image/svg+xml;charset=UTF-8,${svg}`;
    const size = new kakao.maps.Size(WIDTH, HEIGHT);

    return new kakao.maps.MarkerImage(src, size, {
        offset: new kakao.maps.Point(Math.round(WIDTH / 2), HEIGHT),
        shape: "rect",
    });
}

/** 리스트/마커 식별용 키 */
function placeKey(p) {
    return p.id || p.place_url || `${p.x},${p.y}`;
}

/** ✅ 예쁜 POI 카드 템플릿 */
function renderPOICard(p, catColor = "#3B82F6") {
    const addr = p.road_address_name || p.address_name || "";
    const phone = p.phone || "";
    const safeColor = catColor || "#3B82F6";

    return `
    <div class="poi-card">
      <div class="poi-head">
        <span class="poi-dot" style="background:${safeColor}"></span>
        <h4 class="poi-title">${p.place_name || ""}</h4>
      </div>
      <div class="poi-body">
        ${addr ? `<div class="poi-row"><span class="poi-label">주소</span><span>${addr}</span></div>` : ""}
        ${phone ? `<div class="poi-row"><span class="poi-label">전화</span><span>${phone}</span></div>` : ""}
      </div>
      <div class="poi-actions">
        <a class="btn-link" href="https://map.kakao.com/link/to/${encodeURIComponent(p.place_name || "목적지")},${p.y},${p.x}" target="_blank" rel="noopener">길찾기</a>
        <a class="btn-link btn-primary" href="${p.place_url}" target="_blank" rel="noopener">카카오맵에서 보기</a>
      </div>
    </div>`;
}

export default function MapPage() {
    const mapRef = useRef(null);
    const clustererRef = useRef(null);
    const infoRef = useRef(null);

    // 마커 참조: key -> marker
    const markerMapRef = useRef(new Map());
    const prevSelectedKeyRef = useRef(null);

    // 최초 자동검색 1회
    const hasAutoSearched = useRef(false);

    // 버튼 노출 제어
    const [isDirty, setIsDirty] = useState(true);

    // 이벤트 해제용
    const dragStartHandlerRef = useRef(null);
    const dragEndHandlerRef = useRef(null);
    const zoomChangedHandlerRef = useRef(null);

    const searchSeqRef = useRef(0);

    const [activeCat, setActiveCat] = useState(defaultActive);
    const [places, setPlaces] = useState([]);
    const [myLocation, setMyLocation] = useState(null);
    const [radius, setRadius] = useState(1000);
    const [sortType, setSortType] = useState("distance");
    const [showFilter, setShowFilter] = useState(false);
    const [mapReady, setMapReady] = useState(false);

    // ✅ 공통 선택 상태 (PC/모바일 리스트 공용)
    const [selectedKey, setSelectedKey] = useState(null);

    // 모바일 하단 시트
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const sheetBodyRef = useRef(null);

    // 반응형 라벨
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia("(max-width: 768px)");
        const handler = (e) => setIsMobile(e.matches);
        handler(mq);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    /** 지도 생성 */
    useEffect(() => {
        const kakao = window.kakao;
        if (!kakao?.maps) return;

        const container = document.getElementById("map");
        const map = new kakao.maps.Map(container, {
            center: new kakao.maps.LatLng(37.5665, 126.9780),
            level: 5,
        });

        map.setDraggable(true);
        map.setZoomable(true);

        mapRef.current = map;

        clustererRef.current = new kakao.maps.MarkerClusterer({
            map,
            averageCenter: true,
            minLevel: 6,
        });
        infoRef.current = new kakao.maps.InfoWindow({ zIndex: 3 });

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    const loc = new kakao.maps.LatLng(latitude, longitude);
                    map.setCenter(loc);
                    setMyLocation({ lat: latitude, lng: longitude });
                    if (!hasAutoSearched.current) {
                        hasAutoSearched.current = true;
                        setTimeout(() => fetchPOI(), 0);
                    } else {
                        setIsDirty(true);
                    }
                },
                () => {
                    // 실패 시 아래 mapReady 훅에서 기본 중심으로 자동 1회
                }
            );
        }

        setMapReady(true);

        return () => {
            clustererRef.current?.clear();
            infoRef.current?.close();
            markerMapRef.current.clear();
        };
    }, []);

    /** 리레이아웃 */
    useEffect(() => {
        if (!mapReady) return;
        const t = setTimeout(() => relayoutMap(mapRef), 0);
        const onResize = () => relayoutMap(mapRef);
        window.addEventListener("resize", onResize);
        return () => {
            clearTimeout(t);
            window.removeEventListener("resize", onResize);
        };
    }, [mapReady]);

    /** 실제 검색(수동 호출 + 초기 1회 자동) */
    const fetchPOI = useCallback(() => {
        const kakao = window.kakao;
        const map = mapRef.current;
        if (!kakao?.maps || !map) return;

        const ps = new kakao.maps.services.Places();
        const center = map.getCenter();

        const onCats = Object.entries(activeCat)
            .filter(([, v]) => v)
            .map(([catKey]) => ({ catKey, code: CODES[catKey].code }));

        const mySeq = ++searchSeqRef.current;

        // 검색 직전 선택상태/마커 이미지 원복
        if (prevSelectedKeyRef.current && markerMapRef.current.has(prevSelectedKeyRef.current)) {
            const mk = markerMapRef.current.get(prevSelectedKeyRef.current);
            if (mk) mk.setImage(getMarkerImageByCat(mk.__catKey, kakao, 1));
        }
        setSelectedKey(null);

        if (onCats.length === 0) {
            if (mySeq === searchSeqRef.current) {
                clustererRef.current?.clear();
                infoRef.current?.close();
                markerMapRef.current.clear();
                setPlaces([]);
                setIsDirty(false);
            }
            return;
        }

        let pending = onCats.length;
        const allMarkers = [];
        let results = [];

        // 이전 마커/클러스터 정리
        clustererRef.current?.clear();
        infoRef.current?.close();
        markerMapRef.current.clear();

        onCats.forEach(({ catKey, code }) => {
            ps.categorySearch(
                code,
                (data, status) => {
                    if (mySeq !== searchSeqRef.current) return;

                    if (status === kakao.maps.services.Status.OK) {
                        let filtered = data
                            .map((p) => ({
                                ...p,
                                _catKey: catKey,
                                distance: getDistance(center.getLat(), center.getLng(), p.y, p.x),
                            }))
                            .filter((p) => p.distance <= radius);

                        if (sortType === "popular") {
                            filtered.sort(
                                (a, b) => (b.place_url?.length || 0) - (a.place_url?.length || 0)
                            );
                        } else {
                            filtered.sort((a, b) => a.distance - b.distance);
                        }

                        filtered.forEach((p) => {
                            const pos = new kakao.maps.LatLng(p.y, p.x);
                            const image = getMarkerImageByCat(p._catKey, kakao, 1);

                            const marker = new kakao.maps.Marker({
                                position: pos,
                                image,
                                clickable: true,
                                zIndex: 2,
                            });

                            const key = placeKey(p);
                            marker.__key = key;
                            marker.__catKey = p._catKey;

                            kakao.maps.event.addListener(marker, "click", () => {
                                if (mySeq !== searchSeqRef.current) return;
                                // 선택 상태 반영 (마커 확대 + 리스트 하이라이트 + 카드 오픈)
                                selectPlaceByKey(key, p, { openInfo: true });
                            });

                            kakao.maps.event.addListener(marker, "mouseover", () => marker.setZIndex(99));
                            kakao.maps.event.addListener(marker, "mouseout", () => {
                                if (selectedKey !== key) marker.setZIndex(2);
                            });

                            allMarkers.push(marker);
                            markerMapRef.current.set(key, marker);
                        });

                        results = [...results, ...filtered];
                    }

                    pending--;
                    if (pending === 0 && mySeq === searchSeqRef.current) {
                        if (allMarkers.length > 0) clustererRef.current?.addMarkers(allMarkers);
                        setPlaces(results);
                        setIsDirty(false);
                    }
                },
                { location: center, radius }
            );
        });
    }, [activeCat, radius, sortType, selectedKey]);

    /** 장소 선택 공통 로직 (리스트/마커 클릭 모두 사용) */
    const selectPlaceByKey = (key, placeObj, { openInfo = false } = {}) => {
        const kakao = window.kakao;
        const map = mapRef.current;
        if (!map) return;

        // 기존 선택 마커 원복
        if (prevSelectedKeyRef.current && markerMapRef.current.has(prevSelectedKeyRef.current)) {
            const prevMarker = markerMapRef.current.get(prevSelectedKeyRef.current);
            if (prevMarker) {
                prevMarker.setImage(getMarkerImageByCat(prevMarker.__catKey, kakao, 1));
                prevMarker.setZIndex(2);
            }
        }

        // 새 선택 마커 확대
        const marker = markerMapRef.current.get(key);
        if (marker) {
            marker.setImage(getMarkerImageByCat(marker.__catKey, kakao, 1.25));
            marker.setZIndex(100);
        }

        setSelectedKey(key);
        prevSelectedKeyRef.current = key;

        // 지도 이동 + 카드 표시
        if (placeObj) {
            const pos = new kakao.maps.LatLng(placeObj.y, placeObj.x);
            map.panTo(pos);

            if (openInfo) {
                const color = CAT_COLORS[placeObj._catKey] || "#3B82F6";
                infoRef.current.setContent(renderPOICard(placeObj, color));
                infoRef.current.open(map, marker);
            }
        }
    };

    /** 자동검색 제거: 이동/확대 이벤트 → 버튼만 띄우기 */
    useEffect(() => {
        if (!mapReady || !mapRef.current) return;
        const { kakao } = window;
        const map = mapRef.current;

        const onDragStart = () => setIsDirty(true);
        const onDragEnd = () => setIsDirty(true);
        const onZoomChanged = () => setIsDirty(true);

        kakao.maps.event.addListener(map, "dragstart", onDragStart);
        kakao.maps.event.addListener(map, "dragend", onDragEnd);
        kakao.maps.event.addListener(map, "zoom_changed", onZoomChanged);

        dragStartHandlerRef.current = onDragStart;
        dragEndHandlerRef.current = onDragEnd;
        zoomChangedHandlerRef.current = onZoomChanged;

        return () => {
            if (!mapRef.current) return;
            kakao.maps.event.removeListener(mapRef.current, "dragstart", dragStartHandlerRef.current);
            kakao.maps.event.removeListener(mapRef.current, "dragend", dragEndHandlerRef.current);
            kakao.maps.event.removeListener(mapRef.current, "zoom_changed", zoomChangedHandlerRef.current);
            dragStartHandlerRef.current = null;
            dragEndHandlerRef.current = null;
            zoomChangedHandlerRef.current = null;
        };
    }, [mapReady]);

    /** 🔥 mapReady인데 위치 권한 실패해도 1회 자동 검색 */
    useEffect(() => {
        if (!mapReady || !mapRef.current) return;
        if (!hasAutoSearched.current) {
            hasAutoSearched.current = true;
            setTimeout(() => fetchPOI(), 200);
        }
    }, [mapReady, fetchPOI]);

    /** 두 좌표 거리(m) */
    function getDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3;
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lon2 - lon1) * Math.PI) / 180;
        const a =
            Math.sin(Δφ / 2) ** 2 +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /** 내 위치로 이동 */
    const handleMyLocation = () => {
        if (!navigator.geolocation) {
            alert("이 브라우저는 위치정보를 지원하지 않습니다.");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                const loc = new window.kakao.maps.LatLng(latitude, longitude);
                mapRef.current?.panTo(loc);
                setMyLocation({ lat: latitude, lng: longitude });
                setIsDirty(true);
            },
            () => alert("현재 위치를 가져오지 못했습니다.")
        );
    };

    /** 리스트 클릭 시 지도 이동 + 선택 반영 */
    const handlePlaceClick = (p) => {
        const key = placeKey(p);
        selectPlaceByKey(key, p, { openInfo: true });
        setIsDirty(true);
    };

    /** “이 지도에서 검색” */
    const handleSearchHere = () => {
        fetchPOI();
    };

    /** 시트 실제 높이를 CSS 변수(--sheet-body-h)에 반영 */
    useEffect(() => {
        const el = sheetBodyRef.current;
        if (!el) return;

        const apply = () => {
            const h = isSheetOpen ? el.clientHeight : 0;
            document.documentElement.style.setProperty("--sheet-body-h", `${h}px`);
        };

        apply();

        const ro = new ResizeObserver(apply);
        ro.observe(el);
        window.addEventListener("resize", apply);
        window.addEventListener("orientationchange", apply);

        return () => {
            ro.disconnect();
            window.removeEventListener("resize", apply);
            window.removeEventListener("orientationchange", apply);
        };
    }, [isSheetOpen, places.length]);

    return (
        <div className={`map-page ${isSheetOpen ? "sheet-open" : "sheet-closed"}`}>
            {/* 좌측 패널(데스크톱) / 상단 블록(모바일) */}
            <div className="side-panel">
                <h3>카테고리</h3>

                {/* 카테고리 “바” */}
                <div className="cat-section">
                    <div className="cat-toggle-group">
                        {/* 1행: 관광/음식 */}
                        <div className="cat-row row-2">
                            {["TOUR", "FOOD"].map((key) => {
                                const { label, shortLabel } = CODES[key];
                                const checked = !!activeCat[key];
                                const color = CAT_COLORS[key] || "#999";
                                return (
                                    <label
                                        key={key}
                                        className={`cat-toggle ${checked ? "on" : ""}`}
                                        style={{ "--cat": color }}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setActiveCat((prev) => ({ ...prev, [key]: !prev[key] }));
                                            setIsDirty(true);
                                        }}
                                    >
                                        <input type="checkbox" checked={checked} readOnly />
                                        <span className="cat-icon" aria-hidden />
                                        <span className="cat-label">{isMobile ? shortLabel : label}</span>
                                    </label>
                                );
                            })}
                        </div>

                        {/* 2행: 카페/숙소/주차장 */}
                        <div className="cat-row row-3">
                            {["CAFE", "HOTEL", "PARK"].map((key) => {
                                const { label, shortLabel } = CODES[key];
                                const checked = !!activeCat[key];
                                const color = CAT_COLORS[key] || "#999";
                                return (
                                    <label
                                        key={key}
                                        className={`cat-toggle ${checked ? "on" : ""}`}
                                        style={{ "--cat": color }}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setActiveCat((prev) => ({ ...prev, [key]: !prev[key] }));
                                            setIsDirty(true);
                                        }}
                                    >
                                        <input type="checkbox" checked={checked} readOnly />
                                        <span className="cat-icon" aria-hidden />
                                        <span className="cat-label">{isMobile ? shortLabel : label}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* 모바일 전용 검색 버튼 (카테고리 밖/아래) */}
                <div className="search-inline mobile-only">
                    {isDirty && (
                        <button className="btn-search-inline" onClick={handleSearchHere}>
                            🔍 이 지도에서 검색
                        </button>
                    )}
                </div>

                {/* 데스크톱 리스트 */}
                <h3 className="desk-only">검색 결과 ({places.length})</h3>
                <ul className="place-list desk-only">
                    {places.map((p) => {
                        const color = CAT_COLORS[p._catKey] || "#c1c1c1";
                        const key = placeKey(p);
                        const isSel = selectedKey === key;
                        return (
                            <li
                                key={key}
                                className={`place-item ${isSel ? "selected" : ""}`}
                                style={{ "--cat": color }}
                                onClick={() => handlePlaceClick(p)}
                            >
                                <span className="cat-icon sm" aria-hidden />
                                <div className="place-texts">
                                    <strong className="place-title">{p.place_name}</strong>
                                    <p className="place-addr">
                                        {p.road_address_name || p.address_name || ""}
                                    </p>
                                </div>
                                <span className="place-dist">
                                    {(p.distance / 1000).toFixed(2)} km
                                </span>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* 지도 */}
            <div id="map" className="map-container"></div>

            {/* 데스크톱 상단 중앙 버튼 */}
            <div className="map-topbar">
                {isDirty && (
                    <button className="btn-search-here" onClick={handleSearchHere}>
                        🔍 이 지도에서 검색
                    </button>
                )}
            </div>

            {/* 우측 컨트롤 */}
            <div className="map-controls">
                <button className="btn-my-location" onClick={handleMyLocation}>
                    📍 내 위치
                </button>
                <button className="btn-filter" onClick={() => setShowFilter(true)}>
                    ⚙ 설정
                </button>
            </div>

            {/* 모바일 하단 시트 */}
            <div
                className={`list-sheet ${isSheetOpen ? "open" : "closed"}`}
                role="dialog"
                aria-label="검색 결과 목록"
            >
                <button
                    className="sheet-header"
                    onClick={() => setIsSheetOpen((v) => !v)}
                    aria-expanded={isSheetOpen}
                    aria-controls="sheet-body"
                >
                    <span className="drag-handle" />
                    <strong>검색 결과 ({places.length})</strong>
                    <span className="toggle-tip">{isSheetOpen ? "접기" : "펼치기"}</span>
                </button>

                <div id="sheet-body" ref={sheetBodyRef} className="sheet-body">
                    <ul className="place-list mobile-only">
                        {places.map((p) => {
                            const color = CAT_COLORS[p._catKey] || "#c1c1c1";
                            const key = placeKey(p);
                            const isSel = selectedKey === key;
                            return (
                                <li
                                    key={key}
                                    className={`place-item ${isSel ? "selected" : ""}`}
                                    style={{ "--cat": color }}
                                    onClick={() => handlePlaceClick(p)}
                                >
                                    <span className="cat-icon sm" aria-hidden />
                                    <div className="place-texts">
                                        <strong className="place-title">{p.place_name}</strong>
                                        <p className="place-addr">
                                            {p.road_address_name || p.address_name || ""}
                                        </p>
                                    </div>
                                    <span className="place-dist">
                                        {(p.distance / 1000).toFixed(2)} km
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>

            {/* 필터 모달 */}
            {showFilter && (
                <FilterModal
                    radius={radius}
                    sortType={sortType}
                    onClose={() => setShowFilter(false)}
                    onApply={(newSort, newRadius) => {
                        setSortType(newSort);
                        setRadius(newRadius);
                        setShowFilter(false);
                        setIsDirty(true);
                    }}
                />
            )}
        </div>
    );
}

/** 필터 모달 */
function FilterModal({ onClose, onApply, radius, sortType }) {
    const [localSort, setLocalSort] = useState(sortType);
    const [localRadius, setLocalRadius] = useState(radius);

    return (
        <div className="filter-modal" role="dialog" aria-modal="true">
            <div className="modal-content">
                <h3>설정</h3>

                <div className="filter-section">
                    <p>조회기준</p>
                    <div className="sort-btns">
                        <button
                            className={localSort === "distance" ? "on" : ""}
                            onClick={() => setLocalSort("distance")}
                        >
                            거리순
                        </button>
                        <button
                            className={localSort === "popular" ? "on" : ""}
                            onClick={() => setLocalSort("popular")}
                        >
                            인기순
                        </button>
                    </div>
                </div>

                <div className="filter-section">
                    <p>조회거리</p>
                    <input
                        type="range"
                        min="500"
                        max="8000"
                        step="500"
                        value={localRadius}
                        onChange={(e) => setLocalRadius(Number(e.target.value))}
                    />
                    <p>{(localRadius / 1000).toFixed(1)} km</p>
                </div>

                <div className="modal-actions">
                    <button
                        className="btn btn-primary btn-block"
                        onClick={() => onApply(localSort, localRadius)}
                    >
                        설정완료
                    </button>
                    <button className="btn btn-ghost btn-block" onClick={onClose}>
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}

/** 유틸: 지도 리레이아웃 보정 */
function relayoutMap(mapRef) {
    const map = mapRef.current;
    if (!map) return;
    const center = map.getCenter();
    map.relayout();
    map.setCenter(center);
}
