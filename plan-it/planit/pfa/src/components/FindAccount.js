import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/FindAccount.css';

const FindAccount = () => {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({
    name: '', id: '',
    phone1: '', phone2: '',
    code1: '', code2: '',
    newPw: '', confirmNewPw: ''
  });
  const [readOnly1, setReadOnly1] = useState(false);
  const [readOnly2, setReadOnly2] = useState(false);
  const [showCode1, setShowCode1] = useState(false);
  const [showCode2, setShowCode2] = useState(false);
  const [verified1, setVerified1] = useState(false);
  const [verified2, setVerified2] = useState(false);
  const [foundId, setFoundId] = useState(null);

  const [timer1, setTimer1] = useState(0);
  const [timer2, setTimer2] = useState(0);

  const [pwError, setPwError] = useState('');
  const [confirmPwError, setConfirmPwError] = useState('');

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (timer1 > 0) {
      const t = setTimeout(() => setTimer1(timer1 - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timer1]);

  useEffect(() => {
    if (timer2 > 0) {
      const t = setTimeout(() => setTimer2(timer2 - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timer2]);

  const formatTime = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `⏳ 남은 시간: ${m}:${s}`;
  };

  // ✅ 전송 전에 서버에서 "이름+전화번호" / "아이디+전화번호" 매칭 검증하는 전용 엔드포인트로 호출
  const sendCode = async (type) => {
    try {
      if (type === 1) {
        // 아이디 찾기용: 이름 + 전화번호
        await axios.post('/api/sms/send/find-id', {
          name: inputs.name,
          phone: inputs.phone1
        });
      } else {
        // 비번 재설정용: 아이디 + 전화번호
        await axios.post('/api/sms/send/reset-password', {
          id: inputs.id,
          phone: inputs.phone2
        });
      }

      alert('인증번호 전송 완료');

      if (type === 1) {
        setShowCode1(true);
        setReadOnly1(true);
        setTimer1(240);
      } else {
        setShowCode2(true);
        setReadOnly2(true);
        setTimer2(240);
      }
    } catch (err) {
      const msg = err.response?.data || '';
      if (err.response?.status === 404) {
        alert(typeof msg === 'string' ? msg : '일치하지 않는 정보입니다.');
      } else if (err.response?.status === 400) {
        alert(typeof msg === 'string' ? msg : '요청이 올바르지 않습니다.');
      } else {
        alert('인증번호 전송에 실패했습니다.');
      }
    }
  };

  const verifyCode = async (type) => {
    const phone = type === 1 ? inputs.phone1 : inputs.phone2;
    const code  = type === 1 ? inputs.code1  : inputs.code2;
    try {
      const res = await axios.post('/api/sms/verify', { phone, code });
      if (res.data.success) {
        alert('인증 성공');
        if (type === 1) {
          setVerified1(true);
          setShowCode1(false);
          setTimer1(0);
        } else {
          setVerified2(true);
          setShowCode2(false);
          setTimer2(0);
        }
      } else {
        alert('인증 실패');
      }
    } catch {
      alert('인증 처리 중 오류가 발생했습니다.');
    }
  };

  // ✅ 아이디 찾기 (전화번호/이름 미일치 시 서버 404 → 알림)
  const handleFindId = async () => {
    try {
      const res = await axios.post('/api/sms/find-id', {
        name: inputs.name,
        phone: inputs.phone1
      });
      setFoundId(res.data.userId);
    } catch (err) {
      const msg = err.response?.data || '';
      if (err.response?.status === 404) {
        alert(typeof msg === 'string' ? msg : '일치하지 않는 정보입니다.');
      } else {
        alert('아이디 찾기에 실패했습니다.');
      }
    }
  };

  const validatePassword = () => {
    const pw = inputs.newPw || '';
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;

    if (pw.length < 8 || pw.length > 32) {
      setPwError('8자 이상 32자 이하로 입력해 주세요.');
      return false;
    } else if (!specialCharRegex.test(pw)) {
      setPwError('특수문자를 1개 이상 포함해 주세요.');
      return false;
    } else {
      setPwError('');
      return true;
    }
  };

  const validateConfirmPw = () => {
    if ((inputs.newPw || '') !== (inputs.confirmNewPw || '')) {
      setConfirmPwError('비밀번호가 일치하지 않습니다.');
      return false;
    } else {
      setConfirmPwError('');
      return true;
    }
  };

  // ✅ 비밀번호 재설정 (전화번호/아이디 미일치 시 404 → 알림)
  const handleResetPw = async () => {
    const pwValid = validatePassword();
    const confirmValid = validateConfirmPw();
    if (!pwValid || !confirmValid) return;

    try {
      await axios.post('/api/sms/reset-password', {
        id: inputs.id,
        phone: inputs.phone2,
        newPassword: inputs.newPw
      });
      alert('비밀번호 변경 완료');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data || '';
      if (err.response?.status === 404) {
        alert(typeof msg === 'string' ? msg : '일치하지 않는 정보입니다.');
      } else if (typeof msg === 'string' && msg.includes('기존 비밀번호')) {
        alert('기존과 동일한 비밀번호는 사용할 수 없습니다.');
      } else {
        alert('비밀번호 변경에 실패했습니다.');
      }
    }
  };

  return (
    <div className="find-container">
      <div className="find-box">
        <h2>아이디 찾기</h2>
        <input name="name" placeholder="이름" value={inputs.name} onChange={handleChange} />
        <input name="phone1" placeholder="전화번호" value={inputs.phone1} onChange={handleChange} readOnly={readOnly1} />
        {!timer1 && !verified1 && <button onClick={() => sendCode(1)}>인증번호 전송</button>}
        {timer1 > 0 && !verified1 && <p>{formatTime(timer1)}</p>}

        {showCode1 && (
          <>
            <input name="code1" placeholder="인증번호" value={inputs.code1} onChange={handleChange} />
            <button onClick={() => verifyCode(1)}>인증 확인</button>
          </>
        )}

        {verified1 && <button onClick={handleFindId}>아이디 보기</button>}
        {foundId && <div className="result">✅ 아이디: <b>{foundId}</b></div>}
      </div>

      <div className="find-box">
        <h2>비밀번호 재설정</h2>
        <input name="id" placeholder="아이디" value={inputs.id} onChange={handleChange} />
        <input name="phone2" placeholder="전화번호" value={inputs.phone2} onChange={handleChange} readOnly={readOnly2} />
        {!timer2 && !verified2 && <button onClick={() => sendCode(2)}>인증번호 전송</button>}
        {timer2 > 0 && !verified2 && <p>{formatTime(timer2)}</p>}

        {showCode2 && (
          <>
            <input name="code2" placeholder="인증번호" value={inputs.code2} onChange={handleChange} />
            <button onClick={() => verifyCode(2)}>인증 확인</button>
          </>
        )}

        {verified2 && (
          <>
            <input
              name="newPw"
              type="password"
              placeholder="새 비밀번호"
              value={inputs.newPw}
              onChange={handleChange}
              onBlur={validatePassword}
              className={pwError ? 'invalid' : ''}
            />
            {pwError && <div className="error">{pwError}</div>}

            <input
              name="confirmNewPw"
              type="password"
              placeholder="새 비밀번호 확인"
              value={inputs.confirmNewPw}
              onChange={handleChange}
              onBlur={validateConfirmPw}
              className={confirmPwError ? 'invalid' : ''}
            />
            {confirmPwError && <div className="error">{confirmPwError}</div>}

            <button onClick={handleResetPw}>비밀번호 변경</button>
          </>
        )}
      </div>
    </div>
  );
};

export default FindAccount;
