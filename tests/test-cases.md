
# Campus Issue Tracker — Test Results

Environment: Remix VM
Compiler: Solidity 0.8.34

| Test | Input / Action | Expected Result | Actual Result |
|---|---|---|---|
| Create issue | Valid issue details | Issue created | PASS |
| Retrieve issue | getIssue(1) | Correct issue data returned | PASS |
| Count issues | getIssueCount() | Returns 1 | PASS |
| Update status | Admin sets issue 1 to status 1 | Status update succeeds | PASS |
| Unauthorized update | Account 2 updates issue 1 | Reverts: Only admin can perform this action | PASS |
| Empty title | createIssue with empty title | Reverts: Title cannot be empty | PASS |
| Nonexistent issue | getIssue(999) | Reverts: Issue does not exist | PASS |

## Notes

- Issue 1 was created successfully.
- The initial status was Submitted (0).
- The admin status update to InProgress (1) succeeded.
- Unauthorized and invalid operations were rejected as expected.
- Tests were conducted in Remix VM; results are from a local test environment.
