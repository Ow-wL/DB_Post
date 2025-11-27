// routes/admin.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// 관리자 권한 확인 미들웨어
const checkAdmin = (req, res, next) => {
    if (!req.session.user || !req.session.user.is_admin) {
        return res.send('<script>alert("관리자만 접근 가능합니다."); location.href="/";</script>');
    }
    next();
};

// 모든 라우트에 관리자 체크 적용
router.use(checkAdmin);

// 1. 관리자 대시보드 (메인)
router.get('/', async (req, res) => {
    try {
        // 통계 데이터 가져오기
        const [userCount] = await pool.query('SELECT COUNT(*) as cnt FROM users');
        const [postCount] = await pool.query('SELECT COUNT(*) as cnt FROM posts');
        const [noticeCount] = await pool.query('SELECT COUNT(*) as cnt FROM posts WHERE type="notice"');
        
        res.render('admin/main', { 
            stats: { users: userCount[0].cnt, posts: postCount[0].cnt, notices: noticeCount[0].cnt }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error');
    }
});

// 2. 멤버 목록 관리
router.get('/users', async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, username, nickname, is_admin, created_at FROM users ORDER BY id DESC');
        res.render('admin/users', { users });
    } catch (err) {
        console.error(err);
    }
});

// 2-1. 멤버 강제 탈퇴
router.get('/users/delete/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.redirect('/admin/users');
    } catch (err) {
        console.error(err);
        res.send('<script>alert("삭제 실패"); history.back();</script>');
    }
});

// 3. 공지사항 관리 (공지글만 모아보기)
router.get('/notices', async (req, res) => {
    try {
        const [notices] = await pool.query(`
            SELECT p.*, u.nickname 
            FROM posts p 
            JOIN users u ON p.user_id = u.id 
            WHERE p.type = 'notice' 
            ORDER BY created_at DESC
        `);
        res.render('admin/notices', { notices });
    } catch (err) {
        console.error(err);
    }
});

module.exports = router;