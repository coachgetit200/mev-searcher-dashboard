// enhanced-logs.js - Realistic MEV simulation
export class MEVSimulator {
    constructor() {
        this.protocols = [
            'Uniswap V3', 'Curve Finance', 'Balancer', 'SushiSwap', 
            'Aave', 'Compound', 'MakerDAO', 'Synthetix'
        ];
        this.tokens = ['WETH', 'DAI', 'USDC', 'WBTC', 'LINK'];
        this.pools = ['ETH/USDC', 'WBTC/WETH', 'DAI/USDC', 'LINK/WETH'];
        this.history = [];
        this.logContainer = null;
    }
    
    getRandomProtocol() {
        return this.protocols[Math.floor(Math.random() * this.protocols.length)];
    }
    
    getRandomToken() {
        return this.tokens[Math.floor(Math.random() * this.tokens.length)];
    }
    
    getRandomPool() {
        return this.pools[Math.floor(Math.random() * this.pools.length)];
    }
    
    generateTransaction() {
        const types = ['Arbitrage', 'Liquidation', 'Sandwich', 'Flash Loan'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        const profit = (Math.random() * 0.8 + 0.05).toFixed(4);
        const gasUsed = Math.floor(Math.random() * 200000 + 50000);
        const timestamp = new Date().toLocaleTimeString();
        
        let details = '';
        switch(type) {
            case 'Arbitrage':
                details = `Arbitrage opportunity found in ${this.getRandomPool()} pool`;
                break;
            case 'Liquidation':
                details = `Liquidated ${this.getRandomToken()} position for ${profit} ETH profit`;
                break;
            case 'Sandwich':
                details = `Sandwich attack executed on large trade`;
                break;
            case 'Flash Loan':
                details = `Flash loan arbitrage completed`;
                break;
        }
        
        return {
            type,
            profit: parseFloat(profit),
            gasUsed,
            timestamp,
            details,
            protocol: this.getRandomProtocol()
        };
    }
    
    createLogEntry(tx) {
        const entry = document.createElement('div');
        entry.className = `log-entry ${tx.profit > 0.3 ? 'success' : 'warning'}`;
        
        const profitColor = tx.profit > 0.5 ? '#10b981' : '#f59e0b';
        
        entry.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span><strong>${tx.timestamp}</strong> - ${tx.type}</span>
                <span style="color: ${profitColor}; font-weight: bold;">${tx.profit} ETH</span>
            </div>
            <div style="font-size: 0.85rem; color: #94a3b8; margin-top: 5px;">
                ${tx.details} via ${tx.protocol} | Gas: ${tx.gasUsed.toLocaleString()}
            </div>
        `;
        
        return entry;
    }
    
    startSimulation(containerId) {
        this.logContainer = document.getElementById(containerId);
        if (!this.logContainer) return;
        
        // Initial burst of logs
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const tx = this.generateTransaction();
                const entry = this.createLogEntry(tx);
                this.logContainer.insertBefore(entry, this.logContainer.firstChild);
            }, i * 300);
        }
        
        // Continuous simulation
        setInterval(() => {
            const tx = this.generateTransaction();
            const entry = this.createLogEntry(tx);
            
            this.logContainer.insertBefore(entry, this.logContainer.firstChild);
            
            // Limit log entries
            if (this.logContainer.children.length > 20) {
                this.logContainer.removeChild(this.logContainer.lastChild);
            }
        }, 3000 + Math.random() * 2000);
    }
}
