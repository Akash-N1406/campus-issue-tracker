# Campus Issue Tracker DApp

A decentralized application for submitting, viewing, and tracking campus maintenance issues using a Solidity smart contract and a browser-based frontend.

## Features

- Submit campus issues with a title, description, and category.
- View issue details and current status.
- Track the total number of submitted issues.
- Allow the contract administrator to update issue statuses.
- Connect wallets through MetaMask.
- Enforce administrator-only status updates in the smart contract.

## Technology Stack

- Solidity 0.8.34
- Remix IDE for contract compilation and testing
- HTML, CSS, and JavaScript
- Ethers.js v6
- MetaMask

## Project Structure

```text
campus-issue-tracker/
├── contracts/
│   └── CampusIssueTracker.sol
├── deployment/
│   └── deployment-details.md
├── frontend/
│   ├── app.js
│   ├── index.html
│   ├── style.css
│   └── README.md
├── tests/
│   └── test-cases.md
├── .gitignore
└── README.md
```

## Run the Frontend

1. Ensure the contract is deployed in the intended local development environment.
2. Confirm the contract address in `frontend/app.js` matches that deployment.
3. Open a terminal in the project directory and run:

   ```bash
   cd frontend
   python3 -m http.server 5500
   ```

4. Open `http://localhost:5500` in a browser with MetaMask installed.
5. Connect MetaMask to the network hosting the deployed contract.
6. Submit a test issue and verify that it appears in the application.

For complete frontend configuration and troubleshooting, see [`frontend/README.md`](frontend/README.md).

## Smart Contract

The `CampusIssueTracker` contract supports issue creation, issue retrieval, issue counting, and administrator-controlled status updates. Status values are:

- `0` — Submitted
- `1` — In Progress
- `2` — Resolved

## Testing

Test cases and recorded outcomes are documented in [`tests/test-cases.md`](tests/test-cases.md). The documented tests were conducted in Remix VM.

## Deployment Information

See [`deployment/deployment-details.md`](deployment/deployment-details.md) for the recorded deployment configuration. Local development deployments are temporary and should not be treated as permanent public deployments.

## Security Note

Use local development accounts for testing only. Never publish wallet private keys or seed phrases, and never use local test credentials on a real network.
