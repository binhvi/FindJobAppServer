// Host deploy
// const PROTOCOL = "https";
// const SERVER_HOST = "find-job-app.herokuapp.com";

// Host development
const PROTOCOL = "http";
const SERVER_HOST = "localhost:3000";

// Host database deploy (Main)
// const MY_SQL_HOST = "johnny.heliohost.org";
// const MY_SQL_USER = "findjob_scott";
// const MY_SQL_PASSWORD = "tiger";
// const MY_SQL_DATABASE_NAME = "findjob_FindJobApp";

// Host database deploy alternative 1 if main host got error
// const MY_SQL_HOST = "freedb.tech";
// const MY_SQL_USER = "freedbtech_scott";
// const MY_SQL_PASSWORD = "tiger";
// const MY_SQL_DATABASE_NAME = "freedbtech_FindJobApp";

// Host database deploy alternative 2 if main host got error
// const MY_SQL_HOST = "85.10.205.173"; // db4free.net
// const MY_SQL_USER = "scott12345";
// const MY_SQL_PASSWORD = "w7pJ4rs3LpWqWpX";
// const MY_SQL_DATABASE_NAME = "findjobapp";

// Host database development
const MY_SQL_HOST = "localhost";
const MY_SQL_USER = "scott";
const MY_SQL_PASSWORD = "tiger";
const MY_SQL_DATABASE_NAME = "FindJobApp";

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

const TYPES_OF_WORK_TABLE_NAME = "TypesOfWork";
const TYPES_OF_WORK_COLUMN_ID = "id";
const TYPES_OF_WORK_COLUMN_NAME = "name";

const LEVELS_OF_EDUCATION_TABLE_NAME = "LevelsOfEducation";
const LEVELS_OF_EDUCATION_COLUMN_ID = "id";
const LEVELS_OF_EDUCATION_COLUMN_NAME = "levelOfEducationName";

const STATE_PROVINCES_TABLE_NAME = "StateProvinces";
const STATE_PROVINCES_COLUMN_ID = "stateProvinceId";
const STATE_PROVINCES_COLUMN_NAME = "name";

const DISTRICTS_TABLE_NAME = "Districts";
const DISTRICTS_COLUMN_ID = "districtId";
const DISTRICTS_COLUMN_NAME = "name";
const DISTRICTS_COLUMN_STATE_PROVINCE_ID = "stateProvinceId";

const SUBDISTRICTS_TABLE_NAME = "Subdistricts";
const SUBDISTRICTS_COLUMN_ID = "subdistrictId";
const SUBDISTRICTS_COLUMN_NAME = "name";
const SUBDISTRICTS_COLUMN_DISTRICT_ID = "districtId";

const USERS_TABLE_NAME = "Users";
const USERS_COLUMN_ID = "id";
const USERS_COLUMN_FULL_NAME = "fullName";
const USERS_COLUMN_PASSWORD = "password";
const USERS_COLUMN_EMAIL = "email";
const USERS_COLUMN_PHONE = "phone";
const USERS_COLUMN_EXPECTED_SALARY_VND = "expectedSalaryInVnd";
const USERS_COLUMN_GRADUATED_EDUCATION_ID = "graduatedEducationId";
const USERS_COLUMN_YEARS_OF_EXPERIENCES = "yearsOfExperiences";
const USERS_COLUMN_CAREER_OBJECTIVE = "careerObjective";
const USERS_COLUMN_ADDRESS_SUBDISTRICT_ID = "addressSubdistrictId";
const USERS_COLUMN_DOB_MILLIS = "birthdayInMilliseconds";
const USERS_COLUMN_GENDER_ID = "genderId";
const USERS_COLUMN_AVATAR_URL = "avatarUrl";
const USERS_COLUMN_TYPE_OF_WORK_ID = "typeOfWorkId";
const USERS_COLUMN_RESUME_SUMMARY = "resumeSummary";

