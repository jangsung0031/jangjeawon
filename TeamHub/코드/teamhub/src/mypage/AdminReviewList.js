import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  fetchAllReviewsPaged,
  postAdminReply,
  deleteReviewByAdmin,
} from "./api/adminReviewApi";
import "../css/AdminReviewList.css";

export default function AdminReviewList() {
  const [searchParams] = useSearchParams();
  const defaultCategory = searchParams.get("category") || "all";
  const targetId = searchParams.get("targetId");

  const [category, setCategory] = useState(defaultCategory);
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [replyText, setReplyText] = useState("");
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
      const res = await fetchAllReviewsPaged(pageValue, 6, categoryValue, targetId);
      setReviews(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("리뷰 목록 조회 실패:", err);
      alert("리뷰 목록을 불러오는 데 실패했습니다.");
    }
  };

  const handleCategoryChange = (e) => setCategory(e.target.value);
  const openModal = (review) => setSelectedReview(review);
  const closeModal = () => setSelectedReview(null);

  const handleReplySubmit = async (id) => {
    try {
      await postAdminReply(id, replyText);
      alert("답글이 등록되었습니다.");
      setEditingReplyId(null);
      setReplyText("");
      fetchReviews(category, page);
    } catch (err) {
      alert("답글 등록 실패");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteReviewByAdmin(id);
      alert("삭제되었습니다.");
      fetchReviews(category, page);
    } catch (err) {
      alert("삭제 실패");
    }
  };

  return (
    <div className="admin-review-container">
      <h2>후기 관리</h2>

      <div className="review-filter">
        <select className="review-select" onChange={handleCategoryChange} value={category}>
          <option value="all">전체</option>
          <option value="room">숙소</option>
          <option value="activity">수상레저</option>
        </select>
      </div>

      {reviews.length === 0 ? (
        <p>등록된 리뷰가 없습니다.</p>
      ) : (
        <div className="review-list">
          {reviews.map((review) => (
            <div key={review.id} className="admin-review-card" onClick={() => openModal(review)}>
              <div className="admin-review-box">
                {review.imageName && (
                  <div className="admin-review-img-box">
                    <img
                      src={`http://localhost/uploads/${review.imageName}`}
                      alt="리뷰 이미지"
                    />
                  </div>
                )}

                <div className="admin-review-right">
                  <div className="admin-review-header">
                    <strong>{maskName(review.username)}</strong>
                    <span>
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </span>
                  </div>
                  <div className="admin-review-content">{review.content}</div>
                  <div className="admin-review-date">
                    작성일: {review.createdAt?.slice(0, 10)}
                  </div>

                  <div className="admin-review-actions">
                    {editingReplyId === review.id ? (
                      <>
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          rows={3}
                          placeholder="답글을 입력하세요"
                        />
                        <div className="admin-action-buttons">
                          <button onClick={(e) => { e.stopPropagation(); handleReplySubmit(review.id); }}>저장</button>
                          <button onClick={(e) => { e.stopPropagation(); setEditingReplyId(null); }}>취소</button>
                        </div>
                      </>
                    ) : (
                      <div className="admin-action-buttons">
                        <button onClick={(e) => { e.stopPropagation(); setEditingReplyId(review.id); setReplyText(review.reply || ""); }}>
                          {review.reply ? "답글 수정" : "답글 작성"}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(review.id); }}>
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="review-pagination">
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
            <div className="review-modal-reply">
              <strong>관리자 답글:</strong> {selectedReview.reply || "작성된 답글이 없습니다."}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
