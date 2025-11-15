import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./FestivalList.css";

//const IMG_BASE = "http://localhost:8080";
const IMG_BASE = "";

/* 메인 리스트 페이지 사이즈(3x4) */
const PAGE_SIZE_MAIN = 12;
/* 상단 '오늘 서울' 섹션 페이지 사이즈 */
const PAGE_SIZE_TOP = 3;

/** 이미지 URL 정규화 */
function getImageUrl(path) {
  const base = `${IMG_BASE}/festival-img`;
  if (!path || String(path).trim() === "") return `${base}/default_img.png`;
  const p = String(path);
  if (p.startsWith("/festival-img/")) return `${IMG_BASE}${p}`;
  return `${base}/${p.replace(/^\/+/, "")}`;
}

/** 오늘 진행중인지 간단 체크 */
function isOpenToday(f) {
  try {
    const today = new Date();
    const s = new Date(f.startdate);
    const e = new Date(f.enddate);
    e.setHours(23, 59, 59, 999);
    return s <= today && today <= e;
  } catch {
    return false;
  }
}

/** 서울 여부 (데이터 편차 방어: '서울' 포함이면 OK) */
function isSeoul(f) {
  const c = (f.city || "").trim();
  return c.includes("서울");
}

/** 카드 컴포넌트 (인라인 제거) */
function FestivalCard({ fest, onClick }) {
  return (
    <article className="fest-card" onClick={onClick}>
      <div className="thumb-wrap">
        <img
          src={getImageUrl(fest.imagePath || "/festival-img/default_img.png")}
          alt={fest.name}
          onError={(e) => {
            e.currentTarget.src = `${IMG_BASE}/festival-img/default_img.png`;
          }}
        />
      </div>

      <div className="fest-body">
        <h3 className="fest-title" title={fest.name}>
          {fest.name}
        </h3>
        <p className="fest-addr" title={fest.addr}>
          {fest.addr}
        </p>
        <p className="fest-date">
          {fest.startdate} ~ {fest.enddate}
        </p>
      </div>
    </article>
  );
}

/** 공통 페이징 훅 */
function usePagination(items, pageSize, deps = []) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageSafe = Math.min(Math.max(1, page), totalPages);
  const start = (pageSafe - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = items.slice(start, end);

  const goPage = (p) => {
    const next = Math.min(Math.max(1, p), totalPages);
    if (next !== page) {
      setPage(next);
    }
  };

  const pageNumbers = useMemo(() => {
    const maxShow = 7;
    if (totalPages <= maxShow) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const half = Math.floor(maxShow / 2);
    let startNum = Math.max(1, pageSafe - half);
    let endNum = startNum + maxShow - 1;
    if (endNum > totalPages) {
      endNum = totalPages;
      startNum = endNum - maxShow + 1;
    }
    return Array.from({ length: endNum - startNum + 1 }, (_, i) => startNum + i);
  }, [pageSafe, totalPages]);

  return { page, pageSafe, pageItems, totalPages, pageNumbers, goPage, setPage };
}

