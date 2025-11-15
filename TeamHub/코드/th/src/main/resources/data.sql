INSERT INTO users (username, userid, userpw, email, tel, role)
VALUES ('관리자', 'admin', '1111', 'asdf@naver.com', '010-5678-1234', 'admin')
ON DUPLICATE KEY UPDATE
username = VALUES(username),
userpw = VALUES(userpw),
email = VALUES(email),
tel = VALUES(tel),
role = VALUES(role);
