// routes/auth.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt');

// 1. 회원가입 페이지 보여주기
router.get('/register', (req, res) => {
    res.render('register');
});

// 2. 회원가입 처리 (DB 저장)
router.post('/register', async (req, res) => {
    const { username, password, nickname } = req.body;
    
    try {
        // 비밀번호 암호화
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // DB에 저장 (기본적으로 일반 유저(is_admin=0)로 생성)
        const sql = 'INSERT INTO users (username, password, nickname, is_admin) VALUES (?, ?, ?, 0)';
        await pool.query(sql, [username, hashedPassword, nickname]);
        
        // 가입 성공 시 로그인 페이지로 이동
        res.redirect('/auth/login');
    } catch (err) {
        console.error(err);
        res.send('<script>alert("회원가입 실패! 아이디 중복일 수 있습니다."); location.href="/auth/register";</script>');
    }
});

// 3. 로그인 페이지 보여주기
router.get('/login', (req, res) => {
    res.render('login');
});

// 4. 로그인 처리
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        // 아이디로 유저 찾기
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        const user = rows[0];

        // 유저가 있고, 비밀번호가 맞는지 확인
        if (user && await bcrypt.compare(password, user.password)) {
            // 로그인 성공 -> 세션에 정보 저장
            req.session.user = {
                id: user.id,
                username: user.username,
                nickname: user.nickname,
                is_admin: user.is_admin
            };
            
            // 세션 저장 후 메인으로 이동
            req.session.save(() => {
                res.redirect('/');
            });
        } else {
            res.send('<script>alert("아이디 또는 비밀번호가 틀렸습니다."); location.href="/auth/login";</script>');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// 5. 로그아웃
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) throw err;
        res.redirect('/');
    });
});

module.exports = router;