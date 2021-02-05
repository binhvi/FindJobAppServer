var express = require('express');
var router = express.Router();
var commonResources = require('../public/javascripts/common');
var dbConnect = require('../public/javascripts/db');

router.get('/', async (req, res) => {
    let selectAllAcademicDegreeLevelsSql =
        "select * " +
        "from " + commonResources.ACADEMIC_DEGREE_LEVELS_TABLE_NAME + " " +
        "order by " + commonResources.ACADEMIC_DEGREE_LEVELS_COLUMN_ID + ";";
    dbConnect.query(
        selectAllAcademicDegreeLevelsSql,
        function (err, result) {
            if (err) throw err;
            let academicDegreeLevels = result;
            res.render(
                "academic-degree-levels/index",
                {academicDegreeLevels}
            );
    });
});

module.exports = router;