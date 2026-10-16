
const CONTRACT_ADDRESS = "0x4ED348c05294073F8B9D47292a966dFabAcb6B2C";
const EXPECTED_CHAIN_ID = 1337n;

const CONTRACT_ABI = [
    "function admin() view returns (address)",
    "function createIssue(string title, string description, string category) returns (uint256)",
    "function getIssue(uint256 id) view returns (tuple(uint256 id, address reporter, string title, string description, string category, uint8 status, uint256 createdAt))",
    "function getIssueCount() view returns (uint256)",
    "function updateIssueStatus(uint256 id, uint8 newStatus)",
    "event IssueCreated(uint256 indexed id, address indexed reporter, string title, string category)",
    "event IssueStatusUpdated(uint256 indexed id, uint8 newStatus)"
];

const STATUS_NAMES = ["Submitted", "In Progress", "Resolved"];

let provider;
let signer;
let contract;
let currentAccount;

const $ = (id) => document.getElementById(id);

function showNotice(message, isError = false) {
    $("notice").textContent = message;
    $("notice").style.color = isError ? "#b91c1c" : "#475569";
}

function shortenAddress(address) {
    return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function formatTimestamp(timestamp) {
    return new Date(Number(timestamp) * 1000).toLocaleString();
}

function makeTextElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    element.textContent = text;
    return element;
}

async function connectWallet() {
    if (!window.ethereum) {
        showNotice("MetaMask was not detected. Install or enable the MetaMask extension.", true);
        return;
    }

    try {
        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts"
        });

        if (!accounts.length) {
            showNotice("No wallet account was returned.", true);
            return;
        }

        provider = new ethers.BrowserProvider(window.ethereum);

        const network = await provider.getNetwork();
        if (network.chainId !== EXPECTED_CHAIN_ID) {
            showNotice(
                "Wrong network. Switch MetaMask to Ganache Local (chain ID 1337).",
                true
            );
            return;
        }

        signer = await provider.getSigner();
        currentAccount = accounts[0];

        contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        $("walletAddress").textContent = shortenAddress(currentAccount);
        $("networkName").textContent = `Ganache Local (${network.chainId})`;
        $("connectWallet").textContent = "Wallet Connected";

        const adminAddress = await contract.admin();
        const isAdmin = adminAddress.toLowerCase() === currentAccount.toLowerCase();

        $("userRole").textContent = isAdmin ? "Administrator" : "Student";
        $("adminPanel").hidden = !isAdmin;

        showNotice("Wallet connected successfully.");
        await loadIssues();
    } catch (error) {
        console.error("Wallet connection failed:", error);
        showNotice(error.shortMessage || error.message || "Wallet connection failed.", true);
    }
}

async function loadIssues() {
    if (!contract) {
        showNotice("Connect MetaMask first.", true);
        return;
    }

    const list = $("issuesList");
    list.replaceChildren(makeTextElement("p", "empty-state", "Loading issues…"));

    try {
        const count = Number(await contract.getIssueCount());
        $("issueCount").textContent = count;

        list.replaceChildren();

        if (count === 0) {
            list.append(makeTextElement("p", "empty-state", "No issues have been reported yet."));
            return;
        }

        // IDs begin at 1, and the count is the latest assigned issue ID.
        for (let id = count; id >= 1; id--) {
            const issue = await contract.getIssue(id);

            const card = makeTextElement("article", "issue-card", "");
            const heading = makeTextElement("h3", "", `#${issue.id} — ${issue.title}`);
            const description = makeTextElement("p", "", issue.description);
            const category = makeTextElement("p", "issue-meta", `Category: ${issue.category}`);
            const reporter = makeTextElement(
                "p",
                "issue-meta",
                `Reported by: ${issue.reporter}`
            );
            const created = makeTextElement(
                "p",
                "issue-meta",
                `Created: ${formatTimestamp(issue.createdAt)}`
            );
            const status = makeTextElement(
                "span",
                "status",
                STATUS_NAMES[Number(issue.status)] ?? "Unknown"
            );

            card.append(heading, description, category, reporter, created, status);
            list.append(card);
        }
    } catch (error) {
        console.error("Could not load issues:", error);
        list.replaceChildren(
            makeTextElement("p", "empty-state", "Unable to load issues. Check the network and contract address.")
        );
        showNotice(error.shortMessage || error.message || "Failed to load issues.", true);
    }
}

async function submitIssue(event) {
    event.preventDefault();

    if (!contract) {
        showNotice("Connect MetaMask before submitting an issue.", true);
        return;
    }

    const title = $("title").value.trim();
    const description = $("description").value.trim();
    const category = $("category").value;

    if (!title || !description || !category) {
        showNotice("Please fill in all fields.", true);
        return;
    }

    const button = $("submitIssue");
    button.disabled = true;
    button.textContent = "Waiting for confirmation…";

    try {
        showNotice("Confirm the transaction in MetaMask.");
        const tx = await contract.createIssue(title, description, category);

        showNotice(`Transaction sent: ${tx.hash}. Waiting for confirmation…`);
        await tx.wait();

        $("issueForm").reset();
        showNotice("Issue submitted successfully!");
        await loadIssues();
    } catch (error) {
        console.error("Issue submission failed:", error);
        showNotice(error.shortMessage || error.reason || error.message || "Submission failed.", true);
    } finally {
        button.disabled = false;
        button.textContent = "Submit issue";
    }
}

async function updateIssueStatus(event) {
    event.preventDefault();

    if (!contract || !$("adminPanel").hidden) {
        if (!contract) {
            showNotice("Connect the administrator wallet first.", true);
            return;
        }
    } else {
        showNotice("Only the administrator can update issue statuses.", true);
        return;
    }

    const id = $("issueId").value.trim();
    const newStatus = Number($("newStatus").value);

    if (!id || !Number.isSafeInteger(Number(id)) || Number(id) < 1) {
        showNotice("Enter a valid positive issue ID.", true);
        return;
    }

    if (!Number.isInteger(newStatus) || newStatus < 0 || newStatus > 2) {
        showNotice("Select a valid status.", true);
        return;
    }

    try {
        showNotice("Confirm the status update in MetaMask.");
        const tx = await contract.updateIssueStatus(BigInt(id), newStatus);

        showNotice(`Transaction sent: ${tx.hash}. Waiting for confirmation…`);
        await tx.wait();

        showNotice(`Issue #${id} status updated successfully.`);
        $("statusForm").reset();
        await loadIssues();
    } catch (error) {
        console.error("Status update failed:", error);
        showNotice(error.shortMessage || error.reason || error.message || "Status update failed.", true);
    }
}

$("connectWallet").addEventListener("click", connectWallet);
$("issueForm").addEventListener("submit", submitIssue);
$("refreshIssues").addEventListener("click", loadIssues);
$("statusForm").addEventListener("submit", updateIssueStatus);

if (window.ethereum) {
    window.ethereum.on("accountsChanged", () => window.location.reload());

    window.ethereum.on("chainChanged", () => window.location.reload());
}
