// 스마트 컨트랙트 주소
let tresureAddr = {
    tresure: "0xFEF24f08371C4027007E29E86835eCCEB15685C9"
};


let tresureAbi = {
    tresure: [
        "function withdraw() public",
        "function member() public",
        "function openbox(uint _id, string memory _answer) public",
        "function g3() public view returns(uint)",
        "function qid() public view returns(uint)",
        "function qs(uint _id) public view returns(uint,uint,bytes32,string,string)", 
        "function myinfo(address user) public view returns(uint256,uint256,uint256,bool)",
        "event reward(uint amount)",
        "event wrong(string message)"
    ]
};

// 📌 Ethers.js Provider
const provider = new ethers.providers.JsonRpcProvider("https://opbnb-rpc.publicnode.com");

// 스마트 컨트랙트 객체 생성 (Ethers.js 사용)
const contract = new ethers.Contract(tresureAddr.tresure, tresureAbi.tresure, provider);

// 🔄 g3() 및 qid() 값을 가져와 웹페이지 업데이트
let topSync = async () => {
    try {
        let ig3 = await contract.g3();  // 전체 발행 부동산 수
        let iqid = await contract.qid();  // 전체 퀴즈 개수

        document.getElementById("Q3").innerHTML = ig3.toString();
        document.getElementById("Qid").innerHTML = iqid.toString();
    } catch (error) {
        console.error("Error fetching contract data:", error);
    }
};

// 실행
topSync();

async function loadQuizzes() {
    try {
        const totalQuizzes = await contract.qid(); // 전체 퀴즈 개수 가져오기
        const quizContainer = document.getElementById("quiz-container");
        quizContainer.innerHTML = ""; // 기존 내용 초기화

        for (let i = 0; i < totalQuizzes; i++) {
            const quiz = await contract.qs(i);

            const quizCard = document.createElement("div");
            quizCard.classList.add("quiz-card");
            quizCard.innerHTML = `
                <p><strong>ID:</strong> #${quiz[0]}</p>
                <p><strong>Reward:</strong> ${quiz[1]} BUT</p>
                <p><strong>Question:</strong> ${quiz[4]}</p>
                <input type="text" id="answer-${quiz[0]}" placeholder="정답입력">
                <button onclick="submitAnswer(${quiz[0]})">제출하기</button>
            `;
            quizContainer.appendChild(quizCard);
        }
    } catch (error) {
        console.error("Error loading quizzes:", error);
    }
}

async function submitAnswer(quizId) {
    try {
        const userProvider = new ethers.providers.Web3Provider(window.ethereum, "any");
        await userProvider.send("eth_requestAccounts", []); // 지갑 연결
        const signer = userProvider.getSigner();
        const contract = new ethers.Contract(tresureAddr.tresure, tresureAbi.tresure, signer);

        const answerInput = document.getElementById(`answer-${quizId}`);
        const answer = answerInput.value.trim();

        if (answer === "") {
            alert("Please enter an answer before submitting.");
            return;
        }

        const tx = await contract.openbox(quizId, answer);
        alert("Transaction submitted! Waiting for confirmation...");

        await tx.wait(); // 트랜잭션 확인 대기
        alert("Answer submitted successfully! ✅");

        answerInput.value = ""; // 입력 필드 초기화
         // ✅ 화면 새로고침 (정답 제출 후)
         setTimeout(() => {
            location.reload();
        }, 1500); // 1.5초 후 새로고침 (트랜잭션 확인 시간 고려)
    } catch (error) {
        console.error("Error submitting answer:", error);
        alert(error.data?.message?.replace('execution reverted: ', '') || "Transaction failed ❌");
    }
}
 // ✅ 이벤트 리스너 추가 (실시간 모니터링)
 function startEventMonitoring() {
    const eventLog = document.getElementById("event-log");

    contract.on("reward", (amount) => {
        const message = `🎉 축하합니다.정답입니다: ${amount} points!`;
        console.log(message);
        eventLog.innerHTML = `<p style="color:green;">${message}</p>` + eventLog.innerHTML;
    });

    contract.on("wrong", (message) => {
        const errorMessage = `❌ 틀렸습니다: ${message}`;
        console.log(errorMessage);
        eventLog.innerHTML = `<p style="color:red;">${errorMessage}</p>` + eventLog.innerHTML;
    });

    console.log("🔍 Listening for events...");
}


window.onload = () => {
    loadQuizzes();
    startEventMonitoring();
};


let Join = async () => {
    try {
        const userProvider = new ethers.providers.Web3Provider(window.ethereum, "any");
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
        const signer = userProvider.getSigner();

        // 스마트 컨트랙트 객체 생성 (Ethers.js 사용)
        const contract = new ethers.Contract(tresureAddr.tresure, tresureAbi.tresure, signer);
        await contract.member(); 

        alert("Membership joined successfully!");
    } catch(e) {
        alert(e.data.message.replace('execution reverted: ',''))
    }
};

let Withdraw = async () => {
    try {
        const userProvider = new ethers.providers.Web3Provider(window.ethereum, "any");
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
        const signer = userProvider.getSigner();

        // 스마트 컨트랙트 객체 생성 (Ethers.js 사용)
        const contract = new ethers.Contract(tresureAddr.tresure, tresureAbi.tresure, signer);
        await contract.withdraw(); 

        alert("Membership joined successfully!");
    } catch(e) {
        alert(e.data.message.replace('execution reverted: ',''))
    }
};

// ✅ 사용자 상태 조회 (myinfo)
let Mystatus = async () => {
    try {
        const userProvider = new ethers.providers.Web3Provider(window.ethereum, "any");
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

        const signer = userProvider.getSigner();
        const contract = new ethers.Contract(tresureAddr.tresure, tresureAbi.tresure, signer);
        let myinfo = await contract.myinfo(await signer.getAddress());

        // 📌 올바른 인덱스 사용
        let mytotal = myinfo[0].toString(); // 맞춘 문제 수
        let mypoint = myinfo[1].toString(); // BUT 교환 가능 개수
        let mytiket = myinfo[2].toString(); // 참가권
        let myok = Boolean(myinfo[3]) ? "✅ Yes" : "❌ No"; // 참가 가능 여부 (수정됨!)

        // ✅ 올바른 ID 값 업데이트
        document.getElementById("Mtotal").innerHTML = mytotal;
        document.getElementById("Mpoint").innerHTML = mypoint;
        document.getElementById("Mtiket").innerHTML = mytiket;
        document.getElementById("Mok").innerHTML = myok;

    }  catch(e) {
        alert(e.data?.message?.replace('execution reverted: ', '') || "Transaction failed");
    }
};