const COLUMN_ALIAS_GENDER = "gender";
const COLUMN_ALIAS_TYPE_OF_WORK = "typeOfWork";
const COLUMN_ALIAS_GRADUATED_EDUCATION_LEVEL = "graduatedEducation";
const COLUMN_ALIAS_STATE_PROVINCE_NAME = "stateProvinceName";
const COLUMN_ALIAS_DISTRICT_NAME = "districtName";
const COLUMN_ALIAS_SUBDISTRICT_NAME = "subdistrictName";

const EXPERIENCES_TABLE_NAME = "Experiences";
const EXPERIENCES_COLUMN_ID = "id";
const EXPERIENCES_COLUMN_USER_ID = "userId";
const EXPERIENCES_COLUMN_COMPANY_NAME = "companyName";
const EXPERIENCES_COLUMN_JOB_TITLE = "jobTitle";
const EXPERIENCES_COLUMN_DATE_IN_MILLIS = "dateInMilliseconds";
const EXPERIENCES_COLUMN_DATE_OUT_MILLIS = "dateOutMilliseconds";
const EXPERIENCES_COLUMN_JOB_DETAILS = "jobDetails";

const ACADEMIC_DEGREE_LEVELS_TABLE_NAME = "AcademicDegreeLevels";
const ACADEMIC_DEGREE_LEVELS_COLUMN_ID = "id";
const ACADEMIC_DEGREE_LEVELS_COLUMN_NAME = "name";

const EDUCATION_TABLE_NAME = "Education";
const EDUCATION_COLUMN_ID = "id";
const EDUCATION_COLUMN_USER_ID = "userId";
const EDUCATION_COLUMN_MAJOR = "major";
const EDUCATION_COLUMN_SCHOOL_NAME = "schoolName";
const EDUCATION_COLUMN_ACADEMIC_DEGREE_LEVEL_ID = "academicDegreeLevelId";
const EDUCATION_COLUMN_START_DATE_MILLIS = "startDateInMilliseconds";
const EDUCATION_COLUMN_END_DATE_MILLIS = "endDateInMilliseconds";
const EDUCATION_COLUMN_ACHIEVEMENTS = "achievements";

const COLUMN_ALIAS_ACADEMIC_DEGREE_LEVEL = "academicDegreeLevel";

const JOB_NEWS_STATUS_TABLE_NAME = "JobNewsStatus";
const JOB_NEWS_STATUS_COLUMN_ID = "id";
const JOB_NEWS_STATUS_COLUMN_NAME = "statusName";

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

const REGEX_PHONE = /^\d{9,10}$/; // 9-10 digits
const REGEX_EMAIL = /\w{1,}@\w{1,}.\w{1,}/; // anyword@anyword.anyword
const REGEX_PASSWORD = /^\S*$/; // Not contains white space

const ERR_MSG_PASSWORD_NOT_MATCH_PASSWORD_REGEX =
                                "Mật khẩu không được chứa khoảng trắng.";

const USER_BIRTHDAY_DATE_FORMAT = "YYYY-MM-DD";

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

module.exports.TYPES_OF_WORK_TABLE_NAME = TYPES_OF_WORK_TABLE_NAME;
module.exports.TYPES_OF_WORK_COLUMN_ID = TYPES_OF_WORK_COLUMN_ID;
module.exports.TYPES_OF_WORK_COLUMN_NAME = TYPES_OF_WORK_COLUMN_NAME;

module.exports.LEVELS_OF_EDUCATION_TABLE_NAME = LEVELS_OF_EDUCATION_TABLE_NAME;
module.exports.LEVELS_OF_EDUCATION_COLUMN_ID = LEVELS_OF_EDUCATION_COLUMN_ID;
module.exports.LEVELS_OF_EDUCATION_COLUMN_NAME = LEVELS_OF_EDUCATION_COLUMN_NAME;

module.exports.STATE_PROVINCES_TABLE_NAME = STATE_PROVINCES_TABLE_NAME;
module.exports.STATE_PROVINCES_COLUMN_ID = STATE_PROVINCES_COLUMN_ID;
module.exports.STATE_PROVINCES_COLUMN_NAME = STATE_PROVINCES_COLUMN_NAME;

