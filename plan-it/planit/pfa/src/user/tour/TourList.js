import React, { useEffect, useState, useRef } from "react";
import {useNavigate, useParams } from 'react-router-dom';
import axios from "axios";
import TourCard from "./TourCard";
import Pagination from "../../util/Pagination";
import '../../css/tour/TourList.css';
import no_result_img from '../../img/no_result_img.png';
import loading_img from '../../img/loading_img.png';
import { sigunguCodeMap, regionToAreaCode } from '../../module/areas';
import Footer from '../../components/main/Footer'
import TourMap from "./TourMap";

const TourList = () => {
  const { city, area, cat, arr, pgno } = useParams();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(parseInt(pgno) || 1);
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);

  const [region, setRegion] = useState(city || "전체");
  const [sigungu, setSigungu] = useState(area || "전체");
  const [category, setCategory] = useState(cat || "전체");

  const regions = ["전체","서울","부산","강원특별자치도","경상북도","전북특별자치도","제주특별자치도"];
  const [sigungus, setSigungus] = useState(sigunguCodeMap[0]);
  const categories = ["전체", "관광지", "문화시설", "레포츠", "숙박", "쇼핑", "음식점"];

  const [arrange, setArrange] = useState(arr || "A");

  const [showSigungus, setShowSigungus] = useState(false);

  const sidebarRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);

  const [images, setImages] = useState([]);

  const [showMap, setShowMap] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [mapTarget, setMapTarget] = useState({ addr: '', name: '' });

  const [mobileSize, setMobileSize] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    if (showMap) {
      setIsMapVisible(true);
    } else {
      const timer = setTimeout(() => {
          setIsMapVisible(false);
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [showMap]);

  useEffect(() => {
  const mediaQuery = window.matchMedia('(max-width: 1550px)');

  const handleMediaQueryChange = (event) => {
    setMobileSize(event.matches);
  };

  setMobileSize(mediaQuery.matches);

  mediaQuery.addEventListener('change', handleMediaQueryChange);

  return () => {
    mediaQuery.removeEventListener('change', handleMediaQueryChange);
  };
}, []); 

  const handleShowMap = (addr, name) => {
    if (mobileSize) return;
    setMapTarget({ addr, name });
    setShowMap(true);
  };

  const handleCloseMap = () => {
    setShowMap(false);
    setTimeout(() => {
      setMapTarget({ addr: '', name: '' });
    }, 400);
  };

  const handleShowSideBar = () => {
    setShowSidebar(true);
  }

  const handleCloseSideBar = () => {
    setShowSidebar(false);
  }

  const mapClass = `kakaomap-container ${showMap ? 'slide-in' : 'slide-out'}`;
  const mainContentClass = `main-content ${showMap ? 'slide-out' : 'slide-in'}`
  const sidebarClass = `sidebar ${showSidebar ? 'slide-in' : 'slide-out'}`;

  useEffect(() => {
      const FIXED_OFFSET = 10;
      const FOOTER_LIMIT = 330;

      const sidebarInitialTop = sidebarRef.current 
          ? sidebarRef.current.offsetTop - FIXED_OFFSET
          : 0;

      console.log(sidebarInitialTop);
      const handleScroll = () => {
          const currentScrollY = window.scrollY;

          const maxScrollPosition = document.documentElement.scrollHeight - window.innerHeight;
          
          const stopScrollY = maxScrollPosition - FOOTER_LIMIT; 

          let finalTranslateY = 0;

          if (currentScrollY < sidebarInitialTop) {
              finalTranslateY = 0;
          } else if (currentScrollY > stopScrollY && stopScrollY > 0) {
              finalTranslateY = stopScrollY - sidebarInitialTop;
          } else {
              finalTranslateY = currentScrollY - sidebarInitialTop;
          }
          setScrollTop(finalTranslateY); 
      };

      window.addEventListener("scroll", handleScroll);

      return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getPageNoFromPage = (page) => Math.floor((page - 1) / 10);

  const pageNoOfCurrentPage = getPageNoFromPage(currentPage);

  const currentGroupData = tours[pageNoOfCurrentPage] || []; 

  const pageIndexInGroup = (currentPage - 1) % 10;

  const indexOfFirstItemInGroup = pageIndexInGroup * itemsPerPage;
  const indexOfLastItemInGroup = indexOfFirstItemInGroup + itemsPerPage;

  const currentTours = currentGroupData.slice(indexOfFirstItemInGroup, indexOfLastItemInGroup);

  const tourNamesKey = currentTours.length > 0 ? currentTours.map(tour => tour.name).join(',') : '';

  const fetchTours = async (
    pageNoToFetch,
    arrangeParam,
    areaCodeParam,
    sigunguParam,
    categoryParam,
    reset = false
  ) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/tour/list?pageNo=${pageNoToFetch}&arrange=${arrangeParam}&areaCode=${areaCodeParam}&sigungu=${sigunguParam}&category=${categoryParam}`);

      setTotalPages(Math.ceil(res.data.totalElements / 10));
      const tourData = res.data.content;

      setTours((prev) => {
        if (reset) return { [pageNoToFetch]: tourData };
        return { ...prev, [pageNoToFetch]: tourData };
      });
      console.log(res);

      setLoading(false);

    } catch (err) {
      setError("데이터를 가져오는 데 실패했습니다.", err);
      console.error(err);
      setLoading(false);
    }
  };

  const fetchImages = async () => {
    try {
      setLoading(true);
      const requestBody = currentTours.map((tour) => ({
            name: tour.name,
            city: tour.city,
            uniqueKey: tour.uniqueKey
        }));

      const response = await axios.post(`/api/tour/image-urls`, requestBody);

      setImages(response.data.data);
      setLoading(false);
      
    } catch (err) {
      setError("이미지를 로드하는 데 실패했습니다.", err);
      setLoading(false);
      setImages({});
    }
  };

  useEffect(() => {
    fetchImages();
  }, [tourNamesKey]);

  useEffect(() => {
    const newAreaCode = regionToAreaCode[city] || 0;
  
    setRegion(city);
    setSigungu(area);
    setCategory(cat);
    setArrange(arr);
    setCurrentPage(parseInt(pgno));

    setSigungus(sigunguCodeMap[newAreaCode] || ["전체"]);
    setShowSigungus(city !== "전체");

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    fetchTours(
      0, 
      arr,
      newAreaCode,
      area,
      cat,
      true
    );
  }, [city, area, cat, arr]);

  const changeRegion = (reg) => {
    navigate(`/tourlist/${reg}/전체/${category}/${arrange}/1`);

    if (reg !== "전체") {
      setShowSigungus(true);
    } else {
      setShowSigungus(false);
    }
  }

  const changeSigungu = (sigungu) => {
    navigate(`/tourlist/${region}/${sigungu}/${category}/${arrange}/1`);
  };

  const changeCategory = (cat) => {
    navigate(`/tourlist/${region}/${sigungu}/${cat}/${arrange}/1`);
  }

  const changeArrange = (arr) => {
    navigate(`/tourlist/${region}/${sigungu}/${category}/${arr}/1`);
  }

  const handlePageChange = (page) => {
    setCurrentPage(page);
    navigate(`/tourlist/${region}/${sigungu}/${category}/${arr}/${page}`);
    const pageNoToFetch = getPageNoFromPage(page);

    if (!tours[pageNoToFetch]) {
      const newAreaCode = regionToAreaCode[city] || 0;
        fetchTours(
          pageNoToFetch,
          arr,
          newAreaCode,
          area,
          cat,
          false
        );
    }
  };

  return (
    <>
      <div className="tour-list-container"> 
        <div className={mainContentClass}>
          <div className="tour-list-header">
            <h1>여행지</h1>
            <div className="selected-categories">
              <span className="selected-region-name" onClick={handleShowSideBar}>#{region}</span>
              <span className={`selected-area-name transition-group ${sigungu !== "전체" ? 'visible' : ''}`}>
                {sigungu !== "전체" && <span className="animated-text">{"- #" + sigungu}</span>}
              </span>
              <span className={`selected-category-name transition-group ${category !== "전체" ? 'visible' : ''}`}>
                {category !== "전체" && <span className="animated-text">{"- #" + category}</span>}
              </span>
            </div>
            <div className="filter-options">
              <div onClick={() => changeArrange("P")} className={`arrange-btn ${arrange === "P" ? "active" : ""}`}>인기순</div> |
              <div onClick={() => changeArrange("A")} className={`arrange-btn ${arrange === "A" ? "active" : ""}`}>가나다순</div>
            </div>
          </div>
          <div className="tour-list">
            {loading ? (
              <img src={loading_img} className="result_image" />
            ) : currentTours.length > 0 ? (
              <>
                {currentTours.map((tour) => {
                  let tourImages = images[tour.name] || [];

                  return <TourCard
                            key={tour.uniqueKey}
                            tour={tour}
                            images={tourImages}
                            category={category}
                            arrange={arrange}
                            currentPage={currentPage}
                            onAddressClick={handleShowMap} 
                        />;
                })}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  handlePageChange={handlePageChange}
                />
              </>
            ) : (
              <img src={no_result_img} className="result_image" />
            )}
          </div>
        </div>
        <div className={mobileSize ? sidebarClass : "sidebar"} ref={sidebarRef} style={!mobileSize ? { transform: `translateY(${scrollTop}px)` } : {}}>
          <div className="close-sidebar" onClick={handleCloseSideBar}>닫기</div>
          <div className="sidebar-header">
            <span className="selected-region-name">{region}</span>
            <span className={`selected-area-name transition-group ${sigungu !== "전체" ? 'visible' : ''}`}>
              {sigungu !== "전체" && <span className="animated-text">{"- " + sigungu}</span>}
            </span>
            <span className={`selected-category-name transition-group ${category !== "전체" ? 'visible' : ''}`}>
              {category !== "전체" && <span className="animated-text">{"- " + category}</span>}
            </span>
          </div>
          <div className="category-group">
            <div className="category-header">지역</div>
            <div className="category-buttons">
              {regions.map((reg) => (
                <button
                  key={reg}
                  className={`category-btn ${region === reg ? "active" : ""}`}
                  onClick={() => changeRegion(reg)}
                >
                  {reg}
                </button>
              ))}
            </div>
          </div>

            <div className={`category-group sub-category transition-wrapper ${region !== "전체" && showSigungus ? "show" : "hide"}`}>
              <div className="category-header">시/군/구</div>
              <div className="category-buttons">
                {sigungus.map((sgg, idx) => (
                  <button
                    key={`${sgg}-${idx}`}
                    className={`sigungu-btn ${sigungu === sgg ? "active" : ""} ${showSigungus ? "show" : "hide"}`}
                    style={{ animationDelay: `${idx * 0.1}s` }}
                    onClick={() => changeSigungu(sgg)}
                  >
                    {sgg}
                  </button>
                ))}
              </div>
            </div>

          <div className={"category-group sub-category"}>
            <div className="category-header">관광 카테고리</div>
            <div className="category-buttons">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`category-btn ${category === cat ? "active" : ""}`}
                  onClick={() => changeCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
          <div className={mapClass} ref={sidebarRef} style={!mobileSize ? { transform: `${mapClass.includes('slide-out') ? 'translateX(150%)' : 'translateX(0)'} translateY(${scrollTop}px)` } : {}}>
          {isMapVisible && (
            <TourMap 
              address={mapTarget.addr} 
              tourName={mapTarget.name}
              onCloseMap={handleCloseMap}
            />
          )}
        </div>     
      </div>
    </>
  );
};

export default TourList;