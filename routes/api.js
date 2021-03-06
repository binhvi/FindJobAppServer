var express = require('express');
var router = express.Router();
var commonResources = require('../public/javascripts/common');
var uniqid = require('uniqid');
var dbConnect = require('../public/javascripts/db');
var userModule = require('./users');
const academicDegreeLevelsModule = require('./academic-degree-levels');

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

router.post('/users/details', (req, res) => {
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

    // Query user details
    let userId = userIdNumber;
    let selectUserInfoByIdSql =
        "select " +
        commonResources.USERS_COLUMN_FULL_NAME + ", " +

        // Genders.name as gender
        commonResources.GENDERS_TABLE_NAME + "."
        + commonResources.GENDERS_COLUMN_NAME + " as " +
        commonResources.COLUMN_ALIAS_GENDER + ", " +

        commonResources.USERS_COLUMN_EXPECTED_SALARY_MIL_VND + ", " +

        // TypesOfWork.name as typeOfWork
        commonResources.TYPES_OF_WORK_TABLE_NAME + "." +
        commonResources.TYPES_OF_WORK_COLUMN_NAME + " as " +
        commonResources.COLUMN_ALIAS_TYPE_OF_WORK + ", " +

        commonResources.LEVELS_OF_EDUCATION_COLUMN_NAME + " as " +
        commonResources.COLUMN_ALIAS_GRADUATED_EDUCATION_LEVEL + ", " +

        commonResources.USERS_COLUMN_YEARS_OF_EXPERIENCE + ", " +
        commonResources.USERS_COLUMN_RESUME_SUMMARY + ", " +
        commonResources.USERS_COLUMN_DOB_MILLIS + ", " +
        commonResources.USERS_COLUMN_ADDRESS + ", " +
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
        "where Users.id = ?;";

    dbConnect.query(
        selectUserInfoByIdSql,
        [userId],
        function (err, userResult) {
            if (err) {
                res.json({
                    result: false,
                    message: 'Lỗi truy vấn Users',
                    err
                });
                return;
            }

            if (!userResult.length) {
                res.json({
                    result: false,
                    message: "Không tìm thấy thông tin người dùng."
                });
                return;
            }

            let user = userResult[0]; // result is an array

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
                    if (err) {
                        res.json({
                            result: false,
                            message: 'Lỗi truy vấn Experiences',
                            err
                        });
                        return;
                    }
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
                        + " = ?";
                    dbConnect.query(
                        selectEducationByUserIdSql,
                        [userId],
                        function (err, educationResult) {
                            if (err) {
                                res.json({
                                    result: false,
                                    message: 'Lỗi truy vấn Education',
                                    err
                                });
                                return;
                            }
                            res.json(
                                {
                                    result: true,
                                    data: {
                                        user,
                                        experiences,
                                        education: educationResult
                                    }
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
    if (req.body.id === undefined) {
        res.json({
            result: false,
            message: "Thiếu trường id."
        });
        return;
    }

    if (!req.body.id.trim()) {
        res.json({
            result: false,
            message: "Trường id không được để trống"
        });
        return;
    }

    let idText = req.body.id.trim();
    if (!idText) {
        res.json({
            result: false,
            message: "id không được để trống."
        });
        return;
    }

    if (isNaN(idText)) {
        res.json({
            result: false,
            message: "id phải là số."
        });
        return;
    }

    let idNumber = Number(idText);
    if (!Number.isInteger(idNumber)) {
        res.json({
            result: false,
            message: "id phải là số nguyên."
        });
        return;
    }

    let id = idNumber;
    let selectUserByIdSql =
        "select " + commonResources.USERS_COLUMN_ID + " " +
        "from " + commonResources.USERS_TABLE_NAME + " " +
        "where " + commonResources.USERS_COLUMN_ID + " = ?";
    dbConnect.query(
        selectUserByIdSql,
        [id],
        function (err, selectUserByIdResult) {
            if (err) throw err;
            if (selectUserByIdResult.length === 0) {
                res.json({
                    result: false,
                    message: "Không tìm thấy thông tin người dùng"
                });
            } else {
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
                    id,
                    function (isPhoneExists) {
                        if (isPhoneExists) {
                            res.json({
                                result: false,
                                message: "Trùng số điện thoại."
                            });
                        } else {
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
                                id,
                                async function (isEmailExists) {
                                    if (isEmailExists) {
                                        res.json({
                                            result: false,
                                            message: "Trùng email."
                                        });
                                    } else {
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
                                            // block inside if still execute
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
                                        let address;
                                        // If req.body.address != undefined and != empty
                                        // and != white space
                                        if (req.body.address && req.body.address.trim()) {
                                            address = req.body.address.trim();
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
                                        let expectedSalaryInMillionVnd;
                                        // If req.body.expectedSalaryInMillionVnd != undefined
                                        // and != empty
                                        if (req.body.expectedSalaryInMillionVnd &&
                                            req.body.expectedSalaryInMillionVnd.trim().length) {
                                            let expectedSalaryInMillionVndText =
                                                req.body.expectedSalaryInMillionVnd.trim();

                                            if (isNaN(expectedSalaryInMillionVndText)) {
                                                res.json({
                                                    result: false,
                                                    message: "Nhập mức lương mong muốn là số."
                                                });
                                                return;
                                            }

                                            expectedSalaryInMillionVnd =
                                                Number(expectedSalaryInMillionVndText);
                                            if (!Number.isInteger(expectedSalaryInMillionVnd)) {
                                                res.json({
                                                    result: false,
                                                    message: "Nhập mức lương mong muốn là số nguyên"
                                                });
                                                return;
                                            }

                                            if (expectedSalaryInMillionVnd < 0) {
                                                res.json({
                                                    result: false,
                                                    message: "Nhập mức lương mong muốn " +
                                                        "là số nguyên lớn hơn hoặc bằng 0."
                                                });
                                                return;
                                            }
                                        }

                                        // Years of experiences
                                        let yearsOfExperience;
                                        // If req.body.yearsOfExperience != undefined and != empty
                                        if (req.body.yearsOfExperience &&
                                            req.body.yearsOfExperience.trim().length) {
                                            let yearsOfExperienceText =
                                                req.body.yearsOfExperience.trim();

                                            if (isNaN(yearsOfExperienceText)) {
                                                res.json({
                                                    result: false,
                                                    message: "Nhập số năm kinh nghiệm là số."
                                                });
                                                return;
                                            }

                                            yearsOfExperience =
                                                Number(yearsOfExperienceText);
                                            if (!Number.isInteger(yearsOfExperience)) {
                                                res.json({
                                                    result: false,
                                                    message: "Nhập số năm kinh nghiệm là số nguyên."
                                                });
                                                return;
                                            }

                                            if (yearsOfExperience < 0) {
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

                                        let addressKeyValueSubStringSql = "";
                                        if (address === undefined) {
                                            addressKeyValueSubStringSql =
                                                commonResources.USERS_COLUMN_ADDRESS + " = null";
                                        } else {
                                            addressKeyValueSubStringSql =
                                                commonResources.USERS_COLUMN_ADDRESS + " = " +
                                                "'" + address + "'";
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

                                        let expectedSalaryInMillionVndKeyValueSubStringSql =
                                            !expectedSalaryInMillionVnd ?
                                                (commonResources.USERS_COLUMN_EXPECTED_SALARY_MIL_VND
                                                    + " = null") :
                                                (commonResources.USERS_COLUMN_EXPECTED_SALARY_MIL_VND
                                                    + " = " + expectedSalaryInMillionVnd);

                                        let yearsOfExperienceKeyValueSubStringSql =
                                            !yearsOfExperience ?
                                                (commonResources.USERS_COLUMN_YEARS_OF_EXPERIENCE
                                                    + " = null") :
                                                (commonResources.USERS_COLUMN_YEARS_OF_EXPERIENCE
                                                    + " = " + yearsOfExperience);

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
                                            addressKeyValueSubStringSql + ", " +
                                            graduatedEducationIdKeyValueSubStringSql + ", " +
                                            typeOfWorkIdKeyValueSubStringSql + ", " +
                                            expectedSalaryInMillionVndKeyValueSubStringSql + ", " +
                                            yearsOfExperienceKeyValueSubStringSql + ", " +
                                            resumeSummaryKeyValueSubStringSql + ", " +
                                            careerObjectiveKeyValueSubStringSql + " " +
                                            avatarUrlKeyValueSubStringSql + " " +
                                            "where " + commonResources.USERS_COLUMN_ID + " = ?;";
                                        dbConnect.query(
                                            updateUserSql,
                                            [id], // Escaping value to avoid sql injection
                                            function (err, result) {
                                                if (err) {
                                                    res.json({
                                                        result: false,
                                                        message: "Có lỗi xảy ra khi lưu",
                                                        err
                                                    });
                                                    throw err;
                                                }
                                                res.json({
                                                    result: true,
                                                    message: "Update thành công " +
                                                        result.affectedRows + " bản ghi."
                                                });
                                            }
                                        );
                                    }
                                });
                        }
                    });
            }
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
            commonResources.USERS_COLUMN_AVATAR_URL + " " +

        "from " +
            commonResources.USERS_TABLE_NAME + " " +
            "left join " +
            commonResources.GENDERS_TABLE_NAME + " on " +
            commonResources.GENDERS_TABLE_NAME + "." +
            commonResources.GENDERS_COLUMN_ID + " = " +
            commonResources.USERS_COLUMN_GENDER_ID + " " +
        "order by " +
        commonResources.USERS_TABLE_NAME + "." +
        commonResources.USERS_COLUMN_ID + " desc";

    dbConnect.query(
        selectAllUsersSql,
        function (err, result) {
            if (err) {
                res.json({
                    result: false,
                    message: 'Lỗi truy vấn danh sách Users',
                    err
                });
            } else {
                res.json({
                    result: true,
                    users: result
                });
            }
        }
    )
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

module.exports = router;