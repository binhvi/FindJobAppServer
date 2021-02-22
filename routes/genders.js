var express = require('express');
var router = express.Router();
var commonResources = require('../public/javascripts/common');
var dbConnect = require('../public/javascripts/db');

router.get('/', async (req, res) => {
    let selectAllGendersSql =
        "select * " +
        "from " + commonResources.GENDERS_TABLE_NAME + ";";
    dbConnect.query(selectAllGendersSql, function (err, result, fields) {
       if (err) throw err;
       let genders = result;
       res.render("genders/index", {genders});
    });
});

function getGenders(callback) {
    let selectAllGendersSql =
        "select * " +
        "from " + commonResources.GENDERS_TABLE_NAME + " " +
        "order by " + commonResources.GENDERS_COLUMN_ID + " desc;"
    dbConnect.query(selectAllGendersSql, function (err, result) {
        if (err) throw err;
        return callback(result);
    });
}

function checkIfGenderIdExists(genderId, callback) {
    let selectNumbersOfGenderHaveThisIdSql =
        "select count(" + commonResources.GENDERS_COLUMN_ID + ") " +
            "as numbersOfGenderIdExist " +
        "from " + commonResources.GENDERS_TABLE_NAME + " " +
        "where " + commonResources.GENDERS_COLUMN_ID + " = ?;";
    dbConnect.query(
        selectNumbersOfGenderHaveThisIdSql,
        [genderId],
        function (err, result) {
            if (err) throw err;
            return callback(result);
        }
    );
}

module.exports = router;
module.exports.getGenders = getGenders;
module.exports.checkIfGenderIdExists = checkIfGenderIdExists;