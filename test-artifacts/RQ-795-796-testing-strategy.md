# Testing Strategy — RQ-795 & RQ-796: Add Book Form (Book Store Application)

**Source requirements:** Spira RQ-795, RQ-796, Project "Rex Jones II" (ProjectId 24)
**RQ-795:** Add Book Form Validation & Required Fields | Status: In Progress | Importance: 2 - High | Type: User Story
**RQ-796:** Successful Catalog Entry Creation | Status: In Progress | Importance: 4 - Low | Type: User Story
**Target under test:** https://ui.rexjones2.com/add-book (Book Store Application section, reached via Homepage → Add Book after login)

## Requirements as written

> **RQ-795 User Story:** As a Book Store Administrator, I want the system to enforce data integrity on the "Add Book" form so that incomplete or corrupt records cannot be submitted to the catalog.
>
> **Acceptance Criteria:**
> 1. **Mandatory Text Fields:** If the form is submitted while the ISBN, Title, Sub Title, Author, Publisher, Description, or Website fields are empty, individual validation text stating "[Field Name] is a required field" must dynamically render in red beneath each empty text box.
> 2. **Submission Block:** The "Submit" button must not trigger a backend API request if any required text fields fail validation rules.

> **RQ-796 User Story:** As an Inventory Manager, I want to successfully save fully completed book entries so that they are immediately available for system searching.
>
> **Acceptance Criteria:**
> 1. **Record Persistence:** When all nine fields (ISBN through Website) contain structurally valid information matching the field rules, clicking "Submit" must commit the book to the system catalog.
> 2. **State Reset/Redirect:** Upon successful catalog insertion, the system should clear the form states or provide an immediate success confirmation state.

## What the live DOM actually contains

Crawled and interacted with the live `/add-book` page directly (not just read statically), including a full empty submit, a fully-valid submit, and boundary probes.

| Field | HTML control | Marked required per RQ-795 | Enforced at submit (JS validation) |
|---|---|---|---|
| ISBN | `textbox` | Yes | Yes — "ISBN is a required field" |
| Title | `textbox` (exact-match needed; "Sub Title" also matches a loose "Title" query) | Yes | Yes — "Title is a required field" |
| Sub Title | `textbox` | Yes | Yes — "Sub Title is a required field" |
| Author | `textbox` | Yes | Yes — "Author is a required field" |
| Publisher | `textbox` (has placeholder `"Publisher "`) | Yes | Yes — "Publisher is a required field" |
| Description | `textbox` | Yes | Yes — "Description is a required field" |
| Website | `textbox` | Yes | Yes — "Website is a required field" |
| Pages | `spinbutton` | **Not named in RQ-795** | Yes, but with a *different* message — "Pages must be a number" (fires on blank, not just non-numeric) |
| Publish Date | plain text `textbox` (no date-picker widget attaches) | **Not named in RQ-795** | Yes, but with a *different* message — "Publish Date must be a date" |

On empty submit, exactly the 7 named fields render "is a required field" text and **no** `POST /api/books` request is fired — AC1 and AC2 both hold as written.

On a fully-valid submit (all 9 fields populated, valid values), the app fires `POST https://api.rexjones2.com/api/books`. When that call succeeds, the app shows a native browser `alert("Success")` dialog and clears all 7 text-field values back to empty on dismissal — confirming AC2's "clear the form states" behavior. The Submit button also switches to a "Please wait..." label that in this environment never reverts (see Environment Note below).

---

## Environment Note — real backend calls are blocked in this sandbox

Every direct call to `https://api.rexjones2.com/api/books` (GET *and* POST) fails in this environment with `net::ERR_FAILED`. The browser's console shows a CORS preflight rejection whose `Access-Control-Allow-Origin` response header value is `https://bitdefender.com` — a strong signature of a local HTTPS-inspecting security proxy (antivirus network-scan feature) intercepting and rewriting the response, not a server-side defect. Because of this, **the real success path for RQ-796 cannot be observed end-to-end on this machine.**

