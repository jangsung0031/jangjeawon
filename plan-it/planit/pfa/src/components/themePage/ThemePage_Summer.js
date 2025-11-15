import React from 'react';
import '../../css/theme/ThemePage.css'; // 동일한 CSS 파일을 사용한다고 가정합니다.

const summerSpots = [
  {
    id: 1,
    name: '부산 해운대해수욕장',
    image: '/images/summer_busan.jpg',
    description: '대한민국 대표 여름 피서지! 넓은 백사장과 뜨거운 열기로 가득한 곳에서 활기찬 여름을 만끽해보세요. 밤이 되면 화려한 야경이 펼쳐집니다.',
  },
  {
    id: 2,
    name: '강릉 경포해변',
    image: '/images/summer_gangneung.jpg',
    description: '동해의 푸른 바다와 깨끗한 백사장이 매력적인 곳입니다. 해변을 따라 이어진 소나무 숲길을 걸으며 시원한 바닷바람을 느껴보세요.',
  },
  {
    id: 3,
    name: '가평 용추계곡',
    image: '/images/summer_gapyeong.jpg',
    description: '찌는 듯한 더위를 날려버릴 얼음장같이 차가운 계곡물! 맑은 물과 울창한 숲이 어우러져 신선놀음을 즐기기에 완벽한 장소입니다.',
  },
    {
    id: 4,
    name: '제주 협재해수욕장',
    image: '/images/summer_jeju.jpg',
    description: '에메랄드빛 바다와 비양도가 그림처럼 펼쳐지는 환상의 해변입니다. 얕은 수심으로 아이들과 함께 물놀이를 즐기기에도 좋습니다.',
}
];

const ThemePage_Summer = () => {
  const heroImage = summerSpots.length > 0 ? summerSpots[0].image : '';

  return (
    <div className="theme-page-v2-container">
      <header 
        className="hero-section" 
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="hero-content">
          <h1>시원하고 산뜻한 여름</h1>
          <p>푸른 바다와 상쾌한 계곡으로 떠나는 완벽한 여름 휴가!</p>
        </div>
      </header>

      <main className="content-section">
        {summerSpots.map((spot, index) => (
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

export default ThemePage_Summer;