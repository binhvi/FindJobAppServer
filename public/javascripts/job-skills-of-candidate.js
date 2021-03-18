const commonResources = require('./common');
const dbConnect = require('./db');

function checkIfSkillOfUserExisted(userId, jobSkillId, callback) {
    let selectCountOfRecordHasThisUserIdAndJobSkillIdSql =
        "select count(*) as numberOfRecordsHaveThisUserIdAndJobSkillId " +
        "from " +
            commonResources.JOB_SKILLS_OF_CANDIDATE_TABLE_NAME + " " +
        "where " +
            commonResources.JOB_SKILLS_OF_CANDIDATE_COLUMN_USER_ID +
            " = ? " +
            "and " +
            commonResources.JOB_SKILLS_OF_CANDIDATE_COLUMN_JOB_SKILLS_ID
            + " = ?;"
    dbConnect.query(
        selectCountOfRecordHasThisUserIdAndJobSkillIdSql,
        [userId, jobSkillId],
        function (err, result) {
            if (err) {
                // Callback function has 2 params: err, result
                // If query got error, result is null
                return callback(err, null);
            }

            // [
            //     {
            //         "numberOfRecordsHaveThisUserIdAndJobSkillId" : 1
            //     }
            // ]
            let numberOfRecordsHaveThisUserIdAndJobSkillId =
                result[0].numberOfRecordsHaveThisUserIdAndJobSkillId;
            if (numberOfRecordsHaveThisUserIdAndJobSkillId > 0) {
                // If query got no error, so first param
                // of callback functio is err is null
                return callback(null, true);
            } else {
                // If query got no error, so first param
                // of callback functio is err is null
                return callback(null, false);
            }
        }
    );
}

function deleteAllJobSkillDataOfOneUser(userId, callback) {
    let deleteAllJobSkillDataOfOneUserSql =
        "delete from " +
            commonResources.JOB_SKILLS_OF_CANDIDATE_TABLE_NAME + " " +
        "where " +
            commonResources.JOB_SKILLS_OF_CANDIDATE_COLUMN_USER_ID
            + " = ?;";
    dbConnect.query(
        deleteAllJobSkillDataOfOneUserSql,
        [userId],
        function (err, result) {
            if (err) {
                return callback(err);
            }
        }
    );
}

module.exports.checkIfSkillOfUserExisted = checkIfSkillOfUserExisted;
module.exports.deleteAllJobSkillDataOfOneUser =
                                        deleteAllJobSkillDataOfOneUser;