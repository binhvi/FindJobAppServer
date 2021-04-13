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

    let selectAllJobNewsStatusSql =
        "select * from " + commonResources.JOB_NEWS_STATUS_TABLE_NAME + ";";
    dbConnect.query(
        selectAllJobNewsStatusSql,
        function (err, result) {
            if (err) throw err;
            let jobNewsStatus = result;
            res.render(
                'job-news-status/index',
                {jobNewsStatus}
            );
        }
    );
});

module.exports = router;