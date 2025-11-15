import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/QnA.css';

export default function FAQDetail() {
  const { id } = useParams();
  const [faq, setFaq] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem('user'));
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    axios.get(`/api/faq/${id}`)
      .then(res => setFaq(res.data))
      .catch(err => {
        console.error(err);
        alert('FAQ를 불러오는 중 오류가 발생했습니다.');
        navigate('/community/faq');
      });
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      await axios.delete(`/api/faq/${id}`);
      alert('삭제되었습니다.');
      navigate('/community/faq');
    } catch (err) {
      alert('삭제 실패');
      console.error(err);
    }
  };

  if (!faq) return <div className="qna-container">로딩 중...</div>;

  return (
    <div className="qna-detail-container">
      <h2 className="qna-title">FAQ 상세보기</h2>
      <div className="qna-detail-box">
        <p><strong>카테고리:</strong> {faq.category}</p>
        <p><strong>제목:</strong> {faq.title}</p>
        <p><strong>작성일:</strong> {faq.createdAt?.substring(0, 10)}</p>
        <hr />
        <p><strong>내용</strong></p>
        <div className="qna-content">{faq.content}</div>

        <div style={{ marginTop: '30px' }}className="qna-button-group">
          <button onClick={() => navigate('/community/faq')} className="qna-button">
            목록으로
          </button>
          {isAdmin && (
            <>
              <button
                className="qna-button"
                onClick={() => navigate(`/community/faq/edit/${faq.id}`)}
                style={{ marginLeft: '10px', backgroundColor: '#0d6efd' }}
              >
                수정
              </button>
              <button
                className="qna-button"
                style={{ backgroundColor: '#dc3545', marginLeft: '10px' }}
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
