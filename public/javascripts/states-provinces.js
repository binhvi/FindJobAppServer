const commonResources = require('./common');
const dbConnect = require('./db');

function checkIfStateProvinceIdExists(stateProvinceId, callback) {
    let selectNumberOfStateProvinceRecordsHaveThisIdSql =
        "select count(" +
            commonResources.STATE_PROVINCES_COLUMN_ID + ") " +
            "as numbersOfStateProvinceHaveThisId " +
        "from " + commonResources.STATE_PROVINCES_TABLE_NAME + " " +
        "where " +
            commonResources.STATE_PROVINCES_COLUMN_ID + " = ?;";
    dbConnect.query(
        selectNumberOfStateProvinceRecordsHaveThisIdSql,
        [stateProvinceId],
        function (err, result) {
            if (err) {
                // If err not null -> result null
                return callback(err, null);
            }

            // [
            //     {
            //         "numbersOfStateProvinceHaveThisId" : 1
            //     }
            // ]
            let numbersOfStateProvinceHaveThisId =
                result[0].numbersOfStateProvinceHaveThisId;
            if (numbersOfStateProvinceHaveThisId > 0) {
                // If have result, result not null, err is null
                return callback(null, true);
            } else {
                // If have result, result not null, err is null
                return callback(null, false);
            }
        }
    );
}

module.exports.checkIfStateProvinceIdExists =
                                        checkIfStateProvinceIdExists;