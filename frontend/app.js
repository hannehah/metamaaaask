let provider, signer, contract;

const contractAddress = "0xf9697C1d29dc84d1236Bd559131f486B9344541f"; 
const abi = [
  {
    "type": "constructor",
    "inputs": [
      { "name": "_name", "type": "string", "internalType": "string" },
      { "name": "_description", "type": "string", "internalType": "string" },
      { "name": "_durationSeconds", "type": "uint256", "internalType": "uint256" }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "auctionEnd",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "bid",
    "inputs": [],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "bidHistory",
    "inputs": [
      { "name": "", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [
      { "name": "bidder", "type": "address", "internalType": "address" },
      { "name": "amount", "type": "uint256", "internalType": "uint256" },
      { "name": "timestamp", "type": "uint256", "internalType": "uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "description",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "string", "internalType": "string" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "endTime",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "uint256", "internalType": "uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "highestBid",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "uint256", "internalType": "uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "highestBidder",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "address", "internalType": "address" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "itemName",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "string", "internalType": "string" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "owner",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "address", "internalType": "address" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "pendingReturns",
    "inputs": [
      { "name": "", "type": "address", "internalType": "address" }
    ],
    "outputs": [
      { "name": "", "type": "uint256", "internalType": "uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "withdrawPending",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  }
];

const connectBtn = document.getElementById("connectBtn");
const bidBtn = document.getElementById("bidBtn");

bidBtn.disabled = true;
bidBtn.innerText = "Подключите кошелёк";

connectBtn.onclick = async () => {
    if (!window.ethereum) {
        alert("Установите MetaMask или другой Web3-кошелёк!");
        return;
    }

    try {
        connectBtn.disabled = true;
        connectBtn.innerText = "Подключение...";

        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();

        contract = new ethers.Contract(contractAddress, abi, signer);

        connectBtn.innerText = "✅ Подключено";
        connectBtn.disabled = true;

        bidBtn.disabled = false;
        bidBtn.innerText = "Сделать ставку";

        await loadAuction();
    } catch (err) {
        alert("Ошибка подключения: " + (err.message || err));
        connectBtn.disabled = false;
        connectBtn.innerText = "Подключить кошелёк";
    }
};

async function loadAuction() {
    try {
        document.getElementById("itemName").innerText = await contract.itemName();
        document.getElementById("description").innerText = await contract.description();

        await updateData();
        setInterval(updateData, 5000); // обновление каждые 5 сек
    } catch (err) {
        console.error("Ошибка загрузки аукциона:", err);
    }
}

async function updateData() {
    try {
        const [highestBid, bidder, endTime] = await Promise.all([
            contract.highestBid(),
            contract.highestBidder(),
            contract.endTime()
        ]);

        document.getElementById("highestBid").innerText =
            ethers.utils.formatEther(highestBid) + " ETH";

        const zeroAddress = "0x0000000000000000000000000000000000000000";
        document.getElementById("highestBidder").innerText =
            bidder === zeroAddress
                ? "—"
                : bidder.slice(0, 6) + "..." + bidder.slice(-4);

        const now = Math.floor(Date.now() / 1000);
        const diff = Number(endTime) - now;

        const timeLeftEl = document.getElementById("timeLeft");
        if (diff > 0) {
            timeLeftEl.innerText = diff + " сек";
            bidBtn.disabled = false;
            bidBtn.innerText = "Сделать ставку";
        } else {
            timeLeftEl.innerText = "Аукцион завершён";
            bidBtn.disabled = true;
            bidBtn.innerText = "Аукцион завершён";
        }

        await loadHistory();
    } catch (err) {
        console.error("Ошибка обновления данных:", err);
    }
}

async function loadHistory() {
    const list = document.getElementById("history");
    list.innerHTML = "<li>Загрузка...</li>";

    const items = [];
    let index = 0;

    while (true) {
        try {
            const bid = await contract.bidHistory(index);
            
            const zeroAddress = "0x0000000000000000000000000000000000000000";
            if (bid.bidder === zeroAddress && bid.amount.eq(0)) {
                break;
            }

            items.pu
