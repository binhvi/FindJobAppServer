const express = require('express');
const router = express.Router();
const commonResources = require('../public/javascripts/common');
const dbConnect = require('../public/javascripts/db');

router.get('/', (req, res) => {
    // Search
    let keyword =
        req.query.keyword == undefined
            ? "" : req.query.keyword.trim();

    let selectAllJobNewsSql =
       "select " +
            commonResources.JOB_NEWS_TABLE_NAME + "." +
            commonResources.JOB_NEWS_COLUMN_ID + ", " +

            commonResources.JOB_NEWS_COLUMN_COMPANY_NAME + ", " +
            commonResources.JOB_NEWS_COLUMN_SHORT_DESCRIPTION + ", " +
            commonResources.JOB_NEWS_COLUMN_SALARY_VND + ", " +

            commonResources.STATE_PROVINCES_TABLE_NAME + "." +
            commonResources.STATE_PROVINCES_COLUMN_NAME
            + " as provinceName, " +

            commonResources.JOB_NEWS_STATUS_COLUMN_NAME + ", " +

            commonResources.TYPES_OF_WORK_TABLE_NAME + "." +
            commonResources.TYPES_OF_WORK_COLUMN_NAME + " " +
            "as " + commonResources.COLUMN_ALIAS_TYPE_OF_WORK + " " +
       
       "from " +
            commonResources.JOB_NEWS_TABLE_NAME + ", " +
            commonResources.SUBDISTRICTS_TABLE_NAME + ", " +
            commonResources.DISTRICTS_TABLE_NAME + ", " +
            commonResources.STATE_PROVINCES_TABLE_NAME + ", " +
            commonResources.JOB_NEWS_STATUS_TABLE_NAME + ", " +
            commonResources.TYPES_OF_WORK_TABLE_NAME + " " +

       "where " +
            commonResources.JOB_NEWS_TABLE_NAME + "." +
            commonResources.JOB_NEWS_COLUMN_ADDRESS_SUBDISTRICT_ID
            + " = " +
            commonResources.SUBDISTRICTS_TABLE_NAME + "." +
            commonResources.SUBDISTRICTS_COLUMN_ID + " " +

           "and " +
            commonResources.SUBDISTRICTS_TABLE_NAME + "." +
            commonResources.SUBDISTRICTS_COLUMN_DISTRICT_ID + " = " +
            commonResources.DISTRICTS_TABLE_NAME + "." +
            commonResources.DISTRICTS_COLUMN_ID + " " +

            "and " +
            commonResources.DISTRICTS_TABLE_NAME + "." +
            commonResources.DISTRICTS_COLUMN_STATE_PROVINCE_ID + " = " +
            commonResources.STATE_PROVINCES_TABLE_NAME + "." +
            commonResources.DISTRICTS_COLUMN_STATE_PROVINCE_ID + " " +

            "and " +
            commonResources.JOB_NEWS_TABLE_NAME + "." +
            commonResources.JOB_NEWS_COLUMN_STATUS_ID + " = " +
            commonResources.JOB_NEWS_STATUS_TABLE_NAME + "." +
            commonResources.JOB_NEWS_STATUS_COLUMN_ID + " " +

            "and " +
            commonResources.JOB_NEWS_TABLE_NAME + "." +
            commonResources.JOB_NEWS_COLUMN_TYPE_OF_WORD_ID + " = " +
            commonResources.TYPES_OF_WORK_TABLE_NAME + "." +
            commonResources.TYPES_OF_WORK_COLUMN_ID + " " +

            "and " + commonResources.JOB_NEWS_COLUMN_SHORT_DESCRIPTION
            + " like '%" + keyword + "%' " + // contains keyword

        "order by " +
            commonResources.JOB_NEWS_TABLE_NAME + "." +
            commonResources.JOB_NEWS_COLUMN_ID + " desc;";

    dbConnect.query(
       selectAllJobNewsSql,
       function (err, result) {
           if (err) throw err;
           let allJobNews = result;
           res.render(
               'job-news/index',
               {allJobNews, keyword}
           );
       }
    );
});

