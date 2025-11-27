// routes/board.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// 로그인 확인 미들웨어 (로그인 안 된 사람은 튕겨냄)
const checkLogin = (req, res, next) => {
    if (!req.session.user) {
        return res.send('<script>alert("로그인이 필요합니다."); location.href="/auth/login";</script>');
    }
    next();
};

// 1. 게시글 목록 (페이징 + 검색)
router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search || '';
    const limit = 10; // 한 페이지당 게시물 수
    const offset = (page - 1) * limit;

    try {
        // 검색 조건 처리
        let sql = 'SELECT p.*, u.nickname FROM posts p JOIN users u ON p.user_id = u.id';
        let countSql = 'SELECT COUNT(*) as count FROM posts';
        let params = [];

        if (search) {
            sql += ' WHERE title LIKE ?';
            countSql += ' WHERE title LIKE ?';
            params.push(`%${search}%`);
        }

        sql += " ORDER BY (type = 'notice') DESC, created_at DESC LIMIT ? OFFSET ?";
        params.push(limit, offset);

        const [rows] = await pool.query(sql, params);
        const [countResult] = await pool.query(countSql, search ? [`%${search}%`] : []);
        const totalPosts = countResult[0].count;
        const totalPages = Math.ceil(totalPosts / limit);

        res.render('list', { posts: rows, currentPage: page, totalPages, search });
    } catch (err) {
        console.error(err);
        res.status(500).send('DB Error');
    }
});

// 2. 글쓰기 페이지 (로그인 필요)
router.get('/write', checkLogin, (req, res) => {
    res.render('write', { post: null }); // post가 null이면 새 글 작성
});

// 3. 글쓰기 저장
router.post('/write', checkLogin, async (req, res) => {
    // category 추가됨
    const { title, content, type, category } = req.body; 
    const userId = req.session.user.id;

    try {
        const postType = (req.session.user.is_admin) ? type : 'free';
        const postCategory = category || '자유'; // 카테고리 없으면 기본 '일상'

        // SQL 쿼리에 category 추가
        await pool.query('INSERT INTO posts (user_id, title, content, type, category) VALUES (?, ?, ?, ?, ?)', 
            [userId, title, content, postType, postCategory]);
        res.redirect('/board');
    } catch (err) {
        console.error(err);
        res.status(500).send('Write Error');
    }
});

// 4. 게시글 상세 조회 (조회수 증가)
router.get('/view/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // 조회수 1 증가
        await pool.query('UPDATE posts SET views = views + 1 WHERE id = ?', [id]);
        
        // 게시글 정보 + 작성자 닉네임 가져오기
        const [rows] = await pool.query('SELECT p.*, u.nickname FROM posts p JOIN users u ON p.user_id = u.id WHERE p.id = ?', [id]);
        
        if (rows.length === 0) return res.status(404).send('게시글이 없습니다.');
        
        res.render('view', { post: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).send('View Error');
    }
});

// 5. 수정 페이지
router.post('/edit/:id', checkLogin, async (req, res) => {
    // category 추가
    const { title, content, category } = req.body; 
    const { id } = req.params;

    try {
        // ... (권한 체크 로직 생략, 기존 코드 유지) ...

        // SQL 업데이트문에 category 추가
        await pool.query('UPDATE posts SET title = ?, content = ?, category = ? WHERE id = ?', 
            [title, content, category, id]);
        res.redirect(`/board/view/${id}`);
    } catch (err) {
        console.error(err);
    }
});

// 6. 수정 저장
router.post('/edit/:id', checkLogin, async (req, res) => {
    const { title, content } = req.body;
    const { id } = req.params;

    try {
        // 본인 확인 로직 한번 더 (보안)
        const [check] = await pool.query('SELECT user_id FROM posts WHERE id = ?', [id]);
        if (check[0].user_id !== req.session.user.id) {
            return res.send('<script>alert("권한이 없습니다."); location.href="/board";</script>');
        }

        await pool.query('UPDATE posts SET title = ?, content = ? WHERE id = ?', [title, content, id]);
        res.redirect(`/board/view/${id}`);
    } catch (err) {
        console.error(err);
    }
});

// 7. 삭제 처리
router.get('/delete/:id', checkLogin, async (req, res) => {
    const { id } = req.params;
    try {
        const [check] = await pool.query('SELECT user_id FROM posts WHERE id = ?', [id]);
        
        // 작성자 본인 혹은 관리자(is_admin=1)면 삭제 가능
        if (check[0].user_id === req.session.user.id || req.session.user.is_admin) {
            await pool.query('DELETE FROM posts WHERE id = ?', [id]);
            res.redirect('/board');
        } else {
            res.send('<script>alert("권한이 없습니다."); history.back();</script>');
        }
    } catch (err) {
        console.error(err);
    }
});

module.exports = router;