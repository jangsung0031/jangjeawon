import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../css/MyPageHome.css';

function MyPageHome() {
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);
  const [qnas, setQnas] = useState([]);
  const [qnaLoading, setQnaLoading] = useState(false);
  const [qnaError, setQnaError] = useState(null);
  const [activeQna, setActiveQna] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem('token');

    if (!token) {
      setError("토큰이 없습니다. 로그인이 필요합니다.");
      return;
    }

    console.log("보낼 토큰:", token);

    axios.get('http://localhost/api/users/userinfo', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        console.log("받은 유저 정보:", res.data);
        setUserInfo(res.data);
        setError(null);
      })
      .catch(err => {
        console.error("유저 정보 불러오기 실패:", err);
        if (err.response && err.response.data && err.response.data.error) {
          setError(err.response.data.error);
        } else {
          setError("유저 정보를 불러오는 중 오류가 발생했습니다.");
        }
      });
  }, []);
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) return;

    setQnaLoading(true);
    axios.get('http://localhost/api/qna/my', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        const list = Array.isArray(res.data) ? res.data : [];
        list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setQnas(list);
        setQnaError(null);
      })
      .catch(err => {
        console.error("내 문의 불러오기 실패:", err);
        setQnaError("내 문의 내역을 불러오는 중 오류가 발생했습니다.");
      })
      .finally(() => setQnaLoading(false));
  }, []);

  const statusText = (s) =>
    s === 'ANSWERED' ? '답변완료' : s === 'PENDING' ? '답변대기' : (s || '-');

  return (
    <div className="mypage-container">
      <h2 className='info'>내 정보</h2>

      {error && <p className="error-message">{error}</p>}

      {userInfo ? (
        <>
          <div className="mypage-userinfo">
            <p><strong>이름:</strong> {userInfo.username}</p>
            <p><strong>아이디:</strong> {userInfo.userid.replace(/(?<=.{2}).(?=.{2})/g, '*')}</p>
            <p><strong>이메일:</strong> {userInfo.email}</p>
            <p><strong>전화번호:</strong> {userInfo.tel}</p>
            <Link to="/mypage/editinfo" className="edit-button">개인정보 수정</Link>
          </div>
          
          <section>
            <h3>내 문의내역</h3>

            {qnaLoading && <p>불러오는 중…</p>}
            {qnaError && <p className="error-message">{qnaError}</p>}

            {!qnaLoading && !qnaError && (
              qnas.length === 0 ? (
                <p>문의 내역이 없습니다.</p>
              ) : (
                <ul>
                  {qnas.map(item => (
                    <li
                      key={item.id}
                      onClick={() =>
                        setActiveQna(prev => (prev?.id === item.id ? null : item))
                      }
                    >
                      <div>
                        <strong>{item.title}</strong>
                      </div>
                      <div>
                        {item.createdAt?.slice(0,10) || '-'} · {statusText(item.status)}
                        {item.category ? ` · #${item.category}` : ''}
                      </div>
                    </li>
                  ))}
                </ul>
              )
            )}
          </section>

          {activeQna && (
            <div onClick={() => setActiveQna(null)}>
              <div onClick={(e) => e.stopPropagation()}>
                <h4>{activeQna.title}</h4>
                <div>작성일: {activeQna.createdAt || '-'}</div>

                <div>
                  <strong>문의 내용</strong>
                  <p>{activeQna.content || '-'}</p>
                </div>

                <div>
                  <strong>답변</strong>
                  <p>{activeQna.answer || '아직 답변이 등록되지 않았습니다.'}</p>
                </div>

                <button className='btnbtn' onClick={() => setActiveQna(null)}>닫기</button>
              </div>
            </div>
          )}
        </>
      ) : !error ? (
        <p>로그인 정보를 불러오는 중입니다...</p>
      ) : null}
    </div>
  );
}

export default MyPageHome;
