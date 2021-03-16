const commonResources = require('./common');
const dbConnect = require('./db');

function checkIfDistrictIdExists(districtId, callback) {
    let selectNumberOfDistrictRecordsHaveThisIdSql =
        "select count(" +
            commonResources.DISTRICTS_COLUMN_ID + ") " +
        "as numberOfDistrictsHaveThisId " +
        "from " + commonResources.DISTRICTS_TABLE_NAME + " " +
        "where " +
            commonResources.DISTRICTS_COLUMN_ID + " = ?;"
    dbConnect.query(
        selectNumberOfDistrictRecordsHaveThisIdSql,
        [districtId],
        function (err, result) {
            if (err) {
                // If err not null -> result null
                return callback(err, null); // Second arg is result
            }

            // [
            //     {
            //         "numberOfDistrictsHaveThisId" : 1
            //     }
            // ]
            let numberOfDistrictsHaveThisId =
                result[0].numberOfDistrictsHaveThisId;
            if (numberOfDistrictsHaveThisId > 0) {
                // If have result, result not null, err is null
                return callback(null, true); // First arg is err
            } else {
                // If have result, result not null, err is null
                return callback(null, false);
            }
        }
    );
}

module.exports.checkIfDistrictIdExists = checkIfDistrictIdExists;