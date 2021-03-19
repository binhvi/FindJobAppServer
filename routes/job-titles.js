const express = require('express');
const router = express.Router();
const commonResources = require('../public/javascripts/common');
const dbConnect = require('../public/javascripts/db');

router.get('/', (req, res) => {
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

module.exports = router;