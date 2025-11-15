import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../css/CommentBox.css";

const API = "/api";
const PAGE_SIZE = 5;

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

export default function CommentBox({ courseId, headers, nickname, token }) {
  const [page, setPage] = useState({ content: [], totalPages: 0, number: 0 });
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  // 수정 상태
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const goLogin = useCallback(() => {
    const next = encodeURIComponent(location.pathname + location.search);
    alert("로그인이 필요합니다.");
    navigate(`/login?next=${next}`);
  }, [location.pathname, location.search, navigate]);

  // JWT role 파싱
  const payload = useMemo(() => parseJwt(token), [token]);
  const roleRaw = payload?.role ?? payload?.auth ?? payload?.authorities ?? null;
  const normalizedRole = useMemo(() => {
    if (typeof roleRaw === "string") return roleRaw;
    if (Array.isArray(roleRaw) && roleRaw.length) return roleRaw[0];
    return null;
  }, [roleRaw]);

  // Authorization 헤더
  const authHeader = useMemo(() => {
    const t = token || sessionStorage.getItem("token");
    const fromProps = headers && headers.Authorization;
    return fromProps || (t ? `Bearer ${t}` : null);
  }, [headers, token]);

  // 공개 요청 헤더
  const publicHeaders = useMemo(() => {
    return headers || { "Content-Type": "application/json" };
  }, [headers]);

  // 인증 요청 공통 헤더 (Authorization + X-Auth-Token 동시 전송)
  const authJsonHeaders = useMemo(() => {
    const base = { "Content-Type": "application/json" };
    if (headers) Object.assign(base, headers);
    const t =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.substring(7)
        : token || sessionStorage.getItem("token");
    if (authHeader) base.Authorization = authHeader;
    if (t) base["X-Auth-Token"] = t; // 프록시가 Authorization을 떨궈도 백업 헤더
    return base;
  }, [headers, authHeader, token]);

  const fetchPageAppend = useCallback(
    async (pageNum) => {
      try {
        const r = await fetch(
          `${API}/course/${courseId}/comments?page=${pageNum}&size=${PAGE_SIZE}`,
          { headers: publicHeaders }
        );
        if (!r.ok) return;
        const d = await r.json();
        if (pageNum === 0) setPage(d);
        else setPage((prev) => ({ ...d, content: [...prev.content, ...d.content] }));
      } catch (e) {
        console.error("댓글 불러오기 실패:", e);
      }
    },
    [courseId, publicHeaders]
  );

  const fetchPageReplace = useCallback(
    async (pageNum) => {
      try {
        const r = await fetch(
          `${API}/course/${courseId}/comments?page=${pageNum}&size=${PAGE_SIZE}`,
          { headers: publicHeaders }
        );
        if (!r.ok) return false;
        const d = await r.json();
        setPage(d);
        return d;
      } catch (e) {
        console.error("댓글 새로고침 실패:", e);
        return false;
      }
    },
    [courseId, publicHeaders]
  );

  useEffect(() => {
    fetchPageAppend(0);
  }, [fetchPageAppend]);

  // 등록
  const submit = async () => {
    const hasToken = authJsonHeaders.Authorization || authJsonHeaders["X-Auth-Token"];
    if (!hasToken) return goLogin();

    const content = text.trim();
    if (!content || busy) return;

    const optimistic = {
      id: `temp-${Date.now()}`,
      authorNickname: nickname || "나",
      content,
      createdAt: new Date().toISOString(),
      hidden: false, // 신규 댓글은 숨김 아님
    };

    setBusy(true);
    setPage((prev) => ({ ...prev, content: [optimistic, ...prev.content] }));
    setText("");

    try {
      const r = await fetch(`${API}/course/${courseId}/comments`, {
        method: "POST",
        headers: authJsonHeaders,
        body: JSON.stringify({ content }),
      });

      if (r.status === 401) {
        setPage((prev) => ({
          ...prev,
          content: prev.content.filter((c) => c.id !== optimistic.id),
        }));
        goLogin();
        return;
      }
      if (!r.ok) throw new Error("댓글 등록 실패");

      await fetchPageReplace(0);
    } catch (e) {
      setPage((prev) => ({
        ...prev,
        content: prev.content.filter((c) => c.id !== optimistic.id),
      }));
      alert(e.message || "댓글 등록 실패");
    } finally {
      setBusy(false);
    }
  };

  // 수정 시작/취소/저장
  const startEdit = (c) => {
    if (c.hidden) {
      alert("숨김 처리된 댓글은 수정할 수 없습니다.");
      return;
    }
    setEditingId(c.id);
    setEditingText(c.content);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };

  const saveEdit = async (commentId) => {
    const hasToken = authJsonHeaders.Authorization || authJsonHeaders["X-Auth-Token"];
    if (!hasToken) return goLogin();
    const content = editingText.trim();
    if (!content) return alert("내용을 입력하세요.");

    try {
      const r = await fetch(`${API}/course/${courseId}/comments/${commentId}`, {
        method: "PUT",
        headers: authJsonHeaders,
        body: JSON.stringify({ content }),
      });
      if (r.status === 401) return goLogin();
      if (!r.ok) throw new Error("댓글 수정 실패");

      await fetchPageReplace(page.number);
      cancelEdit();
    } catch (e) {
      alert(e.message || "댓글 수정 실패");
    }
  };

  // 삭제
  const remove = async (commentId) => {
    const hasToken = authJsonHeaders.Authorization || authJsonHeaders["X-Auth-Token"];
    if (!hasToken) return goLogin();
    if (!window.confirm("댓글을 삭제할까요?")) return;

    setPage((prev) => ({
      ...prev,
      content: prev.content.filter((c) => c.id !== commentId),
    }));

    try {
      const r = await fetch(`${API}/course/${courseId}/comments/${commentId}`, {
        method: "DELETE",
        headers: authJsonHeaders,
      });
      if (r.status === 401) return goLogin();
      if (!r.ok) throw new Error("삭제 실패");

      let d = await fetchPageReplace(page.number);
      if (d && d.content.length === 0 && d.number > 0) {
        await fetchPageReplace(d.number - 1);
      }
    } catch (e) {
      alert(e.message || "댓글 삭제 실패");
      await fetchPageReplace(page.number);
    }
  };

  const more = async () => {
    const next = page.number + 1;
    if (next >= page.totalPages) return;
    await fetchPageAppend(next);
  };

  const onKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      submit();
    }
  };

  // 신고 버튼 표시 조건
  const canReport = useCallback(
    (isMine) => {
      const hasToken = authJsonHeaders.Authorization || authJsonHeaders["X-Auth-Token"];
      if (!hasToken) return false;
      if (isMine) return false;
      const r = (normalizedRole || "").toUpperCase();
      return r === "USER" || r === "ROLE_USER";
    },
    [authJsonHeaders, normalizedRole]
  );

  // 신고
  const reportComment = async (commentId) => {
    const hasToken = authJsonHeaders.Authorization || authJsonHeaders["X-Auth-Token"];
    if (!hasToken) return goLogin();
    const reason = window.prompt("신고 사유를 입력하세요. (선택)", "") || "";

    try {
      const tokenVal =
        authJsonHeaders.Authorization?.startsWith("Bearer ")
          ? authJsonHeaders.Authorization.substring(7)
          : authJsonHeaders["X-Auth-Token"] || null;

      const url = `${API}/course/${courseId}/comments/${commentId}/report${
        tokenVal ? `?token=${encodeURIComponent(tokenVal)}` : ""
      }`;

      const r = await fetch(url, {
        method: "POST",
        headers: authJsonHeaders,
        body: JSON.stringify({ reason, token: tokenVal }),
      });

      const raw = await r.text();

      if (r.status === 401) {
        try {
          const d = JSON.parse(raw);
          alert(d?.message || "UNAUTHORIZED");
        } catch {
          alert("UNAUTHORIZED");
        }
        return;
      }
      if (r.status === 403) {
        alert("신고는 일반 사용자(ROLE_USER)만 가능합니다.");
        return;
      }
      if (r.status === 400) {
        try {
          const d = JSON.parse(raw);
          alert(d?.message || "본인 댓글은 신고할 수 없습니다.");
        } catch {
          alert("본인 댓글은 신고할 수 없습니다.");
        }
        return;
      }
      if (!r.ok) {
        try {
          const d = JSON.parse(raw);
          if (d?.message === "REPORTED") alert("이미 신고한 댓글입니다.");
          else alert("신고 처리에 실패했습니다.");
        } catch {
          alert("신고 처리에 실패했습니다.");
        }
        return;
      }

      alert("신고가 접수되었습니다.");
    } catch (e) {
      console.error(e);
      alert("신고 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="comment-box">
      <h3 className="comment-title">댓글</h3>

      <div className="comment-input">
        <textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="댓글을 입력하세요 (Ctrl/⌘+Enter로 등록)"
          className="comment-textarea"
        />
        <button onClick={submit} className="comment-submit" disabled={busy}>
          {busy ? "등록 중..." : "등록"}
        </button>
      </div>

      <ul className="comment-list">
        {page.content.map((c) => {
          const mine = nickname && c.authorNickname && nickname === c.authorNickname;
          const isHidden = !!c.hidden;
          const displayed = isHidden ? "신고로 인해 숨겨진 댓글입니다." : c.content;

          return (
            <li key={c.id} className="comment-item">
              <div className="comment-head">
                <div className="comment-author">{c.authorNickname}</div>
                <div className="comment-date">{new Date(c.createdAt).toLocaleString()}</div>

                {/* 내 댓글: 숨김이면 수정/삭제 버튼 숨김 */}
                {mine && !isHidden && (
                  <div className="comment-actions">
                    {editingId === c.id ? (
                      <>
                        <button className="comment-btn save" onClick={() => saveEdit(c.id)}>
                          저장
                        </button>
                        <button className="comment-btn cancel" onClick={cancelEdit}>
                          취소
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="comment-btn edit" onClick={() => startEdit(c)}>
                          수정
                        </button>
                        <button className="comment-btn delete" onClick={() => remove(c.id)}>
                          삭제
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* 다른 사람 댓글: 숨김이면 신고 버튼 숨김 */}
                {!mine && !isHidden && canReport(mine) && (
                  <div className="comment-actions">
                    <button className="comment-btn report" onClick={() => reportComment(c.id)}>
                      신고
                    </button>
                  </div>
                )}
              </div>

              {editingId === c.id ? (
                <textarea
                  className="comment-edit-textarea"
                  rows={3}
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                />
              ) : (
                <div className={`comment-content ${isHidden ? "muted" : ""}`}>{displayed}</div>
              )}
            </li>
          );
        })}
      </ul>

      {page.number + 1 < page.totalPages && (
        <div className="comment-more">
          <button onClick={more} className="comment-more-btn">
            더 보기
          </button>
        </div>
      )}
    </div>
  );
}
