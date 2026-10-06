# Buildbots prototype backlog (BTNet edition)

Build Buildbots inside **BTNet** as a new `/app/buildbots` route. It shows the Buildbots UX instead of the normal BT shell, while the rest of BTNet (login, APIX, data, BTAgents and ephemeral PR environments) runs as usual.

**Goals**
- Customer demos run by Buildertrend staff, using demo accounts we own.
- Two starter bots, **Material Tracker** and **Bid Coordinator**, defined the same way as custom bots and run by the same agent.
- **Custom bots** built through the Shop Foreman interview.
- Every bot can use the user's **Gmail, Google Calendar and Google Drive**.

**Out of scope:** the other bots from the mockup (removed from the roster), third-party portal automation, SMS and social channels, mobile layout, and customers' own Google accounts.

---

## E1: UI port and route

| ID | Story | Pri |
| --- | --- | --- |
| E1-1 | Port the Buildbots UI into `Clients.App/src/buildbots/` and mount it full-screen at `/app/buildbots`, gated to staff impersonating a builder (the same gate as AgentTester). | P0 |
| E1-2 | Make it run on BTNet's stack: React 17, React Router v5, and the missing Tailwind theme tokens. The UI should look the same as the standalone mockup. | P0 |

## E2: Google Workspace connections

| ID | Story | Pri |
| --- | --- | --- |
| E2-1 | Users connect Gmail, Calendar and Drive from the Connectors gallery. Uses per-user OAuth in APIX with encrypted tokens, kept to the minimum scopes. | P0 |
| E2-2 | Expose Gmail, Calendar and Drive as APIX endpoints and as shared agent tools, granted per bot. | P0 |
| E2-3 | Gmail push notifications so new emails can trigger bots. | P1 |

## E3: Buildbots backend

| ID | Story | Pri |
| --- | --- | --- |
| E3-1 | Store bots, conversations, approvals and routines per builder and user, with APIX endpoints and a generated client. | P0 |
| E3-2 | Fill APIX gaps the bots need: POs with delivery dates, schedule dependencies, bid packages, and trade partner history. | P0 |

## E4: Agent runtime and live thread

| ID | Story | Pri |
| --- | --- | --- |
| E4-1 | A BTAgents agent that runs any bot from its definition: instructions, tools, knowledge and trust mode. | P0 |
| E4-2 | Stream live agent turns into the Buildbots thread. Tool calls show as action cards and documents open in the live pane. Conversations persist across reloads. | P0 |
| E4-3 | Demo-safe behavior: friendly errors with retry and fast responses. | P0 |

## E5: Approvals and outbound safety

| ID | Story | Pri |
| --- | --- | --- |
| E5-1 | Anything leaving the company (emails, outside invites, Drive shares, bid requests) waits for approval in the approval card and queue, then resumes the conversation. | P0 |
| E5-2 | A per-builder recipient allowlist, enforced on the server, so demos can only send to addresses we own. | P0 |
| E5-3 | Trust modes (Suggest and Act) enforced on the server, plus an activity log of executed actions. | P1 |

## E6: Material Tracker

| ID | Story | Pri |
| --- | --- | --- |
| E6-1 | Find late or changed deliveries by matching BT POs against supplier emails in Gmail, and explain the schedule impact. | P0 |
| E6-2 | Draft and send an approved reply to the supplier, then handle their answer by offering to update the BT schedule. | P0 |
| E6-3 | Notify the job's PM about delivery risk. | P1 |

## E7: Bid Coordinator

| ID | Story | Pri |
| --- | --- | --- |
| E7-1 | Read an uploaded or Drive-picked plan set and identify the trade's sheets and fixture schedule. | P0 |
| E7-2 | Rank trade partners from BT history and write a personalized draft for each. | P0 |
| E7-3 | Send approved bid requests through BT Bids, with Gmail and a Drive link as options, and optionally invite partners to the site walk. | P0 |

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

| ID | Story | Pri |
| --- | --- | --- |
| E10-1 | Treat email and document content as untrusted. Instructions inside it never trigger actions. Covered by red-team tests. | P0 |
| E10-2 | Evals for each bot and the Shop Foreman, plus a pre-demo smoke run. | P0 |
| E10-3 | Datadog tracing for runs, tool calls and model calls, with run, tool and approval data landing in Databricks for analysis. | P1 |

## E11: Demo readiness

| ID | Story | Pri |
| --- | --- | --- |
| E11-1 | A stable EphPR demo environment with the Buildbots agents deployed. | P0 |
| E11-2 | A fictional demo builder seed plus demo Google accounts holding seeded mail and files. | P0 |
| E11-3 | One-click reset of the demo builder, conversations and Google accounts. | P0 |

---

## Milestones

1. **M0, UI in BTNet:** E1-1, E1-2, E11-1.
2. **M1, Material Tracker live:** E2-1, E2-2, E3, E4, E5-1, E5-2, E6-1, E6-2, E10-1, E10-2, E11-2, E11-3.
3. **M2, Bid Coordinator:** E7.
4. **M3, Custom bots:** E8-1, E8-2.
5. **M4, Proactive bots and polish:** E9, E2-3, E5-3, E6-3, E8-3, E10-3.

## Open questions

- Gemini (the BTAgents default) or Claude on Vertex?
- Build on the unmerged session-service branches, or store conversations ourselves?
- Which GCP project owns the Google OAuth client, and where do the demo Google accounts live?
- Should Bid Coordinator send through BT Bids, Gmail, or both?
