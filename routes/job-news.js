const express = require('express');
const router = express.Router();
const commonResources = require('../public/javascripts/common');
const dbConnect = require('../public/javascripts/db');
const moment = require('moment');

router.get('/', (req, res) => {
    // If not logged in, go to log in page
    if (!req.session.loggedin) {
        res.redirect('/login');
        return;
    }

    // Search
    let keyword =
        req.query.keyword === undefined
            ? "" : req.query.keyword.trim();
    // Escape character "'" to avoid sql error
    let keywordEscape = keyword.replace(/'/g, "\\'");

    let millis0h0mOfCreatedDateUtcPlus7; // local timezone: UTC+7
    if (req.query.createdDate && req.query.createdDate.trim()) {
        // req.query.createdMillis not undefined, not empty
        // and not just contain white space
        let dateCreatedNewsText =
            req.query.createdDate.trim();

        if (!moment(
                dateCreatedNewsText, 'YYYY-MM-DD',true)
            .isValid()) {
            // The third param "true": Use strict mode, which will identify
            // the parsing error and set the Moment object as invalid
            res.send("Nhập ngày tạo tin trong ô tìm kiếm " +
                        "đúng định dạng YYYY-MM-DD.");
            return;
        }

        let millis0h0mOfCreatedDateUtcPlus0 =
                                    Date.parse(dateCreatedNewsText);
        // We use local time to filter (UTC+7)
        millis0h0mOfCreatedDateUtcPlus7 =
            millis0h0mOfCreatedDateUtcPlus0 - (7 * 60 * 60 * 1000);
    }

    let criteriaTimeCreatedNewsSubStringSql;
    if (millis0h0mOfCreatedDateUtcPlus7 === undefined) {
        criteriaTimeCreatedNewsSubStringSql = "";
    } else {
        criteriaTimeCreatedNewsSubStringSql =
            " and " +
            commonResources.JOB_NEWS_COLUMN_TIME_CREATE_MILLIS
            + " between " +
            millis0h0mOfCreatedDateUtcPlus7 +
            " and " +
            // millis of 23h59m of the day we get from query in local time
            (millis0h0mOfCreatedDateUtcPlus7 + (24 * 60 * 60 * 1000 - 1))
    }

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
            "as " + commonResources.COLUMN_ALIAS_TYPE_OF_WORK + ", " +

            commonResources.JOB_NEWS_COLUMN_TIME_CREATE_MILLIS + " " +

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
            + " like '%" + keywordEscape + "%' " + // contains keyword

             " " + criteriaTimeCreatedNewsSubStringSql + " " +

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
               {allJobNews, keyword, moment}
           );
       }
    );
});

router.get('/unapproved-job-news', (req, res) => {
    // If not logged in, go to log in page
    if (!req.session.loggedin) {
        res.redirect('/login');
        return;
    }

    // Search
    let keyword =
        req.query.keyword === undefined
            ? "" : req.query.keyword.trim();
    // Escape character "'" to avoid sql error
    let keywordEscape = keyword.replace(/'/g, "\\'");

    // Get date from request to filter job news by date created
    let millis0h0mOfCreatedDateUtcPlus7; // local timezone: UTC+7
    if (req.query.createdDate && req.query.createdDate.trim()) {
        // req.query.createdMillis not undefined, not empty
        // and not just contain white space
        let dateCreatedNewsText =
            req.query.createdDate.trim();

        if (!moment(
            dateCreatedNewsText, 'YYYY-MM-DD',true)
            .isValid()) {
            // The third param "true": Use strict mode, which will identify
            // the parsing error and set the Moment object as invalid
            res.send("Nhập ngày tạo tin trong ô tìm kiếm " +
                "đúng định dạng YYYY-MM-DD.");
            return;
        }

        // Millis get from date request
        // is millis at 0h00 of UTC+0 timezone.
        // But we want to filter at local timezone (UTC+7).
        // Millis at 0h00 of UTC+0 is millis at 7h00 UTC+7.
        // So we need to substract millis of 7 hours from request millis
        // to get millis at 0h00 of UTC+7.
        let millis0h0mOfCreatedDateUtcPlus0 =
            Date.parse(dateCreatedNewsText);
        // We use local time to filter (UTC+7)
        millis0h0mOfCreatedDateUtcPlus7 =
            millis0h0mOfCreatedDateUtcPlus0 - (7 * 60 * 60 * 1000);
    }

    let criteriaTimeCreatedNewsSubStringSql;
    if (millis0h0mOfCreatedDateUtcPlus7 === undefined) {
        criteriaTimeCreatedNewsSubStringSql = "";
    } else {
        criteriaTimeCreatedNewsSubStringSql =
            " and " +
            commonResources.JOB_NEWS_COLUMN_TIME_CREATE_MILLIS
            + " between " +
            millis0h0mOfCreatedDateUtcPlus7 +
            " and " +
            // millis of 23h59m of the day we get from query in local time
            (millis0h0mOfCreatedDateUtcPlus7 + (24 * 60 * 60 * 1000 - 1))
    }

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
        "as " + commonResources.COLUMN_ALIAS_TYPE_OF_WORK + ", " +

        commonResources.JOB_NEWS_COLUMN_TIME_CREATE_MILLIS + " " +

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
        + " like '%" + keywordEscape + "%' " + // contains keyword

        " " + criteriaTimeCreatedNewsSubStringSql + " " +

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
                {unapprovedJobNews, keyword, moment}
            );
        }
    );
});

