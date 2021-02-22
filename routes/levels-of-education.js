var express = require('express');
var router = express.Router();
var commonResources = require('../public/javascripts/common');
var dbConnect = require('../public/javascripts/db');

router.get('/', async (req, res) => {
    let selectAllLevelsOfEducationSql =
        "select * " +
        "from " + commonResources.LEVELS_OF_EDUCATION_TABLE_NAME + ";";
    dbConnect.query(
        selectAllLevelsOfEducationSql,
        function (err, result, fields) {
            if (err) throw err;
            let levelsOfEducation = result;
            res.render(
                "levels-of-education/index",
                {levelsOfEducation}
                );
    });
});

function getLevelsOfEducation(callback) {
    let selectAllLevelsOfEducationSql =
        "select * " +
        "from " + commonResources.LEVELS_OF_EDUCATION_TABLE_NAME + ";";
    dbConnect.query(
        selectAllLevelsOfEducationSql,
        function (err, result) {
            if (err) throw err;
            return callback(result);
        }
    );
}

function checkIfLevelOfEducationIdExists(levelOfEducationId, callback) {
    let selectNumbersLevelEducationHaveThisIdSql =
        "select count(" +
            commonResources.LEVELS_OF_EDUCATION_COLUMN_ID + ") " +
            "as numbersOfLevelEducationHasThisId" + " " +
        "from " + commonResources.LEVELS_OF_EDUCATION_TABLE_NAME + " " +
        "where " + commonResources.LEVELS_OF_EDUCATION_COLUMN_ID + " = ?;";
    dbConnect.query(
        selectNumbersLevelEducationHaveThisIdSql,
        [levelOfEducationId],
        function (err, result) {
            if (err) throw err;
            return callback(result);
        }
    );
}

module.exports = router;
module.exports.getLevelsOfEducation = getLevelsOfEducation;
module.exports.checkIfLevelOfEducationIdExists =
                                        checkIfLevelOfEducationIdExists;