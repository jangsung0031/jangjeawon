"""
Unified FastAPI main — merge of our main.py and teammate's app.py
- Single app instance
- Combined CORS
- Startup: detector preload (best-effort)
- Endpoints: root, /api/health, /api/detect, /api/cleanup
- Optional routers: health, plant (best-effort import)
"""

import os
import uuid
import shutil
import logging
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# --- Optional settings & dotenv ---
try:
    from dotenv import load_dotenv  # type: ignore
    load_dotenv()
except Exception:
    pass

# Settings (optional)
_api_host = os.getenv("API_HOST", "0.0.0.0")
_api_port = int(os.getenv("API_PORT", "8000"))
try:
    from app.config import settings  # optional
    _api_host = getattr(settings, "api_host", _api_host)
    _api_port = getattr(settings, "api_port", _api_port)
except Exception:
    pass

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("app.main")

# --- External services (best-effort import) ---
_detector_ok = False
try:
    from inference import get_detector  # teammate side
    _HAS_DETECTOR = True
except Exception as e:
    logger.warning("inference.get_detector import failed: %s", e)
    _HAS_DETECTOR = False

try:
    from llm_service import get_advisor  # teammate side
    _HAS_ADVISOR = True
except Exception as e:
    logger.warning("llm_service.get_advisor import failed: %s", e)
    _HAS_ADVISOR = False

# --- FastAPI app ---
app = FastAPI(
    title="새싹아이 API",
    description="반려식물 생애주기 관리 AI 서비스 (YOLOv8 감지 + LLM 조언 포함)",
    version="1.0.0",
)

