const commonResources = require('./common');
const dbConnect = require('./db');

function checkIfThisUserHasAppliedForThisJobNewsBefore(
    userId, jobNewsId, callback) {
    let selectNumberOfApplyForThisJobOfThisUserSql =
        "select count(*) as numberOfApplyForThisJobOfThisUser \n" +
        "from " +
            commonResources.JOB_APPLICATIONS_TABLE_NAME + " " +
        "where " +
            commonResources.JOB_APPLICATIONS_COL_USER_ID + " = ? and " +
            commonResources.JOB_APPLICATIONS_COL_JOB_NEWS_ID + " = ?;";
    dbConnect.query(
        selectNumberOfApplyForThisJobOfThisUserSql,
        [userId, jobNewsId],
        function (err, result) {
            if (err) {
                // Callback function has 2 params: err, result
                // If err not null -> result null
                return callback(err, null); // Result is null here
            }

            // [
            //     {
            //         "numberOfApplyForThisJobOfThisUser" : 1
            //     }
            // ]
            let numberOfApplyForThisJobOfThisUser =
                result[0].numberOfApplyForThisJobOfThisUser;
            // Result is not null here, so err is null
            if (numberOfApplyForThisJobOfThisUser > 0) {
                return callback(null, // err
                                true); // result
            } else {
                return callback(null, // err
                                false); // result
            }
        }
    );
}

module.exports.checkIfThisUserHasAppliedForThisJobNewsBefore =
                        checkIfThisUserHasAppliedForThisJobNewsBefore;