router.get('/approved-job-news', (req, res) => {
    // If not logged in, go to log in page
    if (!req.session.loggedin) {
        res.redirect('/login');
        return;
    }

    // Search
    let keyword =
        req.query.keyword === undefined
            ? "" : req.query.keyword.trim();
    // Escape character "'" to avoid sql error
    let keywordEscape = keyword.replace(/'/g, "\\'");

    // Get date from request to filter job news by date created
    let millis0h0mOfCreatedDateUtcPlus7; // local timezone: UTC+7
    if (req.query.createdDate && req.query.createdDate.trim()) {
        // req.query.createdMillis not undefined, not empty
        // and not just contain white space
        let dateCreatedNewsText =
            req.query.createdDate.trim();

        if (!moment(
            dateCreatedNewsText, 'YYYY-MM-DD',true)
            .isValid()) {
            // The third param "true": Use strict mode, which will identify
            // the parsing error and set the Moment object as invalid
            res.send("Nhập ngày tạo tin trong ô tìm kiếm " +
                "đúng định dạng YYYY-MM-DD.");
            return;
        }

        // Millis get from date request
        // is millis at 0h00 of UTC+0 timezone.
        // But we want to filter at local timezone (UTC+7).
        // Millis at 0h00 of UTC+0 is millis at 7h00 UTC+7.
        // So we need to substract millis of 7 hours from request millis
        // to get millis at 0h00 of UTC+7.
        let millis0h0mOfCreatedDateUtcPlus0 =
            Date.parse(dateCreatedNewsText);
        // We use local time to filter (UTC+7)
        millis0h0mOfCreatedDateUtcPlus7 =
            millis0h0mOfCreatedDateUtcPlus0 - (7 * 60 * 60 * 1000);
    }

    let criteriaTimeCreatedNewsSubStringSql;
    if (millis0h0mOfCreatedDateUtcPlus7 === undefined) {
        criteriaTimeCreatedNewsSubStringSql = "";
    } else {
        criteriaTimeCreatedNewsSubStringSql =
            " and " +
            commonResources.JOB_NEWS_COLUMN_TIME_CREATE_MILLIS
            + " between " +
            millis0h0mOfCreatedDateUtcPlus7 +
            " and " +
            // millis of 23h59m of the day we get from query in local time
            (millis0h0mOfCreatedDateUtcPlus7 + (24 * 60 * 60 * 1000 - 1))
    }

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
        "as " + commonResources.COLUMN_ALIAS_TYPE_OF_WORK + ", " +

        commonResources.JOB_NEWS_COLUMN_TIME_CREATE_MILLIS + " " +

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
        + " like '%" + keywordEscape + "%' " + // contains keyword

        " " + criteriaTimeCreatedNewsSubStringSql + " " +

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
                {approvedJobNews, keyword, moment}
            );
        }
    );
});

