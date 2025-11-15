import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import '../css/MyCourseList.css';
import defaultImg from '../img/default_img.png';

const MyCourseList = () => {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const { data } = await api.get('/api/my-tour-courses');
        setCourses(data || []);
      } catch (error) {
        console.error('내 코스 목록을 불러오는 데 실패했습니다:', error);
        alert('내 코스 목록을 불러올 수 없습니다. 다시 로그인 해주세요.');
        navigate('/login');
      }
    };
    fetchMyCourses();
  }, [navigate]);

  const handleDelete = async (courseId) => {
    if (window.confirm('정말 이 코스를 삭제하시겠습니까?\n관련된 댓글과 별점 정보가 모두 사라집니다.')) {
      try {
        await api.delete(`/api/my-tour-courses/${courseId}`);
        alert('코스가 성공적으로 삭제되었습니다.');
        setCourses(prev => prev.filter(c => c.id !== courseId));
      } catch (error) {
        console.error('코스 삭제 실패:', error);
        alert('코스 삭제에 실패했습니다. 다시 시도해 주세요.');
      }
    }
  };

  const handleEdit = (courseId) => navigate(`/my-course/edit/${courseId}`);

  return (
    <section id="myCoursesPage">
      <div className="my-course-container">
        {courses.length === 0 ? (
          <div className="my-empty">
            등록한 코스가 없습니다. 나만의 코스를 만들어보세요!
          </div>
        ) : (
          <div className="course-grid">
            {courses.map((course) => (
              <div key={course.id} className="course-card">
                <div
                  onClick={() => navigate(`/course/detail/${course.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    src={course.thumbnail || defaultImg}
                    alt={course.courseTitle}
                    className="course-img"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = defaultImg; }}
                  />
                  <span className="course-badge">
                    {course.days === 1 ? '당일치기' : `${course.days - 1}박 ${course.days}일`}
                  </span>
                  <div className="course-info">
                    <h3>{course.courseTitle}</h3>
                    <p>{course.courseDesc}</p>
                    <small>등록일 | {String(course.regDate || '').substring(0, 10)}</small>
                    <div className="course-meta">
                      <span>⭐ {course.avg} ({course.ratingCount})</span>
                      <span>💬 {course.commentCount}</span>
                    </div>
                  </div>
                </div>
                <div className="course-actions">
                  <button onClick={() => handleEdit(course.id)} className="edit-btn">수정</button>
                  <button onClick={() => handleDelete(course.id)} className="delete-btn">삭제</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default MyCourseList;
