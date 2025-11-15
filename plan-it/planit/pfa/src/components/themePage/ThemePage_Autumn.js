import React from 'react';
import '../../css/theme/ThemePage.css'; // 동일한 CSS 파일을 사용합니다.

const autumnSpots = [
      {
    id: 1,
    name: '내장산 국립공원',
    image: '/images/autumn_naejangsan.jpg',
    description: '\'호남의 금강산\'이라 불리는 단풍 명소입니다. 특히 내장사로 들어가는 길의 단풍 터널은 황홀한 장관을 연출합니다.',
  },
  {
    id: 2,
    name: '설악산 국립공원',
    image: '/images/autumn_seoraksan.jpg',
    description: '대한민국 단풍의 시작을 알리는 곳. 울산바위, 천불동 계곡 등 웅장한 기암괴석과 어우러진 오색 단풍은 감탄을 자아냅니다.',
  },
  {
    id: 3,
    name: '경주 불국사 & 동궁과 월지',
    image: '/images/autumn_gyeongju.jpg',
    description: '역사적인 고 건축물과 붉게 물든 단풍의 조화가 고즈넉한 아름다움을 선사합니다. 밤에는 단풍과 어우러진 야경이 특히 아름답습니다.',
  },
    {
    id: 4,
    name: '아산 곡교천 은행나무길',
    image: '/images/autumn_asan.jpg',
    description: '도로 양옆으로 늘어선 은행나무들이 노란빛으로 터널을 이루는 곳입니다. 가을의 절정을 만끽하며 낭만적인 산책을 즐겨보세요.',
}
];

const ThemePage_Autumn = () => {
  const heroImage = autumnSpots.length > 0 ? autumnSpots[0].image : '';

  return (
    <div className="theme-page-v2-container">
      <header
        className="hero-section"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="hero-content">
          <h1>황금빛으로 물드는 가을</h1>
          <p>웜톤으로 물들어가는 계절, 낭만 가득한 단풍 명소로 떠나보세요.</p>
        </div>
      </header>

      <main className="content-section">
        {autumnSpots.map((spot, index) => (
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

export default ThemePage_Autumn;