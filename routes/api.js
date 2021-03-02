var express = require('express');
var router = express.Router();
var commonResources = require('../public/javascripts/common');
var uniqid = require('uniqid');
var dbConnect = require('../public/javascripts/db');
var userModule = require('./users');

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

router.post('/news/details', (req, res) => {
    if (req.body.newsId === undefined) {
        res.json({
            result: false,
            message: "Thiếu trường newsId"
        });
        return;
    }

    if (!req.body.newsId.trim()) {
        res.json({
            result: false,
            message: "Trường newsId không được để trống"
        });
        return;
    }

    let newsId = req.body.newsId;
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
            if(result.length > 0) {
                res.json({
                    result: true,
                    news
                });
            } else {
                res.json({
                    result: false,
                    message: "Không tìm thấy thông tin bài viết."
                });
            }
        }
    );
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

// Types of work
router.get('/types-of-work', async (req, res) => {
    let selectAllTypesOfWorkSql =
        "select * " +
        "from " + commonResources.TYPES_OF_WORK_TABLE_NAME + ";";
    dbConnect.query(selectAllTypesOfWorkSql, function (err, result, fields) {
        if (err) throw err;
        let typesOfWork = result;
        res.json({
            result: true,
            typesOfWork: typesOfWork
        });
    });
});

// Levels of education
router.get('/levels-of-education', async (req, res) => {
    let selectAllLevelsOfEducationSql =
        "select * " +
        "from " + commonResources.LEVELS_OF_EDUCATION_TABLE_NAME + ";";
    dbConnect.query(
        selectAllLevelsOfEducationSql,
        function (err, result, fields) {
            if (err) throw err;
            let levelsOfEducation = result;
            res.json({
                result: true,
                levelsOfEducation: levelsOfEducation
            });
    });
});

router.get('/academic-degree-levels', async (req, res) => {
    let selectAllAcademicDegreeLevelsSql =
        "select * " +
        "from " + commonResources.ACADEMIC_DEGREE_LEVELS_TABLE_NAME + " " +
        "order by " + commonResources.ACADEMIC_DEGREE_LEVELS_COLUMN_ID + ";";
    dbConnect.query(
        selectAllAcademicDegreeLevelsSql,
        function (err, result) {
            if (err) throw err;
            let academicDegreeLevels = result;
            res.json({
                result: true,
                academicDegreeLevels: academicDegreeLevels
            });
        });
});

