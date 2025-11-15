const commonNotices = [
  "체크인 15:00 / 체크아웃 11:00 (시간 엄수)",
  "객실 내 금연 (흡연 시 즉시 퇴실 및 환불 불가)",
  "애완동물 동반 불가",
  "실내에서 육류·생선 등 냄새가 강한 음식 조리 금지",
  "시설 및 집기 파손 시 변상 청구",
  "22:00 이후 고성방가 및 소음 자제",
  "미성년자 단독 예약 불가",
];

const roomData = [
  {
    id: 1,
    name: "2인실 A",
    description: "조용한 커플을 위한 프라이빗 룸",
    price: "₩200,000 / 1일 숙박",
    image: "/img/room1.jpg",
    imageList: ["/img/room1.jpg", "/img/room1-2.jpg", "/img/room1-3.jpg", "/img/room1-4.jpg"],
    type: "더블룸",
    location: [
  "수영장 이용 시 이물질 조심해주세요",
  "락스 청소로 인해 아이들이 물을 먹지않게 유의 해주세요"
],
    facilities: [
      "Wi-Fi", "TV", "냉장고", "욕조",
      "편의점 도보 1분", "버스정류장 도보 3분"
    ],
    notices: ["4인 초과시 추가요금 초과인원 당 2만원 청구 됩니다", ...commonNotices],
  },
  {
    id: 2,
    name: "2인실 B",
    description: "모던한 감성의 2인용 객실",
    price: "₩210,000 / 1일 숙박",
    image: "/img/room2.jpg",
    imageList: ["/img/room2.jpg", "/img/room1-2.jpg", "/img/room1-3.jpg", "/img/room1-4.jpg"],
    type: "더블룸",
    location: [
  "수영장 이용 시 이물질 조심해주세요",
  "락스 청소로 인해 아이들이 물을 먹지않게 유의 해주세요"
],
    facilities: [
      "Wi-Fi", "TV",
      "카페 도보 2분", "ATM 도보 1분"
    ],
    notices: ["4인 초과시 추가요금 초과인원 당 2만원 청구 됩니다", ...commonNotices],
  },
  {
    id: 3,
    name: "2인실 C",
    description: "오션뷰가 매력적인 프리미엄 룸",
    price: "₩220,000 / 1일 숙박",
    image: "/img/room3.jpg",
    imageList: ["/img/room3.jpg", "/img/room1-2.jpg", "/img/room1-3.jpg", "/img/room1-4.jpg"],
    type: "더블룸",
    location: [
  "(수영장 사용 안내) - 수영장 이용 시 이물질 조심해주세요",
  "(수영장 사용 안내) - 락스 청소로 인해 아이들이 물을 먹지않게 유의 해주세요"
],

    facilities: [
      "Wi-Fi", "TV", "미니바",
      "해변 산책로 도보 1분", "사진 스팟 바로 앞"
    ],
    notices: ["4인 초과시 추가요금 초과인원 당 2만원 청구 됩니다", ...commonNotices],
  },
  {
    id: 4,
    name: "4인실 A",
    description: "소규모 가족에 안성맞춤",
    price: "₩300,000 / 1일 숙박",
    image: "/img/room4.jpg",
    imageList: ["/img/room4.jpg", "/img/room1-2.jpg", "/img/room1-3.jpg", "/img/room1-4.jpg"],
    type: "패밀리룸",
    location: [
  "수영장 이용 시 이물질 조심해주세요",
  "락스 청소로 인해 아이들이 물을 먹지않게 유의 해주세요"
],
    facilities: [
      "Wi-Fi", "TV", "냉장고", "전자레인지",
      "놀이터 도보 1분", "편의점 도보 2분"
    ],
    notices: ["6인 초과시 추가요금 초과인원 당 2만원 청구 됩니다", ...commonNotices],
  },
  {
    id: 5,
    name: "4인실 B",
    description: "모던 인테리어와 편안한 침대",
    price: "₩310,000 / 1일 숙박",
    image: "/img/room5.jpg",
    imageList: ["/img/room5.jpg", "/img/room1-2.jpg", "/img/room1-3.jpg", "/img/room1-4.jpg"],
    type: "패밀리룸",
    location: [
  "수영장 이용 시 이물질 조심해주세요",
  "락스 청소로 인해 아이들이 물을 먹지않게 유의 해주세요"
],
    facilities: [
      "Wi-Fi", "TV", "드라이기",
      "약국 도보 1분", "24시간 편의점 도보 2분"
    ],
    notices: ["6인 초과시 추가요금 초과인원 당 2만원 청구 됩니다", ...commonNotices],
  },
  {
    id: 6,
    name: "4인실 C",
    description: "정원 뷰가 아름다운 객실",
    price: "₩320,000 / 1일 숙박",
    image: "/img/room6.jpg",
    imageList: ["/img/room6.jpg", "/img/room1-2.jpg", "/img/room1-3.jpg", "/img/room1-4.jpg"],
    type: "패밀리룸",
    location: [
  "수영장 이용 시 이물질 조심해주세요",
  "락스 청소로 인해 아이들이 물을 먹지않게 유의 해주세요"
],
    facilities: [
      "Wi-Fi", "TV", "정원 뷰 테라스",
      "정원 산책로 바로 앞", "카페 도보 2분"
    ],
    notices: ["6인 초과시 추가요금 초과인원 당 2만원 청구 됩니다", ...commonNotices],
  },
  {
    id: 7,
    name: "7인실 A",
    description: "대가족 여행에 적합한 넓은 공간",
    price: "₩450,000 / 1일 숙박",
    image: "/img/room7.jpg",
    imageList: ["/img/room7.jpg", "/img/room1-2.jpg", "/img/room1-3.jpg", "/img/room1-4.jpg"],
    type: "그룹룸",
    location: [
  "수영장 이용 시 이물질 조심해주세요",
  "락스 청소로 인해 아이들이 물을 먹지않게 유의 해주세요"
],
    facilities: [
      "Wi-Fi", "TV", "주방", "다이닝 테이블",
      "마트 도보 2분", "주차장 연결"
    ],
    notices: ["9인 초과시 추가요금 초과인원 당 2만원 청구 됩니다", ...commonNotices],
  },
  {
    id: 8,
    name: "7인실 B",
    description: "바베큐 공간이 있는 단체 룸",
    price: "₩470,000 / 1일 숙박",
    image: "/img/room8.jpg",
    imageList: ["/img/room8.jpg", "/img/room1-2.jpg", "/img/room1-3.jpg", "/img/room1-4.jpg"],
    type: "그룹룸",
    location: [
  "수영장 이용 시 이물질 조심해주세요",
  "락스 청소로 인해 아이들이 물을 먹지않게 유의 해주세요"
],
    facilities: [
      "Wi-Fi", "TV", "야외 바베큐", "주방",
      "주유소 도보 3분", "버스정류장 도보 2분"
    ],
    notices: ["9인 초과시 추가요금 초과인원 당 2만원 청구 됩니다", ...commonNotices],
  },
  {
    id: 9,
    name: "7인실 C",
    description: "풀옵션 프리미엄 객실",
    price: "₩490,000 / 1일 숙박",
    image: "/img/room9.jpg",
    imageList: ["/img/room9.jpg", "/img/room1-2.jpg", "/img/room1-3.jpg", "/img/room1-4.jpg"],
    type: "그룹룸",
    location: [
  "수영장 이용 시 이물질 조심해주세요",
  "락스 청소로 인해 아이들이 물을 먹지않게 유의 해주세요"
],
    facilities: [
      "Wi-Fi", "TV", "스파 욕조", "전용 엘리베이터",
      "전용 조식 라운지 도보 30초", "전망대 도보 1분"
    ],
    notices: ["9인 초과시 추가요금 초과인원 당 2만원 청구 됩니다", ...commonNotices],
  },
];

export default roomData;
