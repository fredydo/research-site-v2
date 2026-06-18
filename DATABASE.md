# Database Schema — GITA Research Site

PostgreSQL 16. This document describes the current, fully migrated schema. All legacy pre-migration tables (`user`, `students`, `publications_user_user`, `projects_user_user`) have been removed — the unified `people` model below is now the only system.

---

## Tables

### `people`
The unified table for all professors, students, alumni, and members.

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `id` | integer | NO | Primary key |
| `fullName` | varchar | NO | |
| `email` | varchar | YES | Nullable — students without an institutional email can omit it |
| `password` | varchar | YES | bcrypt hash, rounds=6 (some early records used rounds=10). NULL = no login access |
| `admin` | boolean | NO | Controls access to `/dashboard` and all admin actions |
| `isPublic` | boolean | NO | Whether the profile is visible publicly |
| `biography` | text | YES | |
| `profilePictureUrl` | varchar | YES | |
| `googleScholarUrl` | varchar | YES | |
| `cvlacUrl` | varchar | YES | |
| `researchInterests` | text | YES | Free text |
| `researchLine` | varchar | NO | **Primary/default research line.** Standard values: `Pattern Analysis And Signal Processing`, `Communication's Systems Modeling`, `Optical Communications` |
| `yearInit` / `yearEnd` | varchar | YES | Format `YYYY-MM-DD`. `yearEnd` NULL/blank = still active |
| `active` | boolean | NO | |
| `supervisorId` | integer | YES | Self-referencing FK → `people.id`. Supervising professor for a student |
| `created` / `updated` | varchar | NO/YES | ISO timestamp strings |

`researchLine` is the single primary value used as the default/display line. Multi-line membership (a person active in more than one line) is tracked separately in `people_research_lines` — when populated for a person, the UI treats that as the source of truth for filtering and falls back to `researchLine` only if empty.

---

### `people_roles`
Junction table — a person can have multiple roles simultaneously (e.g., a former PhD student who is now also a professor).

| Column | Type | Notes |
|---|---|---|
| `peopleId` | integer | FK → `people.id` |
| `role` | varchar | One of: `professor`, `phd`, `master`, `undergraduate`, `alumni`, `member` |

Composite primary key `(peopleId, role)`.

**Role meanings:**
- `professor` — appears in the Professors tab on the People page
- `phd` / `master` / `undergraduate` / `alumni` — student categories, grouped on profile pages and the People page
- `member` — general group member with no academic/student classification (e.g., lab staff, admin); has login access but isn't shown as a professor

---

### `people_research_lines`
Junction table — explicit multi-research-line membership, independent of what a person has published.

| Column | Type | Notes |
|---|---|---|
| `peopleId` | integer | FK → `people.id` (`ON DELETE CASCADE`) |
| `researchLine` | text | Same standard values as `people.researchLine` |

Composite primary key `(peopleId, researchLine)`. Editable via multi-select pills in both the main People page edit modal and the profile page edit modal.

---

### `publications`
| Column | Type | Nullable | Notes |
|---|---|---|---|
| `id` | integer | NO | |
| `type` | varchar | NO | **Standard values only:** `JOURNAL ARTICLES`, `CONFERENCE ARTICLES`, `BOOK CHAPTERS & LECTURE NOTES`, `BOOKS` |
| `paperUrl` | varchar | YES | Link to PDF |
| `year` | varchar | YES | Stored as 4-digit year string (e.g. `"2024"`) |
| `citation` | varchar | NO | Full formatted citation text |
| `researchLine` | varchar | NO | Standard values, Title Case |
| `bibtexCitation` | varchar | YES | Raw BibTeX block |
| `doi` | varchar | YES | DOI without the `https://doi.org/` prefix |
| `created` / `updated` | varchar | NO/YES | |

### `publications_people`
Junction table linking publications to their authors.

| Column | Type |
|---|---|
| `publicationsId` | integer, FK → `publications.id` |
| `peopleId` | integer, FK → `people.id` |

---

### `projects`
| Column | Type | Nullable | Notes |
|---|---|---|---|
| `id` | integer | NO | |
| `title` | text | NO | |
| `description` | text | NO | |
| `dateInit` / `dateEnd` | varchar | YES | Format `YYYY-MM-DD`. `dateEnd` NULL = ongoing/active project |
| `budget` | integer | YES | |
| `fileUrl` | varchar | YES | |
| `codeId` | varchar | YES | Internal project code (grant/contract number) |
| `fundingAgency` | varchar | YES | |
| `researchLine` | varchar | NO | |
| `created` / `updated` | varchar | NO/YES | |

**Active vs. Completed filter logic:** a project is "active" if `dateEnd IS NULL OR dateEnd >= today`.

### `projects_people`
Junction table linking projects to their team members.

| Column | Type |
|---|---|
| `projectsId` | integer, FK → `projects.id` |
| `peopleId` | integer, FK → `people.id` |

---

### `news`
| Column | Type | Notes |
|---|---|---|
| `id` | integer | |
| `title` / `description` | text | |
| `pictureUrl` / `documentUrl` | varchar | |
| `userId` | integer | No longer has a FK constraint (the old `user` table it referenced was dropped). Table is currently empty; if news authorship is added back, point this at `people.id` |
| `created` / `updated` | varchar | |

---

### `lectures`
| Column | Type | Notes |
|---|---|---|
| `id` | integer | |
| `title` / `description` | varchar/text | |
| `professor` | varchar | Free-text name, not a FK |
| `semester` | varchar | |
| `undergrad` | boolean | |
| `file_url` / `link_url` | varchar | |
| `created_at` | timestamptz | |

---

### `contacts`
Contact-form submissions. No SMTP available (university firewall blocks it), so this table is the only record of inbound messages — handled via the dashboard inbox instead of email.

| Column | Type | Notes |
|---|---|---|
| `id` | integer | |
| `name` / `email` / `subject` / `message` | varchar/text | |
| `read` | boolean | Dashboard inbox read/unread flag |
| `created` | varchar | |

---

### `password_requests`
Password-reset requests. No SMTP — admin manually resets the password via the dashboard inbox instead of emailing a reset link.

| Column | Type | Notes |
|---|---|---|
| `id` | integer | |
| `name` / `email` | varchar | |
| `read` | boolean | |
| `created` | varchar | |

---

### `migrations`
Standard migration-tracking table (timestamp + name), not application data.

---

## Standard Reference Values

**Research lines** (use exactly, Title Case):
- `Pattern Analysis And Signal Processing`
- `Communication's Systems Modeling`
- `Optical Communications`

**People roles** (`people_roles.role`):
- `professor`, `phd`, `master`, `undergraduate`, `alumni`, `member`

**Publication types** (`publications.type`):
- `JOURNAL ARTICLES`, `CONFERENCE ARTICLES`, `BOOK CHAPTERS & LECTURE NOTES`, `BOOKS`

**Default password for new accounts:** `gita12345` (bcrypt, rounds=6)

---