var express = require('express');
var router = express.Router();
var commonResources = require('../public/javascripts/common');
var mysql = require('mysql');

var dbConnect = mysql.createConnection({
    host: "localhost",
    user: "scott",
    password: "tiger",
    database: "FindJobApp"
});

dbConnect.connect(function (err) {
    if (err) throw err;
    console.log("Database connected!");
});

router.get('/', async (req, res) => {
   // Search
   let keyword = req.query.keyword ==
         undefined ? "" : req.query.keyword.trim();

    let sql = "SELECT * " +
                "FROM " + commonResources.NEWS_CATEGORIES_TABLE_NAME + ";";
    dbConnect.query(sql, function (err, result, fields) {
        if (err) throw err;
        let newsCategories = result;
        res.render(
            'news-categories/index',
            {newsCategories, keyword}
        );
    });
});

// Render form create new news's category
router.get('/create', async (req, res) => {
    res.render('news-categories/create');
});

router.post('/create-save', async (req, res) => {
    // Validate
    // Validate empty name
    let categoryName = req.body.name.trim();
    if (categoryName.length === 0) {
        res.send("Hãy nhập tên thể loại bài viết");
        return;
    }

    // Pass validate
    let sql = "insert into " + commonResources.NEWS_CATEGORIES_TABLE_NAME
                + " (" + commonResources.NEWS_CATEGORY_COLUMN_NAME + ") "
                + "values ('" + categoryName + "');";
    dbConnect.query(sql, function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");
        res.redirect('/news-categories/');
    });
});

module.exports = router;