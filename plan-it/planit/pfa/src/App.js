import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignupForm from './components/SignupForm';
import LoginForm from './components/LoginForm';
import Header from "./components/Header";
import Home from './components/Home';
import FindAccount from './components/FindAccount';
import AiPlanner from './user/ai/AiPlanner';
import FestivalList from "./user/FestivalList";
import FestivalDetail from "./user/FestivalDetail";
import TourList from './user/tour/TourList';
import TourInfo from './user/tour/TourInfo';
import ThemePage_Spring from './components/themePage/ThemePage_Spring';
import ThemePage_Summer from './components/themePage/ThemePage_Summer';
import ThemePage_Autumn from './components/themePage/ThemePage_Autumn';
import ThemePage_Winter from './components/themePage/ThemePage_Winter';
import KcisaCoursePage from './user/KcisaCoursePage';
import CourseList from "./user/CourseList";
import CourseDetail from "./user/CourseDetail";
import AdminDashboard from "./admin/AdminDashboard"
import MapPage from "./user/MapPage";
import MyPage from "./user/MyPage"
import EditProfile from "./user/EditProfile"
import AdminReportPage from './admin/AdminReportPage';
import AdminLoginForm from './admin/AdminLoginForm';
import AdminUserList from './admin/AdminUserList';
import MyCourseList from './user/MyCourseList';
import MyCourseEdit from './user/MyCourseEdit';
import AdminWithdrawnUserList from './admin/AdminWithdrawnUserList';
import Footer from './components/main/Footer';

const App = () => {
  const isAuthenticated = !!sessionStorage.getItem('token');

  return (
    <Router>
      <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/find" element={<FindAccount />} />
          <Route path="*" element={<Navigate to="/" />} />
          <Route path="/aitalk" element={ <AiPlanner /> } />
          <Route path="/theme/spring-flowers" element={<ThemePage_Spring />} />
          <Route path="/theme/summer-vacation" element={<ThemePage_Summer />} />
          <Route path="/theme/autumn-leaves" element={<ThemePage_Autumn />} />
          <Route path="/tour" element={<KcisaCoursePage />} />
          <Route path="/course/list" element={<CourseList />} />
          <Route path="/course/detail/:id" element={<CourseDetail />} />
          <Route path="/theme/winter-festival" element={<ThemePage_Winter />} />
          {/* 축제 목록 */}
          <Route path="/festival" element={<FestivalList />} />
          {/* 축제 상세 */}
          <Route path="/festival/:id" element={<FestivalDetail />} />
          {/* 여행지 목록 */}
          <Route path="/tourlist/:city/:area/:cat/:arr/:pgno" element={<TourList />} />
         <Route path="/tourinfo/:city/:area/:cat/:arr/:pgno/:uniqueKey" element={<TourInfo />} />
         <Route path="/map" element={<MapPage />} />
         <Route path="/mypage" element={<MyPage />} />
         <Route path="/editprofile" element={<EditProfile />} />
        
        <Route path='/admin' element={<AdminDashboard />} />
        <Route path="/admin/reports" element={<AdminReportPage />} />
        <Route path="/admin/login" element={<AdminLoginForm />} />
        <Route path="/admin/users" element={<AdminUserList />} />
        <Route path="/admin/users/withdrawn" element={<AdminWithdrawnUserList />} />

        <Route path="/mypage/my-courses" element={<MyCourseList />} />
        <Route path="/my-course/edit/:courseId" element={<MyCourseEdit />} />
          
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
