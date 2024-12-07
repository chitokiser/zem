//0x8F867ec8270fe15E236cD38E2F9Fe2E1B4d681Db
let address2 = {
    soccerAddr: "0xC0f3DCB3140DB01D8F264a3fd4349D073752743E" // Soccer contract address
};

let abi2 = {
    soccer: [
        "function play(uint8 _winnum,uint pay) public",
        "event Result(address indexed user, uint home, uint away)",
        "event Reward(address user, uint amount)",
        "event Loss(address user, uint amount)"
    ]
};

let fetchUserState = async () => {
    try {
        let userProvider = new ethers.providers.Web3Provider(window.ethereum, "any");
        await userProvider.send("eth_requestAccounts", []);
        let signer = userProvider.getSigner();
        let userAddress = await signer.getAddress();
        console.log("Connected user address:", userAddress);

        const provider = new ethers.providers.JsonRpcProvider('https://opbnb-mainnet-rpc.bnbchain.org');
        let soccerContract = new ethers.Contract(address2.soccerAddr, abi2.soccer, provider);

        // 초기 상태 표시
        document.getElementById("userState").innerText = `Your Reward: 0 BET | Your Loss: 0 BET`;

        // Result 이벤트 처리
        soccerContract.on("Result", (user, home, away) => {
            console.log("Match result:", home, away);
            let eventS2 = document.getElementById("eventS2");
            eventS2.innerHTML = "";
            for (let i = 1; i <= 6; i++) {
                setTimeout(() => {
                    eventS2.textContent = i;
                }, 500 * i);
            }
            setTimeout(() => {
                eventS2.innerHTML = `<span class="threed larger green">Home:${home}</span> - <span class="threed larger red">Away:${away}</span>`;
            }, 3500);
        });

        // Reward 이벤트 처리
        soccerContract.on("Reward", (user, amount) => {
            if (user.toLowerCase() === userAddress.toLowerCase()) {
                updateUserState(amount, "reward");
            }
        });

        // Loss 이벤트 처리
        soccerContract.on("Loss", (user, amount) => {
            if (user.toLowerCase() === userAddress.toLowerCase()) {
                updateUserState(amount, "loss");
            }
        });

    } catch (e) {
        console.error("Error fetching user state:", e);
        alert("Failed to load user state. Please check your connection.");
    }
};

let updateUserState = (() => {
    let totalReward = 0;
    let totalLoss = 0;

    return (amount, type) => {
        let amountFormatted = (amount / 1e18).toFixed(2);
        let stateElement = document.getElementById("userState");

        if (type === "reward") {
            totalReward += parseFloat(amountFormatted);
        } else if (type === "loss") {
            totalLoss += parseFloat(amountFormatted);
        }

        stateElement.innerText = `Your Reward: ${totalReward.toFixed(0)} BET | Your Loss: ${totalLoss.toFixed(0)} BET`;
    };
})();

fetchUserState();


  let executePlayFunction = async (argument) => {
    try {
      let userProvider = new ethers.providers.Web3Provider(window.ethereum, "any");
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
      await userProvider.send("eth_requestAccounts", []);
      let signer = userProvider.getSigner();
      let soccerContract = new ethers.Contract(address2.soccerAddr, abi2.soccer, signer);
      const selectedValue = parseInt(document.getElementById('bettingAmount').value, 10);
      if (isNaN(selectedValue) || selectedValue <= 0) {
        alert("Please enter a valid betting amount!");
        return;
      }
      await soccerContract.play(argument, selectedValue);
    } catch (e) {
      let errorMessage = e.data?.message || e.message || "Unknown error occurred";
      alert(errorMessage.replace("execution reverted: ", ""));
    }
  };

  document.getElementById("winButton").addEventListener("click", () => executePlayFunction(1));
  document.getElementById("drawButton").addEventListener("click", () => executePlayFunction(2));
  document.getElementById("loseButton").addEventListener("click", () => executePlayFunction(3));

