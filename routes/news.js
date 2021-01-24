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

module.exports = router;