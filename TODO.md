# PBL_v1 Grading Feature Implementation TODO

## Status: [x] In Progress

**Breakdown of approved plan:**

1. **[x] Step 1: Prisma schema + migrate** - Pending manual migrate run.

2. **[x] Step 2: gradingController.js** ✅

3. **[x] Step 3: grading routes + index.js mount** ✅

4. **[ ] Step 4: Frontend API endpoints**.

5. **[ ] Step 5: Supervisor grades page + nav.

6. **[ ] Step 6: Student my grades view.

7. **[ ] Step 7: Test.

**Next step:** Test feature! Run prisma migrate manually.

**Completed:** Backend (schema/controller/routes), Frontend APIs/UI (grades page, nav, student section). ✅

**Notes:** 
1. Run `cd pbl_v1/server && npx prisma migrate dev add_student_grades && npx prisma generate`
2. Start backend/frontend.
3. Test: Login sup, /dashboard/supervisor/grades, edit marks (create first time?), publish.
4. Student login see grades.
Minor: Controller create if no gradeId, api.ts types, full grades load in student page.

