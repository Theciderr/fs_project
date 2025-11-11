# Step-by-Step Setup Guide

## Prerequisites

Before starting, ensure you have:
- **Node.js 18+** installed ([Download](https://nodejs.org/))
- **Docker Desktop** installed ([Download](https://www.docker.com/products/docker-desktop))
- **Git** installed (optional, for cloning)

## Step 1: Install Dependencies

### 1.1 Install Root Dependencies
```bash
npm install
```

### 1.2 Install Backend Dependencies
```bash
cd backend
npm install
cd ..
```

### 1.3 Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### 1.4 Install Contract Dependencies
```bash
cd contracts/evm
npm install
cd ../..
```

## Step 2: Configure Environment Variables

### 2.1 Create .env file in the root directory
Create a file named `.env` in the root directory with the following content:

```env
# Backend
PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production-min-32-chars
MONGO_URI=mongodb://localhost:27017/voting

# Ledger Configuration
LEDGER_TYPE=EVM

# EVM Configuration (Ganache)
EVM_RPC_URL=http://localhost:8545
EVM_PRIVATE_KEY=4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d
EVM_CONTRACT_ADDRESS=

# Frontend
VITE_API_URL=http://localhost:3001
```

**Note:** The `EVM_PRIVATE_KEY` above is a default Ganache private key. After deploying the contract, you'll update `EVM_CONTRACT_ADDRESS`.

### 2.2 Create .env file in backend directory (optional, for local development)
```bash
cd backend
# Copy the same .env content or create a symlink
cd ..
```

## Step 3: Start Ganache (Blockchain)

### Option A: Using Docker Compose (Recommended)
```bash
docker-compose up -d ganache
```

### Option B: Using Ganache CLI directly
```bash
# Install Ganache CLI globally
npm install -g ganache-cli

# Start Ganache
ganache-cli -d -i 1337 --deterministic
```

**Verify Ganache is running:**
- Check http://localhost:8545
- You should see JSON-RPC responses

## Step 4: Start MongoDB

### Option A: Using Docker Compose (Recommended)
```bash
docker-compose up -d mongo
```

### Option B: Using MongoDB locally
```bash
# Install MongoDB locally and start the service
# Or use MongoDB Atlas (cloud)
```

**Verify MongoDB is running:**
- Check mongodb://localhost:27017
- Or use MongoDB Compass to connect

## Step 5: Deploy Smart Contract

### 5.1 Navigate to contracts directory
```bash
cd contracts/evm
```

### 5.2 Deploy the contract
```bash
npx truffle migrate --network ganache
```

**Expected Output:**
```
Compiling your contracts...
...
Deploying 'Voting'
...
Voting: 0x... (contract address)
```

### 5.3 Copy the contract address
Copy the contract address from the output (e.g., `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`)

### 5.4 Update .env file
Update the `EVM_CONTRACT_ADDRESS` in your root `.env` file:
```env
EVM_CONTRACT_ADDRESS=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

### 5.5 Return to root directory
```bash
cd ../..
```

## Step 6: Seed Sample Data

### 6.1 Seed eligibility data
```bash
cd backend
npm run seed
```

**Expected Output:**
```
Connected to MongoDB: mongodb://localhost:27017/voting
Seeded 3 eligibility records
```

### 6.2 Verify data
You can verify the data was seeded by checking MongoDB or using the admin API.

## Step 7: Start Backend Server

### 7.1 Start the backend (in a new terminal)
```bash
cd backend
npm run dev
```

**Expected Output:**
```
Backend running on port 3001
Environment: development
Ledger type: EVM
Connected to MongoDB: mongodb://localhost:27017/voting
```

### 7.2 Verify backend is running
- Open http://localhost:3001/health
- You should see: `{"status":"OK","timestamp":"..."}`

## Step 8: Start Frontend Server

### 8.1 Start the frontend (in a new terminal)
```bash
cd frontend
npm run dev
```

**Expected Output:**
```
VITE v5.0.8  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 8.2 Access the application
- Open http://localhost:5173 (or the port shown in the output)
- You should see the voting system interface

## Step 9: Test the Application

### 9.1 Login as Admin
1. Click "Login as Admin" button
2. You'll be authenticated (currently using mock authentication)

### 9.2 Upload Eligibility List
1. Navigate to "Admin Console"
2. Click "Upload Eligibility" tab
3. Upload the sample file: `frontend/public/sample-eligibility.csv`
4. Or create your own CSV with format:
   ```csv
   address,voterId
   0x71C7656EC7ab88b098defB751B7401B5f6d8976F,voter_001
   0x1C5D0C3B7A8D9E0F1A2B3C4D5E6F7A8B9C0D1E2F,voter_002
   ```

### 9.3 Create an Election
1. Click "Create Election" tab
2. Fill in the form:
   - **Name**: "Test Election"
   - **Description**: "A test election"
   - **Start Time**: Current time or future
   - **End Time**: Future time (e.g., 1 hour from now)
   - **Candidates**: Add at least 2 candidates (e.g., "Candidate A", "Candidate B")
3. Click "Create Election"
4. Note the election ID

### 9.4 Vote (as a Voter)
1. Logout and login as "Voter" (or use a different browser/incognito)
2. Navigate to "Voter Portal"
3. Find your election in "Open Elections"
4. Click "Vote Now"
5. Select a candidate
6. Click "Commit Vote"
7. Save your receipt (transaction hash)

### 9.5 Close Election
1. Login as Admin
2. Navigate to the election
3. Click "Close Election" (after end time has passed)

### 9.6 Reveal Votes
1. As a voter, navigate to "Closed Elections"
2. Click "View / Reveal Vote"
3. Click "Reveal Vote"
4. Your vote will be revealed and counted

### 9.7 View Tally
1. As admin, view the election
2. Check the tally results
3. Verify votes were counted correctly

## Step 10: Verify on Blockchain

### 10.1 Check transaction on Ganache
- Use Ganache UI to view transactions
- Or use a blockchain explorer if connected to a testnet

### 10.2 Verify vote receipt
1. Navigate to "Verify Vote" page
2. Enter your transaction hash
3. View the receipt and proof

## Troubleshooting

### Issue: "Cannot connect to MongoDB"
**Solution:**
- Ensure MongoDB is running: `docker-compose ps`
- Check MongoDB connection string in `.env`
- Verify MongoDB is accessible on port 27017

### Issue: "Cannot connect to Ganache"
**Solution:**
- Ensure Ganache is running: `docker-compose ps`
- Check Ganache URL in `.env`: `EVM_RPC_URL=http://localhost:8545`
- Verify Ganache is accessible: `curl http://localhost:8545`

### Issue: "Contract address not found"
**Solution:**
- Ensure contract is deployed: `cd contracts/evm && npx truffle migrate --network ganache`
- Copy the contract address to `.env`: `EVM_CONTRACT_ADDRESS=0x...`
- Restart the backend server

### Issue: "Private key error"
**Solution:**
- Ensure `EVM_PRIVATE_KEY` is set in `.env`
- Use a valid private key from Ganache (64 hex characters, no 0x prefix)
- Default Ganache key: `4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d`

### Issue: "Port already in use"
**Solution:**
- Check if ports 3001, 5173, 8545, 27017 are available
- Stop conflicting services
- Or change ports in `.env` and `docker-compose.yml`

### Issue: "Module not found"
**Solution:**
- Ensure all dependencies are installed: `npm install` in each directory
- Delete `node_modules` and `package-lock.json`, then reinstall
- Check Node.js version: `node --version` (should be 18+)

## Quick Start Script (All-in-One)

Create a `start.sh` file for quick setup:

```bash
#!/bin/bash

# Install dependencies
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
cd contracts/evm && npm install && cd ../..

# Start services
docker-compose up -d ganache mongo

# Wait for services to start
sleep 5

# Deploy contract
cd contracts/evm
npx truffle migrate --network ganache
cd ../..

# Seed data
cd backend
npm run seed
cd ..

# Start servers
echo "Starting backend..."
cd backend && npm run dev &
BACKEND_PID=$!

echo "Starting frontend..."
cd frontend && npm run dev &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Backend: http://localhost:3001"
echo "Frontend: http://localhost:5173"
```

## Next Steps

1. **Customize Authentication**: Implement real JWT authentication
2. **Add Wallet Integration**: Connect MetaMask for real wallet addresses
3. **Deploy to Testnet**: Deploy to Sepolia or Goerli testnet
4. **Add Tests**: Write comprehensive tests
5. **Production Setup**: Configure for production deployment

## Support

If you encounter issues:
1. Check the logs: `docker-compose logs`
2. Verify all services are running: `docker-compose ps`
3. Check environment variables: `cat .env`
4. Review the README.md for API documentation

