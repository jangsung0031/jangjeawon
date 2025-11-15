import React from 'react';
import WaterLeisureReservation from '../components/WaterLeisureReservation';
import '../css/LeisureReserve.css';

const LeisureReservePage = () => {
  return (
    <div className="reserve-page-wrapper">
  <div className="main-content-box">

    <div className="leisure-center-image">
        <img src="/img/test6.jpg" alt="수상레저 안내" />
    </div>

    <div className="price-info-inline">
      <div className="price-card">
        <h3>📅 주중 요금</h3>
        <ul>
          <li>오전권: 30,000원</li>
          <li>오후권: 35,000원</li>
          <li>종일권: 60,000원</li>
        </ul>
      </div>
      <div className="price-card">
        <h3>🏖 주말 요금</h3>
        <ul>
          <li>오전권: 40,000원</li>
          <li>오후권: 45,000원</li>
          <li>종일권: 70,000원</li>
        </ul>
      </div>
    </div>

    <div className="notice-box">
      <h3>[이용약관&환불규정]</h3>
      <ul>
        <li>수상레저는 14세 이상 이용 가능합니다. </li>
        <li>실내/외 수영장 이용 시 수영모 착용 필수입니다.</li>
        <li>이용일 기준 차등 환불<br /> 
        7일 전: 약 100% 환불<br />
        3일 전: 취소불가<br /></li>
        <li>천재지변 시 환불<br />단순 우천 시는 환불 불가 (운영은 대부분 정상 진행)<br />
        태풍/홍수 등으로 지자체에서 운영 중단 요청 시 100% 환불 가능합니다.</li>
      </ul>
    </div>
  </div>

  <div className="reservation-box-fixed">
    <WaterLeisureReservation />
  </div>
</div>
  );
};

export default LeisureReservePage;
