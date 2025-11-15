import React from 'react';
import '../../css/theme/ThemePage.css';

const winterSpots = [
      {
    id: 1,
    name: '평창 대관령 양떼목장',
    image: '/images/winter_pyeongchang.jpg',
    description: '온 세상이 하얗게 변하는 \'한국의 알프스\'. 끝없이 펼쳐진 설원과 목장의 풍경은 잊지 못할 겨울의 낭만을 선사합니다.',
  },
  {
    id: 2,
    name: '서울 빛초롱축제',
    image: '/images/winter_seoul_lantern.jpg',
    description: '청계천의 밤을 화려한 등불로 수놓는 서울의 대표 겨울 축제입니다. 매년 새로운 주제의 등불들이 연말의 설레는 분위기를 더해줍니다.',
  },
  {
    id: 3,
    name: '부산 크리스마스트리 문화축제',
    image: '/images/winter_busan_tree.jpg',
    description: '따뜻한 남쪽 도시 부산의 광복로 일대가 거대한 트리와 화려한 조명으로 가득찹니다. 특별한 크리스마스 추억을 만들기에 완벽한 곳입니다.',
  },
    {
    id: 4,
    name: '태백산 눈축제',
    image: '/images/winter_taebaek.jpg',
    description: '거대한 눈 조각 작품과 눈꽃 트레킹을 즐길 수 있는 겨울 왕국입니다. 어른 아이 할 것 없이 모두가 동심으로 돌아가게 만드는 곳이죠.',
}
];

const ThemePage_Winter = () => {
  const heroImage = winterSpots.length > 0 ? winterSpots[0].image : '';

  return (
    <div className="theme-page-v2-container">
      <header
        className="hero-section"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="hero-content">
          <h1>겨울의 시작을 알리는 11월 축제</h1>
          <p>반짝이는 불빛과 새하얀 눈 속에서 따뜻한 연말을 준비해보세요.</p>
        </div>
      </header>

      <main className="content-section">
        {winterSpots.map((spot, index) => (
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

export default ThemePage_Winter;