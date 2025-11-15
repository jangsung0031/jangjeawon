import React, { useState, useEffect } from 'react';

const ClassifyDetails = ({ tour, render, uniqueKey }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showMoreButton, setShowMoreButton] = useState(false);

    useEffect(() => {
        if (tour.detail && tour.detail.length > 150) {
            setShowMoreButton(true);
        } else {
            setShowMoreButton(false);
        }
    }, [tour.detail]);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const DetailModal = ({ isOpen, onClose, title, content }) => {
        if (!isOpen) return null;

        return (
            <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose}>
                &times;
                </button>
                
                <h3>{title}</h3>
                
                <div className="modal-body">
                    {content}
                </div>
            </div>
            </div>
        );
    };

    const catName = (uniqueKey) => {
        const parts = uniqueKey.split('-');
        return parts[0];
    };
    switch (catName(uniqueKey)) {
        case "RESTAURANT" : 
            return (
                <div className="additional-info-grid">
                    <div className="info-item">
                        <h4 className="item-title">문의 및 안내</h4>
                        <p className="item-content">문의 : {tour.inquiryGuide ? render(tour.inquiryGuide) : "-"}</p>
                        <p className="item-content">주소 : {tour.addr ? render(tour.addr) : "-"}</p>
                        {tour.reservation && (<p className="item-content">예약안내 : {render(tour.reservation)}</p>)}
                    </div>
                    <div className="info-item">
                        <h4 className="item-title">이용시간</h4>
                        <p className="item-content">영업시간 : {tour.sellTime ? render(tour.sellTime) : "-"}</p>
                        <p className="item-content">쉬는날 : {tour.dayoff ? render(tour.dayoff) : "-"}</p>
                    </div>
                    <div className="info-item">
                        <h4 className="item-title">주차</h4>
                        <p className="item-content">주차 : {tour.parking ? render(tour.parking) : "-"}</p>
                    </div>
                    <div className="info-item">
                        <h4 className="item-title">시설 이용료</h4>
                        <p className="item-content">{tour.representMenu ? render(tour.representMenu) : "-"}</p>
                        <p className="item-content">{tour.menus ? render(tour.menus) : "-"}</p>
                    </div>
                    <div className="info-item">
                        <h4 className="item-title">추가 정보</h4>
                        <p className="item-content">{tour.detail ? render(tour.detail) : "-"}</p>
                        {tour.scale && (<p className="item-content">규모 : {render(tour.scale)}</p>)}
                        {tour.saleInfo && (<p className="item-content">할인정보 : {render(tour.saleInfo)}</p>)}
                        {tour.smorkingYn && (<p className="item-content">금연/흡연 : {render(tour.smorkingYn)}</p>)}
                        {tour.childcareCenter && (<p className="item-content">어린이놀이방 : {render(tour.childcareCenter)}</p>)}
                        {showMoreButton && (
                            <button className="more-button" onClick={openModal}>
                                더보기
                            </button>
                        )}
                    </div>
                    <DetailModal
                        isOpen={isModalOpen}
                        onClose={closeModal}
                        title="추가 정보 상세"
                        content={tour.detail ? render(tour.detail) : "내용이 없습니다."}
                    />
                </div>   
            );
            
        case "TOUR" : 
            return (
                <div className="additional-info-grid">
                    <div className="info-item">
                        <h4 className="item-title">문의 및 안내</h4>
                        <p className="item-content">문의 : {tour.inquiryGuide ? render(tour.inquiryGuide) : "-"}</p>
                        <p className="item-content">주소 : {tour.addr ? render(tour.addr) : "-"}</p>
                        {tour.reservation && (<p className="item-content">예약안내 : {render(tour.reservation)}</p>)}
                    </div>
                    <div className="info-item">
                        <h4 className="item-title">이용시간</h4>
                        <p className="item-content">영업시간 : {tour.sellTime ? render(tour.sellTime) : "-"}</p>
                        <p className="item-content">쉬는날 : {tour.dayoff ? render(tour.dayoff) : "-"}</p>
                    </div>
                    <div className="info-item">
                        <h4 className="item-title">주차</h4>
                        <p className="item-content">주차 : {tour.parking ? render(tour.parking) : "-"}</p>
                    </div>
                    <div className="info-item">
                        <h4 className="item-title">시설 이용료</h4>
                        <p className="item-content">{tour.representMenu ? render(tour.representMenu) : "-"}</p>
                        <p className="item-content">{tour.menus ? render(tour.menus) : "-"}</p>
                    </div>
                    <div className="info-item">
                        <h4 className="item-title">추가 정보</h4>
                        <p className="item-content">{tour.detail ? render(tour.detail) : "-"}</p>
                        {tour.scale && (<p className="item-content">규모 : {render(tour.scale)}</p>)}
                        {tour.saleInfo && (<p className="item-content">할인정보 : {render(tour.saleInfo)}</p>)}
                        {tour.smorkingYn && (<p className="item-content">금연/흡연 : {render(tour.smorkingYn)}</p>)}
                        {tour.childcareCenter && (<p className="item-content">어린이놀이방 : {render(tour.childcareCenter)}</p>)}
                        {showMoreButton && (
                                <button className="more-button" onClick={openModal}>
                                    더보기
                                </button>
                            )}
                        </div>
                        <DetailModal
                            isOpen={isModalOpen}
                            onClose={closeModal}
                            title="추가 정보 상세"
                            content={tour.detail ? render(tour.detail) : "내용이 없습니다."}
                        />
                </div>
            );

        case "ACCOMMODATION" : 
            return (
                <div className="additional-info-grid">
                    <div className="info-item">
                        <h4 className="item-title">문의 및 안내</h4>
                        <p className="item-content">문의 : {tour.inquiryGuide ? render(tour.inquiryGuide) : "-"}</p>
                        <p className="item-content">주소 : {tour.addr ? render(tour.addr) : "-"}</p>
                        {tour.reservation && (<p className="item-content">예약안내 : {render(tour.reservation)}</p>)}
                    </div>
                    <div className="info-item">
                        <h4 className="item-title">이용시간</h4>
                        <p className="item-content">영업시간 : {tour.sellTime ? render(tour.sellTime) : "-"}</p>
                        <p className="item-content">쉬는날 : {tour.dayoff ? render(tour.dayoff) : "-"}</p>
                    </div>
                    <div className="info-item">
                        <h4 className="item-title">주차</h4>
                        <p className="item-content">주차 : {tour.parking ? render(tour.parking) : "-"}</p>
                    </div>
                    <div className="info-item">
                        <h4 className="item-title">시설 이용료</h4>
                        <p className="item-content">{tour.representMenu ? render(tour.representMenu) : "-"}</p>
                        <p className="item-content">{tour.menus ? render(tour.menus) : "-"}</p>
                    </div>
                    <div className="info-item">
                        <h4 className="item-title">추가 정보</h4>
                        <p className="item-content">{tour.detail ? render(tour.detail) : "-"}</p>
                        {tour.scale && (<p className="item-content">규모 : {render(tour.scale)}</p>)}
                        {tour.saleInfo && (<p className="item-content">할인정보 : {render(tour.saleInfo)}</p>)}
                        {tour.smorkingYn && (<p className="item-content">금연/흡연 : {render(tour.smorkingYn)}</p>)}
                        {tour.childcareCenter && (<p className="item-content">어린이놀이방 : {render(tour.childcareCenter)}</p>)}
                        {showMoreButton && (
                            <button className="more-button" onClick={openModal}>
                                더보기
                            </button>
                        )}
                    </div>
                    <DetailModal
                        isOpen={isModalOpen}
                        onClose={closeModal}
                        title="추가 정보 상세"
                        content={tour.detail ? render(tour.detail) : "내용이 없습니다."}
                    />
                </div>
            );
        
        case "CULTURE" : 
            return (
                <div className="additional-info-grid">
                    <div className="info-item">
                        <h4 className="item-title">문의 및 안내</h4>
                        <p className="item-content">문의 : {tour.inquiryGuide ? render(tour.inquiryGuide) : "-"}</p>
                        <p className="item-content">주소 : {tour.addr ? render(tour.addr) : "-"}</p>
                        {tour.reservation && (<p className="item-content">예약안내 : {render(tour.reservation)}</p>)}
                    </div>
                    <div className="info-item">
                        <h4 className="item-title">이용시간</h4>
                        <p className="item-content">영업시간 : {tour.sellTime ? render(tour.sellTime) : "-"}</p>
                        <p className="item-content">쉬는날 : {tour.dayoff ? render(tour.dayoff) : "-"}</p>
                    </div>
                    <div className="info-item">
                        <h4 className="item-title">주차</h4>
                        <p className="item-content">주차 : {tour.parking ? render(tour.parking) : "-"}</p>
                    </div>
                    <div className="info-item">
                        <h4 className="item-title">시설 이용료</h4>
                        <p className="item-content">{tour.representMenu ? render(tour.representMenu) : "-"}</p>
                        <p className="item-content">{tour.menus ? render(tour.menus) : "-"}</p>
                    </div>
                    <div className="info-item">
                        <h4 className="item-title">추가 정보</h4>
                        <p className="item-content">{tour.detail ? render(tour.detail) : "-"}</p>
                        {tour.scale && (<p className="item-content">규모 : {render(tour.scale)}</p>)}
                        {tour.saleInfo && (<p className="item-content">할인정보 : {render(tour.saleInfo)}</p>)}
                        {tour.smorkingYn && (<p className="item-content">금연/흡연 : {render(tour.smorkingYn)}</p>)}
                        {tour.childcareCenter && (<p className="item-content">어린이놀이방 : {render(tour.childcareCenter)}</p>)}
                        {showMoreButton && (
                            <button className="more-button" onClick={openModal}>
                                더보기
                            </button>
                        )}
                    </div>
                    <DetailModal
                        isOpen={isModalOpen}
                        onClose={closeModal}
                        title="추가 정보 상세"
                        content={tour.detail ? render(tour.detail) : "내용이 없습니다."}
                    />
                </div>
            );

        case "SHOPPING" : 
            return (
                <div className="additional-info-grid">
                    <div className="info-item">
                        <h4 className="item-title">문의 및 안내</h4>
                        <p className="item-content">문의 : {tour.inquiryGuide ? render(tour.inquiryGuide) : "-"}</p>
                        <p className="item-content">주소 : {tour.addr ? render(tour.addr) : "-"}</p>
                        {tour.reservation && (<p className="item-content">예약안내 : {render(tour.reservation)}</p>)}
                    </div>
                    <div className="info-item">
                        <h4 className="item-title">이용시간</h4>
                        <p className="item-content">영업시간 : {tour.sellTime ? render(tour.sellTime) : "-"}</p>
                        <p className="item-content">쉬는날 : {tour.dayoff ? render(tour.dayoff) : "-"}</p>
                    </div>
                    <div className="info-item">
                        <h4 className="item-title">주차</h4>
                        <p className="item-content">주차 : {tour.parking ? render(tour.parking) : "-"}</p>
                    </div>
                    <div className="info-item">
                        <h4 className="item-title">시설 이용료</h4>
                        <p className="item-content">{tour.representMenu ? render(tour.representMenu) : "-"}</p>
                        <p className="item-content">{tour.menus ? render(tour.menus) : "-"}</p>
                    </div>
                    <div className="info-item">
                        <h4 className="item-title">추가 정보</h4>
                        <p className="item-content">{tour.detail ? render(tour.detail) : "-"}</p>
                        {tour.scale && (<p className="item-content">규모 : {render(tour.scale)}</p>)}
                        {tour.saleInfo && (<p className="item-content">할인정보 : {render(tour.saleInfo)}</p>)}
                        {tour.smorkingYn && (<p className="item-content">금연/흡연 : {render(tour.smorkingYn)}</p>)}
                        {tour.childcareCenter && (<p className="item-content">어린이놀이방 : {render(tour.childcareCenter)}</p>)}
                        {showMoreButton && (
                            <button className="more-button" onClick={openModal}>
                                더보기
                            </button>
                        )}
                    </div>
                    <DetailModal
                        isOpen={isModalOpen}
                        onClose={closeModal}
                        title="추가 정보 상세"
                        content={tour.detail ? render(tour.detail) : "내용이 없습니다."}
                    />
                </div>
            );

        case "LEISURE" : 
            return (
                <div className="additional-info-grid">
                    <div className="info-item">
                        <h4 className="item-title">문의 및 안내</h4>
                        <p className="item-content">문의 : {tour.inquiryGuide ? render(tour.inquiryGuide) : "-"}</p>
                        <p className="item-content">주소 : {tour.addr ? render(tour.addr) : "-"}</p>
                        {tour.reservation && (<p className="item-content">예약안내 : {render(tour.reservation)}</p>)}
                    </div>
                    <div className="info-item">
                        <h4 className="item-title">이용시간</h4>
                        <p className="item-content">영업시간 : {tour.sellTime ? render(tour.sellTime) : "-"}</p>
                        <p className="item-content">쉬는날 : {tour.dayoff ? render(tour.dayoff) : "-"}</p>
                    </div>
                    <div className="info-item">
                        <h4 className="item-title">주차</h4>
                        <p className="item-content">주차 : {tour.parking ? render(tour.parking) : "-"}</p>
                    </div>
                    <div className="info-item">
                        <h4 className="item-title">시설 이용료</h4>
                        <p className="item-content">{tour.representMenu ? render(tour.representMenu) : "-"}</p>
                        <p className="item-content">{tour.menus ? render(tour.menus) : "-"}</p>
                    </div>
                    <div className="info-item">
                        <h4 className="item-title">추가 정보</h4>
                        <p className="item-content">{tour.detail ? render(tour.detail) : "-"}</p>
                        {tour.scale && (<p className="item-content">규모 : {render(tour.scale)}</p>)}
                        {tour.saleInfo && (<p className="item-content">할인정보 : {render(tour.saleInfo)}</p>)}
                        {tour.smorkingYn && (<p className="item-content">금연/흡연 : {render(tour.smorkingYn)}</p>)}
                        {tour.childcareCenter && (<p className="item-content">어린이놀이방 : {render(tour.childcareCenter)}</p>)}
                        {showMoreButton && (
                            <button className="more-button" onClick={openModal}>
                                더보기
                            </button>
                        )}
                    </div>
                    <DetailModal
                        isOpen={isModalOpen}
                        onClose={closeModal}
                        title="추가 정보 상세"
                        content={tour.detail ? render(tour.detail) : "내용이 없습니다."}
                    />
                </div>
            );
        default : 
        return (<></>);
    }
}

export default ClassifyDetails;