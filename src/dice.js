let address2 = {
    soccerAddr: "0x8F867ec8270fe15E236cD38E2F9Fe2E1B4d681Db"  // dicefootball contract address
};

let abi2 = {
    soccer: [
        "function play(uint8 _winnum,uint pay) public",
        "function g1() public view virtual returns(uint256)",
        "function g2(address user) public view returns(uint)",
        "event result(uint num1,uint num2)",
        "event reward(address user, uint amount)",  // 수정된 reward 이벤트
        "event loss(address user, uint amount);"  // 수정된 loss 이벤트
    ]
};

// 유저 상태를 화면에 출력하는 함수
let updateUserState = (userAddress, amount, eventType) => {
    let eventS1 = document.getElementById('eventS1');
    if (eventS1) {
        if (eventType === 'reward') {
            eventS1.innerText = `GetMoney ${amount / 1e18} BET`;
        } else if (eventType === 'loss') {
            eventS1.innerText = `Lost ${amount / 1e18} BET`;
        }
    } else {
        console.error("Element with id 'eventS1' not found");
    }
};

// 특정 유저의 상태를 가져오는 함수
let fetchUserState = async () => {
    try {
        // 사용자 지갑 연결
        let userProvider = new ethers.providers.Web3Provider(window.ethereum, "any");
        await userProvider.send("eth_requestAccounts", []); // 사용자 승인을 요청
        let signer = userProvider.getSigner(); // 현재 사용자 지갑 서명자
        let userAddress = await signer.getAddress(); // 사용자 주소
        console.log("Connected user address:", userAddress);

        // 컨트랙트 인스턴스 생성
        const provider = new ethers.providers.JsonRpcProvider('https://opbnb-mainnet-rpc.bnbchain.org');
        let soccerContract = new ethers.Contract(address2.soccerAddr, abi2.soccer, provider);

        // 1. 글로벌 상태 가져오기 (예: g1 함수)
        let stvl = await soccerContract.g1();
        let globalStateElement = document.getElementById("globalState");
        if (globalStateElement) {
            globalStateElement.innerText = `Global STVL: ${stvl / 1e18} BET`;
        } else {
            console.error("Element with id 'globalState' not found");
        }

        // 2. 사용자별 상태 가져오기 (예: g2 함수)
        let userReward = await soccerContract.g2(userAddress);
        let userStateElement = document.getElementById("userState");
        if (userStateElement) {
            userStateElement.innerText = `Your Reward: ${userReward / 1e18} BET`;
        } else {
            console.error("Element with id 'userState' not found");
        }

        // 3. 결과 이벤트 처리 (전역적으로 표시 가능)
        soccerContract.on('result', (n1, n2) => {
            console.log('Match result:', n1, n2); // 로그 추가
            let eventS2 = document.getElementById('eventS2');
            eventS2.innerHTML = ''; // 기존 내용 삭제

            // 숫자 1부터 6까지 순차적으로 표시
            for (let i = 1; i <= 6; i++) {
                setTimeout(() => {
                    eventS2.textContent = i;
                }, 500 * i); // 각 숫자 0.5초 간격 표시
            }

            // 결과 표시
            setTimeout(() => {
                eventS2.innerHTML = `
                    <span class="threed larger green">Home:${n1}</span> - <span class="threed larger red">Away:${n2}</span>
                `;
            }, 3500);
        });

        // 보상 이벤트 리스너 추가
        soccerContract.on('reward', async (user, amount) => { // async로 변경
            console.log('Reward event received:', user, amount); // 로그 추가
            if (user.toLowerCase() === userAddress.toLowerCase()) {
                console.log('레버리지된 금액:', amount);
                updateUserState(user, amount, 'reward');
            }
        });

        // 손실 이벤트 리스너 추가
        soccerContract.on('loss', async (user, amount) => { // async로 변경
            console.log('Loss event received:', user, amount); // 로그 추가
            if (user.toLowerCase() === userAddress.toLowerCase()) {
                console.log('손실된 금액:', amount);
                updateUserState(user, amount, 'loss');
            }
        });

    } catch (e) {
        console.error("Error fetching user state:", e);
        alert("Failed to load user state. Please check your connection.");
    }
};

let executePlayFunction = async (argument) => {
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
        alert(e.data.message.replace('execution reverted: ', ''))
    }
};

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

// Initialize the user state
fetchUserState();
