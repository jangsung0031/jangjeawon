import './App.css';
import {Routes, Route, useLocation} from "react-router-dom";
import React, { useState } from 'react';
import Header from "./home/Header";
import MainPage from "./home/Main";
import Footer from "./home/Footer";
import Form from "./home/Form";
import FindId from "./home/FindId";
import FindPw from "./home/FindPw";
import "bootstrap-icons/font/bootstrap-icons.css";
import ActivityList from './Activity/ActivityList';
import ActivityDetail from './Activity/ActivityDetail';
import LeisureIntro from './pages/LeisureIntro';          
import LeisureReserve from './pages/LeisureReserve'; 
import LeisureDetail from './pages/LeisureDetail';
import PaymentPage from './pages/PaymentPage';     
import WaterLeisureReservation from './components/WaterLeisureReservation';
import AdminWaterPage from './mypage/AdminWaterPage';
import MyPageHome from './mypage/MyPageHome';
import EditInfo from './mypage/EditInfo';
import ReviewList from "./mypage/ReviewList";
import MyReview from "./mypage/MyReview";
import EditReview from "./mypage/EditReview";
import ReviewForm from "./mypage/ReviewForm";
import AdminReviewList from './mypage/AdminReviewList';
import UserWaterReservationPage from './mypage/UserWaterReservationPage';
import UserRoomReservationPage from './mypage/UserRoomReservationPage';
import Notice from './notice/Notice';
import NoticeDetail from "./notice/NoticeDetail";
import NoticeWrite from "./notice/NoticeWrite";
import NoticeEdit from './notice/NoticeEdit';
import QnAWrite from './qna/QnAWrite';
import QnADetail from './qna/QnADetail';
import QnAManage from './qna/QnAManage';
import QnAManageDetail from './qna/QnAManageDetail';
import QnA from './qna/QnA';
import FAQ from './faq/FAQ';
import FAQDetail from './faq/FAQDetail';
import FAQWrite from './faq/FAQWrite';
import FAQEdit from './faq/FAQEdit';
import Room from './room/Room';
import RoomPay from './room/RoomPay.js';
import RoomDetail from "./pages/RoomDetail";
import RoomIntro from './pages/RoomIntro';
import AdminRoomPage from './mypage/AdminRoomPage'


function App() {
  const [selectedDate, setSelectedDate] = useState(null);
  const location = useLocation();
  const path = location.pathname;
  const isHiddenFooterPage = path === "/form" || path === "/findid" || path === "/findpw";
  return (
    <div className="App">
    <Header />
    <Routes>
        <Route path={"/"} element={<MainPage/>} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/form" element={<Form />} />
        <Route path="/findid" element={<FindId />} />
        <Route path="/findpw" element={<FindPw />} />
        <Route path="/activity" element={<ActivityList />} />
        <Route path="/activities/:id" element={<ActivityDetail />} />
        <Route path="/leisure/intro" element={<LeisureIntro />} />
        <Route path="/leisure/reserve" element={<LeisureReserve />} />
        <Route path="/leisure/:name" element={<LeisureDetail />} />
        <Route path="/water/page" element={<WaterLeisureReservation />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path='/admin/water.page' element={<AdminWaterPage />} />
        <Route path="/reviews" element={<ReviewList />} />
        <Route path="/my-reviews" element={<MyReview />} />
        <Route path="/edit-review/:id" element={<EditReview />} />
        <Route path="/write-review" element={<ReviewForm />} />
        <Route path="/mypage" element={<MyPageHome />} />
        <Route path="/mypage/editinfo" element={<EditInfo />} />
        <Route path="/admin/reviews" element={<AdminReviewList />} />
        <Route path='/admin/room.page' element={<AdminRoomPage />} />
        <Route path="/mypage/reservations" element={<UserWaterReservationPage />} />
        <Route path="/mypage/room" element={<UserRoomReservationPage />} />
        <Route path="/community/notice" element={<Notice />} />
        <Route path="/community/notice/:id" element={<NoticeDetail />} />
        <Route path="/community/notice/write" element={<NoticeWrite />} />
        <Route path="/community/notice/edit/:id" element={<NoticeEdit />} />
        <Route path="/community/qna" element={<QnA />} />
        <Route path="/community/qna/write" element={<QnAWrite />} />
        <Route path="/community/qna/:id" element={<QnADetail />} />
        <Route path="/admin/qna/manage" element={<QnAManage />} />
        <Route path="/admin/manage/qna/:id" element={<QnAManageDetail />} />
        <Route path="/community/faq" element={<FAQ />} />
        <Route path="/community/faq/:id" element={<FAQDetail />} />
        <Route path="/community/faq/edit/:id" element={<FAQEdit />} />
        <Route path="/community/faq/write" element={<FAQWrite />} />
        <Route path="/room" element={<Room selectedDate={selectedDate} />} />
        <Route path="/roompay" element={<RoomPay />} />
        <Route path="/roomIntro" element={<RoomIntro />} />
        <Route path="/rooms/:id" element={<RoomDetail />} />
    </Routes>
    {!isHiddenFooterPage && <Footer />}
    </div>
  );
}

export default App;