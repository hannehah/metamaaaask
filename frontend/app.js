let provider, signer, contract;

const contractAddress = "0xВАШ_АДРЕС_КОНТРАКТА";
const abi = [ /* ТВОЙ ABI БЕЗ BYTECODE */ ];

const connectBtn = document.getElementById("connectBtn");
const bidBtn = document.getElementById("bidBtn");

connectBtn.onclick = async () => {
    if (!window.ethereum) {
        alert("Установите MetaMask");
        return;
    }

    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();

    contract = new ethers.Contract(contractAddress, abi, signer);

    connectBtn.innerText = "✅ Подключено";
    loadAuction();
};

async function loadAuction() {
    document.getElementById("itemName").innerText = await contract.itemName();
    document.getElementById("description").innerText = await contract.description();

    updateData();
    setInterval(updateData, 5000);
}

async function updateData() {
    const highestBid = await contract.highestBid();
    const bidder = await contract.highestBidder();
    const endTime = await contract.endTime();

    document.getElementById("highestBid").innerText =
        ethers.utils.formatEther(highestBid) + " ETH";

    document.getElementById("highestBidder").innerText =
        bidder.slice(0, 6) + "..." + bidder.slice(-4);

    const now = Math.floor(Date.now() / 1000);
    const diff = endTime - now;

    document.getElementById("timeLeft").innerText =
        diff > 0 ? diff + " сек" : "Аукцион завершён";

    loadHistory();
}

async function loadHistory() {
    const list = document.getElementById("history");
    list.innerHTML = "";

    for (let i = 0; i < 10; i++) {
        try {
            const bid = await contract.bidHistory(i);
            const li = document.createElement("li");
            li.innerText =
                `${bid.bidder.slice(0,6)}… — ${ethers.utils.formatEther(bid.amount)} ETH`;
            list.appendChild(li);
        } catch {
            break;
        }
    }
}

bidBtn.onclick = async () => {
    const amount = document.getElementById("bidAmount").value;
    if (!amount) return;

    await contract.bid({
        value: ethers.utils.parseEther(amount)
    });
};