router.post('/general-job-news-details', (req, res) => {
   let selectJobNewsDetailsSql =
       "select " +
            commonResources.JOB_NEWS_TABLE_NAME + "." +
            commonResources.JOB_NEWS_COLUMN_ID + " as jobNewsId, " +

            commonResources.USERS_COLUMN_FULL_NAME + " " +
            "as ownerName, " +

            commonResources.JOB_NEWS_STATUS_COLUMN_NAME + ", " +

            commonResources.TYPES_OF_WORK_TABLE_NAME + "." +
            commonResources.TYPES_OF_WORK_COLUMN_NAME +
            " as typeOfWorkName, " +

            commonResources.JOB_NEWS_COLUMN_COMPANY_NAME + ", " +
            commonResources.JOB_NEWS_COLUMN_SHORT_DESCRIPTION + ", " +
            commonResources.JOB_NEWS_COLUMN_SALARY_VND + ", " +
            commonResources.JOB_NEWS_COLUMN_JOB_DESCRIPTION + ", " +

            commonResources.SUBDISTRICTS_TABLE_NAME + "." +
            commonResources.SUBDISTRICTS_COLUMN_NAME + " " +
            "as subdistrictName, " +

            commonResources.DISTRICTS_TABLE_NAME + "." +
            commonResources.DISTRICTS_COLUMN_NAME + " " +
            "as districtName, " +

            commonResources.STATE_PROVINCES_TABLE_NAME + "." +
            commonResources.STATE_PROVINCES_COLUMN_NAME + " " +
            "as stateProvinceName, " +

            commonResources.JOB_NEWS_COLUMN_DETAIL_ADDRESS + ", " +
            commonResources
                .JOB_NEWS_COLUMN_REQUIRED_NUMBER_YEARS_EXPERIENCES
            + ", " +

            commonResources.JOB_TITLES_TABLE_NAME + "." +
            commonResources.JOB_TITLES_COLUMN_NAME + " " +
            "as jobTitleName, " +

            commonResources
                .JOB_NEWS_COLUMN_COMPANY_SIZE_BY_NUMBER_EMPLOYEES + ", " +
            commonResources.JOB_NEWS_COLUMN_COMPANY_WEBSITE + ", " +
            commonResources.JOB_NEWS_COLUMN_COMPANY_EMAIL + ", " +
            commonResources.JOB_NEWS_COLUMN_COMPANY_PHONE_NUMBER + ", " +
            commonResources.JOB_NEWS_COLUMN_TIME_CREATE_MILLIS + ", " +
            commonResources.JOB_NEWS_COLUMN_REQUIRED_TECHNOLOGY_TEXT
            + " " +

       "from " +
            commonResources.JOB_NEWS_TABLE_NAME + " " +

            "inner join " +
            commonResources.USERS_TABLE_NAME + " on " +
            commonResources.JOB_NEWS_TABLE_NAME + "." +
            commonResources.JOB_NEWS_COLUMN_OWNER_ID + " = " +
            commonResources.USERS_TABLE_NAME + "." +
            commonResources.USERS_COLUMN_ID + " " +

            "inner join " +
            commonResources.JOB_NEWS_STATUS_TABLE_NAME + " on " +
            commonResources.JOB_NEWS_TABLE_NAME + "." +
            commonResources.JOB_NEWS_COLUMN_STATUS_ID + " = " +
            commonResources.JOB_NEWS_STATUS_TABLE_NAME + "." +
            commonResources.JOB_NEWS_STATUS_COLUMN_ID + " " +

            "inner join " +
            commonResources.TYPES_OF_WORK_TABLE_NAME + " on " +
            commonResources.JOB_NEWS_TABLE_NAME + "." +
            commonResources.JOB_NEWS_COLUMN_TYPE_OF_WORD_ID + " = " +
            commonResources.TYPES_OF_WORK_TABLE_NAME + "." +
            commonResources.TYPES_OF_WORK_COLUMN_ID + " " +

            "inner join " +
            commonResources.SUBDISTRICTS_TABLE_NAME + " on " +
            commonResources.JOB_NEWS_TABLE_NAME + "." +
            commonResources.JOB_NEWS_COLUMN_ADDRESS_SUBDISTRICT_ID
            + " = " +
            commonResources.SUBDISTRICTS_TABLE_NAME + "." +
            commonResources.SUBDISTRICTS_COLUMN_ID + " " +

            "inner join " +
            commonResources.JOB_TITLES_TABLE_NAME + " on " +
            commonResources.JOB_NEWS_TABLE_NAME + "." +
            commonResources.JOB_NEWS_COLUMN_JOB_TITLE_ID + " = " +
            commonResources.JOB_TITLES_TABLE_NAME + "." +
            commonResources.JOB_TITLES_COLUMN_ID + " " +

            "inner join " +
            commonResources.DISTRICTS_TABLE_NAME + " on " +
            commonResources.SUBDISTRICTS_TABLE_NAME + "." +
            commonResources.SUBDISTRICTS_COLUMN_DISTRICT_ID + " = " +
            commonResources.DISTRICTS_TABLE_NAME + "." +
            commonResources.DISTRICTS_COLUMN_ID + " " +

            "inner join " +
            commonResources.STATE_PROVINCES_TABLE_NAME + " on " +
            commonResources.DISTRICTS_TABLE_NAME + "." +
            commonResources.DISTRICTS_COLUMN_STATE_PROVINCE_ID + " = " +
            commonResources.STATE_PROVINCES_TABLE_NAME + "." +
            commonResources.STATE_PROVINCES_COLUMN_ID + " " +

       "where " +
            commonResources.JOB_NEWS_TABLE_NAME + "." +
            commonResources.JOB_NEWS_COLUMN_ID + " = ?;";

   let jobNewsId = req.body.jobNewsId;
   dbConnect.query(
       selectJobNewsDetailsSql,
       [jobNewsId],
       function (err, result) {
           if (err) throw err;
           let jobNewsDetails = result[0]; // Result is an array

           let selectJobNewsRequiredSkillsSql =
                "select " +
                    commonResources.JOB_SKILLS_COLUMN_ID + ", " +
                    commonResources.JOB_SKILLS_COLUMN_NAME + " " +

               "from " +
                    commonResources.JOB_SKILLS_TABLE_NAME + " " +
               "inner join " +
                    commonResources.JOB_NEWS_REQUIRED_SKILLS_TABLE_NAME +
                    " on " +
                    commonResources.JOB_NEWS_REQUIRED_SKILLS_TABLE_NAME
                    + "." +
                    commonResources.JOB_NEWS_REQUIRED_SKILLS_COL_JOB_SKILL_ID
                    + " = " +
                    commonResources.JOB_SKILLS_TABLE_NAME + "." +
                    commonResources.JOB_SKILLS_COLUMN_ID + " " +

               "where " +
                    commonResources.JOB_NEWS_REQUIRED_SKILLS_COL_JOB_NEWS_ID
                    + " = ?;";
           dbConnect.query(
               selectJobNewsRequiredSkillsSql,
               [jobNewsId],
               function (selectJobSkillErr, selectJobSkillResult) {
                   if (selectJobSkillErr) {
                       throw selectJobSkillErr;
                   }

                   let jobNewsRequiredSkills = selectJobSkillResult;
                   res.render(
                       'job-news/general-job-news-details',
                       {
                           jobNewsDetails,
                           jobNewsRequiredSkills,
                           moment // Time library
                       }
                   );
               }
           );
       }
   );
});

