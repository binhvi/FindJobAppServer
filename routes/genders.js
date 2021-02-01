var express = require('express');
var router = express.Router();
var commonResources = require('../public/javascripts/common');
var dbConnect = require('../public/javascripts/db');

router.get('/', async (req, res) => {
    let selectAllGendersSql =
        "select * " +
        "from " + commonResources.GENDERS_TABLE_NAME + ";";
    dbConnect.query(selectAllGendersSql, function (err, result, fields) {
       if (err) throw err;
       let genders = result;
       res.render("genders/index", {genders});
    });
});

module.exports = router;