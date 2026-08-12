# Static Test Users

Seeded via `backend/scripts/seedUser.js <role> <email> <password> [firstName] [lastName]` for local
manual testing only. Not real accounts — do not use in production or commit real credentials here.

| Role     | Email                    | Password         | Name       |
| -------- | ------------------------ | ---------------- | ---------- |
| admin    | admin.test@pclmas.dev    | AdminPass123!    | Test Admin |
| lecturer | lecturer.test@pclmas.dev | LecturerPass123! | Jane Doe   |
| student  | student1.test@pclmas.dev | StudentPass123!  | Alex Kim   |
| student  | student2.test@pclmas.dev | StudentPass123!  | Sam Rivera |
| student  | student3.test@pclmas.dev | StudentPass123!  | Priya Nair |

## Notes

- Admin has no public registration route — seeded directly into MongoDB via the script above.
- Re-running the script for an email that already exists is a no-op (it logs the existing role and exits).
- To add more: `node scripts/seedUser.js <admin|lecturer|student> <email> <password> [firstName] [lastName]`
