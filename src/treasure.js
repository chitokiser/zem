// 스마트 컨트랙트 주소
let tresureAddr = {
    tresure: "0x16107A53392e0530bF60F441b24793BF90525a2F" //동허이보물찾기
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
        " event RewardClaimed(address indexed user, uint qrId, uint amount, string jewel)",
        " event open(address indexed useer, uint rewardAmount, uint level)"
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





async function claimTreasure(qrId) {
    try {
        // 🔌 지갑 연결 및 네트워크 전환
        const userProvider = new ethers.providers.Web3Provider(window.ethereum, "any");
        await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
                chainId: "0xCC", // opBNB 체인 ID (16진수)
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

        // 🧠 쓰기 가능한 컨트랙트 객체 생성
        const contract = new ethers.Contract(
            tresureAddr.tresure,
            tresureAbi.tresure,
            signer
        );

        // ⛳ 함수 실행
        const tx = await contract.claimTreasure(qrId);
        alert("⏳ 보물 클레임 요청 전송됨! 블록 확인 중...");

        await tx.wait();
        alert("🎉 보물을 성공적으로 클레임했습니다!");
    } catch (error) {
        console.error("Claim Treasure Error:", error);
        alert(error?.data?.message?.replace("execution reverted: ", "") || "보물 클레임 실패 ❌");
    }
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
