# 🌱 새싹아이 (Plant AI)

반려식물의 생애주기 관리 AI 서비스

## 📝 프로젝트 소개

새싹아이는 AI 기술을 활용하여 반려식물을 효과적으로 관리할 수 있도록 돕는 웹 애플리케이션입니다. 식물 사진만 업로드하면 AI가 자동으로 식물을 식별하고, 맞춤형 관리 가이드와 성장 예측을 제공합니다.

## ✨ 주요 기능

### 1. 멀티 모델 식물 종 식별 (Image Classification)
- **두 가지 AI 모델을 지원**하여 더 정확한 식물 식별
  - **모델 1**: umutbozdag/plant-identity - 20종 식물 전문 인식 (로컬 실행)
  - **모델 2**: PlantRecog API - 299종의 꽃을 인식하는 전문 모델
- **자동 모델 선택**: 모델1 신뢰도 ≥ 50% 시 우선 사용, 미만 시 모델2 사용
- **Transformers 라이브러리를 직접 사용**하여 로컬에서 식물 종 식별
- 업로드된 이미지를 분석하여 식물 종을 정확하게 식별
- 신뢰도 점수와 함께 상위 3개 결과 제공
- **영어→한국어 자동 번역** (facebook/nllb-200-distilled-600M)
- **모델 비교 테스트 페이지** 제공 - 두 모델의 결과를 직접 비교 가능
- **📷 카메라 촬영 기능** - 모바일에서 바로 촬영하여 분석 가능

### 2. 맞춤형 관리 가이드
- 식별된 식물에 맞는 상세한 관리법 제공
  - 물주기 빈도 및 방법
  - 햇빛 요구사항
  - 적정 온도 및 습도
  - 비료 사용법
  - 토양 정보
  - 실용적인 관리 팁 3가지

### 3. 성장 예측 타임라인
- 4단계 성장 타임라인 제공
  - 현재
  - 1개월 후
  - 3개월 후
  - 6개월 후
- 각 단계별 상세 설명

### 4. 병충해 진단 및 AI 방제법 제공 🐛
- **YOLOv8 기반 병충해 감지**: 식물 잎 이미지에서 병충해 자동 감지
- **신뢰도 기반 진단**: 높은 신뢰도, 중간 신뢰도, 낮은 신뢰도로 분류
- **GPT-4o mini 기반 방제법**: AI가 진단 결과를 바탕으로 맞춤형 방제법 및 예방법 제공
  - 마크다운 형식으로 구조화된 정보 제공 (제목, 리스트, 강조 등)
  - 즉시 조치 방법, 화학적/친환경/물리적 방제법, 예방법 포함
- **사용자 증상 입력**: 신뢰도가 낮을 때 사용자가 직접 증상을 입력하여 조언 받기
- **한국어 번역**: 병충해명과 식물명 자동 한국어 번역

## 🛠 기술 스택

### 백엔드
- **Python 3.11**
- **FastAPI**: 고성능 비동기 웹 프레임워크
- **Uvicorn**: ASGI 서버
- **Transformers**: Hugging Face의 딥러닝 모델 라이브러리
- **PyTorch**: 딥러닝 프레임워크
- **Pillow**: 이미지 처리
- **Pydantic**: 데이터 유효성 검증

### 프론트엔드
- **React 18**: UI 라이브러리
- **Vite**: 빌드 도구
- **React Router DOM**: 라우팅 (NavLink, useNavigate, useLocation 활용)
- **Axios**: HTTP 클라이언트
- **TailwindCSS**: 스타일링 + shadcn/ui 컴포넌트
- **Framer Motion**: 애니메이션
- **Lucide React**: 아이콘 라이브러리
- **Recharts**: 그래프 시각화
- **react-markdown**: 마크다운 렌더링 (AI 방제법 표시용)
- **WebRTC API**: 웹캠 촬영 기능

