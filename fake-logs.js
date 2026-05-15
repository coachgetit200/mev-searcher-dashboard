// fake-logs.js
const fakeLogs = [
    "Block 17834291: 0.24 ETH profit from Uniswap V3",
    "Block 17834292: 0.18 ETH profit from SushiSwap",
    "Block 17834293: 0.31 ETH profit from Curve",
    "Block 17834294: 0.15 ETH profit from Balancer",
    "Block 17834295: 0.22 ETH profit from Aave",
    "Block 17834296: 0.19 ETH profit from Uniswap V2",
    "Block 17834297: 0.28 ETH profit from KyberSwap",
    "Block 17834298: 0.16 ETH profit from 1inch"
];

function startFakeLogs() {
    const logContainer = document.getElementById('log-container');
    let i = 0;
    
    setInterval(() => {
        if (i < fakeLogs.length) {
            const logElement = document.createElement('p');
            logElement.textContent = fakeLogs[i];
            logElement.style.color = '#00ff00';
            logElement.style.fontFamily = 'monospace';
            logElement.style.margin = '5px 0';
            logContainer.appendChild(logElement);
            logContainer.scrollTop = logContainer.scrollHeight;
            i++;
        }
    }, 3000);
}

// Start fake logs when page loads
window.addEventListener('load', startFakeLogs);