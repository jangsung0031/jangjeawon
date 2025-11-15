import React,{ useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css/PaymentPage.css';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { ticketType, date, peopleCount, totalPrice, } = location.state || {};
  const [isPaying, setIsPaying] = useState(false);


  const storedUser = JSON.parse(sessionStorage.getItem("user"));
  console.log("storedUser:", storedUser);
  const username = storedUser?.username;
  const email = storedUser?.email;
  const tel = storedUser?.tel;
  const userId = storedUser?.id;

  if (!ticketType || !date) {
    return (
      <div className="payment-container">
        <h2>잘못된 접근입니다</h2>
        <p>예약 정보를 다시 입력해주세요.</p>
        <button onClick={() => navigate('/')}>홈으로 돌아가기</button>
      </div>
    );
  }

  const handlePayment = () => {
  if (isPaying) return;
  setIsPaying(true);

  if (!window.confirm("이용일 3일 이내에는 취소가 불가능합니다.\n결제를 진행하시겠습니까?")) {
    setIsPaying(false);
    return;
  }

  if (!window.IMP) {
    alert("결제 라이브러리가 로드되지 않았습니다. 새로고침 후 다시 시도해주세요.");
    return;
  }

  const IMP = window.IMP;
  IMP.init("imp08630300");

  IMP.request_pay(
    {
      pg: "danal_tpay",
      pay_method: "card",
      merchant_uid: `ticket_${userId}_${Date.now()}`,
      name: ticketType + " 티켓",
      amount: Number(totalPrice),
      buyer_email: email,
      buyer_name: username,
      buyer_tel: tel,
    },
    async (rsp) => {
      setIsPaying(false);

      if (rsp.success) {
        try {
          const response = await fetch("http://localhost/api/reservation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ticketType,
              reservationDate: date,
              peopleCount,
              userId,
              imp_uid: rsp.imp_uid,
              merchant_uid: rsp.merchant_uid,
              paid_amount: rsp.paid_amount,
            }),
          });

          console.log("보내는 데이터", {
            ticketType,
            reservationDate: date,
            peopleCount,
            userId,
            imp_uid: rsp.imp_uid,
            merchant_uid: rsp.merchant_uid,
            paid_amount: rsp.paid_amount,
          });

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
      <ul className="payment-summary">
        <li><strong>이용권:</strong> {ticketType}</li>
        <li><strong>예약일:</strong> {date}</li>
        <li><strong>인원수:</strong> {peopleCount}명</li>
        <li><strong>총 결제 금액:</strong> {parseInt(totalPrice).toLocaleString()}원</li>
        <li><strong>예약자 이름:</strong> {username}</li>
        <li><strong>이메일:</strong> {email}</li>
        <li><strong>전화번호:</strong> {tel}</li>
      </ul>
      <button className="pay-button" onClick={handlePayment}>결제하기</button>
    </div>
  );
};

export default PaymentPage;
