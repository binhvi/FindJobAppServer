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

    // Validate empty short description
    let shortDescription = req.body.shortDescription.trim();
    if (shortDescription.length === 0) {
        res.send("Hãy nhập mô tả tóm tắt bài viết");
        return;
    }

    // Validate empty short description
    let content = req.body.content.trim();
    if (content.length === 0) {
        res.send("Hãy nhập nội dung bài viết");
        return;
    }

    let categoryId = req.body.categoryId;
    let sqlSelectCategoryById =
        "select * " +
        "from " + commonResources.NEWS_CATEGORIES_TABLE_NAME + " " +
        "where " + commonResources.NEWS_CATEGORIES_COLUMN_ID + "= "
                    + categoryId;
    dbConnect.query(sqlSelectCategoryById, function (err, result, field) {
        if (err) throw err;
        // result: [{"id":6,"name":"Du học"}] or []
        if (!result.length) {
            res.send("Thể loại không tồn tại");
            return;
        }
    });

    let authorId = req.body.authorId;
    let sqlSelectAuthorById =
        "select * " +
        "from " + commonResources.NEWS_AUTHORS_TABLE_NAME + " " +
        "where " + commonResources.NEWS_AUTHORS_COLUMN_ID + " = "
                 + authorId;
    dbConnect.query(sqlSelectAuthorById, function (err, result, field) {
        if (err) throw err;
        if (!result.length) {
            res.send("Tác giả không tồn tại");
            return;
        }
    });

    // Pass validate
    // Upload file
    var imgUrl;
    if(req.files) { // If file is not empty, null
        let image = req.files.image;
        //image.name: Original name of upload file
        const filename = uniqid() + "-" + image.name;
        //mv: move
        await image.mv(`./uploads/news/${filename}`);
        //lưu đường dẫn tương đối tới ảnh lưu trong project,
        //không lưu cả ảnh vào db
        imgUrl = commonResources.PROTOCOL + "://"
                + commonResources.SERVER_HOST + "/news/" + filename;
    }

    let insertNewsSql =
        "insert into " + commonResources.NEWS_TABLE_NAME
        + " (" + commonResources.NEWS_COLUMN_TITLE + ", " +
                commonResources.NEWS_COLUMN_IMAGE_URL + ", " +
                commonResources.NEWS_COLUMN_SHORT_DESCRIPTION + ", " +
                commonResources.NEWS_COLUMN_CONTENT + ", " +
                commonResources.NEWS_COLUMN_CATEGORY_ID + ", " +
                commonResources.NEWS_COLUMN_AUTHOR_ID
        + ") " +
        "values (" +
            "'" + title + "', " +
            "'" + imgUrl + "', " +
            "'" + shortDescription + "', " +
            "'" + content + "', " +
            categoryId + ", " +
            authorId +
        ");";
    dbConnect.query(insertNewsSql, function (err, result) {
        if (err) {
            throw err;
        }

        res.redirect('/news/');
    });
});

router.post('/details', async (req, res) => {
    var newsId = req.body.newsId;
    let selectNewsByIdSql =
        "select "
            // id
            + commonResources.NEWS_TABLE_NAME + "."
                + commonResources.NEWS_COLUMN_ID+ ", " +
            // title
            commonResources.NEWS_COLUMN_TITLE + ", " +
            // imgUrl
            commonResources.NEWS_COLUMN_IMAGE_URL + ", " +
            // category name
            commonResources.NEWS_CATEGORIES_TABLE_NAME + "." +
                commonResources.NEWS_CATEGORIES_COLUMN_NAME
                + " as " + commonResources.COLUMN_ALIAS_CATEGORY + ", " +
            // author name
            commonResources.NEWS_AUTHORS_TABLE_NAME + "."
                + commonResources.NEWS_AUTHORS_COLUMN_NAME +
                " as " + commonResources.COLUMN_ALIAS_AUTHOR + ", " +
            // short description
            commonResources.NEWS_COLUMN_SHORT_DESCRIPTION + ", " +
            // content
            commonResources.NEWS_COLUMN_CONTENT +
        " from " + commonResources.NEWS_TABLE_NAME + ", " +
            commonResources.NEWS_CATEGORIES_TABLE_NAME + ", " +
            commonResources.NEWS_AUTHORS_TABLE_NAME + " " +
        "where " + commonResources.NEWS_COLUMN_CATEGORY_ID
            + " = " + commonResources.NEWS_CATEGORIES_TABLE_NAME
                + "." + commonResources.NEWS_CATEGORIES_COLUMN_ID +
            " and " + commonResources.NEWS_COLUMN_AUTHOR_ID + " = "
                + commonResources.NEWS_AUTHORS_TABLE_NAME + "."
                + commonResources.NEWS_AUTHORS_COLUMN_ID +
            " and " + commonResources.NEWS_TABLE_NAME + "."
                + commonResources.NEWS_COLUMN_ID + " = ?;";
    dbConnect.query(
        selectNewsByIdSql,
        [newsId], // Escaping value to avoid sql injection
        function (err, result, fields) {
            if (err) throw err;
            let news = result[0]; // result is obj array
            console.log(news);
            res.render('news/details', {news});
        }
    );

});
module.exports = router;