// app.js
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

// 1. 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 2. 미들웨어
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// 3. 세션 설정
app.use(session({
    secret: 'secret_key', // 보안 키
    resave: false,
    saveUninitialized: true
}));

// 4. 전역 변수 (모든 뷰에서 user 접근 가능)
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// 5. 라우터 연결 (auth 라우터 생성 예정)
const authRouter = require('./routes/auth');
const boardRouter = require('./routes/board');
const adminRouter = require('./routes/admin');

app.use('/auth', authRouter);
app.use('/board', boardRouter);
app.use('/admin', adminRouter);

// 메인 페이지
app.get('/', (req, res) => {
    res.render('index');
});

app.listen(3000, () => {
    console.log('🚀 서버 실행: http://localhost:3000');
});