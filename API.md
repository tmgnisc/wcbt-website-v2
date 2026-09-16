# Backend API contract (Django)

What a Django + Django REST Framework backend has to expose for this portal to run on real
data instead of the seeded mock layer. Every shape below is taken from the TypeScript types in
`src/types`, so a response that matches this document needs no changes in the components.

- [Wiring the frontend up](#wiring-the-frontend-up)
- [Conventions](#conventions)
- [Endpoint summary](#endpoint-summary)
- [Auth](#auth)
- [Notifications](#notifications)
- [Staff](#staff)
- [Admissions](#admissions)
- [Programs](#programs)
- [Settings](#settings)
- [File uploads](#file-uploads)
- [Dashboard](#dashboard)
- [Permissions](#permissions)
- [Enum values](#enum-values)
- [Django model sketch](#django-model-sketch)
- [Frontend changes checklist](#frontend-changes-checklist)

## Wiring the frontend up

All data access already funnels through one transport function, so the swap is a single file.
`src/api/client.ts` currently resolves seed arrays after a delay:

```ts
export function request<T>(payload: T, latency = LATENCY_MS): Promise<T> { /* mock */ }
```

Replace it with an HTTP client of the same shape, and the module services in `src/api/*.ts`
become thin URL definitions:

```ts
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail ?? 'Something went wrong. Please try again.');
  }

  return response.status === 204 ? (undefined as T) : response.json();
}
```

The UI surfaces `error.message` directly (login errors, store `error` state), so the `detail`
string in an error body is user-facing copy.

## Conventions

**Casing.** The frontend uses camelCase throughout. Keep Django models snake_case and install
[`djangorestframework-camel-case`](https://github.com/vbabiy/djangorestframework-camel-case), so
`full_name` is serialised as `fullName`:

```python
REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": ("djangorestframework_camel_case.render.CamelCaseJSONRenderer",),
    "DEFAULT_PARSER_CLASSES": ("djangorestframework_camel_case.parser.CamelCaseJSONParser",),
}
```

**Identifiers.** Every `id` is an opaque string; the UI never parses one. UUID primary keys
serialise correctly as-is. `staffId` (`WCBT-S-0012`) and `applicationId` (`WCBT-2026-0101`) are
separate human-readable codes the server should allocate — the frontend's `nextStaffId()` and
`nextApplicationId()` helpers are placeholders that must not survive the migration, because two
admins creating records at once would collide.

**Dates.** Calendar fields are `YYYY-MM-DD` strings bound straight to `<input type="date">`:
`publishDate`, `expiryDate`, `appliedDate`, `testDate`, `dateOfBirth`, `joiningDate`. Everything
else (`createdAt`, `updatedAt`, `uploadedAt`, `lastLogin`, activity `timestamp`) is ISO-8601 with
a timezone, e.g. `2026-09-16T04:30:00Z`.

**Enums.** Status strings are compared literally in `StatusBadge`, filters and stage steppers.
They must match the [enum tables](#enum-values) exactly, capitalisation and spaces included —
`Document Verification`, not `document_verification`.

**Nulls.** Optional fields may be omitted or `null`; `expiryDate`, `testDate`, `testScore`,
`reportingManagerId` and `recipient` are all nullable. Arrays are always present, never `null`
(`attachments`, `documents`, `audience`, `subjects`, `activity`).

**Errors.** Standard DRF shapes work:

```json
{ "detail": "Invalid email or password. Please try again." }
{ "code": ["A program with this code already exists."] }
```

Field errors keyed by field name let the forms map them back onto inputs; `ProgramPanel` already
does this for a duplicate `code`.

**Pagination.** `DataTable` searches, sorts and paginates client-side, so plain JSON arrays are
the simplest thing that works at campus scale (hundreds of rows). If you enable DRF pagination,
its `{count, next, previous, results}` envelope needs unwrapping in `src/api/*.ts` and the tables
need server-side paging — see the [checklist](#frontend-changes-checklist).

## Endpoint summary

| Method | Path | Purpose | Permission |
|---|---|---|---|
| POST | `/api/auth/login/` | Sign in, return user + tokens | public |
| POST | `/api/auth/refresh/` | Exchange refresh token | public |
| POST | `/api/auth/logout/` | Blacklist refresh token | authenticated |
| POST | `/api/auth/forgot-password/` | Send reset link | public |
| GET | `/api/auth/me/` | Re-validate a stored session | authenticated |
| GET | `/api/notifications/` | List notices | `notifications:view` |
| POST | `/api/notifications/` | Create notice | `notifications:add` |
| GET/PATCH/DELETE | `/api/notifications/{id}/` | Read, edit, delete | `notifications:view/edit/delete` |
| POST | `/api/notifications/{id}/publish/` | Toggle Draft ⇄ Published | `notifications:edit` |
| POST | `/api/notifications/{id}/duplicate/` | Copy as draft | `notifications:add` |
| POST | `/api/notifications/{id}/read/` | Mark read | `notifications:view` |
| POST | `/api/notifications/read-all/` | Mark all read | `notifications:view` |
| POST | `/api/notifications/bulk-archive/` | Archive many | `notifications:edit` |
| POST | `/api/notifications/bulk-delete/` | Delete many | `notifications:delete` |
| GET/POST | `/api/staff/` | List, create | `staff:view` / `staff:add` |
| GET/PATCH/DELETE | `/api/staff/{id}/` | Read, edit, delete | `staff:view/edit/delete` |
| GET/POST | `/api/admissions/` | List, create | `admissions:view` / `admissions:add` |
| GET/PATCH/DELETE | `/api/admissions/{id}/` | Read, edit, delete | `admissions:view/edit/delete` |
| POST | `/api/admissions/bulk-status/` | Move many to a stage | `admissions:edit` |
| POST | `/api/admissions/{id}/convert/` | Convert to student | `admissions:edit` |
| GET | `/api/admissions/trend/` | Monthly chart series | `dashboard:view` |
| GET/POST | `/api/programs/` | List, create | `programs:view` / `programs:add` |
| GET/PATCH/DELETE | `/api/programs/{id}/` | Read, edit, delete | `programs:view/edit/delete` |
| GET/PUT | `/api/settings/` | Read and save portal settings | `settings:view` / `settings:edit` |
| POST | `/api/files/` | Upload an attachment | authenticated |
| GET | `/api/dashboard/summary/` | Optional server-side aggregates | `dashboard:view` |

## Auth

`POST /api/auth/login/` — `identifier` is either the full email or the part before the `@`
(`principal@wcbt.edu.np` or `principal`), so the lookup is `email__iexact` OR
`username__iexact`. `remember` decides client-side storage only (localStorage vs sessionStorage)
and can be ignored server-side, though it's a reasonable signal for refresh-token lifetime.

```jsonc
// request
{ "identifier": "principal@wcbt.edu.np", "password": "•••••", "remember": true }

// 200
{
  "user": {
    "id": "stf-001",
    "name": "Dr. Rajendra Bhattarai",
    "email": "principal@wcbt.edu.np",
    "role": "super_admin",
    "avatarUrl": null,
    "department": "Administration"
  },
  "access": "<jwt>",
  "refresh": "<jwt>"
}

// 401 — message is shown verbatim above the form
{ "detail": "Invalid email or password. Please try again." }
```

The `user.id` is the signed-in person's **staff record id** (`stf-001`), which is what lets the
portal tie a session to a staff profile. Note that `settings.users[]` is a separate account list
with its own `usr-…` ids; if you keep both, decide which one is authoritative before migrating,
since having two identifiers for the same person is exactly the kind of thing that rots.

The login form warns about a soft lockout after three failed attempts; enforcing real throttling
(`django-axes` or DRF `ScopedRateThrottle`) is a server concern and should return **429** with a
`detail` explaining the wait.

`POST /api/auth/forgot-password/` takes `{ "email": "..." }` and must always answer **200**
`{ "sent": true }`, even for unknown addresses, so the form can't be used to enumerate accounts.

`GET /api/auth/me/` returns the same `user` object. The app currently trusts the copy in browser
storage on reload; once there's a real backend, `AuthContext` should verify against this endpoint
and clear the session on 401.

## Notifications

`message` is a limited HTML string from the rich text editor. Sanitise it server-side as well —
`src/lib/sanitize.ts` only protects the current render, not your database.

```jsonc
{
  "id": "ntf-001",
  "title": "BIT 6th semester final exam routine published",
  "message": "<p>The final examination routine has been published…</p>",
  "category": "Academic",
  "priority": "High",
  "audience": ["Students", "Staff"],
  "status": "Published",
  "publishDate": "2026-09-14",
  "expiryDate": "2026-10-05",
  "attachments": [
    {
      "id": "nfile-001",
      "name": "BIT-6th-Routine.pdf",
      "size": 184320,
      "mimeType": "application/pdf",
      "uploadedAt": "2026-09-14T04:00:00Z",
      "url": "https://media.wcbt.edu.np/notifications/BIT-6th-Routine.pdf"
    }
  ],
  "recipient": null,
  "read": false,
  "createdBy": "Manoj Ghimire",
  "createdAt": "2026-09-14T04:05:00Z",
  "updatedAt": "2026-09-14T04:05:00Z"
}
```

Writable on create/update: `title`, `message`, `category`, `priority`, `audience`, `status`,
`publishDate`, `expiryDate`, `attachments` (ids), `recipient`. The server owns `id`, `read`,
`createdBy` (from the authenticated user), `createdAt` and `updatedAt`.

`recipient` is set when a notice is raised from another module — `{ "type": "applicant", "id":
"adm-003", "name": "Bibek Tamang" }`, with `type` being `applicant` or `staff`.

`read` is per-user in the UI (the bell badge counts unread published notices). If several admins
share the portal, model it as a through-table of user × notification rather than a column, and
have `/read/` and `/read-all/` write rows for the caller.

Bulk endpoints take `{ "ids": ["ntf-001", "ntf-004"] }`. Archive sets `status` to `Archived`.

## Staff

```jsonc
{
  "id": "stf-002",
  "staffId": "WCBT-S-0002",
  "fullName": "Sushmita Karki",
  "gender": "Female",
  "dateOfBirth": "1986-07-22",
  "citizenshipNo": "07-01-86-00987",
  "address": "Birtamod-8, Jhapa",
  "phone": "+977 9842116677",
  "email": "sushmita.karki@wcbt.edu.np",
  "photoUrl": null,
  "department": "Information Technology",
  "designation": "Head of Department",
  "joiningDate": "2018-08-15",
  "employmentType": "Full-time",
  "reportingManagerId": "stf-001",
  "salary": 132000,
  "username": "sushmita.karki",
  "role": "admin",
  "loginEnabled": true,
  "status": "Active",
  "documents": [],
  "activity": [
    {
      "id": "act-004",
      "action": "Promoted to Head of Department",
      "actor": "Dr. Rajendra Bhattarai",
      "timestamp": "2021-01-10T05:30:00Z"
    }
  ]
}
```

Two things the server must own:

**`salary` is permission-gated.** Only `super_admin` holds `staff:viewSalary`. Omit the field (or
send `null`) for everyone else rather than relying on the UI to hide it — a serializer that drops
the key based on `request.user.role` is the right place.

**`activity` is an append-only audit trail.** The frontend writes entries optimistically today
(`'Profile created'`, `'Profile updated'`, `` `Status changed to ${status}` ``), but the backend
should generate them on write and return the list newest-first. Once it does, the `actor`
argument threaded through the staff store becomes redundant.

`reportingManagerId` references another staff `id` and is nullable for the principal.

## Admissions

```jsonc
{
  "id": "adm-001",
  "applicationId": "WCBT-2026-0101",
  "fullName": "Aayush Gautam",
  "dateOfBirth": "2007-04-11",
  "gender": "Male",
  "nationality": "Nepali",
  "address": "Birtamod-4, Jhapa",
  "phone": "+977 9812345670",
  "email": "aayush.gautam@gmail.com",
  "photoUrl": null,
  "previousInstitution": "Kanchanjunga Higher Secondary School",
  "board": "NEB",
  "gpa": "3.55",
  "subjects": ["Physics", "Mathematics", "Computer Science"],
  "program": "BIT",
  "intake": "Fall 2026",
  "scholarshipInterest": true,
  "documents": [
    {
      "id": "adoc-001",
      "name": "Transcript.pdf",
      "size": 264000,
      "mimeType": "application/pdf",
      "uploadedAt": "2026-08-02T05:00:00Z"
    }
  ],
  "testDate": "2026-09-05",
  "testScore": 78,
  "testStatus": "Passed",
  "interviewNotes": "Strong programming aptitude, clear communication.",
  "status": "Enrolled",
  "appliedDate": "2026-08-01",
  "internalNotes": "Eligible for 25% merit scholarship.",
  "convertedToStudent": false
}
```

`program` stores a **program code**, not an id — it joins to `Program.code` (see below). A
`ForeignKey(Program, to_field="code")` keeps referential integrity while serialising as the plain
string the UI expects.

`gpa` is a free-text string because applicants arrive with GPAs, percentages and divisions.
`testScore` is an integer out of 100 or `null`, and is only writable by roles holding
`admissions:test`.

`POST /api/admissions/bulk-status/` takes `{ "ids": [...], "status": "Test/Interview" }`.

`POST /api/admissions/{id}/convert/` flips `convertedToStudent` to `true`; the UI only allows it
once the application reaches `Enrolled`, and the server should enforce the same rule with a 400.

`GET /api/admissions/trend/` feeds the dashboard bar chart — last six months, oldest first:

```json
[
  { "month": "Apr", "applications": 18, "enrolled": 9 },
  { "month": "May", "applications": 26, "enrolled": 14 }
]
```

## Programs

```jsonc
{
  "id": "prg-001",
  "code": "BIT",
  "name": "Bachelor of Information Technology",
  "level": "Bachelor",
  "department": "Information Technology",
  "affiliation": "Kathmandu University",
  "durationYears": 4,
  "semesters": 8,
  "seats": 48,
  "feePerYear": 185000,
  "coordinator": "Sushmita Karki",
  "status": "Active",
  "description": "Software engineering, networking and data management…",
  "createdAt": "2019-04-14T04:00:00Z",
  "updatedAt": "2026-08-02T06:30:00Z"
}
```

`code` must be unique case-insensitively, since applications join on it. Return a field error the
panel can display:

```json
{ "code": ["BIT is already used by another program."] }
```

Deleting a program that applications still reference should be refused (`PROTECT`) or soft-handled
by flipping `status` to `Inactive` — the confirm dialog already nudges the admin toward the latter
and tells them how many applications are affected. Only `Active` programs appear in the admission
selects.

`feePerYear` is an integer in NPR (no paisa); the UI formats it with `Intl.NumberFormat`.

## Settings

One document-shaped resource today: `GET /api/settings/` and `PUT /api/settings/` with the whole
payload. It contains seven independent sections:

```jsonc
{
  "general": {
    "collegeName": "WhiteHouse College of Business & Technology",
    "tagline": "Learn. Innovate. Lead.",
    "campusName": "Birtamod Campus",
    "address": "Birtamod-4, Jhapa, Province 1, Nepal",
    "phone": "+977 23 543210",
    "email": "info@whitehouseeducation.edu.np",
    "website": "https://whitehouseeducation.edu.np",
    "logoUrl": "/logo.png",
    "academicSession": "2026 / 2027"
  },
  "users": [
    {
      "id": "usr-001",
      "name": "Dr. Rajendra Bhattarai",
      "email": "principal@wcbt.edu.np",
      "role": "super_admin",
      "status": "Active",
      "lastLogin": "2026-09-16T02:30:00Z"
    }
  ],
  "permissions": {
    "super_admin": { "notifications": { "view": true, "add": true, "edit": true, "delete": true } }
    // …one block per role × module
  },
  "catalog": {
    "departments": [{ "id": "dep-001", "name": "Information Technology" }],
    "designations": [{ "id": "des-001", "name": "Principal" }],
    "testTypes": [{ "id": "tst-001", "name": "Written Entrance", "description": "100 marks, 2 hours" }]
  },
  "notifications": {
    "defaultAudience": ["Students", "Staff"],
    "emailAlerts": true,
    "smsAlerts": false,
    "digestFrequency": "Daily"
  },
  "security": {
    "minPasswordLength": 8,
    "requireUppercase": true,
    "requireNumber": true,
    "requireSymbol": false,
    "sessionTimeout": 30,
    "twoFactorEnabled": false
  },
  "auditLog": [
    {
      "id": "aud-001",
      "user": "Anita Rai",
      "action": "Updated application status to Enrolled",
      "module": "Admissions",
      "timestamp": "2026-09-16T03:12:00Z",
      "ip": "10.14.2.31"
    }
  ]
}
```

`permissions` is keyed role → module → action, where modules are `notifications`, `staff`,
`admissions`, `programs`, `settings` and actions are `view`, `add`, `edit`, `delete`. If you make
this matrix authoritative server-side, `src/lib/permissions.ts` should be fed from it at login
instead of hard-coding the role map.

`auditLog` is read-only and written by the backend on every mutating request; `PUT` should ignore
whatever the client sends for it. Once it grows past a few hundred rows it wants its own paginated
endpoint (`GET /api/settings/audit-log/?page=2`) rather than riding along with settings.

Splitting this into `/api/settings/general/`, `/api/settings/catalog/` and so on is cleaner if the
sections get independent save buttons — the panels already patch section by section.

## File uploads

`FileRecord` is the shared attachment shape for notification attachments and staff/admission
documents:

```jsonc
{
  "id": "file-001",
  "name": "citizenship.pdf",
  "size": 284120,
  "mimeType": "application/pdf",
  "uploadedAt": "2026-09-14T04:05:00Z",
  "url": "https://media.wcbt.edu.np/documents/citizenship.pdf"
}
```

`POST /api/files/` as `multipart/form-data` with a `file` part, returning one record. Records are
then attached to a parent by id.

Note the current `FileDrop` component never uploads: it builds a record with
`URL.createObjectURL(file)`, which dies with the tab. Wiring this up means uploading on drop (or
on form submit) and storing the returned ids — the one place where "point the service at Django"
isn't enough on its own.

The UI hints at PDF or image up to 10 MB; enforce that server-side, and validate content type
rather than trusting `mimeType` from the client.

## Dashboard

Every dashboard figure is currently derived in the browser from the full lists: total staff,
enrolled count, new applications this month, pending draft notices, staff-by-department donut,
the merged activity feed and scheduled tests. That stays fine while the data set is small.

When lists grow past what you want to ship to the browser, add an aggregate endpoint:

```jsonc
{
  "totalStaff": 12,
  "totalStudents": 3,
  "newAdmissionsThisMonth": 5,
  "pendingNotifications": 2,
  "staffByDepartment": [{ "name": "Information Technology", "value": 4 }],
  "recentActivity": [
    {
      "id": "adm-003",
      "type": "admission",
      "text": "Bibek Tamang — BIT application at Test/Interview",
      "meta": "WCBT-2026-0103",
      "timestamp": "2026-08-10T09:00:00Z"
    }
  ],
  "upcomingTests": [
    { "id": "adm-003", "fullName": "Bibek Tamang", "program": "BIT", "testDate": "2026-09-22" }
  ]
}
```

## Permissions

`src/lib/permissions.ts` defines the vocabulary the `<Can permission="…">` guard uses. Mirror it
with a DRF permission class so the API can't be bypassed by calling it directly.

| Permission | super_admin | admin | staff |
|---|:--:|:--:|:--:|
| `dashboard:view` | ✅ | ✅ | ✅ |
| `notifications:view` | ✅ | ✅ | ✅ |
| `notifications:add` / `:edit` / `:delete` | ✅ | ✅ | — |
| `staff:view` | ✅ | ✅ | ✅ |
| `staff:add` / `:edit` | ✅ | ✅ | — |
| `staff:delete` | ✅ | — | — |
| `staff:viewSalary` | ✅ | — | — |
| `admissions:view` | ✅ | ✅ | ✅ |
| `admissions:add` / `:edit` / `:delete` / `:test` | ✅ | ✅ | — |
| `programs:view` | ✅ | ✅ | ✅ |
| `programs:add` / `:edit` | ✅ | ✅ | — |
| `programs:delete` | ✅ | — | — |
| `settings:view` / `:edit` | ✅ | ✅ | — |

```python
class HasPortalPermission(BasePermission):
    """Usage: permission_required = "programs:add" on the viewset."""

    def has_permission(self, request, view):
        required = getattr(view, "permission_required", None)
        if required is None:
            return request.user.is_authenticated
        return request.user.is_authenticated and required in ROLE_PERMISSIONS[request.user.role]
```

Routes marked admin-only in the router (`/staff/new`, `/staff/{id}/edit`, `/settings`) redirect
`staff` users client-side; the corresponding write endpoints must reject them with **403**
regardless.

## Enum values

Exact strings, as compared by the UI.

| Type | Values |
|---|---|
| Role | `super_admin`, `admin`, `staff` |
| Notification category | `General`, `Academic`, `Admission`, `Urgent` |
| Notification priority | `Normal`, `High`, `Urgent` |
| Notification audience | `All`, `Staff`, `Students`, `Public` |
| Notification status | `Draft`, `Published`, `Archived` |
| Staff status | `Active`, `Inactive`, `On Leave` |
| Employment type | `Full-time`, `Part-time`, `Visiting` |
| Gender | `Male`, `Female`, `Other` |
| Admission stage | `Applied`, `Document Verification`, `Test/Interview`, `Result`, `Enrolled`, `Rejected` |
| Test status | `Not Scheduled`, `Scheduled`, `Passed`, `Failed` |
| Program level | `Bachelor`, `Master`, `Diploma`, `Certificate` |
| Program status | `Active`, `Inactive` |
| Digest frequency | `Instant`, `Daily`, `Weekly` |
| Session timeout | `15`, `30`, `60` (integer minutes) |

## Django model sketch

Enough to show the field mapping; trim to taste.

```python
class Program(models.Model):
    LEVELS = [(v, v) for v in ("Bachelor", "Master", "Diploma", "Certificate")]
    STATUSES = [(v, v) for v in ("Active", "Inactive")]

    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    code = models.CharField(max_length=16, unique=True)
    name = models.CharField(max_length=120)
    level = models.CharField(max_length=16, choices=LEVELS)
    department = models.ForeignKey("Department", on_delete=models.PROTECT)
    affiliation = models.CharField(max_length=120)
    duration_years = models.PositiveSmallIntegerField()
    semesters = models.PositiveSmallIntegerField()
    seats = models.PositiveSmallIntegerField()
    fee_per_year = models.PositiveIntegerField()
    coordinator = models.CharField(max_length=120)
    status = models.CharField(max_length=16, choices=STATUSES, default="Active")
    description = models.CharField(max_length=240, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(Lower("code"), name="program_code_ci_unique"),
        ]


class Admission(models.Model):
    STAGES = [(v, v) for v in (
        "Applied", "Document Verification", "Test/Interview", "Result", "Enrolled", "Rejected",
    )]

    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    application_id = models.CharField(max_length=32, unique=True)  # WCBT-2026-0101
    full_name = models.CharField(max_length=120)
    program = models.ForeignKey(Program, to_field="code", db_column="program_code",
                                on_delete=models.PROTECT, related_name="applications")
    intake = models.CharField(max_length=32)
    gpa = models.CharField(max_length=16)          # "3.45", "78%", "First division"
    subjects = models.JSONField(default=list)
    test_score = models.PositiveSmallIntegerField(null=True, blank=True)
    status = models.CharField(max_length=32, choices=STAGES, default="Applied")
    applied_date = models.DateField()
    converted_to_student = models.BooleanField(default=False)
    documents = models.ManyToManyField("FileRecord", blank=True)
    # …personal and academic fields


class StaffMember(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    staff_id = models.CharField(max_length=16, unique=True)   # WCBT-S-0012
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    reporting_manager = models.ForeignKey("self", null=True, blank=True, on_delete=models.SET_NULL)
    salary = models.PositiveIntegerField()
    # …contact and employment fields


class StaffActivity(models.Model):
    staff = models.ForeignKey(StaffMember, related_name="activity", on_delete=models.CASCADE)
    action = models.CharField(max_length=160)
    actor = models.CharField(max_length=120)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]
```

`application_id` and `staff_id` want a sequence or `select_for_update` counter rather than
`count() + 1`, which races under concurrent creates.

## Frontend changes checklist

What has to change on this side once the endpoints exist:

1. **`src/api/client.ts`** — replace the mock `request()` with the fetch wrapper above; add
   `VITE_API_URL` to `.env`.
2. **`src/api/*.ts`** — each function becomes a URL and method. Signatures stay the same, so the
   stores don't move.
3. **Optimistic creates** — `create()` in the notifications, staff, admissions and programs stores
   mints a local id with `createId()` and inserts the row before the request resolves. Replace the
   temporary row with the server's response so ids match the backend.
4. **Generated codes** — drop `nextStaffId()` and `nextApplicationId()` and read `staffId` /
   `applicationId` off the created record.
5. **`src/context/AuthContext.tsx`** — store the JWT pair, verify the session against
   `/api/auth/me/` on load, refresh on 401, and clear storage on logout.
6. **`src/components/ui/FileDrop.tsx`** — upload to `/api/files/` instead of creating object URLs.
7. **Staff activity** — stop writing activity entries client-side once the backend returns them.
8. **Only if you paginate server-side** — unwrap the DRF envelope in the services and lift
   `DataTable`'s search, sort and page state into query parameters.
9. **Delete `src/data/*.ts`** — the seed files are only referenced by the mock services, so they go
   once the last service is switched over.
