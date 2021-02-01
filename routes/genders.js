// var express = require('express');
// var router = express.Router();
// var commonResources = require('../public/javascripts/common');
// var mysql = require('mysql');
//
// var dbConnect = mysql.createConnection({
//     host: commonResources.MY_SQL_HOST,
//     user: commonResources.MY_SQL_USER,
//     password: commonResources.MY_SQL_PASSWORD,
//     database: commonResources.MY_SQL_DATABASE_NAME
// });
//
// dbConnect.connect(function (err) {
//     if (err) throw err;
// });
//
// router.get('/', async (req, res) => {
//     let selectAllGendersSql =
//         "select * " +
//         "from " + commonResources.GENDERS_TABLE_NAME + ";";
//     dbConnect.query(selectAllGendersSql, function (err, result, fields) {
//        if (err) throw err;
//        let genders = result;
//        res.render("genders/index", {genders});
//     });
// });
//
// module.exports = router;