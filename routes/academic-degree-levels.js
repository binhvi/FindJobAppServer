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

function checkIfAcademicDegreeLevelIdExists(id, callback) {
    let selectNumberOfAcademyDegreeLevelsHaveThisIdSql =
        "select count(" +
            commonResources.ACADEMIC_DEGREE_LEVELS_COLUMN_ID
            + ") as numberOfAcademicDegreeLevelsHaveThisId " +
        "from " + commonResources.ACADEMIC_DEGREE_LEVELS_TABLE_NAME + " " +
        "where " +
            commonResources.ACADEMIC_DEGREE_LEVELS_COLUMN_ID + " = ?;";
    dbConnect.query(
        selectNumberOfAcademyDegreeLevelsHaveThisIdSql,
        [id],
        function (err, result) {
            if (err) throw err;
            // [{"numberOfAcademicDegreeLevelsHaveThisId" : 0}]
            let numberOfAcademicDegreeLevelsHaveThisId =
                result[0].numberOfAcademicDegreeLevelsHaveThisId;
            if (numberOfAcademicDegreeLevelsHaveThisId > 0) {
                return callback(true);
            } else {
                return callback(false);
            }
        }
    );
}

module.exports = router;
module.exports.checkIfAcademicDegreeLevelIdExists =
                                    checkIfAcademicDegreeLevelIdExists;