# Native Web elicitation

The default Web adapter now forwards original `elicitationRequest` events to a browser decision and sends the result through the complete recovered SessionManager's `respondElicitation`, CodeBackend and WorkbuddyACPClient. It preserves original elicitation IDs, request schemas and JSON-RPC response correlation. The host does not replace original agent/tool execution.

## Browser behavior

Form requests render string, numeric, integer, Boolean and enum controls. Array or structured values use a JSON field. Required fields, defaults and common input constraints are applied; the server validates accepted content against the original JSON schema, including standard formats, using pinned Ajv 8.17.1 and ajv-formats 3.0.1. Invalid input returns 400 without settling the pending decision, so the user can correct it. Rejection and cancellation do not parse unfinished form values.

URL requests show an HTTP(S) link opened only by the user's click, with no opener or referrer. Opening it does not submit a response. The user separately confirms completion, declines or cancels. Unsupported URL schemes have no actionable link or accept button. A confirmation means a user response to the agent, not independent verification of the external operation.

The local `/api/elicit` POST uses the same Host, Origin and CSRF checks as existing decisions. It accepts only `accept`, `decline` or `cancel`, checks the pending decision type, and returns 404 for stale IDs. It includes content only on accepted forms. Browser disconnect, run cancellation and the existing decision timeout release waiting host decisions. The runtime uses original session cancellation when the run aborts. Elicitation IDs have their own deduplication namespace so they cannot collide with permission/question IDs.

## Evidence and validation

REA evidence `ev_2cf45f7d27b377c29703afa8e9d02c3ad1394437d945731e43ee66304a7ef21f` analyzes the previously verified original backend and input-resolution declarations: two files, 136,574 bytes, 17,937 AST nodes, zero parse failures. The source contracts retain the original form-meta/URL/request-ID fallback and backend acknowledgment before controller settlement.

`native-web-elicitation.test.mjs` composes the complete original controller, backend and ACP client against an owned local ACP agent peer, then drives the actual Web HTTP/SSE API. Five cases cover form accept, decline, cancel, URL accept and run abort. They verify exact correlated ACP responses, invalid schema/format retry, expired browser decisions, cancellation and backend destruction. This peer is a protocol fixture, not the captured CLI, a live connector or a payment service. Existing real-CLI Web interactions continue to run separately.

The combined Web regression passed 22/22. After enabling format validation, the five elicitation cases passed again; type and syntax checks passed. Browser visual verification remains outstanding: both available browser automation paths returned `ERR_BLOCKED_BY_CLIENT` for the owned loopback preview. No external URL was opened. Live connector/payment completion, specialized original payment-card rendering and intermediate completion-notification UI behavior remain unverified.

Root build and five post-build protocol cases also passed. Logs: `work/web-elicitation-build.log` and `work/web-elicitation-built.log`.
