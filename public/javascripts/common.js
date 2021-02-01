// Host deploy
const PROTOCOL = "https";
const SERVER_HOST = "find-job-app.herokuapp.com";

// Host development
// const PROTOCOL = "http";
// const SERVER_HOST = "localhost:3000";

// Host database deploy
const MY_SQL_HOST = "johnny.heliohost.org";
const MY_SQL_USER = "findjob_scott";
const MY_SQL_PASSWORD = "tiger";
const MY_SQL_DATABASE_NAME = "findjob_FindJobApp";

// Host database development
// const MY_SQL_HOST = "localhost";
// const MY_SQL_USER = "scott";
// const MY_SQL_PASSWORD = "tiger";
// const MY_SQL_DATABASE_NAME = "FindJobApp";


const MY_SQL_ERR_DUPLICATE_CODE = "ER_DUP_ENTRY";

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

const GENDERS_TABLE_NAME = "Genders";
const GENDERS_COLUMN_ID = "id";
const GENDERS_COLUMN_NAME = "name";

// Pagination constants
const DEFAULT_ITEM_PER_PAGE_NUM = 100;
const MIN_ITEM_PER_PAGE_NUM = 1;
const MAX_ITEM_PER_PAGE_NUM = 500;

const DEFAULT_PAGE_INDEX = 1;

const DEFAULT_MYSQL_OFFSET = 0;

// Response keys
const RESPONSE_KEY_TOTAL_ITEMS = "total";
const RESPONSE_KEY_NUMBER_OF_ITEMS_PER_PAGE = "perpage";
const RESPONSE_KEY_PAGE_INDEX = "page";
const RESPONSE_KEY_NUMBER_OF_PAGES = "pages";
const RESPONSE_KEY_RESULT_STATUS = "result";

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

module.exports.GENDERS_TABLE_NAME = GENDERS_TABLE_NAME;
module.exports.GENDERS_COLUMN_ID = GENDERS_COLUMN_ID;
module.exports.GENDERS_COLUMN_NAME = GENDERS_COLUMN_NAME;

module.exports.DEFAULT_ITEM_PER_PAGE_NUM = DEFAULT_ITEM_PER_PAGE_NUM;
module.exports.MIN_ITEM_PER_PAGE_NUM = MIN_ITEM_PER_PAGE_NUM;
module.exports.MAX_ITEM_PER_PAGE_NUM = MAX_ITEM_PER_PAGE_NUM;

module.exports.DEFAULT_PAGE_INDEX = DEFAULT_PAGE_INDEX;

module.exports.DEFAULT_MYSQL_OFFSET = DEFAULT_MYSQL_OFFSET;

module.exports.RESPONSE_KEY_TOTAL_ITEMS = RESPONSE_KEY_TOTAL_ITEMS;
module.exports.RESPONSE_KEY_NUMBER_OF_ITEMS_PER_PAGE =
                                RESPONSE_KEY_NUMBER_OF_ITEMS_PER_PAGE;
module.exports.RESPONSE_KEY_PAGE_INDEX = RESPONSE_KEY_PAGE_INDEX;
module.exports.RESPONSE_KEY_NUMBER_OF_PAGES = RESPONSE_KEY_NUMBER_OF_PAGES;
module.exports.RESPONSE_KEY_RESULT_STATUS = RESPONSE_KEY_RESULT_STATUS;