router.get('/unapproved-job-news', (req, res) => {
    // Search
    let keyword =
        req.query.keyword == undefined
            ? "" : req.query.keyword.trim();

    let selectUnapprovedJobNewsSql =
        "select " +
        commonResources.JOB_NEWS_TABLE_NAME + "." +
        commonResources.JOB_NEWS_COLUMN_ID + ", " +

        commonResources.JOB_NEWS_COLUMN_COMPANY_NAME + ", " +
        commonResources.JOB_NEWS_COLUMN_SHORT_DESCRIPTION + ", " +
        commonResources.JOB_NEWS_COLUMN_SALARY_VND + ", " +

        commonResources.STATE_PROVINCES_TABLE_NAME + "." +
        commonResources.STATE_PROVINCES_COLUMN_NAME
        + " as provinceName, " +

        commonResources.TYPES_OF_WORK_TABLE_NAME + "." +
        commonResources.TYPES_OF_WORK_COLUMN_NAME + " " +
        "as " + commonResources.COLUMN_ALIAS_TYPE_OF_WORK + " " +

        "from " +
        commonResources.JOB_NEWS_TABLE_NAME + ", " +
        commonResources.SUBDISTRICTS_TABLE_NAME + ", " +
        commonResources.DISTRICTS_TABLE_NAME + ", " +
        commonResources.STATE_PROVINCES_TABLE_NAME + ", " +
        commonResources.JOB_NEWS_STATUS_TABLE_NAME + ", " +
        commonResources.TYPES_OF_WORK_TABLE_NAME + " " +

        "where " +
        commonResources.JOB_NEWS_TABLE_NAME + "." +
        commonResources.JOB_NEWS_COLUMN_ADDRESS_SUBDISTRICT_ID
        + " = " +
        commonResources.SUBDISTRICTS_TABLE_NAME + "." +
        commonResources.SUBDISTRICTS_COLUMN_ID + " " +

        "and " +
        commonResources.SUBDISTRICTS_TABLE_NAME + "." +
        commonResources.SUBDISTRICTS_COLUMN_DISTRICT_ID + " = " +
        commonResources.DISTRICTS_TABLE_NAME + "." +
        commonResources.DISTRICTS_COLUMN_ID + " " +

        "and " +
        commonResources.DISTRICTS_TABLE_NAME + "." +
        commonResources.DISTRICTS_COLUMN_STATE_PROVINCE_ID + " = " +
        commonResources.STATE_PROVINCES_TABLE_NAME + "." +
        commonResources.DISTRICTS_COLUMN_STATE_PROVINCE_ID + " " +

        "and " +
        commonResources.JOB_NEWS_TABLE_NAME + "." +
        commonResources.JOB_NEWS_COLUMN_STATUS_ID + " = " +
        commonResources.JOB_NEWS_STATUS_TABLE_NAME + "." +
        commonResources.JOB_NEWS_STATUS_COLUMN_ID + " " +

        "and " +
        commonResources.JOB_NEWS_TABLE_NAME + "." +
        commonResources.JOB_NEWS_COLUMN_TYPE_OF_WORD_ID + " = " +
        commonResources.TYPES_OF_WORK_TABLE_NAME + "." +
        commonResources.TYPES_OF_WORK_COLUMN_ID + " " +

        "and "
        + commonResources.JOB_NEWS_COLUMN_STATUS_ID
        + " = 0 " + // Unapproved

        "and " + commonResources.JOB_NEWS_COLUMN_SHORT_DESCRIPTION
        + " like '%" + keyword + "%' " + // contains keyword

        "order by " +
        commonResources.JOB_NEWS_TABLE_NAME + "." +
        commonResources.JOB_NEWS_COLUMN_ID + " desc;";

    dbConnect.query(
        selectUnapprovedJobNewsSql,
        function (err, result) {
            if (err) throw err;
            let unapprovedJobNews = result;
            res.render(
                'job-news/unapproved-job-news',
                {unapprovedJobNews, keyword}
            );
        }
    );
});

