localhost:3000 (development)
https://find-job-app.herokuapp.com (deploy)

News

Lấy danh sách bài viết:
POST /api/news
Tham số: 
    page (int), 
    perpage (là limit) (int), 
    categoryId (int)

---

Lấy tất cả thông tin của một bài viết:
POST /api/news/details
Tham số: newsId (int)


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
