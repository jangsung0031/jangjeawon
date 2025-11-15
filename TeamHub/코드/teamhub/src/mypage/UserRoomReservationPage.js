import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/UserWaterReservationPage.css';
import { fetchMyReviews } from '../mypage/api/reviewApi';

const UserRoomReservationPage = () => {
  const [reservations, setReservations] = useState([]);
  const [myReviews, setMyReviews] = useState([]);

  const authHeader = () => {
    const token = sessionStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchMyRoomReservations = async () => {
  const token = sessionStorage.getItem('token');
  if (!token) {
    alert("로그인이 필요합니다.");
    return;
  }

  try {
    const res = await axios.get('http://localhost/api/roomreservations', {
      headers: authHeader(),
      withCredentials: true,
    });
    setReservations(res.data);
  } catch (err) {
    console.error('[객실 예약 조회 실패]', err);
    alert('예약 정보가 없습니다.');
  }
};


  const fetchMyReviewData = async () => {
    try {
      const res = await fetchMyReviews();
      setMyReviews(res.data);
    } catch (err) {
      console.error('[리뷰 조회 실패]', err);
    }
  };

  useEffect(() => {
    fetchMyRoomReservations();
    fetchMyReviewData();
  }, []);

  const requestCancel = async (id) => {
    if (!window.confirm("정말 예약을 취소하시겠습니까?")) return;

    try {
      await axios.post(`http://localhost/api/roomreservations/${id}/cancel/confirm`, null, {
  headers: authHeader(),
  withCredentials: true,
});
      alert("취소가 완료 되었습니다.");
      fetchMyRoomReservations();
    } catch (err) {
      console.error("[객실 취소 요청 실패]", err);
      if (err.response && err.response.data) {
        alert(err.response.data);
      } else {
        alert("취소 요청 중 오류가 발생했습니다.");
      }
    }
  };

  const goToWriteReview = (reservationId) => {
    window.location.href = `/write-review?category=room&targetId=${reservationId}`;
  };

  const hasWrittenReview = (reservationId) => {
    return myReviews.some(
      (review) => review.targetId === reservationId && review.category === 'room'
    );
  };

  const isPast = (dateStr) => new Date(dateStr) < new Date();

  const isWithinReviewPeriod = (dateStr) => {
    const end = new Date(dateStr);
    const now = new Date();
    const diff = (now - end) / (1000 * 60 * 60 * 24);
    return diff > 0 && diff <= 14;
  };

  const isCancelable = (checkInDateStr) => {
    const checkInDate = new Date(checkInDateStr);
    const today = new Date();
    const diffDays = Math.floor((checkInDate - today) / (1000 * 60 * 60 * 24));
    return diffDays >= 3;
  };

  return (
    <div className="user-reserve-wrapper">
      <h2>객실 예약 관리</h2>

      {reservations.length > 0 ? (
        <table className="user-reserve-table">
          <thead>
            <tr>
              <th>예약자</th>
              <th>전화번호</th>
              <th>객실명</th>
              <th>체크인</th>
              <th>인원</th>
              <th>상태</th>
              <th>취소/리뷰</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((r) => {
              const isCancelled = r.status.includes("취소");

              return (
                <tr key={r.id}>
                  <td>{r.username}</td>
                  <td>{r.tel}</td>
                  <td>{r.roomName}</td>
                  <td>{r.checkInTime?.split(' ')[0]}</td>
                  <td>성인 {r.adults}, 아동 {r.children}, 유아 {r.infants}</td>
                  <td className={isCancelled ? "status-cancelled" : ""}>{r.status}</td>
                  <td>
                    {!isPast(r.checkOutTime) && isCancelable(r.checkInTime) && r.status === "예약완료" && (
                      <button className="cancel-btn" onClick={() => requestCancel(r.id)}>취소</button>
                    )}
                    {!isCancelable(r.checkInTime) && !isPast(r.checkOutTime) && r.status === "예약완료" && (
                      <span className="cancel-disabled-text">취소 불가</span>
                    )}
                    {isPast(r.checkOutTime) && isWithinReviewPeriod(r.checkOutTime) && r.status === "예약완료" && (
                      hasWrittenReview(r.id) ? (
                        <span className="complete-text">리뷰 완료</span>
                      ) : (
                        <button className="review-btn" onClick={() => goToWriteReview(r.id)}>리뷰 작성</button>
                      )
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className="no-reserve">예약 내역이 없습니다.</p>
      )}

      <div className="user-card-container">
        {reservations.map((r) => {
          const isCancelled = r.status.includes("취소");

          return (
            <div className="user-reserve-card" key={r.id}>
              <div><strong>예약자</strong> {r.username}</div>
              <div><strong>전화번호</strong> {r.tel}</div>
              <div><strong>객실명</strong> {r.roomName}</div>
              <div><strong>체크인</strong> {r.checkInTime?.split(' ')[0]}</div>
              <div><strong>인원</strong> 성인 {r.adults}, 아동 {r.children}, 유아 {r.infants}</div>
              <div><strong>상태</strong> <span className={isCancelled ? "status-cancelled" : ""}>{r.status}</span></div>
              <div className="user-reserve-button">
                {!isPast(r.checkOutTime) && isCancelable(r.checkInTime) && r.status === "예약완료" && (
                  <button className="cancel-btn" onClick={() => requestCancel(r.id)}>취소</button>
                )}
                {!isCancelable(r.checkInTime) && !isPast(r.checkOutTime) && r.status === "예약완료" && (
                  <span className="cancel-disabled-text">취소 불가</span>
                )}
                {isPast(r.checkOutTime) && isWithinReviewPeriod(r.checkOutTime) && r.status === "예약완료" && (
                  hasWrittenReview(r.id) ? (
                    <span className="complete-text">리뷰 완료</span>
                  ) : (
                    <button className="review-btn" onClick={() => goToWriteReview(r.id)}>리뷰 작성</button>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserRoomReservationPage;