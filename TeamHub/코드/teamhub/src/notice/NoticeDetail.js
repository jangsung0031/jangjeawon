import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/QnA.css';

export default function NoticeDetail() {
  const { id } = useParams();
  const [notice, setNotice] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem('user'));
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    axios.get(`/api/notice/${id}`)
      .then(res => setNotice(res.data))
      .catch(err => {
        alert('공지사항을 불러오는 중 오류가 발생했습니다.');
        navigate('/community/notice');
      });
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      await axios.delete(`/api/notice/${id}`);
      alert('삭제되었습니다.');
      navigate('/community/notice');
    } catch (err) {
      alert('삭제 실패');
      console.error(err);
    }
  };

  if (!notice) return <div className="qna-container">로딩 중...</div>;

  return (
    <div className="qna-detail-container">
      <h2 className="qna-title">공지사항 상세보기</h2>
      <div className="qna-detail-box">
        <p><strong>제목:</strong> {notice.title}</p>
        <p><strong>작성일:</strong> {notice.createdAt}</p>
        <hr />
        <p><strong>내용</strong></p>
        <div className="qna-content">{notice.content}</div>

        <div style={{ marginTop: '30px' }}className="qna-button-group">
          <button onClick={() => navigate('/community/notice')} className="qna-button">
            목록으로
          </button>
          {isAdmin && (
            <>
              <button
                className="qna-button"
                style={{ marginLeft: '10px' }}
                onClick={() => navigate(`/community/notice/edit/${id}`)}
              >
                수정
              </button>
              <button
                className="qna-button"
                style={{ marginLeft: '10px', backgroundColor: '#dc3545' }}
                onClick={handleDelete}
              >
                삭제
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
