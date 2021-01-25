var express = require('express');
var router = express.Router();
var commonResources = require('../public/javascripts/common');
var mysql = require('mysql');
var uniqid = require('uniqid');

var dbConnect = mysql.createConnection({
    host: commonResources.MY_SQL_HOST,
    user: commonResources.MY_SQL_USER,
    password: commonResources.MY_SQL_PASSWORD,
    database: commonResources.MY_SQL_DATABASE_NAME
});

dbConnect.connect(function (err) {
    if (err) throw err;
});

router.get('/', async (req, res) => {
    // Search
    let keyword = req.query.keyword ==
    undefined ? "" : req.query.keyword.trim();

    // Find news in database with category and author,
    // and news's title contain keyword (case-insensitive)
    let sql =
        "select "
            + commonResources.NEWS_TABLE_NAME + "."
                 + commonResources.NEWS_COLUMN_ID+ ", " +
                commonResources.NEWS_COLUMN_TITLE + ", " +
                commonResources.NEWS_COLUMN_IMAGE_URL + ", " +
                commonResources.NEWS_CATEGORIES_TABLE_NAME + "." +
                    commonResources.NEWS_CATEGORIES_COLUMN_NAME
                     + " as " + commonResources.COLUMN_ALIAS_CATEGORY + ", " +
                commonResources.NEWS_AUTHORS_TABLE_NAME + "."
                    + commonResources.NEWS_AUTHORS_COLUMN_NAME +
                     " as " + commonResources.COLUMN_ALIAS_AUTHOR +
        " from " + commonResources.NEWS_TABLE_NAME + ", " +
            commonResources.NEWS_CATEGORIES_TABLE_NAME + ", " +
            commonResources.NEWS_AUTHORS_TABLE_NAME + " " +
        "where " + commonResources.NEWS_COLUMN_CATEGORY_ID
                 + " = " + commonResources.NEWS_CATEGORIES_TABLE_NAME
                + "." + commonResources.NEWS_CATEGORIES_COLUMN_ID +
            " and " + commonResources.NEWS_COLUMN_AUTHOR_ID + " = "
                    + commonResources.NEWS_AUTHORS_TABLE_NAME + "."
                    + commonResources.NEWS_AUTHORS_COLUMN_ID +
            " and " + commonResources.NEWS_COLUMN_TITLE +
            " " + "like '%" + keyword + "%';";
    dbConnect.query(sql, function (err, result, fields) {
        if (err) throw err;
        let news = result;
        res.render(
            'news/index',
            {news, keyword}
        );
    });
});

/**
 * Query database to get categories and authors, then send categories
 * and authors object to view news/create.ejs
 */
router.get('/create', async (req, res) => {
    let getCategoriesSql =
        "select * " +
        "from " + commonResources.NEWS_CATEGORIES_TABLE_NAME + ";";
    dbConnect.query(getCategoriesSql, function (err, categoryResult, fields) {
        if (err) throw err;
        // Copy categoryResult array
        let categories = categoryResult.slice();

        let getAuthorsSql =
            "select * " +
            "from " + commonResources.NEWS_AUTHORS_TABLE_NAME + ";";
        dbConnect.query(getAuthorsSql, function (e, authorResult, f) {
           if (err) throw err;
            let authors = authorResult.slice(); // Copy authorResult array
            res.render('news/create', {categories, authors});
        });
    });
});

router.post('/create-save', async (req, res) => {
    // Validate
    // Validate empty title
    let title = req.body.title.trim();
    if (title.length === 0) {
        res.send("Hãy nhập tiêu đề bài viết");
        return;
    }

    // Validate if no file chosen
    if(!req.files) {
        res.send("Hãy thêm hình ảnh");
        return;
    }

    if(!commonResources.isThisFileAnImage(req.files.image.name)) {
        // This file doesn't have extension webp|gif|png
        res.send("Hãy kiểm tra đúng định dạng ảnh webp|jpg|png");
        return;
    }

    //
    // // Pass validate
    // let sql = "insert into " + commonResources.NEWS_AUTHORS_TABLE_NAME
    //     + " (" + commonResources.NEWS_AUTHORS_COLUMN_NAME + ") "
    //     + "values ('" + authorName + "');";
    // dbConnect.query(sql, function (err, result) {
    //     if (err) {
    //         throw err;
    //     }
    //
    //     res.redirect('/news-authors/');
    // });
});

module.exports = router;