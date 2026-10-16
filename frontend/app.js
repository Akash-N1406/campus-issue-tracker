/* Campus Issue Tracker frontend
 * Ethers.js v6 + MetaMask
 * Ensure CONTRACT_ADDRESS matches your latest Remix deployment.
 */
const CONTRACT_ADDRESS = "0xf7C058C5C2aED617eF53D865CD8131A35711dC31";
const GANACHE_CHAIN_ID = 1337;

const ABI = [
  "function admin() view returns (address)",
  "function createIssue(string title, string description, string category) returns (uint256)",
  "function getIssue(uint256 id) view returns (uint256 issueId, address reporter, string title, string description, string category, uint8 status, uint256 createdAt)",
  "function getIssueCount() view returns (uint256)",
  "function updateIssueStatus(uint256 id, uint8 newStatus)",
  "event IssueCreated(uint256 indexed id, address indexed reporter, string title, string category)",
  "event IssueStatusUpdated(uint256 indexed id, uint8 newStatus)"
];

const STATUS = {
  0: { label: "Submitted", className: "status-0" },
  1: { label: "In progress", className: "status-1" },
  2: { label: "Resolved", className: "status-2" }
};

let provider = null;
let signer = null;
let contract = null;
let connectedAddress = null;
let adminAddress = null;
let isAdmin = false;
let issuesCache = [];

const $ = (id) => document.getElementById(id);

document.addEventListener("DOMContentLoaded", () => {
  $("year").textContent = new Date().getFullYear();
  $("connectWalletBtn").addEventListener("click", connectWallet);
  $("issueForm").addEventListener("submit", submitIssue);
  $("refreshBtn").addEventListener("click", () => loadIssues(true));
  $("searchIssues").addEventListener("input", renderIssues);
  $("statusFilter").addEventListener("change", renderIssues);

  if (!window.ethereum) {
    setConnectionStatus("MetaMask not detected", false);
    showNotice("Install the MetaMask browser extension, then refresh this page.", "error");
    return;
  }

  window.ethereum.on?.("accountsChanged", async (accounts) => {
    if (!accounts || accounts.length === 0) {
      resetConnection();
      showNotice("Wallet disconnected. Connect MetaMask to read or submit reports.", "info");
    } else {
      await initializeConnectedWallet(accounts[0]);
    }
  });

  window.ethereum.on?.("chainChanged", () => window.location.reload());

  // Restore the UI when MetaMask has already granted account access.
  window.ethereum.request({ method: "eth_accounts" })
    .then(async (accounts) => {
      if (accounts && accounts.length > 0) await initializeConnectedWallet(accounts[0]);
    })
    .catch((error) => console.warn("Could not check existing wallet connection:", error));
});

async function connectWallet() {
  if (!window.ethereum) {
    showNotice("MetaMask was not found. Install the extension and reload the page.", "error");
    return;
  }

  setBusy($("connectWalletBtn"), true, "Connecting…");
  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    if (!accounts || accounts.length === 0) throw new Error("No account was selected in MetaMask.");
    await initializeConnectedWallet(accounts[0]);
  } catch (error) {
    showNotice(formatError(error), "error");
  } finally {
    setBusy($("connectWalletBtn"), false, "Connect MetaMask");
    if (connectedAddress) $("connectWalletBtn").textContent = shortAddress(connectedAddress);
  }
}

async function initializeConnectedWallet(account) {
  try {
    provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);

    if (chainId !== GANACHE_CHAIN_ID) {
      resetConnection();
      setConnectionStatus("Wrong network", false);
      showNotice(
        `MetaMask is connected to chain ID ${chainId}. Switch MetaMask to your local Ganache network (chain ID ${GANACHE_CHAIN_ID}) and reconnect.`,
        "error"
      );
      return;
    }

    signer = await provider.getSigner(account);
    connectedAddress = await signer.getAddress();
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    adminAddress = await contract.admin();
    isAdmin = connectedAddress.toLowerCase() === adminAddress.toLowerCase();

    setConnectionStatus(`Connected: ${shortAddress(connectedAddress)}`, true);
    $("connectWalletBtn").textContent = shortAddress(connectedAddress);
    showNotice(
      isAdmin
        ? "Wallet connected. You are the contract administrator and can update issue statuses."
        : "Wallet connected. You can submit reports and view issues. Status updates are restricted to the contract administrator.",
      "success"
    );
    await loadIssues(false);
  } catch (error) {
    console.error("Wallet initialization failed:", error);
    showNotice(`Could not initialize the contract connection. Check the contract address and Ganache network. ${formatError(error)}`, "error");
  }
}

