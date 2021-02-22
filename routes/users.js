var express = require('express');
var router = express.Router();
var commonResources = require('../public/javascripts/common');
var dbConnect = require('../public/javascripts/db');
const moment = require('moment');
const genderModule = require('./genders');
const levelsOfEducationModule = require('./levels-of-education');
const typesOfWorkModule = require('./types-of-work');
var uniqid = require('uniqid');


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

router.post('/create-save', async (req, res) => {
    var fullName = req.body.fullName.trim();
    var phone = req.body.phone.trim();
    var email = req.body.email.trim();
    var password = req.body.password.trim();

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

    checkIfPhoneExistsWhenCreateUser(phone, function (isPhoneExists) {
        if (isPhoneExists) {
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

    checkIfEmailExistsWhenCreateUser(email, function (isEmailExists) {
        if (isEmailExists) {
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

router.post('/update', async (req, res) => {
   let userId = req.body.userId;
   let selectUserDetailsSql =
       "select * from " + commonResources.USERS_TABLE_NAME + " " +
       "where " + commonResources.USERS_COLUMN_ID + " = ?";
   dbConnect.query(
       selectUserDetailsSql,
       [userId],
       function (err, result) {
           if (err) throw err;
           let user = result[0]; // result is an array

           genderModule.getGenders(
               function (genders) {

                   levelsOfEducationModule.getLevelsOfEducation(
                       function (levelsOfEducation) {

                            typesOfWorkModule.getTypesOfWork(
                                function (typesOfWork) {
                                    res.render(
                                        'users/update',
                                        {
                                            user, moment, genders,
                                            levelsOfEducation,
                                            typesOfWork
                                        }
                                    );
                                }
                            );
                       }
                   );

               }
           );
       }
   )
});

router.post('/update-save', async (req, res) => {
    let id = req.body.id.trim();
    let selectUserByIdSql =
        "select " + commonResources.USERS_COLUMN_ID + " " +
        "from " + commonResources.USERS_TABLE_NAME + " " +
        "where " + commonResources.USERS_COLUMN_ID + " = ?";
    dbConnect.query(
        selectUserByIdSql,
        [id],
        async function (err, selectUserByIdResult) {
            if (err) throw err;
            if (selectUserByIdResult.length === 0) {
                res.send("Không tìm thấy thông tin người dùng");
            } else {
                // Validate
                // fullName
                if (req.body.fullName === undefined) {
                    res.send("Thiếu trường fullName.");
                    return;
                }
                let fullName = req.body.fullName.trim();
                if (fullName.length === 0) {
                    res.send("Hãy nhập họ và tên");
                    return;
                }

                if (fullName.length < 2) {
                    res.send("Nhập họ tên từ hai ký tự trở lên.");
                    return;
                }

                // Phone
                if (req.body.phone === undefined) {
                    res.send("Thiếu trường phone.");
                    return;
                }

                let phone = req.body.phone.trim();
                if (phone.length === 0) {
                    res.send("Hãy nhập số điện thoại");
                    return;
                }

                if (!phone.match(commonResources.REGEX_PHONE)) {
                    res.send("Nhập số điện thoại 9 - 10 chữ số.");
                    return;
                }

                checkIfPhoneExistsWhenUpdateUser(
                    phone,
                    id,
                    function (isPhoneExists) {
                        if (isPhoneExists) {
                            res.send("Trùng số điện thoại.");
                        } else {
                            // Pass validate phone, continue validate other fields
                            // Email
                            if (req.body.email === undefined) {
                                res.send("Thiếu trường email.");
                                return;
                            }

                            let email = req.body.email.trim();
                            if (email.length === 0) {
                                res.send("Hãy nhập email.");
                                return;
                            }

                            if (!email.match(commonResources.REGEX_EMAIL)) {
                                res.send("Hãy nhập email đúng định dạng.");
                                return;
                            }

                            checkIfEmailExistsWhenUpdateUser(
                                email,
                                id,
                                function (isEmailExists) {
                                    if (isEmailExists) {
                                        res.send("Trùng email.");
                                    } else {
                                        // Pass validate email,
                                        // go to validate other fields
                                        // Password
                                        if (req.body.password === undefined) {
                                            res.send("Thiếu trường password.");
                                            return;
                                        }

                                        let password = req.body.password.trim();
                                        if (password.length === 0) {
                                            res.send("Hãy nhập password.");
                                            return;
                                        }

                                        if (password.length < 6) {
                                            res.send("Nhập mật khẩu từ 6 ký tự trở lên.");
                                            return;
                                        }

                                        // If user don't upload new avatar file, don't need check
                                        // If user upload new file, check if file extension
                                        // is image format
                                        if(req.files &&
                                            !commonResources.isThisFileAnImage(
                                                req.files.avatar.name)) {
                                            // This file doesn't have extension webp|gif|png
                                            res.send("Hãy kiểm tra đúng định dạng ảnh" +
                                                " webp|jpg|png");
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
                                                res.send("Id giới tính phải là số");
                                                return;
                                            }

                                            genderId = Number(genderIdText);
                                            if (!Number.isInteger(genderId)) {
                                                // Gender id is decimal number
                                                res.send("Id giới tính phải là số nguyên");
                                                return;
                                            }

                                            genderModule.checkIfGenderIdExists(
                                                genderId,
                                                function (numbersOfGenderIdExistResult) {
                                                    // [{"numbersOfGenderIdExist":1}]
                                                    let numbersOfGenderIdExist =
                                                        numbersOfGenderIdExistResult[0]
                                                            .numbersOfGenderIdExist;
                                                    if (numbersOfGenderIdExist === 0) {
                                                        res.send(
                                                            "Id giới tính không tồn tại."
                                                        );
                                                    } else {
                                                        // Pass validate gender, go to validate
                                                        // other fields
                                                        // Birthday
                                                        let birthdayMillis;
                                                        if (req.body.birthdayText &&
                                                            req.body.birthdayText.trim().length) {
                                                            let birthdayText = req.body.birthdayText.trim();

                                                            if (!moment(
                                                                req.body.birthdayText.trim(),
                                                                commonResources.USER_BIRTHDAY_DATE_FORMAT,
                                                                true).isValid()) {
                                                                // If birthdayText is not undefined or empty
                                                                // and not match with pattern YYYY-MM-DD
                                                                res.send(
                                                                    "Nhập ngày sinh đúng định dạng " +
                                                                    commonResources.USER_BIRTHDAY_DATE_FORMAT
                                                                );
                                                                return;
                                                            }

                                                            // Convert date from text -> milliseconds
                                                            let birthdayDate = new Date(birthdayText);
                                                            birthdayMillis = birthdayDate.getTime();
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
                                                                res.send("Id trình độ học vấn phải là số");
                                                                return;
                                                            }

                                                            graduatedEducationId =
                                                                Number(graduatedEducationIdText);
                                                            if (!Number.isInteger(graduatedEducationId)) {
                                                                // graduatedEducationId is decimal number
                                                                res.send(
                                                                    "Id trình độ học vấn phải là số nguyên."
                                                                );
                                                                return;
                                                            }

                                                            levelsOfEducationModule
                                                                .checkIfLevelOfEducationIdExists(
                                                                    graduatedEducationId,
                                                                    function (
                                                                        numbersLevelEducationIdExistsQueryResult) {
                                                                        // [ RowDataPacket
                                                                        //      { numbersOfLevelEducationHasThisId: 1 }
                                                                        // ]
                                                                        let numbersLevelEducationIdExists =
                                                                            numbersLevelEducationIdExistsQueryResult[0]
                                                                                .numbersOfLevelEducationHasThisId;
                                                                        if (numbersLevelEducationIdExists === 0) {
                                                                            res.send("Id trình độ học vấn không tồn tại.");
                                                                        } else {
                                                                            // Pass validate levels of education
                                                                            // Go to validate other fields
                                                                            // Type of work
                                                                            let typeOfWorkId;
                                                                            // If req.body.typeOfWorkId
                                                                            // != undefined and != empty
                                                                            if (req.body.typeOfWorkId &&
                                                                                req.body.typeOfWorkId.trim().length) {
                                                                                let typeOfWorkIdText = req.body.typeOfWorkId.trim();

                                                                                if (isNaN(typeOfWorkIdText)) {
                                                                                    res.send("Id hình thức làm việc phải là số");
                                                                                    return;
                                                                                }

                                                                                typeOfWorkId = Number(typeOfWorkIdText);
                                                                                if (!Number.isInteger(typeOfWorkId)) {
                                                                                    // typeOfWorkId is decimal number
                                                                                    res.send(
                                                                                        "Id hình thức làm việc" +
                                                                                        " phải là số nguyên."
                                                                                    );
                                                                                    return;
                                                                                }

                                                                                typesOfWorkModule.checkIfTypeOfWorkIdExists(
                                                                                    typeOfWorkId,
                                                                                    async function (
                                                                                        numberTypeOfWorkHaveThisIdQueryResult) {
                                                                                        // [ { numbersOfTypeOfWorkHaveThisId: 1 } ]
                                                                                        let numberTypeOfWorkHaveThisId =
                                                                                            numberTypeOfWorkHaveThisIdQueryResult[0]
                                                                                                .numbersOfTypeOfWorkHaveThisId;
                                                                                        if (numberTypeOfWorkHaveThisId === 0) {
                                                                                            res.send(
                                                                                                "Id hình thức làm việc" +
                                                                                                " không tồn tại."
                                                                                            );
                                                                                        } else {
                                                                                            // Pass validate types of work
                                                                                            // Go to validate other fields
                                                                                            // Expected salary
                                                                                            let expectedSalaryInMillionVnd;
                                                                                            // If req.body.expectedSalaryInMillionVnd != undefined
                                                                                            // and != empty
                                                                                            if (req.body.expectedSalaryInMillionVnd &&
                                                                                                req.body.expectedSalaryInMillionVnd.trim().length) {
                                                                                                let expectedSalaryInMillionVndText =
                                                                                                    req.body.expectedSalaryInMillionVnd.trim();

                                                                                                if (isNaN(expectedSalaryInMillionVndText)) {
                                                                                                    res.send("Nhập mức lương mong muốn là số.");
                                                                                                    return;
                                                                                                }

                                                                                                expectedSalaryInMillionVnd =
                                                                                                    Number(expectedSalaryInMillionVndText);
                                                                                                if (!Number.isInteger(expectedSalaryInMillionVnd)) {
                                                                                                    res.send(
                                                                                                        "Nhập mức lương mong muốn là số nguyên"
                                                                                                    );
                                                                                                    return;
                                                                                                }

                                                                                                if (expectedSalaryInMillionVnd < 0) {
                                                                                                    res.send(
                                                                                                        "Nhập mức lương mong muốn " +
                                                                                                        "là số nguyên lớn hơn hoặc bằng 0."
                                                                                                    );
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
                                                                                                    res.send("Nhập số năm kinh nghiệm là số.");
                                                                                                    return;
                                                                                                }

                                                                                                yearsOfExperience =
                                                                                                    Number(yearsOfExperienceText);
                                                                                                if (!Number.isInteger(yearsOfExperience)) {
                                                                                                    res.send(
                                                                                                        "Nhập số năm kinh nghiệm là số nguyên."
                                                                                                    );
                                                                                                    return;
                                                                                                }

                                                                                                if (yearsOfExperience < 0) {
                                                                                                    res.send(
                                                                                                        "Nhập số năm kinh nghiệm " +
                                                                                                        "là số nguyên lớn hơn hoặc bằng 0."
                                                                                                    );
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

                                                                                            res.json({
                                                                                                fullName: fullName,
                                                                                                phone: phone,
                                                                                                email: email,
                                                                                                password: password,
                                                                                                genderId: genderId,
                                                                                                birthdayMillis: birthdayMillis,
                                                                                                address: address,
                                                                                                graduatedEducationId: graduatedEducationId,
                                                                                                typeOfWorkId: typeOfWorkId,
                                                                                                expectedSalaryInMillionVnd:
                                                                                                expectedSalaryInMillionVnd,
                                                                                                yearsOfExperience: yearsOfExperience,
                                                                                                resumeSummary: resumeSummary,
                                                                                                careerObjective: careerObjective,
                                                                                                avatarUrl: avatarUrl
                                                                                            });

                                                                                        }
                                                                                    }
                                                                                );
                                                                            }
                                                                        }
                                                                    }
                                                                );
                                                        }
                                                    }
                                                }
                                            );
                                        }
                                    }
                                });
                        }
                    });
            }
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

module.exports = router;
module.exports.checkIfPhoneExistsWhenCreateUser = checkIfPhoneExistsWhenCreateUser;
module.exports.checkIfEmailExistsWhenCreateUser = checkIfEmailExistsWhenCreateUser;