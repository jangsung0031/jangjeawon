import React, { useEffect, useRef } from "react";
import "../css/KakaoCourseMap.css";

// 간단 캐시(페이지 생명주기 동안 재사용)
const memCache = new Map(); // key: addr, value: { x, y }

export default function KakaoCourseMap({ places = [], height = 360, level = 5 }) {
  const elRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const kakao = window.kakao;
    if (!kakao?.maps || !elRef.current) return;

    const map = new kakao.maps.Map(elRef.current, {
      center: new kakao.maps.LatLng(37.5665, 126.9780), // 서울시청
      level,
    });
    mapRef.current = map;

    const geocoder = new kakao.maps.services.Geocoder();
    const bounds = new kakao.maps.LatLngBounds();

    // 주소 리스트 추림
    const items = (places || []).filter(p => !!p?.addr);

    if (!items.length) {
      // 주소가 전혀 없으면 기본 중심만 보이도록
      setTimeout(() => {
        map.relayout();
        map.setLevel(level);
      }, 0);
      return;
    }

    // 병렬 요청을 과도하게 하지 않기 위해 동시성 제한
    const CONCURRENCY = 5;
    let active = 0;
    let index = 0;
    const markers = [];
    const queue = [];

    const processNext = () => {
      while (active < CONCURRENCY && index < items.length) {
        const place = items[index++];
        active++;

        resolveAddr(place.addr, geocoder)
          .then((coord) => {
            if (!coord) return;
            const pos = new kakao.maps.LatLng(coord.y, coord.x);
            bounds.extend(pos);

            const marker = new kakao.maps.Marker({ position: pos });
            markers.push(marker);

            const iw = new kakao.maps.InfoWindow({
              content: `
                <div class="custom-iw">
                  <strong>${place.title || "장소"}</strong><br/>
                  ${place.addr}
                </div>
              `,
            });
            kakao.maps.event.addListener(marker, "click", () => iw.open(map, marker));
          })
          .catch(() => {
            // 주소 변환 실패는 무시
          })
          .finally(() => {
            active--;
            processNext();
          });
      }

      // 모두 끝났을 때
      if (active === 0 && index >= items.length) {
        // 클러스터 + 경계 맞춤
        if (markers.length) {
          const clusterer = new kakao.maps.MarkerClusterer({
            map,
            averageCenter: true,
            minLevel: 7,
          });
          clusterer.addMarkers(markers);
          setTimeout(() => {
            map.relayout();
            if (markers.length === 1) {
              map.setCenter(markers[0].getPosition());
              map.setLevel(level);
            } else {
              map.setBounds(bounds);
            }
          }, 0);
        } else {
          // 변환에 전부 실패했을 때 기본만
          setTimeout(() => {
            map.relayout();
            map.setLevel(level);
          }, 0);
        }
      }
    };

    // 시작
    processNext();

    // resize 대응
    const onResize = () => map.relayout();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [places, height, level]);

  return <div ref={elRef} className="kakao-map" style={{ height }} />;
}

/** 주소 -> 좌표 (메모리 캐시 + 카카오 지오코더) */
async function resolveAddr(addr, geocoder) {
  if (memCache.has(addr)) return memCache.get(addr);

  const coords = await new Promise((resolve) => {
    geocoder.addressSearch(addr, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK && result?.[0]) {
        const { x, y } = result[0]; // x: 경도, y: 위도
        resolve({ x: Number(x), y: Number(y) });
      } else {
        resolve(null);
      }
    });
  });

  if (coords) memCache.set(addr, coords);
  return coords;
}
