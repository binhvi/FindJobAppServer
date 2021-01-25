const MY_SQL_ERR_DUPLICATE_CODE = "ER_DUP_ENTRY";

const PROTOCOL = "http";
const SERVER_HOST = "localhost:3000";

const MY_SQL_HOST = "localhost";
const MY_SQL_USER = "scott";
const MY_SQL_PASSWORD = "tiger";
const MY_SQL_DATABASE_NAME = "FindJobApp";

// Table and column names
const NEWS_CATEGORIES_TABLE_NAME = "NewsCategories";
const NEWS_CATEGORIES_COLUMN_ID = "id";
const NEWS_CATEGORIES_COLUMN_NAME = "name";

const NEWS_AUTHORS_TABLE_NAME = "NewsAuthors";
const NEWS_AUTHORS_COLUMN_ID = "id";
const NEWS_AUTHORS_COLUMN_NAME = "name";

const NEWS_TABLE_NAME = "News";
const NEWS_COLUMN_CATEGORY_ID = "categoryId";
const NEWS_COLUMN_AUTHOR_ID = "authorId";
const NEWS_COLUMN_ID = "id";
const NEWS_COLUMN_TITLE = "title";
const NEWS_COLUMN_IMAGE_URL = "imageUrl";
const NEWS_COLUMN_SHORT_DESCRIPTION = "shortDescription";
const NEWS_COLUMN_CONTENT = "content";

const COLUMN_ALIAS_CATEGORY = "category";
const COLUMN_ALIAS_AUTHOR = "author";

function checkFileImageType(selector) {
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

/**
 * Check if file has extension webp|jpg|png.
 * @param fileName
 * @return true if file has extension webp|jpg|png, else return false.
 */
module.exports.isThisFileAnImage = (fileName) => {
    let fileType =
        fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
    if(fileType === 'webp' || fileType === 'jpg' || fileType === 'png') {
        return true;
    }
    return false;
}


module.exports.MY_SQL_ERR_DUPLICATE_CODE = MY_SQL_ERR_DUPLICATE_CODE;

module.exports.SERVER_HOST = SERVER_HOST;
module.exports.PROTOCOL = PROTOCOL;

module.exports.MY_SQL_HOST = MY_SQL_HOST;
module.exports.MY_SQL_USER = MY_SQL_USER;
module.exports.MY_SQL_PASSWORD = MY_SQL_PASSWORD;
module.exports.MY_SQL_DATABASE_NAME = MY_SQL_DATABASE_NAME;

module.exports.NEWS_CATEGORIES_TABLE_NAME = NEWS_CATEGORIES_TABLE_NAME;
module.exports.NEWS_CATEGORIES_COLUMN_ID = NEWS_CATEGORIES_COLUMN_ID;
module.exports.NEWS_CATEGORIES_COLUMN_NAME = NEWS_CATEGORIES_COLUMN_NAME;

module.exports.NEWS_AUTHORS_TABLE_NAME = NEWS_AUTHORS_TABLE_NAME;
module.exports.NEWS_AUTHORS_COLUMN_ID = NEWS_AUTHORS_COLUMN_ID;
module.exports.NEWS_AUTHORS_COLUMN_NAME = NEWS_AUTHORS_COLUMN_NAME;

module.exports.NEWS_TABLE_NAME = NEWS_TABLE_NAME;
module.exports.NEWS_COLUMN_CATEGORY_ID = NEWS_COLUMN_CATEGORY_ID;
module.exports.NEWS_COLUMN_AUTHOR_ID = NEWS_COLUMN_AUTHOR_ID;
module.exports.NEWS_COLUMN_ID = NEWS_COLUMN_ID;
module.exports.NEWS_COLUMN_TITLE = NEWS_COLUMN_TITLE;
module.exports.NEWS_COLUMN_IMAGE_URL = NEWS_COLUMN_IMAGE_URL;
module.exports.NEWS_COLUMN_SHORT_DESCRIPTION = NEWS_COLUMN_SHORT_DESCRIPTION;
module.exports.NEWS_COLUMN_CONTENT = NEWS_COLUMN_CONTENT;

module.exports.COLUMN_ALIAS_CATEGORY = COLUMN_ALIAS_CATEGORY;
module.exports.COLUMN_ALIAS_AUTHOR = COLUMN_ALIAS_AUTHOR;