# --- CORS: union (ours + teammate) ---
_allow_origins = [
    # ours
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "http://192.168.0.131:5173",
    "http://192.168.0.60:5173",
    # teammate
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://localhost:3000",
    # dev wildcard (remove in prod!)
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(dict.fromkeys(_allow_origins)),  # dedupe preserve order
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Optional routers from our side ---
try:
    from app.api import health, plant  # our modules
    app.include_router(health.router, tags=["Health"])
    app.include_router(plant.router, prefix="/api/plant", tags=["Plant"])
    logger.info("Included routers: health, plant")
except Exception as e:
    logger.warning("Optional routers not included (app.api.health/plant): %s", e)

# --- FS paths ---
UPLOAD_DIR = Path("uploads")
RESULTS_DIR = Path("results")
UPLOAD_DIR.mkdir(exist_ok=True)
RESULTS_DIR.mkdir(exist_ok=True)

# --- Startup: preload detector if available ---
@app.on_event("startup")
async def on_startup():
    global _detector_ok
    if _HAS_DETECTOR:
        try:
            logger.info("Preloading detector model...")
            det = get_detector()
            _detector_ok = getattr(det, "disease_model", None) is not None
            logger.info("Detector preload done (loaded=%s)", _detector_ok)
        except Exception as e:
            logger.error("Detector preload failed: %s", e)
            _detector_ok = False
    else:
        logger.info("Detector module not present; skipping preload")

# --- Root ---
@app.get("/")
async def root():
    return {
        "message": "새싹아이 API에 오신 것을 환영합니다!",
        "version": "1.0.0",
        "docs": "/docs",
    }

# --- Health (teammate-style) ---
@app.get("/api/health")
async def health_check():
    if not _HAS_DETECTOR:
        return {
            "status": "degraded",
            "models": {"disease_model_loaded": False},
            "note": "inference 모듈이 없어 최소 기능만 동작합니다.",
        }
    det = get_detector()
    return {
        "status": "healthy" if getattr(det, "disease_model", None) is not None else "degraded",
        "models": {"disease_model_loaded": getattr(det, "disease_model", None) is not None},
        "note": "단일 모델로 식물 종과 병충해를 함께 감지합니다.",
    }

# --- Detect (from teammate app.py) ---
@app.post("/api/detect")
async def detect_plant_disease(
    file: UploadFile = File(...),
    conf_threshold: Optional[float] = Form(0.01),
    user_notes: Optional[str] = Form(None),
):
    # 디버깅: user_notes 수신 확인
    logger.info(f"📝 /api/detect 호출 - user_notes: {repr(user_notes)[:100] if user_notes else 'None'}")
    
    allowed_extensions = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
    ext = Path(file.filename).suffix.lower()
    if ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"허용 형식: {', '.join(sorted(allowed_extensions))}")

    # save temp
    unique = f"{uuid.uuid4()}{ext}"
    upload_path = UPLOAD_DIR / unique

    try:
        with open(upload_path, "wb") as buf:
            shutil.copyfileobj(file.file, buf)

        if not _HAS_DETECTOR:
            raise HTTPException(status_code=503, detail="모델 모듈 없음(inference). 설치/배치 후 재시도하세요.")

        detector = get_detector()
        if getattr(detector, "disease_model", None) is None:
            raise HTTPException(status_code=503, detail="모델이 로드되지 않았습니다. models/plant_disease.pt 배치 필요.")

        results = detector.detect(
            str(upload_path),
            conf_threshold=conf_threshold,
            filter_by_confidence=True,
        )

        diagnosis_status = results.get("diagnosis_status", "no_detection")
        max_confidence = float(results.get("max_confidence", 0.0))

        resp = {
            "success": True,
            "diagnosis_status": diagnosis_status,
            "max_confidence": round(max_confidence, 4),
            "detection_count": results.get("detection_count", 0),
            "species": {
                "name": results.get("species") or "알 수 없음",
                "confidence": round(float(results.get("species_confidence", 0.0)), 4),
            },
            "diseases": [
                {
                    "name": d["name"],
                    "full_name": d.get("full_name", d["name"]),
                    "species": d.get("species", ""),
                    "confidence": round(float(d["confidence"]), 4),
                    "bbox": d.get("bbox"),
                }
                for d in results.get("diseases", [])
            ],
            "result_image": results.get("result_image"),
            "original_image": results.get("original_image"),
            "total_diseases_detected": len(results.get("diseases", [])),
        }

        # status message + LLM + 번역
        if diagnosis_status == "high_confidence" and resp["total_diseases_detected"] > 0:
            disease_info = results["diseases"][0]
            resp["status_message"] = "✅ 정확한 진단이 완료되었습니다."
            
            # LLM을 사용한 번역 및 방제법 제공
            if _HAS_ADVISOR:
                try:
                    advisor = get_advisor()
                    
                    # 식물 종 이름 한국어 번역
                    plant_species = disease_info.get("species", "")
                    plant_species_kr = advisor.translate_to_korean(plant_species, context="plant")
                    resp["species"]["name_kr"] = plant_species_kr
                    
                    # 병충해 이름 한국어 번역
                    disease_name = disease_info.get("name", "")
                    disease_name_kr = advisor.translate_to_korean(disease_name, context="disease")
                    resp["diseases"][0]["name_kr"] = disease_name_kr
                    
                    # 방제법 제공
                    treatment = advisor.get_treatment_advice(
                        plant_species=plant_species,
                        disease=disease_name,
                        confidence=disease_info.get("confidence"),
                        user_notes=user_notes,
                    )
                    resp["treatment_advice"] = treatment
                    resp["llm_enabled"] = True
                except Exception as e:
                    logger.error("LLM 호출 실패: %s", e)
                    resp["treatment_advice"] = None
                    resp["llm_enabled"] = False
            else:
                resp["treatment_advice"] = None
                resp["llm_enabled"] = False

        elif diagnosis_status == "medium_confidence" and resp["total_diseases_detected"] > 0:
            disease_info = results["diseases"][0]
            
            # LLM을 사용한 번역
            if _HAS_ADVISOR:
                try:
                    advisor = get_advisor()
                    plant_species = disease_info.get("species", "")
                    plant_species_kr = advisor.translate_to_korean(plant_species, context="plant")
                    resp["species"]["name_kr"] = plant_species_kr
                    
                    disease_name = disease_info.get("name", "")
                    disease_name_kr = advisor.translate_to_korean(disease_name, context="disease")
                    resp["diseases"][0]["name_kr"] = disease_name_kr
                    
                    resp["status_message"] = (
                        f"⚠️ 정확한 진단이 어렵습니다. "
                        f"{plant_species_kr}의 {disease_name_kr}일 가능성"
                        f"({max_confidence * 100:.1f}%)이 가장 높습니다. "
                        f"더 선명한 사진으로 다시 시도해 주세요."
                    )
                except Exception as e:
                    logger.error("LLM 번역 실패: %s", e)
                    resp["status_message"] = (
                        f"⚠️ 정확한 진단이 어렵습니다. "
                        f"{disease_info.get('species')}의 {disease_info.get('name')}일 가능성"
                        f"({max_confidence * 100:.1f}%)이 가장 높습니다. "
                        f"더 선명한 사진으로 다시 시도해 주세요."
                    )
            else:
                resp["status_message"] = (
                    f"⚠️ 정확한 진단이 어렵습니다. "
                    f"{disease_info.get('species')}의 {disease_info.get('name')}일 가능성"
                    f"({max_confidence * 100:.1f}%)이 가장 높습니다. "
                    f"더 선명한 사진으로 다시 시도해 주세요."
                )
            resp["treatment_advice"] = None
            resp["llm_enabled"] = False

        elif diagnosis_status == "low_confidence":
            # 저신뢰도일 때: YOLOv8 결과 무시, user_notes만 LLM에 전송
            resp["status_message"] = None  # 메시지 표시 안 함
            
            # user_notes가 있으면 무조건 LLM 호출
            if user_notes and user_notes.strip():
                if _HAS_ADVISOR:
                    try:
                        advisor = get_advisor()
                        treatment = advisor.get_user_notes_advice(user_notes)
                        resp["treatment_advice"] = treatment
                        resp["llm_enabled"] = True if treatment else False
                        logger.info(f"저신뢰도 LLM 호출 완료: user_notes 길이={len(user_notes)}, 결과={'있음' if treatment else '없음'}")
                    except Exception as e:
                        logger.error("LLM 호출 실패 (저신뢰도): %s", e)
                        resp["treatment_advice"] = None
                        resp["llm_enabled"] = False
                else:
                    logger.warning("저신뢰도: user_notes가 있지만 _HAS_ADVISOR=False")
                    resp["treatment_advice"] = None
                    resp["llm_enabled"] = False
            else:
                logger.info("저신뢰도: user_notes 없음")
                resp["treatment_advice"] = None
                resp["llm_enabled"] = False

        else:
            resp["status_message"] = (
                "❌ 식물 잎을 감지하지 못했습니다. 잎사귀가 선명하게 보이도록 다시 촬영해 주세요."
            )
            resp["treatment_advice"] = None
            resp["llm_enabled"] = False

        logger.info(
            "detect: status=%s species=%s conf=%.2f diseases=%d",
            diagnosis_status, results.get("species"), max_confidence, len(results.get("diseases", []))
        )
        return JSONResponse(content=resp)

    except HTTPException:
        raise
    except Exception as e:
        logger.error("detect error: %s", e)
        raise HTTPException(status_code=500, detail=f"서버 오류: {e}")
    finally:
        try:
            if upload_path.exists():
                upload_path.unlink()
        except Exception as e:
            logger.warning("임시 파일 삭제 실패: %s", e)

# --- Cleanup (from teammate) ---
@app.delete("/api/cleanup")
async def cleanup_files():
    deleted_uploads = 0
    deleted_results = 0
    try:
        for p in UPLOAD_DIR.glob("*"):
            if p.is_file():
                p.unlink()
                deleted_uploads += 1
        for p in RESULTS_DIR.glob("*"):
            if p.is_file():
                p.unlink()
                deleted_results += 1
        return {"success": True, "deleted": {"uploads": deleted_uploads, "results": deleted_results}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"정리 중 오류: {e}")

# --- Entrypoint ---
if __name__ == "__main__":
    import uvicorn
    print("=" * 60)
    print("Unified 새싹아이 API Server")
    print("=" * 60)
    print(f"Server: http://{_api_host}:{_api_port}")
    print(f"API Docs: http://{_api_host}:{_api_port}/docs")
    print("=" * 60)
    uvicorn.run("app.main:app", host=_api_host, port=_api_port, reload=True, log_level="info")