function resetConnection() {
  provider = null;
  signer = null;
  contract = null;
  connectedAddress = null;
  adminAddress = null;
  isAdmin = false;
  issuesCache = [];
  $("connectWalletBtn").textContent = "Connect MetaMask";
  setConnectionStatus("Not connected", false);
  updateStats([]);
  renderIssues();
}

async function loadIssues(showFeedback = true) {
  if (!contract) {
    renderIssues();
    if (showFeedback) showNotice("Connect MetaMask first to load the blockchain records.", "error");
    return;
  }

  setBusy($("refreshBtn"), true, "Loading…");
  try {
    const count = Number(await contract.getIssueCount());
    const loaded = [];

    // IDs start at 1 and increase monotonically in this contract.
    for (let id = count; id >= 1; id--) {
      const result = await contract.getIssue(id);
      loaded.push({
        id: Number(result.issueId ?? result[0]),
        reporter: result.reporter ?? result[1],
        title: result.title ?? result[2],
        description: result.description ?? result[3],
        category: result.category ?? result[4],
        status: Number(result.status ?? result[5]),
        createdAt: Number(result.createdAt ?? result[6])
      });
    }

    issuesCache = loaded;
    updateStats(loaded);
    renderIssues();
    if (showFeedback) showNotice(`Loaded ${loaded.length} issue${loaded.length === 1 ? "" : "s"} from the blockchain.`, "success");
  } catch (error) {
    console.error("Could not load issues:", error);
    showNotice(`Could not load issues from the contract. Confirm that the address in app.js is the latest deployment and that Ganache is running. ${formatError(error)}`, "error");
  } finally {
    setBusy($("refreshBtn"), false, "↻ Refresh");
  }
}

async function submitIssue(event) {
  event.preventDefault();
  if (!contract || !signer) {
    showNotice("Connect MetaMask before submitting a report.", "error");
    return;
  }

  const title = $("issueTitle").value.trim();
  const description = $("issueDescription").value.trim();
  const category = $("issueCategory").value;

  if (!title || !description || !category) {
    showNotice("Please complete the title, category, and description fields.", "error");
    return;
  }

  setBusy($("submitIssueBtn"), true, "Confirm in MetaMask…");
  try {
    const tx = await contract.createIssue(title, description, category);
    showNotice(`Transaction submitted: ${tx.hash}. Waiting for confirmation…`, "info");
    await tx.wait();
    $("issueForm").reset();
    $("issueCategory").value = "Maintenance";
    await loadIssues(false);
    showNotice("Your issue was successfully recorded on the blockchain.", "success");
  } catch (error) {
    console.error("Issue submission failed:", error);
    showNotice(formatError(error), "error");
  } finally {
    setBusy($("submitIssueBtn"), false, "Submit report ↗");
  }
}

async function updateStatus(issueId, newStatus) {
  if (!contract || !isAdmin) {
    showNotice("Only the contract administrator can update issue statuses.", "error");
    return;
  }

  const button = document.querySelector(`[data-save-status="${issueId}"]`);
  if (button) setBusy(button, true, "Saving…");

  try {
    const tx = await contract.updateIssueStatus(issueId, newStatus);
    showNotice(`Status update submitted: ${tx.hash}. Waiting for confirmation…`, "info");
    await tx.wait();
    await loadIssues(false);
    showNotice(`Issue #${issueId} status updated to ${STATUS[newStatus].label}.`, "success");
  } catch (error) {
    console.error("Status update failed:", error);
    showNotice(formatError(error), "error");
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "Save";
    }
  }
}

function updateStats(issues) {
  $("totalIssues").textContent = String(issues.length);
  $("submittedIssues").textContent = String(issues.filter((i) => i.status === 0).length);
  $("inProgressIssues").textContent = String(issues.filter((i) => i.status === 1).length);
  $("resolvedIssues").textContent = String(issues.filter((i) => i.status === 2).length);
}

