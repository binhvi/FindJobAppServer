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

----------------------------------
Lấy danh sách người dùng (ứng viên)
GET /api/users
(Truy vấn sắp xếp id giảm dần (hay ứng viên đăng ký mới nhất cho lên đầu.)).
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
