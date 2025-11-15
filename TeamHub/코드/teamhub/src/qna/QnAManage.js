import { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/QnA.css';
import { useNavigate } from 'react-router-dom';

export default function QnAManage() {
  const [pendingList, setPendingList] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem('user'));
  const isAdmin = user?.role === 'admin';

   useEffect(() => {
    if (!isAdmin) {
      alert('관리자만 접근할 수 있습니다.');
      navigate('/community/qna');
    }
  }, []);

  useEffect(() => {
    fetchPendingList();
  }, []);

  const fetchPendingList = () => {
    axios.get('/api/qna/pending')
      .then(res => setPendingList(res.data))
      .catch(err => {
        console.error(err);
        alert('대기중 QnA를 불러오는 중 오류가 발생했습니다.');
      });
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm('정말 삭제하시겠습니까?');
    if (!confirm) return;

    try {
      await axios.delete(`/api/qna/${id}`);
      alert('QnA가 삭제되었습니다.');
      fetchPendingList();
    } catch (err) {
      console.error(err);
      alert('QnA 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="qna-manage-container">
      <h2 className="qna-title">답변 대기 QnA 목록</h2>
      <table className="qna-table">
        <thead>
          <tr>
            <th>No</th>
            <th>카테고리</th>
            <th>제목</th>
            <th>작성자</th>
            <th>작성일</th>
            {isAdmin && <th>삭제</th>}
          </tr>
        </thead>
        <tbody>
          {pendingList.length > 0 ? (
            pendingList.map((item, index) => (
              <tr key={item.id}>
                <td>{pendingList.length - index}</td>
                <td>{item.category}</td>
                <td
                  className="qna-link"
                  style={{ cursor: 'pointer', color: '#007bff' }}
                  onClick={() => navigate(`/admin/manage/qna/${item.id}`)}
                >
                  {item.title}
                </td>
                <td>{item.username}</td>
                <td>{item.createdAt?.substring(0, 10)}</td>
                {isAdmin && (
                  <td>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="qna-delete-button"
                    >
                      삭제
                    </button>

                  </td>
                )}

              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center' }}>대기 중인 QnA가 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
