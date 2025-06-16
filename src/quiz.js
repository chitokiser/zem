// 스마트 컨트랙트 주소
let tresureAddr = {
    tresure: "0x8E31B316cf406BD681df35ae26D541094659f96c" //quizgame
};


let tresureAbi = {
    tresure: [
        "function answer(uint qrId, string memory _answer) external ",
        "function openbox1() public",
        "function openbox2() public",
        "function g3() public view returns(uint)",
        "function qid() public view returns(uint)",
        "function qs(uint _id) public view returns(uint,uint,bytes32,string,string)", 
        "function myinfo(address user) public view returns(uint256,uint256,uint256,uint256,uint256,uint256)",
    "event RewardClaimed(address indexed user, uint qrId, uint reward, string jewelType)",
    "event Wrong(string message)",
    "event JewelsCombined(address indexed user, uint amount, uint level)"
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

async function submitAnswer(qrId, userAnswer) {
  try {
    if (!window.ethereum) throw new Error("🦊 MetaMask를 설치해주세요.");

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(tresureAddr.tresure, tresureAbi.tresure, signer);

    const tx = await contract.answer(qrId, userAnswer);
    console.log("⏳ 트랜잭션 전송 중...", tx.hash);

    const receipt = await tx.wait();
    console.log("✅ 완료됨:", receipt.transactionHash);
    alert("✅ 정답이 제출되어 보상이 지급되었습니다.");
    
  } catch (err) {
    console.error("❌ 오류 발생:", err);

    // 오류 메시지를 가능한 세부적으로 추출
    const message =
      err?.error?.data?.message ||         // Ethers.js 버전 6 이상
      err?.data?.message ||                // 스마트 컨트랙트 revert 메시지
      err?.message ||                      // 일반 에러
      "알 수 없는 오류가 발생했습니다.";

    // revert 메시지에서 "execution reverted: " 제거
    const cleanedMessage = message.replace("execution reverted: ", "");

    alert("⚠️ 오류: " + cleanedMessage);
  }
}




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
                <p><strong>Reward:</strong> ${quiz[1]} Point</p>
                <p><strong>Question:</strong> ${quiz[4]}</p>
                <input type="text" id="answer-${quiz[0]}" placeholder="여기에 정답을 입력하신 후 제출하세요">
                <button onclick="handleSubmit(${quiz[0]})">제출하기</button>
            `;
            quizContainer.appendChild(quizCard);
        }
    } catch (error) {
        console.error("Error loading quizzes:", error);
    }
}


function handleSubmit(qrId) {
    const inputElement = document.getElementById(`answer-${qrId}`);
    if (!inputElement) {
        alert(`입력창을 찾을 수 없습니다: answer-${qrId}`);
        return;
    }

    const userAnswer = inputElement.value.trim();
    if (!userAnswer) {
        alert("정답을 입력해주세요.");
        return;
    }

    submitAnswer(qrId, userAnswer);
}



async function startEventMonitoring() {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const userAddress = (await signer.getAddress()).toLowerCase();

    const eventContract = new ethers.Contract(tresureAddr.tresure, tresureAbi.tresure, signer);
    const eventLog = document.getElementById("event-log");

    if (!eventLog) {
      console.warn("⚠️ #event-log 요소가 HTML에 없습니다.");
      return;
    }

    // ✅ 메시지 삽입 함수 (자동 제거 포함)
    const addEventMessage = (message, color = "black") => {
      const p = document.createElement("p");
      p.style.color = color;
      p.innerText = message;
      eventLog.prepend(p);

      // 10초 뒤 자동 삭제
      setTimeout(() => {
        p.remove();
      }, 10000);
    };

    // ✅ 이벤트 1: 보석 조합
    eventContract.on("JewelsCombined", (user, amount, level) => {
      if (user.toLowerCase() !== userAddress) return;
      const msg = `💎 [조합성공] ${amount} BUT 수령 (레벨 ${level})`;
      console.log(msg);
      addEventMessage(msg, "blue");
    });

    // ✅ 이벤트 2: 정답
    eventContract.on("RewardClaimed", (user, qrId, reward, jewelType) => {
      if (user.toLowerCase() !== userAddress) return;
      const msg = `🎯 [퀴즈 #${qrId}] ${jewelType} ${reward}개 획득!`;
      console.log(msg);
      addEventMessage(msg, "green");
    });

    // ✅ 이벤트 3: 오답
    eventContract.on("Wrong", (message) => {
      const msg = `❌ 오답 처리됨: ${message}`;
      console.log(msg);
      addEventMessage(msg, "red");
    });

    console.log("📡 이벤트 리스닝 활성화 완료");

  } catch (err) {
    console.error("❌ 이벤트 리스닝 실패:", err);
    alert("이벤트 연결 오류: " + (err.message || err));
  }
}





window.onload = () => {
    loadQuizzes();
    startEventMonitoring();
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
        const myinfo = await contract.myinfo(await signer.getAddress());

        // ✅ 보석별 정보 추출
        const opal = myinfo[0].toString();    // 오팔
        const pearl = myinfo[1].toString();   // 진주
        const garnet = myinfo[2].toString();  // 석류석
        const jade = myinfo[3].toString();    // 비취
        const zircon = myinfo[4].toString();  // 지르콘
        const crystal = myinfo[5].toString(); // 크리스탈

        // ✅ HTML 업데이트
        document.getElementById("Opal").innerHTML = opal;
        document.getElementById("Pearl").innerHTML = pearl;
        document.getElementById("Garnet").innerHTML = garnet;
        document.getElementById("Jade").innerHTML = jade;
        document.getElementById("Zircon").innerHTML = zircon;
        document.getElementById("Crystal").innerHTML = crystal;

    } catch (e) {
        alert(e.data?.message?.replace('execution reverted: ', '') || "Transaction failed");
    }
};