router.post('/unapproved-job-news-details', (req, res) => {
    let selectJobNewsDetailsSql =
        "select " +
        commonResources.JOB_NEWS_TABLE_NAME + "." +
        commonResources.JOB_NEWS_COLUMN_ID + " as jobNewsId, " +

        commonResources.USERS_COLUMN_FULL_NAME + " " +
        "as ownerName, " +

        commonResources.JOB_NEWS_STATUS_COLUMN_NAME + ", " +

        commonResources.TYPES_OF_WORK_TABLE_NAME + "." +
        commonResources.TYPES_OF_WORK_COLUMN_NAME +
        " as typeOfWorkName, " +

        commonResources.JOB_NEWS_COLUMN_COMPANY_NAME + ", " +
        commonResources.JOB_NEWS_COLUMN_SHORT_DESCRIPTION + ", " +
        commonResources.JOB_NEWS_COLUMN_SALARY_VND + ", " +
        commonResources.JOB_NEWS_COLUMN_JOB_DESCRIPTION + ", " +

        commonResources.SUBDISTRICTS_TABLE_NAME + "." +
        commonResources.SUBDISTRICTS_COLUMN_NAME + " " +
        "as subdistrictName, " +

        commonResources.DISTRICTS_TABLE_NAME + "." +
        commonResources.DISTRICTS_COLUMN_NAME + " " +
        "as districtName, " +

        commonResources.STATE_PROVINCES_TABLE_NAME + "." +
        commonResources.STATE_PROVINCES_COLUMN_NAME + " " +
        "as stateProvinceName, " +

        commonResources.JOB_NEWS_COLUMN_DETAIL_ADDRESS + ", " +
        commonResources
            .JOB_NEWS_COLUMN_REQUIRED_NUMBER_YEARS_EXPERIENCES
        + ", " +

        commonResources.JOB_TITLES_TABLE_NAME + "." +
        commonResources.JOB_TITLES_COLUMN_NAME + " " +
        "as jobTitleName, " +

        commonResources
            .JOB_NEWS_COLUMN_COMPANY_SIZE_BY_NUMBER_EMPLOYEES + ", " +
        commonResources.JOB_NEWS_COLUMN_COMPANY_WEBSITE + ", " +
        commonResources.JOB_NEWS_COLUMN_COMPANY_EMAIL + ", " +
        commonResources.JOB_NEWS_COLUMN_COMPANY_PHONE_NUMBER + ", " +
        commonResources.JOB_NEWS_COLUMN_TIME_CREATE_MILLIS + ", " +
        commonResources.JOB_NEWS_COLUMN_REQUIRED_TECHNOLOGY_TEXT + " " +

        "from " +
        commonResources.JOB_NEWS_TABLE_NAME + " " +

        "inner join " +
        commonResources.USERS_TABLE_NAME + " on " +
        commonResources.JOB_NEWS_TABLE_NAME + "." +
        commonResources.JOB_NEWS_COLUMN_OWNER_ID + " = " +
        commonResources.USERS_TABLE_NAME + "." +
        commonResources.USERS_COLUMN_ID + " " +

        "inner join " +
        commonResources.JOB_NEWS_STATUS_TABLE_NAME + " on " +
        commonResources.JOB_NEWS_TABLE_NAME + "." +
        commonResources.JOB_NEWS_COLUMN_STATUS_ID + " = " +
        commonResources.JOB_NEWS_STATUS_TABLE_NAME + "." +
        commonResources.JOB_NEWS_STATUS_COLUMN_ID + " " +

        "inner join " +
        commonResources.TYPES_OF_WORK_TABLE_NAME + " on " +
        commonResources.JOB_NEWS_TABLE_NAME + "." +
        commonResources.JOB_NEWS_COLUMN_TYPE_OF_WORD_ID + " = " +
        commonResources.TYPES_OF_WORK_TABLE_NAME + "." +
        commonResources.TYPES_OF_WORK_COLUMN_ID + " " +

        "inner join " +
        commonResources.SUBDISTRICTS_TABLE_NAME + " on " +
        commonResources.JOB_NEWS_TABLE_NAME + "." +
        commonResources.JOB_NEWS_COLUMN_ADDRESS_SUBDISTRICT_ID
        + " = " +
        commonResources.SUBDISTRICTS_TABLE_NAME + "." +
        commonResources.SUBDISTRICTS_COLUMN_ID + " " +

        "inner join " +
        commonResources.JOB_TITLES_TABLE_NAME + " on " +
        commonResources.JOB_NEWS_TABLE_NAME + "." +
        commonResources.JOB_NEWS_COLUMN_JOB_TITLE_ID + " = " +
        commonResources.JOB_TITLES_TABLE_NAME + "." +
        commonResources.JOB_TITLES_COLUMN_ID + " " +

        "inner join " +
        commonResources.DISTRICTS_TABLE_NAME + " on " +
        commonResources.SUBDISTRICTS_TABLE_NAME + "." +
        commonResources.SUBDISTRICTS_COLUMN_DISTRICT_ID + " = " +
        commonResources.DISTRICTS_TABLE_NAME + "." +
        commonResources.DISTRICTS_COLUMN_ID + " " +

        "inner join " +
        commonResources.STATE_PROVINCES_TABLE_NAME + " on " +
        commonResources.DISTRICTS_TABLE_NAME + "." +
        commonResources.DISTRICTS_COLUMN_STATE_PROVINCE_ID + " = " +
        commonResources.STATE_PROVINCES_TABLE_NAME + "." +
        commonResources.STATE_PROVINCES_COLUMN_ID + " " +

        "where " +
        commonResources.JOB_NEWS_TABLE_NAME + "." +
        commonResources.JOB_NEWS_COLUMN_ID + " = ?;";

    let jobNewsId = req.body.jobNewsId;
    dbConnect.query(
        selectJobNewsDetailsSql,
        [jobNewsId],
        function (err, result) {
            if (err) throw err;
            let jobNewsDetails = result[0]; // Result is an array

            let selectJobNewsRequiredSkillsSql =
                "select " +
                commonResources.JOB_SKILLS_COLUMN_ID + ", " +
                commonResources.JOB_SKILLS_COLUMN_NAME + " " +

                "from " +
                commonResources.JOB_SKILLS_TABLE_NAME + " " +
                "inner join " +
                commonResources.JOB_NEWS_REQUIRED_SKILLS_TABLE_NAME +
                " on " +
                commonResources.JOB_NEWS_REQUIRED_SKILLS_TABLE_NAME
                + "." +
                commonResources.JOB_NEWS_REQUIRED_SKILLS_COL_JOB_SKILL_ID
                + " = " +
                commonResources.JOB_SKILLS_TABLE_NAME + "." +
                commonResources.JOB_SKILLS_COLUMN_ID + " " +

                "where " +
                commonResources.JOB_NEWS_REQUIRED_SKILLS_COL_JOB_NEWS_ID
                + " = ?;";
            dbConnect.query(
                selectJobNewsRequiredSkillsSql,
                [jobNewsId],
                function (selectJobSkillErr, selectJobSkillResult) {
                    if (selectJobSkillErr) {
                        throw selectJobSkillErr;
                    }

                    let jobNewsRequiredSkills = selectJobSkillResult;
                    res.render(
                        'job-news/unapproved-job-news-details',
                        {
                            jobNewsDetails,
                            jobNewsRequiredSkills,
                            moment // Time library
                        }
                    );
                }
            );
        }
    );
});

