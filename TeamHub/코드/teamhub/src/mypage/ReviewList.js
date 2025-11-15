import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import "../css/ReviewList.css";

export default function ReviewList() {
  const [searchParams] = useSearchParams();
  const defaultCategory = searchParams.get("category") || "all";
  const targetId = searchParams.get("targetId");

  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [category, setCategory] = useState(defaultCategory);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const maskName = (name) => {
    if (!name || name.length === 0) return "";
    return name[0] + "**";
  };

  useEffect(() => {
    setPage(0);
  }, [category, targetId]);

  useEffect(() => {
    fetchReviews(category, page);
  }, [category, targetId, page]);

  const fetchReviews = async (categoryValue, pageValue = 0) => {
    try {
      const params = { page: pageValue, size: 6 };
      if (categoryValue !== "all") params.category = categoryValue;
      if (targetId) params.targetId = targetId;

      const response = await axios.get("http://localhost/api/reviews/paged", {
        params,
      });
      setReviews(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("리뷰 목록 조회 실패", error);
    }
  };

  const handleCategoryChange = (e) => setCategory(e.target.value);
  const openModal = (review) => setSelectedReview(review);
  const closeModal = () => setSelectedReview(null);

  return (
    <div className="review-list-container">
      <h2>전체 리뷰</h2>

      <div className="review-filter">
        <select className="review-select" onChange={handleCategoryChange} value={category}>
          <option value="all">전체</option>
          <option value="room">숙소</option>
          <option value="activity">수상레저</option>
        </select>
      </div>

      {reviews.length === 0 ? (
        <p>아직 등록된 리뷰가 없습니다.</p>
      ) : (
        <div className="review-list">
          {reviews.map((review) => (
            <div key={review.id} className="my-review-card" onClick={() => openModal(review)}>
              <div className="my-review-box">
                {review.imageName && (
                  <div className="my-review-img-box">
                    <img
                      src={`http://localhost/uploads/${review.imageName}`}
                      alt="리뷰 이미지"
                    />
                  </div>
                )}

                <div className="my-review-right">
                  <div className="my-review-header">
                    <strong>{maskName(review.username)}</strong>
                    <span>
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </span>
                  </div>
                  <div className="my-review-content">{review.content}</div>
                  <div className="my-review-date">
                    작성일: {review.createdAt?.slice(0, 10)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="my-review-pagination">
          <button onClick={() => setPage((p) => Math.max(p - 1, 0))} disabled={page === 0}>
            ◀ 이전
          </button>
          <span>{page + 1} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
            disabled={page === totalPages - 1}
          >
            다음 ▶
          </button>
        </div>
      )}

      {selectedReview && (
        <div className="review-modal-overlay" onClick={closeModal}>
          <div className="review-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="review-modal-close-btn" onClick={closeModal}>×</button>
            <h3 className="review-modal-title">{maskName(selectedReview.username)}님의 리뷰</h3>
            <div className="review-modal-rating">
              {"★".repeat(selectedReview.rating)}
              {"☆".repeat(5 - selectedReview.rating)}
            </div>
            <div className="review-modal-text">{selectedReview.content}</div>
            {selectedReview.imageName && (
              <img
                src={`http://localhost/uploads/${selectedReview.imageName}`}
                alt="리뷰 이미지"
                className="review-modal-image"
              />
            )}
            <div className="review-modal-date">
              작성일: {selectedReview.createdAt?.slice(0, 10)}
            </div>
            {selectedReview.reply && (
              <div className="review-modal-reply">
                <strong>관리자 답글:</strong> {selectedReview.reply}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