router.get('/approved-job-news', (req, res) => {
    // Search
    let keyword =
        req.query.keyword == undefined
            ? "" : req.query.keyword.trim();

    let selectApprovedJobNewsSql =
        "select " +
        commonResources.JOB_NEWS_TABLE_NAME + "." +
        commonResources.JOB_NEWS_COLUMN_ID + ", " +

        commonResources.JOB_NEWS_COLUMN_COMPANY_NAME + ", " +
        commonResources.JOB_NEWS_COLUMN_SHORT_DESCRIPTION + ", " +
        commonResources.JOB_NEWS_COLUMN_SALARY_VND + ", " +

        commonResources.STATE_PROVINCES_TABLE_NAME + "." +
        commonResources.STATE_PROVINCES_COLUMN_NAME
        + " as provinceName, " +

        commonResources.TYPES_OF_WORK_TABLE_NAME + "." +
        commonResources.TYPES_OF_WORK_COLUMN_NAME + " " +
        "as " + commonResources.COLUMN_ALIAS_TYPE_OF_WORK + " " +

        "from " +
        commonResources.JOB_NEWS_TABLE_NAME + ", " +
        commonResources.SUBDISTRICTS_TABLE_NAME + ", " +
        commonResources.DISTRICTS_TABLE_NAME + ", " +
        commonResources.STATE_PROVINCES_TABLE_NAME + ", " +
        commonResources.JOB_NEWS_STATUS_TABLE_NAME + ", " +
        commonResources.TYPES_OF_WORK_TABLE_NAME + " " +

        "where " +
        commonResources.JOB_NEWS_TABLE_NAME + "." +
        commonResources.JOB_NEWS_COLUMN_ADDRESS_SUBDISTRICT_ID
        + " = " +
        commonResources.SUBDISTRICTS_TABLE_NAME + "." +
        commonResources.SUBDISTRICTS_COLUMN_ID + " " +

        "and " +
        commonResources.SUBDISTRICTS_TABLE_NAME + "." +
        commonResources.SUBDISTRICTS_COLUMN_DISTRICT_ID + " = " +
        commonResources.DISTRICTS_TABLE_NAME + "." +
        commonResources.DISTRICTS_COLUMN_ID + " " +

        "and " +
        commonResources.DISTRICTS_TABLE_NAME + "." +
        commonResources.DISTRICTS_COLUMN_STATE_PROVINCE_ID + " = " +
        commonResources.STATE_PROVINCES_TABLE_NAME + "." +
        commonResources.DISTRICTS_COLUMN_STATE_PROVINCE_ID + " " +

        "and " +
        commonResources.JOB_NEWS_TABLE_NAME + "." +
        commonResources.JOB_NEWS_COLUMN_STATUS_ID + " = " +
        commonResources.JOB_NEWS_STATUS_TABLE_NAME + "." +
        commonResources.JOB_NEWS_STATUS_COLUMN_ID + " " +

        "and " +
        commonResources.JOB_NEWS_TABLE_NAME + "." +
        commonResources.JOB_NEWS_COLUMN_TYPE_OF_WORD_ID + " = " +
        commonResources.TYPES_OF_WORK_TABLE_NAME + "." +
        commonResources.TYPES_OF_WORK_COLUMN_ID + " " +

        "and " +
        commonResources.JOB_NEWS_COLUMN_STATUS_ID
        + " = 1 " + // Approved

        "and " + commonResources.JOB_NEWS_COLUMN_SHORT_DESCRIPTION
        + " like '%" + keyword + "%' " + // contains keyword

        "order by " +
        commonResources.JOB_NEWS_TABLE_NAME + "." +
        commonResources.JOB_NEWS_COLUMN_ID + " desc;";

    dbConnect.query(
        selectApprovedJobNewsSql,
        function (err, result) {
            if (err) throw err;
            let approvedJobNews = result;
            res.render(
                'job-news/approved-job-news',
                {approvedJobNews, keyword}
            );
        }
    );
});

module.exports = router;