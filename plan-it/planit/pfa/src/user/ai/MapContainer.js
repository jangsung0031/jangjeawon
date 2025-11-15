import React, { useEffect, useRef } from 'react';

const { kakao } = window;

const polylineColors = ['#D95040', '#F2994A', '#F2C94C', '#27AE60', '#2D9CDB', '#563D7C', '#9B59B6'];

const MapContainer = ({ schedule, selectedDay }) => {
    const mapContainer = useRef(null);
    const mapRef = useRef(null);
    const clustererRef = useRef(null);
    const customOverlaysRef = useRef([]);
    const polylinesRef = useRef([]);
    const infowindowsRef = useRef([]);

    const clearMapElements = () => {
        if (clustererRef.current) clustererRef.current.clear();
        customOverlaysRef.current.forEach(overlay => overlay.setMap(null));
        polylinesRef.current.forEach(polyline => polyline.setMap(null));
        infowindowsRef.current.forEach(infowindow => infowindow.close());
        customOverlaysRef.current = [];
        polylinesRef.current = [];
        infowindowsRef.current = [];
    };

    useEffect(() => {
        if (!mapRef.current && kakao && kakao.maps) {
            const options = { center: new kakao.maps.LatLng(37.566826, 126.9786567), level: 8 };
            const map = new kakao.maps.Map(mapContainer.current, options);
            mapRef.current = map;
            map.addControl(new kakao.maps.MapTypeControl(), kakao.maps.ControlPosition.TOPRIGHT);
            map.addControl(new kakao.maps.ZoomControl(), kakao.maps.ControlPosition.RIGHT);
            clustererRef.current = new kakao.maps.MarkerClusterer({ map: map, averageCenter: true, minLevel: 6 });
        }

        clearMapElements();

        if (!schedule || schedule.length === 0 || !clustererRef.current) return;

        const plansToDisplay = selectedDay === 0 ? schedule : schedule.filter(plan => plan.day === selectedDay);
        if (plansToDisplay.length === 0) return;
        
        const mapBounds = new kakao.maps.LatLngBounds();
        const allMarkers = [];

        plansToDisplay.forEach(dayPlan => {
            const colorIndex = (dayPlan.day - 1) % polylineColors.length;
            const polylineColor = polylineColors[colorIndex];
            
            const linePath = [];

            if (dayPlan.places && Array.isArray(dayPlan.places)) {
                
                dayPlan.places.forEach((place, placeIndex) => {
                    if (!place.mapy || !place.mapx) return;

                    const position = new kakao.maps.LatLng(place.mapy, place.mapx);
                    
                    linePath.push(position);
                    
                    mapBounds.extend(position);
                    const marker = new kakao.maps.Marker({ position: position });
                    allMarkers.push(marker);
                    
                    const numberContent = `<div style="font-size: 12px; font-weight: bold; color: white; background: ${polylineColors[colorIndex]}; border-radius: 50%; width: 20px; height: 20px; line-height: 20px; text-align: center; border: 1px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);">${placeIndex + 1}</div>`;
                    const numberOverlay = new kakao.maps.CustomOverlay({ content: numberContent, position: position, yAnchor: 1.8 });
                    numberOverlay.setMap(mapRef.current);
                    customOverlaysRef.current.push(numberOverlay);
                    
                    const content = `<div style="padding:12px; max-width: 280px; font-size: 13px; line-height: 1.6;"><div style="font-weight: 700; font-size: 16px; margin-bottom: 8px;">${place.title || ''}</div><div style="color: #666; font-size: 12px; margin-bottom: 6px;">${place.address || '주소 정보 없음'}</div><div style="color: #444; max-height: 3.2em; overflow: hidden; text-overflow: ellipsis;">${place.description || ''}</div></div>`;
                    const infowindow = new kakao.maps.InfoWindow({ content: content, removable: true });
                    infowindowsRef.current.push(infowindow);

                    kakao.maps.event.addListener(marker, 'click', () => {
                        infowindowsRef.current.forEach(iw => iw.close());
                        infowindow.open(mapRef.current, marker);
                    });
                });
            }
            
            if (linePath.length > 1) {
                const polyline = new kakao.maps.Polyline({
                    path: linePath, 
                    strokeWeight: 3, 
                    strokeColor: polylineColor,
                    strokeOpacity: 0.8, 
                    strokeStyle: 'solid'
                });
                polyline.setMap(mapRef.current);
                polylinesRef.current.push(polyline);
            }
        });

        clustererRef.current.addMarkers(allMarkers);
        if (!mapBounds.isEmpty()) {
            mapRef.current.setBounds(mapBounds, 120, 120, 120, 120);
        }

    }, [schedule, selectedDay]);

    return (
        <div ref={mapContainer} style={{ width: '100%', height: '100%' }}></div>
    );
};

export default MapContainer;