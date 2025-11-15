import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/MyPage.css";
import { TbNavigationStar } from "react-icons/tb";
import { FaRegStar } from "react-icons/fa";
import { MdOutlineRateReview } from "react-icons/md";
import { AiOutlinePhone } from "react-icons/ai";
import { FaRegHeart } from "react-icons/fa";
import api from "../api/axios";

const ActivityItem = ({ icon, label, count, hint }) => (
    <button className="act-item" type="button">
        <span className="act-icon">{icon}</span>
        <span className="act-texts">
            <strong className="act-count">{count}</strong>
            <span className="act-label">
                {label}
                {hint && <i className="act-hint" title={hint}>i</i>}
            </span>
        </span>
    </button>
);

export default function MyPage() {
    const navigate = useNavigate();

    const [user, setUser] = useState({
        name: "",
        profileUrl: "",
        kakaoLinked: false,
        nickname: "",
        email: "",
        phone: "",
    });

    const [favoriteCount, setFavoriteCount] = useState(0);
    const [likeCount, setLikeCount] = useState(0);

    const handleWithdrawal = async () => {
        const confirmMessage = "정말 탈퇴하시겠습니까?\n\n탈퇴 시 회원님의 모든 AI 대화 내역이 영구적으로 삭제되며, 이 작업은 되돌릴 수 없습니다.";

        if (window.confirm(confirmMessage)) {
            try {
                await api.delete('/api/users/me');

                sessionStorage.clear();

                alert('회원 탈퇴가 성공적으로 처리되었습니다. 이용해주셔서 감사합니다.');
                navigate("/login", { replace: true });

            } catch (e) {
                console.error("탈퇴 처리 실패:", e);
                alert("탈퇴 처리 중 오류가 발생했습니다. 다시 시도해 주세요.");
            }
        }
    };

    const activities = [
        { icon: <FaRegStar />, label: "즐겨찾기"},
        { icon: <FaRegHeart />, label: "좋아요"},
        { icon: <TbNavigationStar />, label: "내 코스", count: 0 },
        { icon: <AiOutlinePhone />, label: "문의 전화", count: 0 },
        { icon: <MdOutlineRateReview />, label: "탈퇴하기"},
    ];

    useEffect(() => {
        const fetchMe = async () => {
            try {
                const { data } = await api.get('/api/users/me')
                setUser({
                    name: data.name || "",
                    profileUrl: data.profileUrl || "",
                    kakaoLinked: false, 
                    nickname: data.nickname || "",
                    email: data.email || "",
                    phone: data.phone || "",
                });
            } catch (e) {
                navigate("/login", { state: { from: "/mypage" }, replace: true });
            }
        };
        const fetchCounts = async () => {
            try {
                const res = await api.get('/api/tour/detail/user/count');

                setFavoriteCount(res.data.favoriteCount);
                setLikeCount(res.data.likeCount);

            } catch (e) {
                console.error("즐겨찾기 불러오기 실패", e);
            }
        };

        fetchMe();
        fetchCounts();
    }, [navigate]);

    return (
        <main className="mypage-wrap">
            <header className="mypage-title">
                <span className="title-mark">MY</span>
                <h1>마이페이지</h1>
            </header>

            <section className="mypage-grid">
                <aside className="profile-card">
                    <div className="profile-avatar">
                        {user.profileUrl ? (
                            <img src={user.profileUrl} alt="프로필" />
                        ) : (
                            <div className="avatar-fallback">👤</div>
                        )}
                    </div>
                    <div className="profile-texts">
                        <span className="greet">반가워요!</span>
                        <strong className="username">
                            {(user.nickname || user.name || "사용자")} 님
                        </strong>
                    </div>
                    <button
                        className="profile-btn"
                        type="button"
                        onClick={() => navigate("/editprofile")}
                    >
                        정보 수정 ›
                    </button>
                </aside>

                <section className="activity-card">
                    <h2 className="activity-title">나의활동</h2>
                    <div className="activity-grid">
                        {activities.map((a, i) => {
                            if (a.label === '탈퇴하기') {
                                return (
                                    <button key={i} className="act-item" type="button" onClick={handleWithdrawal}>
                                        <span className="act-icon">{a.icon}</span>
                                        <span className="act-texts">
                                            <strong className="act-count"></strong>
                                            <span className="act-label">
                                                {a.label}
                                            </span>
                                        </span>
                                    </button>
                                );
                            }
                            if (a.label === '내 코스') {
                                return (
                                    <button key={i} className="act-item" type="button" onClick={() => navigate('/mypage/my-courses')}>
                                        <span className="act-icon">{a.icon}</span>
                                        <span className="act-texts">
                                            <strong className="act-count"></strong>
                                            <span className="act-label">{a.label}</span>
                                        </span>
                                    </button>
                                );
                            }
                            if (a.label === '즐겨찾기') {
                                return (
                                    <button key={i} className="act-item" type="button">
                                        <span className="act-icon">{a.icon}</span>
                                        <span className="act-texts">
                                            <strong className="act-count">{favoriteCount}</strong>
                                            <span className="act-label">
                                                {a.label}
                                            </span>
                                        </span>
                                    </button>
                                );
                            }
                            if (a.label === '좋아요') {
                                return (
                                    <button key={i} className="act-item" type="button">
                                        <span className="act-icon">{a.icon}</span>
                                        <span className="act-texts">
                                            <strong className="act-count">{likeCount}</strong>
                                            <span className="act-label">
                                                {a.label}
                                            </span>
                                        </span>
                                    </button>
                                );
                            }
                            return <ActivityItem key={i} {...a} />;
                        })}
                    </div>
                </section>
            </section>

            <section className="mypage-bottom-placeholder" />
        </main>
    );
}