const commonResources = require('./common');
const mysql = require('mysql');

var dbConfig = {
    host: commonResources.MY_SQL_HOST,
    user: commonResources.MY_SQL_USER,
    password: commonResources.MY_SQL_PASSWORD,
    database: commonResources.MY_SQL_DATABASE_NAME
};
var dbConnect;

function handleDisconnect() {
    // Recreate the connection, since
    // the old one cannot be reused.
    dbConnect = mysql.createConnection(dbConfig);

    // The server is either down
    // or restarting (takes a while sometimes).
    dbConnect.connect(function (err) {
        if (err) {
            console.log('Error when connecting to db:', err);
            console.trace();
            // We introduce a delay before attempting to reconnect,
            // process asynchronous requests in the meantime.
            // If you're also serving http, display a 503 error.
            setTimeout(handleDisconnect, 2000);
        }
    });

    dbConnect.on('error', function (err) {
        console.log('DB error', err);
        // Connection to the MySQL server is usually
        // lost due to either server restart, or a
        // connnection idle timeout (the wait_timeout
        // server variable configures this)
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}

handleDisconnect();

module.exports = dbConnect;