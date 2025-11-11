# Quick Start Guide

## TL;DR - Get Running in 5 Minutes

### 1. Install Dependencies
```bash
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
cd contracts/evm && npm install && cd ../..
```

### 2. Create .env file
Create `.env` in root directory:
```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret-key-min-32-characters-long
MONGO_URI=mongodb://localhost:27017/voting
LEDGER_TYPE=EVM
EVM_RPC_URL=http://localhost:8545
EVM_PRIVATE_KEY=4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d
EVM_CONTRACT_ADDRESS=
VITE_API_URL=http://localhost:3001
```

### 3. Start Services
```bash
# Start Ganache and MongoDB
docker-compose up -d ganache mongo

# Wait 5 seconds for services to start
sleep 5
```

### 4. Deploy Contract
```bash
cd contracts/evm
npx truffle migrate --network ganache
# Copy the contract address from output
cd ../..
```

### 5. Update .env
Add the contract address to `.env`:
```env
EVM_CONTRACT_ADDRESS=0x... (paste address from step 4)
```

### 6. Seed Data
```bash
cd backend
npm run seed
cd ..
```

### 7. Start Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 8. Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## First Use

1. **Login as Admin** (click "Login as Admin")
2. **Upload Eligibility** (Admin Console → Upload Eligibility → Use `frontend/public/sample-eligibility.csv`)
3. **Create Election** (Admin Console → Create Election)
4. **Vote** (Voter Portal → Select Election → Vote)
5. **Close Election** (Admin Console → Close Election)
6. **Reveal Vote** (Voter Portal → Reveal Vote)
7. **View Tally** (Admin Console → View Election → Tally)

## Common Issues

**MongoDB connection error:**
```bash
docker-compose up -d mongo
```

**Ganache connection error:**
```bash
docker-compose up -d ganache
```

**Contract not deployed:**
```bash
cd contracts/evm
npx truffle migrate --network ganache --reset
```

**Port already in use:**
- Change ports in `.env` and `docker-compose.yml`
- Or stop the service using the port

## Full Documentation

See [SETUP.md](./SETUP.md) for detailed instructions.

