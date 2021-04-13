const express = require('express');
const router = express.Router();
const commonResources = require('../public/javascripts/common');
const dbConnect = require('../public/javascripts/db');

router.get('/', (req, res) => {
    // If not logged in, go to log in page
    if (!req.session.loggedin) {
        res.redirect('/login');
        return;
    }

   let selectAllJobTitlesSql =
       "select * from " +
            commonResources.JOB_TITLES_TABLE_NAME + " " +
       "order by " +
            commonResources.JOB_TITLES_COLUMN_ID + ";";
   dbConnect.query(
        selectAllJobTitlesSql,
        function(err, result) {
           if (err) {
              throw err;
           }

           let jobTitles = result;
           res.render("job-titles/index", {jobTitles});
        }
    );
});

function checkIfJobTitleIdExists(jobTitleId, callback) {
    let selectNumberOfJobTitleRecordsHaveThisIdSql =
        "select count(" +
            commonResources.JOB_TITLES_COLUMN_ID + ") " +
        "as numberOfJobTitleHaveThisId " +
        "from " + commonResources.JOB_TITLES_TABLE_NAME + " " +
        "where " + commonResources.JOB_TITLES_COLUMN_ID + " = ?;";
    dbConnect.query(
        selectNumberOfJobTitleRecordsHaveThisIdSql,
        [jobTitleId],
        function (err, result) {
            if (err) {
                // Callback function has 2 params: err, result
                // If err not null -> result null
                return callback(err, null); // Result is null here
            }

            // [
            //     {
            //         "numberOfJobTitleHaveThisId" : 1
            //     }
            // ]
            let numberOfJobTitleHaveThisId =
                result[0].numberOfJobTitleHaveThisId;
            // Result is not null here, so err is null
            if (numberOfJobTitleHaveThisId > 0) {
                return callback(null, // err
                                true); // result
            } else {
                return callback(null, // err
                                false); // result
            }
        }
    );
}

module.exports = router;
module.exports.checkIfJobTitleIdExists = checkIfJobTitleIdExists;