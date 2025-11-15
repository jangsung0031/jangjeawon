import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/QnA.css';
import { useNavigate } from 'react-router-dom';

export default function NoticeWrite() {
  const [form, setForm] = useState({ title: '', content: '' });
  const navigate = useNavigate();

  const user = JSON.parse(sessionStorage.getItem('user')); 
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
  if (!isAdmin) {
    alert('접근 권한이 없습니다.');
    navigate('/community/notice');
  }
}, [isAdmin, navigate]);

  const handleChange = (e) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/notice', form);
      alert('공지사항이 등록되었습니다.');
      navigate('/community/notice');
    } catch (err) {
      alert('등록 실패');
      console.error(err);
    }
  };

  return (
    <div className="qna-write-container">
      <h2 className="qna-title">공지사항 작성</h2>
      <form className="qna-write-form" onSubmit={handleSubmit}>
        <label>제목</label>
        <input type="text" name="title" value={form.title} onChange={handleChange} required />
        <label>내용</label>
        <textarea name="content" value={form.content} onChange={handleChange} rows="6" required />
        <button type="submit" className="qna-button">등록하기</button>
      </form>
    </div>
  );
} 