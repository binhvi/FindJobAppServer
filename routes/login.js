var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
   res.render("login/login");
});

module.exports = router;