### AI 모델
- **식물 식별 (멀티 모델)**:
  - 모델 1: [umutbozdag/plant-identity](https://huggingface.co/umutbozdag/plant-identity) - 20종 식물 전문 모델 (로컬 실행)
  - 모델 2: [PlantRecog](https://github.com/sarthakpranesh/PlantRecog) API - 299종 꽃 인식 전문 모델
  - 자동 선택 로직: 모델1 신뢰도 ≥ 50% 시 우선 사용
- **병충해 감지**: YOLOv8 기반 객체 감지 모델 (plant_disease.pt)
- **방제법 생성**: GPT-4o mini (OpenAI API) - 마크다운 형식의 구조화된 방제법 제공
- **다국어 번역**: [facebook/nllb-200-distilled-600M](https://huggingface.co/facebook/nllb-200-distilled-600M) - 영어→한국어 자동 번역
- **관리 가이드**: GPT-4o mini 기반 맞춤형 관리법 생성
- **성장 예측**: 설명 기반 타임라인

## 📦 설치 및 실행

### 사전 요구사항
- Python 3.11 이상
- Node.js 18 이상
- (권장) 8GB 이상의 RAM
- (선택) GPU (CUDA 지원 시 더 빠른 추론)

### 백엔드 설정

1. 백엔드 디렉토리로 이동
```bash
cd backend
```

2. 가상환경 생성 및 활성화
```bash
python -m venv venv
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate  # Windows
```

3. 의존성 설치
```bash
pip install -r requirements.txt
```

**참고**: PyTorch 설치 시 시스템에 맞는 버전을 설치하세요.
- CPU 버전: `pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu`
- GPU 버전: [PyTorch 공식 사이트](https://pytorch.org/get-started/locally/)에서 확인

4. 환경변수 설정 (선택사항)
```bash
# .env.example을 참고하여 .env 파일 생성 (필수 아님)
cp .env.example .env
```

**.env 파일 설정**:
- API 토큰이 **필요 없습니다**! 모델이 자동으로 다운로드됩니다.
- Hugging Face 토큰은 선택사항 (rate limit 완화 목적)
- **OpenAI API 키 (선택사항)**: GPT-4o mini를 사용한 방제법 및 관리법 생성 기능을 사용하려면 `OPENAI_API_KEY` 설정 필요

5. 서버 실행
```bash
uvicorn app.main:app --reload --port 8000
```

**첫 실행 시**: 모델 다운로드에 시간이 걸립니다 (약 300MB).
모델은 `model_cache/` 디렉토리에 저장되며, 이후에는 재사용됩니다.

백엔드 서버가 `http://localhost:8000`에서 실행됩니다.

### 프론트엔드 설정

1. 프론트엔드 디렉토리로 이동
```bash
cd frontend
```

2. 의존성 설치
```bash
npm install
```

3. 개발 서버 실행
```bash
npm run dev
```

프론트엔드가 `http://localhost:5173`에서 실행됩니다.

**터미널에 표시되는 주소:**
```
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.0.123:5173/
```
- **Local**: PC에서 접속
- **Network**: 같은 Wi-Fi의 모바일에서 접속 (카메라 기능 사용 가능!)

### 📱 모바일 테스트 (카메라 기능)

**카메라 촬영 기능**을 모바일에서 테스트하려면:

1. **PC와 모바일을 같은 Wi-Fi에 연결**
2. **PC에서 프론트엔드 실행** (`npm run dev`)
3. **터미널에 표시된 Network 주소 확인**
   - 예: `http://192.168.0.123:5173`
4. **모바일 브라우저에서 해당 주소로 접속**
5. **테스트 페이지(`/test`)로 이동**
6. **"📷 카메라로 촬영" 버튼으로 바로 촬영 가능!**

**⚠️ 중요:**
- 카메라 API는 **HTTPS** 또는 **로컬 네트워크(HTTP)**에서만 작동합니다
- 같은 Wi-Fi 네트워크에서는 HTTP로도 카메라 사용 가능
- 각자의 PC IP는 다르므로, 터미널에 표시된 주소를 사용하세요

## 🚀 사용 방법

### 📱 페이지 구조 및 기능

#### 1️⃣ **메인 페이지** (`/`)
- **Hero 섹션**: 서비스 소개 및 시작하기 버튼
- **Why 새싹아이?**: 서비스 필요성 설명
- **주요 기능**: 4가지 핵심 기능 카드 (클릭 시 시연 팝업)
  - 🔍 식물 종 식별 및 분류
  - 📖 맞춤형 관리법 제공
  - 📈 성장 예상 분석
  - 💬 식물 관리법 AI 챗봇
- **사용 방법**: 4단계 프로세스 소개
- **식물 케어란?**: 서비스 철학

#### 2️⃣ **새싹아이란?** (`/guide`)
- 서비스 소개 및 사용 가이드
- 주요 기능 상세 설명
- 시작하기 안내

#### 3️⃣ **식별 페이지** (`/identify`)
- **이미지 업로드**:
  - 드래그 앤 드롭 지원
  - 파일 선택 (갤러리)
  - **📷 웹캠 촬영 기능** (라이브 피드 모달)
- **AI 분석**:
  - 실시간 로딩 애니메이션
  - 식물 종 식별 결과
  - 신뢰도 표시
- **다음 단계**:
  - 관리법 보기 버튼
  - 성장도 보기 버튼

#### 4️⃣ **관리법 페이지**
- **독립 접근** (`/care`): 챗봇 형식으로 관리법 질문/답변
- **식별 후** (`/care/:id`): 식별된 식물의 상세 관리법
  - 물주기, 햇빛, 온도, 습도, 비료 정보
  - 병충해 진단 (임시 데이터)
  - 관리 팁 제공
  - 성장도/우리아이로 연결

#### 5️⃣ **성장도 페이지**
- **독립 접근** (`/growth`): 식물 종을 먼저 선택
- **식별 후** (`/growth/:id`): 해당 식물의 성장 예측
  - 잘 키웠을 때 vs 못 키웠을 때 비교 그래프
  - 월별 성장 데이터 시각화
  - 관리 팁 및 주의사항
  - 우리아이로 연결

#### 6️⃣ **우리아이 페이지** (`/mychild`)
- 내 식물 목록 관리
- 개별 식물 관리 기록
- 물주기/비료 일정 관리
- 사진 업로드 및 성장 기록
- PDF/CSV 내보내기

#### 7️⃣ **병충해 진단 페이지** (`/detect`)
- **이미지 업로드**: 드래그 앤 드롭 또는 파일 선택
- **AI 진단**: YOLOv8 모델로 병충해 자동 감지
- **진단 결과 표시**:
  - 식물 종 정보 (한국어 번역)
  - 병충해 정보 및 신뢰도
  - 감지된 병충해 위치 시각화
- **AI 방제법 및 예방법**:
  - GPT-4o mini 기반 맞춤형 방제법 제공
  - 마크다운 형식으로 구조화된 정보 표시
  - 즉시 조치 방법, 화학적/친환경/물리적 방제법, 예방법 포함
- **사용자 증상 입력**: 신뢰도가 낮을 때 증상 입력하여 조언 받기

### 🎯 주요 사용 시나리오

#### 시나리오 1: 식물 종 식별부터 시작
```
메인 페이지 → 식별 → 관리법 → 성장도 → 우리아이
```
1. "내 식물 종 식별하고 케어 시작하기" 클릭
2. 식물 사진 업로드 또는 촬영
3. AI 분석 결과 확인
4. 관리법 확인
5. 성장도 그래프 확인
6. 우리아이에 등록하여 지속 관리

#### 시나리오 2: 관리법만 빠르게 확인
```
헤더 메뉴 → 관리법 → 챗봇으로 질문
```
1. 헤더에서 "관리법" 클릭
2. AI 챗봇에게 식물 관리 질문
3. 즉시 답변 확인

#### 시나리오 3: 내 식물 관리 기록
```
헤더 메뉴 → 우리아이 → 식물 추가/관리
```
1. 헤더에서 "우리아이" 클릭
2. 새 식물 추가
3. 물주기/비료 일정 입력
4. 성장 사진 업로드
5. 기록 내보내기 (PDF/CSV)

#### 시나리오 4: 병충해 진단 및 방제
```
헤더 메뉴 → 진단해줘 → 이미지 업로드 → AI 진단 → 방제법 확인
```
1. 헤더에서 "진단해줘" 클릭
2. 병충해가 의심되는 식물 잎 사진 업로드
3. AI 진단 결과 확인 (식물 종, 병충해 종류, 신뢰도)
4. GPT-4o mini가 제공하는 맞춤형 방제법 및 예방법 확인
5. 마크다운 형식으로 구조화된 정보로 쉽게 이해하기

### 🎨 UI/UX 특징

- **Framer Motion 애니메이션**: 부드러운 페이지 전환 및 요소 등장
- **반응형 디자인**: 모바일/태블릿/데스크톱 최적화
- **다크 모드 대응**: TailwindCSS 기반 테마
- **shadcn/ui 컴포넌트**: 일관된 디자인 시스템
- **로컬 스토리지 연동**: 페이지 간 데이터 유지
- **실시간 피드백**: 로딩 상태, 에러 메시지, 성공 알림

## 📁 프로젝트 구조

```
proj1/
├── backend/                    # FastAPI 백엔드
│   ├── app/
│   │   ├── main.py            # 앱 진입점
│   │   ├── config.py          # 설정 관리
│   │   ├── api/               # API 엔드포인트
│   │   │   ├── plant.py       # 식물 분석 API
│   │   │   └── health.py      # 헬스체크
│   │   ├── models/            # 데이터 모델
│   │   │   └── schemas.py     # Pydantic 스키마
│   │   └── services/          # 비즈니스 로직
│   │       ├── classifier.py  # 식물 식별 (Transformers)
│   │       ├── guide.py       # 관리법 생성 (GPT-4o mini)
│   │       ├── growth.py      # 성장 예측
│   │       ├── db_utils.py    # 데이터베이스 유틸리티
│   │       └── textgen_adapter.py  # 텍스트 생성 어댑터
│   ├── inference.py           # YOLOv8 병충해 감지 모델
│   ├── llm_service.py         # GPT-4o mini 방제법 생성 서비스
│   ├── models/                # 학습된 모델
│   │   └── plant_disease.pt   # 병충해 감지 모델
│   ├── requirements.txt       # Python 의존성
│   └── .env.example          # 환경변수 예시
│
├── frontend/                   # React 프론트엔드
│   ├── src/
│   │   ├── main.jsx           # 진입점
│   │   ├── App.jsx            # 라우팅 설정
│   │   │
│   │   ├── layouts/           # 레이아웃
│   │   │   └── Shell.jsx      # 공통 헤더/푸터 레이아웃
│   │   │
│   │   ├── pages/             # 페이지 컴포넌트
│   │   │   ├── Home.jsx       # 메인 홈 페이지
│   │   │   ├── ProgramGuide.jsx   # 새싹아이란? (프로그램 소개)
│   │   │   ├── Identify.jsx       # 식물 종 식별 (이미지 업로드 + 웹캠 촬영)
│   │   │   ├── PlantDetect.jsx    # 병충해 진단 (이미지 업로드)
│   │   │   ├── CareChat.jsx       # 관리법 챗봇 (독립 접근)
│   │   │   ├── Care.jsx           # 관리법 상세 (식별 후)
│   │   │   ├── GrowthStandalone.jsx # 성장도 (독립 접근)
│   │   │   ├── Growth.jsx         # 성장도 상세 (식별 후)
│   │   │   └── MyChild.jsx        # 우리아이 (식물 관리 기록)
│   │   │
│   │   ├── components/        # 재사용 컴포넌트
│   │   │   ├── home/
│   │   │   │   ├── FeaturesSection.jsx   # 주요 기능 카드 + 시연 팝업
│   │   │   │   ├── HowItWorksSection.jsx # 사용 방법 4단계
│   │   │   │   └── GrowthChart.jsx       # 성장도 그래프
│   │   │   ├── ui/            # shadcn/ui 컴포넌트
│   │   │   │   ├── button.jsx
│   │   │   │   ├── card.jsx
│   │   │   │   ├── dialog.jsx
│   │   │   │   ├── input.jsx
│   │   │   │   ├── textarea.jsx
│   │   │   │   ├── badge.jsx
│   │   │   │   ├── select.jsx
│   │   │   │   ├── progress.jsx
│   │   │   │   └── ... (기타 UI 컴포넌트)
│   │   │   ├── ImageUploader.jsx   # 이미지 업로드 컴포넌트
│   │   │   ├── ResultDisplay.jsx   # 병충해 진단 결과 표시 (마크다운 렌더링 포함)
│   │   │   └── ScrollToTop.jsx  # 페이지 전환 시 스크롤 초기화
│   │   │
│   │   ├── hooks/             # 커스텀 훅
│   │   │   └── usePersistedState.js  # 로컬 스토리지 연동 상태 관리
│   │   │
│   │   ├── lib/
│   │   │   └── utils.js       # 유틸리티 함수
│   │   │
│   │   └── styles/
│   │       └── globals.css    # 전역 스타일
│   │
│   ├── public/
│   │   ├── mockServiceWorker.js  # Mock Service Worker
│   │   └── images/           # 이미지 자산
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── README.md
```

## 🔧 API 엔드포인트

### `POST /api/plant/analyze`
umutbozdag/plant-identity 모델로 식물 이미지를 분석합니다 (20종 식물).

**요청:**
- Content-Type: `multipart/form-data`
- Body: `file` (이미지 파일)

**응답:**
```json
{
  "identification": {
    "plant_name": "Monstera Deliciosa",
    "scientific_name": null,
    "confidence": 0.95,
    "common_names": ["Monstera", "Swiss Cheese Plant", "Split Leaf"]
  },
  "care_guide": {
    "watering": "주 1-2회 물주기...",
    "sunlight": "밝은 간접광...",
    "temperature": "18-24°C...",
    "humidity": "중간 습도...",
    "fertilizer": "월 1회 액체비료...",
    "soil": "배수가 잘 되는 흙...",
    "tips": ["팁1", "팁2", "팁3"]
  },
  "growth_prediction": {
    "stages": [
      {
        "stage": "current",
        "timeframe": "현재",
        "image_url": null,
        "description": "초기 단계 설명..."
      }
    ]
  },
  "success": true,
  "message": "분석이 완료되었습니다."
}
```

### `POST /api/plant/analyze-v2`
PlantRecog 모델로 식물 이미지를 분석합니다 (299종 꽃 인식).

**요청:**
- Content-Type: `multipart/form-data`
- Body: `file` (이미지 파일)

**응답:** `/api/plant/analyze`와 동일한 형식

### `POST /api/plant/compare`
두 모델(umutbozdag/plant-identity + PlantRecog)의 결과를 비교합니다 (한국어 번역 포함).

**요청:**
- Content-Type: `multipart/form-data`
- Body: `file` (이미지 파일)

**응답:**
```json
{
  "success": true,
  "message": "두 모델의 분석이 완료되었습니다.",
  "models": {
    "vit": {
      "name": "umutbozdag/plant-identity (20종)",
      "result": { /* PlantIdentification (한국어 번역) */ }
    },
    "plantrecog": {
      "name": "PlantRecog (299 Flowers)",
      "result": { /* PlantIdentification (한국어 번역) */ }
    }
  }
}
```

### `POST /api/plant/analyze-auto`
자동 모델 선택으로 최적의 결과를 제공합니다 (한국어 번역 포함).

**로직:**
- 모델1 신뢰도 ≥ 50% → 모델1 결과 사용
- 모델1 신뢰도 < 50% → 모델2 결과 사용

**요청:**
- Content-Type: `multipart/form-data`
- Body: `file` (이미지 파일)

**응답:** `/api/plant/analyze`와 동일한 형식 (한국어 번역 포함)

### `GET /health`
서버 상태를 확인합니다.

**응답:**
```json
{
  "status": "healthy",
  "message": "새싹아이 API가 정상 작동 중입니다."
}
```

### `POST /api/detect`
병충해 진단을 수행합니다. YOLOv8 모델을 사용하여 식물 잎 이미지에서 병충해를 감지하고, GPT-4o mini로 방제법을 제공합니다.

**요청:**
- Content-Type: `multipart/form-data`
- Body: 
  - `file` (이미지 파일)
  - `user_notes` (선택사항): 사용자가 입력한 증상 설명
  - `conf_threshold` (선택사항): 신뢰도 임계값 (기본값: 0.01)

**응답:**
```json
{
  "success": true,
  "diagnosis_status": "high_confidence",
  "max_confidence": 0.95,
  "species": {
    "name": "Rose",
    "name_kr": "장미",
    "confidence": 0.92
  },
  "diseases": [
    {
      "name": "Downy Mildew",
      "name_kr": "로즈 다운이 밀듀",
      "confidence": 0.95,
      "bbox": [x, y, width, height]
    }
  ],
  "result_image": "base64_encoded_image",
  "treatment_advice": "### 병충해 개요\n...",
  "llm_enabled": true,
  "status_message": "✅ 정확한 진단이 완료되었습니다."
}
```

### `GET /docs`
FastAPI 자동 생성 문서 (Swagger UI)

## 🔄 주요 변경 사항

### 🎉 v4.0 - 병충해 진단 및 AI 방제법 기능 추가 (2025.01)

#### ✨ 새로운 기능
- **🐛 병충해 진단**: YOLOv8 기반 객체 감지로 병충해 자동 감지
- **🤖 AI 방제법 제공**: GPT-4o mini를 사용한 맞춤형 방제법 및 예방법 생성
- **📝 마크다운 렌더링**: react-markdown을 사용하여 구조화된 방제법 정보 표시
- **🌐 한국어 번역**: 병충해명과 식물명 자동 한국어 번역
- **💬 사용자 증상 입력**: 신뢰도가 낮을 때 사용자가 직접 증상을 입력하여 조언 받기

#### 🏗️ 구조 개선
- **PlantDetect 페이지**: 병충해 진단 전용 페이지 추가
- **ResultDisplay 컴포넌트**: 진단 결과 표시 및 마크다운 렌더링 지원
- **LLM 서비스 통합**: llm_service.py로 GPT-4o mini 서비스 분리
- **inference.py**: YOLOv8 모델 로딩 및 추론 처리

#### 🎨 UI/UX 개선
- **마크다운 스타일링**: 방제법 정보를 제목, 리스트, 강조 등으로 구조화하여 표시
- **신뢰도 기반 UI**: 높은/중간/낮은 신뢰도에 따른 다른 UI 표시
- **시각화**: 감지된 병충해 위치를 이미지에 표시

### 🎉 v3.0 - 프론트엔드 전면 개편 (2025.10.31)

#### ✨ 새로운 기능
- **📷 웹캠 촬영**: 라이브 피드 모달로 실시간 식물 촬영
- **🎭 시연 팝업**: 백엔드 연동 없이 기능 체험 가능
- **💬 AI 챗봇**: 식물 관리법 실시간 질의응답
- **📊 성장도 그래프**: Recharts 기반 비교 차트
- **📝 우리아이**: 식물 관리 기록 및 일정 관리
- **🌈 Framer Motion**: 부드러운 애니메이션 효과

#### 🏗️ 구조 개선
- **레이아웃 시스템**: Shell.jsx 기반 공통 헤더/푸터
- **라우팅 재설계**: 독립 페이지 + 상세 페이지 분리
  - `/care` (챗봇) vs `/care/:id` (상세)
  - `/growth` (독립) vs `/growth/:id` (상세)
- **상태 관리**: usePersistedState 훅으로 로컬 스토리지 연동
- **컴포넌트 모듈화**: FeaturesSection, HowItWorksSection 분리

#### 🎨 디자인 시스템
- **shadcn/ui**: 일관된 컴포넌트 라이브러리
- **TailwindCSS**: 유틸리티 우선 스타일링
- **Lucide React**: 통일된 아이콘 세트
- **반응형 디자인**: 모바일 우선 접근

#### 🚀 성능 최적화
- **코드 스플리팅**: 페이지별 동적 로딩
- **이미지 최적화**: Unsplash CDN 활용
- **메모이제이션**: React.memo 및 useMemo 활용

### ✅ v2.0 - 백엔드 개선

#### API 토큰 불필요
- **이전**: Hugging Face API 토큰 필수
- **현재**: 토큰 없이 바로 사용 가능
- Transformers 라이브러리를 직접 import하여 로컬에서 모델 실행

#### 로컬 모델 실행
- 모델이 `model_cache/` 디렉토리에 자동 다운로드
- 첫 실행 후에는 캐시된 모델 재사용
- 인터넷 연결 필요 (첫 다운로드 시에만)

#### 개선된 성능
- 모델을 메모리에 캐싱하여 빠른 추론
- GPU 자동 감지 및 사용
- 효율적인 배치 처리

#### 의존성
```
transformers==4.36.2
torch==2.1.2
torchvision==0.16.2
huggingface-hub==0.20.2
diffusers==0.25.0
accelerate==0.25.0
```

## ⚙️ 설정 옵션

### 모델 변경
`backend/app/config.py`에서 모델을 변경할 수 있습니다:

```python
class Settings(BaseSettings):
    plant_classifier_model: str = "google/vit-base-patch16-224"
    text_generation_model: str = "gpt2"
    image_generation_model: str = "stabilityai/sd-turbo"
```

### 캐시 디렉토리
모델은 기본적으로 `./model_cache`에 저장됩니다.
`.env` 파일에서 변경 가능:

```
CACHE_DIR=./custom_cache_path
```

## 🐛 문제 해결

### 모델 다운로드 실패
```bash
# 수동으로 모델 다운로드
python -c "from transformers import AutoModel; AutoModel.from_pretrained('google/vit-base-patch16-224')"
```

### 메모리 부족
- CPU 사용 시 최소 8GB RAM 권장
- 메모리가 부족한 경우 더 작은 모델 사용
- 또는 API 방식으로 되돌리기

### GPU 사용 오류
```bash
# CPU 버전 PyTorch 재설치
pip uninstall torch torchvision
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
```

### 첫 실행이 느림
- 정상입니다! 모델 다운로드 중입니다 (약 300MB)
- 이후 실행은 빠릅니다

## 📊 시스템 요구사항

### 최소 사양
- CPU: 2코어 이상
- RAM: 8GB
- 디스크: 2GB (모델 캐시용)
- Python: 3.11+

### 권장 사양
- CPU: 4코어 이상
- RAM: 16GB
- GPU: CUDA 지원 (추론 속도 향상)
- 디스크: 5GB

## 🤝 기여

이 프로젝트에 기여하고 싶으시다면 Pull Request를 보내주세요!

## 📄 라이선스

이 프로젝트는 개인 학습 및 연구 목적으로 제작되었습니다.

## 🙏 감사의 말

- [Hugging Face](https://huggingface.co/)의 훌륭한 Transformers 라이브러리
- [Google Research](https://github.com/google-research)의 Vision Transformer 모델
- 오픈소스 커뮤니티의 모든 기여자들

## 📞 문의

문제가 발생하거나 질문이 있으시면 이슈를 등록해주세요.

## 🔧 프론트엔드 주요 기술 구현

### 웹캠 촬영 기능 (`Identify.jsx`)
```javascript
// WebRTC API 사용
const stream = await navigator.mediaDevices.getUserMedia({ 
  video: { facingMode: 'environment' } 
});
videoRef.current.srcObject = stream;

// Canvas로 캡처
const canvas = canvasRef.current;
const context = canvas.getContext('2d');
context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
canvas.toBlob(blob => {
  const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
  setSelectedFile(file);
});
```

### 로컬 스토리지 상태 관리 (`usePersistedState.js`)
```javascript
// 페이지 간 데이터 유지
const [identification, setIdentification] = usePersistedState('plantIdentification', null);
const [careGuide, setCareGuide] = usePersistedState('plantCareGuide', null);
const [uploadedImageUrl, setUploadedImageUrl] = usePersistedState('uploadedImageUrl', null);
```

### 시연 팝업 (`FeaturesSection.jsx`)
- 백엔드 없이 동작하는 데모
- 3초 시뮬레이션 후 결과 표시
- 실제 기능으로 연결 버튼 제공

### 애니메이션 (`Framer Motion`)
```javascript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6 }}
>
  {/* 컨텐츠 */}
</motion.div>
```

## 📱 모바일 최적화

- **터치 제스처**: 드래그 앤 드롭 지원
- **반응형 그리드**: 모바일/태블릿/데스크톱 레이아웃 자동 전환
- **웹캠 접근**: 후면 카메라 우선 사용 (`facingMode: 'environment'`)
- **네트워크 주소**: 같은 Wi-Fi에서 모바일 접속 가능

---

**새싹아이**와 함께 반려식물을 더 건강하게 키워보세요! 🌿

**v4.0 업데이트**: 병충해 진단 및 AI 방제법 기능 추가! 🐛🤖  
**v3.0 업데이트**: 완전히 새로워진 UI/UX와 웹캠 촬영 기능! 🎉  
**v2.0 업데이트**: 이제 API 토큰 없이도 바로 사용할 수 있습니다! 🔥
