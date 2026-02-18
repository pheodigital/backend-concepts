1️⃣ Auth Routes.
Register (USER)
curl -X POST http://localhost:3000/register \
 -H "Content-Type: application/json" \
 -d '{
"email":"newuser@example.com",
"password":"StrongPass123!",
"role":"USER"
}'

Register (ADMIN)
curl -X POST http://localhost:3000/register \
 -H "Content-Type: application/json" \
 -d '{
"email":"admin@example.com",
"password":"StrongPass123!",
"role":"ADMIN"
}'

Login
curl -X POST http://localhost:3000/login \
 -H "Content-Type: application/json" \
 -d '{
"email":"newuser@example.com",
"password":"StrongPass123!"
}'

Save returned accessToken and refreshToken

Get Current User (/me)
curl -X GET http://localhost:3000/me \
 -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

Refresh Token
curl -X POST http://localhost:3000/refresh \
 -H "Content-Type: application/json" \
 -d '{
"refreshToken":"YOUR_REFRESH_TOKEN"
}'

Returns new accessToken and refreshToken. Old refresh token revoked.

Logout
curl -X POST http://localhost:3000/logout \
 -H "Content-Type: application/json" \
 -d '{
"refreshToken":"YOUR_REFRESH_TOKEN"
}'

Revokes refresh token. Cannot refresh again with this token.

2️⃣ User Routes
Get All Users (Admin Only)
curl -X GET http://localhost:3000/users \
 -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"

Get User By ID
curl -X GET http://localhost:3000/users/USER_ID_HERE \
 -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

USER → can get only self
ADMIN → can get any user

3️⃣ Task Routes
Create Task
curl -X POST http://localhost:3000/tasks \
 -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
 -H "Content-Type: application/json" \
 -d '{
"title":"My First Task",
"description":"This is a test task"
}'

Owner is automatically set from JWT

Get All Tasks
curl -X GET http://localhost:3000/tasks \
 -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

USER → only own tasks
ADMIN → all tasks

Get Task By ID
curl -X GET http://localhost:3000/tasks/TASK_ID_HERE \
 -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

Update Task
curl -X PUT http://localhost:3000/tasks/TASK_ID_HERE \
 -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
 -H "Content-Type: application/json" \
 -d '{
"title":"Updated Task Title",
"description":"Updated description",
"status":"IN_PROGRESS"
}'

Only owner or admin can update

Delete Task
curl -X DELETE http://localhost:3000/tasks/TASK_ID_HERE \
 -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

Only owner or admin can delete

4️⃣ Admin Routes
List All Users
curl -X GET http://localhost:3000/admin/users \
 -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"

Only admins can access this route. USER → 403 Forbidden

5️⃣ Health Check
curl -X GET http://localhost:3000/health

Returns { "status": "ok" }