module.exports.DISTRICTS_TABLE_NAME = DISTRICTS_TABLE_NAME;
module.exports.DISTRICTS_COLUMN_ID = DISTRICTS_COLUMN_ID;
module.exports.DISTRICTS_COLUMN_NAME = DISTRICTS_COLUMN_NAME;
module.exports.DISTRICTS_COLUMN_STATE_PROVINCE_ID =
                                DISTRICTS_COLUMN_STATE_PROVINCE_ID;

module.exports.SUBDISTRICTS_TABLE_NAME = SUBDISTRICTS_TABLE_NAME;
module.exports.SUBDISTRICTS_COLUMN_ID = SUBDISTRICTS_COLUMN_ID;
module.exports.SUBDISTRICTS_COLUMN_NAME = SUBDISTRICTS_COLUMN_NAME;
module.exports.SUBDISTRICTS_COLUMN_DISTRICT_ID =
                                        SUBDISTRICTS_COLUMN_DISTRICT_ID;

module.exports.USERS_TABLE_NAME = USERS_TABLE_NAME;
module.exports.USERS_COLUMN_ID = USERS_COLUMN_ID;
module.exports.USERS_COLUMN_FULL_NAME = USERS_COLUMN_FULL_NAME;
module.exports.USERS_COLUMN_PASSWORD = USERS_COLUMN_PASSWORD;
module.exports.USERS_COLUMN_EMAIL = USERS_COLUMN_EMAIL;
module.exports.USERS_COLUMN_PHONE = USERS_COLUMN_PHONE;
module.exports.USERS_COLUMN_EXPECTED_SALARY_VND =
    USERS_COLUMN_EXPECTED_SALARY_VND;
module.exports.USERS_COLUMN_GRADUATED_EDUCATION_ID =
    USERS_COLUMN_GRADUATED_EDUCATION_ID;
module.exports.USERS_COLUMN_YEARS_OF_EXPERIENCES =
    USERS_COLUMN_YEARS_OF_EXPERIENCES;
module.exports.USERS_COLUMN_CAREER_OBJECTIVE =
    USERS_COLUMN_CAREER_OBJECTIVE;
module.exports.USERS_COLUMN_ADDRESS_SUBDISTRICT_ID =
                                USERS_COLUMN_ADDRESS_SUBDISTRICT_ID;
module.exports.USERS_COLUMN_DOB_MILLIS = USERS_COLUMN_DOB_MILLIS;
module.exports.USERS_COLUMN_GENDER_ID = USERS_COLUMN_GENDER_ID;
module.exports.USERS_COLUMN_AVATAR_URL = USERS_COLUMN_AVATAR_URL;
module.exports.USERS_COLUMN_TYPE_OF_WORK_ID =
    USERS_COLUMN_TYPE_OF_WORK_ID;
module.exports.USERS_COLUMN_RESUME_SUMMARY = USERS_COLUMN_RESUME_SUMMARY;

module.exports.COLUMN_ALIAS_GENDER = COLUMN_ALIAS_GENDER;
module.exports.COLUMN_ALIAS_TYPE_OF_WORK = COLUMN_ALIAS_TYPE_OF_WORK;
module.exports.COLUMN_ALIAS_GRADUATED_EDUCATION_LEVEL =
    COLUMN_ALIAS_GRADUATED_EDUCATION_LEVEL;
module.exports.COLUMN_ALIAS_STATE_PROVINCE_NAME =
                                    COLUMN_ALIAS_STATE_PROVINCE_NAME;
module.exports.COLUMN_ALIAS_DISTRICT_NAME = COLUMN_ALIAS_DISTRICT_NAME;
module.exports.COLUMN_ALIAS_SUBDISTRICT_NAME =
                                        COLUMN_ALIAS_SUBDISTRICT_NAME;

