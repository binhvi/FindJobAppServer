var express = require('express');
var router = express.Router();
var commonResources = require('../public/javascripts/common');
var dbConnect = require('../public/javascripts/db');

router.get('/', async (req, res) => {
    // Search
    let keyword = req.query.keyword ==
    undefined ? "" : req.query.keyword.trim();
    // Find records in database with name contain keyword
    // (case-insensitive)
    let sql = "select * " +
        "from " + commonResources.NEWS_AUTHORS_TABLE_NAME + " " +
        "where " + commonResources.NEWS_AUTHORS_COLUMN_NAME +
        " " + "like '%" + keyword + "%';";
    dbConnect.query(sql, function (err, result, fields) {
        if (err) throw err;
        let newsAuthors = result;
        res.render(
            'news-authors/index',
            {newsAuthors, keyword}
        );
    });
});

router.get('/create', async (req, res) => {
    res.render('news-authors/create');
});

router.post('/create-save', async (req, res) => {
    // Validate
    // Validate empty name
    let authorName = req.body.name.trim();
    if (authorName.length === 0) {
        res.send("Hãy nhập tên tác giả bài viết");
        return;
    }

    // Pass validate
    let sql = "insert into " + commonResources.NEWS_AUTHORS_TABLE_NAME
        + " (" + commonResources.NEWS_AUTHORS_COLUMN_NAME + ") "
        + "values ('" + authorName + "');";
    dbConnect.query(sql, function (err, result) {
        if (err) {
            throw err;
        }

        res.redirect('/news-authors/');
    });
});

router.post('/update', async (req, res) => {
    let newsAuthorId = req.body.newsAuthorId;

    // Get news's author from database
    let sql = "select * " +
        "from " + commonResources.NEWS_AUTHORS_TABLE_NAME + " " +
        "where " + commonResources.NEWS_AUTHORS_COLUMN_ID + "= "
        + newsAuthorId;
    dbConnect.query(sql, function (err, result, field) {
        if (err) throw err;
        // result: [{"id":1,"name":"Admin"}]
        let newsAuthorObj = result[0];
        res.render('news-authors/update',
            {newsAuthorObj}
        );
    });
});

router.post('/update-save', async (req, res) => {
    // Find if news author exists
    let authorId = req.body.id;
    let selectAuthorByIdSql =
        "select * from " + commonResources.NEWS_AUTHORS_TABLE_NAME + " " +
        "where " + commonResources.NEWS_AUTHORS_COLUMN_ID + " = "
        + authorId;
    dbConnect.query(selectAuthorByIdSql, function (err, result, fields) {
        if (err) throw err;
        if (result.length == 0) {
            res.send("Không tìm thấy thông tin tác giả");
        } else {
            // Validate
            // Validate empty name
            let authorName = req.body.name.trim();
            if (authorName.length === 0) {
                res.send("Hãy nhập tên tác giả bài viết");
                return;
            }

            // Pass validate
            let sql = "update " + commonResources.NEWS_AUTHORS_TABLE_NAME + " " +
                "set " + commonResources.NEWS_AUTHORS_COLUMN_NAME +
                " = '" + authorName + "' " +
                "where " + commonResources.NEWS_AUTHORS_COLUMN_ID +
                " = " + authorId;

            dbConnect.query(sql, function (err, result) {
                if (err) {
                    throw err;
                }

                res.redirect('/news-authors/');
            });
        }
    });
});

router.post('/remove', async (req, res) => {
    let authorId = req.body.newsAuthorId;

    // Delete news with authorId = ?
    // Use mysql escaping value to avoid sql injection
    let deleteNewsOfThisAuthorSql =
        "delete from " + commonResources.NEWS_TABLE_NAME + " " +
        "where " + commonResources.NEWS_COLUMN_AUTHOR_ID + " = ?;";
    dbConnect.query(
        deleteNewsOfThisAuthorSql,
        [authorId],
        function (err, result) {
            if (err) throw err;
        });

    // Then delete category with category id = ?
    let deleteNewsAuthorWithIdSql =
        "delete from " + commonResources.NEWS_AUTHORS_TABLE_NAME + " " +
        "where " + commonResources.NEWS_AUTHORS_COLUMN_ID + " = ?;"
    dbConnect.query(
        deleteNewsAuthorWithIdSql,
        [authorId],
        function (err, result) {
            if (err) throw err;
        }
    );

    res.redirect('/news-authors/');
});

router.get('/details/:authorId', async (req, res) => {
    let authorId = req.params.authorId;
    let selectCategoryByIdSql =
        "select * " +
        "from " + commonResources.NEWS_AUTHORS_TABLE_NAME + " " +
        "where " + commonResources.NEWS_AUTHORS_COLUMN_ID + " = ?;";
    dbConnect.query(
        selectCategoryByIdSql,
        [authorId],
        function (err, resultAuthor) {
            if (err) throw err;
            let author = resultAuthor[0]; // result is obj array

            // Query list of news of this category
            let selectNewsOfThisAuthorSql =
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
                    + commonResources.NEWS_AUTHORS_COLUMN_ID + " " +

                    " and " + commonResources.NEWS_AUTHORS_TABLE_NAME + "."
                        + commonResources.NEWS_AUTHORS_COLUMN_ID
                        + " = ?;";
            dbConnect.query(
                selectNewsOfThisAuthorSql,
                [authorId],
                function (err, newsResult, fields) {
                    if (err) throw err;
                    let news = newsResult;
                    res.render(
                        'news-authors/details',
                        {author, news}
                    );
                }
            );
        });
});

module.exports = router;