To verify the client-side contract for RQ-796 without depending on the live backend, the "successful submission" test mocks `POST **/api/books` with `playwright-cli route` to return a `201`, then asserts the resulting client behavior (the `alert("Success")` dialog and form-field reset) — this is documented in the test itself with a comment explaining why the route is mocked. If a future run in an unaffected network environment shows different behavior from the live API, the mock and this note should be revisited.

---

## 1. Requirement Gaps & Missing Business Logic (for Product Owner / BA)

1. **RQ-795 only names 7 of the form's 9 fields.** Pages and Publish Date are also validated on submit (blocking the same way the 7 named fields do), but with different message text ("must be a number" / "must be a date") that RQ-795 never specifies. There is no documented intent for these two fields' validation copy or behavior.
2. **Required-field validation does not trim whitespace.** Verified live: filling all 7 "required" text fields with `"   "` (three spaces) clears every "is a required field" message and allows the form to proceed to a real `POST /api/books` call. A record consisting entirely of blank-looking text can reach the catalog. RQ-795 AC1 promises data integrity but the implementation only checks for an empty string, not blank/whitespace content.
3. **No format validation is documented or observed for ISBN or Website.** RQ-795 requires only presence, not shape — nothing prevents a non-ISBN string in the ISBN field or a non-URL string in Website from being submitted as "structurally valid" per RQ-796 AC1, yet RQ-796 says fields must contain "structurally valid information matching the field rules" without ever stating what those rules are.
4. **RQ-796 AC2 ("clear the form states or provide an immediate success confirmation state") is ambiguous about which — the app does both** (a blocking native `alert()` plus a full field reset). Whether the native browser alert (as opposed to an in-app toast/modal consistent with the rest of the app's UI, e.g. the Practice Form's dialog) is the intended long-term UX is not stated.
5. **Post-success loading state does not resolve.** After a successful (mocked) submission, the Submit button switches to "Please wait..." and never reverts to "Submit" within observed wait time. Whether this is masked by the same backend connectivity issue noted above, or an independent defect in the app's success-handling code, is undetermined from this environment and should be confirmed against a live, unblocked backend.
6. **No duplicate-submission or idempotency rule is defined** for RQ-796 — nothing addresses whether the same ISBN can be added to the catalog more than once.

## 2. Clarifying Questions for the Product Team

1. Should required-field validation reject whitespace-only input (trim before checking), given the current implementation treats `"   "` as a valid, non-empty value for all 7 required text fields?
2. What are the "field rules" referenced in RQ-796 AC1 for structural validity — is ISBN expected to match an ISBN-10/13 checksum format, and is Website expected to be a well-formed URL?
3. Should Pages and Publish Date be formally added to RQ-795's acceptance criteria, since they are already enforced as required by the app today?
4. Is the native browser `alert("Success")` the intended confirmation UX for RQ-796, or should this be replaced with an in-app confirmation consistent with the rest of the site (e.g., a modal, as used on the Practice Form)?
5. Is the Submit button expected to return to its normal "Submit" label after a successful save, and if the "Please wait..." state never clearing is a live defect independent of this sandbox's network restrictions, should that be filed separately?

## 3. Additional Test Coverage — Prioritized Regression Structure

### P0 — Critical Path (blocks release if broken)
| ID | Coverage |
|---|---|
| P0-01 | Submitting the Add Book form with all fields empty renders "is a required field" text for all 7 named fields (ISBN, Title, Sub Title, Author, Publisher, Description, Website) |
| P0-02 | Submitting the Add Book form with all required fields empty does not fire a `POST /api/books` request |
| P0-03 | Submitting a fully valid, completed form (mocked backend success) shows the native "Success" confirmation and the 7 text fields are cleared |

### P1 — Functional Variations
| ID | Coverage |
|---|---|
| P1-01 | Leaving only a subset of required fields empty (e.g., Sub Title and Website) shows validation text only for the empty ones, not the filled ones |
| P1-02 | Pages and Publish Date left blank are individually blocked with "Pages must be a number" / "Publish Date must be a date", independent of the 7 named-field validation |

### P2 — Edge Cases / Negative Paths
| ID | Coverage |
|---|---|
| P2-01 | [Validation gap] Filling all 7 required text fields with whitespace-only values (`"   "`) clears all "is a required field" messages and allows the form to proceed to submission — documents the current validation gap |
