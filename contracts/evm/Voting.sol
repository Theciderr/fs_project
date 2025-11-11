// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Voting {
    struct Election {
        string name;
        uint256 startTime;
        uint256 endTime;
        uint256 candidateCount;
        bytes32 eligibilityRoot;
        bool closed;
    }

    struct Commit {
        bytes32 commit;
        bool revealed;
    }

    mapping(uint256 => Election) public elections;
    mapping(uint256 => mapping(address => Commit)) public commits;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => mapping(uint256 => uint256)) public tally;
    mapping(uint256 => address[]) public voters;

    uint256 public electionCount;

    event ElectionCreated(uint256 id, string name);
    event VoteCommitted(uint256 electionId, address voter, bytes32 commit);
    event VoteRevealed(uint256 electionId, address voter, uint256 candidateId);
    event ElectionClosed(uint256 electionId);

    modifier onlyOpen(uint256 id) {
        Election memory e = elections[id];
        require(e.startTime <= block.timestamp && block.timestamp < e.endTime, "Not open");
        require(!e.closed, "Election closed");
        _;
    }

    modifier onlyClosed(uint256 id) {
        require(elections[id].closed, "Not closed");
        _;
    }

    function createElection(
        string memory name,
        uint256 startTime,
        uint256 endTime,
        uint256 candidateCount,
        bytes32 eligibilityRoot
    ) external returns (uint256) {
        require(startTime > block.timestamp && endTime > startTime, "Invalid times");
        electionCount++;
        elections[electionCount] = Election(name, startTime, endTime, candidateCount, eligibilityRoot, false);
        emit ElectionCreated(electionCount, name);
        return electionCount;
    }

    function commitVote(uint256 electionId, bytes32 commitHash) external onlyOpen(electionId) {
        require(!hasVoted[electionId][msg.sender], "Already voted");
        commits[electionId][msg.sender] = Commit(commitHash, false);
        hasVoted[electionId][msg.sender] = true;
        voters[electionId].push(msg.sender);
        emit VoteCommitted(electionId, msg.sender, commitHash);
    }

    function revealVote(uint256 electionId, uint256 candidateId, uint256 salt) external onlyClosed(electionId) {
        Commit memory c = commits[electionId][msg.sender];
        require(c.commit != 0 && !c.revealed, "Invalid state");
        require(keccak256(abi.encode(candidateId, salt)) == c.commit, "Invalid reveal");
        require(candidateId < elections[electionId].candidateCount, "Invalid candidate");

        commits[electionId][msg.sender].revealed = true;
        tally[electionId][candidateId]++;
        emit VoteRevealed(electionId, msg.sender, candidateId);
    }

    function closeElection(uint256 electionId) external {
        require(block.timestamp >= elections[electionId].endTime, "Not ended");
        elections[electionId].closed = true;
        emit ElectionClosed(electionId);
    }

    function getElection(uint256 electionId) external view returns (Election memory) {
        return elections[electionId];
    }

    function getTally(uint256 electionId, uint256 candidateId) external view returns (uint256) {
        return tally[electionId][candidateId];
    }

    function getVoters(uint256 electionId) external view returns (address[] memory) {
        return voters[electionId];
    }

    function verifyMerkleProof(
        bytes32 leaf,
        bytes32 root,
        bytes32[] calldata proof
    ) public pure returns (bool) {
        bytes32 computed = leaf;
        for (uint256 i = 0; i < proof.length; i++) {
            if (computed < proof[i]) {
                computed = keccak256(abi.encodePacked(computed, proof[i]));
            } else {
                computed = keccak256(abi.encodePacked(proof[i], computed));
            }
        }
        return computed == root;
    }

    function isEligible(uint256 electionId, address voter, bytes32[] calldata proof) external view returns (bool) {
        bytes32 leaf = keccak256(abi.encodePacked(voter));
        bytes32 root = elections[electionId].eligibilityRoot;
        return verifyMerkleProof(leaf, root, proof);
    }
}

