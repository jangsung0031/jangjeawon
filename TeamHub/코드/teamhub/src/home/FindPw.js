import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Form.css';

export default function FindPw() {
  const [userid, setUserid] = useState('');
  const [tel, setTel] = useState('');
  const [code, setCode] = useState('');
  const [serverCode, setServerCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwConfirmError, setPwConfirmError] = useState('');

  const navigate = useNavigate();

  const handleRequestCode = async () => {
    try {
      const res = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userid, tel })
      });
      const data = await res.json();
      if (data.code) {
        setServerCode(data.code);
        setTimer(240);
        alert("인증번호가 발송되었습니다.");
      } else {
        alert("사용자 정보가 일치하지 않습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("인증번호 전송 실패");
    }
  };

  useEffect(() => {
    if (timer <= 0) {
      clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timer]);

  const handleVerify = () => {
    if (code === serverCode) {
      alert("인증 성공!");
      setIsVerified(true);
      clearInterval(timerRef.current);
    } else {
      alert("인증번호가 틀렸습니다.");
    }
  };

  const validatePassword = (value) => {
    if (!value) return '비밀번호를 입력해주세요.';
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!*@#$._])[A-Za-z\d!*@#$._]{8,}$/;
    if (!regex.test(value)) return '8자 이상, 영문·숫자·특수문자 포함';
    return '';
  };

  const validateConfirmPassword = (value, pw) => {
    if (!value) return '비밀번호를 다시 입력해주세요.';
    if (value !== pw) return '비밀번호가 일치하지 않습니다.';
    return '';
  };

  const handleResetPassword = async () => {
    const pwErr = validatePassword(newPw);
    const confirmErr = validateConfirmPassword(confirmPw, newPw);

    setPwError(pwErr);
    setPwConfirmError(confirmErr);
    if (pwErr || confirmErr) return;

    try {
      const res = await fetch('/api/users/resetpw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userid, newPassword: newPw })
      });
      if (res.ok) {
        alert("비밀번호가 재설정되었습니다.");
        navigate('/form');
      } else {
        alert("재설정 실패");
      }
    } catch (err) {
      console.error(err);
      alert("오류 발생");
    }
  };

  const formatTime = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="auth-page-wrapper"
      style={{
        background: 'url("/img/Login.jpg") center/cover no-repeat fixed',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <div className="auth-box">
        <h2>비밀번호 찾기</h2>

        <input className="input" type="text" placeholder="아이디"
          value={userid} onChange={e => setUserid(e.target.value)} />

        <input className="input" type="tel" placeholder="전화번호"
          value={tel} onChange={e => setTel(e.target.value)} readOnly={!!serverCode} />

        {!serverCode && <button className="btn" onClick={handleRequestCode}>인증번호 요청</button>}

        {serverCode && !isVerified && (
          <>
            <input className="input" type="text" placeholder="인증번호 입력"
              value={code} onChange={e => setCode(e.target.value)} />
            <button className="btn" onClick={handleVerify}>인증하기</button>
            <p style={{ color: '#555', fontSize: '0.9rem' }}>⏳ 남은 시간: {formatTime(timer)}</p>
          </>
        )}

        {isVerified && (
          <>
            <input
              className={`input ${pwError ? 'invalid' : ''}`}
              type="password"
              placeholder="새 비밀번호"
              value={newPw}
              onChange={e => {
                const value = e.target.value;
                setNewPw(value);
                setPwError(validatePassword(value));
                if (confirmPw) {
                  setPwConfirmError(validateConfirmPassword(confirmPw, value));
                }
              }}
            />
            {pwError && <div className="error-message">{pwError}</div>}

            <input
              className={`input ${pwConfirmError ? 'invalid' : ''}`}
              type="password"
              placeholder="새 비밀번호 확인"
              value={confirmPw}
              onChange={e => {
                const value = e.target.value;
                setConfirmPw(value);
                setPwConfirmError(validateConfirmPassword(value, newPw));
              }}
            />
            {pwConfirmError && <div className="error-message">{pwConfirmError}</div>}

            <button className="btn" onClick={handleResetPassword}>비밀번호 변경</button>
          </>
        )}
      </div>
    </div>
  );
}
