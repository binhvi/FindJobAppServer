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
Xem thông tin người dùng

POST /api/users/details
Tham số:
userId (int)
------------------------------------

Cập nhật thông tin người dùng
POST /api/users/update
Tham số:
- id (int, bắt buộc)
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
- avatar (file ảnh wepb/png/jpg, tùy chọn)
- genderId: (giới tính)
    + int, tùy chọn
    + Validate: genderId không tồn tại
- birthdayInMilliseconds: int (milliseconds), tùy chọn
- address: String, tùy chọn
- graduatedEducationId: (bằng cấp)
    + int, tùy chọn
    + Validate: graduatedEducationId không tồn tại
- typeOfWorkId: (loại hình công việc)
    + int, tùy chọn
    + Validate: typeOfWorkId không tồn tại
- expectedSalaryInMillionVnd (mức lương mong muốn): int >= 0, tùy chọn
- yearsOfExperience (số năm kinh nghiệm): int >= 0, tùy chọn
- resumeSummary (giới thiệu bản thân): String, tùy chọn
- careerObjective (mục tiêu nghề nghiệp): String, tùy chọn

CHÚ Ý:
    - id, fullName, phone, email là bắt buộc.
    - Các trường genderId, birthdayInMilliseconds, address,
    graduatedEducationId, typeOfWorkId, expectedSalaryInMillionVnd,
    yearsOfExperience, resumeSummary, careerObjective nếu request
thiếu trường hoặc có trường nhưng nội dung rỗng thì dữ liệu của trường đó
 của User sẽ bị xóa.
    - Trường avatar khi request thiếu trường, hoặc có trường
nhưng giá trị rỗng sau khi request không bị xóa.
------------------------------------------------------
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
--------------
Cập nhật thông tin kinh nghiệm làm việc của ứng viên (người dùng)
POST /api/experiences/update
--------------
Xóa thông tin kinh nghiệm làm việc của ứng viên (người dùng)
POST /api/experiences/remove
Tham số:
- userId (int, bắt buộc, không trống, id phải tồn tại)