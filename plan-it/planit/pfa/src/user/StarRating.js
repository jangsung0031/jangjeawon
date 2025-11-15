import React, { useEffect, useState } from "react";
import { FiStar } from "react-icons/fi";
import "../css/StarRating.css";

const API = "/api";

/**
 * props
 * - courseId: 코스 ID (필수)
 * - headers: fetch 헤더 (Authorization 포함 가능)
 * - initialAvg, initialCount: 초기 표시값(선택)
 * - disabled: 로그인 X 등으로 비활성화할 때 true
 * - onChange?: (score:number) => void  // 선택: 별점 변경 콜백
 */
export default function StarRating({
  courseId,
  headers,
  initialAvg = 0,
  initialCount = 0,
  disabled = false,
  onChange,
}) {
  const [avg, setAvg] = useState(Number(initialAvg) || 0);
  const [count, setCount] = useState(Number(initialCount) || 0);
  const [my, setMy] = useState(0);       // 내가 준 점수
  const [hover, setHover] = useState(0); // 마우스 오버 점수
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API}/course/${courseId}/rating`, { headers });
        if (!r.ok) return; // 204 등
        const d = await r.json();
        setAvg(Number(d.avg ?? 0));
        setCount(Number(d.count ?? 0));
        setMy(Number(d.my ?? 0));
      } catch {
        /* no-op */
      }
    })();
  }, [courseId, headers]);

  const send = async (score) => {
    if (disabled || busy) {
      if (disabled) alert("로그인이 필요합니다.");
      return;
    }
    setBusy(true);

    // 낙관적 업데이트 (롤백 대비 이전 값 저장)
    const prev = { avg, count, my };
    const newCount = my ? count : count + 1;
    const newAvg = my
      ? ((avg * count) - my + score) / count
      : ((avg * count) + score) / (count + 1);

    setMy(score);
    setAvg(Number(newAvg.toFixed(2)));
    setCount(newCount);

    try {
      const r = await fetch(`${API}/course/${courseId}/rating`, {
        method: "POST",
        headers,
        body: JSON.stringify({ score }),
      });
      if (!r.ok) throw new Error("별점 등록 실패");
      onChange?.(score);
    } catch (e) {
      // 실패 시 롤백
      setAvg(prev.avg);
      setCount(prev.count);
      setMy(prev.my);
      alert(e.message || "별점 등록 실패");
    } finally {
      setBusy(false);
    }
  };

  // 키보드 접근성: 좌/우, 1~5 키로 조정
  const onKeyDown = (e) => {
    if (disabled) return;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      send(Math.min((my || 0) + 1, 5));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      send(Math.max((my || 0) - 1, 1));
    } else if (/^[1-5]$/.test(e.key)) {
      e.preventDefault();
      send(Number(e.key));
    }
  };

  return (
    <div
      className="star-rating"
      role="radiogroup"
      aria-label="별점 주기"
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const active = (hover || my) >= n;
        return (
          <button
            key={n}
            type="button"
            className={`star-button ${active ? "is-active" : ""}`}
            onClick={() => send(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            disabled={disabled || busy}
            role="radio"
            aria-checked={my === n}
            aria-label={`${n}점`}
            title={`${n}점`}
          >
            <FiStar className="star-icon" />
          </button>
        );
      })}
      <span className="star-info">
        {(Number.isFinite(avg) ? avg : 0).toFixed(2)} / 5 ({count})
      </span>
      {disabled && <span className="star-hint">로그인 후 평가할 수 있어요.</span>}
    </div>
  );
}
