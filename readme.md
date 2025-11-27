
-----

# 📋 Node.js Express 게시판 프로젝트

Node.js, Express, MySQL, EJS를 사용하여 개발한 **MVC 패턴 기반의 커뮤니티 게시판**입니다.

회원가입/로그인부터 게시글 CRUD, 그리고 관리자 기능까지 풀스택 웹 개발의 핵심 기능을 모두 포함하고 있습니다.

## 🛠 Tech Stack

  * **Backend:** Node.js, Express.js
  * **Database:** MySQL
  * **Frontend:** EJS (Template Engine), CSS3
  * **Authentication:** express-session, bcrypt

## ✨ 주요 기능 (Features)

  * **사용자 (User)**
      * 회원가입 및 로그인/로그아웃 (비밀번호 암호화)
      * 권한 관리 (일반 회원 / 관리자)
  * **게시판 (Board)**
      * 게시글 목록 조회 (페이지네이션 구현)
      * 게시글 작성, 수정, 삭제 (본인 글만 가능)
      * 제목 검색 기능
      * 카테고리 분류 (일상, 질문, 정보, 후기 등)
      * 조회수 증가 기능
  * **관리자 (Admin)**
      * 관리자 전용 대시보드 (회원 수, 게시글 수 통계)
      * 회원 관리 (회원 목록 조회 및 강제 추방)
      * 공지사항 관리 (공지글 작성/수정/삭제)
      * **공지사항 상단 고정 기능**

-----

## 🚀 시작 가이드 (Getting Started)

이 프로젝트를 로컬 환경에서 실행하기 위한 단계별 가이드입니다.

### 1\. 사전 준비 (Prerequisites)

  * Node.js (LTS 버전 권장)
  * MySQL Database

### 2\. 설치 (Installation)

프로젝트를 클론하고 의존성 패키지를 설치합니다.

```bash
# 레포지토리 클론
git clone https://github.com/Ow-wL/DB_Post

# 프로젝트 폴더로 이동
cd post-project

# 패키지 설치
npm install
```

### 3\. 데이터베이스 설정 (Database Setup)

MySQL에 접속하여 데이터베이스를 생성하고 테이블을 만듭니다.

1.  MySQL 워크벤치 또는 터미널 접속
2.  데이터베이스 생성: `CREATE DATABASE my_board_db;`
3.  아래 SQL문 실행하여 테이블 생성

<!-- end list -->

```sql
-- 1. 사용자 테이블 생성
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    is_admin TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 게시판 테이블 생성
CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    views INT DEFAULT 0,
    type ENUM('free', 'notice') DEFAULT 'free',
    category VARCHAR(20) DEFAULT '자유',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 4\. 환경 변수 설정 (Configuration)

보안을 위해 DB 연결 정보는 별도 파일로 관리합니다.
`config` 폴더를 생성하고 그 안에 `database.js` 파일을 만드세요.

**파일 경로:** `config/database.js`

```javascript
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',          // 본인의 MySQL 아이디
  password: 'your_password',  // 본인의 MySQL 비밀번호
  database: 'my_board_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise();
```

### 5\. 실행 (Run)

설정이 완료되었으면 서버를 실행합니다.

```bash
npm start
```

브라우저를 열고 `http://localhost:3000` 으로 접속합니다.

-----

## ⚙️ 관리자 계정 생성 방법

웹사이트에는 관리자 가입 페이지가 별도로 존재하지 않습니다. (보안상의 이유)
일반 회원으로 가입 후, 데이터베이스에서 직접 권한을 부여해야 합니다.

1.  웹사이트에서 회원가입을 진행합니다. (예: 아이디 `admin`)
2.  MySQL에서 아래 명령어를 실행하여 해당 유저를 관리자로 승격시킵니다.

<!-- end list -->

```sql
UPDATE users SET is_admin = 1 WHERE username = 'admin';
```

3.  로그아웃 후 다시 로그인하면 상단 메뉴에 **[관리자 설정]** 버튼이 생성됩니다.

-----

## 📂 폴더 구조 (Directory Structure)

```
📦my-board-project
 ┣ 📂config         # DB 연결 설정
 ┣ 📂public         # 정적 파일 (CSS, JS)
 ┣ 📂routes         # 라우터 (Controller)
 ┃ ┣ 📜admin.js     # 관리자 기능
 ┃ ┣ 📜auth.js      # 로그인/회원가입
 ┃ ┗ 📜board.js     # 게시판 CRUD
 ┣ 📂views          # EJS 템플릿 (View)
 ┃ ┣ 📂admin        # 관리자용 페이지
 ┃ ┗ 📜...ejs       # 일반 페이지
 ┣ 📜app.js         # 메인 서버 실행 파일
 ┗ 📜package.json
```