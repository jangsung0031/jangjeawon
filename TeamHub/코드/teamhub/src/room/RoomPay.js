import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../css/PaymentPage.css";

const RoomPay = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { room, checkIn, checkOut, nights, adults, children, infants, totalPrice } = location.state || {};
  const [isPaying, setIsPaying] = useState(false);

  const storedUser = JSON.parse(sessionStorage.getItem("user"));
  const token = sessionStorage.getItem("token");

  const username = storedUser?.username;
  const tel = storedUser?.tel;
  const userId = storedUser?.id;

  if (!room || !checkIn || !checkOut) {
    return (
      <div className="payment-container">
        <h2>잘못된 접근입니다</h2>
        <p>예약 정보를 다시 입력해주세요.</p>
        <button onClick={() => navigate("/")}>홈으로 돌아가기</button>
      </div>
    );
  }

  const formatDateTime = (date) => {
    const d = new Date(date);
    const pad = (n) => (n < 10 ? "0" + n : n);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const handlePayment = () => {
    if (isPaying) return;
    setIsPaying(true);

    if (!window.IMP) {
      alert("결제 라이브러리가 로드되지 않았습니다. 새로고침 후 다시 시도해주세요.");
      return;
    }

    if (!window.confirm("체크인 3일 이내에는 취소가 불가능합니다.\n결제를 진행하시겠습니까?")) {
      setIsPaying(false);
      return;
    }

    const IMP = window.IMP;
    IMP.init("imp08630300");

    IMP.request_pay(
      {
        pg: "danal_tpay",
        pay_method: "card",
        name: room.name,
        amount: Number(totalPrice),
        buyer_name: username,
        buyer_tel: tel,
      },
      async (rsp) => {
        setIsPaying(false);

        if (rsp.success) {
          try {
            const requestBody = {
              roomId: Number(room.id),
              userId: Number(userId),
              username: username,
              checkIn: formatDateTime(checkIn),
              checkOut: formatDateTime(checkOut),
              nights: Number(nights),
              adults: Number(adults),
              children: Number(children),
              infants: Number(infants),
              imp_uid: rsp.imp_uid,
              paid_amount: Number(totalPrice),
            };

            const response = await fetch("http://localhost/api/roomreservations", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
              },
              body: JSON.stringify(requestBody),
            });

            console.log("보내는 데이터", requestBody);

            if (response.ok) {
              alert("결제가 완료되었습니다!");
              navigate("/");
            } else {
              const error = await response.text();
              alert("예약 저장 실패: " + error);
            }
          } catch (err) {
            alert("서버 에러: " + err.message);
          }
        } else {
          alert("❌ 결제 실패: " + rsp.error_msg);
        }
      }
    );
  };

  return (
    <div className="payment-container">
      <h2>결제 정보 확인</h2>

      <div className="room-info">
        <img src={room.imageUrl} alt={room.name} style={{ width: "300px", borderRadius: "8px" }} />
        <h3>{room.name}</h3>
      </div>

      <ul className="payment-summary">
        <li><strong>기간:</strong> {new Date(checkIn).toLocaleDateString()} ~ {new Date(checkOut).toLocaleDateString()} ({nights}박)</li>
        <li><strong>인원:</strong> 성인 {adults}명 / 아동 {children}명 / 유아 {infants}명</li>
        <li><strong>총 결제 금액:</strong> {parseInt(totalPrice).toLocaleString()}원</li>
        <li><strong>예약자 이름:</strong> {username}</li>
        <li><strong>전화번호:</strong> {tel}</li>
      </ul>

      <button className="pay-button" onClick={handlePayment} disabled={isPaying}>
        {isPaying ? "결제 진행 중..." : "결제하기"}
      </button>
    </div>
  );
};

export default RoomPay;
