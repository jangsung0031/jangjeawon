"""
LLM 서비스 - GPT-4o mini를 활용한 방제법 제시
"""
import os
from openai import OpenAI
from typing import Optional
import logging

# .env 파일 로드
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

logger = logging.getLogger(__name__)


class PlantDiseaseAdvisor:
    """식물 병충해 방제법 제시 서비스"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Args:
            api_key: OpenAI API 키 (환경변수 OPENAI_API_KEY 사용 가능)
        """
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        
        if not self.api_key:
            logger.warning("⚠️  OPENAI_API_KEY가 설정되지 않았습니다. LLM 기능이 비활성화됩니다.")
            logger.warning(f"   현재 환경 변수 확인: OPENAI_API_KEY={'설정됨' if os.getenv('OPENAI_API_KEY') else '없음'}")
            self.client = None
        else:
            try:
                # httpx 클라이언트를 직접 생성하여 proxies 문제 해결
                import httpx
                
                # 환경 변수에서 proxies 완전히 제거
                proxy_env_vars = ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy', 'ALL_PROXY', 'all_proxy']
                saved_proxies = {}
                for var in proxy_env_vars:
                    if var in os.environ:
                        saved_proxies[var] = os.environ.pop(var)
                
                try:
                    # httpx 클라이언트를 proxies 관련 설정 없이 생성
                    http_client = httpx.Client(timeout=60.0)
                    
                    self.client = OpenAI(
                        api_key=self.api_key,
                        http_client=http_client
                    )
                    logger.info("✅ OpenAI 클라이언트 초기화 완료")
                    logger.info(f"   API 키 길이: {len(self.api_key)} 문자")
                finally:
                    # 환경 변수 복원
                    for var, value in saved_proxies.items():
                        os.environ[var] = value
                        
            except Exception as e:
                logger.error(f"❌ OpenAI 클라이언트 초기화 실패: {str(e)}")
                import traceback
                traceback.print_exc()
                self.client = None
    
    def get_treatment_advice(
        self, 
        plant_species: str, 
        disease: str,
        confidence: float,
        user_notes: Optional[str] = None
    ) -> str:
        """
        식물 병충해에 대한 방제법 및 예방법을 제공합니다.
        
        Args:
            plant_species: 식물 종 (예: "Tomato")
            disease: 병충해명 (예: "Early blight")
            confidence: 신뢰도 (0.0 ~ 1.0)
            user_notes: 사용자 추가 의견 (선택사항)
            
        Returns:
            방제법 및 예방법 텍스트
        """
        if not self.client:
            return "⚠️  AI 방제법 서비스를 사용할 수 없습니다. OPENAI_API_KEY를 설정해주세요."
        
        try:
            # 프롬프트 구성
            prompt = self._build_prompt(plant_species, disease, confidence, user_notes)
            
            # GPT-4o mini 호출
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "당신은 식물 병충해 전문가입니다. "
                            "농부와 가정 원예가들에게 실용적이고 이해하기 쉬운 "
                            "방제법과 예방법을 제공합니다. "
                            "답변은 한국어로, 친절하고 전문적인 어조로 작성하며, "
                            "구체적인 실행 단계를 포함해야 합니다."
                        )
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=800
            )
            
            advice = response.choices[0].message.content.strip()
            logger.info(f"✅ LLM 방제법 생성 완료 (식물: {plant_species}, 병충해: {disease})")
            
            return advice
            
        except Exception as e:
            logger.error(f"❌ LLM 호출 오류: {str(e)}")
            return f"⚠️  방제법 생성 중 오류가 발생했습니다: {str(e)}"
    
    def get_user_notes_advice(self, user_notes: str) -> str:
        """
        신뢰도가 낮을 때 사용자의 추가 설명만으로 조언을 제공합니다.
        
        Args:
            user_notes: 사용자 추가 의견
            
        Returns:
            조언 텍스트
        """
        if not self.client:
            return "⚠️  AI 방제법 서비스를 사용할 수 없습니다. OPENAI_API_KEY를 설정해주세요."
        
        if not user_notes or not user_notes.strip():
            return None
        
        try:
            prompt = f"""
사용자가 식물 병충해 증상에 대해 다음과 같이 설명하고 있습니다:

"{user_notes}"

위 설명만을 바탕으로 다음 내용을 포함한 실용적인 조언을 제공해주세요:

1. 증상 분석 (3-4문장)
   - 사용자가 설명한 증상에 대한 일반적인 분석
   - 가능한 원인들

2. 즉시 조치 방법
   - 지금 당장 할 수 있는 응급 조치
   - 추가 피해 방지 방법

3. 일반적인 관리 조언
   - 물 주기, 통풍, 조명 등 환경 관리
   - 예방을 위한 팁

4. 전문가 상담 권장
   - 정확한 진단을 위해 병원균 검사 등을 권장

답변은 한국어로 작성하고, 실용적이고 구체적으로 작성해주세요.
각 섹션은 이모지(🔍, 🚨, 🌱, 💡)를 활용하여 가독성을 높여주세요.
"""
            
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "당신은 식물 병충해 전문가입니다. "
                            "사용자의 설명만으로 가능한 범위에서 조언을 제공하되, "
                            "정확한 진단을 위해서는 더 많은 정보나 전문가 상담이 필요함을 안내합니다."
                        )
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=600
            )
            
            advice = response.choices[0].message.content.strip()
            logger.info(f"✅ 사용자 설명 기반 조언 생성 완료")
            
            return advice
            
        except Exception as e:
            logger.error(f"❌ LLM 호출 오류: {str(e)}")
            return None
    
    def translate_to_korean(self, english_text: str, context: str = "plant") -> str:
        """
        영어 텍스트를 한국어로 번역합니다.
        
        Args:
            english_text: 영어 텍스트
            context: 번역 컨텍스트 ("plant" 또는 "disease")
            
        Returns:
            한국어 번역 텍스트
        """
        if not self.client:
            return english_text  # API 키가 없으면 원문 반환
        
        if not english_text or not english_text.strip():
            return english_text
        
        try:
            if context == "plant":
                system_prompt = "당신은 식물학 전문 번역가입니다. 식물 이름을 한국어로 번역할 때는 일반적으로 사용되는 한국어 명칭을 사용하세요."
                user_prompt = f"다음 식물 이름을 한국어로 번역해주세요. 번역된 이름만 답변하세요: {english_text}"
            else:  # disease
                system_prompt = "당신은 식물 병리학 전문 번역가입니다. 병충해 이름을 한국어로 번역할 때는 전문 용어를 사용하세요."
                user_prompt = f"다음 식물 병충해 이름을 한국어로 번역해주세요. 번역된 이름만 답변하세요: {english_text}"
            
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                max_tokens=50
            )
            
            translated = response.choices[0].message.content.strip()
            logger.info(f"✅ 번역 완료: {english_text} -> {translated}")
            
            return translated
            
        except Exception as e:
            logger.error(f"❌ 번역 오류: {str(e)}")
            return english_text  # 오류 시 원문 반환
    
    def _build_prompt(
        self, 
        plant_species: str, 
        disease: str,
        confidence: float,
        user_notes: Optional[str]
    ) -> str:
        """방제법 요청을 위한 프롬프트를 구성합니다."""
        
        prompt = f"""
식물 병충해 진단 결과:
- 식물 종: {plant_species}
- 병충해/상태: {disease}
- AI 신뢰도: {confidence * 100:.1f}%
"""
        
        if user_notes and user_notes.strip():
            prompt += f"\n사용자 추가 정보:\n{user_notes}\n"
        
        prompt += """
위 진단 결과를 바탕으로 다음 내용을 포함한 실용적인 조언을 제공해주세요:

1. 병충해 개요 (2-3문장)
   - 이 병충해가 무엇인지 간단히 설명
   - 주요 증상 및 특징

2. 즉시 조치 방법 (긴급 대응)
   - 지금 당장 할 수 있는 응급 조치
   - 병 확산 방지 방법

3. 방제법 (단계별)
   - 화학적 방제 (필요시 농약명 포함)
   - 친환경 방제 (유기농 방법)
   - 물리적 방제 (제거, 격리 등)

4. 예방법
   - 재발 방지를 위한 장기 관리 방법
   - 환경 관리 (통풍, 습도, 물 주기 등)

5. 주의사항
   - 방제 시 주의할 점
   - 피해야 할 행동

답변은 실용적이고 구체적으로 작성하되, 전문 용어는 쉽게 풀어서 설명해주세요.
각 섹션은 이모지(📌, 🚨, 💊, 🛡️, ⚠️)를 활용하여 가독성을 높여주세요.
"""
        
        return prompt


# 싱글톤 인스턴스
_advisor_instance: Optional[PlantDiseaseAdvisor] = None


def get_advisor() -> PlantDiseaseAdvisor:
    """
    PlantDiseaseAdvisor 싱글톤 인스턴스를 반환합니다.
    """
    global _advisor_instance
    if _advisor_instance is None:
        _advisor_instance = PlantDiseaseAdvisor()
    return _advisor_instance

