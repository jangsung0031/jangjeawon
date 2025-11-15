import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { writeReview } from "./api/reviewApi";
import "../css/ReviewForm.css";
import axios from "axios";

export default function ReviewForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const category = searchParams.get("category");
  const targetId = searchParams.get("targetId");

  const [form, setForm] = useState({ rating: 0, content: "" });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!category || !targetId) return;
      console.log("[ReviewForm] category, targetId = ", category, targetId);

      try {
        if (category === "room") {
          const token = sessionStorage.getItem("token");
          const rv = await axios.get(
            `http://localhost/api/roomreservations/${targetId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log("[예약 조회 응답]", rv.data);

          setProduct({
            name: rv.data?.roomName || "정보 없음",
            imageUrl: rv.data?.roomImageUrl || "/img/room1.jpg",
          });
        } else if (category === "activity" || category === "water") {
          const wr = await axios.get(
            `http://localhost/api/reservation/water-reservation/${targetId}`
          );
          console.log("[수상레저 예약 조회 응답]", wr.data);
          setProduct({
            ticketType: wr.data?.ticketType || "수상레저",
            imageUrl: "/img/test7.jpg",
          });
        }
      } catch (err) {
        console.error("[상품 정보 불러오기 실패]", err);
        if (category === "room")
          setProduct({ name: "정보 없음", imageUrl: "/img/room1.jpg" });
        else
          setProduct({ ticketType: "수상레저", imageUrl: "/img/test7.jpg" });
      }
    };

    fetchProduct();
  }, [category, targetId]);

  const handleRatingClick = (value) =>
    setForm((f) => ({ ...f, rating: value }));
  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.rating) return alert("별점을 선택해주세요.");
    if (form.content.trim().length < 10)
      return alert("후기는 10자 이상 작성해주세요.");

    const reviewDto = {
      category,
      targetId: parseInt(targetId, 10),
      rating: form.rating,
      content: form.content,
    };

    const fd = new FormData();
    fd.append(
      "review",
      new Blob([JSON.stringify(reviewDto)], { type: "application/json" })
    );
    if (imageFile) fd.append("imageFile", imageFile);

    try {
      await writeReview(fd);
      alert("리뷰가 작성되었습니다.");
      navigate("/my-reviews");
    } catch (err) {
      console.error("[리뷰 작성 실패]", err?.response?.data || err.message);
      alert("리뷰 작성 실패");
    }
  };

  const imageSrc =
    category === "room"
      ? product?.imageUrl || "/img/room1.jpg"
      : product?.imageUrl || "/img/test7.jpg";

  return (
    <div className="review-form-container">
      <h2>리뷰 작성</h2>
      <div className="reservation-summary">
        <img
          src={imageSrc}
          alt="상품 이미지"
          onError={(e) => (e.currentTarget.src = "/img/room1.jpg")}
        />
        <div>
          <p>
            <strong>카테고리:</strong>{" "}
            {category === "room" ? "객실" : "수상레저"}
          </p>
          <p>
            <strong>이름:</strong>{" "}
            {category === "room"
              ? product?.name || "정보 없음"
              : product?.ticketType || "정보 없음"}
          </p>
        </div>
      </div>
      <div className="rating-section">
        <p>이 상품의 만족도는 어떠셨나요?</p>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onClick={() => handleRatingClick(star)}
            style={{
              cursor: "pointer",
              fontSize: 24,
              color: star <= form.rating ? "#FFD700" : "#ccc",
            }}
          >
            {star <= form.rating ? "⭐" : "☆"}
          </span>
        ))}
      </div>
      <div className="radio-section">
        <p>직접 이용해보신 후 느낌은?</p>
        <label>
          <input
            type="radio"
            name="impression"
            onChange={() =>
              setForm((f) => ({ ...f, content: "만족했어요" }))
            }
          />{" "}
          만족했어요
        </label>
        <br />
        <label>
          <input
            type="radio"
            name="impression"
            onChange={() =>
              setForm((f) => ({ ...f, content: "보통이에요" }))
            }
          />{" "}
          보통이에요
        </label>
        <br />
        <label>
          <input
            type="radio"
            name="impression"
            onChange={() =>
              setForm((f) => ({ ...f, content: "아쉬웠어요" }))
            }
          />{" "}
          아쉬웠어요
        </label>
      </div>

      <label>
        후기 내용
        <textarea
          name="content"
          value={form.content}
          onChange={handleChange}
          rows={5}
          required
          placeholder="10자 이상 작성해주세요."
        />
      </label>

      <label htmlFor="imageUpload" className="image-upload-label">
        이미지 업로드
      </label>
      <input
        id="imageUpload"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />
      {preview && (
        <img src={preview} alt="미리보기" className="review-preview-image" />
      )}

      <button
        type="submit"
        className="submit-review-btn"
        onClick={handleSubmit}
      >
        리뷰 작성 완료
      </button>
    </div>
  );
}
