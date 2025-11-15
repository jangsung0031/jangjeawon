import { useEffect, useRef } from "react";

const TourMap = ({ address, tourName, onCloseMap }) => {
  const mapContainer = useRef(null);
  const { kakao } = window;

  useEffect(() => {
    if (!kakao || !mapContainer.current) {
      console.log('카카오맵 라이브러리가 로드되지 않았거나 mapContainer가 준비되지 않았습니다.');
      return;
    }

    // 주소-좌표 변환 객체를 생성
    const geocoder = new kakao.maps.services.Geocoder();

    // 주소로 좌표를 검색
    geocoder.addressSearch(address, function (result, status) {
      if (status === kakao.maps.services.Status.OK) {
        const coords = new kakao.maps.LatLng(result[0].y, result[0].x);

        // 지도 옵션
        const mapOption = {
          center: coords, // 지도의 중심좌표
          level: 3 // 지도의 확대 레벨
        };

        // 지도를 표시할 div와 지도 옵션으로 지도를 생성
        const map = new kakao.maps.Map(mapContainer.current, mapOption);

        // 결과값으로 받은 위치를 마커로 표시
        const marker = new kakao.maps.Marker({
          map: map,
          position: coords
        });

        // 인포윈도우로 장소에 대한 설명을 표시
        const infowindow = new kakao.maps.InfoWindow({
          content: `<div style="padding: 5px; font-size: 13px; width: 250px;"> 
                        <div style="font-size: 16px; color: #333333; font-weight: bold; margin-bottom: 2px;">
                            ${tourName}
                        </div>
                        <div style="font-size: 13px; color: #888888;">
                            ${address}
                        </div>
                    </div>`
        });
        infowindow.open(map, marker);

        // 지도의 중심을 결과값으로 받은 위치로 이동시킴
        map.setCenter(coords);

      } else {
        console.log('주소 검색 실패:', status);
        // 필요하다면 사용자에게 알림
      }
    });
  }, [address, kakao, tourName]);

  return (
    <div className="kakao-map-wrapper">
      <button className="back-to-list-btn" onClick={onCloseMap}>
        닫기
      </button>
      <div id="map" ref={mapContainer} style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
};

export default TourMap;