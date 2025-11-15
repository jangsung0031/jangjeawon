import React from 'react';
import '../../css/theme/ThemePage.css';

const springSpots = [
  {
    id: 1,
    name: '진해 군항제',
    image: '/images/spring_jinhae.jpg',
    description: '대한민국 최대의 벚꽃 축제로, 온 도시가 벚꽃으로 뒤덮여 장관을 이룹니다. 여좌천 로망스 다리는 최고의 포토 스팟이죠.',
  },
  {
    id: 2,
    name: '광양 매화마을',
    image: '/images/spring_gwangyang.jpg',
    description: '벚꽃보다 먼저 봄을 알리는 매화가 섬진강변을 따라 만개합니다. 마치 하얀 눈이 내린 듯한 착각을 불러일으키죠.',
  },
  {
    id: 3,
    name: '경주 불국사',
    image: '/images/spring_gyeongju.jpg',
    description: '고즈넉한 사찰과 화사한 겹벚꽃의 조화가 아름다운 곳입니다. 차분한 분위기 속에서 봄의 정취를 만끽하기에 좋습니다.',
  },
    {
    id: 4,
    name: '제주 유채꽃밭',
    image: '/images/spring_jeju.jpg',
    description: '푸른 제주 바다를 배경으로 펼쳐진 노란 유채꽃밭은 그림 같은 풍경을 선사합니다. 산방산 근처가 특히 유명합니다.',
}
];

const ThemePage_Spring = () => {
  const heroImage = springSpots.length > 0 ? springSpots[0].image : '';

  return (
    <div className="theme-page-v2-container">
      <header 
        className="hero-section" 
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="hero-content">
          <h1>봄의 설렘, 꽃길 따라 떠나는 여행</h1>
          <p>가만히 있어도 마음이 들뜨는 계절, 봄! 전국 방방곡곡 숨겨진 봄꽃 명소로 여러분을 초대합니다.</p>
        </div>
      </header>

      <main className="content-section">
        {springSpots.map((spot, index) => (
          <section key={spot.id} className={`spot-section ${index % 2 !== 0 ? 'reverse' : ''}`}>
            <div className="spot-image-wrapper">
              <img src={spot.image} alt={spot.name} className="spot-image" />
            </div>
            <div className="spot-text-content">
              <h3>{spot.name}</h3>
              <p>{spot.description}</p>
            </div>
          </section>
        ))}
      </main>
    </div>
  );
};

export default ThemePage_Spring;