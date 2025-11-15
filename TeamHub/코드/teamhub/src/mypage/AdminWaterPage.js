import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/AdminWaterPage.css';

const AdminWaterPage = () => {
  const [reservations, setReservations] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchReservations();
  }, [search, filterStatus, filterDate, page]);

  const fetchReservations = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get('/api/reservation/admin/paged', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          search,
          status: filterStatus || null,
          date: filterDate || null,
          page,
          size: 10
        }
      });
      setReservations(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('예약 목록 가져오기 실패:', err);
    }
  };

  const cancelReservation = async (id) => {
    if (!window.confirm('정말 이 예약을 취소하시겠습니까?')) return;
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.post(`/api/reservation/admin/reservations/${id}/cancel`, null, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.data.success) {
        alert('예약 및 결제가 취소되었습니다.');
      } else {
        alert(`예약 상태는 변경되었지만 결제 취소에 실패했습니다.\n사유: ${res.data.message}`);
      }

      fetchReservations();
    } catch (err) {
      console.error('예약 취소 실패:', err);
      alert('예약 취소 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    setPage(0);
  }, [search, filterStatus, filterDate]);

  return (
    <div className="admin-reserve-wrapper">
      <h2>수상레저 예약 관리</h2>
      <div className="filter-box">
        <input
          type="text"
          placeholder="예약자 이름 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">전체 상태</option>
          <option value="예약완료">예약완료</option>
          <option value="취소 완료">취소 완료</option>
        </select>
      </div>
      <table className="reservation-table">
        <thead>
          <tr>
            <th>예약자</th>
            <th>전화번호</th>
            <th>날짜</th>
            <th>시간</th>
            <th>인원</th>
            <th>금액</th>
            <th>상태</th>
            <th>취소</th>
          </tr>
        </thead>
        <tbody>
          {reservations.length > 0 ? (
            reservations.map((r) => (
              <tr key={r.id}>
                <td>{r.username}</td>
                <td>{r.tel}</td>
                <td>{r.reservationDate?.split('T')[0] || r.reservationDate}</td>
                <td>{r.ticketType}</td>
                <td>{r.peopleCount}</td>
                <td>{r.amount?.toLocaleString()}원</td>
                <td className={r.status === '취소 완료' ? 'canceled' : ''}>{r.status}</td>
                <td>
                  {r.status !== '취소 완료' && (
                    <button onClick={() => cancelReservation(r.id)}>취소</button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8">예약이 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="review-pagination" style={{ marginTop: '2rem' }}>
          <button onClick={() => setPage(p => Math.max(p - 1, 0))} disabled={page === 0}>‹ 이전</button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={i === page ? 'active' : ''}
            >
              {i + 1}
            </button>
          ))}

          <button onClick={() => setPage(p => Math.min(p + 1, totalPages - 1))} disabled={page === totalPages - 1}>다음 ›</button>
        </div>
      )}
    </div>
  );
};

export default AdminWaterPage;
