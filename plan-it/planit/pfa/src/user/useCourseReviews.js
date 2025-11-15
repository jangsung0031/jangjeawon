import { useEffect, useState, useCallback } from "react";
import api from "../module/apiClient";

export default function useCourseReviews(courseId) {
  const [summary, setSummary] = useState({ averageRating: 0, reviewCount: 0 });
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [reviews, setReviews] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadSummary = useCallback(async () => {
    const { data } = await api.get(`/api/course/${courseId}/reviews/summary`);
    setSummary(data);
  }, [courseId]);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/course/${courseId}/reviews`, { params: { page, size } });
      setReviews(data.content);
      setTotalPages(data.totalPages);
    } finally {
      setLoading(false);
    }
  }, [courseId, page, size]);

  useEffect(() => { loadSummary(); }, [loadSummary]);
  useEffect(() => { loadReviews(); }, [loadReviews]);

  const create = async ({ rating, content }) => {
    await api.post(`/api/course/${courseId}/reviews`, { rating, content });
    await Promise.all([loadSummary(), loadReviews()]);
  };

  const update = async (reviewId, { rating, content }) => {
    await api.patch(`/api/course/${courseId}/reviews/${reviewId}`, { rating, content });
    await Promise.all([loadSummary(), loadReviews()]);
  };

  const remove = async (reviewId) => {
    await api.delete(`/api/course/${courseId}/reviews/${reviewId}`);
    await Promise.all([loadSummary(), loadReviews()]);
  };

  return { summary, reviews, page, setPage, totalPages, loading, create, update, remove };
}
