import React, { useState } from 'react';
import '../css/Form.css';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Form() {
  const navigate = useNavigate();
  const [rightPanelActive, setRightPanelActive] = useState(false);

  const [userid, setUserid] = useState('');
  const [userpw, setUserpw] = useState('');
  const [username, setUsername] = useState('');
  const [tel, setTel] = useState('');
  const [email, setEmail] = useState('');

  const [loginId, setLoginId] = useState('');
  const [loginPw, setLoginPw] = useState('');


  const [emailCode, setEmailCode] = useState('');
  const [sentCode, setSentCode] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerId, setTimerId] = useState(null);
  const [isEmailLocked, setIsEmailLocked] = useState(false);

  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    let message = '';
    switch (name) {
      case 'userid':
        if (!value) message = '아이디를 입력해주세요.';
        else if (!/^[A-Za-z0-9]{8,20}$/.test(value))
          message = '영문/숫자 8~20자로 입력해주세요.';
        break;
      case 'userpw':
        if (!value) message = '비밀번호를 입력해주세요.';
        else if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!*@#$._])[A-Za-z\d!*@#$._]{8,}$/.test(value))
          message = '8자 이상, 영문·숫자·특수문자 포함';
        break;
      case 'username':
        if (!value) message = '이름을 입력해주세요.';
        else if (!/^[가-힣]{2,5}$/.test(value))
          message = '한글 2~5글자로 입력해주세요.';
        break;
      case 'tel':
        if (!value) message = '전화번호를 입력해주세요.';
        else if (!/^010\d{8}$/.test(value))
          message = '010으로 시작하는 11자리 숫자여야 합니다.';
        break;
      case 'email':
        if (!value) message = '이메일을 입력해주세요.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          message = '유효한 이메일 형식이 아닙니다.';
        break;
      default:
    }
    setErrors(prev => ({ ...prev, [name]: message }));
  };

  const getValidationMessage = (name, value) => {
    switch (name) {
      case 'userid':
        if (!value) return '아이디를 입력해주세요.';
        if (!/^[A-Za-z0-9]{8,20}$/.test(value)) return '영문/숫자 8~20자로 입력해주세요.';
        return '';
      case 'userpw':
        if (!value) return '비밀번호를 입력해주세요.';
        if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!*@#$._])[A-Za-z\d!*@#$._]{8,}$/.test(value))
          return '8자 이상, 영문·숫자·특수문자 포함';
        return '';
      case 'username':
        if (!value) return '이름을 입력해주세요.';
        if (!/^[가-힣]{2,5}$/.test(value)) return '한글 2~5글자로 입력해주세요.';
        return '';
      case 'tel':
        if (!value) return '전화번호를 입력해주세요.';
        if (!/^010\d{8}$/.test(value)) return '010으로 시작하는 11자리 숫자여야 합니다.';
        return '';
      case 'email':
        if (!value) return '이메일을 입력해주세요.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return '유효한 이메일 형식이 아닙니다.';
        return '';
      default:
        return '';
    }
  };

  const handleEmailAuthSend = async () => {
  if (!email) {
    alert("이메일을 입력해주세요.");
    return;
  }

  if (timer > 0) {
    alert(`⏳ 인증은 ${Math.floor(timer / 60)}분 ${timer % 60}초 뒤에 다시 요청 가능합니다.`);
    return;
  }

  try {
    const response = await axios.post("http://localhost/api/email/send", { email });
    if (response.data?.code) {
      setSentCode(response.data.code);
      alert("✅ 인증번호가 이메일로 전송되었습니다.");
      setIsEmailLocked(true);
      setTimer(240);

      const id = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(id);
            setTimerId(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setTimerId(id);
    } else {
      alert("⚠ 인증번호 전송 실패");
    }
  } catch (err) {
    alert("이메일 전송 실패: " + err.message);
  }
};

const handleEmailAuthVerify = () => {
  if (emailCode === sentCode) {
    alert("🎉 이메일 인증 완료");
    setIsEmailVerified(true);
    if (timerId) clearInterval(timerId);
    setTimer(0);
  } else {
    alert("❌ 인증번호가 일치하지 않습니다.");
  }
};

  const handleSignUp = async e => {
     e.preventDefault();
      if (!isEmailVerified) {
      alert("이메일 인증을 완료해주세요.");
      return;
    }

    const fields = { userid, userpw, username, tel, email };
    const newErrors = {};
    for (const [name, val] of Object.entries(fields)) {
      const err = getValidationMessage(name, val);
      if (err) newErrors[name] = err;
    }
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    try {
      await axios.post('http://localhost/api/users', {
        userid,
        userpw,
        username,
        tel,
        email,
      });
      alert('회원가입이 완료되었습니다!');
      setRightPanelActive(false);
      setUserid('');
      setUserpw('');
      setUsername('');
      setTel('');
      setEmail('');
      setErrors({});
    } catch (error) {
      alert('회원가입 실패: ' + (error.response?.data?.message || error.message));
    }
  };

 const handleLogin = async e => {
  e.preventDefault();
  try {
    const res = await axios.post('http://localhost/api/users/login', {
      userid: loginId,
      userpw: loginPw
    });

    alert('로그인 성공');

    sessionStorage.setItem("token", res.data.token);
    const userInfo = {
      id: res.data.id,
      userid: res.data.userid,
      username: res.data.username,
      role: res.data.role,
      email: res.data.email,
      tel: res.data.tel
    };
    sessionStorage.setItem("user", JSON.stringify(userInfo));
    window.dispatchEvent(new Event("userLogin"));
    navigate('/');
  } catch (err) {
    alert('로그인 실패: ' + (err.response?.data || err.message));
  }
};



  return (
    <div className="container-wrapper form-page" style={{
      background: 'url("/img/Login.jpg") center/cover fixed no-repeat',
      minHeight: '100vh', display: 'grid', placeItems: 'center', paddingTop: '10px'
    }}>
      <div className="mobile-toggle">
        <button className={!rightPanelActive ? 'active' : ''} onClick={() => setRightPanelActive(false)}>Sign In</button>
        <button className={rightPanelActive ? 'active' : ''} onClick={() => setRightPanelActive(true)}>Sign Up</button>
      </div>

      <div className={`container ${rightPanelActive ? 'right-panel-active' : ''}`}>

        <div className="container__form container--signup">
          <form className="form" onSubmit={handleSignUp}>
            <h2 className="form__title">회원 가입</h2>

            <div className="field">
              <input className={`input ${errors.userid ? 'invalid' : ''}`} type="search" placeholder="아이디" value={userid}
                onChange={e => { setUserid(e.target.value); validateField('userid', e.target.value); }} />
              {errors.userid && <p className="error-msg">{errors.userid}</p>}
            </div>

            <div className="field">
              <input className={`input ${errors.userpw ? 'invalid' : ''}`} type="password" placeholder="비밀번호" value={userpw}
                onChange={e => { setUserpw(e.target.value); validateField('userpw', e.target.value); }} />
              {errors.userpw && <p className="error-msg">{errors.userpw}</p>}
            </div>

            <div className="field">
              <input className={`input ${errors.username ? 'invalid' : ''}`} type="search" placeholder="이름" value={username}
                onChange={e => { setUsername(e.target.value); validateField('username', e.target.value); }} />
              {errors.username && <p className="error-msg">{errors.username}</p>}
            </div>

            <div className="field">
              <input className={`input ${errors.tel ? 'invalid' : ''}`} type="search" placeholder="전화번호" value={tel}
                onChange={e => { setTel(e.target.value); validateField('tel', e.target.value); }} />
              {errors.tel && <p className="error-msg">{errors.tel}</p>}
            </div>

                <div className="field email-auth">
                  <input
                    className={`input ${errors.email ? 'invalid' : ''}`}
                    type="email"
                    placeholder="이메일"
                    value={email}
                    readOnly={isEmailLocked}
                    onChange={e => {
                      setEmail(e.target.value);
                      validateField('email', e.target.value);
                      setIsEmailVerified(false);
                      setIsEmailLocked(false);
                    }}
                  />
                  {!isEmailVerified && (
                    <button type="button" className="btn-small" onClick={handleEmailAuthSend}>
                      인증번호 받기
                    </button>
                  )}
                </div>
                {errors.email && <p className="error-msg">{errors.email}</p>}
                {timer > 0 && !isEmailVerified && (
                  <p className="timer-msg">
                    ⏳ 남은 시간: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                  </p>
                )}
                {sentCode && !isEmailVerified && (
                  <div className="field email-verify">
                    <input
                      className="input"
                      type="text"
                      placeholder="인증번호 입력"
                      value={emailCode}
                      onChange={e => setEmailCode(e.target.value)}
                    />
                    <button type="button" className="btn-small" onClick={handleEmailAuthVerify}>
                      인증 확인
                    </button>
                  </div>
                )}
                {isEmailVerified && (
                  <p className="success-msg">
                    ✅ 이메일 인증 완료
                  </p>
                )}
            <button className="btn" type="submit">회원 가입</button>
          </form>
        </div>

        <div className="container__form container--signin">
          <form className="form" onSubmit={handleLogin}>
            <h2 className="form__title">로그인</h2>
            <input className="input" type="text" placeholder="아이디" value={loginId} onChange={e => setLoginId(e.target.value)} />
            <input className="input" type="password" placeholder="비밀번호" value={loginPw} onChange={e => setLoginPw(e.target.value)} />
            <Link to="/findid" className="link">아이디 찾기</Link>
            <Link to="/findpw" className="link">비밀번호 찾기</Link>
            <button className="btn">로그인</button>
          </form>
        </div>

        <div className="container__overlay">
          <div className="overlay" style={{ background: 'url("/img/Login.jpg") center/cover no-repeat', backgroundBlendMode: 'overlay' }}>
            <div className="overlay__panel overlay--left">
              <button className="btn" onClick={() => setRightPanelActive(false)}>로그인</button>
            </div>
            <div className="overlay__panel overlay--right">
              <button className="btn" onClick={() => setRightPanelActive(true)}>회원 가입</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
