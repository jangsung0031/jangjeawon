import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/QnA.css';

export default function QnADetail() {
  const { id } = useParams();
  const [qna, setQna] = useState(null);
  const navigate = useNavigate();

  const user = JSON.parse(sessionStorage.getItem('user'));
  const isAdmin = user?.role === 'admin';

  const handleDelete = async () => {
    const result = window.confirm('정말 삭제하시겠습니까?');
    if (!result) return;

    try {
      await axios.delete(`/api/qna/${id}`);
      alert('삭제되었습니다.');
      navigate('/community/qna');
    } catch (err) {
      console.error(err);
      alert('삭제 실패');
    }
  };

  useEffect(() => {
    axios.get(`/api/qna/${id}`)
      .then(res => {
        const user = JSON.parse(sessionStorage.getItem('user'));
        const isAdmin = user?.role === 'admin';

        if (res.data.isPrivate && !isAdmin) {
          alert('비공개 QnA입니다.');
          navigate('/community/qna');
        } else {
          setQna(res.data);
        }
      })
      .catch(err => {
        console.error(err);
        alert('QnA를 불러오는 중 오류가 발생했습니다.');
      });
  }, [id]);

  if (!qna) return <div className="qna-container">로딩 중...</div>;

  return (
    <div className="qna-detail-container">
      <h2 className="qna-title">QnA 상세보기</h2>
      <div className="qna-detail-box">
        <p><strong>카테고리:</strong> {qna.category}</p>
        <p><strong>제목:</strong> {qna.title}</p>
        <p><strong>작성자:</strong> {qna.username}</p>
        <p><strong>작성일:</strong> {qna.createdAt?.substring(0, 10)}</p>
        <hr />
        <p><strong>질문 내용</strong></p>
        <div className="qna-content">{qna.content}</div>

        <hr style={{ marginTop: '30px' }} />
        <p><strong>관리자 답변</strong></p>
        {qna.answer ? (
          <div className="qna-answer">{qna.answer}</div>
        ) : (
          <div className="qna-answer">아직 답변이 등록되지 않았습니다.</div>
        )}

        <div className="qna-button-group">
          <button
            onClick={() => navigate('/community/qna')}
            className="qna-button list"
          >
            목록으로
          </button>
          {isAdmin && (
            <button
              onClick={handleDelete}
              className="qna-button delete"
            >
              삭제
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
