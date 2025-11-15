import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../css/EditInfo.css";

export default function EditInfo() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    userid: '',
    username: '',
    tel: '',
    email: ''
  });

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    console.log('[디버그] 토큰:', token);

    if (!token) {
      alert('로그인이 필요한 페이지입니다.');
      navigate('/form');
      return;
    }

    axios.get('http://localhost/api/users/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        console.log('[디버그] 유저 정보 수신:', res.data);
        setForm({
          userid: res.data.userid,
          username: res.data.username,
          tel: res.data.tel,
          email: res.data.email
        });
        sessionStorage.setItem('loginUser', JSON.stringify(res.data));
      })
      .catch(err => {
        console.error('[에러] 유저 정보 요청 실패:', err);
        alert('사용자 정보를 불러올 수 없습니다.');
        navigate('/form');
      });
  }, [navigate]);

  const validateField = (name, value) => {
    let message = '';
    switch (name) {
      case 'username':
        if (!value) message = '이름을 입력해주세요.';
        else if (!/^[가-힣]{2,5}$/.test(value)) message = '한글 2~5글자로 입력해주세요.';
        break;
      case 'tel':
        if (!value) message = '전화번호를 입력해주세요.';
        else if (!/^010\d{8}$/.test(value)) message = '010으로 시작하는 11자리 숫자여야 합니다.';
        break;
      case 'email':
        if (!value) message = '이메일을 입력해주세요.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = '유효한 이메일 형식이 아닙니다.';
        break;
      case 'newPw':
        if (value && !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!*@#$._])[A-Za-z\d!*@#$._]{8,}$/.test(value)) {
          message = '8자 이상, 영문·숫자·특수문자 포함';
        }
        break;
      default:
    }
    setErrors(prev => ({ ...prev, [name]: message }));
    return message;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'currentPw') setCurrentPw(value);
    else if (name === 'newPw') {
      setNewPw(value);
      validateField('newPw', value);
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
      validateField(name, value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    ['username', 'tel', 'email', 'newPw'].forEach((field) => {
      const val = field === 'newPw' ? newPw : form[field];
      const msg = validateField(field, val);
      if (msg) newErrors[field] = msg;
    });
    if (newPw && !currentPw) newErrors.currentPw = '현재 비밀번호를 입력해주세요.';

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.put(`http://localhost/api/users/${form.userid}`, {
        ...form,
        currentPw,
        newPw
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('[디버그] 수정 성공:', response.data);
      sessionStorage.removeItem("loginUser");

      const res = await axios.get('http://localhost/api/users/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });

      sessionStorage.setItem('loginUser', JSON.stringify(res.data));
      alert('회원 정보가 수정되었습니다.');
      navigate('/mypage');

    } catch (err) {
      console.error('[에러] 수정 실패:', err.response?.data || err.message);
      alert('수정 실패: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="editinfo-container">
      <h2>내 정보 수정</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>아이디 (수정불가):</label>
          <input type="text" value={form.userid} disabled />
        </div>
        <div>
          <label>이름:</label>
          <input name="username" type="text" value={form.username} onChange={handleChange} />
          {errors.username && <p className="error">{errors.username}</p>}
        </div>
        <div>
          <label>전화번호:</label>
          <input name="tel" type="text" value={form.tel} onChange={handleChange} />
          {errors.tel && <p className="error">{errors.tel}</p>}
        </div>
        <div>
          <label>이메일:</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} />
          {errors.email && <p className="error">{errors.email}</p>}
        </div>
        <div>
          <label>현재 비밀번호:</label>
          <input name="currentPw" type="password" value={currentPw} onChange={handleChange} />
          {errors.currentPw && <p className="error">{errors.currentPw}</p>}
        </div>
        <div>
          <label>새 비밀번호:</label>
          <input name="newPw" type="password" value={newPw} onChange={handleChange} />
          {errors.newPw && <p className="error">{errors.newPw}</p>}
        </div>
        <button type="submit">정보 수정</button>
      </form>
    </div>
  );
}