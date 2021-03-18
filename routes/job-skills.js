const express = require('express');
const router = express.Router();
const commonResources = require('../public/javascripts/common');
const dbConnect = require('../public/javascripts/db');

router.get('/', (req, res) => {
   let selectAllJobSkillsSql =
        "select * " +
        "from " + commonResources.JOB_SKILLS_TABLE_NAME + " " +
        "order by " + commonResources.JOB_SKILLS_COLUMN_ID + ";";
   dbConnect.query(
       selectAllJobSkillsSql,
       function(err, result) {
           if (err) {
               throw err;
           }
           let jobSkills = result;
           res.render("job-skills/index", {jobSkills})
       }
   );
});

function checkIfJobSkillIdExists(jobSkillId, callback) {
    let selectNumberOfJobSkillRecordsHaveThisIdSql =
        "select count(" +
            commonResources.JOB_SKILLS_COLUMN_ID + ") " +
        "as numberOfJobSkillsHaveThisId " +
        "from " + commonResources.JOB_SKILLS_TABLE_NAME + " " +
        "where " + commonResources.JOB_SKILLS_COLUMN_ID + " = ?;";
    dbConnect.query(
        selectNumberOfJobSkillRecordsHaveThisIdSql,
        [jobSkillId],
        function (err, result) {
            if (err) {
                // Callback function has 2 params: err, result
                // If err not null -> result null
                return callback(err, null);
            }

            // [
            //     {
            //         "numberOfJobSkillsHaveThisId" : 1
            //     }
            // ]
            let numberOfJobSkillsHaveThisId =
                result[0].numberOfJobSkillsHaveThisId;
            if (numberOfJobSkillsHaveThisId > 0) {
                // If have result, result not null, err is null
                return callback(null, true); // First arg is err
            } else {
                // If have result, result not null, err is null
                return callback(null, false);
            }
        }
    );
}

module.exports = router;
module.exports.checkIfJobSkillIdExists = checkIfJobSkillIdExists;