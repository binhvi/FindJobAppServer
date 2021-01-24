var express = require('express');
var router = express.Router();
var commonResources = require('../public/javascripts/common');
var mysql = require('mysql');

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
    // Find records in database with name contain keyword
    // (case-insensitive)
    let sql = "select * " +
        "from " + commonResources.NEWS_CATEGORIES_TABLE_NAME + " " +
        "where " + commonResources.NEWS_CATEGORIES_COLUMN_NAME +
                " " + "like '%" + keyword + "%';";
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
        + " (" + commonResources.NEWS_CATEGORIES_COLUMN_NAME + ") "
        + "values ('" + categoryName + "');";
    dbConnect.query(sql, function (err, result) {
        if (err) {
            if (err.code === commonResources.MY_SQL_ERR_DUPLICATE_CODE) {
                res.send("Lỗi: Trùng tên thể loại")
            } else {
                throw err;
            }
        }

        res.redirect('/news-categories/');
    });
});

router.post('/update', async (req, res) => {
    let newsCategoryId = req.body.newsCategoryId;

    // Get news's category from database
    let sql = "select * " +
        "from " + commonResources.NEWS_CATEGORIES_TABLE_NAME + " " +
        "where " + commonResources.NEWS_CATEGORIES_COLUMN_ID + "= "
        + newsCategoryId;
    dbConnect.query(sql, function (err, result, field) {
        if (err) throw err;
        // result: [{"id":6,"name":"Du học"}]
        let newsCategoryObj = result[0];
        res.render('news-categories/update',
            {newsCategoryObj}
        );
    });

});

router.post('/update-save', async (req, res) => {
    // Find if news category exists
    let categoryId = req.body.id;
    let selectCategoryByIdSql =
        "select * from " + commonResources.NEWS_CATEGORIES_TABLE_NAME + " " +
        "where " + commonResources.NEWS_CATEGORIES_COLUMN_ID + " = "
                + categoryId;
    dbConnect.query(selectCategoryByIdSql, function (err, result, fields) {
        if (err) throw err;
        if (result.length == 0) {
            res.send("Không tìm thấy thông tin thể loại");
        } else {
            // Validate
            // Validate empty name
            let categoryName = req.body.name.trim();
            if (categoryName.length === 0) {
                res.send("Hãy nhập tên thể loại bài viết");
                return;
            }

            // Pass validate
            let sql = "update " + commonResources.NEWS_CATEGORIES_TABLE_NAME + " " +
                        "set " + commonResources.NEWS_CATEGORIES_COLUMN_NAME +
                                " = '" + categoryName + "' " +
                        "where " + commonResources.NEWS_CATEGORIES_COLUMN_ID +
                                " = " + categoryId;

            dbConnect.query(sql, function (err, result) {
                if (err) {
                    if (err.code === commonResources.MY_SQL_ERR_DUPLICATE_CODE) {
                        res.send("Lỗi: Trùng tên thể loại")
                    } else {
                        throw err;
                    }
                }

                res.redirect('/news-categories/');
            });
        }
    });
});

router.post('/remove', async (req, res) => {
    let categoryId = req.body.newsCategoryId;

    // Delete news with categoryId = ?
    // Use mysql escaping value to avoid sql injection
    let deleteNewsWithCategoryIdSql =
        "delete from " + commonResources.NEWS_TABLE_NAME + " " +
        "where " + commonResources.NEWS_COLUMN_CATEGORY_ID + " = ?;";
    dbConnect.query(
        deleteNewsWithCategoryIdSql,
        [categoryId],
        function (err, result) {
        if (err) throw err;
    });

    // Then delete category with category id = ?
    let deleteNewsCategoryWithIdSql =
        "delete from " + commonResources.NEWS_CATEGORIES_TABLE_NAME + " " +
        "where " + commonResources.NEWS_CATEGORIES_COLUMN_ID + " = ?;"
    dbConnect.query(
        deleteNewsCategoryWithIdSql,
        [categoryId],
        function (err, result) {
            if (err) throw err;
        }
    );

    res.redirect('/news-categories/');
});

module.exports = router;