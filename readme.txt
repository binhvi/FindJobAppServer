localhost:3000 (development)
https://find-job-app.herokuapp.com (deploy)

News

Lấy danh sách bài viết:
POST /api/news
Tham số: 
    page (int), 
    perpage (là limit) (int), 
    categoryId (int)
===============

NewsCategories
Lấy danh sách thể loại
GET /api/news-categories

===========

Genders
GET /api/genders
(web: /genders)

========
TypesOfWork
GET /api/types-of-work
(web: /types-of-work)

=========
LevelsOfEducation
GET /api/levels-of-education
(web: /levels-of-education)

==========
AcademicDegreeLevels
GET /api/academic-degree-levels
(web: /academic-degree-levels)

==============
Users
POST /api/users/create (đăng ký)
Tham số:
- fullName
    + String
    + Tên không được để trống
    + Tên từ 2 ký tự trở lên
- phone
    + String
    + Phone không trống
    + Phone đúng định dạng (9-10 ký tự số):  /^\d{9,10}$/
    + Phone không trùng với người khác
- email
    + String
    + Email không trống
    + Email đúng định dạng a@b.c
        /\w{1,}@\w{1,}.\w{1,}/; // anyword@anyword.anyword
    + Email không trùng với người khác
-	password
    + String
    + Mật khẩu không trống
    + Mật khẩu tối thiểu 6 ký tự
    + Mật khẩu không chứa khoảng trắng
----
POST /api/users/login
Tham số:
- email
    + String
    + Email không trống
    + Email đúng định dạng a@b.c
        /\w{1,}@\w{1,}.\w{1,}/; // anyword@anyword.anyword
- password
      + String
      + Mật khẩu không trống
      + Mật khẩu tối thiểu 6 ký tự

--
Xem thông tin người dùng - truy vấn tất cả thông tin từ các bảng khác
POST /api/users/details-query-all-info
Tham số:
userId (int)
--
Xem thông tin người dùng - chỉ lấy id ở trường liên kết với các bảng khác
POST /api/users/details-get-id
Tham số:
userId (int)
------------------------------------

Cập nhật thông tin người dùng
POST /api/users/update
Tham số:
- userId (int, bắt buộc, phải tồn tại)
- fullName
    + String, bắt buộc
    + Tên không được để trống
    + Tên từ 2 ký tự trở lên
- phone
    + String, bắt buộc
    + Phone không trống
    + Phone đúng định dạng (9-10 ký tự số):  /^\d{9,10}$/
    + Phone không trùng với người khác
- email
    + String, bắt buộc
    + Email không trống
    + Email đúng định dạng a@b.c
        /\w{1,}@\w{1,}.\w{1,}/; // anyword@anyword.anyword
    + Email không trùng với người khác
- avatar (file ảnh wepb/png/jpg, không bắt buộc)
- genderId: (giới tính)
    + int, không bắt buộc
    + Validate: genderId không tồn tại
- birthdayInMilliseconds: int (milliseconds), không bắt buộc
- addressSubdistrictId: (ID xã) Không bắt buộc, String, ID phải tồn tại
- graduatedEducationId: (bằng cấp)
    + int, không bắt buộc
    + Validate: graduatedEducationId không tồn tại
- typeOfWorkId: (loại hình công việc)
    + int, không bắt buộc
    + Validate: typeOfWorkId không tồn tại
- expectedSalaryInVnd (mức lương mong muốn): int >= 0, không bắt buộc
- yearsOfExperiences (số năm kinh nghiệm): int >= 0, không bắt buộc
- resumeSummary (giới thiệu bản thân): String, không bắt buộc
- careerObjective (mục tiêu nghề nghiệp): String, không bắt buộc

CHÚ Ý:
    - id, fullName, phone, email là bắt buộc.
    - Các trường genderId, birthdayInMilliseconds, addressSubdistrictId,
    graduatedEducationId, typeOfWorkId, expectedSalaryInVnd,
    yearsOfExperiences, resumeSummary, careerObjective nếu request
thiếu trường hoặc có trường nhưng nội dung rỗng thì dữ liệu của trường đó
 của User sẽ bị xóa.
    - Trường avatar khi request thiếu trường, hoặc có trường
