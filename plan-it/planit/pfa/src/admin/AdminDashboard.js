import React from 'react';

const AdminMainPage = () => {
  return (
    <div style={{ marginTop: '50px', position: 'relative', width: '100%', height: '100vh' }}>
      <iframe 
        title="서비스 현황 대시보드"
        src="https://lookerstudio.google.com/embed/reporting/12b363c3-0b11-4df6-b6b7-0cedf7d36b90/page/K1cbF" 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          border: 'none' 
        }}
        allowFullScreen
        frameBorder="0"
        sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      ></iframe>
    </div>
  );
};

export default AdminMainPage;