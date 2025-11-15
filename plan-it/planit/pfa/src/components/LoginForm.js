// src/components/LoginForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../css/LoginForm.css';
import logo from '../img/logo.png';

function normalizeRole(role) {
  return String(role || '').trim().toUpperCase().replace(/^ROLE_/, '');
}

const LoginForm = () => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect');
  const token = sessionStorage.getItem('token');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', { id, password });
      const { token, role, nickname } = res.data;

      const roleNormalized = normalizeRole(role);

      // ✅ 관리자 계정은 일반 로그인 페이지에서 차단 + 관리자 로그인으로 이동
      if (roleNormalized === 'ADMIN') {
        alert('관리자 계정은 전용 로그인 페이지를 이용해주세요.');
        navigate('/admin/login');
        return;
      }

      sessionStorage.setItem('token', token);
      sessionStorage.setItem('role', roleNormalized); // ADMIN/USER 등으로 통일 저장
      sessionStorage.setItem('nickname', nickname);

      navigate(redirectTo || '/');
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
      alert('잘못된 접근입니다.');
      if (redirectTo) {
        navigate(redirectTo);
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
        <h2>AI와 함께 만드는 나만의 여행<br />Planit</h2>
      </div>
      <div className="login-right">
        <form onSubmit={handleLogin} className="login-form">
          <h2>로그인</h2>
          <input
            type="text"
            placeholder="아이디 또는 이메일"
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
          <div className="find-account-link">
            <a href="/find">아이디/비밀번호 찾기</a>
          </div>
          <button type="submit" className="login-button">로그인</button>
          <div className="signup-link">
            아직 회원이 아니신가요? <a href="/signup">회원가입</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
