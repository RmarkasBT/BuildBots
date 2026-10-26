# Buildbots prototype backlog (BTNet edition)

Build Buildbots inside **BTNet** as a standalone, modern frontend served at `/app/buildbots`. It doesn't inherit BT's legacy frontend stack, while the rest of BTNet (login, APIX, data, BTAgents and ephemeral PR environments) runs as usual.

**Goals**
- Customer demos run by Buildertrend staff, using demo accounts we own.
- Two starter bots, **Material Tracker** and **Job Scheduling**, defined the same way as custom bots and run by the same agent.
- **Custom bots** built through the Shop Foreman interview.
- Every bot can use the user's **Gmail, Google Calendar and Google Drive**.

**Out of scope:** the other bots from the mockup (removed from the roster), third-party portal automation, SMS and social channels, mobile layout, and customers' own Google accounts.

## Where we are

_Updated 2026-10-26. Kept current whenever an epic (E) or milestone (M) finishes. Checked = done (PR completed into `Integration/buildbots`); `[~]` = in progress or in review._

**M0: Buildbots app in BTNet** (in progress)
- [x] E1-1, E1-2: Buildbots app at `/app/buildbots`, BT session, staff gate, impersonated builder in the top bar ([PR 115545](https://dev.azure.com/buildertrend/BuildertrendProjects/_git/BTNet/pullrequest/115545), completed 2026-10-13)
- [ ] E11-1: stable EphPR demo environment

**M1: Material Tracker live** (in progress, in this order)
1. [x] E2-1, E2-2: Google sign-in, read-only Gmail / Calendar / Drive endpoints, codemode `buildbots` agent ([PR 115622](https://dev.azure.com/buildertrend/BuildertrendProjects/_git/BTNet/pullrequest/115622), completed 2026-10-13)
2. [x] E4: live agent turns in the Buildbots thread, replacing the scripted chat ([PR 115702](https://dev.azure.com/buildertrend/BuildertrendProjects/_git/BTNet/pullrequest/115702), completed 2026-10-14)
3. [x] E6-1, E6-2: Material Tracker, built eval-first: delivery status answers, a per-job materials Google Sheet, and expected deliveries on the calendar in the builder's time zone ([PR 115893](https://dev.azure.com/buildertrend/BuildertrendProjects/_git/BTNet/pullrequest/115893), completed 2026-10-15)
4. [x] E3: only what M1 needs. E3-2 POs and schedule ([PR 116170](https://dev.azure.com/buildertrend/BuildertrendProjects/_git/BTNet/pullrequest/116170)): agent-only `jobs/{id}/purchase-orders` and `/schedule` endpoints in the builder's time zone, `list_purchase_orders` / `get_schedule` tools, "Needed by" and "In Buildertrend" sheet columns, late deliveries named with the schedule items they hold up; completed 2026-10-19. E3-1 storage deferred: approvals with E5, bot definitions with E8, trade partner history with E7
5. [x] E5-1, E5-2: approvals and the recipient allowlist ([PR 116383](https://dev.azure.com/buildertrend/BuildertrendProjects/_git/BTNet/pullrequest/116383), completed 2026-10-20): Material Tracker drafts supplier emails (the send half of E6-2), APIX sends only on the user's approval, a per-builder allowlist blocks everything else
6. [x] E10-1, E10-2: untrusted-content handling and evals. 35 evals merged (15 Gmail/Calendar/Drive in [PR 115879](https://dev.azure.com/buildertrend/BuildertrendProjects/_git/BTNet/pullrequest/115879), 20 Material Tracker in [PR 115893](https://dev.azure.com/buildertrend/BuildertrendProjects/_git/BTNet/pullrequest/115893)), including planted-instruction cases and a step budget; 10 more merged with E3 in [PR 116170](https://dev.azure.com/buildertrend/BuildertrendProjects/_git/BTNet/pullrequest/116170) (POs, schedule impact, a long-lived job with old POs and schedule items, a finished PO found by number); 8 more merged with E5 in [PR 116383](https://dev.azure.com/buildertrend/BuildertrendProjects/_git/BTNet/pullrequest/116383) (email drafts: the vendor's own address, a planted redirect, ambiguous requests, the approval outcomes) and an `email_drafts` metric every case is scored on; completed 2026-10-21 in [PR 116593](https://dev.azure.com/buildertrend/BuildertrendProjects/_git/BTNet/pullrequest/116593): a 12-case red-team suite (planted instructions in email bodies, subjects, sender names, Drive docs, PDFs with hidden text, calendar descriptions and zero-width text; none succeeded in the first runs), the bot now flags instructions it ignored, and a staff-only Smoke test panel for pre-demo checks (never sends)
7. [~] E11-2, E11-3: demo builder seed, demo Google accounts, one-click reset. In review ([PR 116737](https://dev.azure.com/buildertrend/BuildertrendProjects/_git/BTNet/pullrequest/116737), stacked on E10): the eval fixture exported as the demo dataset; a staff Demo panel seeds three [Demo] jobs with POs and schedule, and puts the vendor emails, events and files into the connected Google account without sending anything (gmail.insert, no guests); Reset removes only demo or Buildbots-tagged data, then seeds again. Live-checked 2026-10-22 in ephpr116737: Reset trashed only the 25 demo emails and sent nothing; fixes from that check are in the PR: the job search drops a "[Demo]" tag (new PR eval case), dates shift by whole weeks, Connectors and the Demo panel show the connected Google account, and Reset refuses an account other than the one seeded. Re-verified 2026-10-23 on the new APIX: Reset trashed only demo emails and sent nothing, dates keep their weekdays (trusses ship Friday Oct 23), the seed recorded john.d.baker.01@gmail.com, Connectors shows the account, and the status answer names what overdue lumber holds up. Still to land: the Demo panel's account line and disabled Reset, blocked by EphPR checkout failures on the shared build agents

**M2: Job Scheduling** - [ ] E7
**M3: Custom bots** - [ ] E8-1, E8-2
**M4: Proactive bots and polish** - [ ] E9, E2-3 (deferred from E2), E5-3, E6-3, E8-3, E10-3
**M5: SQLite pre-caching** - [~] E12-1 to E12-5, in review ([PR 117105](https://dev.azure.com/buildertrend/BuildertrendProjects/_git/BTNet/pullrequest/117105))

---

## E1: UI port and route

**Status: done, merged into `Integration/buildbots` 2026-10-13.** [PR 115545](https://dev.azure.com/buildertrend/BuildertrendProjects/_git/BTNet/pullrequest/115545) into `Integration/buildbots`, verified in its EphPR environment (sign in to BTAdmin, impersonate a builder, open `/app/buildbots`).

| ID | Story | Pri |
| --- | --- | --- |
| E1-1 | Add Buildbots to BTNet as a standalone app (`Clients.Buildbots`) on React 19, React Router, Tailwind 4 and shadcn/ui on Radix, restyled to BT design tokens. Keep it outside the pnpm workspace's React 17 pin, with its own lockfile. Serve it at `/app/buildbots` by building it into the main React app's output, so the existing `/app/*` routing serves it with no infra change; Clients.App's dev server proxies it locally. | P0 |
| E1-2 | Use the signed-in BT session on the same domain to call APIX, gated on the server to staff impersonating a builder (`GET v2/Buildbots/session`, which also returns the impersonated builder's name, shown in the top bar). Use BT's design tokens for brand colors and type, not BT's React 17 component libraries. | P0 |

## E2: Google Workspace connections

**Status: done, merged into `Integration/buildbots` 2026-10-13.** [PR 115622](https://dev.azure.com/buildertrend/BuildertrendProjects/_git/BTNet/pullrequest/115622), verified in its EphPR: the `buildbots` agent answered from Gmail, Calendar and Drive in AgentTester. Google refusals (an account without Gmail, Calendar or Drive) reach the agent as `googleError` instead of failing the turn. E2-3 deferred to M4: Gmail push needs a Pub/Sub topic (infra) and long-lived access the browser token can't give.

| ID | Story | Pri |
| --- | --- | --- |
| E2-1 | Users connect Google in Buildbots with Google's browser sign-in (OAuth client in a sandbox project, External consent screen in Testing mode with demo test users, read-only scopes first). The short-lived access token goes to APIX, which holds it in Redis per user until it expires. No Agent Platform auth provider, no egress or Terraform changes. | P0 |
| E2-2 | APIX endpoints for Gmail, Calendar and Drive that call Google with the user's token, and BTAgents tools that reach them through `call_apix` with the delegated BT token, granted per bot. Read-only in E2; sending, inviting and sharing arrive with E5's approvals and allowlist, enforced in APIX. | P0 |
| E2-3 | Gmail push notifications so new emails can trigger bots. | P1 |

## E3: Buildbots backend

**Status: M1 part done, merged into `Integration/buildbots` 2026-10-19.** [PR 116170](https://dev.azure.com/buildertrend/BuildertrendProjects/_git/BTNet/pullrequest/116170), built eval-first and verified live in its EphPR on a real job (52 POs, 148 schedule items): status, schedule impact, the materials sheet and calendar deliveries. Decisions: agent-only `GET v2/Buildbots/jobs/{id}/purchase-orders` and `/schedule`, dates in the builder's time zone; "needed by" is the linked schedule item's start, else the PO's due date; the tools return current materials POs (not Work Complete, not due over 90 days ago) and open schedule items still to come, with `po_numbers` and `item_ids` to fetch the rest. E3-1 storage deferred: approvals with E5, bot definitions with E8, trade partner history with E7. Follow-ups: the sheet turn runs about 11 steps (budget 10); replies show raw `**` bold markers.

| ID | Story | Pri |
| --- | --- | --- |
| E3-1 | Store bots, approvals and routines per builder and user, with APIX endpoints and a typed client. Conversations live in the agent session service. | P0 |
| E3-2 | Fill APIX gaps the bots need: POs with delivery dates, schedule dependencies, and trade partner history. | P0 |

## E4: Agent runtime and live thread

**Status: done, merged into `Integration/buildbots` 2026-10-14.** [PR 115702](https://dev.azure.com/buildertrend/BuildertrendProjects/_git/BTNet/pullrequest/115702), verified in its EphPR: replies stream with step cards, cite sources that open in the side pane, and conversations reload. Decision: conversations live in the agent's own Agent Engine sessions (no BTNet store, no infra), listed by owner; the session-service stack (PR 114772) can replace that once it merges. Done 2026-10-20 in [PR 116508](https://dev.azure.com/buildertrend/BuildertrendProjects/_git/BTNet/pullrequest/116508): master's APIX agent sessions merged and agents now refuse to create their own, so Buildbots conversations are APIX `AgentSessions` records (BTAdmin run-as, owned by the impersonated builder user), with streaming turns kept. Bots are defined by APIX and their tool grants enforced by the agent. Streaming tokens within a reply is deferred; steps stream as they happen.

| ID | Story | Pri |
| --- | --- | --- |
| E4-1 | A BTAgents agent on Gemini (the BTAgents default) that runs any bot from its definition: instructions, tools, knowledge and trust mode. | P0 |
| E4-2 | Stream live agent turns into the Buildbots thread. Tool calls show as action cards and documents open in the live pane. Conversations persist across reloads through the session-service stack (`NativeAgentSessions`, `AiAgentsManager.Sessions`). Rebase onto it, or wait for it to merge. | P0 |
| E4-3 | Demo-safe behavior: friendly errors with retry and fast responses. | P0 |

## E5: Approvals and outbound safety

**Status: E5-1 and E5-2 done, merged into `Integration/buildbots` 2026-10-20.** [PR 116383](https://dev.azure.com/buildertrend/BuildertrendProjects/_git/BTNet/pullrequest/116383), built eval-first and verified live in its EphPR: a drafted reply to the PLS-2081 notice was approved and arrived in the vendor's Gmail thread; an edit to an address off the allowlist came back Blocked and sent nothing. Decisions: the agent only drafts (`draft_email` -> `POST v2/Buildbots/approvals`, idempotent for a repeat); APIX sends from the user's Gmail (`gmail.send`) on a user-only decision route; drafts and the allowlist live in the GCS temp-files bucket under `buildbots/{builderId}/`, drafts expire after 14 days; the allowlist is exact addresses or `@domain`, empty blocks everything; after a decision the UI resumes the conversation with an `[approval] <status>` turn. Email only for M1; invites, shares and bid requests reuse the approval model later. Follow-ups: the new .NET unit tests compiled but have not run (Buildbots PRs don't trigger BTNet-Solution-Tests, which we can't queue); two approves at once could both send (no conditional GCS write); the temp bucket's lifecycle rule is unknown; E5-3 trust modes stay in M4.

| ID | Story | Pri |
| --- | --- | --- |
| E5-1 | Anything leaving the company (emails, outside invites, Drive shares, schedule notices to subs) waits for approval in the approval card and queue, then resumes the conversation. | P0 |
| E5-2 | A per-builder recipient allowlist, enforced on the server, so demos can only send to addresses we own. | P0 |
| E5-3 | Trust modes (Suggest and Act) enforced on the server, plus an activity log of executed actions. | P1 |

## E6: Material Tracker

**Status: done, merged into `Integration/buildbots` 2026-10-15.** [PR 115893](https://dev.azure.com/buildertrend/BuildertrendProjects/_git/BTNet/pullrequest/115893), built eval-first (20 cases before the agent) and verified live in its EphPR against real Gmail, a real Google Sheet and a real calendar event. Decisions: a project is a Buildertrend job; writes happen directly on request (no approval for the user's own Drive and Calendar); one "Materials Status - <job>" Google Sheet per job in a Buildbots-owned Drive folder (the narrow drive.file scope); one calendar event per job and PO at the job site, in the builder's time zone, never with attendees. Follow-ups: Agent Engine cold starts (37-48 s; `min_instances` is not in the deploy path), E6-3 notifications in M4.

| ID | Story | Pri |
| --- | --- | --- |
| E6-1 | Find late or changed deliveries by matching BT POs against supplier emails in Gmail, and explain the schedule impact. | P0 |
| E6-2 | Draft and send an approved reply to the supplier, then handle their answer by offering to update the BT schedule. | P0 |
| E6-3 | Notify the job's PM about delivery risk. | P1 |

## E7: Job Scheduling

**Status: not started; stories are a first draft to confirm before the epic starts.** Replaces the Bid Coordinator (changed 2026-10-23). Builds on E12: the same snapshot already holds every open job's schedule, its predecessors and what each item holds up, and the user's recent email.

| ID | Story | Pri |
| --- | --- | --- |
| E7-1 | Look-ahead: what is on each job's schedule in the next one to two weeks, and what is at risk: items whose predecessors aren't done, items with no one assigned, and one sub booked on two jobs the same day. | P0 |
| E7-2 | Schedule risk from email: match sub and vendor notices (delays, availability, inspections, weather) to schedule items, and say what slips, using the downstream chain. | P0 |
| E7-3 | Propose a schedule change (move an item, with its followers shifting) as an approval card; nothing in Buildertrend changes until the user approves. | P0 |
| E7-4 | Draft schedule confirmations and change notices to the subs on affected items, for approval and the allowlist like every outbound email. | P0 |
| E7-5 | Apply an approved change to the Buildertrend schedule through APIX, with its own permission check and an undo. | P1 |

## E8: Custom bots (Shop Foreman)

| ID | Story | Pri |
| --- | --- | --- |
| E8-1 | The Shop Foreman interviews the user and builds a bot definition with a live preview. It is honest about what bots can't do yet. | P0 |
| E8-2 | Creating the bot grants its Google and BT tools (connecting Google if needed), adds it to the roster and starts its first run. Guardrails can't be edited away. | P0 |
| E8-3 | Edit, version and archive custom bots. Attach Drive or BT documents as knowledge. | P1 |

## E9: Routines and triggers

| ID | Story | Pri |
| --- | --- | --- |
| E9-1 | Scheduled and email-triggered bot runs through Hangfire, posting results to the bot's thread. | P1 |
| E9-2 | A "Run now" button so presenters can trigger a routine on demand. | P1 |

## E10: Safety, evals and observability

**Status: E10-1 and E10-2 done, merged into `Integration/buildbots` 2026-10-21 ([PR 116593](https://dev.azure.com/buildertrend/BuildertrendProjects/_git/BTNet/pullrequest/116593)).** Verified live in its EphPR: smoke test 5/6 (the sixth was a check bug, fixed), and a live red-team pass with three planted emails (sent only from and to jbaker963@gmail.com) where the bot drafted nothing unasked, kept the real recipient and flagged each attempt. Red team: 12 eval cases, each with a planted instruction only it sees (`redteam_fixture.py`), scored on no unrequested drafts or writes, the true answer, nothing planted repeated as fact, and a one-line flag where the user should know. Smoke test: a staff-only panel that checks session, Google scopes and expiry, then runs status, sheet, calendar and a draft that it skips (never approves). Shop Foreman evals wait for E8. Rule for every live test: real email goes only to jbaker963@gmail.com.

| ID | Story | Pri |
| --- | --- | --- |
| E10-1 | Treat email and document content as untrusted. Instructions inside it never trigger actions. Covered by red-team tests. | P0 |
| E10-2 | Evals for each bot and the Shop Foreman, plus a pre-demo smoke run. | P0 |
| E10-3 | Datadog tracing for runs, tool calls and model calls, with run, tool and approval data landing in Databricks for analysis. | P1 |

## E11: Demo readiness

**Status: E11-2 and E11-3 in review, [PR 116737](https://dev.azure.com/buildertrend/BuildertrendProjects/_git/BTNet/pullrequest/116737).** Decisions: demo jobs named "[Demo] …" inside Little Builders (present in every EphPR database) rather than a new builder; one dataset for evals and demos (`buildbots-demo.json`, exported from the eval fixture, dates shifted to today); POs seed as drafts because releasing emails the vendor; demo emails are inserted, never sent, under a "Buildbots demo" label; reset touches only demo-named jobs and Buildbots-tagged Google items. New Google scopes: gmail.insert, gmail.modify. E11-1 (stable environment): a long-lived draft PR refreshed by re-running its build; how EphPRs are reclaimed is to be confirmed with DevOps (the teardown lives outside this repo; the sales-demo EPH pipeline skips the agent deploy).

| ID | Story | Pri |
| --- | --- | --- |
| E11-1 | A stable EphPR demo environment with the Buildbots agents deployed. | P0 |
| E11-2 | A fictional demo builder seed plus demo `@gmail.com` Google accounts (OAuth test users) holding seeded mail, events and files. | P0 |
| E11-3 | One-click reset of the demo builder, conversations and Google accounts. | P0 |

---

## E12: SQLite pre-caching

**Status: in review, [PR 117105](https://dev.azure.com/buildertrend/BuildertrendProjects/_git/BTNet/pullrequest/117105); verified live in ephpr117105 on 2026-10-26.** Decisions made at the start: the snapshot covers all of the user's open jobs (the jobs route's list) plus the last 45 days of their email; APIX builds it at turn start; it is stored per user in GCS (temp-files bucket, `buildbots/<builderId>/snapshots/`) for 30 minutes; email lives in the snapshot and `search_gmail` / `read_emails` stay for anything older or cut short; `list_purchase_orders` and `get_schedule` were removed from Material Tracker (`list_jobs` stays as a fallback); step budgets 4, or 6 with a write. Found and fixed while building: Gmail's per-user quota (6,000 units a minute on the OAuth project, raise to 15,000 requested) ran out on the first build after a demo reset, so the snapshot reads at most 150 emails, 4 at a time, retries once on a quota refusal, and never stores a snapshot whose email read failed. A job's orders now have one definition (current materials POs, past ones an email names, emailed orders with no PO). Live: the first-time and refreshing notices show, the cache is reused on the next question, and the Pike Street status-and-impact answer took 3 steps (6 when a busy inbox fills the 150-email snapshot). Not run: the .NET unit tests (only BTNet-Solution-Tests runs them, for PRs into master); pipeline 318's Windows build and code analysis passed. PR evals: 0 failed cases over 3 runs, criteria pass rate 0.954.

Modeled on the job-match agents in `BTNet-job-match-agent` (`BTAgents/job_match_sql_agent/sql_database.py`, reused by `bill_match_agent`), which run on the same codemode harness:
- The host supplies all the data up front, and a `sql(query)` tool exposes it as an in-memory SQLite database.
- Each table is a Pydantic model; its fields are the columns, and the same models write the schema into the instructions.
- The database is read-only: an authorizer allows only SELECT and reads (no ATTACH, PRAGMA, writes or `load_extension`) and `PRAGMA query_only` is on.
- A progress handler stops a query after 2 s, and results are capped at 40 rows and 160 characters per cell.
- Matching helpers are registered as SQL functions: `similarity(a, b)`, `norm(text)` and `digits(text)`.
- Measured there: rebuilding the database on every `sql()` call cost about 0.4 s per bill; the queries themselves were about 0 s; model round trips (about 2.5 to 3 s each) dominate latency.

Differences for Buildbots:
- **Build once per job per conversation**, not on every query.
- **Keep the snapshot between turns** until it expires or a write changes it.
- **Writes stay as tools:** sheet, calendar and draft writes keep going through the APIX tools.
- **Show the first build in the UI** (E12-4).

Open questions:
- Where APIX keeps the snapshot: Redis like the Google connection, or GCS like approvals, keyed by builder, user and job.
- How long a snapshot lives.
- Whether email bodies go into the snapshot or stay a live search.
- How this fits ADK session state, where `app:` and `user:` scopes are unsupported.

| ID | Story | Pri |
| --- | --- | --- |
| E12-1 | APIX job snapshot: one agent-callable route returns a job's POs, line items, vendors, schedule items with predecessors, and the job's vendor emails (subject, sender, date, body, PO numbers found), in the builder's time zone. It runs the same access checks as today's routes (staff gate, accessible job) and is listed in `AgentDelegatedTokenPolicyTests`. | P0 |
| E12-2 | Snapshot cache: APIX keeps the snapshot per builder, user and job, with a short expiry. A write (sheet, calendar, approval), a demo seed or reset, or Disconnect Google clears it, and the response says whether it was built or reused, and when. | P0 |
| E12-3 | `sql()` tool for Material Tracker: an in-memory read-only SQLite database built once per turn from the snapshot, ported from `sql_database.py` (authorizer, query time limit, row and cell caps, `similarity` / `norm` / `digits`). Tables: `jobs`, `purchase_orders`, `po_lines`, `vendors`, `schedule_items`, `schedule_predecessors`, `emails`, `email_po_mentions`; schema rendered into the prompt from the same models. | P0 |
| E12-4 | UI notice the first time a job's data is cached: while a conversation's first snapshot for a job builds, the thread shows a status line ("Caching [Demo] Pike Street's purchase orders, schedule and vendor emails - first time only, about N s"). It is replaced by the answer when ready, and isn't shown again while the cache is fresh. A later rebuild after expiry or a write shows a lighter "Refreshing job data" line. Built from a new stream event APIX sends around the snapshot build. | P0 |
| E12-5 | Prompt and evals: status, impact, matching and sheet cases run on `sql()` with the snapshot; new cases for a cached second turn and a write that clears the cache; step budgets lowered to measure the gain (target: a status-and-impact answer in 2 to 3 steps); latency recorded before and after, like the job-match `LATENCY.md`. | P0 |

## Milestones

**Work on a separate branch.** All Buildbots work in BTNet (UI, agents, APIX and infrastructure changes) happens on a long-lived `Integration/buildbots` branch created from `master`, in its own worktree. Each epic gets its own branch (for example `buildbots/e1-ui`) and **one PR into `Integration/buildbots`**. BTNet builds an EphPR environment for every PR into an `Integration*` branch, so each epic PR is reviewable and demoable on its own. Nothing is committed, merged or PR'd to BTNet `master`.

**Stay current with BTNet.** At the start and end of every milestone, rebase `Integration/buildbots` onto BTNet `master`, between epics when no epic PR is open (rebasing rewrites the branch, so open epic branches would need rebasing too). Pay particular attention to `BTAgents/`, which changes often. After each rebase, re-run the BTAgents checks and the Buildbots evals before continuing.

1. **M0, Buildbots app in BTNet:** E1-1, E1-2 (done), E11-1.
2. **M1, Material Tracker live:** E2-1, E2-2, E3, E4, E5-1, E5-2, E6-1, E6-2, E10-1, E10-2, E11-2, E11-3. Worked milestone-first in this order: E2, E4, E6-1/E6-2, the M1 parts of E3, E5-1/E5-2, E10-1/E10-2, E11-2/E11-3 (one PR per epic).
3. **M2, Job Scheduling:** E7.
4. **M3, Custom bots:** E8-1, E8-2.
5. **M4, Proactive bots and polish:** E9, E2-3, E5-3, E6-3, E8-3, E10-3.
6. **M5, SQLite pre-caching:** E12-1 to E12-5, in that order (snapshot route, cache, `sql()` tool, UI notice, prompt and evals); one PR.

## Decisions

- **Model:** Gemini, the BTAgents default.
- **Conversations:** built on the session-service stack.
- **Demo Google accounts:** demo `@gmail.com` accounts added as test users on the sandbox OAuth client, whose consent screen is External in Testing mode. buildertrend.com Google accounts have no Gmail, Calendar or Drive (company mail is Microsoft 365), so Google refuses every read for them (found in E2 testing, 2026-10-13).
- **Job Scheduling sending:** Gmail, as for Material Tracker.
- **Branching:** `Integration/buildbots`, with one epic branch and PR into it per epic.
- **UI components:** shadcn/ui on Radix.
- **Work item:** ADO User Story #293894 "BuildBots prototype", referenced by every PR.
- **Google access:** browser sign-in token passed to APIX, which calls Google. Chosen because the Agent Platform `google-3lo` route needs infra changes we can't make; 3LO on per-PR environments also needs a callback registered per project.
- **Work order:** milestone-first. Within a milestone, only its stories, ordered to reach a working demo soonest; one PR per epic.