nhưng giá trị rỗng sau khi request không bị xóa.
----------------------------------
Lấy danh sách người dùng (ứng viên)
GET /api/users
(Truy vấn sắp xếp id giảm dần (hay ứng viên đăng ký mới nhất cho lên đầu.)).
--------------
Đổi mật khẩu
POST /api/users/change-password
Tham số:
- userId (int, bắt buộc, không trống, id phải tồn tại)
- oldPassword
    + String, bắt buộc, không trống
    + Phải đúng với mật khẩu người dùng đã lưu trong database
- newPassword
    + String, bắt buộc, không trống
    + Mật khẩu phải >= 6 ký tự
            + Không được chứa khoảng trắng

============================
Education

Lấy danh sách thông tin học vấn của ứng viên (người dùng)
POST /api/education
Tham số:
- userId (int, bắt buộc, không trống, id phải tồn tại)
------------------------
Tạo thông tin học vấn của ứng viên (người dùng)
POST /api/education/create
Tham số:
- userId (id người dùng, int, bắt buộc, phải tồn tại)
- major (chuyên ngành) (String, bắt buộc, không rỗng)
- schoolName (String, bắt buộc, không rỗng)
- academicDegreeLevelId (id bằng cấp học thuật)
(lấy json của AcademicDegreeLevels tại api GET /api/academic-degree-levels
 hoặc xem danh sách trên web tại
 https://find-job-app.herokuapp.com/academic-degree-levels)
    + Bắt buộc
    + int
    + Phải tồn tại

- startDateInMilliseconds (ngày bắt đầu, tính bằng milliseconds)
    + Bắt buộc, int
- endDateInMilliseconds (ngày kết thúc, tính bằng milliseconds)
    + Tùy chọn (= optional/không bắt buộc/Có thể rỗng hoặc null)
    + int
    + Nếu khác rỗng thì phải > startDateInMilliseconds
- achievements (thành tích)
    + Tùy chọn
    + String
---------------
Cập nhật thông tin học vấn của ứng viên (người dùng)
POST /api/education/update
Tham số:
- educationId (id bản ghi thông tin học vấn, int, bắt buộc, phải tồn tại)
- userId (id người dùng, int, bắt buộc, phải tồn tại)
- major (chuyên ngành) (String, bắt buộc, không rỗng)
- schoolName (String, bắt buộc, không rỗng)
- academicDegreeLevelId (id bằng cấp học thuật)
(lấy json của AcademicDegreeLevels tại api GET /api/academic-degree-levels
 hoặc xem danh sách trên web tại
 https://find-job-app.herokuapp.com/academic-degree-levels)
    + Bắt buộc
    + int
    + Phải tồn tại

- startDateInMilliseconds (ngày bắt đầu, tính bằng milliseconds)
    + Bắt buộc, int
- endDateInMilliseconds (ngày kết thúc, tính bằng milliseconds)
    + Tùy chọn (= optional/không bắt buộc/Có thể rỗng hoặc null)
    + int
    + Nếu khác rỗng thì phải > startDateInMilliseconds
- achievements (thành tích)
    + Tùy chọn
    + String
CHÚ Ý: Các trường tùy chọn khi update mà null hay rỗng thì dữ liệu
trường đó sẽ bị xóa.
----------
Xóa thông tin học vấn của ứng viên (người dùng)
POST /api/education/remove
Tham số:
- educationId (int, bắt buộc, không trống, id phải tồn tại)
=====================
Experiences

Lấy danh sách thông tin kinh nghiệm làm việc của ứng viên (người dùng)
POST /api/experiences
Tham số:
- userId (int, bắt buộc, không trống, id phải tồn tại)
------------------
Tạo thông tin kinh nghiệm làm việc của ứng viên (người dùng)
POST /api/experiences/create
Tham số:
- userId (required, int, phải tồn tại)
- companyName (required, String, không trống)
- jobTitle (required, String, không trống)
- dateInMilliseconds (required, int)
- dateOutMilliseconds (optional, int, > dateInMilliseconds)
- jobDetails (optional, String)
--------------
Cập nhật thông tin kinh nghiệm làm việc của ứng viên (người dùng)
POST /api/experiences/update
Tham số:
- experienceId (required, int, phải tồn tại)
- userId (required, int, phải tồn tại)
- companyName (required, String, không trống)
- jobTitle (required, String, không trống)
- dateInMilliseconds (required, int)
- dateOutMilliseconds (optional, int, > dateInMilliseconds)
- jobDetails (optional, String)
--------------
Xóa thông tin kinh nghiệm làm việc của ứng viên (người dùng)
POST /api/experiences/remove
Tham số:
- experienceId (int, bắt buộc, không trống, id phải tồn tại)
====================
JobNewsStatus
GET /api/job-news-status
Web: /job-news-status
=========================
StateProvinces

Lấy danh sách các tỉnh/thành phố
GET /api/states-provinces
=========================
Districts

Lấy danh sách các quận/huyện của một tỉnh/thành phố
POST /api/districts/get-districts-by-state-province-id
Tham số: stateProvinceId (mã tỉnh/thành phố, String, phải tồn tại)

================
Subdistricts

Lấy danh sách các phường/xã của một quận/huyện
POST /api/subdistricts/get-subdistricts-by-district-id
Tham số: districtId (mã quận/huyện, String, phải tồn tại)

================
JobSkills

Lấy danh sách kỹ năng chuyên môn
GET /api/job-skills
Web: /job-skills

=====================
JobSkillsOfCandidate

Tạo/cập nhật thông tin kỹ năng làm việc cho ứng viên:
(Mỗi lần request lên đều xóa dữ liệu cũ và set dữ liệu mới vào)
POST /api/job-skills-of-candidate/set-user-job-skills
Tham số:
requestDataJsonString
- Bắt buộc, không trống
- String là chuỗi JSON, trong chuỗi JSON có chứa các trường sau:
    + userId: int, bắt buộc, phải tồn tại
    + jobSkillIdArr: Là mảng ID JobSkills, các phần tử là số nguyên,
phải tồn tại.
        * Nếu jobSkillIdArr không có phần tử nào thì tất cả dữ liệu
JobSkillsOfCandidate của người dùng đó sẽ bị xóa.
        * Nếu jobSkillIdArr có 1 phần tử: Phần tử phải là số nguyên,
phải có giá trị nằm trong các ID của JobSkills. Sẽ xóa hết dữ liệu trước đó
và thêm ID của kỹ năng này vào.
        * Nếu jobSkillIdArr có hơn 2 phần tử: Tất cả các phần tử
phải là số nguyên, phải có giá trị nằm trong các ID của JobSkills,
không có các giá trị trùng nhau. Sẽ xóa hết dữ liệu trước đó
và thay bằng các kỹ năng này vào.

Ví dụ: Một request có key là requestDataJsonString và value là
'{"userId":"22","jobSkillIdArr": [1, 2, 3]}'.

(Danh sách JobSkills lấy JSON ở API GET /api/job-skills
hoặc xem trên Web ở /job-skills)
---------------
Lấy danh sách kỹ năng chuyên môn (Web, mobile, game,...) của ứng viên
POST /api/job-skills-of-candidate
Tham số: userId (int, bắt buộc, không trống, id phải tồn tại)
============================
JobTitles
Cấp bậc công việc
GET /api/job-titles
Web: /job-titles
======================
JobNews

Lấy danh sách tin tuyển dụng (đã được phê duyệt)
GET /api/job-news/approved-job-news
--------------------
Lấy thông tin chi tiết một tin tuyển dụng
POST /api/job-news/details
Tham số: jobNewsId (bắt buộc, int, phải tồn tại)
--------------
Tạo tin tuyển dụng: Tạo một tin tuyển dụng mới, có trạng thái
chưa phê duyệt.
POST /api/job-news/create
Tham số:
- userId (bắt buộc, int, không trống, phải tồn tại)
- companyName (bắt buộc, String, không trống)
- jobShortDescription (bắt buộc, String, không trống)
- salaryInVnd (bắt buộc, int, >= 0)
- jobDescription (bắt buộc, String, không trống)
- addressSubdistrictId (là ID xã, bắt buộc, String, phải tồn tại)
- typeOfWorkId (bắt buộc, int, phải tồn tại)
- requiredNumberYearsOfExperiences (bắt buộc, int, >= 0)
- detailAddress (bắt buộc, String, không trống)
- jobTitleId (bắt buộc, int, phải tồn tại)
- companySizeByNumberEmployees (bắt buộc, int, > 0)
- companyWebsite (bắt buộc, String, không trống, phải là một URL)
- companyEmail (bắt buộc, String, phải đúng định dạng
 /\w{1,}@\w{1,}.\w{1,}/ (anyword@anyword.anyword)
- companyPhoneNumber (bắt buộc, String, phải đúng định dạng
 (chuỗi 10-12 chữ số)

 (Một người dùng chỉ có thể đăng tối đa 5 tin)
------------------
Xem những tin tuyển dụng của một người dùng đăng mà chưa được duyệt
POST /api/job-news/get-unapproved-job-news-of-an-owner
Tham số:
ownerId (cũng là ID của người dùng, bắt buộc, int, không trống,
phải tồn tại)
--------------------------
Xem những tin tuyển dụng đã được phê duyệt của một người dùng đăng
POST /api/job-news/get-approved-job-news-of-an-owner
Tham số:
ownerId (cũng là ID của người dùng, bắt buộc, int, không trống,
phải tồn tại)
-----------------------

Xóa tin tuyển dụng
POST /api/job-news/remove
Tham số: jobNewsId (là ID bài tuyển dụng, bắt buộc, int, không trống,
phải tồn tại).

===================
JobNewsRequiredSkills

Lấy danh sách các kỹ năng chuyên môn yêu cầu của tin tuyển dụng
POST /api/job-news-required-skills/required-job-skills-of-job-news
Tham số: jobNewsId (là ID bài tuyển dụng, bắt buộc, int, không trống,
phải tồn tại).

---------------------
Tạo/cập nhật thông tin kỹ năng chuyên môn yêu cầu cho tin tuyển dụng:
(Mỗi lần request lên đều xóa dữ liệu cũ và set dữ liệu mới vào)
POST /api/job-news-required-skills/set-job-news-required-job-skills
Tham số:
requestDataJsonString
- Bắt buộc, không trống
- String là chuỗi JSON, trong chuỗi JSON có chứa các trường sau:
    + jobNewsId: int, bắt buộc, phải tồn tại
    + jobSkillIdArr: Là mảng ID JobSkills, các phần tử là số nguyên,
phải tồn tại.
        * Nếu jobSkillIdArr không có phần tử nào thì tất cả dữ liệu
        JobNewsRequiredSkills của người dùng đó sẽ bị xóa.
        * Nếu jobSkillIdArr có 1 phần tử: Phần tử phải là số nguyên,
        phải có giá trị nằm trong các ID của JobSkills. Sẽ xóa hết dữ liệu trước đó
        và thêm ID của kỹ năng này vào.
        * Nếu jobSkillIdArr có hơn 2 phần tử: Tất cả các phần tử
        phải là số nguyên, phải có giá trị nằm trong các ID của JobSkills,
        không có các giá trị trùng nhau. Sẽ xóa hết dữ liệu trước đó
        và thay bằng các kỹ năng này vào.

Ví dụ: Một request có key là requestDataJsonString và value là
'{"jobNewsId":"1","jobSkillIdArr": [1, 2, 3]}'.

(Danh sách JobSkills lấy JSON ở API GET /api/job-skills
hoặc xem trên Web ở /job-skills)
====================

JobApplications

Ứng tuyển
POST /api/job-applications/apply-job
Tham số:
- userId (bắt buộc, int, không trống, phải tồn tại, nếu người ứng tuyển
là người đăng tin tuyển dụng thì không được tự ứng tuyển vào tin mình đăng).
- jobNewsId (bắt buộc, int, không trống, phải tồn tại,
tin phải được phê duyệt rồi).
Nếu ứng viên đã ứng tuyển một công việc rồi mà vẫn ứng tuyển tiếp vào
công việc đó thì sẽ có thông báo lỗi (ứng tuyển vào những công việc khác
vẫn được).

-----------------------
Xem danh sách những tin mà ứng viên đã ứng tuyển
POST /api/job-applications/get-applied-jobs-of-one-candidate
Tham số:
- userId (bắt buộc, int, không trống, phải tồn tại)

------------------------------

Hủy ứng tuyển (dành cho ứng viên)
POST /api/job-applications/cancel-job-application-from-candidate
Tham số:
- userId (bắt buộc, int, không trống, phải tồn tại)
- jobNewsId (bắt buộc, int, không trống, phải tồn tại)

--------------------------------
Xóa những ứng viên đã ứng tuyển của một tin tuyển dụng