// src/components/main/MainFestivalCarousel.jsx
import React, { useEffect, useMemo, useState } from "react";
import Slider from "react-slick";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../../css/main/MainFestivalCarousel.css";
import TravelCard from "./TravelCard";

/* =========================
   공통 유틸
========================= */

/** 디코드 → 금지문자/문장부호 정리 → 트리밍 */
function normalizeSegment(seg = "") {
  let s = String(seg);
  try { s = decodeURIComponent(s); } catch (_) { /* noop */ }

  // 자주 문제되는 문장부호들을 공백으로
  s = s.replace(/[,:;·•“”"‘’'`…–—]/g, " ");

  // 톰캣/윈도우 금지문자 제거
  s = s.replace(/[<>:"\\|?*\{\}\[\]\(\)]/g, "");

  // 공백 정리
  s = s.replace(/\s+/g, " ").trim();

  // NFC 정규화 (맥/윈도우 파일명 차이 대비)
  try { s = s.normalize("NFC"); } catch (_) { /* noop */ }

  return s;
}

/** 세그먼트 단위 안전 인코딩 */
function enc(seg = "") {
  return encodeURIComponent(seg);
}

/** 디렉터리/파일 분리 */
function splitDirAndFile(relPath = "") {
  const clean = String(relPath).replace(/^\/+|\/+$/g, "");
  const parts = clean.split("/");
  const file = parts.pop() || "";
  const dir = parts.join("/");
  return { dir, file };
}

/** 확장자 후보 생성(jpeg ↔ jpg) */
function extCandidates(file = "") {
  const m = file.match(/^(.*)\.(\w{3,4})$/);
  if (!m) return [file];
  const base = m[1];
  const ext = m[2].toLowerCase();
  if (ext === "jpeg") return [`${base}.jpeg`, `${base}.jpg`];
  if (ext === "jpg") return [`${base}.jpg`, `${base}.jpeg`];
  return [file];
}

/** /festival-img/** 기본 URL 빌더 (호스트/포트 X → CRA 프록시 사용) */
function baseUrl(dir, file) {
  const dirEnc = dir
    .split("/")
    .filter(Boolean)
    .map((d) => enc(normalizeSegment(d)))
    .join("/");
  const fileEnc = enc(normalizeSegment(file));
  return dirEnc ? `/festival-img/${dirEnc}/${fileEnc}` : `/festival-img/${fileEnc}`;
}

/** 원본 경로 → 여러 “대체 후보 URL” 생성 */
function buildCandidateUrls(path) {
  if (!path) return ["/festival-img/default_img.png"];

  // 절대 URL(https://)은 후보 없이 그대로
  if (/^https?:\/\//i.test(path)) return [path];

  // /festival-img/ 접두 제거
  const rel = String(path).replace(/^\/+/, "").replace(/^festival-img\//, "");
  const { dir, file } = splitDirAndFile(rel);

  const normFile = normalizeSegment(file);

  // 1차 후보: 기본 정규화
  const candidates = [baseUrl(dir, normFile)];

  // 2차 후보: 쉼표/중점 제거 버전
  const stripped = normFile.replace(/[,:;]/g, "");
  if (stripped !== normFile) candidates.push(baseUrl(dir, stripped));

  // 3차 후보: 한층 더 강한 파일명 정리(한글/영문/숫자/공백/._-만 남김)
  const hard = normFile.replace(/[^\p{L}\p{N}\s._-]/gu, "");
  if (hard !== normFile) candidates.push(baseUrl(dir, hard));

  // 4차: 확장자 스왑(jpeg↔jpg) 각 후보에 대해 확장자 교환
  const withExtSwap = [];
  for (const url of [...candidates]) {
    const m = url.match(/^(.*\/)([^\/]+)$/);
    if (!m) continue;
    const head = m[1];
    const tail = m[2];
    for (const e of extCandidates(tail)) {
      withExtSwap.push(head + e);
    }
  }
  for (const u of withExtSwap) {
    if (!candidates.includes(u)) candidates.push(u);
  }

  // 마지막: 디폴트
  candidates.push("/festival-img/default_img.png");

  // 중복 제거
  return Array.from(new Set(candidates));
}

/** 이미지 프리로드 (성공한 첫 후보 반환) */
async function tryResolveImage(urls, timeoutMs = 3500) {
  for (const u of urls) {
    const ok = await new Promise((res) => {
      const img = new Image();
      const t = setTimeout(() => {
        img.src = "";
        res(false);
      }, timeoutMs);
      img.onload = () => { clearTimeout(t); res(true); };
      img.onerror = () => { clearTimeout(t); res(false); };
      img.src = u;
    });

    if (ok) return u;
  }
  return "/festival-img/default_img.png";
}

/* =========================
   날짜/필터
========================= */

function isDefaultImage(path) {
  if (!path) return true;

  const file = String(path).split("/").pop()?.toLowerCase();
  return (
    file === "default_img.png" ||
    file === "default.png" ||
    file === "default.jpg" ||
    file === "default_img.jpg"
  );
}

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

/* =========================
   컴포넌트
========================= */

const MainFestivalCarousel = () => {
  const [items, setItems] = useState([]);     // 최종 카드
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false); // ✅ 모바일 감지
  const navigate = useNavigate();

  // ✅ 뷰포트 감지(초기 + 변경)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // 데이터 로드
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("/api/festival/recommend");
        if (!alive) return;

        const list = Array.isArray(data) ? data : [];

        // 정렬(오늘 진행중 우선 → 시작일 빠른 순)
        const sorted = list.sort((a, b) => {
          const aOpen = isOpenToday(a) ? 0 : 1;
          const bOpen = isOpenToday(b) ? 0 : 1;
          if (aOpen !== bOpen) return aOpen - bOpen;
          return new Date(a.startdate) - new Date(b.startdate);
        });

        // 디폴트 이미지는 후보에서 제외하고 시작
        const filtered = sorted.filter((f) => !isDefaultImage(f.imagePath));

        // 이미지 후보 생성 + 성공한 URL로 대체
        const resolved = await Promise.all(
          filtered.map(async (f) => {
            const candidates = buildCandidateUrls(f.imagePath);
            const okUrl = await tryResolveImage(candidates);
            return { id: f.id, title: f.name, addr: f.addr, image: okUrl };
          })
        );

        // 부족하면 보충
        let finalItems = resolved;
        if (resolved.length < 3) {
          const fallback = await Promise.all(
            sorted.slice(0, 10).map(async (f) => {
              const candidates = buildCandidateUrls(f.imagePath);
              const okUrl = await tryResolveImage(candidates);
              return { id: f.id, title: f.name, addr: f.addr, image: okUrl };
            })
          );
          const map = new Map();
          [...resolved, ...fallback].forEach((it) => map.set(it.id, it));
          finalItems = Array.from(map.values());
        }

        if (alive) setItems(finalItems);
      } catch (e) {
        console.error("❌ 메인 캐러셀 데이터 불러오기 실패:", e);
        if (alive) setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  /* ===== 슬라이더 설정 ===== */

  // PC 설정
  const pcSlidesToShow = 3;
  const safeCenter = items.length >= pcSlidesToShow;

  const pcSettings = useMemo(
    () => ({
      className: safeCenter ? "center" : "",
      centerMode: safeCenter,
      infinite: items.length > pcSlidesToShow,
      centerPadding: "60px",
      slidesToShow: pcSlidesToShow,
      slidesToScroll: 1,
      speed: 500,
      autoplay: true,
      autoplaySpeed: 4000,
      arrows: true,
      responsive: [
        { breakpoint: 1200, settings: { slidesToShow: Math.min(2, items.length || 1) } },
      ],
    }),
    [items.length, safeCenter]
  );

  // 모바일 설정(1장 풀폭, 옆 카드 안 비치게)
  const mobileSettings = useMemo(
    () => ({
      className: "mobile-one",
      centerMode: false,
      infinite: false,
      centerPadding: "0px",
      slidesToShow: 1,
      slidesToScroll: 1,
      speed: 400,
      arrows: false,
      dots: false,
      variableWidth: false,
      swipeToSlide: true,
      autoplay: false,
    }),
    []
  );

  // 설정 변경 시 리마운트 (핵심)
  const sliderKey = (isMobile ? "festival-m-" : "festival-pc-") + items.length;

  if (loading) return <div className="loading-text">인기 축제를 불러오는 중...</div>;
  if (!items.length) return <div className="loading-text">표시할 축제가 없습니다.</div>;

  return (
    <div className={`festival-carousel-container ${isMobile ? "is-mobile" : ""}`}>
      <h2 className="section-title">요즘 뜨는 인기 축제</h2>

      <Slider key={sliderKey} {...(isMobile ? mobileSettings : pcSettings)}>
        {items.map((f) => (
          <div key={f.id}>
            <div
              onClick={() => {
                navigate(`/festival/${f.id}`);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <TravelCard image={f.image} title={f.title} description={f.addr} />
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default MainFestivalCarousel;
