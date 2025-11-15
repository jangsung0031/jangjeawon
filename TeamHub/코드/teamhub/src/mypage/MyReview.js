import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyReviewsLegacy, deleteReview } from "./api/reviewApi";
import "../css/MyReview.css";

export default function MyReview() {
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedReview, setSelectedReview] = useState(null);
  const navigate = useNavigate();

  const loadReviews = () => {
    fetchMyReviewsLegacy(page, 6)
      .then((res) => {
        setReviews(res.data.content);
        setTotalPages(res.data.totalPages);
      })
      .catch((err) => console.error("내 리뷰 불러오기 실패", err));
  };

  useEffect(() => {
    loadReviews();
  }, [page]);

  const openModal = (review) => setSelectedReview(review);
  const closeModal = () => setSelectedReview(null);
  const handleEdit = (reviewId) => navigate(`/edit-review/${reviewId}`);

  const handleDelete = (reviewId) => {
    if (window.confirm("정말 이 리뷰를 삭제하시겠습니까?")) {
      deleteReview(reviewId)
        .then(() => {
          alert("리뷰가 삭제되었습니다.");
          loadReviews();
          if (selectedReview?.id === reviewId) closeModal();
        })
        .catch((err) => {
          console.error("리뷰 삭제 실패", err);
          alert("리뷰 삭제에 실패했습니다.");
        });
    }
  };

  return (
    <div className="my-review-container">
      <h2>내 리뷰</h2>

      {reviews.length === 0 ? (
        <p>작성한 리뷰가 없습니다.</p>
      ) : (
        <div className="my-review-grid">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="my-review-card"
              onClick={() => openModal(review)}
            >
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
                    <strong>{review.username}</strong>
                    <span>
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </span>
                  </div>
                  <div className="my-review-content">{review.content}</div>
                  <div className="my-review-date">
                    작성일: {review.createdAt?.slice(0, 10)}
                  </div>
                  <div className="my-review-btn-group">
                    <button
                      className="edit-review-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(review.id);
                      }}
                    >
                      수정하기
                    </button>
                    <button
                      className="delete-review-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(review.id);
                      }}
                    >
                      삭제하기
                    </button>
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
            <h3 className="review-modal-title">{selectedReview.username}님의 리뷰</h3>
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
