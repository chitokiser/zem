
    let tresureAddr = {
      tresure: "0x16107A53392e0530bF60F441b24793BF90525a2F"
    };

    let tresureAbi = {
      tresure: [
        "function claimTreasure(uint qrId) external",
        "function openbox1() public",
        "function openbox2() public",
        "function getMyTreasure(address user) external view returns (uint[] memory)",
        "function g3() public view returns(uint)",
        "function butAmount() public view returns(uint)",
        "function myinfo(address user) public view returns(uint256,uint256,uint256,uint256,uint256,uint256)",
        "event RewardClaimed(address indexed user, uint qrId, uint amount, string jewel)",
        "event open(address indexed useer, uint rewardAmount, uint level)"
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
        let ig4 = await contract.butAmount();  // 보상
     
        document.getElementById("Q3").innerHTML = ig3.toString();
        document.getElementById("Q4").innerHTML = ig4.toString();
        document.getElementById("Q5").innerHTML = (ig4 * 2).toString();
    } catch (error) {
        console.error("Error fetching contract data:", error);
    }
};

// 실행
topSync();

async function getMyTreasureList() {
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const userAddress = await signer.getAddress();

        const contract = new ethers.Contract(
            tresureAddr.tresure,
            tresureAbi.tresure,
            provider
        );

        const treasureList = await contract.getMyTreasure(userAddress);
        
        console.log("보유한 보물 ID 목록:", treasureList);

        // 📦 HTML에 표시
        const listElem = document.getElementById("myTreasureList");
        listElem.innerHTML = treasureList.length === 0 
          ? "보유한 보물이 없습니다." 
          : treasureList.map(id => `<li>🧩 보물 ID: ${id}</li>`).join("");

    } catch (err) {
        console.error("보물 조회 실패:", err);
        alert("보물 조회 중 오류가 발생했습니다.");
    }
}


    function getJewelIcon(jewelType) {
      const map = {
        ruby: "❤️ 루비",
        sapp: "🟦 사파이어",
        emer: "🟢 에메랄드",
        topa: "🟡 토파즈",
        dia: "⚪다이아",
        gold: "🪙 골드바"
      };
      return map[jewelType.toLowerCase()] || `🔠 ${jewelType}`;
    }

    function listenToRewardEvent() {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const contract = new ethers.Contract(tresureAddr.tresure, tresureAbi.tresure, signer);
      contract.removeAllListeners("RewardClaimed");

      contract.on("RewardClaimed", (user, qrId, amount, jewel) => {
        const resultBox = document.getElementById("treasure-result");
        const sound = document.getElementById("reward-sound");

        resultBox.innerHTML = `
          <div class="p-3 border rounded bg-light">
            🏱 ${getJewelIcon(jewel)} <strong>${amount}</strong> 개 획득했습니다!
          </div>
        `;

        sound.currentTime = 0;
        sound.play().catch(e => console.warn("Sound play error:", e));

        setTimeout(() => {
          resultBox.innerHTML = "";
        }, 6000);
      });
    }

    async function claimTreasure(qrId) {
      try {
        const userProvider = new ethers.providers.Web3Provider(window.ethereum, "any");
        await userProvider.send("eth_requestAccounts", []);

        const signer = userProvider.getSigner();
        const contract = new ethers.Contract(tresureAddr.tresure, tresureAbi.tresure, signer);

        const tx = await contract.claimTreasure(Number(qrId));
        alert("⭕️ 보물 클레임 지시됨");
        await tx.wait();
        alert("🎉 클레임 성공!");
      } catch (error) {
        console.error("claimTreasure Error:", error);
        alert(error?.data?.message?.replace("execution reverted: ", "") || "보물 클레임 실패");
      }
    }

    async function Openbox1() {
    try {
        // 1. 지갑 연결 및 네트워크 설정
        const userProvider = new ethers.providers.Web3Provider(window.ethereum, "any");

        await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
                chainId: "0xCC", // opBNB
                rpcUrls: ["https://opbnb-mainnet-rpc.bnbchain.org"],
                chainName: "opBNB",
                nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
                blockExplorerUrls: ["https://opbnbscan.com"]
            }]
        });

        await userProvider.send("eth_requestAccounts", []);
        const signer = userProvider.getSigner();

        // 2. 컨트랙트 연결
        const contract = new ethers.Contract(
            tresureAddr.tresure,
            tresureAbi.tresure,
            signer
        );

        // 3. openbox1() 호출
        const tx = await contract.openbox1();
        alert("📦 보물 교환 요청 전송됨! 블록 확인 중...");
        await tx.wait();

        alert("🎉 보물을 성공적으로 교환했습니다!");
        Mystatus(); // 보유 보석 수 다시 조회

    } catch (error) {
        console.error("openbox1() Error:", error);
        alert(error?.data?.message?.replace("execution reverted: ", "") || "보물 교환 실패 ❌");
    }
}


async function Openbox2() {
    try {
        // 1. 지갑 연결 및 네트워크 설정
        const userProvider = new ethers.providers.Web3Provider(window.ethereum, "any");

        await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
                chainId: "0xCC", // opBNB
                rpcUrls: ["https://opbnb-mainnet-rpc.bnbchain.org"],
                chainName: "opBNB",
                nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
                blockExplorerUrls: ["https://opbnbscan.com"]
            }]
        });

        await userProvider.send("eth_requestAccounts", []);
        const signer = userProvider.getSigner();

        // 2. 컨트랙트 연결
        const contract = new ethers.Contract(
            tresureAddr.tresure,
            tresureAbi.tresure,
            signer
        );

        // 3. openbox1() 호출
        const tx = await contract.openbox2();
        alert("📦 보물 교환 요청 전송됨! 블록 확인 중...");
        await tx.wait();

        alert("🎉 보물을 성공적으로 교환했습니다!");
        Mystatus(); // 보유 보석 수 다시 조회

    } catch (error) {
        console.error("openbox2() Error:", error);
        alert(error?.data?.message?.replace("execution reverted: ", "") || "보물 교환 실패 ❌");
    }
}


    function startQrScanner() {
      const qrScanner = new Html5Qrcode("qr-reader");
      qrScanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        qrMessage => {
          document.getElementById("qrIdInput").value = qrMessage;
          qrScanner.stop();
          document.getElementById("qr-reader").innerHTML = "";
        },
        error => console.warn("QR Scan Error:", error)
      ).catch(err => {
        console.error("Camera Error:", err);
        alert("🚫 카메라 여부를 확인하세요");
      });
    }

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
        let myluby = myinfo[0].toString(); // 루비
        let mysapp = myinfo[1].toString(); // 사파이어
        let myemer = myinfo[2].toString(); // 에머랄드
        let mytopa = myinfo[3].toString(); // 토파즈
        let mydia = myinfo[4].toString(); // 토파즈
         let mygold = myinfo[5].toString(); // 토파즈

        // ✅ 올바른 ID 값 업데이트
        document.getElementById("Luby").innerHTML = myluby;
        document.getElementById("Sapp").innerHTML = mysapp;
        document.getElementById("Emer").innerHTML = myemer;
        document.getElementById("Topa").innerHTML = mytopa;
         document.getElementById("Dia").innerHTML = mydia;
        document.getElementById("Gold").innerHTML = mygold;

    }  catch(e) {
        alert(e.data?.message?.replace('execution reverted: ', '') || "Transaction failed");
    }
};

    window.addEventListener("load", () => {
      listenToRewardEvent();
    });

