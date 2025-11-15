// src/user/EditProfile.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/EditProfile.css";
import { IoArrowBack } from "react-icons/io5";
import {
    MdOutlineCamera,
    MdOutlineVisibility,
    MdOutlineVisibilityOff,
} from "react-icons/md";
import { AiOutlineCheck, AiOutlineLoading3Quarters } from "react-icons/ai";
import { api } from "../api/axios"; // ✅ named import

const FormField = ({ label, children, error, success }) => (
    <div className="form-field">
        <label className="field-label">{label}</label>
        <div className="field-content">{children}</div>
        {error && <div className="field-error">{error}</div>}
        {success && <div className="field-success">{success}</div>}
    </div>
);

const InputField = ({
    type = "text",
    placeholder,
    value,
    onChange,
    error,
    ...props
}) => (
    <input
        type={type}
        className={`form-input ${error ? "error" : ""}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...props}
    />
);

const Button = ({ variant = "primary", size = "medium", loading, children, ...props }) => (
    <button
        className={`btn btn-${variant} btn-${size} ${loading ? "loading" : ""}`}
        disabled={loading}
        {...props}
    >
        {loading ? <AiOutlineLoading3Quarters className="btn-spinner" /> : children}
    </button>
);

export default function EditProfile() {
    const navigate = useNavigate();

    // 폼 데이터
    const [formData, setFormData] = useState({
        phone: "",
        currentPassword: "", // (선택) 서버에서 검증 사용 시 전달
        newPassword: "",
        confirmPassword: "",
        nickname: "",
        email: "",
        profileUrl: "", // 이미지 URL
        profileImageFile: null, // 선택한 이미지 파일 (저장 시 자동 업로드)
    });

    // 서버에서 가져온 원본 닉/이메일
    const [original, setOriginal] = useState({
        nickname: "",
        email: "",
    });

    // 검증 & 상태
    const [validation, setValidation] = useState({
        nicknameChecking: false,
        nicknameAvailable: null, // true/false/null
        emailVerifying: false,
        emailVerified: false,
        verificationCode: "",
        codeSent: false,
    });

    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const [errors, setErrors] = useState({});
    const [loadingInit, setLoadingInit] = useState(true);
    const [saving, setSaving] = useState(false);

    // 초기값 로드: GET /api/users/me
    useEffect(() => {
        const loadMe = async () => {
            try {
                const { data } = await api.get("/api/users/me");
                setFormData((prev) => ({
                    ...prev,
                    phone: data.phone || "",
                    nickname: data.nickname || "",
                    email: data.email || "",
                    profileUrl: data.profileUrl || "",
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                }));
                setOriginal({
                    nickname: data.nickname || "",
                    email: data.email || "",
                });
            } catch (e) {
                alert("로그인이 필요합니다.");
                navigate("/login", { state: { from: "/editprofile" }, replace: true });
            } finally {
                setLoadingInit(false);
            }
        };
        loadMe();
    }, [navigate]);

    const handleInputChange = (field) => (e) => {
        setFormData((prev) => ({
            ...prev,
            [field]: e.target.value,
        }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
        if (field === "nickname") {
            setValidation((prev) => ({ ...prev, nicknameAvailable: null }));
        }
    };

    // 프로필 이미지 파일(미리보기 + 용량 사전 체크)
    const handleImageFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // ✅ 프론트에서 용량 제한 (백엔드보다 약간 낮게)
        const MAX_MB = 10;
        if (file.size > MAX_MB * 1024 * 1024) {
            alert(`파일이 ${MAX_MB}MB를 초과합니다. 이미지를 줄여서 올려주세요.`);
            return;
        }

        // (선택) 이미지 타입만 허용
        if (!file.type.startsWith("image/")) {
            alert("이미지 파일만 업로드할 수 있어요.");
            return;
        }

        setFormData((prev) => ({ ...prev, profileImageFile: file }));
    };

    const togglePasswordVisibility = (field) => {
        setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    // 닉네임 중복확인: GET /api/auth/check-nickname?nickname=...
    const checkNicknameDuplicate = async () => {
        const nick = formData.nickname.trim();
        if (!nick) {
            setErrors((prev) => ({ ...prev, nickname: "닉네임을 입력하세요." }));
            return;
        }
        if (nick === original.nickname) {
            setValidation((prev) => ({ ...prev, nicknameAvailable: true }));
            return;
        }
        try {
            setValidation((prev) => ({ ...prev, nicknameChecking: true }));
            const { data } = await api.get("/api/auth/check-nickname", {
                params: { nickname: nick },
            });
            setValidation((prev) => ({
                ...prev,
                nicknameChecking: false,
                nicknameAvailable: !data.duplicate,
            }));
            if (data.duplicate) {
                setErrors((prev) => ({ ...prev, nickname: "이미 사용중인 닉네임입니다." }));
            }
        } catch (e) {
            setValidation((prev) => ({ ...prev, nicknameChecking: false }));
            alert("닉네임 확인 중 오류가 발생했습니다.");
        }
    };

    // 이메일 인증: POST /api/auth/send-email-code
    const sendVerificationCode = async () => {
        const email = formData.email.trim();
        if (!email) {
            setErrors((prev) => ({ ...prev, email: "이메일을 입력하세요." }));
            return;
        }
        try {
            setValidation((prev) => ({ ...prev, emailVerifying: true }));
            await api.post("/api/auth/send-email-code", { email });
            setValidation((prev) => ({
                ...prev,
                emailVerifying: false,
                codeSent: true,
            }));
            alert("인증코드를 전송했습니다. 메일함을 확인하세요.");
        } catch (e) {
            setValidation((prev) => ({ ...prev, emailVerifying: false }));
            alert("인증코드 전송 중 오류가 발생했습니다.");
        }
    };

    // 인증코드 검증: POST /api/auth/verify-email-code
    const verifyCode = async () => {
        const code = validation.verificationCode.trim();
        if (!code) {
            setErrors((prev) => ({ ...prev, verificationCode: "인증번호를 입력하세요." }));
            return;
        }
        try {
            setValidation((prev) => ({ ...prev, emailVerifying: true }));
            const { data } = await api.post("/api/auth/verify-email-code", {
                email: formData.email.trim(),
                code,
            });
            const ok = data?.verified !== false; // 200이면 성공으로 간주
            setValidation((prev) => ({
                ...prev,
                emailVerifying: false,
                emailVerified: ok,
            }));
            if (!ok) {
                setErrors((prev) => ({
                    ...prev,
                    verificationCode: "인증번호가 일치하지 않습니다.",
                }));
            } else {
                alert("이메일 인증이 완료되었습니다.");
            }
        } catch (e) {
            setValidation((prev) => ({ ...prev, emailVerifying: false }));
            setErrors((prev) => ({
                ...prev,
                verificationCode: "인증번호 확인 중 오류가 발생했습니다.",
            }));
        }
    };

    // 클라이언트 검증
    const validateForm = () => {
        const next = {};
        if (!formData.nickname.trim()) next.nickname = "닉네임을 입력하세요.";
        if (!formData.email.trim()) next.email = "이메일을 입력하세요.";
        if (!formData.phone.trim()) next.phone = "전화번호를 입력하세요.";
        if (formData.newPassword || formData.confirmPassword) {
            if ((formData.newPassword || "").length < 6)
                next.newPassword = "비밀번호는 6자 이상이어야 합니다.";
            if (formData.newPassword !== formData.confirmPassword)
                next.confirmPassword = "비밀번호가 일치하지 않습니다.";
        }
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    // 저장: (파일 있으면 업로드 → url 반영) → PUT /api/users/me
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        if (validation.nicknameAvailable === false) {
            setErrors((prev) => ({ ...prev, nickname: "이미 사용중인 닉네임입니다." }));
            return;
        }

        try {
            setSaving(true);

            let profileUrl = formData.profileUrl?.trim() || "";

            // 1) 파일이 선택되어 있으면 먼저 업로드
            if (formData.profileImageFile) {
                const fd = new FormData();
                fd.append("file", formData.profileImageFile);

                // ✅ Content-Type 헤더를 수동 설정하지 말 것 (브라우저가 자동 세팅)
                const { data: up } = await api.post("/api/files/upload", fd);

                if (up?.url) {
                    profileUrl = up.url; // 예: "/uploads/20251002123456789.png"
                }
            }

            // 2) 프로필 저장
            const payload = {
                nickname: formData.nickname.trim(),
                phone: formData.phone.trim(),
                email: formData.email.trim(),
                profileUrl,
            };
            if (formData.newPassword?.trim()) {
                payload.newPassword = formData.newPassword.trim();
            }
            // (선택) currentPassword를 서버가 받도록 구현한 경우 아래 주석 해제
            // if (formData.currentPassword?.trim()) {
            //   payload.currentPassword = formData.currentPassword.trim();
            // }

            await api.put("/api/users/me", payload);

            alert("정보가 저장되었습니다.");
            navigate("/mypage");
        } catch (err) {
            // ✅ 413 별도 안내
            if (err?.response?.status === 413) {
                alert("파일이 서버 허용 용량을 초과했어요. 이미지를 줄여서 다시 업로드해 주세요.");
            } else {
                alert("저장 실패: " + (err.response?.data?.message || err.response?.data || err.message));
            }
        } finally {
            setSaving(false);
        }
    };

    if (loadingInit) {
        return (
            <main className="edit-profile-wrap">
                <div className="loading-pane">불러오는 중...</div>
            </main>
        );
    }

    return (
        <main className="edit-profile-wrap">
            <header className="edit-header">
                <button
                    className="back-btn"
                    type="button"
                    onClick={() => navigate(-1)}
                    aria-label="뒤로가기"
                    title="뒤로가기"
                >
                    <IoArrowBack />
                </button>
                <div className="header-texts">

                    <h1>정보 수정</h1>
                </div>
            </header>

            <form className="edit-form" onSubmit={handleSubmit}>
                {/* 프로필 이미지 */}
                <section className="form-section">
                    <h2 className="section-title">프로필 이미지</h2>
                    <div className="profile-upload">
                        <div className="upload-preview">
                            {formData.profileImageFile ? (
                                <img
                                    src={URL.createObjectURL(formData.profileImageFile)}
                                    alt="프로필 미리보기"
                                />
                            ) : formData.profileUrl ? (
                                <img src={formData.profileUrl} alt="프로필 미리보기" />
                            ) : (
                                <div className="upload-placeholder">👤</div>
                            )}
                            <label className="upload-btn">
                                <MdOutlineCamera />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageFileChange}
                                    hidden
                                />
                            </label>
                        </div>



                    </div>
                </section>

                {/* 기본 정보 */}
                <section className="form-section">
                    <h2 className="section-title">기본 정보</h2>

                    <FormField label="전화번호" error={errors.phone}>
                        <InputField
                            type="tel"
                            placeholder="010-0000-0000"
                            value={formData.phone}
                            onChange={handleInputChange("phone")}
                            error={errors.phone}
                        />
                    </FormField>

                    <FormField
                        label="닉네임"
                        error={errors.nickname}
                        success={
                            validation.nicknameAvailable
                                ? "사용 가능한 닉네임입니다."
                                : ""
                        }
                    >
                        <div className="field-with-button">
                            <InputField
                                placeholder="닉네임을 입력하세요"
                                value={formData.nickname}
                                onChange={handleInputChange("nickname")}
                                error={errors.nickname || validation.nicknameAvailable === false}
                            />
                            <Button
                                variant="secondary"
                                size="small"
                                loading={validation.nicknameChecking}
                                onClick={checkNicknameDuplicate}
                                type="button"
                            >
                                중복확인
                            </Button>
                        </div>
                        {validation.nicknameAvailable === false && (
                            <div className="field-error">이미 사용중인 닉네임입니다.</div>
                        )}
                    </FormField>
                </section>

                {/* 이메일 */}
                <section className="form-section">
                    <h2 className="section-title">이메일</h2>

                    <FormField
                        label="이메일 주소"
                        error={errors.email}
                        success={
                            validation.emailVerified ? "이메일 인증이 완료되었습니다." : ""
                        }
                    >
                        <div className="field-with-button">
                            <InputField
                                type="email"
                                placeholder="example@email.com"
                                value={formData.email}
                                onChange={handleInputChange("email")}
                                error={errors.email}
                            />
                            <Button
                                variant="secondary"
                                size="small"
                                loading={validation.emailVerifying}
                                onClick={sendVerificationCode}
                                type="button"
                                disabled={validation.emailVerified}
                            >
                                {validation.codeSent ? "재발송" : "인증코드 발송"}
                            </Button>
                        </div>
                    </FormField>

                    {validation.codeSent && !validation.emailVerified && (
                        <FormField label="인증번호" error={errors.verificationCode}>
                            <div className="field-with-button">
                                <InputField
                                    placeholder="인증번호 6자리"
                                    value={validation.verificationCode}
                                    onChange={(e) =>
                                        setValidation((prev) => ({
                                            ...prev,
                                            verificationCode: e.target.value,
                                        }))
                                    }
                                    error={errors.verificationCode}
                                    maxLength={6}
                                />
                                <Button
                                    variant="secondary"
                                    size="small"
                                    loading={validation.emailVerifying}
                                    onClick={verifyCode}
                                    type="button"
                                >
                                    확인
                                </Button>
                            </div>
                        </FormField>
                    )}
                </section>

                {/* 비밀번호 */}
                <section className="form-section">
                    <h2 className="section-title">비밀번호 변경</h2>

                    <FormField label="현재 비밀번호" error={errors.currentPassword}>
                        <div className="password-field">
                            <InputField
                                type={showPassword.current ? "text" : "password"}
                                placeholder="현재 비밀번호"
                                value={formData.currentPassword}
                                onChange={handleInputChange("currentPassword")}
                                error={errors.currentPassword}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => togglePasswordVisibility("current")}
                            >
                                {showPassword.current ? (
                                    <MdOutlineVisibilityOff />
                                ) : (
                                    <MdOutlineVisibility />
                                )}
                            </button>
                        </div>
                    </FormField>

                    <FormField label="새 비밀번호" error={errors.newPassword}>
                        <div className="password-field">
                            <InputField
                                type={showPassword.new ? "text" : "password"}
                                placeholder="새 비밀번호"
                                value={formData.newPassword}
                                onChange={handleInputChange("newPassword")}
                                error={errors.newPassword}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => togglePasswordVisibility("new")}
                            >
                                {showPassword.new ? (
                                    <MdOutlineVisibilityOff />
                                ) : (
                                    <MdOutlineVisibility />
                                )}
                            </button>
                        </div>
                    </FormField>

                    <FormField label="새 비밀번호 확인" error={errors.confirmPassword}>
                        <div className="password-field">
                            <InputField
                                type={showPassword.confirm ? "text" : "password"}
                                placeholder="새 비밀번호 확인"
                                value={formData.confirmPassword}
                                onChange={handleInputChange("confirmPassword")}
                                error={errors.confirmPassword}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => togglePasswordVisibility("confirm")}
                            >
                                {showPassword.confirm ? (
                                    <MdOutlineVisibilityOff />
                                ) : (
                                    <MdOutlineVisibility />
                                )}
                            </button>
                        </div>
                    </FormField>
                </section>

                {/* 저장/취소 */}
                <div className="form-actions">
                    <Button
                        variant="secondary"
                        type="button"
                        onClick={() => navigate("/mypage")}
                    >
                        취소
                    </Button>
                    <Button variant="primary" type="submit" loading={saving}>
                        <AiOutlineCheck />
                        저장하기
                    </Button>
                </div>
            </form>
        </main>
    );
}
