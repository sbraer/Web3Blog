let account = null;
let contract = null;

const ABI = [{ "inputs": [{ "internalType": "uint8", "name": "number", "type": "uint8" }], "name": "enter", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [], "name": "getBalance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getNumbersUsed", "outputs": [{ "internalType": "uint8[]", "name": "", "type": "uint8[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "kill", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint8", "name": "winNumber", "type": "uint8" }], "name": "pickWinner", "outputs": [], "stateMutability": "nonpayable", "type": "function" }];
const ADDRESS = '0x2890C152F181a05CE31cBaC97224c731263783D0'; // <- Change it

(async () => {
    try {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);

            window.ethereum.on('accountsChanged', function (accounts) {
                checkAndDraw();
            });

            window.ethereum.on('networkChanged', function (networkId) {
                checkAndDraw();
            });

            await checkAndDraw();
        }
        else {
            alert("Metamask is not active");
        }
    }
    catch (err) {
        alert("Generic error: " + err);
    }
})();

async function checkAndDraw() {
    deleteGrid();
    const networkId = await web3.eth.net.getNetworkType();
    if (networkId != "private") {
        return alert("From metamask select private network");
    }

    getContractInfo();
    await makeGrid();
    await getWalletAddress();
}

function getContractInfo() {
    contract = new web3.eth.Contract(ABI, ADDRESS);
    console.log(contract);
}

async function getWalletAddress() {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    account = accounts[0];
    document.getElementById('walletAddress').textContent = account;
}

function deleteGrid() {
    const grid = document.getElementById('grid9');
    grid.innerHTML = '';
}

async function makeGrid() {
    if (contract) {
        const numbers = await contract.methods.getNumbersUsed().call();
        console.log(`Numbers from blockchain: ${numbers} ${numbers.length}`);

        const grid = document.getElementById('grid9');
        for (let i = 1; i < 10; i++) {
            const box = document.createElement('div');
            box.id = "box" + i;
            box.classList.add("box");
            if (numbers.includes(i.toString())) {
                console.log("Included");
                box.classList.add("box-selected");
            }
            else {
                box.onclick = function (event) {
                    const number = i;
                    buyTicket(number, event);
                }
            }

            box.innerText = i;
            grid.appendChild(box);
        }
    }
}

function buyTicket(number, event) {
    console.log(`buyTicket: ${number}`);

    (async () => {
        try {
            const reply = await contract.methods.enter(number.toString()).send({ from: account, value: 1000000000000000000 });
            console.log(reply);

            const box = document.getElementById("box" + number);
            box.classList.add("box-selected");
            box.replaceWith(box.cloneNode(true));
        }
        catch (err) {
            const indexJson = err.message.indexOf("{");
            const indexJsonLast = err.message.lastIndexOf("}");
            if (indexJson == -1 || indexJsonLast == -1) {
                return alert("Generic error from Smart contract: " + err.message);
            }

            const messageJsonTxt = err.message.substring(indexJson, indexJsonLast + 1);
            const messageJson = JSON.parse(messageJsonTxt);
            alert("Error: " + messageJson.value.data.message);
            return;
        }
    })();
}