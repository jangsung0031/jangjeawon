import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../css/QnA.css';

export default function FAQEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    category: '',
    title: '',
    content: ''
  });

  const user = JSON.parse(sessionStorage.getItem('user'));
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      alert('접근 권한이 없습니다.');
      navigate('/community/faq');
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    axios.get(`/api/faq/${id}`)
      .then(res => setForm(res.data))
      .catch(err => {
        alert('FAQ를 불러오는 중 오류 발생');
        console.error(err);
        navigate('/community/faq');
      });
  }, [id, navigate]);

  const handleChange = (e) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/faq/${id}`, form);
      alert('FAQ가 수정되었습니다.');
      navigate(`/community/faq/${id}`);
    } catch (err) {
      alert('수정 중 오류가 발생했습니다.');
      console.error(err);
    }
  };

  return (
    <div className="qna-write-container">
      <h2 className="qna-title">FAQ 수정</h2>
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

        <button type="submit" className="qna-button">수정하기</button>
      </form>
    </div>
  );
}