export default function FestivalList() {
  const [festivals, setFestivals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [onlyOpen, setOnlyOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/festival/list");
        if (mounted) setFestivals(res.data || []);
      } catch (e) {
        console.error("❌ 축제 목록 불러오기 실패:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  /** 도시 목록 (중복 제거 + 정렬) */
  const cities = useMemo(() => {
    const set = new Set();
    festivals.forEach((f) => {
      if (f.city) set.add(f.city.trim());
    });
    return Array.from(set).sort();
  }, [festivals]);

  /** 🔝 오늘 서울에서 진행 중 (전체 → 3개 페이징) */
  const todaySeoulAll = useMemo(() => {
    const list = festivals.filter((f) => isOpenToday(f) && isSeoul(f));
    list.sort((a, b) => new Date(a.enddate) - new Date(b.enddate)); // 선택 정렬
    return list;
  }, [festivals]);

  const topPager = usePagination(todaySeoulAll, PAGE_SIZE_TOP, [todaySeoulAll]);

  /** 전체 리스트: 검색/필터 결과 */
  const filtered = useMemo(() => {
    let list = festivals;

    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter(
        (f) =>
          (f.name && f.name.toLowerCase().includes(needle)) ||
          (f.addr && f.addr.toLowerCase().includes(needle)) ||
          (f.city && f.city.toLowerCase().includes(needle)) ||
          (f.sigungu && f.sigungu.toLowerCase().includes(needle))
      );
    }
    if (city) list = list.filter((f) => f.city === city);
    if (onlyOpen) list = list.filter(isOpenToday);

    return list;
  }, [festivals, q, city, onlyOpen]);

  const mainPager = usePagination(filtered, PAGE_SIZE_MAIN, [filtered]);

  return (
    <div className="festival-page">
      {/* 검색/필터 바 */}
      <div className="toolbar">
        {/* ✅ type="search" 로 변경 */}
        <input
          type="search"
          inputMode="search"
          autoComplete="off"
          aria-label="축제 검색"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="축제명·지역 검색"
          className="toolbar-input"
        />

        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="toolbar-select"
        >
          <option value="">전체 지역</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <label className="toolbar-check">
          <input
            type="checkbox"
            checked={onlyOpen}
            onChange={(e) => setOnlyOpen(e.target.checked)}
          />
          오늘 진행 중
        </label>
        <div className="toolbar-count">총 {filtered.length}건</div>
      </div>

      {loading && <div className="loading">불러오는 중…</div>}

      {!loading && (
        <>
          {/* 🔥 상단 하이라이트: 오늘 서울에서 진행 중 (3개 페이징) */}
          {!!todaySeoulAll.length && (
            <>
              <h2 className="section-title">오늘 서울에서 진행 중</h2>

              {/* ✅ 3칸 그리드 고정 */}
              <div className="fest-grid fest-grid--three">
                {topPager.pageItems.map((fest) => (
                  <FestivalCard
                    key={fest.id}
                    fest={fest}
                    onClick={() => {
                      navigate(`/festival/${fest.id}`);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  />
                ))}
              </div>

              {topPager.totalPages > 1 && (
                <div className="pager pager--compact">
                  <button
                    className="page-btn"
                    disabled={topPager.page === 1}
                    onClick={() => topPager.goPage(1)}
                    aria-label="첫 페이지"
                  >
                    «
                  </button>
                  <button
                    className="page-btn"
                    disabled={topPager.page === 1}
                    onClick={() => topPager.goPage(topPager.page - 1)}
                    aria-label="이전 페이지"
                  >
                    ‹
                  </button>

                  {topPager.pageNumbers.map((n) => (
                    <button
                      key={n}
                      className={`page-num ${n === topPager.page ? "is-active" : ""}`}
                      onClick={() => topPager.goPage(n)}
                    >
                      {n}
                    </button>
                  ))}

                  <button
                    className="page-btn"
                    disabled={topPager.page === topPager.totalPages}
                    onClick={() => topPager.goPage(topPager.page + 1)}
                    aria-label="다음 페이지"
                  >
                    ›
                  </button>
                  <button
                    className="page-btn"
                    disabled={topPager.page === topPager.totalPages}
                    onClick={() => topPager.goPage(topPager.totalPages)}
                    aria-label="마지막 페이지"
                  >
                    »
                  </button>
                </div>
              )}
            </>
          )}

          {/* 전체 리스트 + 페이징 */}
          <h2 className="section-title">축제 리스트</h2>

          <div className="fest-grid">
            {mainPager.pageItems.map((fest) => (
              <FestivalCard
                key={fest.id}
                fest={fest}
                onClick={() => {
                  navigate(`/festival/${fest.id}`);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            ))}

            {!mainPager.pageItems.length && (
              <div className="empty">조건에 맞는 축제가 없습니다.</div>
            )}
          </div>

          {mainPager.totalPages > 1 && (
            <div className="pager">
              <button
                className="page-btn"
                disabled={mainPager.page === 1}
                onClick={() => mainPager.goPage(1)}
                aria-label="첫 페이지"
              >
                «
              </button>
              <button
                className="page-btn"
                disabled={mainPager.page === 1}
                onClick={() => mainPager.goPage(mainPager.page - 1)}
                aria-label="이전 페이지"
              >
                ‹
              </button>

              {mainPager.pageNumbers.map((n) => (
                <button
                  key={n}
                  className={`page-num ${n === mainPager.page ? "is-active" : ""}`}
                  onClick={() => mainPager.goPage(n)}
                >
                  {n}
                </button>
              ))}

              <button
                className="page-btn"
                disabled={mainPager.page === mainPager.totalPages}
                onClick={() => mainPager.goPage(mainPager.page + 1)}
                aria-label="다음 페이지"
              >
                ›
              </button>
              <button
                className="page-btn"
                disabled={mainPager.page === mainPager.totalPages}
                onClick={() => mainPager.goPage(mainPager.totalPages)}
                aria-label="마지막 페이지"
              >
                »
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