function renderIssues() {
  const list = $("issuesList");
  const search = ($("searchIssues")?.value || "").trim().toLowerCase();
  const statusFilter = $("statusFilter")?.value || "all";

  const filtered = issuesCache.filter((issue) => {
    const matchesSearch = `${issue.id} ${issue.title} ${issue.description} ${issue.category} ${issue.reporter}`.toLowerCase().includes(search);
    const matchesStatus = statusFilter === "all" || issue.status === Number(statusFilter);
    return matchesSearch && matchesStatus;
  });

  $("listCount").textContent = `${filtered.length} issue${filtered.length === 1 ? "" : "s"}`;

  if (!contract && issuesCache.length === 0) {
    list.innerHTML = emptyState("Connect your wallet to load issues", "Blockchain records will appear here after connecting MetaMask.");
    return;
  }
  if (filtered.length === 0) {
    list.innerHTML = emptyState(
      issuesCache.length === 0 ? "No reports yet" : "No matching issues",
      issuesCache.length === 0 ? "Submit the first campus issue using the form." : "Try changing your search or status filter."
    );
    return;
  }

  list.innerHTML = filtered.map((issue) => {
    const status = STATUS[issue.status] || { label: "Unknown", className: "" };
    const date = issue.createdAt ? new Date(issue.createdAt * 1000).toLocaleString() : "Timestamp unavailable";
    const adminControls = isAdmin ? `
      <div class="admin-controls">
        <label for="status-${issue.id}">Update status</label>
        <select id="status-${issue.id}" aria-label="New status for issue ${issue.id}">
          ${Object.entries(STATUS).map(([value, item]) => `<option value="${value}" ${Number(value) === issue.status ? "selected" : ""}>${item.label}</option>`).join("")}
        </select>
        <button class="button button-secondary" type="button" data-save-status="${issue.id}">Save</button>
      </div>` : "";

    return `
      <article class="issue-card">
        <div class="issue-card-top">
          <div>
            <div class="issue-id">ISSUE #${issue.id}</div>
            <h3 class="issue-title">${escapeHtml(issue.title)}</h3>
          </div>
          <span class="status-badge ${status.className}">${status.label}</span>
        </div>
        <span class="category-tag">${escapeHtml(issue.category)}</span>
        <p class="issue-description">${escapeHtml(issue.description)}</p>
        <div class="issue-meta">
          <span>Reported by <strong>${escapeHtml(shortAddress(issue.reporter))}</strong></span>
          <span>Created <strong>${escapeHtml(date)}</strong></span>
        </div>
        ${adminControls}
      </article>`;
  }).join("");

  if (isAdmin) {
    list.querySelectorAll("[data-save-status]").forEach((button) => {
      button.addEventListener("click", () => {
        const id = Number(button.getAttribute("data-save-status"));
        const select = $(`status-${id}`);
        updateStatus(id, Number(select.value));
      });
    });
  }
}

function emptyState(title, message) {
  return `<div class="empty-state"><div class="empty-icon">▤</div><strong>${escapeHtml(title)}</strong><p>${escapeHtml(message)}</p></div>`;
}

function setConnectionStatus(text, connected) {
  const element = $("connectionStatus");
  element.innerHTML = `<span class="status-dot"></span>${escapeHtml(text)}`;
  element.classList.toggle("connected", Boolean(connected));
}

function showNotice(message, type = "info") {
  const notice = $("notice");
  notice.textContent = message;
  notice.className = `notice${type === "error" ? " error" : type === "success" ? " success" : ""}`;
  notice.hidden = false;
}

function setBusy(button, busy, label) {
  if (!button) return;
  if (!button.dataset.originalLabel) button.dataset.originalLabel = button.innerHTML;
  button.disabled = busy;
  button.innerHTML = label;
}

function shortAddress(address) {
  if (!address || typeof address !== "string") return "Unknown";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function formatError(error) {
  const raw = error?.shortMessage || error?.reason || error?.info?.error?.message || error?.message || "Unknown error";
  if (/user rejected|user denied|ACTION_REJECTED/i.test(raw)) return "The transaction or wallet connection was rejected in MetaMask.";
  if (/insufficient funds/i.test(raw)) return "The connected Ganache account does not have enough test ETH for gas.";
  if (/Only admin/i.test(raw)) return "Only the wallet that deployed this contract can update issue statuses.";
  if (/Title cannot be empty/i.test(raw)) return "Enter a title before submitting the report.";
  if (/Description cannot be empty/i.test(raw)) return "Enter a description before submitting the report.";
  if (/Category cannot be empty/i.test(raw)) return "Choose a category before submitting the report.";
  if (/could not coalesce|missing revert data|CALL_EXCEPTION/i.test(raw)) return "The contract call failed. Verify the deployed contract address, ABI, and Ganache connection.";
  return raw;
}
