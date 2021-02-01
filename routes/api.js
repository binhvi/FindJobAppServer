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

router.post('/news', async (req, res) =>  {
    // Set number items per page
    const perPageRequest = req.body.perpage;
    var numberItemsPerPage;
    if (perPageRequest === undefined) {
        numberItemsPerPage = commonResources.
            DEFAULT_ITEM_PER_PAGE_NUM;
    } else if (perPageRequest === '') {
        numberItemsPerPage = commonResources.
            DEFAULT_ITEM_PER_PAGE_NUM;
    } else if (isNaN(perPageRequest)) {
        // Request per page is text
        numberItemsPerPage = commonResources.
            DEFAULT_ITEM_PER_PAGE_NUM;
    } else if (Math.floor(perPageRequest) < 1) {
        numberItemsPerPage = commonResources.
            MIN_ITEM_PER_PAGE_NUM;
    } else if (Math.floor(perPageRequest) <= 500) {
        numberItemsPerPage = Math.floor(perPageRequest);
    } else if (Math.floor(perPageRequest) > 500) {
        numberItemsPerPage = commonResources.MAX_ITEM_PER_PAGE_NUM;
    }

    var selectFromClauseTableNewsSql =
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
        "where "
            + commonResources.NEWS_COLUMN_CATEGORY_ID
                + " = " + commonResources.NEWS_CATEGORIES_TABLE_NAME
                + "." + commonResources.NEWS_CATEGORIES_COLUMN_ID +
            " and " + commonResources.NEWS_COLUMN_AUTHOR_ID + " = "
                + commonResources.NEWS_AUTHORS_TABLE_NAME + "."
                + commonResources.NEWS_AUTHORS_COLUMN_ID + " ";

    const pageIndexRequest = req.body.page;

    const categoryId = req.body.categoryId;
    if (categoryId === undefined ||
        categoryId === '' ||
        isNaN(categoryId)) {
        // Category id undefined or empty or a text. Get all news.

        // Get total items
        let getTotalNewsNumberSql =
            "select count(*) as total " +
            "from " + commonResources.NEWS_TABLE_NAME;
        dbConnect.query(
            getTotalNewsNumberSql,
            function (err, resultNumberOfNews, fields) {
                var totalItemsNumber = resultNumberOfNews[0].total;
                if (!totalItemsNumber) {
                    res.json({
                        result: true,
                        page: commonResources.DEFAULT_PAGE_INDEX,
                        pages: 1,
                        perpage: commonResources.DEFAULT_ITEM_PER_PAGE_NUM,
                        total: 0,
                        newsArr: []
                    });
                } else {
                    let numbersOfPage =
                        totalItemsNumber / numberItemsPerPage;
                    if (numbersOfPage > 0 && numbersOfPage <= 1) {
                        // 1 page
                        dbConnect.query(
                            selectFromClauseTableNewsSql,
                            function (err, resultAllNewsOnePage, fields) {
                                if (err) throw err;
                                res.json({
                                    result: true,
                                    page: commonResources.DEFAULT_PAGE_INDEX,
                                    pages: 1,
                                    perpage: numberItemsPerPage,
                                    total: totalItemsNumber,
                                    newsArr: resultAllNewsOnePage
                                });
                            }
                        );
                    } else {
                        // > 1 page
                        var pageIndex;

                        if (pageIndexRequest === undefined) {
                            pageIndex = commonResources.DEFAULT_PAGE_INDEX;
                        } else if (pageIndexRequest === '') {
                            pageIndex = commonResources.DEFAULT_PAGE_INDEX;
                        } else if (isNaN(pageIndexRequest)) {
                            pageIndex = commonResources.DEFAULT_PAGE_INDEX;
                        } else if(pageIndexRequest <= 1 ||
                                    pageIndexRequest > numbersOfPage) {
                            pageIndex = commonResources.DEFAULT_PAGE_INDEX;
                        } else {
                            pageIndex = Math.floor(pageIndexRequest);
                        }

                        var offset = numberItemsPerPage * (pageIndex - 1);
                        var limitOffsetClause = " limit " + numberItemsPerPage
                            + " offset " + offset;
                        var numberOfPages =
                            Math.round(totalItemsNumber / numberItemsPerPage);

                        dbConnect.query(
                            selectFromClauseTableNewsSql + limitOffsetClause,
                            function (err, allNewsResult, fields) {
                                if (err) throw err;
                                res.json({
                                    result: true,
                                    page: pageIndex,
                                    pages: numberOfPages,
                                    perpage: numberItemsPerPage,
                                    total: totalItemsNumber,
                                    newsArr: allNewsResult
                                });
                            }
                        );

                    }
                }
            }
        );

    } else {
        // Check if category id exists
        let sqlSelectCategoryById =
            "select * " +
            "from " + commonResources.NEWS_CATEGORIES_TABLE_NAME + " " +
            "where " + commonResources.NEWS_CATEGORIES_COLUMN_ID + " = "
            + categoryId;
        dbConnect.query(
            sqlSelectCategoryById,
            function (err, resultCategory, field) {
                if (err) throw err;
                // result: [{"id":6,"name":"Du học"}] or []

                if (resultCategory.length) {
                    // Category id exists.
                    // Get only news of this category.

                    // Get total items
                    let getNewsOfThisCategoryNumberSql =
                        "select count(*) as total " +
                        "from " + commonResources.NEWS_TABLE_NAME + " " +
                        "where " + commonResources.NEWS_COLUMN_CATEGORY_ID
                                + " = " + categoryId;
                    dbConnect.query(
                        getNewsOfThisCategoryNumberSql,
                        function (err, resultNumberOfNews, fields) {
                            var totalItemsNumber = resultNumberOfNews[0].total;
                            if (!totalItemsNumber) {
                                res.json({
                                    result: true,
                                    page: commonResources.DEFAULT_PAGE_INDEX,
                                    pages: 1,
                                    perpage: numberItemsPerPage,
                                    total: 0,
                                    newsArr: []
                                });
                            } else {
                                var whereCategoryIdEqualsClauseSql =
                                    " and " +
                                    commonResources.NEWS_COLUMN_CATEGORY_ID
                                    + " = " + categoryId + " ";
                                let numbersOfPage =
                                    totalItemsNumber / numberItemsPerPage;
                                if (numbersOfPage > 0 && numbersOfPage <= 1) {
                                    // 1 page
                                    dbConnect.query(
                                        selectFromClauseTableNewsSql +
                                        whereCategoryIdEqualsClauseSql,
                                        function (err, resultAllNewsOnePage, fields) {
                                            if (err) throw err;
                                            res.json({
                                                result: true,
                                                page: commonResources.DEFAULT_PAGE_INDEX,
                                                pages: 1,
                                                perpage: numberItemsPerPage,
                                                total: totalItemsNumber,
                                                newsArr: resultAllNewsOnePage
                                            });
                                        }
                                    );
                                } else {
                                    // > 1 page
                                    var pageIndex;

                                    if (pageIndexRequest === undefined) {
                                        pageIndex = commonResources.DEFAULT_PAGE_INDEX;
                                    } else if (pageIndexRequest === '') {
                                        pageIndex = commonResources.DEFAULT_PAGE_INDEX;
                                    } else if (isNaN(pageIndexRequest)) {
                                        pageIndex = commonResources.DEFAULT_PAGE_INDEX;
                                    } else if(pageIndexRequest <= 1 ||
                                        pageIndexRequest > numbersOfPage) {
                                        pageIndex = commonResources.DEFAULT_PAGE_INDEX;
                                    } else {
                                        pageIndex = Math.floor(pageIndexRequest);
                                    }


                                    var offset = numberItemsPerPage * (pageIndex - 1);
                                    var limitOffsetClause = " limit " + numberItemsPerPage
                                        + " offset " + offset;
                                    var numberOfPages =
                                        Math.round(totalItemsNumber / numberItemsPerPage);

                                    dbConnect.query(
                                        selectFromClauseTableNewsSql
                                        + whereCategoryIdEqualsClauseSql
                                        + limitOffsetClause,
                                        function (err, allNewsResult, fields) {
                                            if (err) throw err;
                                            res.json({
                                                result: true,
                                                page: pageIndex,
                                                pages: numberOfPages,
                                                perpage: numberItemsPerPage,
                                                total: totalItemsNumber,
                                                newsArr: allNewsResult
                                            });
                                        }
                                    );
                                }
                            }
                        }
                    );

                } else {
                    // Category id is not exists. Get all news.
                    // Get total items
                    let getTotalNewsNumberSql =
                        "select count(*) as total " +
                        "from " + commonResources.NEWS_TABLE_NAME;
                    dbConnect.query(
                        getTotalNewsNumberSql,
                        function (err, resultNumberOfNews, fields) {
                            var totalItemsNumber = resultNumberOfNews[0].total;
                            if (!totalItemsNumber) {
                                res.json({
                                    result: true,
                                    page: commonResources.DEFAULT_PAGE_INDEX,
                                    pages: 1,
                                    perpage: numberItemsPerPage,
                                    total: 0,
                                    newsArr: []
                                });
                            } else {
                                let numbersOfPage =
                                    totalItemsNumber / numberItemsPerPage;
                                if (numbersOfPage > 0 && numbersOfPage <= 1) {
                                    // 1 page
                                    dbConnect.query(
                                        selectFromClauseTableNewsSql,
                                        function (err, resultAllNewsOnePage, fields) {
                                            if (err) throw err;
                                            res.json({
                                                result: true,
                                                page: commonResources.DEFAULT_PAGE_INDEX,
                                                pages: 1,
                                                perpage: numberItemsPerPage,
                                                total: totalItemsNumber,
                                                newsArr: resultAllNewsOnePage
                                            });
                                        }
                                    );
                                } else {
                                    // > 1 page
                                    var pageIndex;

                                    if (pageIndexRequest === undefined) {
                                        pageIndex = commonResources.DEFAULT_PAGE_INDEX;
                                    } else if (pageIndexRequest === '') {
                                        pageIndex = commonResources.DEFAULT_PAGE_INDEX;
                                    } else if (isNaN(pageIndexRequest)) {
                                        pageIndex = commonResources.DEFAULT_PAGE_INDEX;
                                    } else if(pageIndexRequest <= 1 ||
                                        pageIndexRequest > numbersOfPage) {
                                        pageIndex = commonResources.DEFAULT_PAGE_INDEX;
                                    } else {
                                        pageIndex = Math.floor(pageIndexRequest);
                                    }


                                    var offset = numberItemsPerPage * (pageIndex - 1);
                                    var limitOffsetClause = " limit " + numberItemsPerPage
                                        + " offset " + offset;
                                    var numberOfPages =
                                        Math.round(totalItemsNumber / numberItemsPerPage);

                                    dbConnect.query(
                                        selectFromClauseTableNewsSql + limitOffsetClause,
                                        function (err, allNewsResult, fields) {
                                            if (err) throw err;
                                            res.json({
                                                result: true,
                                                page: pageIndex,
                                                pages: numberOfPages,
                                                perpage: numberItemsPerPage,
                                                total: totalItemsNumber,
                                                newsArr: allNewsResult
                                            });
                                        }
                                    );

                                }
                            }
                        }
                    );
                }
            }
        );
    }
});

// News categories
router.get('/news-categories', async (req, res) => {
    let getNewsCategorySql =
        "select * " +
        "from " + commonResources.NEWS_CATEGORIES_TABLE_NAME + ";";
    dbConnect.query(getNewsCategorySql, function (err, result, fields) {
        if (err) throw err;
        let newsCategories = result;
        res.json({
            result: true,
            newsCategories: newsCategories
        });
    });
});

// Genders
router.get('/genders', async (req, res) => {
    let getGendersSql =
        "select * " +
        "from " + commonResources.GENDERS_TABLE_NAME + ";";
    dbConnect.query(getGendersSql, function (err, result, fields) {
        if (err) throw err;
        let genders = result;
        res.json({
            result: true,
            genders: genders
        });
    });
});

module.exports = router;