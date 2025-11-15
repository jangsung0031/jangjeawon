import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/QnA.css';

export default function QnAManageDetail() {
  const { id } = useParams();
  const [qna, setQna] = useState(null);
  const [answer, setAnswer] = useState('');
  const navigate = useNavigate();


  const user = JSON.parse(sessionStorage.getItem('user'));
  const isAdmin = user?.role === 'admin';


  useEffect(() => {
    axios.get(`/api/qna/${id}`)
      .then(res => setQna(res.data))
      .catch(err => {
        console.error(err);
        alert('QnA 정보를 불러오는 중 오류가 발생했습니다.');
      });
  }, [id]);

  const handleDelete = async () => {
  const result = window.confirm('정말 이 QnA 글을 삭제하시겠습니까?');
  if (!result) return;

  try {
    await axios.delete(`/api/qna/${id}`);
    alert('QnA가 삭제되었습니다.');
    navigate('/admin/qna/manage');
  } catch (err) {
    console.error(err);
    alert('QnA 삭제에 실패했습니다.');
  }
};

  const handleSubmit = async () => {
    try {
      await axios.put('/api/qna/answer', {
        id,
        answer
      });
      alert('답변이 등록되었습니다.');
      navigate('/admin/qna/manage');
    } catch (err) {
      console.error(err);
      alert('답변 등록에 실패했습니다.');
    }
  };

  if (!qna) return <div className="qna-container">로딩 중...</div>;

  return (
    <div className="qna-container">
      <h2 className="qna-title">QnA 답변 작성</h2>
      <div className="admin-qna-detail-box">
        <p><strong>카테고리:</strong> {qna.category}</p>
        <p><strong>제목:</strong> {qna.title}</p>
        <p><strong>작성자:</strong> {qna.username}</p>
        <p><strong>작성일:</strong> {qna.createdAt?.substring(0, 10)}</p>
        <hr />
        <p><strong>질문 내용</strong></p>
        <div className="admin-qna-content">{qna.content}</div>

        <hr style={{ marginTop: '30px' }} />
        <p><strong>답변 작성</strong></p>
        <textarea
          className="admin-qna-answer"
          rows="5"
          placeholder="답변을 입력하세요"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />

        <div className="qna-button-group">
  <button className="qna-button register" onClick={handleSubmit}>답변 등록</button>
  <button className="qna-button list" onClick={() => navigate('/admin/qna/manage')}>목록으로</button>
  {isAdmin && (
    <button className="qna-button delete" onClick={handleDelete}>삭제</button>
  )}
</div>
      </div>
    </div>
  );
}
