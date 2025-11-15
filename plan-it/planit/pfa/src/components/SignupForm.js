import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/SignupForm.css';
import logo from '../img/logo.png';

const SignupForm = () => {
  const [form, setForm] = useState({
    id: '',
    password: '',
    name: '',
    email: '',
    phone: '',
    nickname: '',
    birthdate: ''
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [nicknameChecked, setNicknameChecked] = useState(false);

  // ✅ 이메일/전화번호 중복 상태
  const [emailDuplicate, setEmailDuplicate] = useState(false);
  const [phoneDuplicate, setPhoneDuplicate] = useState(false);

  const navigate = useNavigate();
  const token = sessionStorage.getItem('token');

  // 이메일 인증 관련
  const [codeSent, setCodeSent] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateField = (name, value) => {
    let error = '';

    if (name === 'email') {
      if (!emailRegex.test(value)) {
        error = '이메일 형식이 올바르지 않습니다.';
      } else if (emailDuplicate) {
        error = '이메일이 중복되었습니다.';
      }
    }

    if (name === 'id' && !/^[a-zA-Z0-9_]{6,}$/.test(value)) {
      error = '6글자 이상의 영문자, 숫자, 특수기호(_)만 사용 가능합니다.';
    }

    if (name === 'password') {
      if (value.length < 8 || value.length > 32) {
        error = '8자 이상 32자 이하로 입력해 주세요.';
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
        error = '특수기호를 최소 1개 이상 포함해야 합니다.';
      }
    }

    if (name === 'passwordConfirm' && value !== form.password) {
      error = '동일한 비밀번호를 입력해 주세요.';
    }

    if (name === 'birthdate' && !value) {
      error = '생년월일은 필수 입력 항목입니다.';
    }

    if (name === 'name' && !/^[가-힣]{2,}$/.test(value)) {
      error = '이름은 한글 2자 이상만 입력 가능합니다.';
    }

    if (name === 'phone') {
      if (!/^\d{11}$/.test(value)) {
        error = '전화번호는 숫자만 11자 입력해 주세요.';
      } else if (phoneDuplicate) {
        error = '전화번호가 중복되었습니다.';
      }
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const hardResetEmailVerification = () => {
    setCodeSent(false);
    setIsVerified(false);
    setVerifyCode('');
    setInputCode('');
    setTimeLeft(0);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'passwordConfirm') {
      setConfirmPassword(value);
      validateField(name, value);
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));

    // 이메일/전화번호 입력이 바뀌면 중복 플래그 초기화
    if (name === 'email') {
      setEmailDuplicate(false);
      hardResetEmailVerification(); // ✅ 이메일 바뀌면 인증 흐름 초기화
    }
    if (name === 'phone') setPhoneDuplicate(false);

    validateField(name, value);
    if (name === 'nickname') setNicknameChecked(false);
  };

  // ✅ 이메일 중복 확인: 결과(boolean/null) 반환
  const checkEmailDuplicate = async () => {
    const email = form.email.trim();
    if (!email || !emailRegex.test(email)) return null;

    try {
      const res = await axios.get(`/api/auth/check-email`, { params: { email } });
      const dup = !!res.data?.duplicate;
      setEmailDuplicate(dup);
      setErrors((prev) => ({
        ...prev,
        email: dup ? '이메일이 중복되었습니다.' : ''
      }));
      // 중복이면 인증 흐름 즉시 차단
      if (dup) hardResetEmailVerification();
      return dup;
    } catch (err) {
      console.error('이메일 중복 확인 실패:', err);
      return null;
    }
  };

  // ✅ 전화번호 중복 확인
  const checkPhoneDuplicate = async () => {
    const phone = form.phone.trim();
    if (!phone || errors.phone) return;

    try {
      const res = await axios.get(`/api/auth/check-phone`, { params: { phone } });
      const dup = !!res.data?.duplicate;
      setPhoneDuplicate(dup);
      setErrors((prev) => ({
        ...prev,
        phone: dup ? '전화번호가 중복되었습니다.' : ''
      }));
    } catch (err) {
      console.error('전화번호 중복 확인 실패:', err);
    }
  };

  const checkNicknameDuplicate = async () => {
    if (!form.nickname) {
      alert('닉네임을 입력해주세요.');
      return;
    }

    try {
      const res = await axios.get(`/api/auth/check-nickname?nickname=${form.nickname}`);
      if (res.data.duplicate) {
        alert('이미 사용 중인 닉네임입니다.');
        setNicknameChecked(false);
      } else {
        alert('사용 가능한 닉네임입니다.');
        setNicknameChecked(true);
      }
    } catch (err) {
      alert('중복 확인 실패: ' + (err.response?.data || err.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 모든 필드 1차 유효성 검사
    for (const key of ['id', 'password', 'email', 'name', 'birthdate', 'phone']) {
      validateField(key, form[key]);
      if (!form[key] || errors[key]) {
        alert('필수 정보를 올바르게 입력해 주세요.');
        return;
      }
    }

    // 비밀번호 확인
    if (!confirmPassword || confirmPassword !== form.password) {
      alert('비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    // 닉네임 중복확인
    if (!nicknameChecked) {
      alert('닉네임 중복 확인을 해주세요.');
      return;
    }

    // 이메일/전화번호 중복 상태 최종 확인
    const dup = await checkEmailDuplicate(); // ← 반환값으로 즉시 판단
    await checkPhoneDuplicate();
    if (dup || emailDuplicate || phoneDuplicate) {
      alert('중복된 정보가 있습니다. 입력란 아래의 에러 메시지를 확인해 주세요.');
      return;
    }

    // 이메일 인증 확인
    if (!isVerified) {
      alert('이메일 인증을 완료해주세요.');
      return;
    }

    try {
      await axios.post('/api/auth/signup', form);
      alert('회원가입 성공!');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data || err.message || '';
      if (typeof msg === 'string') {
        if (msg.includes('email')) {
          setEmailDuplicate(true);
          setErrors((prev) => ({ ...prev, email: '이메일이 중복되었습니다.' }));
          hardResetEmailVerification();
        } else if (msg.includes('phone')) {
          setPhoneDuplicate(true);
          setErrors((prev) => ({ ...prev, phone: '전화번호가 중복되었습니다.' }));
        }
      }
      alert('회원가입 실패: ' + (err.response?.data || err.message));
    }
  };

  // 이메일 인증 요청
  const sendEmailCode = async () => {
    if (!form.email) {
      alert('이메일을 먼저 입력해 주세요.');
      return;
    }
    if (!emailRegex.test(form.email)) {
      alert('이메일 형식을 확인해 주세요.');
      return;
    }

    // ✅ 여기서도 중복 여부를 "반환값"으로 즉시 체크
    const dup = await checkEmailDuplicate();
    if (dup) {
      alert('이메일이 중복되었습니다. 다른 이메일을 입력해 주세요.');
      return;
    }

    try {
      const res = await axios.post('/api/auth/send-email-code', { email: form.email });
      setVerifyCode(res.data.code);
      setCodeSent(true);
      setTimeLeft(240);
      alert('인증 코드가 전송되었습니다.');
    } catch (err) {
      alert('이메일 전송 실패: ' + (err.response?.data || err.message));
    }
  };

  // 인증 코드 확인
  const handleVerify = async () => {
    try {
      const res = await axios.post('/api/auth/verify-email-code', {
        email: form.email,
        code: inputCode
      });

      if (res.status === 200) {
        setIsVerified(true);
        alert('이메일 인증 성공!');
      }
    } catch (err) {
      alert('인증 실패: ' + (err.response?.data || err.message));
    }
  };

  // 타이머 감소
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // 로그인 상태면 차단
  useEffect(() => {
    if (token) {
      alert('잘못된 접근입니다.');
      navigate('/mypage');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ 버튼/UI 제어용 플래그
  const disableEmailRequest =
    isVerified ||
    timeLeft > 0 ||
    !form.email ||
    !!errors.email ||
    emailDuplicate;

  return (
    <div className="signup-container">
      <div className="signup-left">
        <img src={logo} alt="Planit 로고" className="signup-logo" />
        <h2>AI와 함께 만드는 나만의 여행<br />Planit</h2>
      </div>

      <div className="signup-right">
        <form onSubmit={handleSubmit} className="signup-form">
          <h2>회원가입</h2>

          {/* 이메일 */}
<div className="input-group">
  <input
    type="text"
    name="email"
    placeholder="이메일"
    value={form.email}
    onChange={handleChange}
    onBlur={checkEmailDuplicate}
    className={errors.email ? 'invalid' : ''}
    readOnly={isVerified}
  />

  {/* ✅ 항상 버튼 표시하되 상태에 따라 비활성화 */}
  <button
    type="button"
    className="check-button"
    onClick={sendEmailCode}
    disabled={
      isVerified ||
      timeLeft > 0 ||
      !form.email ||
      !!errors.email ||
      emailDuplicate
    }
  >
    인증요청
  </button>

  {/* ✅ 오류 메시지 */}
  {errors.email && <div className="error-msg">{errors.email}</div>}
  {emailDuplicate && !errors.email && (
    <div className="error-msg">이메일이 중복되었습니다.</div>
  )}
</div>


          {/* 인증번호 입력: 중복 또는 형식 오류 시 표시 X */}
          {codeSent && !isVerified && !emailDuplicate && !errors.email && (
            <div className="input-group">
              <input
                type="text"
                placeholder="인증번호 6자리 입력"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
              />
              <button type="button" className="check-button" onClick={handleVerify}>확인</button>
              <div className="timer">⏳ {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}</div>
            </div>
          )}

          {/* 아이디 */}
          <div className="input-group">
            <input
              type="text"
              name="id"
              placeholder="아이디"
              value={form.id}
              onChange={handleChange}
              className={errors.id ? 'invalid' : ''}
            />
            {errors.id && <div className="error-msg">{errors.id}</div>}
          </div>

          {/* 비밀번호 */}
          <div className="input-group">
            <input
              type="password"
              name="password"
              placeholder="비밀번호"
              value={form.password}
              onChange={handleChange}
              className={errors.password ? 'invalid' : ''}
            />
            {errors.password && <div className="error-msg">{errors.password}</div>}
          </div>

          {/* 비밀번호 확인 */}
          <div className="input-group">
            <input
              type="password"
              name="passwordConfirm"
              placeholder="비밀번호 확인"
              value={confirmPassword}
              onChange={handleChange}
              className={errors.passwordConfirm ? 'invalid' : ''}
            />
            {errors.passwordConfirm && <div className="error-msg">{errors.passwordConfirm}</div>}
          </div>

          {/* 닉네임 */}
          <div className="input-group nickname-group">
            <input
              type="text"
              name="nickname"
              placeholder="닉네임"
              value={form.nickname}
              onChange={handleChange}
              className={errors.nickname ? 'invalid' : ''}
            />
            <button
              type="button"
              className="check-button"
              onClick={checkNicknameDuplicate}
              disabled={nicknameChecked}
            >
              {nicknameChecked ? '확인됨' : '중복확인'}
            </button>
          </div>

          {/* 이름 */}
          <div className="input-group">
            <input
              type="text"
              name="name"
              placeholder="이름"
              value={form.name}
              onChange={handleChange}
              className={errors.name ? 'invalid' : ''}
            />
            {errors.name && <div className="error-msg">{errors.name}</div>}
          </div>

          {/* 전화번호 */}
          <div className="input-group">
            <input
              type="text"
              name="phone"
              placeholder="전화번호"
              value={form.phone}
              onChange={handleChange}
              onBlur={checkPhoneDuplicate}
              className={errors.phone ? 'invalid' : ''}
            />
            {errors.phone && <div className="error-msg">{errors.phone}</div>}
          </div>

          {/* 생년월일 */}
          <div className="input-group">
            <input
              type="date"
              name="birthdate"
              placeholder="생년월일"
              value={form.birthdate}
              onChange={handleChange}
              className={errors.birthdate ? 'invalid' : ''}
            />
            {errors.birthdate && <div className="error-msg">{errors.birthdate}</div>}
          </div>

          <button type="submit" className="signup-button">회원가입</button>

          <div className="login-link">
            이미 회원이신가요? <a href="/login">로그인</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupForm;
