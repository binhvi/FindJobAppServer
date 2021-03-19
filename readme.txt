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

Lấy danh sách các tỉnh
GET /api/states-provinces
=========================
Districts

Lấy danh sách các huyện của một tỉnh
POST /api/districts/get-districts-by-state-province-id
Tham số: stateProvinceId (mã tỉnh, String, phải tồn tại)

================
Subdistricts

Lấy danh sách các xã của một huyện
POST /api/subdistricts/get-subdistricts-by-district-id
Tham số: districtId (mã huyện, String, phải tồn tại)

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
- userId: int, bắt buộc, phải tồn tại
- jobSkillId: (0, 1 hoặc nhiều trường; int; phải tồn tại)
    + Nếu không có trường jobSkillId nào thì tất cả dữ liệu
JobSkillsOfCandidate của người dùng đó sẽ bị xóa.
    + Nếu có 1 trường jobSkillId: Giá trị không được để trống, là int,
phải tồn tại. Sẽ xóa hết dữ liệu trước đó và thêm kỹ năng này vào.
    + Nếu có hơn 1 trường jobSkillId: Tất cả các giá trị không được để trống,
phải là số nguyên, phải tồn tại, không có các giá trị trùng nhau.
Sẽ xóa hết dữ liệu trước đó và thay bằng các kỹ năng này vào.

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
