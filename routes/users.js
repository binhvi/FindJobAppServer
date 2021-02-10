var express = require('express');
var router = express.Router();
var commonResources = require('../public/javascripts/common');
var dbConnect = require('../public/javascripts/db');
const moment = require('moment');

/* GET users listing. */
router.get('/', function(req, res, next) {
    // Search
    let keyword = req.query.keyword ==
        undefined ? "" : req.query.keyword.trim();

    // Find users in database with full name contain keyword
    // (case-insensitive)
    let getAllUsersSql =
        "select " +
            commonResources.USERS_COLUMN_ID + ", " +
            commonResources.USERS_COLUMN_AVATAR_URL + ", " +
            commonResources.USERS_COLUMN_FULL_NAME + ", " +
            commonResources.USERS_COLUMN_PHONE + ", " +
            commonResources.USERS_COLUMN_EMAIL + ", " +
            commonResources.USERS_COLUMN_ADDRESS + " " +
        "from " + commonResources.USERS_TABLE_NAME + " " +
        "where " + commonResources.USERS_COLUMN_FULL_NAME + " " +
                "like '%" + keyword + "%';";

    dbConnect.query(getAllUsersSql, function (err, result, fields) {
       if (err) throw err;
       let users = result;
       res.render(
           'users/index', {users, keyword}
       );
    });
});

router.post('/details', async (req, res) => {
   let userId = req.body.userId;
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
           if (err) throw err;
           let user = userResult[0]; // result is an array
           if (user.birthdayInMilliseconds) {
               user.birthdayInMilliseconds =
                               moment(user.birthdayInMilliseconds)
                               .format('DD-MMM-YYYY');
           }

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
                            + " = ?";
                   dbConnect.query(
                       selectEducationByUserIdSql,
                       [userId],
                       function (err, educationResult) {
                           if (err) throw err;
                           res.render(
                               'users/details',
                               {
                                        user, experiences,
                                       educationResult, moment
                                    }
                               );
                       }
                   );
               }
           );
       }
   );

});

router.get('/create', async (req, res) => {
    res.render('users/create');
});

/**
 * Query database to get list of genders, types of work,
 * levels of education, then send these list to view users/update.ejs
 */
router.get('/update', async (req, res) => {
    let selectAllGendersSql =
        "select * " +
        "from " + commonResources.GENDERS_TABLE_NAME + ";";
    dbConnect.query(selectAllGendersSql, function (err, gendersResult) {
        if (err) throw err;

        let selectAllLevelsOfEducationSql =
            "select * " +
            "from " + commonResources.LEVELS_OF_EDUCATION_TABLE_NAME + ";";
        dbConnect.query(
            selectAllLevelsOfEducationSql,
            function (err, levelsOfEducationResult) {
                if (err) throw err;

                let selectAllTypesOfWorkSql =
                    "select * " +
                    "from " + commonResources.TYPES_OF_WORK_TABLE_NAME + ";";
                dbConnect.query(
                    selectAllTypesOfWorkSql,
                    function (err, typesOfWorkResult) {
                        if (err) throw err;


                        res.render(
                            "users/update",
                            {
                                    gendersResult,
                                    levelsOfEducationResult,
                                    typesOfWorkResult
                                }
                            );
                });
            });
    });
});

router.post('/create-save', async (req, res) => {
    var fullName = req.body.fullName.trim();
    var phone = req.body.phone.trim();
    var email = req.body.email.trim();
    var password = req.body.password.trim();
    var isPassValidate = false;

    // Validate
    if (fullName.length === 0) {
        res.send("Hãy nhập họ và tên");
        return;
    }

    if (fullName.length < 2) {
        res.send("Nhập họ tên từ hai ký tự trở lên.");
        return;
    }

    if (phone.length === 0) {
        res.send("Hãy nhập số điện thoại");
        return;
    }

    let regexPhone = /\d{9,10}/; // 9-10 digits
    if (!phone.match(regexPhone)) {
        res.send("Nhập số điện thoại 9 - 10 chữ số.");
        return;
    }

    isPhoneExists(phone, function (isPhoneExistsResult) {
        if (isPhoneExistsResult) {
            res.send("Trùng số điện thoại.");
        }
    });

    if (email.length === 0) {
        res.send("Hãy nhập email.");
        return;
    }

    let regexEmail = /\w{1,}@\w{1,}.\w{1,}/; // anyword@anyword.anyword
    if (!email.match(regexEmail)) {
        res.send("Hãy nhập email đúng định dạng.");
        return;
    }

    isEmailExitst(email, function (isEmailExistsResult) {
        if (isEmailExistsResult) {
            res.send("Trùng email.");
        }
    });

    if (password.length === 0) {
        res.send("Hãy nhập password.");
        return;
    }

    if (password.length < 6) {
        res.send("Nhập mật khẩu từ 6 ký tự trở lên.");
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
    dbConnect.query(saveUserToDbSql, function (err, result) {
       if (err) throw err;
       res.redirect('/users/');
    });
});

function isPhoneExists(phone, callback) {
    var selectNumberOfRecordHasThisPhoneNumberSql =
        "select count(" + commonResources.USERS_COLUMN_PHONE + ") " +
            " as countPhone " +
        "from " + commonResources.USERS_TABLE_NAME + " " +
        "where " + commonResources.USERS_COLUMN_PHONE + " " +
            "like '" + phone + "';";
    dbConnect.query(
        selectNumberOfRecordHasThisPhoneNumberSql,
        function (err, results) {
            if (err) throw err;

            // [{"countPhone":1}]
            var numberOfPhoneExists = results[0].countPhone;
            if (numberOfPhoneExists) {
                return callback(true);
            } else {
                return callback(false);
            }
        }
    );
}

function isEmailExitst(email, callback) {
    var selectNumberOfRecordsHasThisEmailSql =
        "select count(" + commonResources.USERS_COLUMN_EMAIL + ") " +
        "as numbersOfEmailExists " +
        "from " + commonResources.USERS_TABLE_NAME + " " +
        "where " + commonResources.USERS_COLUMN_EMAIL + " " +
        "like '" + email + "';"
    dbConnect.query(
        selectNumberOfRecordsHasThisEmailSql,
        function (err, results) {
            if (err) throw err;

            // [ { numbersOfEmailExists: 0 } ]
            let numsOfEmailExists = results[0].numbersOfEmailExists;
            if (numsOfEmailExists) {
                return callback(true);
            } else {
                return callback(false);
            }
        }
    );
}

module.exports = router;
