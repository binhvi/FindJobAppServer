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

module.exports = router;