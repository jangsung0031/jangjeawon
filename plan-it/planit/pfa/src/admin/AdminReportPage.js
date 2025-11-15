import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../css/AdminReportPage.css";

const API = "/api";
const PAGE_SIZE = 10;

function parseJwt(token) {
  try {
    if (!token) return null;
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/** 주어진 댓글 문자열이 '삭제됨' 표시인지 판별 */
function isDeletedContent(value) {
  const s = String(value ?? "").trim();
  // (삭제됨), 삭제됨, ( 삭제됨 ) 등 변형까지 허용
  return s.length === 0 || /^\(?\s*삭제됨\s*\)?$/i.test(s);
}

export default function AdminReportPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState({ content: [], totalPages: 0, number: 0 });
  const [loading, setLoading] = useState(false);

  const token = sessionStorage.getItem("token");
  const payload = useMemo(() => parseJwt(token), [token]);
  const roleRaw = payload?.role ?? payload?.auth ?? payload?.authorities ?? null;
  const isAdmin = useMemo(() => {
    const r = Array.isArray(roleRaw) ? String(roleRaw[0]) : String(roleRaw || "");
    const up = r.toUpperCase();
    return up === "ADMIN" || up === "ROLE_ADMIN";
  }, [roleRaw]);

  const headers = useMemo(() => {
    const h = { "Content-Type": "application/json" };
    if (token) {
      h.Authorization = `Bearer ${token}`;
      h["X-Auth-Token"] = token; // 백업 헤더
    }
    return h;
  }, [token]);

  const fetchPage = useCallback(
    async (pageNum = 0) => {
      setLoading(true);
      try {
        const url = `${API}/course/admin/reports?page=${pageNum}&size=${PAGE_SIZE}${
          token ? `&token=${encodeURIComponent(token)}` : ""
        }`;
        const res = await fetch(url, { headers });
        if (res.status === 401) {
          alert("로그인이 필요합니다.");
          navigate("/");
          return;
        }
        if (res.status === 403) {
          alert("관리자만 접근 가능합니다.");
          navigate("/");
          return;
        }
        const data = await res.json();
        setPage(data);
      } catch (e) {
        console.error(e);
        alert("신고 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [headers, navigate, token]
  );

  useEffect(() => {
    if (!token || !isAdmin) {
      alert("관리자만 접근 가능합니다.");
      navigate("/");
      return;
    }
    fetchPage(0);
  }, [token, isAdmin, fetchPage, navigate]);

  const prev = () => {
    if (page.number > 0) fetchPage(page.number - 1);
  };
  const next = () => {
    if (page.number + 1 < page.totalPages) fetchPage(page.number + 1);
  };

  const hideComment = async (commentId) => {
    if (!commentId) return;
    if (!window.confirm("이 댓글을 숨김(삭제) 처리할까요?")) return;
    try {
      const url = `${API}/course/admin/comments/${commentId}/hide${
        token ? `?token=${encodeURIComponent(token)}` : ""
      }`;
      const res = await fetch(url, { method: "POST", headers });
      if (res.status === 401) {
        alert("로그인이 필요합니다.");
        return;
      }
      if (res.status === 403) {
        alert("관리자만 가능합니다.");
        return;
      }
      if (!res.ok) {
        alert("숨김 처리에 실패했습니다.");
        return;
      }
      await fetchPage(page.number);
    } catch (e) {
      console.error(e);
      alert("숨김 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="admin-report-wrap">

      {loading ? (
        <div>불러오는 중...</div>
      ) : (
        <>
          <table className="report-table">
            <colgroup>
              <col className="col-course" />
              <col className="col-reporter" />
              <col className="col-reason" />
              <col className="col-comment" />
              <col className="col-date" />
              <col className="col-actions" />
            </colgroup>

            <thead>
              <tr>
                <th>코스</th>
                <th>신고자</th>
                <th>사유</th>
                <th>댓글 내용</th>
                <th>신고시간</th>
                <th>관리</th>
              </tr>
            </thead>

            <tbody>
              {page.content.map((r) => {
                const deleted = isDeletedContent(r.commentContent);

                return (
                  <tr key={r.id}>
                    <td>{r.courseTitle || `코스 #${r.courseId}`}</td>

                    <td>{r.reporterNickname ? `${r.reporterNickname}` : r.reporterId}</td>

                    <td className="ell" title={r.reason || "-"}>
                      {r.reason || "-"}
                    </td>

                    <td className="ell" title={deleted ? "삭제" : (r.commentContent || "삭제")}>
                      {r.hidden ? (
                        <span className="chip">신고로 인해 숨겨진 댓글입니다</span>
                      ) : deleted ? (
                        <span className="text-danger">삭제</span>
                      ) : (
                        r.commentContent
                      )}
                    </td>

                    <td className="cell-date">
                      {r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}
                    </td>

                    <td className="cell-actions">
                      <button
                        className="btn"
                        onClick={() => hideComment(r.commentId)}
                        disabled={!r.commentId || r.hidden}
                      >
                        {r.hidden ? "숨김됨" : "숨김"}
                      </button>
                    </td>
                  </tr>
                );
              })}

              {page.content.length === 0 && (
                <tr>
                  <td className="empty-row" colSpan={6}>
                    접수된 신고가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="pager">
            <button className="btn btn--outline" onClick={prev} disabled={page.number <= 0}>
              이전
            </button>
            <div className="pager__info">
              페이지 {page.number + 1} / {Math.max(page.totalPages, 1)}
            </div>
            <button
              className="btn btn--outline"
              onClick={next}
              disabled={page.number + 1 >= page.totalPages}
            >
              다음
            </button>
          </div>
        </>
      )}
    </div>
  );
}
