# Voting System (end-to-end blockchain)

This repository contains an end-to-end blockchain voting system with pluggable EVM (Ethereum) and Hyperledger Fabric ledger implementations.

Contents
- `backend/` - Node/TypeScript backend server, ledger adapters and controllers
- `frontend/` - Vite + React TypeScript single-page app (voter/admin UI)
- `contracts/` - Smart contract sources (EVM) and Fabric chaincode
- `test/` - Smoke and integration tests

Quick start
1. Install dependencies in the root or the subproject packages (recommended per-folder):
   - `cd backend && npm install`
   - `cd frontend && npm install`
2. Start development servers:
   - Backend dev: `npm run dev:backend`
   - Frontend dev: `npm run dev:frontend`

Repository setup
- I initialized local repo files (.gitignore, LICENSE). To create a remote GitHub repository, create it on GitHub and set the remote URL:

  git remote add origin <YOUR_REMOTE_URL>
  git push -u origin main

Replace the placeholder fields in `package.json` (`repository`, `bugs`, `homepage`) after adding the remote.

Contributing
- See `CONTRIBUTING.md` for contribution guidelines.

More documentation
- See `QUICKSTART.md`, `SETUP.md`, and `README.md` in subprojects for detailed setup and deployment notes.
# Blockchain Voting System

A tamper-evident, privacy-preserving voting system with pluggable blockchain support (EVM/Ganache or Hyperledger Fabric).

## Features

- **Pluggable Blockchain**: Support for EVM (Ganache) or Hyperledger Fabric
- **Commit-Reveal Scheme**: Privacy-preserving voting with cryptographic commitments
- **Merkle Tree Eligibility**: Efficient voter eligibility verification
- **Full Admin UI**: Create elections, manage eligibility lists
- **Voter Portal**: Commit and reveal votes with transaction receipts
- **Audit Logs**: Complete audit trail for all operations
- **On-chain Proofs**: Verify votes directly on the blockchain

## Architecture

- **Backend**: Node.js + Express + TypeScript
- **Frontend**: React + TypeScript + Vite
- **Database**: MongoDB (metadata & eligibility)
- **Blockchain**: EVM (Ganache) or Hyperledger Fabric
- **Smart Contracts**: Solidity (EVM) or Chaincode (Fabric)

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- MongoDB (or use Docker)
- Ganache (for EVM) or Hyperledger Fabric network (for Fabric)

## Quick Start

### 1. Clone and Install

```bash
git clone <repository>
cd voting-system
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start Services with Docker

```bash
docker-compose up -d
```

This will start:
- Ganache (EVM blockchain) on port 8545
- MongoDB on port 27017
- Backend API on port 3001
- Frontend on port 3000

### 4. Deploy Smart Contracts

#### For EVM (Ganache):

```bash
cd contracts/evm
npm install
truffle migrate --network ganache
# Copy the contract address to .env (EVM_CONTRACT_ADDRESS)
```

#### For Hyperledger Fabric:

```bash
cd contracts/fabric/chaincode/voting
npm install
# Deploy using your Fabric network's deployment process
```

### 5. Seed Sample Data

```bash
cd backend
npm run seed
```

### 6. Start Development Servers

```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Frontend
npm run dev:frontend
```

### 7. Access Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Docs: http://localhost:3001/health

## Project Structure

```
voting-system/
├── backend/          # Node.js + Express backend
├── frontend/         # React + Vite frontend
├── contracts/        # Smart contracts (EVM + Fabric)
├── docker-compose.yml
└── README.md
```

## API Endpoints

### Elections
- `GET /api/elections` - List all elections
- `POST /api/elections` - Create new election
- `GET /api/elections/:id` - Get election details
- `POST /api/elections/:id/close` - Close election

### Voting
- `POST /api/vote/commit` - Commit a vote
- `POST /api/vote/reveal` - Reveal a vote
- `GET /api/vote/receipt/:txHash` - Get vote receipt

### Admin
- `POST /api/admin/eligibility` - Upload eligibility list
- `GET /api/admin/audit/:electionId` - Get audit logs

## Voting Flow

1. **Commit Phase**: Voter commits their choice with a cryptographic hash
2. **Reveal Phase**: After election closes, voters reveal their choice with the salt
3. **Tally**: Votes are counted on-chain
4. **Verification**: Any voter can verify their vote was counted correctly

## Development

### Run Tests

```bash
npm test
```

### Build for Production

```bash
npm run build
```

### Docker Commands

```bash
docker-compose up -d      # Start all services
docker-compose down       # Stop all services
docker-compose logs -f    # View logs
```

## Security Considerations

- Private keys should never be committed to the repository
- Use strong JWT secrets in production
- Enable HTTPS in production
- Regularly audit smart contracts
- Implement rate limiting (included)
- Use environment variables for sensitive data

## License

MIT

