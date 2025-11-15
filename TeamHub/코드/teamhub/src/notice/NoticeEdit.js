import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/QnA.css';
import { useParams, useNavigate } from 'react-router-dom';

export default function NoticeEdit() {
  const { id } = useParams();
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

  useEffect(() => {
    axios.get(`/api/notice/${id}`)
      .then(res => setForm(res.data))
      .catch(err => {
        alert('공지사항 불러오기 실패');
        console.error(err);
        navigate('/community/notice');
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
      await axios.put(`/api/notice/${id}`, form);
      alert('공지사항이 수정되었습니다.');
      navigate(`/community/notice/${id}`);
    } catch (err) {
      alert('수정 실패');
      console.error(err);
    }
  };

  return (
    <div className="qna-write-container">
      <h2 className="qna-title">공지사항 수정</h2>
      <form className="qna-write-form" onSubmit={handleSubmit}>
        <label>제목</label>
        <input type="text" name="title" value={form.title} onChange={handleChange} required />
        <label>내용</label>
        <textarea name="content" value={form.content} onChange={handleChange} rows="6" required />
        <button type="submit" className="qna-button">수정하기</button>
      </form>
    </div>
  );
}
