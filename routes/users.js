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

                "left join " + commonResources.SUBDISTRICTS_TABLE_NAME
                + " " + "on " +
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
            commonResources.USERS_COLUMN_FULL_NAME + " " +
                "like '%" + keyword + "%' " +
        "order by " +
            commonResources.USERS_TABLE_NAME + "." +
            commonResources.USERS_COLUMN_ID + " desc";

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
       [userId],
       function (err, userResult) {
           if (err) throw err;
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
                                   res.render(
                                       'users/details',
                                       {
                                           user, experiences,
                                           educationResult,
                                           jobSkills,
                                           moment
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

function checkIfPhoneExistsWhenCreateUser(phone, callback) {
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

function checkIfPhoneExistsWhenUpdateUser(phone, userId, callback) {
    var selectNumberOfRecordHasThisPhoneNumberSql =
        "select count(" + commonResources.USERS_COLUMN_PHONE + ") " +
        " as countPhone " +
        "from " + commonResources.USERS_TABLE_NAME + " " +
        "where " + commonResources.USERS_COLUMN_PHONE + " " +
        "like '" + phone + "' " +
        "and " + commonResources.USERS_COLUMN_ID + " != ?;";
    dbConnect.query(
        selectNumberOfRecordHasThisPhoneNumberSql,
        [userId],
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


function checkIfEmailExistsWhenCreateUser(email, callback) {
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

function checkIfEmailExistsWhenUpdateUser(email, userId, callback) {
    var selectNumberOfRecordsHasThisEmailSql =
        "select count(" + commonResources.USERS_COLUMN_EMAIL + ") " +
        "as numbersOfEmailExists " +
        "from " + commonResources.USERS_TABLE_NAME + " " +
        "where " + commonResources.USERS_COLUMN_EMAIL + " " +
            "like '" + email + "' " +
            "and " + commonResources.USERS_COLUMN_ID + " != ?;";
    dbConnect.query(
        selectNumberOfRecordsHasThisEmailSql,
        [userId],
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

router.post('/remove', async (req, res) => {
   let userId = req.body.userId;
    let deleteEduRecordByIdSql =
        "delete from " +
            commonResources.EDUCATION_TABLE_NAME + " " +
        "where " + commonResources.EDUCATION_COLUMN_USER_ID +
            " = ?;";
    dbConnect.query(
        deleteEduRecordByIdSql,
        [userId],
        function (deleteEduByUserIdErr, deleteEduByUserIdResult) {
            if (deleteEduByUserIdErr) throw deleteEduByUserIdErr;

            let deleteExperienceByUserIdSql =
                "delete from " +
                    commonResources.EXPERIENCES_TABLE_NAME + " " +
                "where " +
                    commonResources.EXPERIENCES_COLUMN_USER_ID + " = ?";
            dbConnect.query(
                deleteExperienceByUserIdSql,
                [userId],
                function (deleteExperienceErr, deleteExperienceResult) {
                    if (deleteExperienceErr) {
                        throw deleteExperienceErr;
                    }

                    let deleteJobSkillsByUserIdSql =
                        "delete from " +
                            commonResources
                                .JOB_SKILLS_OF_CANDIDATE_TABLE_NAME + " " +
                        "where " +
                            commonResources
                                .JOB_SKILLS_OF_CANDIDATE_COLUMN_USER_ID
                            + " = ?;";
                    dbConnect.query(
                        deleteJobSkillsByUserIdSql,
                        [userId],
                        function (deleteJobSkillsErr, deleteJobSkillsResult) {
                            if (deleteJobSkillsErr) {
                                throw deleteJobSkillsErr;
                            }

                            let deleteUserByIdSql =
                                "delete from " + commonResources.USERS_TABLE_NAME + " " +
                                "where " + commonResources.USERS_COLUMN_ID + " = ?;";
                            dbConnect.query(
                                deleteUserByIdSql,
                                [userId],
                                function (err, result) {
                                    if (err) throw err;
                                    res.redirect('/users/');
                                }
                            );
                        }
                    );
                }
            );
        }
    );
});

function checkIfUserIdExists(userId, callback) {
    let selectNumberOfUserRecordsHaveThisIdSql =
        "select count(" +
            commonResources.USERS_COLUMN_ID + ") " +
            "as numberOfUsersHaveThisId " +
        "from " + commonResources.USERS_TABLE_NAME + " " +
        "where " + commonResources.USERS_COLUMN_ID + " = ?;"
    dbConnect.query(
        selectNumberOfUserRecordsHaveThisIdSql,
        [userId],
        function (err, result) {
            if (err) throw err;

            // [
            //     {
            //         "numberOfUsersHaveThisId" : 1
            //     }
            // ]
            let numberOfUsersHaveThisId =
                result[0].numberOfUsersHaveThisId;
            if (numberOfUsersHaveThisId > 0) {
                return callback(true);
            } else {
                return callback(false);
            }
        }
    );
}

module.exports = router;
module.exports.checkIfPhoneExistsWhenCreateUser = checkIfPhoneExistsWhenCreateUser;
module.exports.checkIfEmailExistsWhenCreateUser = checkIfEmailExistsWhenCreateUser;
module.exports.checkIfPhoneExistsWhenUpdateUser =
                                        checkIfPhoneExistsWhenUpdateUser;
module.exports.checkIfEmailExistsWhenUpdateUser =
                                        checkIfEmailExistsWhenUpdateUser;
module.exports.checkIfUserIdExists = checkIfUserIdExists;