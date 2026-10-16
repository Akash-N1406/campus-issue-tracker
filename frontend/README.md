# Campus Issue Tracker — Frontend

Frontend for the Campus Issue Tracker Solidity contract. Built with HTML, CSS, JavaScript, Ethers.js v6, and MetaMask.

## Files
- `index.html` — application layout and Ethers.js import
- `style.css` — responsive UI styling
- `app.js` — MetaMask connection, contract calls, report creation, status updates, and rendering

## Configuration
The frontend currently targets this Remix deployment:

`0xf7C058C5C2aED617eF53D865CD8131A35711dC31`

If you deploy the contract again, update `CONTRACT_ADDRESS` at the top of `app.js`.

The ABI in `app.js` expects these contract methods:
- `admin()`
- `createIssue(string,string,string)`
- `getIssue(uint256)` returning seven separate fields
- `getIssueCount()`
- `updateIssueStatus(uint256,uint8)`

## Run locally
1. Start Ganache and keep it running on `http://127.0.0.1:8545`.
2. In MetaMask, add/select a local network with RPC URL `http://127.0.0.1:8545`, chain ID `1337`, and currency symbol `ETH`.
3. Import a Ganache test account into MetaMask. Never use a Ganache test key on a real network.
4. Serve the frontend from the project directory. For example, from the project root:

   ```bash
   cd frontend
   python3 -m http.server 5500
   ```

5. Open `http://127.0.0.1:5500` in a browser with MetaMask installed.
6. Connect MetaMask and submit a test report.

If MetaMask is connected to the wrong chain, switch to the Ganache network and reload the page.

## Notes
- The wallet that deployed the contract is the administrator and can update issue statuses.
- Other connected wallets can submit reports and view records.
- Contract reads and writes use the current deployment address in `app.js`.
