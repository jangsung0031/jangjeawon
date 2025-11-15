import React, { useState } from 'react';
import '../css/Form.css';

export default function FindId() {
  const [username, setUsername] = useState('');
  const [tel, setTel] = useState('');
  const [result, setResult] = useState('');

  const maskUserid = (userid) => {
    if (userid.length <= 4) return userid.replace(/./g, '*');
    return userid.slice(0, 4) + '*'.repeat(userid.length - 4);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/users/findid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, tel }),
      });

      if (response.ok) {
        const userid = await response.text();
        const masked = maskUserid(userid);
        setResult(`당신의 아이디는 "${masked}" 입니다.`);
      } else {
        setResult('일치하는 회원 정보가 없습니다.');
      }
    } catch (error) {
      console.error(error);
      setResult('서버 오류가 발생했습니다.');
    }
  };

  return (
    <div
      className="auth-page-wrapper"
      style={{
        background: 'url("/img/Login.jpg") center/cover no-repeat fixed',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div className="auth-box">
        <h2>아이디 찾기</h2>
        <form onSubmit={handleSubmit}>
          <input
            className="input"
            type="text"
            placeholder="이름"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="input"
            type="tel"
            placeholder="전화번호"
            value={tel}
            onChange={(e) => setTel(e.target.value)}
          />
          <button className="btn" type="submit">
            아이디 찾기
          </button>
        </form>
        {result && <p className="link">{result}</p>}
      </div>
    </div>
  );
}
