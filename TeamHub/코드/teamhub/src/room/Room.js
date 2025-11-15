import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays,
  addMonths, subMonths, isSameMonth, isSameDay, format,
  isBefore, isAfter
} from "date-fns";
import ko from "date-fns/locale/ko";
import { FaRegCalendarAlt } from "react-icons/fa";
import '../css/Room.css';

export default function Room() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);

  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [formData, setFormData] = useState({});
  const [soldOutRooms, setSoldOutRooms] = useState([]);
  const navigate = useNavigate();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const stayNights = checkIn && checkOut ? Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24)) : 0;
  const calcTotalPrice = (price) => stayNights > 0 ? price * stayNights : price;

  useEffect(() => {
    axios.get('/api/rooms')
      .then(res => setRooms(res.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (checkIn && checkOut) {
      const formatDateTime = (d) => {
        const pad = (n) => n < 10 ? '0' + n : n;
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      };
      axios.get('/api/roomreservations/soldout', {
        params: {
          checkIn: formatDateTime(new Date(checkIn.setHours(15, 0))),
          checkOut: formatDateTime(new Date(checkOut.setHours(11, 0)))
        }
      }).then(res => setSoldOutRooms(res.data))
        .catch(err => console.error(err));
    } else {
      setSoldOutRooms([]);
    }
  }, [checkIn, checkOut]);

  const handleDateClick = (day) => {
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(day);
      setCheckOut(null);
    } else if (checkIn && !checkOut) {
      if (isBefore(day, checkIn)) {
        setCheckIn(day);
      } else {
        setCheckOut(day);
      }
    }
  };

  const handleChange = (roomId, field, value) => {
    const room = rooms.find(r => r.id === roomId);
    const current = {
      adults: field === 'adults' ? Number(value) : Number(formData[roomId]?.adults || 0),
      children: field === 'children' ? Number(value) : Number(formData[roomId]?.children || 0),
      infants: field === 'infants' ? Number(value) : Number(formData[roomId]?.infants || 0),
    };
    const total = current.adults + current.children + current.infants;
    if (total > room.capacity) {
      alert(`이 객실은 최대 ${room.capacity}명까지 예약 가능합니다.`);
      return;
    }
    setFormData(prev => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        [field]: value
      }
    }));
  };

  const handleReserve = () => {
    if (!selectedRoomId || !checkIn || !checkOut) return alert("객실과 날짜를 선택하세요.");
    if (soldOutRooms.includes(selectedRoomId)) return alert("해당 객실은 매진되었습니다.");

    const options = formData[selectedRoomId] || {};
    const totalPeople = (options.adults || 0) + (options.children || 0) + (options.infants || 0);
    if (totalPeople < 1) return alert("최소 1명 이상 선택해야 합니다.");

    const fixedCheckIn = new Date(checkIn.setHours(15, 0, 0, 0));
    const fixedCheckOut = new Date(checkOut.setHours(11, 0, 0, 0));
    const formatDateTime = (d) => {
      const pad = (n) => n < 10 ? '0' + n : n;
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const selectedRoom = rooms.find(r => r.id === selectedRoomId);
    navigate("/roompay", {
      state: {
        room: selectedRoom,
        checkIn: formatDateTime(fixedCheckIn),
        checkOut: formatDateTime(fixedCheckOut),
        nights: stayNights,
        totalPrice: calcTotalPrice(selectedRoom.price),
        adults: options.adults || 0,
        children: options.children || 0,
        infants: options.infants || 0
      }
    });
  };

  const renderDays = () => {
    const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
    return (
      <div className="days-row">
        {weekDays.map(day => (
          <div className="day-name" key={day}>{day}</div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const isPast = isBefore(cloneDay, today) && !isSameDay(cloneDay, today);
        const isSelected = (checkIn && isSameDay(cloneDay, checkIn)) || (checkOut && isSameDay(cloneDay, checkOut));
        const isInRange = checkIn && checkOut && (
          isSameDay(cloneDay, checkIn) ||
          isSameDay(cloneDay, checkOut) ||
          (isAfter(cloneDay, checkIn) && isBefore(cloneDay, checkOut))
        );
        const isCheckIn = checkIn && isSameDay(cloneDay, checkIn);
        const isCheckOut = checkOut && isSameDay(cloneDay, checkOut);

        days.push(
          <div
            key={day}
            className={`cell ${!isSameMonth(day, monthStart) ? "disabled" : ""} ${isPast ? "past" : ""} ${isCheckIn ? "range-start" : ""} ${isCheckOut ? "range-end" : ""}`}
            onClick={() => {
              if (!isPast && isSameMonth(cloneDay, monthStart)) {
                handleDateClick(cloneDay);
              }
            }}
          >
            {isInRange && <div className="in-range"></div>}
            {isSelected ? (
              <div className="selected-date">{format(day, "d")}</div>
            ) : (
              format(day, "d")
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div className="row" key={day}>{days}</div>);
      days = [];
    }
    return <div className="body">{rows}</div>;
  };

  return (
    <div className="room-container">
      <div className="calendar-header">
        <button className="month-btn" onClick={prevMonth}>&lt;</button>
        {format(currentMonth, "yyyy년 M월", { locale: ko })}
        <button className="month-btn" onClick={nextMonth}>&gt;</button>
      </div>

      <div className="top-section">
        <div className="calendar-section">
          {renderDays()}
          {renderCells()}
        </div>
        <div className="info-section">
          {checkIn && checkOut && (
            <div className="date-range-box left-align">
              <FaRegCalendarAlt />
              <span>
                {format(checkIn, "MM.dd", { locale: ko })} ~ {format(checkOut, "MM.dd", { locale: ko })}, {stayNights}박 {stayNights + 1}일
              </span>
            </div>
          )}
          <ul>
            <li>[객실 이용 안내]</li>
            <li>1. 체크인 15:00 / 체크아웃 11:00</li>
            <li>2. 객실 내 금연, 애완동물 금지</li>
            <li>3. 미성년자 단독 예약 불가</li>
            <li>4. 고성방가 및 소음 자제</li><br />
            <li>[환불 안내]</li>
            <li>1. 체크인 7일 전: 100% 환불</li>
            <li>2. 체크인 3일 전 이내: 환불 불가</li>
          </ul>
        </div>
      </div>

      <h2>객실 선택</h2>
      {rooms.length === 0 ? <p>객실이 없습니다.</p> : (
        rooms.map(room => {
          const isSoldOut = soldOutRooms.includes(room.id);
          return (
            <div key={room.id} className={`room-card ${isSoldOut ? "sold-out" : ""}`}>
              <img src={room.imageUrl} alt={room.name} className="room-image" />
              <div className="room-info">
                <h3>{room.name}</h3>
                <p>{room.type} · {room.capacity}명</p>
                <p className="room-desc">{room.description}</p>
                {!isSoldOut && (
                  <div className="room-options">
                    <label>성인</label>
                    <input type="number" min="0" value={formData[room.id]?.adults || 0} onChange={(e) => handleChange(room.id, 'adults', e.target.value)} />
                    <label>아동</label>
                    <input type="number" min="0" value={formData[room.id]?.children || 0} onChange={(e) => handleChange(room.id, 'children', e.target.value)} />
                    <label>유아</label>
                    <input type="number" min="0" value={formData[room.id]?.infants || 0} onChange={(e) => handleChange(room.id, 'infants', e.target.value)} />
                  </div>
                )}
              </div>
              <div className="room-action-box">
                <div className="room-price">
                  {calcTotalPrice(room.price).toLocaleString()}원
                  {stayNights > 0 && <span> ({stayNights}박)</span>}
                </div>
                {isSoldOut ? (
                  <div className="room-soldout">매진</div>
                ) : (
                  <button className="reserve-btn" onClick={() => {
                    setSelectedRoomId(room.id);
                    handleReserve();
                  }}>
                    예약하기
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
