const commonResources = require('./common');
const dbConnect = require('./db');

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

module.exports.deleteAllJobSkillDataOfOneUser =
                                        deleteAllJobSkillDataOfOneUser;