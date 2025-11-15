// src/components/AdminUserList.js
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/AdminUserList.css';

const API = '/api';

function getAuthHeaders() {
  const token = sessionStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}
function normRole(r) {
  return String(r || '').trim().toUpperCase().replace(/^ROLE_/, '');
}
function formatDate(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
// 헤더 + 쿼리 모두 전달(백엔드 pickToken과 호환)
function withToken(url) {
  const t = sessionStorage.getItem('token');
  if (!t) return url;
  return `${url}${url.includes('?') ? '&' : '?'}token=${encodeURIComponent(t)}`;
}

export default function AdminUserList() {
  const nav = useNavigate();
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [expandedUid, setExpandedUid] = useState(null);
  const [details, setDetails] = useState({});            // { [uid]: detail | {_error} }
  const [loadingDetailUid, setLoadingDetailUid] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const url = withToken(`${API}/admin/open/users?page=${page}&size=${size}`);
      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      });
      if (!res.ok) {
        console.error('회원 목록 응답 실패', res.status, await res.text());
        setUsers([]); setTotalPages(0);
        return;
      }
      const data = await res.json();
      const content = Array.isArray(data?.content) ? data.content : [];

      // ✅ 관리자 숨김: 역할이 ADMIN 이거나 로그인아이디가 'admin'이면 제외
      const filtered = content.filter(u => {
        const r = normRole(u.role ?? u.userRole ?? u.authority);
        const loginId = (u.loginId ?? u.id ?? '').toString().trim().toLowerCase();
        return r !== 'ADMIN' && loginId !== 'admin';
      });

      setUsers(filtered);
      setTotalPages(data?.totalPages ?? 0);
      setExpandedUid(null);
    } catch (e) {
      console.error(e);
      setUsers([]); setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  const fetchDetail = useCallback(async (uid) => {
    setLoadingDetailUid(uid);
    try {
      const url = withToken(`${API}/admin/open/users/${uid}`);
      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      });
      if (!res.ok) {
        const txt = await res.text();
        console.error('회원 상세 응답 실패', res.status, txt);
        setDetails(prev => ({ ...prev, [uid]: { _error: res.status === 401 || res.status === 403 ? '권한이 없습니다.' : '상세 조회 실패' } }));
        return null;
      }
      const data = await res.json();
      setDetails(prev => ({ ...prev, [uid]: data }));
      return data;
    } catch (e) {
      console.error(e);
      setDetails(prev => ({ ...prev, [uid]: { _error: '네트워크 오류' } }));
      return null;
    } finally {
      setLoadingDetailUid(null);
    }
  }, []);

  useEffect(() => {
    const raw = (sessionStorage.getItem('role') || '').trim().toUpperCase();
    if (raw !== 'ADMIN' && raw !== 'ROLE_ADMIN') {
      alert('관리자 전용 페이지입니다.');
      nav('/admin/login');
      return;
    }
    fetchUsers();
  }, [fetchUsers, nav]);

  const canPrev = useMemo(() => page > 0, [page]);
  const canNext = useMemo(() => page < totalPages - 1, [page, totalPages]);

  const handleRowClick = async (uid) => {
    if (expandedUid === uid) { setExpandedUid(null); return; }
    setExpandedUid(uid);
    if (!details[uid]) await fetchDetail(uid);
  };

  return (
    <div className="admin-users-container">
      <div className="admin-users-header">
        <h2>회원 목록</h2>
      </div>

      <div className="admin-users-table-wrapper">
        <table className="admin-users-table">
          <thead>
            <tr>
              <th style={{width:'28%'}}>이름</th>
              <th style={{width:'34%'}}>아이디</th>
              <th style={{width:'38%'}}>가입일</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="center">불러오는 중...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={3} className="center">회원이 없습니다.</td></tr>
            ) : users.map(u => (
              <React.Fragment key={u.uid ?? u.id}>
                <tr className="row-clickable" onClick={() => handleRowClick(u.uid)}>
                  <td>
                    <button
                      type="button"
                      className="row-as-button"
                      aria-expanded={expandedUid === u.uid}
                      onClick={(e)=>{e.stopPropagation(); handleRowClick(u.uid);}}
                    >
                      {expandedUid === u.uid ? '▾ ' : '▸ '}{u.name ?? '-'}
                    </button>
                  </td>
                  <td>{u.loginId ?? u.id ?? '-'}</td>
                  <td>{formatDate(u.joinedAt || u.regDate)}</td>
                </tr>

                {expandedUid === u.uid && (
                  <tr className="detail-row">
                    <td colSpan={3}>
                      <div className="detail-card">
                        {loadingDetailUid === u.uid && !details[u.uid] ? (
                          <div className="center">상세 불러오는 중...</div>
                        ) : (() => {
                          const d = details[u.uid];
                          if (!d) return <div className="center">상세 정보가 없습니다.</div>;
                          if (d._error) return <div className="center" style={{color:'#cc3d3d'}}>⚠ {d._error}</div>;
                          return (
                            <div className="detail-grid">
                              <div className="detail-field">
                                <div className="label">이메일</div><div className="value">{d.email ?? '-'}</div>
                              </div>
                              <div className="detail-field">
                                <div className="label">닉네임</div><div className="value">{d.nickname ?? '-'}</div>
                              </div>
                              <div className="detail-field">
                                <div className="label">전화번호</div><div className="value">{d.phone ?? '-'}</div>
                              </div>
                              <div className="detail-field">
                                <div className="label">생년월일</div><div className="value">{d.birthdate ?? '-'}</div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-users-pagination">
        <button disabled={!canPrev} onClick={()=>setPage(p=>Math.max(0,p-1))}>이전</button>
        <span>{page+1} / {Math.max(1,totalPages)}</span>
        <button disabled={!canNext} onClick={()=>setPage(p=>p+1)}>다음</button>
      </div>
    </div>
  );
}