router.post('/approved-job-news-details', (req, res) => {
    let selectJobNewsDetailsSql =
        "select " +
        commonResources.JOB_NEWS_TABLE_NAME + "." +
        commonResources.JOB_NEWS_COLUMN_ID + " as jobNewsId, " +

        commonResources.USERS_COLUMN_FULL_NAME + " " +
        "as ownerName, " +

        commonResources.JOB_NEWS_STATUS_COLUMN_NAME + ", " +

        commonResources.TYPES_OF_WORK_TABLE_NAME + "." +
        commonResources.TYPES_OF_WORK_COLUMN_NAME +
        " as typeOfWorkName, " +

        commonResources.JOB_NEWS_COLUMN_COMPANY_NAME + ", " +
        commonResources.JOB_NEWS_COLUMN_SHORT_DESCRIPTION + ", " +
        commonResources.JOB_NEWS_COLUMN_SALARY_VND + ", " +
        commonResources.JOB_NEWS_COLUMN_JOB_DESCRIPTION + ", " +

        commonResources.SUBDISTRICTS_TABLE_NAME + "." +
        commonResources.SUBDISTRICTS_COLUMN_NAME + " " +
        "as subdistrictName, " +

        commonResources.DISTRICTS_TABLE_NAME + "." +
        commonResources.DISTRICTS_COLUMN_NAME + " " +
        "as districtName, " +

        commonResources.STATE_PROVINCES_TABLE_NAME + "." +
        commonResources.STATE_PROVINCES_COLUMN_NAME + " " +
        "as stateProvinceName, " +

        commonResources.JOB_NEWS_COLUMN_DETAIL_ADDRESS + ", " +
        commonResources
            .JOB_NEWS_COLUMN_REQUIRED_NUMBER_YEARS_EXPERIENCES
        + ", " +

        commonResources.JOB_TITLES_TABLE_NAME + "." +
        commonResources.JOB_TITLES_COLUMN_NAME + " " +
        "as jobTitleName, " +

        commonResources
            .JOB_NEWS_COLUMN_COMPANY_SIZE_BY_NUMBER_EMPLOYEES + ", " +
        commonResources.JOB_NEWS_COLUMN_COMPANY_WEBSITE + ", " +
        commonResources.JOB_NEWS_COLUMN_COMPANY_EMAIL + ", " +
        commonResources.JOB_NEWS_COLUMN_COMPANY_PHONE_NUMBER + ", " +
        commonResources.JOB_NEWS_COLUMN_TIME_CREATE_MILLIS + ", " +
        commonResources.JOB_NEWS_COLUMN_REQUIRED_TECHNOLOGY_TEXT + " " +

        "from " +
        commonResources.JOB_NEWS_TABLE_NAME + " " +

        "inner join " +
        commonResources.USERS_TABLE_NAME + " on " +
        commonResources.JOB_NEWS_TABLE_NAME + "." +
        commonResources.JOB_NEWS_COLUMN_OWNER_ID + " = " +
        commonResources.USERS_TABLE_NAME + "." +
        commonResources.USERS_COLUMN_ID + " " +

        "inner join " +
        commonResources.JOB_NEWS_STATUS_TABLE_NAME + " on " +
        commonResources.JOB_NEWS_TABLE_NAME + "." +
        commonResources.JOB_NEWS_COLUMN_STATUS_ID + " = " +
        commonResources.JOB_NEWS_STATUS_TABLE_NAME + "." +
        commonResources.JOB_NEWS_STATUS_COLUMN_ID + " " +

        "inner join " +
        commonResources.TYPES_OF_WORK_TABLE_NAME + " on " +
        commonResources.JOB_NEWS_TABLE_NAME + "." +
        commonResources.JOB_NEWS_COLUMN_TYPE_OF_WORD_ID + " = " +
        commonResources.TYPES_OF_WORK_TABLE_NAME + "." +
        commonResources.TYPES_OF_WORK_COLUMN_ID + " " +

        "inner join " +
        commonResources.SUBDISTRICTS_TABLE_NAME + " on " +
        commonResources.JOB_NEWS_TABLE_NAME + "." +
        commonResources.JOB_NEWS_COLUMN_ADDRESS_SUBDISTRICT_ID
        + " = " +
        commonResources.SUBDISTRICTS_TABLE_NAME + "." +
        commonResources.SUBDISTRICTS_COLUMN_ID + " " +

        "inner join " +
        commonResources.JOB_TITLES_TABLE_NAME + " on " +
        commonResources.JOB_NEWS_TABLE_NAME + "." +
        commonResources.JOB_NEWS_COLUMN_JOB_TITLE_ID + " = " +
        commonResources.JOB_TITLES_TABLE_NAME + "." +
        commonResources.JOB_TITLES_COLUMN_ID + " " +

        "inner join " +
        commonResources.DISTRICTS_TABLE_NAME + " on " +
        commonResources.SUBDISTRICTS_TABLE_NAME + "." +
        commonResources.SUBDISTRICTS_COLUMN_DISTRICT_ID + " = " +
        commonResources.DISTRICTS_TABLE_NAME + "." +
        commonResources.DISTRICTS_COLUMN_ID + " " +

        "inner join " +
        commonResources.STATE_PROVINCES_TABLE_NAME + " on " +
        commonResources.DISTRICTS_TABLE_NAME + "." +
        commonResources.DISTRICTS_COLUMN_STATE_PROVINCE_ID + " = " +
        commonResources.STATE_PROVINCES_TABLE_NAME + "." +
        commonResources.STATE_PROVINCES_COLUMN_ID + " " +

        "where " +
        commonResources.JOB_NEWS_TABLE_NAME + "." +
        commonResources.JOB_NEWS_COLUMN_ID + " = ?;";

    let jobNewsId = req.body.jobNewsId;
    dbConnect.query(
        selectJobNewsDetailsSql,
        [jobNewsId],
        function (err, result) {
            if (err) throw err;
            let jobNewsDetails = result[0]; // Result is an array

            let selectJobNewsRequiredSkillsSql =
                "select " +
                commonResources.JOB_SKILLS_COLUMN_ID + ", " +
                commonResources.JOB_SKILLS_COLUMN_NAME + " " +

                "from " +
                commonResources.JOB_SKILLS_TABLE_NAME + " " +
                "inner join " +
                commonResources.JOB_NEWS_REQUIRED_SKILLS_TABLE_NAME +
                " on " +
                commonResources.JOB_NEWS_REQUIRED_SKILLS_TABLE_NAME
                + "." +
                commonResources.JOB_NEWS_REQUIRED_SKILLS_COL_JOB_SKILL_ID
                + " = " +
                commonResources.JOB_SKILLS_TABLE_NAME + "." +
                commonResources.JOB_SKILLS_COLUMN_ID + " " +

                "where " +
                commonResources.JOB_NEWS_REQUIRED_SKILLS_COL_JOB_NEWS_ID
                + " = ?;";
            dbConnect.query(
                selectJobNewsRequiredSkillsSql,
                [jobNewsId],
                function (selectJobSkillErr, selectJobSkillResult) {
                    if (selectJobSkillErr) {
                        throw selectJobSkillErr;
                    }

                    let jobNewsRequiredSkills = selectJobSkillResult;
                    res.render(
                        'job-news/approved-job-news-details',
                        {
                            jobNewsDetails,
                            jobNewsRequiredSkills,
                            moment // Time module
                        }
                    );
                }
            );
        }
    );
});

