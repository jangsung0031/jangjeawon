import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/QnA.css';
import { Link } from 'react-router-dom';

export default function QnA() {
  const [qnaList, setQnaList] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;
  const navigate = useNavigate();

  const user = JSON.parse(sessionStorage.getItem('user'));
  const isAdmin = user?.role === 'admin';

  const filteredList = qnaList.filter(item =>
    item.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    item.username.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredList.slice(indexOfFirstPost, indexOfLastPost);

  const totalPages = Math.ceil(filteredList.length / postsPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const maskUsername = (username) => {
  if (!username || username === '익명') return '익명';
  if (username.length <= 2) return username[0] + '*';
  return username[0] + '*' + username[username.length - 1];
};
  useEffect(() => {
  axios.get('/api/qna/answered')
    .then(res => {
      const sorted = [...res.data].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setQnaList(sorted);
    })
    .catch(err => {
      console.error(err);
      alert('QnA 목록을 불러오는 중 오류가 발생했습니다.');
    });
}, []);


  return (
    <div className="qna-container">
      <h2 className="qna-title">Q & A 게시판</h2>
      <div className="qna-tabs">
        <Link to="/community/notice"><span>NOTICE</span></Link>
        <Link to="/community/faq"><span>FAQ</span></Link>
        <span className="active">Q&A</span>
      </div>
      <div className="qna-footer">
        <div className="qna-search-box">
          <input
            className="qna-search-input"
            type="text"
            placeholder="제목 또는 작성자 검색"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          <i className="bi bi-search qna-search-icon"></i>
        </div>

        {!isAdmin && (
          <button className="qna-button" onClick={() => navigate('/community/qna/write')}>글쓰기</button>
        )}
      </div>

      <table className="qna-table">
        <thead>
          <tr>
            <th>No</th>
            <th>카테고리</th>
            <th>제목</th>
            <th>작성자</th>
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
                  onClick={() => {
                    if (!item.isPrivate || isAdmin) {
                      navigate(`/community/qna/${item.id}`);
                    }
                  }}
                >
                  {item.isPrivate && !isAdmin ? '비공개 게시물입니다.' : item.title}
                </td>
                <td>{maskUsername(item.username)}</td>
                <td>{item.createdAt?.substring(0, 10)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center' }}>검색 결과가 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => setCurrentPage(number)}
            style={{
              margin: '0 4px',
              padding: '6px 12px',
              backgroundColor: currentPage === number ? '#07361c' : '#fff',
              color: currentPage === number ? '#fff' : '#07361c',
              border: '1px solid #07361c',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {number}
          </button>
        ))}
      </div>
    </div>
  );
}
