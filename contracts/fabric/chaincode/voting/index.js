'use strict';

const { Contract } = require('fabric-contract-api');

class VotingContract extends Contract {
    async createElection(ctx, id, name, start, end, candidatesJson, root) {
        const election = {
            docType: 'election',
            name,
            start: parseInt(start),
            end: parseInt(end),
            candidates: JSON.parse(candidatesJson),
            root,
            status: 'open',
            tally: {}
        };
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(election)));
        return JSON.stringify({ success: true, electionId: id });
    }

    async castVote(ctx, electionId, voterId, encryptedVote) {
        const election = await this._getElection(ctx, electionId);
        const now = Math.floor(ctx.stub.getDateTimestamp().getTime() / 1000);
        
        if (now < election.start || now >= election.end) {
            throw new Error('Voting closed');
        }

        if (election.status !== 'open') {
            throw new Error('Election not open');
        }

        const voteKey = `${electionId}_${voterId}`;
        const exists = await ctx.stub.getState(voteKey);
        if (exists && exists.length > 0) {
            throw new Error('Already voted');
        }

        const voteData = {
            voterId,
            timestamp: now,
            txId: ctx.stub.getTxID()
        };
        
        await ctx.stub.putState(voteKey, Buffer.from(JSON.stringify(voteData)));
        await ctx.stub.putPrivateData('votes_pdc', voteKey, Buffer.from(encryptedVote));

        return JSON.stringify({ txId: ctx.stub.getTxID(), success: true });
    }

    async closeElection(ctx, electionId) {
        const election = await this._getElection(ctx, electionId);
        const now = Math.floor(ctx.stub.getDateTimestamp().getTime() / 1000);
        
        if (now < election.end) {
            throw new Error('Election not ended');
        }

        election.status = 'closed';
        await ctx.stub.putState(electionId, Buffer.from(JSON.stringify(election)));
        
        return JSON.stringify({ success: true });
    }

    async getElection(ctx, electionId) {
        const election = await this._getElection(ctx, electionId);
        return JSON.stringify(election);
    }

    async getTally(ctx, electionId) {
        const election = await this._getElection(ctx, electionId);
        return JSON.stringify(election.tally || {});
    }

    async _getElection(ctx, id) {
        const data = await ctx.stub.getState(id);
        if (!data || data.length === 0) {
            throw new Error(`Election ${id} not found`);
        }
        return JSON.parse(data.toString());
    }

    async getAllElections(ctx) {
        const iterator = await ctx.stub.getStateByRange('', '');
        const elections = [];
        
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                const election = JSON.parse(res.value.value.toString());
                if (election.docType === 'election') {
                    elections.push(election);
                }
            }
            if (res.done) {
                await iterator.close();
                break;
            }
        }
        
        return JSON.stringify(elections);
    }
}

module.exports = VotingContract;