router.post('/users/create', async (req, res) => {
    // Validate
    // fullName
    if (req.body.fullName === undefined) {
        res.json({
            result: false,
            message: "Thiếu trường fullName."
        });
        return;
    }

    let fullName = req.body.fullName.trim();
    if (fullName.length === 0) {
        res.json({
            result: false,
            message: "Hãy nhập họ và tên."
        });
        return;
    }

    if (fullName.length < 2) {
        res.json({
            result: false,
            message: "Nhập họ tên từ hai ký tự trở lên."
        });
        return;
    }

    if (req.body.phone === undefined) {
        res.json({
            result: false,
            message: "Thiếu trường phone."
        });
        return;
    }

    let phone = req.body.phone.trim();
    if (phone.length === 0) {
        res.json({
            result: false,
            message: "Hãy nhập số điện thoại."
        });
        return;
    }

    if (!phone.match(commonResources.REGEX_PHONE)) {
        res.json({
            result: false,
            message: "Nhập số điện thoại 9 - 10 chữ số."
        });
        return;
    }

    userModule.checkIfPhoneExistsWhenCreateUser(phone, function (isPhoneExists) {
        if (isPhoneExists) {
            res.json({
                result: false,
                message: "Trùng số điện thoại."
            });
        } else {
            // Pass validate phone
            // -> Then validate Email
            if (req.body.email === undefined) {
                res.json({
                    result: false,
                    message: "Thiếu trường email."
                });
                return;
            }

            let email = req.body.email.trim();
            if (email.length === 0) {
                res.json({
                    result: false,
                    message: "Hãy nhập email."
                });
                return;
            }

            if (!email.match(commonResources.REGEX_EMAIL)) {
                res.json({
                    result: false,
                    message: "Hãy nhập email đúng định dạng."
                });
                return;
            }

            userModule.checkIfEmailExistsWhenCreateUser(email, function (isEmailExists) {
                if (isEmailExists) {
                    res.json({
                        result: false,
                        message: "Trùng email."
                    });
                } else {
                    // Pass validate email
                    // -> Go to validate password
                    if (req.body.password === undefined) {
                        res.json({
                            result: false,
                            message: "Thiếu trường password."
                        });
                        return;
                    }

                    let password = req.body.password.trim();
                    if (password.length === 0) {
                        res.json({
                            result: false,
                            message: "Hãy nhập password."
                        });
                        return;
                    }

                    if (password.length < 6) {
                        res.json({
                            result: false,
                            message: "Nhập mật khẩu từ 6 ký tự trở lên."
                        });
                        return;
                    }

                    // Pass validate, save to database
                    let saveUserToDbSql =
                        "insert into " + commonResources.USERS_TABLE_NAME + "(" +
                            commonResources.USERS_COLUMN_FULL_NAME + ", " +
                            commonResources.USERS_COLUMN_PASSWORD + ", " +
                            commonResources.USERS_COLUMN_EMAIL + ", " +
                            commonResources.USERS_COLUMN_PHONE + ") " +
                        "values(" +
                            "'" + fullName + "', " +
                            "'" + password + "', " +
                            "'" + email + "', " +
                            "'" + phone + "');"
                    dbConnect.query(
                        saveUserToDbSql,
                        function (err, result) {
                            if (err) {
                                res.json({
                                    result: false,
                                    message: "Tạo mới thất bại.",
                                    err
                                });
                            } else {
                                res.json({
                                    result: true,
                                    message: "Tạo mới thành công"
                                });
                            }
                        }
                    );
                }
            });
        }
    });
});

router.post('/users/login', async (req, res) => {
    // Validate email
    if (req.body.email === undefined) {
        res.json({
            result: false,
            message: "Thiếu trường email."
        });
        return;
    }

    let email = req.body.email.trim();
    if (email.length === 0) {
        res.json({
            result: false,
            message: "Hãy nhập email."
        });
        return;
    }

    if (!email.match(commonResources.REGEX_EMAIL)) {
        res.json({
            result: false,
            message: "Hãy nhập email đúng định dạng."
        });
        return;
    }

    // Validate password
    if (req.body.password === undefined) {
        res.json({
            result: false,
            message: "Thiếu trường password."
        });
        return;
    }

    let password = req.body.password.trim();
    if (password.length === 0) {
        res.json({
            result: false,
            message: "Hãy nhập password."
        });
        return;
    }

    if (password.length < 6) {
        res.json({
            result: false,
            message: "Nhập mật khẩu từ 6 ký tự trở lên."
        });
        return;
    }

    // Pass validate
    let getUserInfoByEmailAndPasswordSql =
        "select " +
            commonResources.USERS_COLUMN_ID + ", " +
            commonResources.USERS_COLUMN_FULL_NAME + ", " +
            commonResources.USERS_COLUMN_PASSWORD + ", " +
            commonResources.USERS_COLUMN_EMAIL + ", " +
            commonResources.USERS_COLUMN_PHONE + " " +
        "from " + commonResources.USERS_TABLE_NAME + " " +
        "where " +
            commonResources.USERS_COLUMN_EMAIL + " = ? and " +
            commonResources.USERS_COLUMN_PASSWORD + " = ?;";
    dbConnect.query(
        getUserInfoByEmailAndPasswordSql,
        [email, password],
        function (err, result) {
            if (err) {
                res.json({
                    result: false,
                    err
                });
            } else {
                if (result.length === 0) {
                    res.json({
                        result: false,
                        message: "Email hoặc mật khẩu không đúng"
                    });
                } else {
                    res.json({
                        result: true,
                        userInfo: result
                    });
                }
            }

        }
    );

});

module.exports = router;