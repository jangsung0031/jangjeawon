import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { updateReview, fetchMyReviews } from "./api/reviewApi";
import "../css/EditReview.css";

export default function EditReview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    rating: 0,
    content: "",
    quickComment: "",
    imageName: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [category, setCategory] = useState("");
  const [targetId, setTargetId] = useState(null);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetchMyReviews()
      .then((res) => {
        const target = res.data.find((r) => r.id === parseInt(id, 10));
        if (!target) {
          alert("리뷰 정보를 찾을 수 없습니다.");
          navigate("/my-reviews");
          return;
        }

        setForm({
          rating: target.rating,
          content: target.content,
          quickComment: target.quickComment || "",
          imageName: target.imageName || "",
        });

        if (target.imageName) {
          setPreviewImage(`http://localhost/uploads/${target.imageName}`);
        } else {
          setPreviewImage(null);
        }
        setCategory(target.category);
        setTargetId(target.targetId);

        const loadProduct = async () => {
          try {
            if (target.category === "room") {
              const token = sessionStorage.getItem("token");
              const rv = await fetch(`http://localhost/api/roomreservations/${target.targetId}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
              });
              const data = await rv.json();
              setProduct({
                name: data?.roomName || "정보 없음",
                imageUrl: data?.roomImageUrl || "/img/room1.jpg",
              });
            } else if (target.category === "activity" || target.category === "water") {
              const wr = await fetch(
                `http://localhost/api/reservation/water-reservation/${target.targetId}`
              );
              const data = await wr.json().catch(() => ({}));
              setProduct({
                ticketType: data?.ticketType || "수상레저",
                imageUrl: "/img/test7.jpg",
              });
            }
          } catch (e) {
            console.error("[상품 정보 불러오기 실패]", e);
            if (target.category === "room")
              setProduct({ name: "정보 없음", imageUrl: "/img/room1.jpg" });
            else setProduct({ ticketType: "수상레저", imageUrl: "/img/test7.jpg" });
          }
        };

        loadProduct();
      })
      .catch((err) => {
        console.error("리뷰 불러오기 실패", err);
        alert("리뷰 정보를 불러오지 못했습니다.");
      });
  }, [id, navigate]);

  const handleRatingClick = (val) => setForm((f) => ({ ...f, rating: val }));
  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(form.imageName ? `http://localhost/uploads/${form.imageName}` : null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.rating) return alert("별점을 선택해주세요.");
    if (form.content.trim().length < 10) return alert("후기는 10자 이상 작성해주세요.");

    const reviewPayload = {
      rating: form.rating,
      content: form.content,
      quickComment: form.quickComment,
      imageName: form.imageName || "",
    };

    const fd = new FormData();
    fd.append("review", new Blob([JSON.stringify(reviewPayload)], { type: "application/json" }));
    if (selectedFile) fd.append("imageFile", selectedFile);

    try {
      await updateReview(id, fd);
      alert("리뷰가 수정되었습니다.");
      navigate("/my-reviews");
    } catch (err) {
      console.error(err);
      alert("리뷰 수정 실패");
    }
  };

  const productImageSrc =
    category === "room"
      ? product?.imageUrl || "/img/room1.jpg"
      : product?.imageUrl || "/img/test7.jpg";

  return (
    <div className="review-form-container">
      <h2>리뷰 수정</h2>
      {product && (
        <div className="reservation-summary">
          <img
            src={productImageSrc}
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
      )}
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
        {["만족했어요", "보통이에요", "아쉬웠어요"].map((txt) => (
          <label key={txt}>
            <input
              type="radio"
              name="quickComment"
              value={txt}
              checked={form.quickComment === txt}
              onChange={handleChange}
            />{" "}
            {txt}
          </label>
        ))}
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
        style={{ display: "none" }}
      />
      {previewImage && (
        <img src={previewImage} alt="미리보기" className="review-preview-image" />
      )}

      <button type="submit" className="submit-review-btn" onClick={handleSubmit}>
        리뷰 수정 완료
      </button>
    </div>
  );
}
