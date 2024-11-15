let address2 = {
    soccerAddr: "0x8F867ec8270fe15E236cD38E2F9Fe2E1B4d681Db"  // dicefootball contract address
};
let abi2 = {
    soccer: [
        "function play(uint8 _winnum,uint pay) public",
        "function g1() public view virtual returns(uint256)",
        "function g2(address user) public view returns(uint)",
        "event result(uint num1,uint num2)",
        "event reward(uint amount)",
        "event loss(uint amount);"  // Added loss event
    ]
};

// Initialize the contract and set up event listeners
let Stopdate = async () => {
    const provider = new ethers.providers.JsonRpcProvider('https://opbnb-mainnet-rpc.bnbchain.org');
    let soccerContract = new ethers.Contract(address2.soccerAddr, abi2.soccer, provider);
    
    // Display the balance using g1() function
    let stvl = await soccerContract.g1();

    // Listen to reward event
    soccerContract.on('reward', (amount) => {
        console.log('레버리지된 금액:', amount);
        document.getElementById('eventS1').innerText = `GetMoney ${amount / 1e18} BET`;
    });

    // Listen to result event and show the match result
    soccerContract.on('result', (n1, n2) => {
        console.log('Match result:', n1, n2);

        let eventS2 = document.getElementById('eventS2');
        eventS2.innerHTML = ''; // Clear previous content

        // Show numbers 1 to 6 sequentially
        for (let i = 1; i <= 6; i++) {
            setTimeout(() => {
                eventS2.textContent = i;
            }, 500 * i); // Adjust the delay as needed
        }

        // After showing numbers, display the actual result
        setTimeout(() => {
            eventS2.innerHTML = `
                <span class="threed larger green">Home:${n1}</span> - <span class="threed larger red">Away:${n2}</span>
            `;
        }, 3500); // Adjust the delay as needed
    });

    // Listen to loss event and show the lost amount
    soccerContract.on('loss', (amount) => {
        console.log('손실된 금액:', amount);
        document.getElementById('eventS1').innerText = `Lost ${amount / 1e18} BET`;  // Display loss amount
    });
};

// Function to execute play with the selected argument
async function executePlayFunction(argument) {
    try {
        let userProvider = new ethers.providers.Web3Provider(window.ethereum, "any");

        // Set up network for opBNB
        await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
                chainId: "0xCC",
                rpcUrls: ["https://opbnb-mainnet-rpc.bnbchain.org"],
                chainName: "opBNB",
                nativeCurrency: {
                    name: "BNB",
                    symbol: "BNB",
                    decimals: 18
                },
                blockExplorerUrls: ["https://opbnbscan.com"]
            }]
        });

        // Request user accounts
        await userProvider.send("eth_requestAccounts", []);
        let signer = userProvider.getSigner();

        // Contract instance with signer
        let soccerContract = new ethers.Contract(address2.soccerAddr, abi2.soccer, signer);

        // Retrieve and parse the betting amount
        const selectedValue = parseInt(document.getElementById('bettingAmount').value, 10);

        // Call the play function with the provided arguments
        await soccerContract.play(argument, selectedValue);
    } catch (e) {
       
        alert(e.data.message.replace('execution reverted: ',''))
    }
}

// Add event listeners for buttons
document.getElementById("winButton").addEventListener("click", function() {
    executePlayFunction(1); // Call executePlayFunction with argument 1 (win)
});

document.getElementById("drawButton").addEventListener("click", function() {
    executePlayFunction(2); // Call executePlayFunction with argument 2 (draw)
});

document.getElementById("loseButton").addEventListener("click", function() {
    executePlayFunction(3); // Call executePlayFunction with argument 3 (lose)
});

Stopdate();

  