router.post('/do-approved-job-news', (req, res) => {
    let doApprovedJobNewsSql =
        "update " +
            commonResources.JOB_NEWS_TABLE_NAME + " " +
        "set " +
            commonResources.JOB_NEWS_COLUMN_STATUS_ID + " = " +
            commonResources.JOB_NEWS_STATUS_VALUE_APPROVED + " " +
        "where " +
            commonResources.JOB_NEWS_COLUMN_ID + " = ?;"
    let jobNewsId = req.body.jobNewsId;
    dbConnect.query(
        doApprovedJobNewsSql,
        [jobNewsId],
        function (err, result) {
            if (err) {
                throw err;
            }

            res.redirect('/job-news/unapproved-job-news');
        }
    );
});

router.post('/cancel-approval-job-news', (req, res) => {
    let cancelApprovalJobNewsSql =
        "update " +
        commonResources.JOB_NEWS_TABLE_NAME + " " +
        "set " +
        commonResources.JOB_NEWS_COLUMN_STATUS_ID + " = " +
        commonResources.JOB_NEWS_STATUS_VALUE_UNAPPROVED + " " +
        "where " +
        commonResources.JOB_NEWS_COLUMN_ID + " = ?;"
    let jobNewsId = req.body.jobNewsId;
    dbConnect.query(
        cancelApprovalJobNewsSql,
        [jobNewsId],
        function (err, result) {
            if (err) {
                throw err;
            }

            res.redirect('/job-news/approved-job-news');
        }
    );
});

