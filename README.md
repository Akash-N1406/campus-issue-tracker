# Campus Issue Tracker DApp

**Assignment:** Blockchain Technology (CSE4444) Assignment 2  
**Student:** Akash Naik  
**Registration Number:** 230905016  
**GitHub Repository:** https://github.com/Akash-N1406/campus-issue-tracker

## 1. Problem Statement

Campus maintenance and service issues—such as broken classroom equipment, internet connectivity problems, and safety concerns—need a transparent way to report and track progress. The Campus Issue Tracker is a blockchain-based decentralized application (DApp) that lets users submit issue reports and view their status. The smart contract stores each report and restricts status changes to the contract administrator.

## 2. Features

- Submit an issue with a title, category, and description.
- Store and retrieve issue records through a Solidity smart contract.
- Display the issue list, total issue count, and counts by status.
- Search issues and filter by status.
- Let the contract administrator update an issue to **Submitted**, **In Progress**, or **Resolved**.
- Connect to the contract using MetaMask and Ethers.js v6.

## 3. Technology Stack

- Solidity 0.8.x
- Remix IDE
- HTML, CSS, and JavaScript
- Ethers.js v6
- MetaMask
- Ganache Local (local EVM network used for the demonstration)

## 4. Repository Structure

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
├── screenshots/
│   ├── 01-contract-compilation.png
│   ├── 02-contract-deployment.png
│   ├── 03-metamask-wallet-connection.png
│   ├── 04-successful-transaction.png
│   ├── 05-failed-transaction.png
│   └── 06-blockchain-data-in-ui.png
├── .gitignore
└── README.md
```

> Create the `screenshots/` directory and add the six required evidence images using the exact filenames above. Do not commit private keys, seed phrases, passwords, or other credentials. The screenshots previously captured should be copied into this folder and renamed to match the relevant evidence. The failed-transaction screenshot must show a genuine failed/reverted transaction; do not label a successful transaction as a failure.

## 5. Deployment Network and Contract Address

- **Network:** Ganache Local / local development EVM
- **RPC URL:** `http://127.0.0.1:8545` (when using the local Ganache setup)
- **Chain ID:** `1337` (when using the local Ganache setup)
- **Contract:** `CampusIssueTracker`
- **Contract address shown in the current frontend configuration:** `0xf7C058C5C2aED617eF53D865CD8131A35711dC31`
- **Compiler:** Solidity 0.8.34

The contract address is specific to the current deployment and network. Local-chain state can be reset, and Remix VM deployments are temporary. Before running the app, verify that the address in `frontend/app.js`, the active MetaMask network, and the deployment actually refer to the same contract. Update `deployment/deployment-details.md` if the address or network changes.

## 6. Requirements

- Node.js is not required for the simple static frontend; Python 3 is sufficient to serve the files.
- A browser with the MetaMask extension installed.
- The smart contract must already be deployed to the network selected in MetaMask.
- Use development accounts only. Never use local test credentials on a real network.

## 7. Execute the Application

1. Start the local blockchain used for the deployment (for example, Ganache Local) and keep it running.
2. Confirm the deployed contract address. Ensure `CONTRACT_ADDRESS` in `frontend/app.js` matches the deployment on the active network.
3. From the repository root, start the frontend web server:

   ```bash
   cd frontend
   python3 -m http.server 5500
   ```

4. Open `http://localhost:5500` in a browser with MetaMask installed.
5. Connect MetaMask to the same local network where the contract is deployed.
6. Connect the wallet in the DApp and approve the connection request.
7. Submit an issue with a title, category, and description. Review the transaction details in MetaMask and confirm the transaction.
8. Wait for the transaction to be mined, then refresh the issue list if necessary. The new issue should appear in the UI with its ID, reporter, category, description, timestamp, and status.
9. If using an administrator account, select a new status on an issue and press **Save**. Confirm the MetaMask transaction. A non-admin account should not be able to update status; the smart contract enforces this restriction.

## 8. Connecting MetaMask

1. Open MetaMask and select or configure the network used for the contract.
2. For the local Ganache setup, use RPC URL `http://127.0.0.1:8545`, chain ID `1337`, and currency symbol `ETH` if those values match your running Ganache instance.
3. Import or select a **local development account** funded by the local chain. Never publish its private key or seed phrase.
4. Open the DApp at `http://localhost:5500` and click its wallet-connect control.
5. Approve the connection in MetaMask. Confirm that the displayed account matches the selected account.
6. Use the form to create an issue; MetaMask will ask for transaction approval. The contract deployer/admin can also update issue statuses.

## 9. Test Cases and Observed Results

The following results reflect the outcomes recorded in `tests/test-cases.md` for the Remix VM test session. These are documented test results; repeat them against the current deployment if fresh evidence is required.

| Test case | Input/action | Expected/observed result |
|---|---|---|
| Valid issue creation | Provide non-empty title, description, and category | **PASS (recorded):** issue created successfully |
| Read issue | Call `getIssue(1)` after creating an issue | **PASS (recorded):** issue data returned |
| Issue count | Call `getIssueCount()` after one issue exists | **PASS (recorded):** returns `1` in the documented test scenario |
| Valid admin update | Admin changes issue status to `InProgress` | **PASS (recorded):** status update succeeds |
| Unauthorized status update | A different account calls `updateIssueStatus` | **PASS (recorded):** transaction reverts with `Only admin can perform this action` |
| Invalid empty title | Call `createIssue` with an empty title | **PASS (recorded):** reverts with `Title cannot be empty` |
| Nonexistent issue | Call `getIssue(999)` | **PASS (recorded):** reverts with `Issue does not exist` |

### Evidence screenshots required by the assignment

Add these six screenshots under `screenshots/` and keep the captions clear:

1. **Smart contract compilation** — Remix Solidity Compiler showing successful compilation.
2. **Smart contract deployment** — Remix Deploy & Run panel showing the deployed `CampusIssueTracker` and its address.
3. **MetaMask wallet connection** — DApp showing the connected wallet/account and network.
4. **Successful transaction** — MetaMask confirmation or DApp success message, plus the newly recorded issue visible where possible.
5. **Failed transaction** — a genuine failed/reverted transaction, such as a non-admin attempt to update status or an empty-title call. Make sure the screenshot shows the failure/revert.
6. **Blockchain data displayed through the UI** — the DApp issue list showing records retrieved from the contract, ideally with issue IDs, categories, statuses, and total counts.

The repository should contain the actual image files, not just these filenames or descriptions. Avoid including account private keys, seed phrases, or other secrets in screenshots.

## 10. Security Notes

- Never commit private keys, seed phrases, passwords, `.env` files containing secrets, or wallet backups.
- Use only local development accounts for this assignment.
- On-chain data may be visible to anyone with access to the network; do not submit sensitive personal information as an issue.
- Frontend controls are for usability. Authorization must be enforced by the smart contract itself.
- This project is intended for academic demonstration and is not presented as a production-audited system.

## 11. Project Files

- `contracts/CampusIssueTracker.sol` — smart contract.
- `frontend/index.html` — application markup.
- `frontend/style.css` — UI styling.
- `frontend/app.js` — MetaMask and contract integration.
- `frontend/README.md` — frontend-specific run instructions.
- `deployment/deployment-details.md` — deployment configuration.
- `tests/test-cases.md` — documented test cases and results.
