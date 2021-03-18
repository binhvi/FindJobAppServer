const commonResources = require('./common');
const dbConnect = require('./db');

function checkIfSubDistrictIdExists(subdistrictId, callback) {
    let selectNumberOfSubdistrictRecordsHaveThisIdSql =
        "select count(" +
            commonResources.SUBDISTRICTS_COLUMN_ID + ") " +
        "as numberOfSubdistrictsHaveThisId " +
        "from " + commonResources.SUBDISTRICTS_TABLE_NAME + " " +
        "where " + commonResources.SUBDISTRICTS_COLUMN_ID + " = ?;";
    dbConnect.query(
        selectNumberOfSubdistrictRecordsHaveThisIdSql,
        [subdistrictId],
        function (err, result) {
            if (err) {
                // callback function has 2 params: err, result
                // If err not null -> result null
                return callback(err, null); // Second arg is result
            }

            // [
            //     {
            //         "numberOfSubdistrictsHaveThisId" : 1
            //     }
            // ]
            let numberOfSubdistrictsHaveThisId =
                result[0].numberOfSubdistrictsHaveThisId;
            if (numberOfSubdistrictsHaveThisId > 0) {
                // If have result, result not null, err is null
                return callback(null, true); // First arg is err
            } else {
                // If have result, result not null, err is null
                return callback(null, false);
            }
        }
    );
}

module.exports.checkIfSubDistrictIdExists = checkIfSubDistrictIdExists;