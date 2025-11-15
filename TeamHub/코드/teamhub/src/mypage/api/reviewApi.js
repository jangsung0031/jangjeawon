import axios from 'axios';

const authHeader = () => {
  const token = sessionStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchReviews = (category, targetId) => {
  const params = targetId ? { category, targetId } : { category };

  return axios.get("http://localhost/api/reviews", { withCredentials : true });
};

export const fetchReviewsPaged = (category, targetId, page = 0, size = 6) => {
  const params = targetId
    ? { category, targetId, page, size }
    : { category, page, size };

  return axios.get("http://localhost/api/reviews/paged", {
    params,
    withCredentials: true,
  });
};

export const fetchMyReviews = () => {
  return axios.get("http://localhost/api/reviews/my", {
    headers: authHeader(),
  }, { withCredentials : true});
};

export const fetchMyReviewsLegacy = (page = 0, size = 6) => {
  return axios.get("http://localhost/api/reviews/my/paged", {
    headers: authHeader(),
    params: { page, size },
    withCredentials: true,
  });
};

export const writeReview = (formData) => {
  return axios.post("http://localhost/api/reviews", formData, {
    headers: {
      ...authHeader(),
      "Content-Type": "multipart/form-data",
    },
  }, { withCredentials : true});
};

export const updateReview = (id, formData) => {
  return axios.put(`http://localhost/api/reviews/${id}`, formData, {
    headers: {
      ...authHeader(),
      "Content-Type": "multipart/form-data",
    },
  }, { withCredentials : true});
};

export const deleteReview = (id) => {
  return axios.delete(`http://localhost/api/reviews/${id}`, {
    headers: authHeader(),
  }, { withCredentials : true});
};