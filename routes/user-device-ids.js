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

    let selectAllUserDeviceIdSql =
        "select " +
            commonResources.USER_DEVICE_IDS_COL_DEVICE_ID_STRING + " " +
        " from " +
            commonResources.USER_DEVICE_IDS_TABLE_NAME + ";";
    dbConnect.query(
        selectAllUserDeviceIdSql,
        function (err, result) {
            if (err) {
                res.send("Có lỗi xảy ra khi truy vấn ID thiết bị.");
                return;
            }

            let userDeviceIds = result;
            res.render("user-device-ids/index", {userDeviceIds});
        }
    );
});

function checkIfDeviceIdExists(deviceIdString, callback) {
    let selectNumberOfDeviceIdRecordsHaveThisIdSql =
        "select count(" +
            commonResources.USER_DEVICE_IDS_COL_DEVICE_ID_STRING + ") " +
        "as numberOfRecordsHaveThisId " +
        "from " + commonResources.USER_DEVICE_IDS_TABLE_NAME + " " +
        "where " + commonResources.USER_DEVICE_IDS_COL_DEVICE_ID_STRING
        + " = ?;";
    dbConnect.query(
        selectNumberOfDeviceIdRecordsHaveThisIdSql,
        [deviceIdString],
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
            let numberOfRecordsHaveThisId =
                result[0].numberOfRecordsHaveThisId;
            if (numberOfRecordsHaveThisId > 0) {
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
module.exports.checkIfDeviceIdExists = checkIfDeviceIdExists;