import React, { useEffect, useState } from 'react';
import axios from "axios";
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Footer from '../../components/main/Footer.js'
import default_img from '../../img/default_img.png';
import liked_false from '../../img/liked_false.svg';
import liked_true from '../../img/liked_true.svg';
import favorited_false from '../../img/favorited_false.svg';
import favorited_true from '../../img/favorited_true.svg';
import view_count from '../../img/view_count.svg';
import '../../css/tour/TourInfo.css';
import apiClient from '../../module/apiClient.js';
import ClassifyDetails from './ClassifyDetails.js';
import { FiPrinter } from 'react-icons/fi';

const TourTabs = ({ activeTab, setActiveTab }) => {
    const tabs = ['사진보기', '상세정보'];
    return (
        <div className="tour-tabs">
            {tabs.map(tab => (
                <div 
                    key={tab}
                    className={`tab-item ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                >
                    {tab}
                </div>
            ))}
        </div>
    );
};

const TourInfo = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { city, area, cat, arr, pgno, uniqueKey } = useParams();
    const [tour, setTour] = useState(null);
    const token = sessionStorage.getItem('token');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [activeTab, setActiveTab] = useState('사진보기'); 

    const [viewCount, setViewCount] = useState(tour?.viewCount || 0);
    const [favoriteCount, setFavoriteCount] = useState(tour?.favoriteCount || 0);
    const [likeCount, setLikeCount] = useState(tour?.likeCount || 0);
    const [liked, setLiked] = useState(false); 
    const [favorited, setFavorited] = useState(false);

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [images, setImages] = useState([]);
    const currentImage = images[currentImageIndex];
    const totalImages = images.length;

    const goToNext = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    };
    const goToPrev = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    };

    const selectImage = (index) => {
        setCurrentImageIndex(index);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleLikeToggle = () => {
      if (token) {
        fetchLikeFavoriteToggle("lik");
      } else {
        const chk = window.confirm("로그인이 필요한 서비스 입니다.\n로그인 화면으로 이동하시겠습니까?");
        if (chk) {
          const redirectPath = encodeURIComponent(location.pathname);
          navigate(`/login?redirect=${redirectPath}`, { state: { tourData: tour } });
        }
      }
    };

    const handleFavoriteToggle = () => {
      if (token) {
        fetchLikeFavoriteToggle("fav");
      } else {
        const chk = window.confirm("로그인이 필요한 서비스 입니다.\n로그인 화면으로 이동하시겠습니까?");
        if (chk) {
          const redirectPath = encodeURIComponent(location.pathname);
          navigate(`/login?redirect=${redirectPath}`, { state: { tourData: tour } });
        }
      }
    };

    const handleBackToList = () => {
        navigate(`/tourlist/${city}/${area}/${cat}/${arr}/${pgno}`);
    }

    const renderWithLineBreaks = (text) => {
        const lines = text.split(/<br\s*\/?>/i);

        return lines.map((line, index) => (
            <React.Fragment key={index}>
            {line}
            {index < lines.length - 1 && <br />}
            </React.Fragment>
        ));
    };

    const fetchLikeFavoriteToggle = async (str) => {
      if (!uniqueKey) return;
      var url = "";
      switch (str) {
        case "lik" : url = "/like"; break;
        case "fav" : url = "/favorite"; break;
        default : setError("잘못된 접근방식입니다."); return;
      }
      try {
        setLoading(true);
        const response = await apiClient.post(`/api/tour/detail/user${url}?uniqueKey=${uniqueKey}`);
        console.log(response); 

        switch (str) {
          case "lik" : setLiked(response.data.liked); setLikeCount(response.data.likeCount); break;
          case "fav" : setFavorited(response.data.favorited); setFavoriteCount(response.data.favoriteCount); break;
          default : setError("잘못된 접근방식입니다."); return;
        }
        setLoading(false);
      } catch (err) {
        setError("좋아요, 즐겨찾기 토글에 실패했습니다.");
        console.error(err);
        setLoading(false);
      }
    }

    const fetchLikeFavoriteToggled = async () => {
      if (!uniqueKey) return;
      try {
        setLoading(true);
        const response = await apiClient.get(`/api/tour/detail/user/status?uniqueKey=${uniqueKey}`);
        setLiked(response.data.liked);
        setFavorited(response.data.favorited);
        setLoading(false);
      } catch (err) {
        setError("좋아요, 즐겨찾기 토글상태를 가져오는 데 실패했습니다.");
        console.error(err);
        setLoading(false);
      }
    }

    const fetchTourDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/tour/detail/data?uniqueKey=${uniqueKey}`);
        setTour(response.data);
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCounts = async () => {
      if (!uniqueKey) return;
      try {
        setLoading(true);
        const res = await axios.get(`/api/tour/detail/view?uniqueKey=${uniqueKey}`);
        
        setViewCount(res.data.viewCount);
        setFavoriteCount(res.data.favoriteCount);
        setLikeCount(res.data.likeCount);

        setLoading(false);
      } catch (err) {
        setError("조회수 데이터를 가져오는 데 실패했습니다.");
        console.error(err);
        setLoading(false);
      }
    }

    const fetchImages = async () => {
      if (!tour.name || !tour.city || !uniqueKey) {
          setImages([]);
          return;
      }
      const name = tour.name; 
      const city = tour.city;
      try {
        setLoading(true);
        const requestBody = { name, city, uniqueKey };

        const response = await axios.post(`/api/tour/detail/image-urls`, requestBody);
        
        const loadedImages = response.data.data[name] || [];
        
        setImages(loadedImages);
        setLoading(false);
          
      } catch (err) {
        setError("이미지를 로드하는 데 실패했습니다.");
        console.error(err);
        setLoading(false);
        setImages([]);
      }
    };

    useEffect(() => {
        window.scrollTo({
        top: 0,
        behavior: 'smooth'
        });
        fetchTourDetails();
        fetchCounts(); 
        if (token) fetchLikeFavoriteToggled();
    }, [uniqueKey]);

    useEffect(() => {
        if (totalImages <= 1) return;

        const interval = setInterval(() => {
            setCurrentImageIndex(prevIndex => 
                (prevIndex + 1) % totalImages
            );
        }, 8000);

        return () => clearInterval(interval);
    }, [totalImages]);

    useEffect(() => {
      if (tour) fetchImages();
    }, [tour]); 

    if (!tour) {
        return (
            <div className="tour-info-container no-result">
                <Footer />
            </div>
        );
    }

    if (loading) return <div className="loading-state"></div>;

    const renderTabContent = () => {
        let startIndex;
        let endIndex;

        if (totalImages <= 3) {
            startIndex = 0;
            endIndex = totalImages;
        } else if (currentImageIndex === 0) {
            startIndex = 0;
            endIndex = 3;
        } else if (currentImageIndex === totalImages - 1) {
            startIndex = totalImages - 3;
            endIndex = totalImages;
        } else {
            startIndex = currentImageIndex - 1;
            endIndex = currentImageIndex + 2;
        }
        const visibleSubImages = images.slice(startIndex, endIndex);
        
        switch (activeTab) {
            case '사진보기':
                return (
                    <div className="tab-content photo-view">
                        <div className="main-image-slide">
                            <img 
                                src={currentImage ? currentImage : default_img}
                                alt={`${tour.name} 메인 이미지 (${currentImageIndex + 1}/${totalImages})`} 
                            />
                            
                            {totalImages > 1 && (
                                <>
                                    <button className="slide-nav prev-btn" onClick={goToPrev}>
                                        &lt;
                                    </button>
                                    <button className="slide-nav next-btn" onClick={goToNext}>
                                        &gt;
                                    </button>
                                </>
                            )}
                        </div>
                        <div className="sub-image-row">
                            {visibleSubImages.map((url, indexInSlice) => {
                                const actualIndex = startIndex + indexInSlice;
                                const isActive = actualIndex === currentImageIndex; 

                                return (
                                    <div
                                        className={`sub-image-thumb ${isActive ? 'active' : ''}`} 
                                        key={actualIndex}
                                        onClick={() => selectImage(actualIndex)}
                                    >
                                        <img 
                                            src={url} 
                                            alt={`서브 이미지 ${actualIndex + 1}`} 
                                            onError={(e) => { e.target.onerror = null; e.target.src = default_img; }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            case '상세정보':
                console.log("상세정보 탭 - images 내용:", images);
                return (
                    <div className="tab-content detail-intro">
                        <div className="background-slider">
                            {images && images.map((imgSrc, index) => (
                                <img
                                    key={index}
                                    className={`slide-item ${index === currentImageIndex ? 'active' : ''}`}
                                    src={imgSrc}
                                />
                            ))}
                        </div>
                        <div className="background-overlay"></div>
                        <div className="info-section">
                            <h2 className="intro-title">상세정보</h2>
                            <div className="intro-content">
                                <p>{renderWithLineBreaks(tour.intro)}</p>
                            </div>
                            <ClassifyDetails tour={tour} render={renderWithLineBreaks} uniqueKey={uniqueKey} />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="tour-info-container">
            <div className="tour-info-title-area">
                <div className="info-header-meta">
                    <span className="location-info" onClick={handleBackToList}>여행지</span> 
                </div>
                <h1 className="tour-name">{tour.name}</h1>
                <p className="summary-address">{tour.city} {tour.sigungu}</p>

                <div className="tour-action-stats">
                    <div className="stat-item">
                         <button onClick={handleLikeToggle} className="toggle-btn like-toggle">
                            <img src={liked ? liked_true : liked_false} alt="좋아요" />
                        </button>
                        <span>{likeCount}</span>
                    </div>

                     <div className="stat-item">
                        <button onClick={handleFavoriteToggle} className="toggle-btn favorite-toggle">
                            <img src={favorited ? favorited_true : favorited_false} alt="즐겨찾기" />
                        </button>
                        <span>{favoriteCount}</span>
                    </div>

                    <div className="stat-item view-count-item">
                         <img src={view_count} alt="조회수" />
                         <span>{viewCount}</span>
                    </div>
                   
                    <div className="right-icons">
                        <button className="print-btn" onClick={handlePrint} title="이 계획 인쇄/PDF 저장">
                            <FiPrinter />
                        </button>
                    </div>
                </div>
            </div>

            <TourTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="tour-info-content">
                {renderTabContent()}
            </div>

            <Footer />
        </div>
    );
};

export default TourInfo;