module.exports.EXPERIENCES_TABLE_NAME = EXPERIENCES_TABLE_NAME;
module.exports.EXPERIENCES_COLUMN_ID = EXPERIENCES_COLUMN_ID;
module.exports.EXPERIENCES_COLUMN_USER_ID = EXPERIENCES_COLUMN_USER_ID;
module.exports.EXPERIENCES_COLUMN_COMPANY_NAME =
    EXPERIENCES_COLUMN_COMPANY_NAME;
module.exports.EXPERIENCES_COLUMN_JOB_TITLE = EXPERIENCES_COLUMN_JOB_TITLE;
module.exports.EXPERIENCES_COLUMN_DATE_IN_MILLIS =
                                    EXPERIENCES_COLUMN_DATE_IN_MILLIS;
module.exports.EXPERIENCES_COLUMN_DATE_OUT_MILLIS =
                                    EXPERIENCES_COLUMN_DATE_OUT_MILLIS;
module.exports.EXPERIENCES_COLUMN_JOB_DETAILS =
                                    EXPERIENCES_COLUMN_JOB_DETAILS;

module.exports.ACADEMIC_DEGREE_LEVELS_TABLE_NAME =
                                ACADEMIC_DEGREE_LEVELS_TABLE_NAME;
module.exports.ACADEMIC_DEGREE_LEVELS_COLUMN_ID =
                                ACADEMIC_DEGREE_LEVELS_COLUMN_ID;
module.exports.ACADEMIC_DEGREE_LEVELS_COLUMN_NAME =
                                ACADEMIC_DEGREE_LEVELS_COLUMN_NAME;

module.exports.EDUCATION_TABLE_NAME = EDUCATION_TABLE_NAME;
module.exports.EDUCATION_COLUMN_ID = EDUCATION_COLUMN_ID;
module.exports.EDUCATION_COLUMN_USER_ID = EDUCATION_COLUMN_USER_ID;
module.exports.EDUCATION_COLUMN_MAJOR = EDUCATION_COLUMN_MAJOR;
module.exports.EDUCATION_COLUMN_SCHOOL_NAME =
                                    EDUCATION_COLUMN_SCHOOL_NAME;
module.exports.EDUCATION_COLUMN_ACADEMIC_DEGREE_LEVEL_ID =
                        EDUCATION_COLUMN_ACADEMIC_DEGREE_LEVEL_ID;
module.exports.EDUCATION_COLUMN_START_DATE_MILLIS =
                        EDUCATION_COLUMN_START_DATE_MILLIS;
module.exports.EDUCATION_COLUMN_END_DATE_MILLIS =
                        EDUCATION_COLUMN_END_DATE_MILLIS;
module.exports.EDUCATION_COLUMN_ACHIEVEMENTS =
                        EDUCATION_COLUMN_ACHIEVEMENTS;
module.exports.COLUMN_ALIAS_ACADEMIC_DEGREE_LEVEL =
                        COLUMN_ALIAS_ACADEMIC_DEGREE_LEVEL;

module.exports.JOB_NEWS_STATUS_TABLE_NAME = JOB_NEWS_STATUS_TABLE_NAME;
module.exports.JOB_NEWS_STATUS_COLUMN_ID = JOB_NEWS_STATUS_COLUMN_ID;
module.exports.JOB_NEWS_STATUS_COLUMN_NAME = JOB_NEWS_STATUS_COLUMN_NAME;

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

module.exports.REGEX_PHONE = REGEX_PHONE;
module.exports.REGEX_EMAIL = REGEX_EMAIL;
module.exports.REGEX_PASSWORD = REGEX_PASSWORD;

module.exports.ERR_MSG_PASSWORD_NOT_MATCH_PASSWORD_REGEX =
                            ERR_MSG_PASSWORD_NOT_MATCH_PASSWORD_REGEX;

module.exports.USER_BIRTHDAY_DATE_FORMAT = USER_BIRTHDAY_DATE_FORMAT;









