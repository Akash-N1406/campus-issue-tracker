
 // SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CampusIssueTracker {
    address public admin;

    enum Status {
        Submitted,
        InProgress,
        Resolved
    }

    struct Issue {
        uint256 id;
        address reporter;
        string title;
        string description;
        string category;
        Status status;
        uint256 createdAt;
    }

    uint256 private nextIssueId = 1;

    mapping(uint256 => Issue) private issues;

    event IssueCreated(
        uint256 indexed id,
        address indexed reporter,
        string title,
        string category
    );

    event IssueStatusUpdated(
        uint256 indexed id,
        Status newStatus
    );

    modifier onlyAdmin() {
        require(
            msg.sender == admin,
            "Only admin can perform this action"
        );
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function createIssue(
        string calldata title,
        string calldata description,
        string calldata category
    ) external returns (uint256) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(
            bytes(description).length > 0,
            "Description cannot be empty"
        );
        require(bytes(category).length > 0, "Category cannot be empty");

        uint256 id = nextIssueId++;

        issues[id] = Issue({
            id: id,
            reporter: msg.sender,
            title: title,
            description: description,
            category: category,
            status: Status.Submitted,
            createdAt: block.timestamp
        });

        emit IssueCreated(id, msg.sender, title, category);

        return id;
    }

    function getIssue(uint256 id)
        external
        view
        returns (
            uint256 issueId,
            address reporter,
            string memory title,
            string memory description,
            string memory category,
            Status status,
            uint256 createdAt
        )
    {
        require(
            id > 0 && id < nextIssueId,
            "Issue does not exist"
        );

        Issue storage issue = issues[id];

        return (
            issue.id,
            issue.reporter,
            issue.title,
            issue.description,
            issue.category,
            issue.status,
            issue.createdAt
        );
    }

    function getIssueCount() external view returns (uint256) {
        return nextIssueId - 1;
    }

    function updateIssueStatus(
        uint256 id,
        Status newStatus
    ) external onlyAdmin {
        require(
            id > 0 && id < nextIssueId,
            "Issue does not exist"
        );

        require(
            uint256(newStatus) <= uint256(Status.Resolved),
            "Invalid status"
        );

        issues[id].status = newStatus;

        emit IssueStatusUpdated(id, newStatus);
    }
}
