function checkfileImageType(selector){
    var val = $(selector).val();
    switch(val.substring(val.lastIndexOf('.') + 1).toLowerCase()){
        case 'webp': case 'jpg': case 'png':
            return true;
            break;
        default:
            return false;
            break;
    }
}

// Table and column names
const NEWS_CATEGORIES_TABLE_NAME = "NewsCategories";
const NEWS_CATEGORY_COLUMN_ID = "id";
const NEWS_CATEGORY_COLUMN_NAME = "name";

module.exports.NEWS_CATEGORIES_TABLE_NAME = NEWS_CATEGORIES_TABLE_NAME;
module.exports.NEWS_CATEGORY_COLUMN_ID = NEWS_CATEGORY_COLUMN_ID;
module.exports.NEWS_CATEGORY_COLUMN_NAME = NEWS_CATEGORY_COLUMN_NAME;