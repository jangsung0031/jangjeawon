import React, { useState } from 'react';
import axios from 'axios';
import '../css/WaterLeisureReservation.css';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ko from 'date-fns/locale/ko';

const WaterLeisureReservation = () => {
  const navigate = useNavigate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [formData, setFormData] = useState({
    ticketType: '',
    reservationDate: '',
    peopleCount: '1',
    status: '예약완료',
  });

  const [selectedDate, setSelectedDate] = useState(new Date());

  const getPrice = () => {
    const people = parseInt(formData.peopleCount) || 0;
    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const priceTable = {
      '오전권': isWeekend ? 100 : 100,
      '오후권': isWeekend ? 100 : 100,
      '종일권': isWeekend ? 100 : 100,
    };

    const unitPrice = priceTable[formData.ticketType] || 0;
    return unitPrice * people;
  };

  const isFormValid = () => {
    return (
      formData.ticketType &&
      parseInt(formData.peopleCount) > 0 &&
      selectedDate >= today
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      alert('입력값을 확인해주세요.');
      return;
    }

    if (getPrice() <= 0) {
      alert("유효한 결제 금액이 아닙니다.");
      return;
    }

    const fullDate = selectedDate.toISOString().slice(0, 10);
    const storedUser = JSON.parse(sessionStorage.getItem("user"));
    const userId = storedUser?.id;

    navigate('/payment', {
      state: {
        ticketType: formData.ticketType,
        date: fullDate,
        peopleCount: formData.peopleCount,
        totalPrice: getPrice(),
        userId: userId,
      },
    });
  };

  return (
    <div className="reservation-card">
      <h3>상품 선택하기</h3>

      <div className="ticket-button-group">
        {['오전권', '오후권', '종일권'].map((type) => (
          <button
            key={type}
            type="button"
            className={`ticket-button ${formData.ticketType === type ? 'active' : ''}`}
            onClick={() => setFormData((prev) => ({ ...prev, ticketType: type }))}
          >
            {type}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="date-picker-wrapper">
          <DatePicker
            selected={selectedDate}
            onChange={(date) => {
              setSelectedDate(date);
              setFormData((prev) => ({
                ...prev,
                reservationDate: date.toISOString().slice(0, 10),
              }));
            }}
            locale={ko}
            dateFormat="yyyy년 MM월 dd일"
            minDate={today}
            className="date-picker"
            placeholderText="날짜 선택"
          />
        </div>

        <div className="people-counter">
          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                peopleCount: Math.max(1, parseInt(prev.peopleCount) - 1).toString(),
              }))
            }
          >
            -
          </button>
          <span>{formData.peopleCount}</span>
          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                peopleCount: (parseInt(prev.peopleCount) + 1).toString(),
              }))
            }
          >
            +
          </button>
        </div>

        <div className="price-display">
          결제 금액: <strong>{getPrice().toLocaleString()}원</strong>
        </div>

        <button type="submit" className="submit-button" disabled={!isFormValid()}>
          티켓 구매하기
        </button>
      </form>
    </div>
  );
};

export default WaterLeisureReservation;
