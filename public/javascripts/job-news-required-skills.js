const commonResources = require('./common');
const dbConnect = require('./db');

function deleteAllRequiredJobSkillsOfAJobNews(jobNewsId, callback) {
    let deleteAllRequiredJobSkillsOfAJobNewsSql =
        "delete from " +
            commonResources.JOB_NEWS_REQUIRED_SKILLS_TABLE_NAME + " " +
        "where " +
            commonResources.JOB_NEWS_REQUIRED_SKILLS_COL_JOB_NEWS_ID
            + " = ?;";
    dbConnect.query(
        deleteAllRequiredJobSkillsOfAJobNewsSql,
        [jobNewsId],
        function (err, result) {
            // Callback function has 2 params: err, result
            if (err) {
                return callback(err, null); // return result is null
            }
            return callback(null, result); // err is null
        }
    );
}

module.exports.deleteAllRequiredJobSkillsOfAJobNews =
                                    deleteAllRequiredJobSkillsOfAJobNews;