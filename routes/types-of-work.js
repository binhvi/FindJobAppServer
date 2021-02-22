var express = require('express');
var router = express.Router();
var commonResources = require('../public/javascripts/common');
var dbConnect = require('../public/javascripts/db');

router.get('/', async (req, res) => {
    let selectAllTypesOfWorkSql =
        "select * " +
        "from " + commonResources.TYPES_OF_WORK_TABLE_NAME + ";";
    dbConnect.query(selectAllTypesOfWorkSql, function (err, result, fields) {
        if (err) throw err;
        let typesOfWork = result;
        res.render("types-of-work/index", {typesOfWork});
    });
});

function getTypesOfWork(callback) {
    let selectAllTypesOfWorkSql =
        "select * " +
        "from " + commonResources.TYPES_OF_WORK_TABLE_NAME + ";";
    dbConnect.query(selectAllTypesOfWorkSql, function (err, result) {
        if (err) throw err;
        return callback(result);
    });
}

function checkIfTypeOfWorkIdExists(typeOfWorkId, callback) {
    let selectNumberTypeOfWorkHaveThisIdSql =
        "select count(" + commonResources.TYPES_OF_WORK_COLUMN_ID + ") " +
            "as numbersOfTypeOfWorkHaveThisId" + " " +
        "from " + commonResources.TYPES_OF_WORK_TABLE_NAME + " " +
        "where " + commonResources.TYPES_OF_WORK_COLUMN_ID + " = ?;";
    dbConnect.query(
        selectNumberTypeOfWorkHaveThisIdSql,
        [typeOfWorkId],
        function (err, result) {
            if (err) throw err;
            return callback(result);
        }
    );
}

module.exports = router;
module.exports.getTypesOfWork = getTypesOfWork;
module.exports.checkIfTypeOfWorkIdExists = checkIfTypeOfWorkIdExists;