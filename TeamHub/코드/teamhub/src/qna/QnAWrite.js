import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/QnA.css';
import { useNavigate } from 'react-router-dom';

export default function QnAWrite() {
  const [form, setForm] = useState({
    category: '',
    title: '',
    content: '',
    username: ''
  });

  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem('user'));
  const defaultUsername = user?.username || '';
  const [useAnonymous, setUseAnonymous] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
  if (!user) {
    alert('로그인 후 이용 가능합니다.');
    navigate('/form');
  }
}, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const getFinalUsername = () => {
    return useAnonymous ? '익명' : defaultUsername;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await axios.post('/api/qna', {
      ...form,
      username: getFinalUsername(),
      isPrivate: isPrivate
    });
    alert('문의가 정상적으로 등록되었습니다.');
    navigate('/community/qna');
  } catch (error) {
    alert('등록 중 오류가 발생했습니다.');
    console.error(error);
  }
};

  return (
    <div className="qna-write-container">
      <h2 className="qna-title">1:1 문의 작성</h2>
      <form className="qna-write-form" onSubmit={handleSubmit}>
        <label>카테고리</label>
        <select name="category" value={form.category} onChange={handleChange} required>
          <option value="">선택하세요</option>
          <option value="객실예약">객실예약</option>
          <option value="수상레저">수상레저</option>
          <option value="실내액티비티">실내액티비티</option>
          <option value="결제/취소">결제/취소</option>
          <option value="기타">기타</option>
        </select>

        <label>제목</label>
        <input type="text" name="title" value={form.title} onChange={handleChange} required />

        <label>내용</label>
        <textarea name="content" value={form.content} onChange={handleChange} required rows="6" />

        <label>작성자</label>
        <div className="qna-writer-select">
          <label className="qna-writer-option">
            <input
              type="radio"
              name="writer"
              checked={!useAnonymous}
              onChange={() => setUseAnonymous(false)}
            />
            {defaultUsername || '로그인 사용자'}
          </label>
          <label className="qna-writer-option">
            <input
              type="radio"
              name="writer"
              checked={useAnonymous}
              onChange={() => setUseAnonymous(true)}
            />
            익명
          </label>
        </div>
        <label>공개 여부</label>
        <div className="qna-writer-select">
          <label className="qna-writer-option">
            <input
              type="radio"
              name="visibility"
              checked={!isPrivate}
              onChange={() => setIsPrivate(false)}
            />
            공개
          </label>
          <label className="qna-writer-option">
            <input
              type="radio"
              name="visibility"
              checked={isPrivate}
              onChange={() => setIsPrivate(true)}
            />
            비공개
          </label>
        </div>
        <button type="submit" className="qna-button">등록하기</button>
      </form>
    </div>
  );
}