router.post('/remove-general-job-news', (req, res) => {
    let jobNewsId = req.body.jobNewsId;
   let deleteJobNewsByIdSql =
       "delete from " +
            commonResources.JOB_NEWS_TABLE_NAME + " " +
       "where " +
            commonResources.JOB_NEWS_COLUMN_ID + " = ?;";
   dbConnect.query(
        deleteJobNewsByIdSql,
       [jobNewsId],
       function (err, result) {
            if (err) {
                throw err;
            }

            res.redirect('/job-news');
       }
   );
});

router.post('/remove-unapproved-job-news', (req, res) => {
    let jobNewsId = req.body.jobNewsId;
    let deleteJobNewsByIdSql =
        "delete from " +
        commonResources.JOB_NEWS_TABLE_NAME + " " +
        "where " +
        commonResources.JOB_NEWS_COLUMN_ID + " = ?;";
    dbConnect.query(
        deleteJobNewsByIdSql,
        [jobNewsId],
        function (err, result) {
            if (err) {
                throw err;
            }

            res.redirect('/job-news/unapproved-job-news');
        }
    );
});

router.post('/remove-approved-job-news', (req, res) => {
    let jobNewsId = req.body.jobNewsId;
    let deleteJobNewsByIdSql =
        "delete from " +
        commonResources.JOB_NEWS_TABLE_NAME + " " +
        "where " +
        commonResources.JOB_NEWS_COLUMN_ID + " = ?;";
    dbConnect.query(
        deleteJobNewsByIdSql,
        [jobNewsId],
        function (err, result) {
            if (err) {
                throw err;
            }

            res.redirect('/job-news/approved-job-news');
        }
    );
});

function checkIfJobNewsIdExists(jobNewsId, callback) {
    let selectNumberOfJobNewsRecordsHaveThisIdSql =
        "select count(" +
            commonResources.JOB_NEWS_COLUMN_ID + ") " +
        "as numberOfJobNewsHaveThisId " +
        "from " + commonResources.JOB_NEWS_TABLE_NAME + " " +
        "where " +
            commonResources.JOB_NEWS_COLUMN_ID + " = ?;"
    dbConnect.query(
        selectNumberOfJobNewsRecordsHaveThisIdSql,
        [jobNewsId],
        function (err, result) {
            if (err) {
                // Callback function has 2 params: err, result
                // If err not null -> result null
                return callback(err, null); // Result is null here
            }

            // [
            //     {
            //         "numberOfJobNewsHaveThisId" : 1
            //     }
            // ]
            let numberOfJobNewsHaveThisId =
                result[0].numberOfJobNewsHaveThisId;
            // Result is not null here, so err is null
            if (numberOfJobNewsHaveThisId > 0) {
                return callback(null, true);
            } else {
                return callback(null, false);
            }
        }
    );
}

module.exports = router;
module.exports.checkIfJobNewsIdExists = checkIfJobNewsIdExists;
