var express = require('express');
var router = express.Router();
const commonResources = require('../public/javascripts/common');

/* GET home page. */
router.get('/', function(req, res, next) {
    if (req.session.loggedin) {
        res.render('index');
    } else {
        res.redirect('/login');
    }
});

router.post('/auth', (req, res) => {
    // Validate empty username and password
    if (req.body.username === undefined) {
        res.send("Thiếu trường username.");
        return;
    }

    let username = req.body.username.trim();
    if (username.length === 0) {
        res.send("Hãy nhập tên đăng nhập.");
        return;
    }

    if (req.body.password === undefined) {
        res.send("Thiếu trường password.");
        return;
    }

    let password = req.body.password.trim();
    if (password.length === 0) {
        res.send("Mật khẩu không được để trống.");
    }

    if (username === commonResources.LOGIN_ADMIN_SERVER_PAGE_USERNAME
        &&
        password === commonResources.LOGIN_ADMIN_SERVER_PAGE_PASSWORD) {
        req.session.loggedin = true;
        req.session.username = username;
        res.redirect('/');
    } else {
        res.send("Sai tên người dùng và/hoặc mật khẩu.");
    }
    res.end();
});

module.exports = router;
