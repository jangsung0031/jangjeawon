import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/QnA.css';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

export default function FAQ() {
  const [faqList, setFaqList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem('user'));
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
  axios.get('/api/faq')
    .then(res => {
      const sorted = [...res.data].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setFaqList(sorted);
    })
    .catch(err => {
      console.error(err);
      alert('FAQ를 불러오는 데 실패했습니다.');
    });
}, []);


  const indexOfLast = currentPage * postsPerPage;
  const indexOfFirst = indexOfLast - postsPerPage;
  const currentPosts = faqList.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(faqList.length / postsPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="qna-container">
      <h2 className="qna-title">자주 묻는 질문 (FAQ)</h2>
      <div className="qna-tabs">
        <Link to="/community/notice"><span>NOTICE</span></Link>
        <Link to="/community/faq"><span className="active">FAQ</span></Link>
        <Link to="/community/qna"><span>Q&A</span></Link>
      </div>
      <table className="qna-table faq-table">
        <thead>
          <tr>
            <th>No</th>
            <th>카테고리</th>
            <th>제목</th>
            <th>작성일</th>
          </tr>
        </thead>
        <tbody>
          {currentPosts.length > 0 ? (
            currentPosts.map((item, index) => (
              <tr key={item.id}>
                <td>{(currentPage - 1) * postsPerPage + index + 1}</td>
                <td>{item.category}</td>
                <td
                  className="qna-link"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/community/faq/${item.id}`)}
                >
                  {item.title}
                </td>
                <td>{item.createdAt?.substring(0, 10)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center' }}>등록된 FAQ가 없습니다.</td>
            </tr>
          )}
        </tbody>

      </table>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        {pageNumbers.map(num => (
          <button
            key={num}
            onClick={() => setCurrentPage(num)}
            style={{
              margin: '0 4px',
              padding: '6px 12px',
              backgroundColor: currentPage === num ? '#07361c' : '#fff',
              color: currentPage === num ? '#fff' : '#07361c',
              border: '1px solid #07361c',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {num}
          </button>
        ))}
      </div>

      {isAdmin && (
        <div className="qna-footer">
          <div></div>
          <button className="qna-button" onClick={() => navigate('/community/faq/write')}>
            FAQ 등록
          </button>
        </div>
      )}
    </div>
  );
}
