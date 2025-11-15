import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/QnA.css';

export default function FAQWrite() {
  const [form, setForm] = useState({
    category: '',
    title: '',
    content: ''
  });
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem('user'));
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      alert('접근 권한이 없습니다.');
      navigate('/community/faq');
    }
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/faq', form);
      alert('FAQ가 등록되었습니다.');
      navigate('/community/faq');
    } catch (error) {
      alert('등록 중 오류가 발생했습니다.');
      console.error(error);
    }
  };

  return (
    <div className="qna-write-container">
      <h2 className="qna-title">FAQ 등록</h2>
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

        <button type="submit" className="qna-button">등록하기</button>
      </form>
    </div>
  );
}
