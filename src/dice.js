// 게임머니 처리는 topinfo에서 처리됨
let address2 = {
    soccerAddr: "0x3C811447f6e91cf810f8eDECeB18e7E3Fb4625dE" // ZEM Soccer contract address
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
        let soccerContract = new ethers.Contract(address2.soccerAddr, abi2.soccer, signer);

        // 초기 상태 표시
        document.getElementById("userState").innerText = `Your Reward: 0 BET | Your Loss: 0 BET`;

        // Result 이벤트 처리
        soccerContract.on("Result", (user, home, away) => {
            console.log("Match result:", home, away);

            animateDiceImage("homeDice", home);
            animateDiceImage("awayDice", away);

            let eventS2 = document.getElementById("eventS2");
            eventS2.innerHTML = `<span class="threed larger green">Home:${home}</span> - <span class="threed larger red">Away:${away}</span>`;
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
  handleContractError(e, "유저 정보를 불러올 수 없습니다. 연결을 확인하세요.");
}
};

function handleContractError(e, fallback = "문제가 발생했습니다. 다시 시도해주세요.") {
  let msg = fallback;

  if (e?.error?.data?.message) {
    msg = e.error.data.message.replace("execution reverted: ", "");
  } else if (e?.data?.message) {
    msg = e.data.message.replace("execution reverted: ", "");
  } else if (e?.message?.includes("execution reverted:")) {
    msg = e.message.split("execution reverted:")[1].trim();
  } else if (e?.message) {
    msg = e.message;
  }

  console.error("📛 스마트컨트랙트 오류:", e);
  alert(msg);
}


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

// play() 실행
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
  handleContractError(e, "유저 정보를 불러올 수 없습니다. 연결을 확인하세요.");
}
};

function animateDiceImage(elementId, result) {
    const diceImg = document.getElementById(elementId);
    const src = `/images/dice/dice${result}.png`;

    // 🔊 주사위 사운드 재생
    try {
        diceSound.currentTime = 0;
        diceSound.play();
    } catch (e) {
        console.warn("🔇 사운드 재생 실패:", e.message);
    }

    // 애니메이션 클래스 재적용
    diceImg.classList.remove("roll");
    void diceImg.offsetWidth;
    diceImg.classList.add("roll");

    // 이미지 교체
    setTimeout(() => {
        diceImg.src = src;
    }, 300);
}

// 버튼 연결
document.getElementById("winButton").addEventListener("click", () => executePlayFunction(1));
document.getElementById("drawButton").addEventListener("click", () => executePlayFunction(2));
document.getElementById("loseButton").addEventListener("click", () => executePlayFunction(3));

// 전역 선언
const diceSound = new Audio('/sounds/dice-roll.mp3');
diceSound.volume = 0.6; // 볼륨 조절 (0~1)
