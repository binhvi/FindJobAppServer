var express = require('express');
var router = express.Router();
var commonResources = require('../public/javascripts/common');
var dbConnect = require('../public/javascripts/db');

router.get('/', async (req, res) => {
    // If not logged in, go to log in page
    if (!req.session.loggedin) {
        res.redirect('/login');
        return;
    }

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
    let selectNumberOfTypeOfWorkRecordsHaveThisIdSql =
        "select count(" +
            commonResources.TYPES_OF_WORK_COLUMN_ID + ") " +
        "as numberOfTypeOfWorkHaveThisId " +
        "from " + commonResources.TYPES_OF_WORK_TABLE_NAME + " " +
        "where " + commonResources.TYPES_OF_WORK_COLUMN_ID + " = ?;"
    dbConnect.query(
        selectNumberOfTypeOfWorkRecordsHaveThisIdSql,
        [typeOfWorkId],
        function (err, result) {
            if (err) {
                // Callback function has 2 params: err, result
                // If err not null -> result null
                return callback(err, null); // Result is null here
            }

            // [
            //     {
            //         "numberOfTypeOfWorkHaveThisId" : 1
            //     }
            // ]
            let numberOfTypeOfWorkHaveThisId =
                result[0].numberOfTypeOfWorkHaveThisId;
            // Result is not null here, so err is null
            if (numberOfTypeOfWorkHaveThisId > 0) {
                return callback(null, //err
                                true); // result
            } else {
                return callback(null, // err
                                false); // result
            }
        }
    );
}

module.exports = router;
module.exports.getTypesOfWork = getTypesOfWork;
module.exports.checkIfTypeOfWorkIdExists = checkIfTypeOfWorkIdExists;