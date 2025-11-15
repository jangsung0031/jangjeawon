import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/AdminRoomPage.css';

const AdminRoomPage = () => {
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
      const res = await axios.get('http://localhost/api/roomreservations/room-reservation/admin/paged', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          search,
          status: filterStatus || null,
          date: filterDate || null,
          page,
          size: 10,
        },
        withCredentials: true,
      });
      setReservations(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('객실 예약 목록 가져오기 실패:', err);
    }
  };

  const approveCancel = async (id) => {
    if (!window.confirm('정말 이 예약을 취소 처리하시겠습니까?')) return;

    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.post(`http://localhost/api/roomreservations/room-reservation/admin/${id}/cancel`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      alert(res.data);
      fetchReservations();
    } catch (err) {
      console.error('예약 취소 실패:', err);
      alert('취소 처리 중 오류 발생');
    }
  };

  return (
    <div className="admin-reserve-wrapper">
      <h2>객실 예약 관리</h2>
      <div className="filter-box">
        <input
          type="text"
          placeholder="예약자 이름 검색"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
        />
        <input
          type="date"
          value={filterDate}
          onChange={(e) => {
            setFilterDate(e.target.value);
            setPage(0);
          }}
        />
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setPage(0);
          }}
        >
          <option value="">전체 상태</option>
          <option value="예약완료">예약완료</option>
          <option value="취소요청">취소요청</option>
          <option value="취소완료">취소완료</option>
        </select>
      </div>

      <table className="reservation-table">
        <thead>
          <tr>
            <th>예약자</th>
            <th>객실명</th>
            <th>체크인</th>
            <th>체크아웃</th>
            <th>인원</th>
            <th>결제 금액</th>
            <th>상태</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {reservations.length > 0 ? (
            reservations.map((r) => (
              <tr key={r.id}>
                <td data-label="예약자">{r.username}</td>
                <td data-label="객실명">{r.roomName}</td>
                <td data-label="체크인">{r.checkInTime?.slice(0, 10)}</td>
                <td data-label="체크아웃">{r.checkOutTime?.slice(0, 10)}</td>
                <td data-label="인원">{`성인 ${r.adults}, 아동 ${r.children}, 유아 ${r.infants}`}</td>
                <td data-label="결제 금액">{r.paidAmount?.toLocaleString()}원</td>
                <td data-label="상태" className={r.status === '취소완료' ? 'canceled' : ''}>{r.status}</td>
                <td data-label="관리">
                 {r.status !== '취소완료' && (
                    <button onClick={() => approveCancel(r.id)}>취소</button>
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
          <button onClick={() => setPage((p) => Math.max(p - 1, 0))} disabled={page === 0}>
            ◀ 이전
          </button>
          <span>{page + 1} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))} disabled={page === totalPages - 1}>
            다음 ▶
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminRoomPage;
