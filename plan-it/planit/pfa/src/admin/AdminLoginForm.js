// src/components/AdminLoginForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/LoginForm.css'; // 동일 스타일 사용
import logo from '../img/logo.png';

function normalizeRole(role) {
  return String(role || '').trim().toUpperCase().replace(/^ROLE_/, '');
}

const AdminLoginForm = () => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const token = sessionStorage.getItem('token');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', { id, password });
      const { token, role, nickname } = res.data;

      const roleNormalized = normalizeRole(role);

      if (roleNormalized !== 'ADMIN') {
        alert('관리자 계정만 로그인할 수 있습니다.');
        return;
      }

      sessionStorage.setItem('token', token);
      sessionStorage.setItem('role', roleNormalized); // ADMIN으로 저장
      sessionStorage.setItem('nickname', nickname);

      alert(`관리자님, 로그인 성공!`);
      navigate('/admin'); // 관리자 대시보드로 이동
    } catch (err) {
      console.error('로그인 실패:', err);
      const data = err.response?.data;

      if (data?.error === 'INVALID_ID') {
        alert('존재하지 않는 아이디입니다.');
      } else if (data?.error === 'INVALID_PASSWORD') {
        alert('비밀번호가 일치하지 않습니다.');
      } else {
        const message = typeof data === 'string' ? data : data?.message || err.message;
        alert('로그인 실패: ' + message);
      }
    }
  };

  useEffect(() => {
    if (token) {
      // 이미 로그인된 경우: role 확인해서 적절히 이동
      const roleStored = String(sessionStorage.getItem('role') || '').trim().toUpperCase();
      if (roleStored === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="login-container">
      <div className="login-left">
        <img src={logo} alt="Planit 로고" className="login-logo" />
        <h2>관리자 로그인<br />Planit Admin</h2>
      </div>
      <div className="login-right">
        <form onSubmit={handleLogin} className="login-form">
          <h2>관리자 로그인</h2>
          <input
            type="text"
            placeholder="관리자 아이디"
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="login-button">로그인</button>
          <div className="signup-link">
            <a href="/">← 메인으로 돌아가기</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginForm;
