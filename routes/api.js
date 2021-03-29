var express = require('express');
var router = express.Router();
var commonResources = require('../public/javascripts/common');
var uniqid = require('uniqid');
var dbConnect = require('../public/javascripts/db');
var userModule = require('./users');
const academicDegreeLevelsModule = require('./academic-degree-levels');
const statesProvincesModule =
                require('../public/javascripts/states-provinces');
const districtsModule = require('../public/javascripts/districts');
const jobSkillsModule = require('./job-skills');
const jobSkillsOfCandidateModule =
            require('../public/javascripts/job-skills-of-candidate');
const jobNewsModule = require('./job-news');
const subdistrictsModule = require('../public/javascripts/subdistricts');
const typeOfWorksModule = require('./types-of-work');
const jobTitlesModule = require('./job-titles');
const jobApplicationsModule =
                    require('../public/javascripts/job-applications');

router.post('/news', async (req, res) => {
    // Set number items per page
    const perPageRequest = req.body.perpage;
    var numberItemsPerPage;
    if (perPageRequest === undefined) {
        numberItemsPerPage = commonResources.DEFAULT_ITEM_PER_PAGE_NUM;
    } else if (perPageRequest === '') {
        numberItemsPerPage = commonResources.DEFAULT_ITEM_PER_PAGE_NUM;
    } else if (isNaN(perPageRequest)) {
        // Request per page is text
        numberItemsPerPage = commonResources.DEFAULT_ITEM_PER_PAGE_NUM;
    } else if (Math.floor(perPageRequest) < 1) {
        numberItemsPerPage = commonResources.MIN_ITEM_PER_PAGE_NUM;
    } else if (Math.floor(perPageRequest) <= 500) {
        numberItemsPerPage = Math.floor(perPageRequest);
    } else if (Math.floor(perPageRequest) > 500) {
        numberItemsPerPage = commonResources.MAX_ITEM_PER_PAGE_NUM;
    }

    var selectFromClauseTableNewsSql =
        "select "
        // id
        + commonResources.NEWS_TABLE_NAME + "."
        + commonResources.NEWS_COLUMN_ID + ", " +
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
    let orderByNewsIdDescClauseSql =
        " order by " +
            commonResources.NEWS_TABLE_NAME + "." +
            commonResources.NEWS_COLUMN_ID + " desc ";

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
                            selectFromClauseTableNewsSql + orderByNewsIdDescClauseSql,
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
                        } else if (pageIndexRequest <= 1 ||
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
                            selectFromClauseTableNewsSql +
                            orderByNewsIdDescClauseSql +
                            limitOffsetClause,
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
                                        whereCategoryIdEqualsClauseSql +
                                        orderByNewsIdDescClauseSql,
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
                                    } else if (pageIndexRequest <= 1 ||
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
                                        + orderByNewsIdDescClauseSql
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
                                        selectFromClauseTableNewsSql +
                                        orderByNewsIdDescClauseSql,
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
                                    } else if (pageIndexRequest <= 1 ||
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
                                        selectFromClauseTableNewsSql +
                                        orderByNewsIdDescClauseSql +
                                        limitOffsetClause,
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

// Users
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

                    if (!password.match(commonResources.REGEX_PASSWORD)) {
                        res.json({
                            result: false,
                            message: commonResources
                                        .ERR_MSG_PASSWORD_NOT_MATCH_PASSWORD_REGEX
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

router.post('/users/details-query-all-info', (req, res) => {
    // Validate
    if (req.body.userId === undefined) {
        res.json({
            result: false,
            message: "Thiếu trường userId"
        });
        return;
    }

    let userIdText = req.body.userId;
    if (!userIdText.trim()) {
        res.json({
            result: false,
            message: "userId không được để trống."
        });
        return;
    }

    if (isNaN(userIdText)) {
        res.json({
            result: false,
            message: "userId phải là số."
        });
        return;
    }
    let userIdNumber = Number(userIdText);
    if (!Number.isInteger(userIdNumber)) {
        res.json({
            result: false,
            message: "userId phải là số nguyên."
        });
        return;
    }

    let userId = userIdNumber;
    userModule.checkIfUserIdExists(
        userId,
        function(isUserIdExists) {
            if (!isUserIdExists) {
                res.json({
                    result: false,
                    message: "userId không tồn tại."
                });
                return;
            }

            let selectUserInfoByIdSql =
                "select " +
                commonResources.USERS_TABLE_NAME + "." +
                commonResources.USERS_COLUMN_ID + " as id, " +

                commonResources.USERS_COLUMN_FULL_NAME + ", " +

                // Genders.name as gender
                commonResources.GENDERS_TABLE_NAME + "."
                + commonResources.GENDERS_COLUMN_NAME + " as " +
                commonResources.COLUMN_ALIAS_GENDER + ", " +

                commonResources.USERS_COLUMN_EXPECTED_SALARY_VND + ", " +

                // TypesOfWork.name as typeOfWork
                commonResources.TYPES_OF_WORK_TABLE_NAME + "." +
                commonResources.TYPES_OF_WORK_COLUMN_NAME + " as " +
                commonResources.COLUMN_ALIAS_TYPE_OF_WORK + ", " +

                commonResources.LEVELS_OF_EDUCATION_COLUMN_NAME + " as " +
                commonResources.COLUMN_ALIAS_GRADUATED_EDUCATION_LEVEL + ", " +

                commonResources.USERS_COLUMN_YEARS_OF_EXPERIENCES + ", " +
                commonResources.USERS_COLUMN_RESUME_SUMMARY + ", " +
                commonResources.USERS_COLUMN_DOB_MILLIS + ", " +

                commonResources.STATE_PROVINCES_TABLE_NAME + "." +
                commonResources.STATE_PROVINCES_COLUMN_NAME + " as " +
                commonResources.COLUMN_ALIAS_STATE_PROVINCE_NAME + ", " +

                commonResources.DISTRICTS_TABLE_NAME + "." +
                commonResources.DISTRICTS_COLUMN_NAME + " as " +
                commonResources.COLUMN_ALIAS_DISTRICT_NAME + ", " +

                commonResources.SUBDISTRICTS_TABLE_NAME + "." +
                commonResources.SUBDISTRICTS_COLUMN_NAME + " as " +
                commonResources.COLUMN_ALIAS_SUBDISTRICT_NAME + ", " +

                commonResources.USERS_COLUMN_PHONE + ", " +
                commonResources.USERS_COLUMN_EMAIL + ", " +
                commonResources.USERS_COLUMN_AVATAR_URL + ", " +
                commonResources.USERS_COLUMN_CAREER_OBJECTIVE + " " +
                "from " +
                commonResources.USERS_TABLE_NAME + " " +
                "left join " +
                commonResources.TYPES_OF_WORK_TABLE_NAME + " on " +
                commonResources.TYPES_OF_WORK_TABLE_NAME + "." +
                commonResources.TYPES_OF_WORK_COLUMN_ID + " = " +
                commonResources.USERS_COLUMN_TYPE_OF_WORK_ID + " " +
                "left join " +
                commonResources.LEVELS_OF_EDUCATION_TABLE_NAME + " on " +
                commonResources.LEVELS_OF_EDUCATION_TABLE_NAME + "." +
                commonResources.LEVELS_OF_EDUCATION_COLUMN_ID + " = " +
                commonResources.USERS_COLUMN_GRADUATED_EDUCATION_ID + " " +
                "left join " +
                commonResources.GENDERS_TABLE_NAME + " on " +
                commonResources.GENDERS_TABLE_NAME + "." +
                commonResources.GENDERS_COLUMN_ID + " = " +
                commonResources.USERS_COLUMN_GENDER_ID + " " +
                "left join " +
                commonResources.SUBDISTRICTS_TABLE_NAME + " " + "on " +
                commonResources.USERS_COLUMN_ADDRESS_SUBDISTRICT_ID +
                " = " + commonResources.SUBDISTRICTS_TABLE_NAME + "." +
                commonResources.SUBDISTRICTS_COLUMN_ID + " " +
                "left join " + commonResources.DISTRICTS_TABLE_NAME +
                " on " + commonResources.SUBDISTRICTS_TABLE_NAME + "." +
                commonResources.SUBDISTRICTS_COLUMN_DISTRICT_ID + " = " +
                commonResources.DISTRICTS_TABLE_NAME + "." +
                commonResources.DISTRICTS_COLUMN_ID + " " +
                "left join " + commonResources.STATE_PROVINCES_TABLE_NAME +
                " on " + commonResources.DISTRICTS_TABLE_NAME + "." +
                commonResources.DISTRICTS_COLUMN_STATE_PROVINCE_ID +
                " = " + commonResources.STATE_PROVINCES_TABLE_NAME +
                "." + commonResources.STATE_PROVINCES_COLUMN_ID + " " +
                "where Users.id = ?;";

            dbConnect.query(
                selectUserInfoByIdSql,
                userId,
                function(selectUserInfoErr, selectUserInfoResult) {
                    if (selectUserInfoErr) {
                        res.json({
                            result: false,
                            message: 'Lỗi truy vấn Users',
                            err: selectUserInfoErr
                        });
                        return;
                    }

                    let user = selectUserInfoResult[0]; // result is an array

                    // Experiences
                    let selectExperiencesByUserIdSql =
                        "select " +
                        commonResources.EXPERIENCES_COLUMN_COMPANY_NAME + ", " +
                        commonResources.EXPERIENCES_COLUMN_JOB_TITLE + ", " +
                        commonResources.EXPERIENCES_COLUMN_DATE_IN_MILLIS + ", " +
                        commonResources.EXPERIENCES_COLUMN_DATE_OUT_MILLIS + ", " +
                        commonResources.EXPERIENCES_COLUMN_JOB_DETAILS + " " +
                        "from " + commonResources.EXPERIENCES_TABLE_NAME + " " +
                        "where " + commonResources.EXPERIENCES_COLUMN_USER_ID +
                        " = ? " +
                        "order by "
                        + commonResources.EXPERIENCES_COLUMN_DATE_IN_MILLIS + " desc;";


                    dbConnect.query(
                        selectExperiencesByUserIdSql,
                        [userId],
                        function (err, experiencesResult) {
                            if (err) throw err;
                            let experiences = experiencesResult;

                            let selectEducationByUserIdSql =
                                "select " +
                                commonResources.EDUCATION_COLUMN_SCHOOL_NAME + ", " +
                                commonResources.EDUCATION_COLUMN_MAJOR + ", " +
                                commonResources
                                    .ACADEMIC_DEGREE_LEVELS_TABLE_NAME + "."
                                + commonResources
                                    .ACADEMIC_DEGREE_LEVELS_COLUMN_NAME
                                + " as "
                                + commonResources
                                    .COLUMN_ALIAS_ACADEMIC_DEGREE_LEVEL
                                + ", " +
                                commonResources
                                    .EDUCATION_COLUMN_START_DATE_MILLIS + ", " +
                                commonResources
                                    .EDUCATION_COLUMN_END_DATE_MILLIS + ", " +
                                commonResources.EDUCATION_COLUMN_ACHIEVEMENTS + " " +
                                "from " +
                                commonResources.EDUCATION_TABLE_NAME + ", " +
                                commonResources
                                    .ACADEMIC_DEGREE_LEVELS_TABLE_NAME + " " +
                                "where " +
                                commonResources.EDUCATION_TABLE_NAME + "." +
                                commonResources
                                    .EDUCATION_COLUMN_ACADEMIC_DEGREE_LEVEL_ID
                                + " = " +
                                commonResources
                                    .ACADEMIC_DEGREE_LEVELS_TABLE_NAME + "." +
                                commonResources
                                    .ACADEMIC_DEGREE_LEVELS_COLUMN_ID + " "
                                + "and " +
                                commonResources
                                    .EDUCATION_COLUMN_USER_ID
                                + " = ? " +
                                "order by " +
                                commonResources
                                    .EDUCATION_COLUMN_START_DATE_MILLIS + " desc;"

                            dbConnect.query(
                                selectEducationByUserIdSql,
                                [userId],
                                function (err, educationResult) {
                                    if (err) throw err;

                                    // Query JobSkillsOfCandidate records
                                    // of this user
                                    let selectJobSkillsOfUserByUserIdSql =
                                        "select " +
                                        commonResources.JOB_SKILLS_COLUMN_NAME + " " +
                                        "from " +
                                        commonResources.JOB_SKILLS_OF_CANDIDATE_TABLE_NAME
                                        + ", " +
                                        commonResources.JOB_SKILLS_TABLE_NAME + " " +
                                        "where " +

                                        commonResources.JOB_SKILLS_OF_CANDIDATE_TABLE_NAME
                                        + "." +
                                        commonResources
                                            .JOB_SKILLS_OF_CANDIDATE_COLUMN_JOB_SKILLS_ID
                                        + " = " +
                                        commonResources.JOB_SKILLS_TABLE_NAME
                                        + "."
                                        + commonResources.JOB_SKILLS_COLUMN_ID
                                        + " " +

                                        "and " +
                                        commonResources
                                            .JOB_SKILLS_OF_CANDIDATE_COLUMN_USER_ID +
                                        " = ?;";

                                    dbConnect.query(
                                        selectJobSkillsOfUserByUserIdSql,
                                        [userId],
                                        function (
                                            selectJobSkillsErr,
                                            selectJobSkillResult) {
                                            if (selectJobSkillsErr) {
                                                throw selectJobSkillsErr;
                                            }
                                            let jobSkills = selectJobSkillResult;

                                            res.json({
                                                result: true,
                                                data: {
                                                    user,
                                                    experiences,
                                                    education: educationResult,
                                                    jobSkills
                                                }
                                            });
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        }
    );
});

router.post('/users/details-get-id', (req, res) => {
    // Validate
    if (req.body.userId === undefined) {
        res.json({
            result: false,
            message: "Thiếu trường userId"
        });
        return;
    }

    let userIdText = req.body.userId;
    if (!userIdText.trim()) {
        res.json({
            result: false,
            message: "userId không được để trống."
        });
        return;
    }

    if (isNaN(userIdText)) {
        res.json({
            result: false,
            message: "userId phải là số."
        });
        return;
    }
    let userIdNumber = Number(userIdText);
    if (!Number.isInteger(userIdNumber)) {
        res.json({
            result: false,
            message: "userId phải là số nguyên."
        });
        return;
    }

    let userId = userIdNumber;
    userModule.checkIfUserIdExists(
        userId,
        function(isUserIdExists) {
            if (!isUserIdExists) {
                res.json({
                    result: false,
                    message: "userId không tồn tại."
                });
                return;
            }

            let selectUserInfoByIdSql =
                "select " +
                    commonResources.USERS_COLUMN_ID + ", " +
                    commonResources.USERS_COLUMN_FULL_NAME + ", " +
                    commonResources.USERS_COLUMN_PHONE + ", " +
                    commonResources.USERS_COLUMN_EMAIL + ", " +
                    commonResources.USERS_COLUMN_AVATAR_URL + ", " +
                    commonResources.USERS_COLUMN_GRADUATED_EDUCATION_ID
                    + ", " +
                    commonResources.USERS_COLUMN_GENDER_ID + ", " +
                    commonResources.USERS_COLUMN_TYPE_OF_WORK_ID + ", " +
                    commonResources.USERS_COLUMN_EXPECTED_SALARY_VND
                    + ", " +
                    commonResources.USERS_COLUMN_YEARS_OF_EXPERIENCES
                    + ", " +
                    commonResources.USERS_COLUMN_CAREER_OBJECTIVE + ", " +
                    commonResources.USERS_COLUMN_DOB_MILLIS + ", " +
                    commonResources.USERS_COLUMN_RESUME_SUMMARY + ", " +
                    commonResources.USERS_COLUMN_ADDRESS_SUBDISTRICT_ID
                    + ", " +

                    commonResources.SUBDISTRICTS_TABLE_NAME + "." +
                    commonResources.SUBDISTRICTS_COLUMN_DISTRICT_ID + " as " +
                    commonResources.COLUMN_ALIAS_ADDRESS_DISTRICT_ID
                    + ", " +

                    commonResources.DISTRICTS_TABLE_NAME + "." +
                    commonResources.DISTRICTS_COLUMN_STATE_PROVINCE_ID
                    + " as " +
                    commonResources.COLUMN_ALIAS_ADDRESS_STATE_PROVINCE_ID
                    + " " +

                "from " + commonResources.USERS_TABLE_NAME + " " +
                    "left join " +
                    commonResources.SUBDISTRICTS_TABLE_NAME + " " + "on " +
                    commonResources.USERS_COLUMN_ADDRESS_SUBDISTRICT_ID +
                    " = " + commonResources.SUBDISTRICTS_TABLE_NAME + "." +
                    commonResources.SUBDISTRICTS_COLUMN_ID + " " +

                    "left join " + commonResources.DISTRICTS_TABLE_NAME +
                    " on " + commonResources.SUBDISTRICTS_TABLE_NAME + "." +
                    commonResources.SUBDISTRICTS_COLUMN_DISTRICT_ID + " = " +
                    commonResources.DISTRICTS_TABLE_NAME + "." +
                    commonResources.DISTRICTS_COLUMN_ID + " " +
                "where Users.id = ?;";

            dbConnect.query(
                selectUserInfoByIdSql,
                userId,
                function(selectUserInfoErr, selectUserInfoResult) {
                    if (selectUserInfoErr) {
                        res.json({
                            result: false,
                            message: 'Lỗi truy vấn Users',
                            err: selectUserInfoErr
                        });
                        return;
                    }

                    let user = selectUserInfoResult[0]; // result is an array

                    // Experiences
                    let selectExperiencesByUserIdSql =
                        "select " +
                            commonResources.EXPERIENCES_COLUMN_ID + ", " +
                            commonResources.EXPERIENCES_COLUMN_COMPANY_NAME + ", " +
                            commonResources.EXPERIENCES_COLUMN_JOB_TITLE + ", " +
                            commonResources.EXPERIENCES_COLUMN_DATE_IN_MILLIS + ", " +
                            commonResources.EXPERIENCES_COLUMN_DATE_OUT_MILLIS + ", " +
                            commonResources.EXPERIENCES_COLUMN_JOB_DETAILS + " " +
                        "from " + commonResources.EXPERIENCES_TABLE_NAME + " " +
                        "where " + commonResources.EXPERIENCES_COLUMN_USER_ID +
                        " = ? " +
                        "order by "
                        + commonResources.EXPERIENCES_COLUMN_DATE_IN_MILLIS + " desc;";


                    dbConnect.query(
                        selectExperiencesByUserIdSql,
                        [userId],
                        function (err, experiencesResult) {
                            if (err) throw err;
                            let experiences = experiencesResult;

                            let selectEducationByUserIdSql =
                                "select " +
                                    commonResources.EDUCATION_TABLE_NAME + "." +
                                    commonResources.EDUCATION_COLUMN_ID +
                                    " as educationId , " +

                                    commonResources.EDUCATION_COLUMN_SCHOOL_NAME + ", " +
                                    commonResources.EDUCATION_COLUMN_MAJOR + ", " +
                                    commonResources
                                        .ACADEMIC_DEGREE_LEVELS_TABLE_NAME + "."
                                    + commonResources
                                        .ACADEMIC_DEGREE_LEVELS_COLUMN_NAME
                                    + " as "
                                    + commonResources
                                        .COLUMN_ALIAS_ACADEMIC_DEGREE_LEVEL
                                    + ", " +
                                    commonResources
                                        .EDUCATION_COLUMN_START_DATE_MILLIS + ", " +
                                    commonResources
                                        .EDUCATION_COLUMN_END_DATE_MILLIS + ", " +
                                    commonResources.EDUCATION_COLUMN_ACHIEVEMENTS + " " +
                                "from " +
                                commonResources.EDUCATION_TABLE_NAME + ", " +
                                commonResources
                                    .ACADEMIC_DEGREE_LEVELS_TABLE_NAME + " " +
                                "where " +
                                commonResources.EDUCATION_TABLE_NAME + "." +
                                commonResources
                                    .EDUCATION_COLUMN_ACADEMIC_DEGREE_LEVEL_ID
                                + " = " +
                                commonResources
                                    .ACADEMIC_DEGREE_LEVELS_TABLE_NAME + "." +
                                commonResources
                                    .ACADEMIC_DEGREE_LEVELS_COLUMN_ID + " "
                                + "and " +
                                commonResources
                                    .EDUCATION_COLUMN_USER_ID
                                + " = ? " +
                                "order by " +
                                commonResources
                                    .EDUCATION_COLUMN_START_DATE_MILLIS + " desc;"

                            dbConnect.query(
                                selectEducationByUserIdSql,
                                [userId],
                                function (err, educationResult) {
                                    if (err) throw err;

                                    // Query JobSkillsOfCandidate records
                                    // of this user
                                    let selectJobSkillsOfUserByUserIdSql =
                                        "select " +
                                            commonResources.JOB_SKILLS_OF_CANDIDATE_COLUMN_JOB_SKILLS_ID
                                            + ", " +
                                            commonResources.JOB_SKILLS_COLUMN_NAME + " " +

                                        "from " +
                                            commonResources.JOB_SKILLS_OF_CANDIDATE_TABLE_NAME
                                            + ", " +
                                            commonResources.JOB_SKILLS_TABLE_NAME + " " +

                                        "where " +

                                            commonResources.JOB_SKILLS_OF_CANDIDATE_TABLE_NAME
                                            + "." +
                                            commonResources
                                                .JOB_SKILLS_OF_CANDIDATE_COLUMN_JOB_SKILLS_ID
                                            + " = " +
                                            commonResources.JOB_SKILLS_TABLE_NAME
                                            + "."
                                            + commonResources.JOB_SKILLS_COLUMN_ID
                                            + " " +

                                            "and " +
                                            commonResources
                                                .JOB_SKILLS_OF_CANDIDATE_COLUMN_USER_ID +
                                            " = ?;";

                                    dbConnect.query(
                                        selectJobSkillsOfUserByUserIdSql,
                                        [userId],
                                        function (
                                            selectJobSkillsErr,
                                            selectJobSkillResult) {
                                            if (selectJobSkillsErr) {
                                                throw selectJobSkillsErr;
                                            }
                                            let jobSkills = selectJobSkillResult;

                                            res.json({
                                                result: true,
                                                data: {
                                                    user,
                                                    experiences,
                                                    education: educationResult,
                                                    jobSkills
                                                }
                                            });
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        }
    );
});

router.post('/users/update', (req, res) => {
    if (req.body.userId === undefined) {
        res.json({
            result: false,
            message: "Thiếu trường userId."
        });
        return;
    }

    let userIdText = req.body.userId.trim();
    if (userIdText.length === 0) {
        res.json({
            result: false,
            message: "Trường userId không được để trống."
        });
        return;
    }

    if (isNaN(userIdText)) {
        res.json({
            result: false,
            message: "Trường userId phải là số."
        });
        return;
    }

    let userIdNumber = Number(userIdText);
    if (!Number.isInteger(userIdNumber)) {
        res.json({
            result: false,
            message: "userId phải là số nguyên."
        });
        return;
    }

    let userId = userIdNumber;
    userModule.checkIfUserIdExists(
        userId,
        function(isUserIdExists) {
            if (!isUserIdExists) {
                res.json({
                    result: false,
                    message: "userId không tồn tại."
                });
                return;
            }

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

            // Phone
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

            userModule.checkIfPhoneExistsWhenUpdateUser(
                phone,
                userId,
                function(isPhoneExists) {
                    if (isPhoneExists) {
                        res.json({
                            result: false,
                            message: "Trùng số điện thoại."
                        });
                        return;
                    }

                    // Pass validate phone, continue validate other fields
                    // Email
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
                            message: "Hãy nhập email " +
                                "đúng định dạng."
                        });
                        return;
                    }

                    userModule.checkIfEmailExistsWhenUpdateUser(
                        email,
                        userId,
                        async function (isEmailExists) {
                            if (isEmailExists) {
                                res.json({
                                    result: false,
                                    message: "Trùng email."
                                });
                                return;
                            }

                            // Pass validate email,
                            // go to validate other fields

                            // If user don't upload new avatar file, don't need check
                            // If user upload new file, check if file extension
                            // is image format
                            if (req.files &&
                                !commonResources.isThisFileAnImage(
                                    req.files.avatar.name)) {
                                // This file doesn't have extension webp|gif|png
                                res.json({
                                    result: false,
                                    message: "Hãy kiểm tra đúng định dạng ảnh avatar" +
                                        " là webp|jpg|png"
                                });
                                return;
                            }

                            // Gender
                            let genderId;
                            if (req.body.genderId &&  //If gender not undefined, empty
                                req.body.genderId.trim().length) {
                                // req.body.genderId is string so if
                                // req.body.genderId's value = 0,
                                // block inside still executes
                                let genderIdText = req.body.genderId.trim();

                                if (isNaN(genderIdText)) {
                                    res.json({
                                        result: false,
                                        message: "Id giới tính phải là số"
                                    });
                                    return;
                                }

                                genderId = Number(genderIdText);
                                if (!Number.isInteger(genderId)) {
                                    // Gender id is decimal number
                                    res.json({
                                        result: false,
                                        message: "Id giới tính phải là số nguyên"
                                    });
                                    return;
                                }

                                let checkIfGenderIdExistsPromise = new Promise(
                                    function (myResolve, myReject) {
                                        let selectNumbersOfGenderHaveThisIdSql =
                                            "select count(" + commonResources.GENDERS_COLUMN_ID + ") " +
                                            "as numbersOfGenderIdExist " +
                                            "from " + commonResources.GENDERS_TABLE_NAME + " " +
                                            "where " + commonResources.GENDERS_COLUMN_ID + " = ?;";
                                        dbConnect.query(
                                            selectNumbersOfGenderHaveThisIdSql,
                                            [genderId],
                                            function (err, result) {
                                                if (err) {
                                                    res.json({
                                                        result: false,
                                                        message: 'Lỗi truy vấn Genders',
                                                        err
                                                    });
                                                    throw err;
                                                } else {
                                                    myResolve(result);
                                                }
                                            }
                                        );
                                    }
                                );

                                let numbersOfGenderIdExistQueryResult =
                                    await checkIfGenderIdExistsPromise;
                                // [{"numbersOfGenderIdExist":1}]
                                let numbersOfGenderIdExist =
                                    numbersOfGenderIdExistQueryResult[0]
                                        .numbersOfGenderIdExist;
                                if (numbersOfGenderIdExist === 0) {
                                    res.json({
                                        result: false,
                                        message: "Id giới tính không tồn tại."
                                    });
                                    return;
                                }
                            }

                            // Birthday
                            let birthdayMillis;
                            if (req.body.birthdayInMilliseconds &&
                                req.body.birthdayInMilliseconds.trim()) {
                                let birthdayText =
                                    req.body.birthdayInMilliseconds.trim();

                                if (isNaN(birthdayText)) {
                                    res.json({
                                        result: false,
                                        message: "birthdayInMilliseconds phải là số."
                                    });
                                    return;
                                }

                                let birthdayMillisNumber = Number(birthdayText);
                                if (!Number.isInteger(birthdayMillisNumber)) {
                                    res.json({
                                        result: false,
                                        message: "birthdayInMilliseconds phải là số nguyên."
                                    });
                                    return;
                                }

                                birthdayMillis = birthdayMillisNumber;
                            }

                            // Address
                            let addressSubdistrictIdText;
                            if (req.body.addressSubdistrictId &&
                                req.body.addressSubdistrictId.trim()) {
                                addressSubdistrictIdText =
                                    req.body.addressSubdistrictId.trim();

                                let checkIfSubdistrictIdExistsPromise =
                                    new Promise(
                                        function(myResolve, myReject) {
                                            let selectNumbersOfSubdistrictHaveThisIdSql =
                                                "select count(" +
                                                    commonResources
                                                        .SUBDISTRICTS_COLUMN_ID + ") " +
                                                "as numberOfSubdistrictsHaveThisId " +
                                                "from " +
                                                    commonResources
                                                        .SUBDISTRICTS_TABLE_NAME + " " +
                                                "where "
                                                    + commonResources
                                                        .SUBDISTRICTS_COLUMN_ID
                                                    + " = ?;";
                                            dbConnect.query(
                                                selectNumbersOfSubdistrictHaveThisIdSql,
                                                [addressSubdistrictIdText],
                                                function (err, result) {
                                                    if (err) {
                                                        res.json({
                                                            result: false,
                                                            message: "Lỗi truy vấn id xã.",
                                                            err
                                                        });
                                                        throw err;
                                                    } else {
                                                        myResolve(result);
                                                    }
                                                }
                                            );
                                        }
                                    );

                                let numberOfSubdistrictIdExistQueryResult =
                                    await checkIfSubdistrictIdExistsPromise;
                                // [
                                //     {
                                //         "numberOfSubdistrictsHaveThisId" : 1
                                //     }
                                // ]
                                let numberOfSubdistrictsHaveThisId =
                                    numberOfSubdistrictIdExistQueryResult[0]
                                        .numberOfSubdistrictsHaveThisId;
                                if (numberOfSubdistrictsHaveThisId === 0) {
                                    res.json({
                                        result: false,
                                        message: "ID xã không tồn tại."
                                    });
                                    return;
                                }
                            }

                            // Level of education
                            let graduatedEducationId;
                            // If req.body.graduatedEducationId
                            // != undefined and != empty
                            if (req.body.graduatedEducationId &&
                                req.body.graduatedEducationId.trim().length) {
                                let graduatedEducationIdText =
                                    req.body.graduatedEducationId.trim();

                                if (isNaN(graduatedEducationIdText)) {
                                    res.json({
                                        result: false,
                                        message: "Id trình độ học vấn phải là số"
                                    });
                                    return;
                                }

                                graduatedEducationId =
                                    Number(graduatedEducationIdText);
                                if (!Number.isInteger(graduatedEducationId)) {
                                    // graduatedEducationId is decimal number
                                    res.json({
                                        result: false,
                                        message: "Id trình độ học vấn phải là số nguyên."
                                    });
                                    return;
                                }

                                let checkIfLevelEducationIdExistsPromise = new Promise(
                                    function (myResolve, myReject) {
                                        let selectNumbersLevelEducationHaveThisIdSql =
                                            "select count(" +
                                            commonResources.LEVELS_OF_EDUCATION_COLUMN_ID + ") " +
                                            "as numbersOfLevelEducationHasThisId" + " " +
                                            "from " + commonResources.LEVELS_OF_EDUCATION_TABLE_NAME + " " +
                                            "where " + commonResources.LEVELS_OF_EDUCATION_COLUMN_ID + " = ?;";
                                        dbConnect.query(
                                            selectNumbersLevelEducationHaveThisIdSql,
                                            [graduatedEducationId],
                                            function (err, result) {
                                                if (err) {
                                                    res.json({
                                                        result: false,
                                                        message: "Lỗi truy vấn LevelsOfEducation",
                                                        err
                                                    });
                                                    throw err;
                                                } else {
                                                    myResolve(result);
                                                }
                                            }
                                        );
                                    }
                                );

                                let numbersLevelEducationIdExistsQueryResult =
                                    await checkIfLevelEducationIdExistsPromise;
                                // [
                                //      { numbersOfLevelEducationHasThisId: 1 }
                                // ]
                                let numbersLevelEducationIdExists =
                                    numbersLevelEducationIdExistsQueryResult[0]
                                        .numbersOfLevelEducationHasThisId;
                                if (numbersLevelEducationIdExists === 0) {
                                    res.json({
                                        result: false,
                                        message: "Id trình độ học vấn không tồn tại."
                                    });
                                    return;
                                }
                            }

                            // Type of work
                            let typeOfWorkId;
                            // If req.body.typeOfWorkId
                            // != undefined and != empty
                            if (req.body.typeOfWorkId &&
                                req.body.typeOfWorkId.trim().length) {
                                let typeOfWorkIdText = req.body.typeOfWorkId.trim();

                                if (isNaN(typeOfWorkIdText)) {
                                    res.json({
                                        result: false,
                                        message: "Id hình thức làm việc phải là số"
                                    });
                                    return;
                                }

                                typeOfWorkId = Number(typeOfWorkIdText);
                                if (!Number.isInteger(typeOfWorkId)) {
                                    // typeOfWorkId is decimal number
                                    res.json({
                                        result: false,
                                        message: "Id hình thức làm việc" +
                                            " phải là số nguyên."
                                    });
                                    return;
                                }

                                let checkIfTypeOfWorkIdExistsPromise = new Promise(
                                    function (myResolve, myReject) {
                                        let selectNumberTypeOfWorkHaveThisIdSql =
                                            "select count(" + commonResources.TYPES_OF_WORK_COLUMN_ID + ") " +
                                            "as numbersOfTypeOfWorkHaveThisId" + " " +
                                            "from " + commonResources.TYPES_OF_WORK_TABLE_NAME + " " +
                                            "where " + commonResources.TYPES_OF_WORK_COLUMN_ID + " = ?;";
                                        dbConnect.query(
                                            selectNumberTypeOfWorkHaveThisIdSql,
                                            [typeOfWorkId],
                                            function (err, result) {
                                                if (err) {
                                                    res.json({
                                                        result: false,
                                                        message: "Lỗi truy vấn TypesOfWork.",
                                                        err
                                                    });
                                                    throw err;
                                                } else {
                                                    myResolve(result);
                                                }
                                            }
                                        );
                                    }
                                );

                                let numberTypeOfWorkHaveThisIdQueryResult =
                                    await checkIfTypeOfWorkIdExistsPromise;
                                // [ { numbersOfTypeOfWorkHaveThisId: 1 } ]
                                let numberTypeOfWorkHaveThisId =
                                    numberTypeOfWorkHaveThisIdQueryResult[0]
                                        .numbersOfTypeOfWorkHaveThisId;
                                if (numberTypeOfWorkHaveThisId === 0) {
                                    res.json({
                                        resutl: false,
                                        message: "Id hình thức làm việc" +
                                            " không tồn tại."
                                    });
                                    return;
                                }
                            }

                            // Expected salary
                            let expectedSalaryInVnd;
                            // If req.body.expectedSalaryInMillionVnd != undefined
                            // and != empty
                            if (req.body.expectedSalaryInVnd &&
                                req.body.expectedSalaryInVnd.trim()) {
                                let expectedSalaryInVndText =
                                    req.body.expectedSalaryInVnd.trim();

                                if (isNaN(expectedSalaryInVndText)) {
                                    res.json({
                                        result: false,
                                        message: "Nhập mức lương mong muốn là số."
                                    });
                                    return;
                                }

                                let expectedSalaryInVndNumber =
                                    Number(expectedSalaryInVndText);
                                if (!Number.isInteger(expectedSalaryInVndNumber)) {
                                    res.json({
                                        result: false,
                                        message: "Nhập mức lương mong muốn là số nguyên"
                                    });
                                    return;
                                }

                                expectedSalaryInVnd = expectedSalaryInVndNumber;
                                if (expectedSalaryInVnd < 0) {
                                    res.json({
                                        result: false,
                                        message: "Nhập mức lương mong muốn " +
                                            "là số nguyên lớn hơn hoặc bằng 0."
                                    });
                                    return;
                                }
                            }

                            // Years of experiences
                            let yearsOfExperiences;
                            // If req.body.yearsOfExperience != undefined and != empty
                            if (req.body.yearsOfExperiences &&
                                req.body.yearsOfExperiences.trim()) {
                                let yearsOfExperiencesText =
                                    req.body.yearsOfExperiences.trim();

                                if (isNaN(yearsOfExperiencesText)) {
                                    res.json({
                                        result: false,
                                        message: "Nhập số năm kinh nghiệm là số."
                                    });
                                    return;
                                }

                                yearsOfExperiences =
                                    Number(yearsOfExperiencesText);
                                if (!Number.isInteger(yearsOfExperiences)) {
                                    res.json({
                                        result: false,
                                        message: "Nhập số năm kinh nghiệm là số nguyên."
                                    });
                                    return;
                                }

                                if (yearsOfExperiences < 0) {
                                    res.json({
                                        result: false,
                                        message: "Nhập số năm kinh nghiệm " +
                                            "là số nguyên lớn hơn hoặc bằng 0."
                                    });
                                    return;
                                }
                            }

                            // resumeSummary
                            let resumeSummary;
                            // If req.body.resumeSummary != undefined and != empty
                            // and != white space
                            if (req.body.resumeSummary &&
                                req.body.resumeSummary.trim()) {
                                resumeSummary = req.body.resumeSummary.trim();
                            }

                            // careerObjective
                            let careerObjective;
                            // If req.body.careerObjective != undefined and != empty
                            // and != white space
                            if (req.body.careerObjective &&
                                req.body.careerObjective.trim()) {
                                careerObjective = req.body.careerObjective.trim();
                            }

                            // Pass validate
                            // Upload file
                            let avatarUrl;
                            if (req.files) { // If file not empty, null
                                let avatar = req.files.avatar;
                                // avatar.name: Original name of upload file
                                const fileName = uniqid() + "-" + avatar.name;
                                // mv: move
                                await avatar.mv(`./uploads/users/${fileName}`);
                                // Save image url to database, not save file
                                avatarUrl =
                                    commonResources.PROTOCOL + "://"
                                    + commonResources.SERVER_HOST +
                                    "/users/" + fileName;
                            }

                            // Make SQL string to query update
                            let updateUsersSetSubStringSql =
                                "update "
                                + commonResources
                                    .USERS_TABLE_NAME +
                                " set ";
                            let fullNameKeyValueSubStringSql =
                                commonResources.USERS_COLUMN_FULL_NAME
                                + " = '" + fullName + "'";
                            let emailKeyValueSubStringSql =
                                commonResources.USERS_COLUMN_EMAIL + " = " +
                                "'" + email + "'";
                            let phoneKeyValueSubStringSql =
                                commonResources.USERS_COLUMN_PHONE + " = " +
                                "'" + phone + "'";

                            let genderIdKeyValueSubStringSql = "";
                            if (genderId === undefined) {
                                genderIdKeyValueSubStringSql =
                                    commonResources.USERS_COLUMN_GENDER_ID + " = null";
                            } else {
                                genderIdKeyValueSubStringSql =
                                    commonResources.USERS_COLUMN_GENDER_ID +
                                    " = " + genderId;
                            }

                            let birthdayMillisKeyValueSubStringSql = "";
                            if (birthdayMillis === undefined) {
                                birthdayMillisKeyValueSubStringSql =
                                    commonResources.USERS_COLUMN_DOB_MILLIS + " = null";
                            } else {
                                birthdayMillisKeyValueSubStringSql =
                                    commonResources.USERS_COLUMN_DOB_MILLIS + " = " +
                                    birthdayMillis;
                            }

                            let addressSubdistrictIdKeyValueSubStringSql = "";
                            if (addressSubdistrictIdText === undefined) {
                                addressSubdistrictIdKeyValueSubStringSql =
                                    commonResources
                                        .USERS_COLUMN_ADDRESS_SUBDISTRICT_ID
                                    + " = null";
                            } else {
                                addressSubdistrictIdKeyValueSubStringSql =
                                    commonResources
                                        .USERS_COLUMN_ADDRESS_SUBDISTRICT_ID
                                    + " = '" + addressSubdistrictIdText + "'";
                            }

                            let graduatedEducationIdKeyValueSubStringSql = "";
                            if (graduatedEducationId === undefined) {
                                graduatedEducationIdKeyValueSubStringSql =
                                    commonResources.USERS_COLUMN_GRADUATED_EDUCATION_ID +
                                    " = null";
                            } else {
                                graduatedEducationIdKeyValueSubStringSql =
                                    commonResources.USERS_COLUMN_GRADUATED_EDUCATION_ID +
                                    " = " + graduatedEducationId;
                            }

                            let typeOfWorkIdKeyValueSubStringSql = "";
                            if (typeOfWorkId === undefined) {
                                typeOfWorkIdKeyValueSubStringSql =
                                    commonResources.USERS_COLUMN_TYPE_OF_WORK_ID + " = null";
                            } else {
                                typeOfWorkIdKeyValueSubStringSql =
                                    commonResources.USERS_COLUMN_TYPE_OF_WORK_ID +
                                    " = " + typeOfWorkId;
                            }

                            let expectedSalaryInVndKeyValueSubStringSql =
                                !expectedSalaryInVnd ?
                                    (commonResources
                                            .USERS_COLUMN_EXPECTED_SALARY_VND
                                        + " = null") :
                                    (commonResources.USERS_COLUMN_EXPECTED_SALARY_VND
                                        + " = " + expectedSalaryInVnd);

                            let yearsOfExperiencesKeyValueSubStringSql =
                                !yearsOfExperiences ?
                                    (commonResources.USERS_COLUMN_YEARS_OF_EXPERIENCES
                                        + " = null") :
                                    (commonResources.USERS_COLUMN_YEARS_OF_EXPERIENCES
                                        + " = " + yearsOfExperiences);

                            let resumeSummaryKeyValueSubStringSql =
                                !resumeSummary ?
                                    (commonResources.USERS_COLUMN_RESUME_SUMMARY
                                        + " = null") :
                                    (commonResources.USERS_COLUMN_RESUME_SUMMARY
                                        + " = '" + resumeSummary + "'");

                            let careerObjectiveKeyValueSubStringSql =
                                !careerObjective ?
                                    (commonResources.USERS_COLUMN_CAREER_OBJECTIVE
                                        + " = null") :
                                    (commonResources.USERS_COLUMN_CAREER_OBJECTIVE
                                        + " = '" + careerObjective + "'");

                            // If user doesn't up new avatar file, don't delete old avatar
                            let avatarUrlKeyValueSubStringSql =
                                !avatarUrl ? "" :
                                    (", " + commonResources.USERS_COLUMN_AVATAR_URL
                                        + " = '" + avatarUrl + "'");

                            let updateUserSql =
                                updateUsersSetSubStringSql + " " +
                                fullNameKeyValueSubStringSql + ", " +
                                emailKeyValueSubStringSql + ", " +
                                phoneKeyValueSubStringSql + ", " +
                                genderIdKeyValueSubStringSql + ", " +
                                birthdayMillisKeyValueSubStringSql + ", " +
                                addressSubdistrictIdKeyValueSubStringSql + ", " +
                                graduatedEducationIdKeyValueSubStringSql + ", " +
                                typeOfWorkIdKeyValueSubStringSql + ", " +
                                expectedSalaryInVndKeyValueSubStringSql + ", " +
                                yearsOfExperiencesKeyValueSubStringSql + ", " +
                                resumeSummaryKeyValueSubStringSql + ", " +
                                careerObjectiveKeyValueSubStringSql + " " +
                                avatarUrlKeyValueSubStringSql + " " +
                                "where " + commonResources.USERS_COLUMN_ID + " = ?;";

                            dbConnect.query(
                                updateUserSql,
                                [userId], // Escaping value to avoid sql injection
                                function (err, result) {
                                    if (err) {
                                        res.json({
                                            result: false,
                                            message: "Có lỗi xảy ra khi lưu " +
                                                    "bản cập nhật " +
                                                    "thông tin người dùng",
                                            err
                                        });
                                        return;
                                    }

                                    res.json({
                                        result: true,
                                        message: "Update thành công " +
                                            result.affectedRows + " bản ghi."
                                    });
                                }
                            );
                        }
                    );
                }
            );
        }
    );
});

router.post('/users/change-password', (req, res) => {
    if (req.body.userId === undefined) {
        res.json({
            result: false,
            message: "Thiếu trường userId."
        });
        return;
    }

    let userIdText = req.body.userId.trim();
    if (userIdText.length === 0) {
        res.json({
            result: false,
            message: "Trường userId không được để trống."
        });
        return;
    }

    if (isNaN(userIdText)) {
        res.json({
            result: false,
            message: "Trường userId phải là số."
        });
        return;
    }

    let userIdNumber = Number(userIdText);
    if (!Number.isInteger(userIdNumber)) {
        res.json({
            result: false,
            message: "userId phải là số nguyên."
        });
        return;
    }

    let userId = userIdNumber;
    let selectUserByIdSql =
        "select " + commonResources.USERS_COLUMN_ID + " " +
        "from " + commonResources.USERS_TABLE_NAME + " " +
        "where " + commonResources.USERS_COLUMN_ID + " = ?";
    dbConnect.query(
        selectUserByIdSql,
        [userId],
        function (selectUserByIdErr, selectUserByIdResult) {
            if (selectUserByIdErr) {
                res.json({
                    result: false,
                    message: "Lỗi truy vấn id người dùng",
                    err: selectUserByIdErr
                });
                throw selectUserByIdErr;
            }

            if (selectUserByIdResult.length === 0) {
                // selectUserByIdResult is an array
                res.json({
                    result: false,
                    message: "ID người dùng không tồn tại"
                });
                return;
            }

            // userId exists
            // Validate other fields
            if (req.body.oldPassword === undefined) {
                res.json({
                    result: false,
                    message: "Thiếu trường oldPassword"
                });
                return;
            }

            let oldPasswordText = req.body.oldPassword.trim();
            if (oldPasswordText.length === 0) {
                res.json({
                    result: false,
                    message: "Mật khẩu cũ không được để trống."
                });
                return;
            }

            let selectPasswordByUserId =
                "select " + commonResources.USERS_COLUMN_PASSWORD + " " +
                "from " + commonResources.USERS_TABLE_NAME + " " +
                "where " + commonResources.USERS_COLUMN_ID + " = ?";
            dbConnect.query(
                selectPasswordByUserId,
                [userId],
                function (selectPasswordErr, selectPasswordQueryResult) {
                    if (selectPasswordErr) {
                        res.json({
                            result: false,
                            message: 'Lỗi truy vấn password',
                            selectPasswordErr
                        });
                        throw selectPasswordErr;
                    }
                    // [{"password":"000000"}]
                    let password = selectPasswordQueryResult[0].password;
                    // To compare two strings in JavaScript,
                    // use the localeCompare() method.
                    // The method returns 0 if both the strings
                    // are equal, -1 if string 1 is sorted before
                    // string 2 and 1 if string 2 is sorted before
                    // string 1.
                    if (oldPasswordText.localeCompare(password) !== 0) {
                        res.json({
                            result: false,
                            message: "Mật khẩu bạn đã nhập không chính xác."
                        });
                        return;
                    }

                    if (req.body.newPassword === undefined) {
                        res.json({
                            result: false,
                            message: "Thiếu trường newPassword."
                        });
                        return;
                    }

                    let newPasswordText = req.body.newPassword.trim();
                    if (newPasswordText.length === 0) {
                        res.json({
                            result: false,
                            message: "Mật khẩu mới không được để trống."
                        });
                        return;
                    }

                    if (newPasswordText.length < 6) {
                        res.json({
                            result: false,
                            message: "Nhập mật khẩu mới từ 6 ký tự trở lên."
                        });
                        return;
                    }

                    if (!newPasswordText.match(
                            commonResources.REGEX_PASSWORD)) {
                        res.json({
                            result: false,
                            message: commonResources
                                .ERR_MSG_PASSWORD_NOT_MATCH_PASSWORD_REGEX
                        });
                        return;
                    }

                    let updatePasswordByUserId =
                        "update " +
                        commonResources.USERS_TABLE_NAME + " " +
                        "set " +
                        commonResources.USERS_COLUMN_PASSWORD +
                        " = '" + newPasswordText + "'" +
                        "where " +
                        commonResources.USERS_COLUMN_ID + " = ?;";
                    dbConnect.query(
                        updatePasswordByUserId,
                        [userId], // Escaping value to avoid sql injection
                        function (updatePasswordErr, updatePasswordResult) {
                            if (updatePasswordErr) {
                                res.json({
                                    result: false,
                                    message: "Có lỗi xảy ra khi lưu mật khẩu mới",
                                    updatePasswordErr
                                });
                                throw updatePasswordErr;
                            } else {
                                res.json({
                                    result: true,
                                    message: "Đổi mật khẩu thành công."
                                });
                            }
                        }
                    );
                }
            );
        }
    );
});

router.get('/users', (req, res) => {
    let selectAllUsersSql =
        "select " +
            commonResources.USERS_TABLE_NAME + "." +
            commonResources.USERS_COLUMN_ID + ", " +

            commonResources.USERS_COLUMN_FULL_NAME + ", " +

            // Genders.name as gender
            commonResources.GENDERS_TABLE_NAME + "."
            + commonResources.GENDERS_COLUMN_NAME + " as " +
            commonResources.COLUMN_ALIAS_GENDER + ", " +

            commonResources.USERS_COLUMN_DOB_MILLIS + ", " +
            commonResources.USERS_COLUMN_AVATAR_URL + ", " +

            commonResources.LEVELS_OF_EDUCATION_COLUMN_NAME + ", " +
            commonResources.USERS_COLUMN_EXPECTED_SALARY_VND + " " +

        "from " +
            commonResources.USERS_TABLE_NAME + " " +

            "left join " +
            commonResources.GENDERS_TABLE_NAME + " on " +
            commonResources.GENDERS_TABLE_NAME + "." +
            commonResources.GENDERS_COLUMN_ID + " = " +
            commonResources.USERS_COLUMN_GENDER_ID + " " +

            "left join " +
            commonResources.LEVELS_OF_EDUCATION_TABLE_NAME + " on " +
            commonResources.USERS_TABLE_NAME + "." +
            commonResources.USERS_COLUMN_GRADUATED_EDUCATION_ID + " = " +
            commonResources.LEVELS_OF_EDUCATION_TABLE_NAME + "." +
            commonResources.LEVELS_OF_EDUCATION_COLUMN_ID + " " +

        "order by " +
        commonResources.USERS_TABLE_NAME + "." +
        commonResources.USERS_COLUMN_ID + " desc";

    dbConnect.query(
        selectAllUsersSql,
        async function (err, result) {
            if (err) {
                res.json({
                    result: false,
                    message: 'Lỗi truy vấn danh sách Users',
                    err
                });
            } else {
                let users = result;
                for (let i = 0; i < users.length; i++) {
                    let currentUserId = users[i].id;

                    // Get skill list
                    let getCurrentUserSkillsPromise = new Promise(
                        function (myResolve, myReject) {
                            let selectJobSkillsOfUserByUserIdSql =
                                "select " +
                                commonResources
                                    .JOB_SKILLS_OF_CANDIDATE_COLUMN_JOB_SKILLS_ID
                                + ", " +
                                commonResources.JOB_SKILLS_COLUMN_NAME + " " +

                                "from " +
                                commonResources.JOB_SKILLS_OF_CANDIDATE_TABLE_NAME
                                + ", " +
                                commonResources.JOB_SKILLS_TABLE_NAME + " " +
                                "where " +

                                commonResources.JOB_SKILLS_OF_CANDIDATE_TABLE_NAME
                                + "." +
                                commonResources
                                    .JOB_SKILLS_OF_CANDIDATE_COLUMN_JOB_SKILLS_ID
                                + " = " +
                                commonResources.JOB_SKILLS_TABLE_NAME
                                + "."
                                + commonResources.JOB_SKILLS_COLUMN_ID
                                + " " +

                                "and " +
                                commonResources
                                    .JOB_SKILLS_OF_CANDIDATE_COLUMN_USER_ID +
                                " = ?;";
                            dbConnect.query(
                                selectJobSkillsOfUserByUserIdSql,
                                [currentUserId],
                                function (selectSkillsErr, selectSkillsResult) {
                                    if (selectSkillsErr) {
                                        res.json({
                                            result: false,
                                            message: "Lỗi truy vấn JobSkills",
                                            err: selectSkillsErr
                                        });
                                        throw selectSkillsErr;
                                    } else {
                                        myResolve(selectSkillsResult);
                                    }
                                }
                            );
                        }
                    );

                    let currentUserJobSkillsResult =
                        await getCurrentUserSkillsPromise;
                    users[i].skills = currentUserJobSkillsResult;

                    // Get address
                    let getCurrentUserAddressPromise = new Promise(
                        function(myResolve, myReject) {
                            let selectAddressOfCurrentUserSql =
                                "select " +
                                commonResources.STATE_PROVINCES_TABLE_NAME + "." +
                                commonResources.STATE_PROVINCES_COLUMN_NAME + " as " +
                                commonResources.COLUMN_ALIAS_STATE_PROVINCE_NAME + ", " +

                                commonResources.DISTRICTS_TABLE_NAME + "." +
                                commonResources.DISTRICTS_COLUMN_NAME + " as " +
                                commonResources.COLUMN_ALIAS_DISTRICT_NAME + ", " +

                                commonResources.SUBDISTRICTS_TABLE_NAME + "." +
                                commonResources.SUBDISTRICTS_COLUMN_NAME + " as " +
                                commonResources.COLUMN_ALIAS_SUBDISTRICT_NAME + " " +
                                "from " +
                                commonResources.USERS_TABLE_NAME + " " +

                                "left join " +
                                commonResources.SUBDISTRICTS_TABLE_NAME + " " + "on " +
                                commonResources.USERS_COLUMN_ADDRESS_SUBDISTRICT_ID +
                                " = " + commonResources.SUBDISTRICTS_TABLE_NAME + "." +
                                commonResources.SUBDISTRICTS_COLUMN_ID + " " +

                                "left join " + commonResources.DISTRICTS_TABLE_NAME +
                                " on " + commonResources.SUBDISTRICTS_TABLE_NAME + "." +
                                commonResources.SUBDISTRICTS_COLUMN_DISTRICT_ID + " = " +
                                commonResources.DISTRICTS_TABLE_NAME + "." +
                                commonResources.DISTRICTS_COLUMN_ID + " " +

                                "left join " + commonResources.STATE_PROVINCES_TABLE_NAME +
                                " on " + commonResources.DISTRICTS_TABLE_NAME + "." +
                                commonResources.DISTRICTS_COLUMN_STATE_PROVINCE_ID +
                                " = " + commonResources.STATE_PROVINCES_TABLE_NAME +
                                "." + commonResources.STATE_PROVINCES_COLUMN_ID + " " +

                                "where " +
                                commonResources.USERS_COLUMN_ID + " = ?;";
                            dbConnect.query(
                                selectAddressOfCurrentUserSql,
                                [currentUserId],
                                function (selectAddressErr, selectAddressResult) {
                                    if (selectAddressErr) {
                                        console.trace(); // Print err stack trace
                                        res.json({
                                            result: false,
                                            message: "Lỗi truy vấn " +
                                                "địa chỉ người dùng.",
                                            err: selectAddressErr
                                        });
                                        throw selectAddressErr;
                                    } else {
                                        myResolve(selectAddressResult);
                                    }
                                }
                            );
                        }
                    );

                    let currentUserAddressQueryResult =
                        await getCurrentUserAddressPromise;
                //    [
                    //   {
                    //     stateProvinceName: null,
                    //     districtName: null,
                    //     subdistrictName: null
                    //   }
                    // ]
                    // or
                    // [
                    //    {
                    //     stateProvinceName: 'Thành phố Hà Nội',
                    //     districtName: 'Quận Cầu Giấy',
                    //     subdistrictName: 'Phường Quan Hoa'
                    //   }
                    // ]
                    if (currentUserAddressQueryResult[0].subdistrictName
                            === null) {
                        console.log(currentUserId + ", " + null);
                        users[i].addressText = null;
                    } else {
                        users[i].addressText =
                            currentUserAddressQueryResult[0]
                                .subdistrictName + " - " +
                            currentUserAddressQueryResult[0]
                                .districtName + " - " +
                            currentUserAddressQueryResult[0]
                                .stateProvinceName;
                    }
                }

                res.json({
                    result: true,
                    users
                });
            }
        }
    );
});

// Education info of user
/**
 * API read education info of one user.
 * Param: userId (int)
 */
router.post('/education', (req, res) => {
    if (req.body.userId === undefined) {
        res.json({
            result: false,
            message: "Thiếu trường userId."
        });
        return;
    }

    let userIdText = req.body.userId.trim();
    if (userIdText.length === 0) {
        res.json({
            result: false,
            message: "Trường userId không được để trống."
        });
        return;
    }

    if (isNaN(userIdText)) {
        res.json({
            result: false,
            message: "Trường userId phải là số."
        });
        return;
    }

    let userIdNumber = Number(userIdText);
    if (!Number.isInteger(userIdNumber)) {
        res.json({
            result: false,
            message: "userId phải là số nguyên."
        });
        return;
    }

    let userId = userIdNumber;
    let selectUserByIdSql =
        "select " + commonResources.USERS_COLUMN_ID + " " +
        "from " + commonResources.USERS_TABLE_NAME + " " +
        "where " + commonResources.USERS_COLUMN_ID + " = ?";
    dbConnect.query(
        selectUserByIdSql,
        [userId],
        function (selectUserByIdErr, selectUserByIdResult) {
            if (selectUserByIdErr) {
                res.json({
                    result: false,
                    message: "Lỗi truy vấn id người dùng",
                    err: selectUserByIdErr
                });
                throw selectUserByIdErr;
            }

            if (selectUserByIdResult.length === 0) {
                // selectUserByIdResult is an array
                res.json({
                    result: false,
                    message: "ID người dùng không tồn tại"
                });
                return;
            }

            let selectEducationByUserIdSql =
                "select " +
                    commonResources.EDUCATION_TABLE_NAME + "." +
                        commonResources.EDUCATION_COLUMN_ID + ", " +

                    commonResources.EDUCATION_COLUMN_SCHOOL_NAME + ", " +
                    commonResources.EDUCATION_COLUMN_MAJOR + ", " +

                    commonResources
                        .ACADEMIC_DEGREE_LEVELS_TABLE_NAME + "."
                    + commonResources
                        .ACADEMIC_DEGREE_LEVELS_COLUMN_NAME
                    + " as "
                    + commonResources
                        .COLUMN_ALIAS_ACADEMIC_DEGREE_LEVEL
                    + ", " +

                    commonResources
                        .EDUCATION_COLUMN_START_DATE_MILLIS + ", " +
                    commonResources
                        .EDUCATION_COLUMN_END_DATE_MILLIS + ", " +
                    commonResources.EDUCATION_COLUMN_ACHIEVEMENTS + " " +

                "from " +
                    commonResources.EDUCATION_TABLE_NAME + ", " +
                    commonResources
                        .ACADEMIC_DEGREE_LEVELS_TABLE_NAME + " " +
                "where " +
                    commonResources.EDUCATION_TABLE_NAME + "." +
                    commonResources
                        .EDUCATION_COLUMN_ACADEMIC_DEGREE_LEVEL_ID
                    + " = " +
                    commonResources
                        .ACADEMIC_DEGREE_LEVELS_TABLE_NAME + "." +
                    commonResources
                        .ACADEMIC_DEGREE_LEVELS_COLUMN_ID + " "

                    + "and " +
                    commonResources
                        .EDUCATION_COLUMN_USER_ID
                    + " = ? " +
                "order by " +
                    commonResources.EDUCATION_COLUMN_START_DATE_MILLIS
                    + " desc;";
            dbConnect.query(
                selectEducationByUserIdSql,
                [userId],
                function(selectEducationErr, selectEducationResult) {
                    if (selectEducationErr) {
                        res.json({
                            result: false,
                            message: 'Lỗi truy vấn Education',
                            selectEducationErr
                        });
                    } else {
                        res.json({
                            result: true,
                            data: {
                                userId,
                                education: selectEducationResult
                            }
                        });
                    }
                }
            );
        }
    );
});


router.post('/education/create', (req, res) => {
    // Validate
    if (req.body.userId === undefined) {
        res.json({
            result: false,
            message: "Thiếu trường userId."
        });
        return;
    }

    let userIdText = req.body.userId.trim();
    if (userIdText.length === 0) {
        res.json({
            result: false,
            message: "Trường userId không được để trống."
        });
        return;
    }

    if (isNaN(userIdText)) {
        res.json({
            result: false,
            message: "Trường userId phải là số."
        });
        return;
    }

    let userIdNumber = Number(userIdText);
    if (!Number.isInteger(userIdNumber)) {
        res.json({
            result: false,
            message: "userId phải là số nguyên."
        });
        return;
    }

    let userId = userIdNumber;
    let selectUserByIdSql =
        "select " + commonResources.USERS_COLUMN_ID + " " +
        "from " + commonResources.USERS_TABLE_NAME + " " +
        "where " + commonResources.USERS_COLUMN_ID + " = ?";
    dbConnect.query(
        selectUserByIdSql,
        [userId],
        function (selectUserByIdErr, selectUserByIdResult) {
            if (selectUserByIdErr) {
                res.json({
                    result: false,
                    message: "Lỗi truy vấn id người dùng",
                    err: selectUserByIdErr
                });
                return;
            }

            if (selectUserByIdResult.length === 0) {
                // selectUserByIdResult is an array
                res.json({
                    result: false,
                    message: "ID người dùng không tồn tại"
                });
                return;
            }

            // Pass validate userId, go to validate other fields
            // Validate major
            if (req.body.major === undefined) {
                res.json({
                    result: false,
                    message: "Thiếu trường major (chuyên ngành)."
                });
                return;
            }

            let majorText = req.body.major.trim();
            if (majorText.length === 0) {
                res.json({
                    result: false,
                    message: "Chuyên ngành không được để trống."
                });
                return;
            }

            // Validate schoolName
            if (req.body.schoolName === undefined) {
                res.json({
                    result: false,
                    message: "Thiếu trường schoolName."
                });
                return;
            }

            let schoolName = req.body.schoolName.trim();
            if (schoolName.length === 0) {
                res.json({
                    result: false,
                    message: "Tên trường học không được để trống."
                });
                return;
            }

            // Validate academicDegreeLevelId
            if (req.body.academicDegreeLevelId === undefined) {
                res.json({
                    result: false,
                    message: "Thiếu trường academicDegreeLevelId."
                });
                return;
            }

            let academicDegreeLevelIdText =
                    req.body.academicDegreeLevelId.trim();
            if (academicDegreeLevelIdText.length === 0) {
                res.json({
                    result: false,
                    message: "academicDegreeLevelId không được để trống."
                });
                return;
            }

            if (isNaN(academicDegreeLevelIdText)) {
                res.json({
                    result: false,
                    message: "academicDegreeLevelId phải là một số."
                });
                return;
            }

            let academicDegreeLevelIdNumber =
                    Number(academicDegreeLevelIdText);
            if (!Number.isInteger(academicDegreeLevelIdNumber)) {
                res.json({
                   result: false,
                   message: "academicDegreeLevelId phải là số nguyên."
                });
                return;
            }

            let academicDegreeLevelId = academicDegreeLevelIdNumber;
            academicDegreeLevelsModule.checkIfAcademicDegreeLevelIdExists(
                academicDegreeLevelId,
                function(isAcademicDegreeLevelIdExists) {
                    if (!isAcademicDegreeLevelIdExists) {
                        res.json({
                            result: false,
                            message: "academicDegreeLevelId " +
                                        "không tồn tại."
                        });
                        return;
                    }

                    // Pass validate academicDegreeLevelId.
                    // Go to validate other fields
                    // Validate startDateInMilliseconds
                    if (req.body.startDateInMilliseconds === undefined) {
                        res.json({
                           result: false,
                           message:  "Thiếu trường " +
                                        "startDateInMilliseconds."
                        });
                        return;
                    }

                    let startDateInMillisecondsText =
                            req.body.startDateInMilliseconds.trim();
                    if (startDateInMillisecondsText.length === 0) {
                        res.json({
                            result: false,
                            message: "startDateInMilliseconds " +
                                        "không được để trống"
                        });
                        return;
                    }

                    if (isNaN(startDateInMillisecondsText)) {
                        res.json({
                            result: false,
                            message: "startDateInMilliseconds phải là " +
                                        "một số."
                        });
                        return;
                    }

                    let startDateInMillisecondsNumber =
                            Number(startDateInMillisecondsText);
                    if (!Number.isInteger(startDateInMillisecondsNumber)) {
                        res.json({
                            result: false,
                            message: "startDateInMilliseconds " +
                                        "phải là số nguyên."
                        });
                        return;
                    }
                    let startDateInMilliseconds =
                                startDateInMillisecondsNumber;

                    // Validate endDateInMilliseconds
                    let endDateInMilliseconds;
                    if (req.body.endDateInMilliseconds &&
                        req.body.endDateInMilliseconds.trim()) {
                        let endDateInMillisecondsText =
                            req.body.endDateInMilliseconds.trim();

                        if (isNaN(endDateInMillisecondsText)) {
                            res.json({
                                result: false,
                                message: "endDateInMilliseconds " +
                                    "phải là một số."
                            });
                            return;
                        }

                        let endDateInMillisecondsNumber =
                            Number(endDateInMillisecondsText);
                        if (!Number.isInteger(
                                endDateInMillisecondsNumber)) {
                            res.json({
                                result: false,
                                message: "endDateInMilliseconds " +
                                            "phải là số nguyên."
                            });
                            return;
                        }

                        endDateInMilliseconds =
                                        endDateInMillisecondsNumber;
                        if (endDateInMilliseconds <
                                startDateInMilliseconds) {
                            res.json({
                               result: false,
                               message: "endDateInMilliseconds " +
                                        "phải lớn hơn " +
                                        "startDateInMilliseconds"
                            });
                            return;
                        }
                    }

                    // Validate achievements
                    let achievementsText;
                    // If req.body.achievements != undefined
                    // and != empty and != white space
                    if (req.body.achievements &&
                        req.body.achievements.trim()) {
                        achievementsText =
                            req.body.achievements.trim();
                    }

                    // Make SQL string to create record in database
                    let insertIntoEducationSubStringSql =
                        "insert into " +
                            commonResources.EDUCATION_TABLE_NAME + "(" +
                                commonResources
                                    .EDUCATION_COLUMN_USER_ID + ", " +
                                commonResources
                                    .EDUCATION_COLUMN_SCHOOL_NAME + ", " +
                                commonResources
                                    .EDUCATION_COLUMN_MAJOR + ", " +
                                commonResources
                                    .EDUCATION_COLUMN_ACADEMIC_DEGREE_LEVEL_ID
                                + ", " +
                                commonResources
                                    .EDUCATION_COLUMN_START_DATE_MILLIS
                                + ", " +
                                commonResources
                                    .EDUCATION_COLUMN_END_DATE_MILLIS
                                + ", " +
                                commonResources
                                    .EDUCATION_COLUMN_ACHIEVEMENTS +
                        ") " +
                        "values(" +
                            userId + ", " +
                            "'" + schoolName + "', " +
                            "'" + majorText + "', " +
                            academicDegreeLevelId + ", " +
                            startDateInMilliseconds + ", " +

                            (endDateInMilliseconds ?
                                    endDateInMilliseconds : "null")
                            + ", " +

                            (achievementsText ?
                                    "'" + achievementsText + "'" :
                                    "null")
                        + ");";

                    dbConnect.query(
                        insertIntoEducationSubStringSql,
                        function (createEduErr, createEduResult) {
                            if (createEduErr) {
                                res.json({
                                    result: false,
                                    message: "Thêm thông tin học vấn " +
                                             "thất bại."
                                });
                            } else {
                                res.json({
                                    result: true,
                                    message: "Thêm thông tin học vấn " +
                                            "thành công."
                                });
                            }
                        }
                    );
                }
            );
        }
    );
});

router.post('/education/update', (req, res) => {
    // Validate education id
    if (req.body.educationId === undefined) {
        res.json({
            result: false,
            message: "Thiếu trường educationId."
        });
        return;
    }

    let educationIdText = req.body.educationId.trim();
    if (educationIdText.length === 0) {
        res.json({
            result: false,
            message: "Trường educationId không được bỏ trống."
        });
        return;
    }

    if (isNaN(educationIdText)) {
        res.json({
            result: false,
            message: "educationId phải là số."
        });
        return;
    }

    let educationIdNumber = Number(educationIdText);
    if (!Number.isInteger(educationIdNumber)) {
        res.json({
            result: false,
            message: "educationId phải là số nguyên."
        });
        return;
    }

    let educationId = educationIdNumber;
    let selectEducationRecordById =
        "select " + commonResources.EDUCATION_COLUMN_ID + " " +
        "from " + commonResources.EDUCATION_TABLE_NAME + " " +
        "where " + commonResources.EDUCATION_COLUMN_ID + " = ?";
    dbConnect.query(
        selectEducationRecordById,
        [educationId],
        function(selectEduByIdErr, selectEduByIdResult) {
            if (selectEduByIdErr) {
                res.json({
                    result: false,
                    message: "Lỗi truy vấn id bản ghi học vấn.",
                    err: selectUserByIdErr
                });
                return;
            }

            if (selectEduByIdResult.length === 0) {
                // selectEduByIdResult is an array
                res.json({
                    result: false,
                    message: "educationId không tồn tại"
                });
                return;
            }

            // Pass validate education id, go to validate
            // other fields
            // Validate userId
            if (req.body.userId === undefined) {
                res.json({
                    result: false,
                    message: "Thiếu trường userId."
                });
                return;
            }

            let userIdText = req.body.userId.trim();
            if (userIdText.length === 0) {
                res.json({
                    result: false,
                    message: "Trường userId không được để trống."
                });
                return;
            }

            if (isNaN(userIdText)) {
                res.json({
                    result: false,
                    message: "Trường userId phải là số."
                });
                return;
            }

            let userIdNumber = Number(userIdText);
            if (!Number.isInteger(userIdNumber)) {
                res.json({
                    result: false,
                    message: "userId phải là số nguyên."
                });
                return;
            }

            let userId = userIdNumber;
            let selectUserByIdSql =
                "select " + commonResources.USERS_COLUMN_ID + " " +
                "from " + commonResources.USERS_TABLE_NAME + " " +
                "where " + commonResources.USERS_COLUMN_ID + " = ?";
            dbConnect.query(
                selectUserByIdSql,
                [userId],
                function (selectUserByIdErr, selectUserByIdResult) {
                    if (selectUserByIdErr) {
                        res.json({
                            result: false,
                            message: "Lỗi truy vấn id người dùng",
                            err: selectUserByIdErr
                        });
                        return;
                    }

                    if (selectUserByIdResult.length === 0) {
                        // selectUserByIdResult is an array
                        res.json({
                            result: false,
                            message: "ID người dùng không tồn tại"
                        });
                        return;
                    }

                    // Pass validate userId, go to validate other fields
                    // Validate major
                    if (req.body.major === undefined) {
                        res.json({
                            result: false,
                            message: "Thiếu trường major (chuyên ngành)."
                        });
                        return;
                    }

                    let majorText = req.body.major.trim();
                    if (majorText.length === 0) {
                        res.json({
                            result: false,
                            message: "Chuyên ngành không được để trống."
                        });
                        return;
                    }

                    // Validate schoolName
                    if (req.body.schoolName === undefined) {
                        res.json({
                            result: false,
                            message: "Thiếu trường schoolName."
                        });
                        return;
                    }

                    let schoolName = req.body.schoolName.trim();
                    if (schoolName.length === 0) {
                        res.json({
                            result: false,
                            message: "Tên trường học không được để trống."
                        });
                        return;
                    }

                    // Validate academicDegreeLevelId
                    if (req.body.academicDegreeLevelId === undefined) {
                        res.json({
                            result: false,
                            message: "Thiếu trường academicDegreeLevelId."
                        });
                        return;
                    }

                    let academicDegreeLevelIdText =
                        req.body.academicDegreeLevelId.trim();
                    if (academicDegreeLevelIdText.length === 0) {
                        res.json({
                            result: false,
                            message: "academicDegreeLevelId không được để trống."
                        });
                        return;
                    }

                    if (isNaN(academicDegreeLevelIdText)) {
                        res.json({
                            result: false,
                            message: "academicDegreeLevelId phải là một số."
                        });
                        return;
                    }

                    let academicDegreeLevelIdNumber =
                        Number(academicDegreeLevelIdText);
                    if (!Number.isInteger(academicDegreeLevelIdNumber)) {
                        res.json({
                            result: false,
                            message: "academicDegreeLevelId phải là số nguyên."
                        });
                        return;
                    }

                    let academicDegreeLevelId = academicDegreeLevelIdNumber;
                    academicDegreeLevelsModule.checkIfAcademicDegreeLevelIdExists(
                        academicDegreeLevelId,
                        function(isAcademicDegreeLevelIdExists) {
                            if (!isAcademicDegreeLevelIdExists) {
                                res.json({
                                    result: false,
                                    message: "academicDegreeLevelId " +
                                        "không tồn tại."
                                });
                                return;
                            }

                            // Pass validate academicDegreeLevelId.
                            // Go to validate other fields
                            // Validate startDateInMilliseconds
                            if (req.body.startDateInMilliseconds === undefined) {
                                res.json({
                                    result: false,
                                    message:  "Thiếu trường " +
                                        "startDateInMilliseconds."
                                });
                                return;
                            }

                            let startDateInMillisecondsText =
                                req.body.startDateInMilliseconds.trim();
                            if (startDateInMillisecondsText.length === 0) {
                                res.json({
                                    result: false,
                                    message: "startDateInMilliseconds " +
                                        "không được để trống"
                                });
                                return;
                            }

                            if (isNaN(startDateInMillisecondsText)) {
                                res.json({
                                    result: false,
                                    message: "startDateInMilliseconds phải là " +
                                        "một số."
                                });
                                return;
                            }

                            let startDateInMillisecondsNumber =
                                Number(startDateInMillisecondsText);
                            if (!Number.isInteger(startDateInMillisecondsNumber)) {
                                res.json({
                                    result: false,
                                    message: "startDateInMilliseconds " +
                                        "phải là số nguyên."
                                });
                                return;
                            }
                            let startDateInMilliseconds =
                                startDateInMillisecondsNumber;

                            // Validate endDateInMilliseconds
                            let endDateInMilliseconds;
                            if (req.body.endDateInMilliseconds &&
                                req.body.endDateInMilliseconds.trim()) {
                                let endDateInMillisecondsText =
                                    req.body.endDateInMilliseconds.trim();

                                if (isNaN(endDateInMillisecondsText)) {
                                    res.json({
                                        result: false,
                                        message: "endDateInMilliseconds " +
                                            "phải là một số."
                                    });
                                    return;
                                }

                                let endDateInMillisecondsNumber =
                                    Number(endDateInMillisecondsText);
                                if (!Number.isInteger(
                                    endDateInMillisecondsNumber)) {
                                    res.json({
                                        result: false,
                                        message: "endDateInMilliseconds " +
                                            "phải là số nguyên."
                                    });
                                    return;
                                }

                                endDateInMilliseconds =
                                    endDateInMillisecondsNumber;
                                if (endDateInMilliseconds <
                                    startDateInMilliseconds) {
                                    res.json({
                                        result: false,
                                        message: "endDateInMilliseconds " +
                                            "phải lớn hơn " +
                                            "startDateInMilliseconds"
                                    });
                                    return;
                                }
                            }

                            // Validate achievements
                            let achievementsText;
                            // If req.body.achievements != undefined
                            // and != empty and != white space
                            if (req.body.achievements &&
                                req.body.achievements.trim()) {
                                achievementsText =
                                    req.body.achievements.trim();
                            }

                            // Make SQL string to query update
                            let updateEducationSetSubStringSql =
                                "update " + commonResources
                                    .EDUCATION_TABLE_NAME + " set ";
                            let userIdKeyValueSubStringSql =
                                commonResources
                                    .EDUCATION_COLUMN_USER_ID + " = " +
                                    userId;
                            let majorKeyValueSubStringSql =
                                commonResources.EDUCATION_COLUMN_MAJOR +
                                " = '" + majorText + "'";
                            let schoolNameKeyValueSubStringSql =
                                commonResources
                                    .EDUCATION_COLUMN_SCHOOL_NAME
                                + " = '" + schoolName + "'";
                            let academicDegreeLevelIdKeyValueSubStringSql =
                                commonResources
                                    .EDUCATION_COLUMN_ACADEMIC_DEGREE_LEVEL_ID
                                + " = " + academicDegreeLevelId;
                            let startDateMillisKeyValueSubStringSql =
                                commonResources
                                    .EDUCATION_COLUMN_START_DATE_MILLIS
                                + " = " + startDateInMilliseconds;
                            let endDateMillisKeyValueSubStringSql =
                                commonResources
                                    .EDUCATION_COLUMN_END_DATE_MILLIS +
                                " = " +
                                (endDateInMilliseconds ?
                                    endDateInMilliseconds : "null");
                            let achievementsKeyValueSubStringSql =
                                commonResources.EDUCATION_COLUMN_ACHIEVEMENTS +
                                " = " +
                                    (
                                        achievementsText ?
                                        ("'" + achievementsText + "'")
                                        : "null"
                                    );

                            let updateEduSql =
                                updateEducationSetSubStringSql +
                                userIdKeyValueSubStringSql + ", " +
                                majorKeyValueSubStringSql + ", " +
                                schoolNameKeyValueSubStringSql + ", " +
                                academicDegreeLevelIdKeyValueSubStringSql
                                + ", " +
                                startDateMillisKeyValueSubStringSql
                                + ", " +
                                endDateMillisKeyValueSubStringSql + ", " +
                                achievementsKeyValueSubStringSql + " " +
                                "where " +
                                    commonResources.EDUCATION_COLUMN_ID
                                    + " = ?";
                            dbConnect.query(
                                updateEduSql,
                                [educationId], // Escaping value
                                            // to avoid sql injection
                                function (updateEduErr, updateEduResult) {
                                    if (updateEduErr) {
                                        res.json({
                                           result: false,
                                           message: "Có lỗi xảy ra " +
                                               "khi lưu."
                                        });
                                        throw updateEduErr;
                                    }
                                    res.json({
                                        result: true,
                                        message: "Update thành công " +
                                            updateEduResult.affectedRows
                                            + " bản ghi."
                                    });
                                }
                            );
                        }
                    );
                }
            );
        }
    );
});

router.post('/education/remove', (req, res) => {
    // Validate education id
    if (req.body.educationId === undefined) {
        res.json({
            result: false,
            message: "Thiếu trường educationId."
        });
        return;
    }

    let educationIdText = req.body.educationId.trim();
    if (educationIdText.length === 0) {
        res.json({
            result: false,
            message: "Trường educationId không được bỏ trống."
        });
        return;
    }

    if (isNaN(educationIdText)) {
        res.json({
            result: false,
            message: "educationId phải là số."
        });
        return;
    }

    let educationIdNumber = Number(educationIdText);
    if (!Number.isInteger(educationIdNumber)) {
        res.json({
            result: false,
            message: "educationId phải là số nguyên."
        });
        return;
    }

    let educationId = educationIdNumber;
    let selectEducationRecordById =
        "select " + commonResources.EDUCATION_COLUMN_ID + " " +
        "from " + commonResources.EDUCATION_TABLE_NAME + " " +
        "where " + commonResources.EDUCATION_COLUMN_ID + " = ?";
    dbConnect.query(
        selectEducationRecordById,
        [educationId],
        function (selectEduByIdErr, selectEduByIdResult) {
            if (selectEduByIdErr) {
                res.json({
                    result: false,
                    message: "Lỗi truy vấn id bản ghi học vấn.",
                    err: selectUserByIdErr
                });
                return;
            }

            if (selectEduByIdResult.length === 0) {
                // selectEduByIdResult is an array
                res.json({
                    result: false,
                    message: "educationId không tồn tại"
                });
                return;
            }

            let deleteEduRecordByIdSql =
                "delete from " +
                    commonResources.EDUCATION_TABLE_NAME + " " +
                "where " + commonResources.EDUCATION_COLUMN_ID +
                    " = ?;";
            dbConnect.query(
                deleteEduRecordByIdSql,
                [educationId],
                function(deleteEduErr, deleteEduResult) {
                    if (deleteEduErr) {
                        res.json({
                            result: false,
                            message: 'Có lỗi xảy ra khi xóa bản ghi.',
                            deleteEduErr
                        });
                        return;
                    }
                    res.json({
                        result: true,
                        message: "Đã xóa " +
                                deleteEduResult.affectedRows +
                                " bản ghi."
                    });
                }
            );
        }
    );
});

router.post('/experiences', (req, res) => {
    if (req.body.userId === undefined) {
        res.json({
            result: false,
            message: "Thiếu trường userId."
        });
        return;
    }

    let userIdText = req.body.userId.trim();
    if (userIdText.length === 0) {
        res.json({
            result: false,
            message: "Trường userId không được để trống."
        });
        return;
    }

    if (isNaN(userIdText)) {
        res.json({
            result: false,
            message: "Trường userId phải là số."
        });
        return;
    }

    let userIdNumber = Number(userIdText);
    if (!Number.isInteger(userIdNumber)) {
        res.json({
            result: false,
            message: "userId phải là số nguyên."
        });
        return;
    }

    let userId = userIdNumber;
    let selectUserByIdSql =
        "select " + commonResources.USERS_COLUMN_ID + " " +
        "from " + commonResources.USERS_TABLE_NAME + " " +
        "where " + commonResources.USERS_COLUMN_ID + " = ?";
    dbConnect.query(
        selectUserByIdSql,
        [userId],
        function (selectUserByIdErr, selectUserByIdResult) {
            if (selectUserByIdErr) {
                res.json({
                    result: false,
                    message: "Lỗi truy vấn id người dùng",
                    err: selectUserByIdErr
                });
                throw selectUserByIdErr;
            }

            if (selectUserByIdResult.length === 0) {
                // selectUserByIdResult is an array
                res.json({
                    result: false,
                    message: "ID người dùng không tồn tại"
                });
                return;
            }

            let selectExperiencesByUserIdSql =
                "select * " +
                "from " + commonResources.EXPERIENCES_TABLE_NAME + " " +
                "where " + commonResources.EXPERIENCES_COLUMN_USER_ID +
                    " = ? " +
                "order by " +
                    commonResources.EXPERIENCES_COLUMN_DATE_IN_MILLIS +
                    " desc;";
            dbConnect.query(
                selectExperiencesByUserIdSql,
                [userId], // Escaping value to avoid SQL injection
                function (selectExperiencesErr, selectExperiencesResult) {
                    if (selectExperiencesErr) {
                        res.json({
                            result: false,
                            message: 'Lỗi truy vấn Expriences',
                            selectExperiencesErr
                        });
                    } else {
                        res.json({
                           result: true,
                           experiences:  selectExperiencesResult
                        });
                    }
                }
            );

        }
    )
});

router.post('/experiences/create', (req, res) => {
    if (req.body.userId === undefined) {
        res.json({
            result: false,
            message: "Thiếu trường userId."
        });
        return;
    }

    let userIdText = req.body.userId.trim();
    if (userIdText.length === 0) {
        res.json({
            result: false,
            message: "Trường userId không được để trống."
        });
        return;
    }

    if (isNaN(userIdText)) {
        res.json({
            result: false,
            message: "Trường userId phải là số."
        });
        return;
    }

    let userIdNumber = Number(userIdText);
    if (!Number.isInteger(userIdNumber)) {
        res.json({
            result: false,
            message: "userId phải là số nguyên."
        });
        return;
    }

    let userId = userIdNumber;
    let selectUserByIdSql =
        "select " + commonResources.USERS_COLUMN_ID + " " +
        "from " + commonResources.USERS_TABLE_NAME + " " +
        "where " + commonResources.USERS_COLUMN_ID + " = ?";
    dbConnect.query(
        selectUserByIdSql,
        [userId],
        function (selectUserByIdErr, selectUserByIdResult) {
            if (selectUserByIdErr) {
                res.json({
                    result: false,
                    message: "Lỗi truy vấn id người dùng",
                    err: selectUserByIdErr
                });
                throw selectUserByIdErr;
            }

            if (selectUserByIdResult.length === 0) {
                // selectUserByIdResult is an array
                res.json({
                    result: false,
                    message: "ID người dùng không tồn tại"
                });
                return;
            }

            // Pass validate userId
            // Validate companyName
            if (req.body.companyName === undefined) {
                res.json({
                    result: false,
                    message: "Thiếu trường companyName."
                });
                return;
            }

            let companyName = req.body.companyName.trim();
            if (companyName.length === 0) {
                res.json({
                    result: false,
                    message: "Tên công ty không được để trống."
                });
                return;
            }

            // Validate jobTitle
            if (req.body.jobTitle === undefined) {
                res.json({
                    result: false,
                    message: "Thiếu trường jobTitle."
                });
                return;
            }

            let jobTitleText = req.body.jobTitle.trim();
            if (jobTitleText.length === 0) {
                res.json({
                    result: false,
                    message: "Chức danh công việc không được để trống."
                });
                return;
            }

            // Validate dateInMilliseconds
            if (req.body.dateInMilliseconds === undefined) {
                res.json({
                    result: false,
                    message: "Thiếu trường dateInMilliseconds."
                });
                return;
            }

            let dateInMillisecondsText =
                                    req.body.dateInMilliseconds.trim();
            if (dateInMillisecondsText.length === 0) {
                res.json({
                   result: false,
                    message: "Ngày bắt đầu công việc không được để trống."
                });
                return;
            }

            if (isNaN(dateInMillisecondsText)) {
                res.json({
                   result: false,
                   message: "dateInMilliseconds phải là một số."
                });
                return;
            }

            let dateInMillisecondsNumber =
                                    Number(dateInMillisecondsText);
            if (!Number.isInteger(dateInMillisecondsNumber)) {
                res.json({
                    result: false,
                    message: "dateInMilliseconds phải là số nguyên."
                });
                return;
            }

            // Validate dateOutMilliseconds
            let dateOutMilliseconds;
            if (req.body.dateOutMilliseconds &&
                req.body.dateOutMilliseconds.trim()) {
                // If dateOutMilliseconds is not undefined, empty, '  '
                let dateOutMillisecondsText =
                    req.body.dateOutMilliseconds.trim();

                if (isNaN(dateOutMillisecondsText)) {
                    res.json({
                        result: false,
                        message: "dateOutMilliseconds " +
                            "phải là một số."
                    });
                    return;
                }

                let dateOutMillisecondsNumber =
                    Number(dateOutMillisecondsText);
                if (!Number.isInteger(
                    dateOutMillisecondsNumber)) {
                    res.json({
                        result: false,
                        message: "dateOutMilliseconds " +
                            "phải là số nguyên."
                    });
                    return;
                }

                dateOutMilliseconds = dateOutMillisecondsNumber;
                if (dateOutMilliseconds < dateInMillisecondsNumber) {
                    res.json({
                        result: false,
                        message: "Ngày kết thúc công việc phải sau " +
                            "ngày bắt bắt đầu công việc."
                    });
                    return;
                }
            }

            // Validate jobDetails
            let jobDetailsText;
            if (req.body.jobDetails &&
                req.body.jobDetails.trim()) {
                // If jobDetails != undefined, empty, '   '
                jobDetailsText = req.body.jobDetails.trim();
            }

            let insertIntoExperiencesTableSql =
                "insert into " +
                    commonResources.EXPERIENCES_TABLE_NAME + " (" +
                        commonResources.EXPERIENCES_COLUMN_USER_ID + ", "
                        + commonResources.EXPERIENCES_COLUMN_COMPANY_NAME
                        + ", " +
                        commonResources.EXPERIENCES_COLUMN_JOB_TITLE
                        + ", " +
                        commonResources.EXPERIENCES_COLUMN_DATE_IN_MILLIS
                        + ", " +
                        commonResources.EXPERIENCES_COLUMN_DATE_OUT_MILLIS
                        + ", " +
                        commonResources.EXPERIENCES_COLUMN_JOB_DETAILS
                    + ") " +
                "values (" +
                    userId + ", " +
                    "'" + companyName + "', " +
                    "'" + jobTitleText + "', " +
                    dateInMillisecondsNumber + ", " +
                    (dateOutMilliseconds ?
                        dateOutMilliseconds : "null") + ", " +
                    (jobDetailsText ?
                        ("'" + jobDetailsText + "'") : "null") +
                ");";

            dbConnect.query(
                insertIntoExperiencesTableSql,
                function (createExperienceErr, createExperienceResult) {
                    if (createExperienceErr) {
                        res.json({
                            result: false,
                            message: "Thêm thông tin " +
                                    "kinh nghiệm làm việc " +
                                    "thất bại.",
                            err: createExperienceErr
                        });
                    } else {
                        res.json({
                            result: true,
                            message: "Thêm thông tin " +
                                    "kinh nghiệm làm việc " +
                                    "thành công.",
                        });
                    }
                }
            );
        }
    );
});

router.post('/experiences/update', (req, res) => {
   if (req.body.experienceId === undefined) {
       res.json({
           result: false,
           message: "Thiếu trường experienceId."
       });
       return;
   }

   let experienceIdText = req.body.experienceId.trim();
   if (experienceIdText.length === 0) {
       res.json({
           result: false,
           message: "experienceId không được để trống."
       });
       return;
   }

   if (isNaN(experienceIdText)) {
       res.json({
          result: false,
          message: "experienceId phải là một số."
       });
       return;
   }

   let experienceIdNumber = Number(experienceIdText);
   if (!Number.isInteger(experienceIdNumber)) {
       res.json({
          result: false,
          message: "experienceId phải là số nguyên."
       });
       return;
   }

   let experienceId = experienceIdNumber;
   let selectExperienceRecordByIdSql =
       "select count(" + commonResources.EXPERIENCES_COLUMN_ID + ") " +
            "as numberOfExperienceRecordsHaveThisId " +
       "from " + commonResources.EXPERIENCES_TABLE_NAME + " " +
       "where " + commonResources.EXPERIENCES_COLUMN_ID + " = ?";
   dbConnect.query(
       selectExperienceRecordByIdSql,
       [experienceId],
       function(selectExperienceErr, selectExperienceResult) {
           if (selectExperienceErr) {
               res.json({
                  result: false,
                  message: "Tìm bản ghi lỗi.",
                  err: selectExperienceErr
               });
               return;
           }

           // [{"numberOfExperienceRecordsHaveThisId":0}]
           let numberOfExperienceRecordsHaveThisId =
               selectExperienceResult[0]
                   .numberOfExperienceRecordsHaveThisId;
           if (numberOfExperienceRecordsHaveThisId === 0) {
               res.json({
                   result: false,
                   message: "experienceId không tồn tại."
               });
               return;
           }

           // Pass validate experienceId, go to validate other fields
           // Validate userId
           if (req.body.userId === undefined) {
               res.json({
                   result: false,
                   message: "Thiếu trường userId."
               });
               return;
           }

           let userIdText = req.body.userId.trim();
           if (userIdText.length === 0) {
               res.json({
                   result: false,
                   message: "Trường userId không được để trống."
               });
               return;
           }

           if (isNaN(userIdText)) {
               res.json({
                   result: false,
                   message: "Trường userId phải là số."
               });
               return;
           }

           let userIdNumber = Number(userIdText);
           if (!Number.isInteger(userIdNumber)) {
               res.json({
                   result: false,
                   message: "userId phải là số nguyên."
               });
               return;
           }

           let userId = userIdNumber;
           userModule.checkIfUserIdExists(
               userId,
               function(isUserIdExists) {
                   if (!isUserIdExists) {
                       res.json({
                           result: false,
                           message: "userId không tồn tại."
                       });
                       return;
                   }

                   // Pass validate userId, go to validate other fields
                   // Validate companyName
                   if (req.body.companyName === undefined) {
                       res.json({
                           result: false,
                           message: "Thiếu trường companyName."
                       });
                       return;
                   }

                   let companyName = req.body.companyName.trim();
                   if (companyName.length === 0) {
                       res.json({
                           result: false,
                           message: "Tên công ty không được để trống."
                       });
                       return;
                   }

                   // Validate jobTitle
                   if (req.body.jobTitle === undefined) {
                       res.json({
                           result: false,
                           message: "Thiếu trường jobTitle."
                       });
                       return;
                   }

                   let jobTitleText = req.body.jobTitle.trim();
                   if (jobTitleText.length === 0) {
                       res.json({
                           result: false,
                           message: "Chức danh công việc không được để trống."
                       });
                       return;
                   }

                   // Validate dateInMilliseconds
                   if (req.body.dateInMilliseconds === undefined) {
                       res.json({
                           result: false,
                           message: "Thiếu trường dateInMilliseconds."
                       });
                       return;
                   }

                   let dateInMillisecondsText =
                       req.body.dateInMilliseconds.trim();
                   if (dateInMillisecondsText.length === 0) {
                       res.json({
                           result: false,
                           message: "Ngày bắt đầu công việc không được để trống."
                       });
                       return;
                   }

                   if (isNaN(dateInMillisecondsText)) {
                       res.json({
                           result: false,
                           message: "dateInMilliseconds phải là một số."
                       });
                       return;
                   }

                   let dateInMillisecondsNumber =
                       Number(dateInMillisecondsText);
                   if (!Number.isInteger(dateInMillisecondsNumber)) {
                       res.json({
                           result: false,
                           message: "dateInMilliseconds phải là số nguyên."
                       });
                       return;
                   }

                   // Validate dateOutMilliseconds
                   let dateOutMilliseconds;
                   if (req.body.dateOutMilliseconds &&
                       req.body.dateOutMilliseconds.trim()) {
                       // If dateOutMilliseconds is not undefined, empty, '  '
                       let dateOutMillisecondsText =
                           req.body.dateOutMilliseconds.trim();

                       if (isNaN(dateOutMillisecondsText)) {
                           res.json({
                               result: false,
                               message: "dateOutMilliseconds " +
                                   "phải là một số."
                           });
                           return;
                       }

                       let dateOutMillisecondsNumber =
                           Number(dateOutMillisecondsText);
                       if (!Number.isInteger(
                           dateOutMillisecondsNumber)) {
                           res.json({
                               result: false,
                               message: "dateOutMilliseconds " +
                                   "phải là số nguyên."
                           });
                           return;
                       }

                       dateOutMilliseconds = dateOutMillisecondsNumber;
                       if (dateOutMilliseconds < dateInMillisecondsNumber) {
                           res.json({
                               result: false,
                               message: "Ngày kết thúc công việc phải sau " +
                                   "ngày bắt bắt đầu công việc."
                           });
                           return;
                       }
                   }

                   // Validate jobDetails
                   let jobDetailsText;
                   if (req.body.jobDetails &&
                       req.body.jobDetails.trim()) {
                       // If jobDetails != undefined, empty, '   '
                       jobDetailsText = req.body.jobDetails.trim();
                   }

                   // Make SQL string to query update
                   let updateExperiencesSetSubStringSql =
                        "update " +
                            commonResources.EXPERIENCES_TABLE_NAME +
                            " set ";
                   let userIdKeyValueSubStringSql =
                       commonResources.EXPERIENCES_COLUMN_USER_ID +
                       " = " + userId;
                   let companyNameKeyValueSubStringSql =
                       commonResources.EXPERIENCES_COLUMN_COMPANY_NAME
                        + " = '" + companyName + "'";
                   let jobTitleKeyValueSubStringSql =
                       commonResources.EXPERIENCES_COLUMN_JOB_TITLE
                        + " = '" + jobTitleText + "'";
                   let dateInMillisKeyValueSubStringSql =
                       commonResources.EXPERIENCES_COLUMN_DATE_IN_MILLIS
                        + " = " + dateInMillisecondsNumber;
                   let dateOutMillisKeyValueSubStringSql =
                       commonResources.EXPERIENCES_COLUMN_DATE_OUT_MILLIS
                        + " = " +
                       (dateOutMilliseconds ?
                       dateOutMilliseconds : "null");
                   let jobDetailsKeyValueSubStringSql =
                        commonResources.EXPERIENCES_COLUMN_JOB_DETAILS
                         + " = " +
                       (jobDetailsText ?
                           ("'" + jobDetailsText + "'") : "null");

                   let updateExperienceTotalSql =
                       updateExperiencesSetSubStringSql +
                       userIdKeyValueSubStringSql + ", " +
                       companyNameKeyValueSubStringSql + ", " +
                       jobTitleKeyValueSubStringSql + ", " +
                       dateInMillisKeyValueSubStringSql + ", " +
                       dateOutMillisKeyValueSubStringSql + ", " +
                       jobDetailsKeyValueSubStringSql + " " +
                       "where " + commonResources.EXPERIENCES_COLUMN_ID
                            + " = ?";
                   dbConnect.query(
                       updateExperienceTotalSql,
                       [experienceId],
                       function(updateExperienceErr, updateExperienceResult) {
                           if (updateExperienceErr) {
                               res.json({
                                   result: false,
                                   message: "Có lỗi xảy ra khi cập nhật.",
                                   err: updateExperienceErr
                               });
                           } else {
                               res.json({
                                   result: true,
                                   message: "Cập nhật thành công " +
                                            updateExperienceResult
                                                .affectedRows +
                                            " bản ghi."
                               });
                           }
                       }
                   );
               }
           );
       }
   );
});

router.post('/experiences/remove', (req, res) => {
    if (req.body.experienceId === undefined) {
        res.json({
            result: false,
            message: "Thiếu trường experienceId."
        });
        return;
    }

    let experienceIdText = req.body.experienceId.trim();
    if (experienceIdText.length === 0) {
        res.json({
            result: false,
            message: "experienceId không được để trống."
        });
        return;
    }

    if (isNaN(experienceIdText)) {
        res.json({
            result: false,
            message: "experienceId phải là một số."
        });
        return;
    }

    let experienceIdNumber = Number(experienceIdText);
    if (!Number.isInteger(experienceIdNumber)) {
        res.json({
            result: false,
            message: "experienceId phải là số nguyên."
        });
        return;
    }

    let experienceId = experienceIdNumber;
    let selectExperienceRecordByIdSql =
        "select count(" + commonResources.EXPERIENCES_COLUMN_ID + ") " +
        "as numberOfExperienceRecordsHaveThisId " +
        "from " + commonResources.EXPERIENCES_TABLE_NAME + " " +
        "where " + commonResources.EXPERIENCES_COLUMN_ID + " = ?";
    dbConnect.query(
        selectExperienceRecordByIdSql,
        [experienceId],
        function (selectExperienceErr, selectExperienceResult) {
            if (selectExperienceErr) {
                res.json({
                    result: false,
                    message: "Tìm bản ghi lỗi.",
                    err: selectExperienceErr
                });
                return;
            }

            // [{"numberOfExperienceRecordsHaveThisId":0}]
            let numberOfExperienceRecordsHaveThisId =
                selectExperienceResult[0]
                    .numberOfExperienceRecordsHaveThisId;
            if (numberOfExperienceRecordsHaveThisId === 0) {
                res.json({
                    result: false,
                    message: "experienceId không tồn tại."
                });
                return;
            }

            let deleteExperienceSql =
                "delete from " +
                    commonResources.EXPERIENCES_TABLE_NAME + " " +
                "where " + commonResources.EXPERIENCES_COLUMN_ID + " = ?";
            dbConnect.query(
                deleteExperienceSql,
                [experienceId],
                function(deleteExperienceErr, deleteExperienceResult) {
                    if (deleteExperienceErr) {
                        res.json({
                            result: false,
                            message: 'Có lỗi xảy ra khi xóa bản ghi.',
                            err: deleteExperienceErr
                        });
                        return;
                    }
                    res.json({
                        result: true,
                        message: "Đã xóa " +
                            deleteExperienceResult.affectedRows +
                            " bản ghi."
                    });
                }
            );
        }
    );
});

// JobNewsStatus
router.get('/job-news-status', (req, res) => {
    let selectAllJobNewsStatusSql =
        "select * from " + commonResources.JOB_NEWS_STATUS_TABLE_NAME + ";";
    dbConnect.query(
        selectAllJobNewsStatusSql,
        function (err, result) {
            if (err) {
                res.json({
                    result: false,
                    message: "Có lỗi xảy ra khi truy vấn JobNewsStatus.",
                    err
                });
                return;
            }

            let jobNewsStatus = result;
            res.json({
                result: true,
                jobNewsStatus
            });
        }
    );
});

// StateProvinces
router.get('/states-provinces', (req, res) => {
   let getStatesProvincesListSql =
        "select " +
            commonResources.STATE_PROVINCES_COLUMN_ID + ", " +
            commonResources.STATE_PROVINCES_COLUMN_NAME + " " +
       "from " + commonResources.STATE_PROVINCES_TABLE_NAME + " " +
       "order by " + commonResources.STATE_PROVINCES_COLUMN_NAME + ";";
   dbConnect.query(
       getStatesProvincesListSql, function (err, result) {
            if (err) {
                res.json({
                    result: false,
                    message: "Có lỗi xảy ra khi truy vấn tỉnh/thành phố.",
                    err
                });
                return;
            }
            res.json({
                result: true,
                stateProvinces: result
            });
       }
   );
});

// Districts
router.post('/districts/get-districts-by-state-province-id', (req, res) => {
    if (req.body.stateProvinceId === undefined) {
        res.json({
            result: false,
            message: "Thiếu trường stateProvinceId."
        });
        return;
    }

    let stateProvinceIdText = req.body.stateProvinceId.trim();
    if (stateProvinceIdText.length === 0) {
        res.json({
            result: false,
            message: "Trường stateProvinceId không được để trống."
        });
        return;
    }

    statesProvincesModule.checkIfStateProvinceIdExists(
        stateProvinceIdText,
        function(
            checkIfStateProvinceIdExistsErr,
            isStateProvinceIdExist) {
            if (checkIfStateProvinceIdExistsErr) {
                res.json({
                    result: false,
                    message: "Có lỗi xảy ra " +
                        "khi truy vấn stateProvinceId.",
                    err: checkIfStateProvinceIdExistsErr
                });
                return;
            }

            if (isStateProvinceIdExist === false) {
                res.json({
                    result: false,
                    message: "stateProvinceId không tồn tại."
                });
                return;
            }

            let getDistrictsByStateProvinceIdSql =
                "select " +
                    commonResources.DISTRICTS_COLUMN_ID + ", " +
                    commonResources.DISTRICTS_COLUMN_NAME + ", " +
                    commonResources.DISTRICTS_COLUMN_STATE_PROVINCE_ID
                    + " " +
                "from " +
                    commonResources.DISTRICTS_TABLE_NAME + " " +
                "where " +
                    commonResources
                        .DISTRICTS_COLUMN_STATE_PROVINCE_ID
                    + " = ? " +
                "order by " +
                    commonResources.DISTRICTS_COLUMN_NAME + ";";

            dbConnect.query(
                getDistrictsByStateProvinceIdSql,
                [stateProvinceIdText],
                function (err, result) {
                    if (err) {
                        res.json({
                            result: false,
                            message: "Có lỗi xảy ra khi truy vấn quận/huyện.",
                            err
                        });
                        return;
                    }

                    res.json({
                        result: true,
                        districts: result
                    });
                }
            );
        }
    );
});

// Subdistricts
router.post('/subdistricts/get-subdistricts-by-district-id', (req, res) => {
   if (req.body.districtId === undefined) {
       res.json({
           result: false,
           message: "Thiếu trường districtId."
       });
       return;
   }

   let districtIdText = req.body.districtId.trim();
   if (districtIdText.length === 0) {
       res.json({
           result: false,
           message: "districtId không được để trống."
       });
       return;
   }

   districtsModule.checkIfDistrictIdExists(
       districtIdText,
       function(checkDistrictIdExistsErr, isDistrictIdExist) {
           if (checkDistrictIdExistsErr) {
               res.json({
                   result: false,
                   message: "Có lỗi xảy ra khi truy vấn districtId.",
                   err: checkDistrictIdExistsErr
               });
               return;
           }

           if (isDistrictIdExist === false) {
               res.json({
                   result: false,
                   message: "districtId không tồn tại."
               });
               return;
           }

           let getSubdistrictByDistrictIdSql =
               "select " +
                    commonResources.SUBDISTRICTS_COLUMN_ID
                    + ", " +
                    commonResources.SUBDISTRICTS_COLUMN_NAME + ", " +
                    commonResources.SUBDISTRICTS_COLUMN_DISTRICT_ID
                    + " " +
               "from " +
                    commonResources.SUBDISTRICTS_TABLE_NAME + " " +
               "where " +
                    commonResources.SUBDISTRICTS_COLUMN_DISTRICT_ID
                    + " = ? " +
               "order by " +
                    commonResources.SUBDISTRICTS_COLUMN_NAME + ";";
           dbConnect.query(
               getSubdistrictByDistrictIdSql,
               [districtIdText],
               function(err, result) {
                   if (err) {
                       res.json({
                           result: false,
                           message: "Có lỗi xảy ra " +
                                        "khi truy vấn xã/phường.",
                           err
                       });
                       return;
                   }

                   res.json({
                      result: true,
                      subdistricts: result
                   });
               }
           );
       }
   );
});

// JobSkills
router.get('/job-skills', (req, res) => {
    let selectAllJobSkillsSql =
        "select * " +
        "from " + commonResources.JOB_SKILLS_TABLE_NAME + " " +
        "order by " + commonResources.JOB_SKILLS_COLUMN_ID + ";";
    dbConnect.query(
        selectAllJobSkillsSql,
        function(err, result) {
            if (err) {
                res.json({
                    result: false,
                    message: "Có lỗi xảy ra khi truy vấn JobSkills.",
                    err
                });
            }
            let jobSkills = result;
            res.json({
                result: true,
                jobSkills
            });
        }
    );
});

// JobSkillsOfCandidate
router.post('/job-skills-of-candidate/set-user-job-skills', (req, res) => {
    // Parse json from requestDataJsonString field
    if (req.body.requestDataJsonString === undefined) {
        res.json({
            result: false,
            message: "Thiếu trường requestDataJsonString."
        });
        return;
    }

    let requestDataJsonString = req.body.requestDataJsonString.trim();
    if (requestDataJsonString.length === 0) {
        res.json({
            result: false,
            message: "requestDataJsonString không được để trống."
        });
        return;
    }

    try {
        JSON.parse(requestDataJsonString);
    } catch (parseJsonErr) {
        res.json({
            result: false,
            message: "Giá trị trường requestDataJsonString" +
                    " phải là một chuỗi JSON."
        });
        return;
    }

    let requestDataJsObj = JSON.parse(requestDataJsonString);

    // Handle data in JSON string
    if (requestDataJsObj.userId === undefined) {
        res.json({
            result: false,
            message: "Thiếu trường userId " +
                "trong chuỗi JSON của trường requestDataJsObj."
        });
        return;
    }

    let userIdText = requestDataJsObj.userId.trim();
    if (userIdText.length === 0) {
        res.json({
            result: false,
            message: "Trường userId không được để trống."
        });
        return;
    }

    if (isNaN(userIdText)) {
        res.json({
            result: false,
            message: "Trường userId phải là số."
        });
        return;
    }

    let userIdNumber = Number(userIdText);
    if (!Number.isInteger(userIdNumber)) {
        res.json({
            result: false,
            message: "userId phải là số nguyên."
        });
        return;
    }

    let userId = userIdNumber;
    userModule.checkIfUserIdExists(
        userId,
        async function (isUserIdExists) {
            if (!isUserIdExists) {
                res.json({
                    result: false,
                    message: "userId không tồn tại."
                });
                return;
            }
            // Pass validate userId
            // Validate jobSkillIdArr
            if (requestDataJsObj.jobSkillIdArr === undefined) {
                res.json({
                    result: false,
                    message: "Thiếu trường jobSkillIdArr " +
                        "trong chuỗi JSON của trường requestDataJsObj."
                });
                return;
            }

            if (!Array.isArray(requestDataJsObj.jobSkillIdArr)) {
                res.send({
                    result: false,
                    message: "Giá trị của trường jobSkillIdArr " +
                        "(trong chuỗi JSON của trường requestDataJsObj) " +
                        "phải là một mảng."
                });
                return;
            }

            // If skill array empty -> delete all skill records
            if (requestDataJsObj.jobSkillIdArr.length === 0) {
                jobSkillsOfCandidateModule.deleteAllJobSkillDataOfOneUser(
                    userId,
                    function(deleteJobSkillOfThisUserErr) {
                        if (deleteJobSkillOfThisUserErr) {
                            res.json({
                                result: false,
                                message: "Xóa thông tin " +
                                    "kỹ năng chuyên môn lỗi." ,
                                err: deleteJobSkillOfThisUserErr
                            });
                            throw deleteJobSkillOfThisUserErr;
                        }
                    }
                );
                res.json({
                    result: true,
                    message: "Cập nhật thông tin " +
                        "kỹ năng chuyên môn thành công."
                });
                return;
            }

            // There is only 1 element in skill array
            if (requestDataJsObj.jobSkillIdArr.length === 1) {
                if (typeof(requestDataJsObj.jobSkillIdArr[0]) !== 'number') {
                    res.json({
                        result: false,
                        message: "Phần tử của mảng jobSkillIdArr" +
                            " phải là một số."
                    });
                    return;
                }

                let jobSkillIdNumber =
                        Number(
                            requestDataJsObj.jobSkillIdArr[0]
                        );
                if (!Number.isInteger(jobSkillIdNumber)) {
                    res.json({
                        result: false,
                        message: "Phần tử của mảng jobSkillIdArr" +
                            " phải là số nguyên."
                    });
                    return;
                }

                jobSkillsModule.checkIfJobSkillIdExists(
                    jobSkillIdNumber,
                    function(checkJobSkillIdEErr, isJobSkillIdExist) {
                        if (checkJobSkillIdEErr) {
                            res.json({
                                result: false,
                                message: "Có lỗi xảy ra khi truy vấn " +
                                    "id JobSkills.",
                                err: checkJobSkillIdEErr
                            });
                            return;
                        }

                        if (isJobSkillIdExist === false) {
                            res.json({
                                result: false,
                                message: "ID JobSkills không tồn tại."
                            });
                            return;
                        }

                        // Delete previous data
                        // then add new data
                        jobSkillsOfCandidateModule.deleteAllJobSkillDataOfOneUser(
                            userId,
                            function(deleteJobSkillOfThisUserErr) {
                                if (deleteJobSkillOfThisUserErr) {
                                    res.json({
                                        result: false,
                                        message: "Xóa thông tin " +
                                            "kỹ năng chuyên môn lỗi." ,
                                        err: deleteJobSkillOfThisUserErr
                                    });
                                    throw deleteJobSkillOfThisUserErr;
                                }
                            }
                        );
                        let addJobSkillForUserSql =
                            "insert into " +
                            commonResources
                                .JOB_SKILLS_OF_CANDIDATE_TABLE_NAME
                            + "(" +
                            commonResources
                                .JOB_SKILLS_OF_CANDIDATE_COLUMN_USER_ID
                            + ", " +
                            commonResources.JOB_SKILLS_OF_CANDIDATE_COLUMN_JOB_SKILLS_ID
                            + ") " +
                            "values(" +
                            userId + ", " + jobSkillIdNumber
                            + ");";

                        dbConnect.query(
                            addJobSkillForUserSql,
                            function (err, result) {
                                if (err) {
                                    res.json({
                                        result: false,
                                        message: "Có lỗi xảy ra " +
                                            "khi thêm bản ghi.",
                                        err
                                    });
                                    return;
                                }

                                res.json({
                                    resutl: true,
                                    message: "Cập nhật kỹ năng " +
                                        "chuyên môn thành công."
                                });
                            }
                        );
                    }
                );
                return;
            }

            // There are more than 1 element in skill array
            // If one of element's value is not integer nor
            // exist, return error message.
            for (let i = 0;
                 i < requestDataJsObj.jobSkillIdArr.length;
                 i++) {
                if (typeof(requestDataJsObj.jobSkillIdArr[i])
                    !== 'number') {
                    res.json({
                        result: false,
                        message: "Gía trị "
                            + requestDataJsObj.jobSkillIdArr[i] +
                                " không hợp lệ. Phần tử của mảng " +
                            "jobSkillIdArr phải có kiểu giá trị là số."
                    });
                    return;
                }

                let jobSkillIdNumber =
                    Number(
                        requestDataJsObj.jobSkillIdArr[i]
                    );
                if (!Number.isInteger(jobSkillIdNumber)) {
                    res.json({
                        result: false,
                        message: "Giá trị " + jobSkillIdNumber +
                            " không hợp lệ. " +
                            "Phần tử của mảng " +
                            "jobSkillIdArr phải là số nguyên."
                    });
                    return;
                }

                let checkIfJobSkillIdExistsPromise = new Promise(
                    function (myResolve, myReject) {
                        let selectNumberOfJobSkillRecordsHaveThisIdSql =
                            "select count(" +
                            commonResources.JOB_SKILLS_COLUMN_ID + ") " +
                            "as numberOfJobSkillsHaveThisId " +
                            "from " + commonResources.JOB_SKILLS_TABLE_NAME + " " +
                            "where " + commonResources.JOB_SKILLS_COLUMN_ID + " = ?;";
                        dbConnect.query(
                            selectNumberOfJobSkillRecordsHaveThisIdSql,
                            [jobSkillIdNumber],
                            function(checkJobSkillIdErr, checkJobSkillIdResult) {
                                if (checkJobSkillIdErr) {
                                    res.json({
                                        result: false,
                                        message: "Lỗi truy vấn JobSkills",
                                        err: checkJobSkillIdErr
                                    });
                                    throw checkJobSkillIdErr;
                                } else {
                                    myResolve(checkJobSkillIdResult);
                                }
                            }
                        );
                    }

                );

                let numberOfJobSkillRecordsHaveThisIdQueryResult =
                    await checkIfJobSkillIdExistsPromise;
                // [{"numberOfJobSkillsHaveThisId":1}]
                let numberOfJobSkillsHaveThisId =
                    numberOfJobSkillRecordsHaveThisIdQueryResult[0]
                        .numberOfJobSkillsHaveThisId;
                if (numberOfJobSkillsHaveThisId === 0) {
                    res.json({
                        result: false,
                        message: "Giá trị " + jobSkillIdNumber +
                            " không hợp lệ. "
                            + "ID JobSkills không tồn tại."
                    });
                    return;
                }

                // Ensure that the values not duplicate
                for (let j = 0; j < i; j++) {
                    if (jobSkillIdNumber ===
                        Number(requestDataJsObj.jobSkillIdArr[j])) {
                        res.json({
                            result: false,
                            message: "Vui lòng nhập các giá trị khác nhau " +
                                "cho các phần tử của mảng jobSkillIdArr."
                        });
                        return;
                    }
                }
            }

            // Pass validate
            // Delete previous data
            // then add new data
            jobSkillsOfCandidateModule.deleteAllJobSkillDataOfOneUser(
                userId,
                function(deleteJobSkillOfThisUserErr) {
                    if (deleteJobSkillOfThisUserErr) {
                        res.json({
                            result: false,
                            message: "Xóa thông tin " +
                                "kỹ năng chuyên môn lỗi." ,
                            err: deleteJobSkillOfThisUserErr
                        });
                        throw deleteJobSkillOfThisUserErr;
                    }
                }
            );

            let addMultipleJobSkillForUserSql =
                "insert into " +
                commonResources
                    .JOB_SKILLS_OF_CANDIDATE_TABLE_NAME
                + "(" +
                commonResources
                    .JOB_SKILLS_OF_CANDIDATE_COLUMN_USER_ID
                + ", " +
                commonResources.JOB_SKILLS_OF_CANDIDATE_COLUMN_JOB_SKILLS_ID
                + ") values";
            for (let i = 0;
                 i < requestDataJsObj.jobSkillIdArr.length;
                 i++) {
                addMultipleJobSkillForUserSql +=
                    "(" + userId + ", " +
                    requestDataJsObj.jobSkillIdArr[i] + "), ";
            }

            addMultipleJobSkillForUserSql =
                addMultipleJobSkillForUserSql.substring(
                    0, addMultipleJobSkillForUserSql.length - 2
                );
            addMultipleJobSkillForUserSql += ";";

            dbConnect.query(
                addMultipleJobSkillForUserSql,
                function (err, result) {
                    if (err) {
                        res.json({
                            result: false,
                            message: "Có lỗi xảy ra " +
                                "khi thêm bản ghi.",
                            err
                        });
                        return;
                    }

                    res.json({
                        resutl: true,
                        message: "Cập nhật kỹ năng " +
                            "chuyên môn thành công."
                    });
                }
            );
        }
    );
});

/**
 * Read job skills of user.
 * Param: userId (int, required, must be exist).
 */
router.post('/job-skills-of-candidate', (req, res) => {
    if (req.body.userId === undefined) {
        res.json({
            result: false,
            message: "Thiếu trường userId."
        });
        return;
    }

    let userIdText = req.body.userId.trim();
    if (userIdText.length === 0) {
        res.json({
            result: false,
            message: "Trường userId không được để trống."
        });
        return;
    }

    if (isNaN(userIdText)) {
        res.json({
            result: false,
            message: "Trường userId phải là số."
        });
        return;
    }

    let userIdNumber = Number(userIdText);
    if (!Number.isInteger(userIdNumber)) {
        res.json({
            result: false,
            message: "userId phải là số nguyên."
        });
        return;
    }

    let userId = userIdNumber;
    userModule.checkIfUserIdExists(
        userId,
        function (isUserIdExists) {
            if (!isUserIdExists) {
                res.json({
                    result: false,
                    message: "userId không tồn tại."
                });
                return;
            }

            let selectJobSkillsByUserIdSql =
                "select " +
                    commonResources
                        .JOB_SKILLS_OF_CANDIDATE_COLUMN_JOB_SKILLS_ID
                    + ", " +
                    commonResources.JOB_SKILLS_COLUMN_NAME + " " +
                "from " +
                    commonResources.JOB_SKILLS_OF_CANDIDATE_TABLE_NAME
                    + ", " +
                    commonResources.JOB_SKILLS_TABLE_NAME + " " +
                "where " +
                    commonResources.JOB_SKILLS_OF_CANDIDATE_TABLE_NAME
                    + "." +
                    commonResources
                        .JOB_SKILLS_OF_CANDIDATE_COLUMN_JOB_SKILLS_ID
                    + " = " +
                    commonResources.JOB_SKILLS_TABLE_NAME + "." +
                    commonResources.JOB_SKILLS_COLUMN_ID + " " +

                    "and " +
                        commonResources
                            .JOB_SKILLS_OF_CANDIDATE_COLUMN_USER_ID +
                        " = ?;";
            dbConnect.query(
                selectJobSkillsByUserIdSql,
                [userId],
                function(selectSkillsErr, selectSkillsResult) {
                    if (selectSkillsErr) {
                        res.json({
                           result: false,
                            message: "Có lỗi khi truy vấn " +
                                "kỹ năng chuyên môn.",
                            err: selectSkillsErr
                        });
                        return;
                    }

                    res.json({
                       result: true,
                       jobSkills: selectSkillsResult
                    });
                }
            );
        }
    );
});

// JobTitles
router.get('/job-titles', (req, res) => {
    let selectAllJobTitlesSql =
        "select * from " +
        commonResources.JOB_TITLES_TABLE_NAME + " " +
        "order by " +
        commonResources.JOB_TITLES_COLUMN_ID + ";";
    dbConnect.query(
        selectAllJobTitlesSql,
        function(err, result) {
            if (err) {
                res.json({
                    result: false,
                    message: "Có lỗi xảy ra khi truy vấn JobTitles.",
                    err
                });
            }

            let jobTitles = result;
            res.json({
               result: true,
               jobTitles
            });
        }
    );
});

// JobNews
router.get('/job-news/approved-job-news', (req, res) => {
    let selectApprovedJobNewsSql =
        "select " +
            commonResources.JOB_NEWS_TABLE_NAME + "." +
            commonResources.JOB_NEWS_COLUMN_ID + " as jobNewsId, " +

            commonResources.USERS_COLUMN_FULL_NAME + " " +
            "as ownerName, " +

            commonResources.JOB_NEWS_STATUS_COLUMN_NAME + ", " +

            commonResources.TYPES_OF_WORK_TABLE_NAME + "." +
            commonResources.TYPES_OF_WORK_COLUMN_NAME +
            " as typeOfWorkName, " +

            commonResources.JOB_NEWS_COLUMN_COMPANY_NAME + ", " +
            commonResources.JOB_NEWS_COLUMN_SHORT_DESCRIPTION + ", " +
            commonResources.JOB_NEWS_COLUMN_SALARY_VND + ", " +
            commonResources.JOB_NEWS_COLUMN_JOB_DESCRIPTION + ", " +

            commonResources.SUBDISTRICTS_TABLE_NAME + "." +
            commonResources.SUBDISTRICTS_COLUMN_NAME + " " +
            "as subdistrictName, " +

            commonResources.DISTRICTS_TABLE_NAME + "." +
            commonResources.DISTRICTS_COLUMN_NAME + " " +
            "as districtName, " +

            commonResources.STATE_PROVINCES_TABLE_NAME + "." +
            commonResources.STATE_PROVINCES_COLUMN_NAME + " " +
            "as stateProvinceName, " +

            commonResources.JOB_NEWS_COLUMN_DETAIL_ADDRESS + ", " +
            commonResources
                .JOB_NEWS_COLUMN_REQUIRED_NUMBER_YEARS_EXPERIENCES
            + ", " +

            commonResources.JOB_TITLES_TABLE_NAME + "." +
            commonResources.JOB_TITLES_COLUMN_NAME + " " +
            "as jobTitleName, " +

            commonResources
                .JOB_NEWS_COLUMN_COMPANY_SIZE_BY_NUMBER_EMPLOYEES + ", " +
            commonResources.JOB_NEWS_COLUMN_COMPANY_WEBSITE + ", " +
            commonResources.JOB_NEWS_COLUMN_COMPANY_EMAIL + ", " +
            commonResources.JOB_NEWS_COLUMN_COMPANY_PHONE_NUMBER + " " +

        "from " +
            commonResources.JOB_NEWS_TABLE_NAME + " " +

            "inner join " +
            commonResources.USERS_TABLE_NAME + " on " +
            commonResources.JOB_NEWS_TABLE_NAME + "." +
            commonResources.JOB_NEWS_COLUMN_OWNER_ID + " = " +
            commonResources.USERS_TABLE_NAME + "." +
            commonResources.USERS_COLUMN_ID + " " +

            "inner join " +
            commonResources.JOB_NEWS_STATUS_TABLE_NAME + " on " +
            commonResources.JOB_NEWS_TABLE_NAME + "." +
            commonResources.JOB_NEWS_COLUMN_STATUS_ID + " = " +
            commonResources.JOB_NEWS_STATUS_TABLE_NAME + "." +
            commonResources.JOB_NEWS_STATUS_COLUMN_ID + " " +

            "inner join " +
            commonResources.TYPES_OF_WORK_TABLE_NAME + " on " +
            commonResources.JOB_NEWS_TABLE_NAME + "." +
            commonResources.JOB_NEWS_COLUMN_TYPE_OF_WORD_ID + " = " +
            commonResources.TYPES_OF_WORK_TABLE_NAME + "." +
            commonResources.TYPES_OF_WORK_COLUMN_ID + " " +

            "inner join " +
            commonResources.SUBDISTRICTS_TABLE_NAME + " on " +
            commonResources.JOB_NEWS_TABLE_NAME + "." +
            commonResources.JOB_NEWS_COLUMN_ADDRESS_SUBDISTRICT_ID
            + " = " +
            commonResources.SUBDISTRICTS_TABLE_NAME + "." +
            commonResources.SUBDISTRICTS_COLUMN_ID + " " +

            "inner join " +
            commonResources.JOB_TITLES_TABLE_NAME + " on " +
            commonResources.JOB_NEWS_TABLE_NAME + "." +
            commonResources.JOB_NEWS_COLUMN_JOB_TITLE_ID + " = " +
            commonResources.JOB_TITLES_TABLE_NAME + "." +
            commonResources.JOB_TITLES_COLUMN_ID + " " +

            "inner join " +
            commonResources.DISTRICTS_TABLE_NAME + " on " +
            commonResources.SUBDISTRICTS_TABLE_NAME + "." +
            commonResources.SUBDISTRICTS_COLUMN_DISTRICT_ID + " = " +
            commonResources.DISTRICTS_TABLE_NAME + "." +
            commonResources.DISTRICTS_COLUMN_ID + " " +

            "inner join " +
            commonResources.STATE_PROVINCES_TABLE_NAME + " on " +
            commonResources.DISTRICTS_TABLE_NAME + "." +
            commonResources.DISTRICTS_COLUMN_STATE_PROVINCE_ID + " = " +
            commonResources.STATE_PROVINCES_TABLE_NAME + "." +
            commonResources.STATE_PROVINCES_COLUMN_ID + " " +

        "where " +
            commonResources.JOB_NEWS_COLUMN_STATUS_ID
            + " = 1 " +  // Approved

        "order by " +
        commonResources.JOB_NEWS_TABLE_NAME + "." +
        commonResources.JOB_NEWS_COLUMN_ID + " desc;";

    dbConnect.query(
        selectApprovedJobNewsSql,
        async function(selectApprovedJobNewsErr, selectApprovedJobNewsResult) {
            if (selectApprovedJobNewsErr) {
                res.json({
                   result: false,
                   message: "Lỗi truy vấn JobNews.",
                   err: selectApprovedJobNewsErr
                });
                return;
            }

            let jobNewsArr = selectApprovedJobNewsResult;
            for (let i = 0; i < jobNewsArr.length; i++) {
                let currentJobNewsId = jobNewsArr[i].jobNewsId;

                let getCurrentJobNewsRequiredSkillsPromise = new Promise(
                    function (myResolve, myReject) {
                        let selectJobNewsRequiredSkillsSql =
                            "select " +
                                commonResources.JOB_SKILLS_COLUMN_ID + ", " +
                                commonResources.JOB_SKILLS_COLUMN_NAME + " " +

                            "from " +
                                commonResources.JOB_SKILLS_TABLE_NAME + " " +
                                "inner join " +
                                commonResources.JOB_NEWS_REQUIRED_SKILLS_TABLE_NAME +
                                " on " +
                                commonResources.JOB_NEWS_REQUIRED_SKILLS_TABLE_NAME
                                + "." +
                                commonResources.JOB_NEWS_REQUIRED_SKILLS_COL_JOB_SKILL_ID
                                + " = " +
                                commonResources.JOB_SKILLS_TABLE_NAME + "." +
                                commonResources.JOB_SKILLS_COLUMN_ID + " " +

                            "where " +
                                commonResources.JOB_NEWS_REQUIRED_SKILLS_COL_JOB_NEWS_ID
                                + " = ?;";
                        dbConnect.query(
                            selectJobNewsRequiredSkillsSql,
                            [currentJobNewsId],
                            function(selectJobSkillsErr, selectJobSkillsResult) {
                                if (selectJobSkillsErr) {
                                    res.json({
                                       result: false,
                                       message: "Lỗi truy vấn kỹ năng yêu cầu của công việc.",
                                       err: selectJobSkillsErr
                                    });
                                    return;
                                }

                                myResolve(selectJobSkillsResult);
                            }
                        );
                    }
                );

                let currentJobNewsJobSkillsResult =
                    await getCurrentJobNewsRequiredSkillsPromise;
                jobNewsArr[i].requiredSkills =
                    currentJobNewsJobSkillsResult;
            }

            res.json({
                result: true,
                jobNewsArr
            });
        }
    );
});

router.post('/job-news/details', (req, res) => {
    // Validate
    if (req.body.jobNewsId === undefined) {
        res.json({
           result: false,
           message: "Thiếu trường jobNewsId."
        });
        return;
    }

    let jobNewsIdText = req.body.jobNewsId.trim();
    if (jobNewsIdText.length === 0) {
        res.json({
           result: false,
           message: "jobNewsId không được để trống."
        });
        return;
    }

    if (isNaN(jobNewsIdText)) {
        res.json({
           result: false,
           message: "jobNewsId phải là một số."
        });
        return;
    }

    let jobNewsIdNumber = Number(jobNewsIdText);
    if (!Number.isInteger(jobNewsIdNumber)) {
        res.json({
           result: false,
           message: "jobNewsId phải là số nguyên."
        });
        return;
    }

    jobNewsModule.checkIfJobNewsIdExists(
        jobNewsIdNumber,
        function (checkJosNewsIdErr, isJobNewsIdExist) {
            if (checkJosNewsIdErr) {
                res.json({
                   result: false,
                   message: "Có lỗi xảy ra khi truy vấn id JobNews.",
                   err: checkJosNewsIdErr
                });
                return;
            }

            if (isJobNewsIdExist === false) {
                res.json({
                   result: false,
                   message: "ID JobNews không tồn tại."
                });
                return;
            }

            // Pass validate
            // Query job news's info
            let selectJobNewsDetailsSql =
                "select " +
                commonResources.JOB_NEWS_TABLE_NAME + "." +
                commonResources.JOB_NEWS_COLUMN_ID + " as jobNewsId, " +

                commonResources.USERS_COLUMN_FULL_NAME + " " +
                "as ownerName, " +

                commonResources.JOB_NEWS_STATUS_COLUMN_NAME + ", " +

                commonResources.TYPES_OF_WORK_TABLE_NAME + "." +
                commonResources.TYPES_OF_WORK_COLUMN_NAME +
                " as typeOfWorkName, " +

                commonResources.JOB_NEWS_COLUMN_COMPANY_NAME + ", " +
                commonResources.JOB_NEWS_COLUMN_SHORT_DESCRIPTION + ", " +
                commonResources.JOB_NEWS_COLUMN_SALARY_VND + ", " +
                commonResources.JOB_NEWS_COLUMN_JOB_DESCRIPTION + ", " +

                commonResources.SUBDISTRICTS_TABLE_NAME + "." +
                commonResources.SUBDISTRICTS_COLUMN_NAME + " " +
                "as subdistrictName, " +

                commonResources.DISTRICTS_TABLE_NAME + "." +
                commonResources.DISTRICTS_COLUMN_NAME + " " +
                "as districtName, " +

                commonResources.STATE_PROVINCES_TABLE_NAME + "." +
                commonResources.STATE_PROVINCES_COLUMN_NAME + " " +
                "as stateProvinceName, " +

                commonResources.JOB_NEWS_COLUMN_DETAIL_ADDRESS + ", " +
                commonResources
                    .JOB_NEWS_COLUMN_REQUIRED_NUMBER_YEARS_EXPERIENCES
                + ", " +

                commonResources.JOB_TITLES_TABLE_NAME + "." +
                commonResources.JOB_TITLES_COLUMN_NAME + " " +
                "as jobTitleName, " +

                commonResources
                    .JOB_NEWS_COLUMN_COMPANY_SIZE_BY_NUMBER_EMPLOYEES + ", " +
                commonResources.JOB_NEWS_COLUMN_COMPANY_WEBSITE + ", " +
                commonResources.JOB_NEWS_COLUMN_COMPANY_EMAIL + ", " +
                commonResources.JOB_NEWS_COLUMN_COMPANY_PHONE_NUMBER + " " +

                "from " +
                commonResources.JOB_NEWS_TABLE_NAME + " " +

                "inner join " +
                commonResources.USERS_TABLE_NAME + " on " +
                commonResources.JOB_NEWS_TABLE_NAME + "." +
                commonResources.JOB_NEWS_COLUMN_OWNER_ID + " = " +
                commonResources.USERS_TABLE_NAME + "." +
                commonResources.USERS_COLUMN_ID + " " +

                "inner join " +
                commonResources.JOB_NEWS_STATUS_TABLE_NAME + " on " +
                commonResources.JOB_NEWS_TABLE_NAME + "." +
                commonResources.JOB_NEWS_COLUMN_STATUS_ID + " = " +
                commonResources.JOB_NEWS_STATUS_TABLE_NAME + "." +
                commonResources.JOB_NEWS_STATUS_COLUMN_ID + " " +

                "inner join " +
                commonResources.TYPES_OF_WORK_TABLE_NAME + " on " +
                commonResources.JOB_NEWS_TABLE_NAME + "." +
                commonResources.JOB_NEWS_COLUMN_TYPE_OF_WORD_ID + " = " +
                commonResources.TYPES_OF_WORK_TABLE_NAME + "." +
                commonResources.TYPES_OF_WORK_COLUMN_ID + " " +

                "inner join " +
                commonResources.SUBDISTRICTS_TABLE_NAME + " on " +
                commonResources.JOB_NEWS_TABLE_NAME + "." +
                commonResources.JOB_NEWS_COLUMN_ADDRESS_SUBDISTRICT_ID
                + " = " +
                commonResources.SUBDISTRICTS_TABLE_NAME + "." +
                commonResources.SUBDISTRICTS_COLUMN_ID + " " +

                "inner join " +
                commonResources.JOB_TITLES_TABLE_NAME + " on " +
                commonResources.JOB_NEWS_TABLE_NAME + "." +
                commonResources.JOB_NEWS_COLUMN_JOB_TITLE_ID + " = " +
                commonResources.JOB_TITLES_TABLE_NAME + "." +
                commonResources.JOB_TITLES_COLUMN_ID + " " +

                "inner join " +
                commonResources.DISTRICTS_TABLE_NAME + " on " +
                commonResources.SUBDISTRICTS_TABLE_NAME + "." +
                commonResources.SUBDISTRICTS_COLUMN_DISTRICT_ID + " = " +
                commonResources.DISTRICTS_TABLE_NAME + "." +
                commonResources.DISTRICTS_COLUMN_ID + " " +

                "inner join " +
                commonResources.STATE_PROVINCES_TABLE_NAME + " on " +
                commonResources.DISTRICTS_TABLE_NAME + "." +
                commonResources.DISTRICTS_COLUMN_STATE_PROVINCE_ID + " = " +
                commonResources.STATE_PROVINCES_TABLE_NAME + "." +
                commonResources.STATE_PROVINCES_COLUMN_ID + " " +

                "where " +
                commonResources.JOB_NEWS_TABLE_NAME + "." +
                commonResources.JOB_NEWS_COLUMN_ID + " = ?;";
            dbConnect.query(
                selectJobNewsDetailsSql,
                [jobNewsIdNumber],
                function (selectJobNewsDetailErr, selectJobNewsDetailsResult) {
                    if (selectJobNewsDetailErr) {
                        res.json({
                            result: false,
                            message: "Có lỗi xảy ra khi truy vấn " +
                               "thông tin tin tuyển dụng.",
                            err: selectJobNewsDetailErr
                        });
                        return;
                    }

                    // Result is an array
                    let jobNewsDetails = selectJobNewsDetailsResult[0];
                    let selectJobNewsRequiredSkillsSql =
                        "select " +
                        commonResources.JOB_SKILLS_COLUMN_ID + ", " +
                        commonResources.JOB_SKILLS_COLUMN_NAME + " " +

                        "from " +
                        commonResources.JOB_SKILLS_TABLE_NAME + " " +
                        "inner join " +
                        commonResources.JOB_NEWS_REQUIRED_SKILLS_TABLE_NAME +
                        " on " +
                        commonResources.JOB_NEWS_REQUIRED_SKILLS_TABLE_NAME
                        + "." +
                        commonResources.JOB_NEWS_REQUIRED_SKILLS_COL_JOB_SKILL_ID
                        + " = " +
                        commonResources.JOB_SKILLS_TABLE_NAME + "." +
                        commonResources.JOB_SKILLS_COLUMN_ID + " " +

                        "where " +
                        commonResources.JOB_NEWS_REQUIRED_SKILLS_COL_JOB_NEWS_ID
                        + " = ?;";
                    dbConnect.query(
                        selectJobNewsRequiredSkillsSql,
                        [jobNewsIdNumber],
                        function(selectJobSkillErr, selectJobSkillResult) {
                            if (selectJobSkillErr) {
                                res.json({
                                   result: false,
                                   message: "Có lỗi xảy ra " +
                                           "khi truy vấn " +
                                           "kỹ năng chuyên môn yêu cầu."
                                });
                                return;
                            }

                            jobNewsDetails.requiredJobSkills =
                                                selectJobSkillResult;
                            res.json({
                                result: true,
                                jobNewsDetails
                            });
                        }
                    );
                }
            );
        }
    );
});

router.post('/job-news/create', (req, res) => {
   // Validate userId (user is owner of job news)
   if (req.body.userId === undefined) {
       res.json({
          result: false,
          message: "Thiếu trường userId."
       });
       return;
   }

   let userIdText = req.body.userId.trim();
   if (userIdText.length === 0) {
       res.json({
           result: false,
           message: "userId không được để trống."
       });
       return;
   }

   if (isNaN(userIdText)) {
       res.json({
           result: false,
           message: "userId phải là một số."
       })
       return;
   }

   let userIdNumber = Number(userIdText);
   if (!Number.isInteger(userIdNumber)) {
       res.json({
          result: false,
          message: "userId phải là số nguyên."
       });
       return;
   }

   userModule.checkIfUserIdExists(
       userIdNumber,
       function (isUserIdExists) {
           if (!isUserIdExists) {
               res.json({
                   result: false,
                   message: "userId không tồn tại."
               });
               return;
           }

           // Validate companyName
           if (req.body.companyName === undefined) {
               res.json({
                  result: false,
                  message: "Thiếu trường companyName."
               });
               return;
           }

           let companyName = req.body.companyName.trim();
           if (companyName.length === 0) {
               res.json({
                   result: false,
                   message: "Tên công ty không được để trống."
               });
               return;
           }

           // Validate jobShortDescription
           if (req.body.jobShortDescription === undefined) {
               res.json({
                  result: false,
                  message: "Thiếu trường jobShortDescription."
               });
               return;
           }

            let jobShortDescriptionText =
                req.body.jobShortDescription.trim();
            if (jobShortDescriptionText.length === 0) {
                res.json({
                   result: false,
                   message: "Mô tả ngắn/tên công việc không được để trống."
                });
                return;
            }

            // Validate salaryInVnd
           if (req.body.salaryInVnd === undefined) {
               res.json({
                  result: false,
                  message: "Thiếu trường salaryInVnd."
               });
               return;
           }

           let salaryInVndText = req.body.salaryInVnd.trim();
           if (salaryInVndText.length === 0) {
               res.json({
                  result: false,
                   message: "Mức lương không được để trống."
               });
               return;
           }

           if (isNaN(salaryInVndText)) {
               res.json({
                  result: false,
                  message: "Mức lương phải là một số."
               });
               return;
           }

           let salaryInVndNumber = Number(salaryInVndText);
           if (!Number.isInteger(salaryInVndNumber)) {
               res.json({
                  result: false,
                  message: "Mức lương phải là số nguyên."
               });
               return;
           }

           if (salaryInVndNumber < 0) {
               res.json({
                   result: false,
                   message: "Mức lương phải là số nguyên >= 0."
               });
               return;
           }

           // Validate jobDescription
           if (req.body.jobDescription === undefined) {
               res.json({
                   result: false,
                   message: "Thiếu trường jobDescription."
               });
               return;
           }

           let jobDescriptionText = req.body.jobDescription.trim();
           if (jobDescriptionText.length === 0) {
               res.json({
                   result: false,
                   message: "Phần mô tả công việc không được để trống."
               });
               return;
           }

           // Validate addressSubDistrictId
           if (req.body.addressSubdistrictId === undefined) {
               res.json({
                  result: false,
                  message: "Thiếu trường addressSubdistrictId."
               });
               return;
           }

           let addressSubdistrictIdText =
                                    req.body.addressSubdistrictId.trim();
           if (addressSubdistrictIdText.length === 0) {
               res.json({
                  result: false,
                  message: "Hãy chọn địa chỉ " +
                      "tỉnh/thành phố - quận/huyện - xã/phường."
               });
               return;
           }

           subdistrictsModule.checkIfSubDistrictIdExists(
               addressSubdistrictIdText,
               function (checkSubdistrictIdErr,
                         isSubdistrictIdExists) {
                   if (checkSubdistrictIdErr) {
                       res.json({
                          result: false,
                          message: "Có lỗi xảy ra khi truy vấn ID xã.",
                          err:  checkSubdistrictIdErr
                       });
                       return;
                   }

                   if (isSubdistrictIdExists === false) {
                       res.json({
                           result: false,
                           message: "ID xã không tồn tại."
                       });
                       return;
                   }

                   // Validate typeOfWorkId
                   if (req.body.typeOfWorkId === undefined) {
                       res.json({
                           result: false,
                           message: "Thiếu trường typeOfWorkId."
                       });
                       return;
                   }

                   let typeOfWorkIdText = req.body.typeOfWorkId.trim();
                   if (typeOfWorkIdText.length === 0) {
                       res.json({
                           result: false,
                           message: "typeOfWorkId không được để trống."
                       });
                       return;
                   }

                   if (isNaN(typeOfWorkIdText)) {
                       res.json({
                           result: false,
                           message: "typeOfWorkId phải là một số."
                       });
                       return;
                   }

                   let typeOfWorkIdNumber = Number(typeOfWorkIdText);
                   if (!Number.isInteger(typeOfWorkIdNumber)) {
                       res.json({
                           result: false,
                           message: "typeOfWorkId phải là số nguyên."
                       });
                       return;
                   }

                   typeOfWorksModule.checkIfTypeOfWorkIdExists(
                       typeOfWorkIdNumber,
                       function (checkTypeOfWorkIdErr,
                                        isTypeOfWorkIdExist) {
                           if (checkTypeOfWorkIdErr) {
                               console.trace(); // Print stack trace error
                               res.json({
                                   result: false,
                                   message: "Có lỗi xảy ra " +
                                       "khi truy vấn ID " +
                                       "hình thức làm việc.",
                                   err: checkTypeOfWorkIdErr
                               });
                               return;
                           }

                           if (isTypeOfWorkIdExist === false) {
                               res.json({
                                   result: false,
                                   message: "ID hình thức làm việc" +
                                       " không tồn tại."
                               });
                               return;
                           }

                           // Validate requiredNumberYearsOfExperiences
                           if (req.body.requiredNumberYearsOfExperiences
                                === undefined) {
                               res.json({
                                   result: false,
                                   message: "Thiếu trường " +
                                       "requiredNumberYearsOfExperiences."
                               });
                               return;
                           }

                           let requiredNumberYearsOfExperiencesText =
                               req.body.requiredNumberYearsOfExperiences
                                   .trim();
                           if (requiredNumberYearsOfExperiencesText
                                .length === 0) {
                               res.json({
                                   result: false,
                                   message: "Số năm kinh nghiệm yêu cầu" +
                                       " không được để trống."
                               });
                               return;
                           }

                           if (isNaN(requiredNumberYearsOfExperiencesText)) {
                               res.json({
                                   result: false,
                                   message: "Số năm kinh nghiệm yêu cầu" +
                                       " phải là một số."
                               });
                               return;
                           }

                           let requiredNumberYearsOfExperiences =
                               Number(
                                   requiredNumberYearsOfExperiencesText
                               );
                           if (!Number.isInteger(requiredNumberYearsOfExperiences)) {
                               res.json({
                                   result: false,
                                   message: "Số năm kinh nghiệm yêu cầu" +
                                       " phải là số nguyên."
                               });
                               return;
                           }

                           if (requiredNumberYearsOfExperiences < 0) {
                               res.json({
                                   result: false,
                                   message: "Số năm kinh nghiệm yêu cầu" +
                                       " phải là số nguyên >= 0."
                               });
                               return;
                           }

                           // Validate detailAddress
                           if (req.body.detailAddress === undefined) {
                               res.json({
                                   result: false,
                                   message: "Thiếu trường detailAddress."
                               });
                               return;
                           }

                           let detailAddressText =
                                req.body.detailAddress.trim();
                           if (detailAddressText.length === 0) {
                               res.json({
                                   result: false,
                                   message: "Địa chỉ công ty cụ thể " +
                                       "(đường, số nhà,...) " +
                                       "không được để trống."
                               });
                               return;
                           }

                           // Validate jobTitleId
                           if (req.body.jobTitleId === undefined) {
                               res.json({
                                   result: false,
                                   message: "Thiếu trường jobTitleId."
                               });
                               return;
                           }

                           let jobTitleIdText =
                                            req.body.jobTitleId.trim();
                           if (jobTitleIdText.length === 0) {
                               res.json({
                                  result: false,
                                  message: "jobTitleId không được để trống."
                               });
                               return;
                           }

                           if (isNaN(jobTitleIdText)) {
                               res.json({
                                  result: false,
                                  message: "jobTitleId phải là một số."
                               });
                               return;
                           }

                           let jobTitleIdNumber = Number(jobTitleIdText);
                           if (!Number.isInteger(jobTitleIdNumber)) {
                               res.json({
                                  result: false,
                                  message: "jobTitleId phải là số nguyên."
                               });
                               return;
                           }

                           jobTitlesModule.checkIfJobTitleIdExists(
                               jobTitleIdNumber,
                               function (checkJobTitleIdErr,
                                         isJobTitleIdExist) {
                                   if (checkJobTitleIdErr) {
                                       console.trace(); // Print error
                                                        // stack trace
                                       res.json({
                                           result: false,
                                           message: "Có lỗi xảy ra " +
                                               "khi truy vấn " +
                                               "ID cấp bậc công việc" +
                                               " nhận vào.",
                                           err: checkJobTitleIdErr
                                       });
                                       return;
                                   }

                                   if (isJobTitleIdExist === false) {
                                       res.json({
                                           result: false,
                                           message: "ID cấp bậc công việc" +
                                               " nhận vào không tồn tại."
                                       });
                                       return;
                                   }

                                   // Validate companySizeByNumberEmployees
                                   if (req.body
                                       .companySizeByNumberEmployees
                                       === undefined) {
                                       res.json({
                                           result: false,
                                           message: "Thiếu trường " +
                                               "companySizeByNumberEmployees."
                                       });
                                       return;
                                   }

                                   let companySizeByNumberEmployeesText =
                                       req.body
                                           .companySizeByNumberEmployees
                                           .trim();
                                   if (companySizeByNumberEmployeesText
                                       .length === 0) {
                                       res.json({
                                           result: false,
                                           message: "Quy mô công ty" +
                                                   " tính bằng " +
                                                   "số lương nhân viên" +
                                                   " không được để trống."
                                       });
                                       return;
                                   }

                                   if (isNaN(companySizeByNumberEmployeesText)) {
                                       res.json({
                                          result: false,
                                          message: "Quy mô công ty" +
                                              " tính bằng " +
                                              "số lương nhân viên" +
                                              " phải là một số."
                                       });
                                       return;
                                   }

                                   let companySizeByNumberEmployees =
                                       Number(
                                           companySizeByNumberEmployeesText
                                       );
                                   if (!Number.isInteger(
                                       companySizeByNumberEmployees)) {
                                       res.json({
                                           result: false,
                                           message: "Quy mô công ty" +
                                               " tính bằng " +
                                               "số lương nhân viên" +
                                               " phải là số nguyên."
                                       });
                                       return;
                                   }

                                   if (companySizeByNumberEmployees <= 0) {
                                       res.json({
                                           result: false,
                                           message: "Quy mô công ty" +
                                               " tính bằng " +
                                               "số lương nhân viên" +
                                               " phải là số nguyên " +
                                               "lớn hơn 0."
                                       });
                                       return;
                                   }

                                   // Validate companyWebsite
                                   if (req.body.companyWebsite
                                                        === undefined) {
                                       res.json({
                                           result: false,
                                           message: "Thiếu trường " +
                                               "companyWebsite."
                                       });
                                       return;
                                   }

                                   let companyWebsiteText =
                                       req.body.companyWebsite.trim();
                                   if (companyWebsiteText.length === 0) {
                                       res.json({
                                           result: false,
                                           message: "Website công ty " +
                                               "không được để trống."
                                       });
                                       return;
                                   }

                                   try {
                                       new URL(companyWebsiteText);
                                   } catch (err) {
                                       res.json({
                                           result: false,
                                           message: "Nhập website công ty" +
                                               " là URL hợp lệ," +
                                               " có cả " +
                                               "http/https."
                                       });
                                       return;
                                   }

                                   // Validate companyEmail
                                   if (req.body.companyEmail === undefined) {
                                       res.json({
                                           result: false,
                                           message: "Thiếu trường " +
                                               "companyEmail."
                                       });
                                       return;
                                   }

                                   let companyEmail =
                                       req.body.companyEmail.trim();
                                   if (companyEmail.length === 0) {
                                       res.json({
                                           result: false,
                                           message: "Email công ty" +
                                               " không được để trống."
                                       });
                                       return;
                                   }

                                   if (!companyEmail.match(
                                        commonResources.REGEX_EMAIL)) {
                                       res.json({
                                           result: false,
                                           message: "Hãy nhập " +
                                               "email công ty " +
                                               "đúng định dạng."
                                       });
                                       return;
                                   }

                                   // Validate companyPhoneNumber
                                   if (req.body.companyPhoneNumber
                                        === undefined) {
                                       res.json({
                                           result: false,
                                           message: "Thiếu trường " +
                                               "companyPhoneNumber."
                                       });
                                       return;
                                   }

                                   let companyPhoneNumberText =
                                       req.body.companyPhoneNumber.trim();
                                   if (companyPhoneNumberText.length === 0) {
                                       res.json({
                                           result: false,
                                           message: "Số điện thoại " +
                                               "của công ty " +
                                               "không được để trống."
                                       });
                                       return;
                                   }

                                   if (!companyPhoneNumberText.match(
                                       commonResources
                                           .REGEX_COMPANY_PHONE)) {
                                       res.json({
                                           result: false,
                                           message: "Hãy nhập " +
                                               "số điện thoại công ty " +
                                               "đúng định dạng " +
                                               "(10-12 chữ số)."
                                       });
                                       return;
                                   }

                                   // Pass validate
                                   let addNewJobNewsToDbSql =
                                       "insert into " + commonResources.JOB_NEWS_TABLE_NAME + "(" +
                                            commonResources.JOB_NEWS_COLUMN_OWNER_ID + ", " +
                                            commonResources.JOB_NEWS_COLUMN_COMPANY_NAME + ", " +
                                            commonResources.JOB_NEWS_COLUMN_SHORT_DESCRIPTION + ", " +
                                            commonResources.JOB_NEWS_COLUMN_SALARY_VND + ", " +
                                            commonResources.JOB_NEWS_COLUMN_JOB_DESCRIPTION + ", " +
                                            commonResources.JOB_NEWS_COLUMN_ADDRESS_SUBDISTRICT_ID + ", " +
                                            commonResources.JOB_NEWS_COLUMN_TYPE_OF_WORD_ID + ", " +
                                            commonResources.JOB_NEWS_COLUMN_REQUIRED_NUMBER_YEARS_EXPERIENCES + ", " +
                                            commonResources.JOB_NEWS_COLUMN_DETAIL_ADDRESS + ", " +
                                            commonResources.JOB_NEWS_COLUMN_STATUS_ID + ", " +
                                            commonResources.JOB_NEWS_COLUMN_JOB_TITLE_ID + ", " +
                                            commonResources.JOB_NEWS_COLUMN_COMPANY_SIZE_BY_NUMBER_EMPLOYEES + ", " +
                                            commonResources.JOB_NEWS_COLUMN_COMPANY_WEBSITE + ", " +
                                            commonResources.JOB_NEWS_COLUMN_COMPANY_EMAIL + ", " +
                                            commonResources.JOB_NEWS_COLUMN_COMPANY_PHONE_NUMBER + ") " +
                                       "values(" +
                                            userIdNumber + ", " +
                                            "'" + companyName + "', " +
                                            "'" + jobShortDescriptionText + "', " +
                                            salaryInVndNumber + ", " +
                                            "'" + jobDescriptionText + "', " +
                                            "'" + addressSubdistrictIdText + "', " +
                                            typeOfWorkIdNumber + ", " +
                                            requiredNumberYearsOfExperiences + ", " +
                                            "'" + detailAddressText + "', " + 
                                            commonResources.JOB_NEWS_STATUS_VALUE_UNAPPROVED + ", " +
                                            jobTitleIdNumber + ", " +
                                            companySizeByNumberEmployees + ", " +
                                            "'" + companyWebsiteText + "', " +
                                            "'" + companyEmail + "', " +
                                            "'" + companyPhoneNumberText + "'" +
                                       ");";
                                   dbConnect.query(
                                       addNewJobNewsToDbSql,
                                       function (createJobNewsErr,
                                                 createJobNewResult) {
                                           if (createJobNewsErr) {
                                               console.trace(); // Print error stack trace
                                               res.json({
                                                   result: false,
                                                   message: "Có lỗi xảy ra khi lưu tin tuyển dụng.",
                                                   err: createJobNewsErr
                                               });
                                               return;
                                           }

                                           res.json({
                                              result: true,
                                              message: "Thêm tin tuyển dụng thành công."
                                           });
                                       }
                                   );
                               }
                           );
                       }
                   );
               }
           );
       }
   );
});

// JobApplications
router.post('/job-applications/apply-job', (req, res) => {
    // Validate userId
    if (req.body.userId === undefined) {
        res.json({
            result: false,
            message: "Thiếu trường userId."
        });
        return;
    }

    let userIdText = req.body.userId.trim();
    if (userIdText.length === 0) {
        res.json({
            result: false,
            message: "userId không được để trống."
        });
        return;
    }

    if (isNaN(userIdText)) {
        res.json({
            result: false,
            message: "userId phải là một số."
        })
        return;
    }

    let userIdNumber = Number(userIdText);
    if (!Number.isInteger(userIdNumber)) {
        res.json({
            result: false,
            message: "userId phải là số nguyên."
        });
        return;
    }

    userModule.checkIfUserIdExists(
        userIdNumber,
        function (isUserIdExists) {
            if (!isUserIdExists) {
                res.json({
                    result: false,
                    message: "userId không tồn tại."
                });
                return;
            }

            // Validate jobNewsId
            if (req.body.jobNewsId === undefined) {
                res.json({
                    result: false,
                    message: "Thiếu trường jobNewsId."
                });
                return;
            }

            let jobNewsIdText = req.body.jobNewsId.trim();
            if (jobNewsIdText.length === 0) {
                res.json({
                    result: false,
                    message: "jobNewsId không được để trống."
                });
                return;
            }

            if (isNaN(jobNewsIdText)) {
                res.json({
                    result: false,
                    message: "jobNewsId phải là một số."
                });
                return;
            }

            let jobNewsIdNumber = Number(jobNewsIdText);
            if (!Number.isInteger(jobNewsIdNumber)) {
                res.json({
                    result: false,
                    message: "jobNewsId phải là số nguyên."
                });
                return;
            }

            jobNewsModule.checkIfJobNewsIdExists(
                jobNewsIdNumber,
                function (checkJosNewsIdErr, isJobNewsIdExist) {
                    if (checkJosNewsIdErr) {
                        console.trace();
                        res.json({
                            result: false,
                            message: "Có lỗi xảy ra khi truy vấn id JobNews.",
                            err: checkJosNewsIdErr
                        });
                        return;
                    }

                    if (isJobNewsIdExist === false) {
                        res.json({
                            result: false,
                            message: "ID JobNews không tồn tại."
                        });
                        return;
                    }

                    // Check if this job news has been approved
                    let selectJobNewsStatusIdSql =
                        "select " +
                            commonResources
                                .JOB_NEWS_COLUMN_STATUS_ID + " " +
                        "from " +
                            commonResources.JOB_NEWS_TABLE_NAME + " " +
                        "where " +
                            commonResources.JOB_NEWS_COLUMN_ID + " = ?;";
                    dbConnect.query(
                        selectJobNewsStatusIdSql,
                        [jobNewsIdNumber],
                        function (selectJobNewsStatusIdErr,
                                  selectJobNewsStatusIdResult) {
                            if (selectJobNewsStatusIdErr) {
                                console.trace();
                                res.json({
                                    result: false,
                                    message: "Có lỗi xảy ra khi truy vấn" +
                                        " trạng thái tin tuyển dụng.",
                                    err: selectJobNewsStatusIdErr
                                });
                                return;
                            }

                            // [ { statusId: 0 } ]
                            let jobNewsStatusId =
                                selectJobNewsStatusIdResult[0].statusId;
                            if (jobNewsStatusId ===
                                commonResources
                                    .JOB_NEWS_STATUS_VALUE_UNAPPROVED) {
                                res.json({
                                    result: false,
                                    message: "Tin tuyển dụng này " +
                                        "chưa được phê duyệt."
                                });
                                return;
                            }

                            // Check if user has been
                            // apply this job news before.
                            jobApplicationsModule.checkIfThisUserHasAppliedForThisJobNewsBefore(
                                userIdNumber,
                                jobNewsIdNumber,
                                function (checkIfUserHasAppliedThisJobBeforeErr,
                                          hasUserAppliedThisJobBefore) {
                                    if (checkIfUserHasAppliedThisJobBeforeErr) {
                                        console.trace();
                                        res.json({
                                            result: false,
                                            message: "Có lỗi xảy ra " +
                                                "khi kiểm tra " +
                                                "người dùng đã ứng tuyển" +
                                                " tin này hay chưa.",
                                            err: checkIfUserHasAppliedThisJobBeforeErr
                                        });
                                        return;
                                    }

                                    if (hasUserAppliedThisJobBefore
                                                        === true) {
                                        res.json({
                                            result: false,
                                            message: "Người dùng đã " +
                                                "ứng tuyển công việc này" +
                                                " trước đó nên không cần" +
                                                " phải ứng tuyển " +
                                                "thêm lần nữa."
                                        });
                                        return;
                                    }

                                    // Pass validate
                                    let applyJobSql =
                                        "insert into " +
                                            commonResources
                                                .JOB_APPLICATIONS_TABLE_NAME
                                            + "(" +
                                            commonResources
                                                .JOB_APPLICATIONS_COL_USER_ID
                                            + ", " +
                                            commonResources
                                                .JOB_APPLICATIONS_COL_JOB_NEWS_ID
                                            + ") " +
                                        "values(" +
                                            userIdNumber + ", " +
                                            jobNewsIdNumber + ");";
                                    dbConnect.query(
                                        applyJobSql,
                                        function (applyJobErr,
                                                  applyJobResult) {
                                            if (applyJobErr) {
                                                console.trace();
                                                res.json({
                                                    result: false,
                                                    message: "Có lỗi" +
                                                        " xảy ra khi" +
                                                        " lưu thông tin" +
                                                        " ứng tuyển.",
                                                    err: applyJobErr
                                                });
                                                return;
                                            }

                                            res.json({
                                                result: true,
                                                message: "Lưu thông tin" +
                                                    " ứng tuyển thành công."
                                            });
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        }
    );
});
module.exports = router;