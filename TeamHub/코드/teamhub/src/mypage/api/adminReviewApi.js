import axios from 'axios';

const authHeader = () => {
  const token = sessionStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchAllReviews = (params = {}) => {
  return axios.get("http://localhost/api/admin/reviews", {
    headers: authHeader(),
    params,
    withCredentials: true,
  });
};

export const fetchAllReviewsPaged = (page = 0, size = 6, category = "all", targetId = null) => {
  const params = { page, size };
  if (category !== "all") params.category = category;
  if (targetId) params.targetId = targetId;

  return axios.get("http://localhost/api/admin/reviews/paged", {
    headers: authHeader(),
    params,
    withCredentials: true,
  });
};

export const postAdminReply = (id, replyText) => {

const token = sessionStorage.getItem("token");
  console.log("[디버그] 보내는 토큰:", token);

  return axios.post(
    `http://localhost/api/admin/reviews/${id}/reply`,
    { reply: replyText },
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")} `,
        "Content-Type": "application/json",
      },
      withCredentials: true,
    }
  );
};

export const deleteReviewByAdmin = (reviewId) => {
  return axios.delete(`http://localhost/api/admin/reviews/${reviewId}`, {
    headers: authHeader(),
    withCredentials: true,
  });
};
