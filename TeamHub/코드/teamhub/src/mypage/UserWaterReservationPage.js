import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/UserWaterReservationPage.css';
import { fetchMyReviews } from '../mypage/api/reviewApi';

const UserWaterReservationPage = () => {
  const [reservations, setReservations] = useState([]);
  const [myReviews, setMyReviews] = useState([]);

  const authHeader = () => {
    const token = sessionStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchMyReservations = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const res = await axios.get('http://localhost/api/reservation/my', {
        headers: authHeader(),
        withCredentials: true,
      });
      setReservations(res.data);
    } catch (err) {
      console.error('[내 예약 조회 실패]', err);
      alert('인증 실패 또는 예약 데이터 없음');
    }
  };

  const fetchMyReviewData = async () => {
    try {
      const res = await fetchMyReviews();
      setMyReviews(res.data);
    } catch (err) {
      console.error('[내 리뷰 조회 실패]', err);
    }
  };

  useEffect(() => {
    fetchMyReservations();
    fetchMyReviewData();
  }, []);

  const requestCancel = async (id) => {
    if (!window.confirm("정말 취소 요청하시겠습니까?")) return;

    try {
      await axios.post(`http://localhost/api/reservation/water-reservation/${id}/cancel/confirm`, null, {
  headers: authHeader(),
  withCredentials: true,
});

      alert("취소가 완료 되었습니다.");
      fetchMyReservations();
    } catch (err) {
      console.error("[취소 요청 실패]", err);
      alert("취소 요청 중 오류 발생");
    }
  };

  const goToWriteReview = (reservationId) => {
    window.location.href = `/write-review?category=activity&targetId=${reservationId}`;
  };

  const hasWrittenReview = (reservationId) => {
    return myReviews.some((review) => review.targetId === reservationId && review.category === 'activity');
  };

  const isPast = (dateStr) => new Date(dateStr) < new Date();

  const isWithinReviewPeriod = (dateStr) => {
    const end = new Date(dateStr);
    const now = new Date();
    const diff = (now - end) / (1000 * 60 * 60 * 24);
    return diff > 0 && diff <= 14;
  };

  const isCancelable = (dateStr) => {
  const reservationDate = new Date(dateStr);
  reservationDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffInMs = reservationDate - today;
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  return diffInDays >= 3;
};


  return (
    <div className="user-reserve-wrapper">
      <h2>수상레저 예약 관리</h2>

      {reservations.length > 0 ? (
        <table className="user-reserve-table">
          <thead>
            <tr>
              <th>예약자</th>
              <th>전화번호</th>
              <th>날짜</th>
              <th>시간</th>
              <th>인원</th>
              <th>상태</th>
              <th>취소/리뷰</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((r) => {
              const endDate = new Date(r.reservationDate);
              endDate.setDate(endDate.getDate() + 1);
              const isCancelled = r.status.includes("취소");

              return (
                <tr key={r.id}>
                  <td>{r.username}</td>
                  <td>{r.tel}</td>
                  <td>{r.reservationDate}</td>
                  <td>{r.ticketType}</td>
                  <td>{r.peopleCount}</td>
                  <td className={isCancelled ? "status-cancelled" : ""}>{r.status}</td>
                  <td>
                    {r.status === "예약완료" ? (
                      isCancelable(r.reservationDate) ? (
                        <button className="cancel-btn" onClick={() => requestCancel(r.id)}>취소</button>
                      ) : isPast(endDate) && isWithinReviewPeriod(endDate) ? (
                        hasWrittenReview(r.id) ? (
                          <span className="complete-text">리뷰 완료</span>
                        ) : (
                          <button className="review-btn" onClick={() => goToWriteReview(r.id)}>리뷰 작성</button>
                        )
                      ) : (
                        <span className="cancel-unavailable">취소 불가</span>
                      )
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className="no-reserve">예약이 없습니다.</p>
      )}

      <div className="user-card-container">
        {reservations.length > 0 ? (
          reservations.map((r) => {
            const endDate = new Date(r.reservationDate);
            endDate.setDate(endDate.getDate() + 1);
            const isCancelled = r.status.includes("취소");

            return (
              <div className="user-reserve-card" key={r.id}>
                <div><strong>예약자</strong> {r.username}</div>
                <div><strong>전화번호</strong> {r.tel}</div>
                <div><strong>날짜</strong> {r.reservationDate}</div>
                <div><strong>시간</strong> {r.ticketType}</div>
                <div><strong>인원</strong> {r.peopleCount}</div>
                <div><strong>상태</strong> <span className={isCancelled ? "status-cancelled" : ""}>{r.status}</span></div>
                <div className="user-reserve-button">
                  {r.status === "예약완료" ? (
                    isCancelable(r.reservationDate) ? (
                      <button className="cancel-btn" onClick={() => requestCancel(r.id)}>취소</button>
                    ) : isPast(endDate) && isWithinReviewPeriod(endDate) ? (
                      hasWrittenReview(r.id) ? (
                        <span className="complete-text">리뷰 완료</span>
                      ) : (
                        <button className="review-btn" onClick={() => goToWriteReview(r.id)}>리뷰 작성</button>
                      )
                    ) : (
                      <span className="cancel-unavailable">취소 불가</span>
                    )
                  ) : null}
                </div>
              </div>
            );
          })
        ) : (
          <p className="no-reserve">예약이 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default UserWaterReservationPage;
