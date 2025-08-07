let metaddr = {  
    metmarket: "0xD30CD21B8bE226123d5E1B57c7E276aF4efa5Db0" //zum mt5_free

  };
  
  let metabi = {
  
    metmarket: [
      "function registration(uint256 _metanum,string memory  _invest)public",
        "function exit(uint256 _mid)public",
        "function exitcancell(uint256 _mid)public",
        "function mid() public view returns (uint256)",
        "function fee() public view returns (uint256)",
        "function audit(uint256 _mid,uint256 _cutreward)public",
       "function  withdrw(uint256 _mid)public",
       "function g1() public view virtual returns(uint256)",
       "function metainfo(uint256 _mid) public view virtual returns(uint256,uint256,uint256,string,uint256,uint256,address,uint8)",
      
      ],
      
  };
  
  let topSync = async () => {
  
    let provider = new ethers.providers.JsonRpcProvider('https://opbnb-mainnet-rpc.bnbchain.org');
    let meta5Contract = new ethers.Contract(metaddr.metmarket, metabi.metmarket, provider);
  
    
  
    let ibal = await meta5Contract.g1();  //계약보유ZUM
    let ifee = await meta5Contract.fee();  //계약보유BET
    document.getElementById("Ibal").innerHTML= (ibal);  // 

    }
  
  
  // ABI 함수 호출하여 정보 가져오는 함수
  async function getMetaInfoByNum(contract, _num) {
  try {
      const metaInfo = await contract.metainfo(_num);
      // 가져온 정보를 반환합니다.
      return {
          info0: metaInfo[0], // 가입날짜
          info1: metaInfo[1], // 보상처리결과
          info2: metaInfo[2], // 가입ID
          info3: metaInfo[3], // 관람자비번
          info4: metaInfo[4], // 가입계좌 번호
          info5: metaInfo[5], // 최초가격
          info6: metaInfo[6], // 가입자
          info7: metaInfo[7], // 0트레이딩중,1보상신청,2보상완료 3보상금액 찾아감
      
        
        
      };
  } catch (error) {
      console.error("Error fetching meta info:", error);
      return null;
  }
  }
  
  async function displayMetaInfo() {
  try {
      // JSON-RPC 프로바이더 설정
      let provider = new ethers.providers.JsonRpcProvider('https://opbnb-mainnet-rpc.bnbchain.org');
  
      // 메타데이터 컨트랙트 인스턴스 생성
      let meta5Contract = new ethers.Contract(metaddr.metmarket, metabi.metmarket, provider);
  
      // 전체 발행 계좌 수 가져오기
      let imid = await meta5Contract.mid();
  
      // HTML 컨테이너 가져오기
      const infoContainer = document.getElementById("metaInfoContainer");
      if (!infoContainer) {
          console.error("HTML element 'metaInfoContainer' not found.");
          return;
      }
  
      for (let i = 0; i <= imid; i++) {
        const metaInfo = await getMetaInfoByNum(meta5Contract, i);
        if (metaInfo) {
            // Set purchase availability text
            let purchasableStatus;
            switch (metaInfo.info7) {
              case 0:
                purchasableStatus = 'NO';
                break;
               case 1: 
               purchasableStatus = 'Request for compensation'; 
               break; 
               case 2: 
               purchasableStatus = 'Withdrawable'; 
               break; 
               case 3: 
               purchasableStatus = 'Withdrawal complete'; 
              break;
                 
                default:
                    purchasableStatus = 'Unknown';
            }
              const isPurchasable = purchasableStatus;


              // 등록날짜 변환 (UTC 기준 고정)
const gmtOffsetHours = 3; // GMT 기준 +6시간

// metaInfo.info0은 UTC timestamp(초 단위)라고 가정
const correctedTimestamp = (Number(metaInfo.info0) + gmtOffsetHours * 3600) * 1000;

const dateObj = new Date(correctedTimestamp);

// GMT+6 기준으로 고정된 표시
const formattedDate = dateObj.toLocaleString("en-GB", {
  timeZone: "UTC",   // 항상 GMT(UTC) 기준으로 처리
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false
});



          
         const infoHtml = ` 
<div class="card w-100 border border-dark rounded mb-3" style="margin-left: 0; margin-right: 0;">
  <div class="card-body text-start px-3">

    <h5 class="card-title border-bottom pb-2 mb-3 text-center">
      🧾 Meta Info ID: ${i}
    </h5>

    <div class="mb-2 p-2 border rounded bg-light">
      <strong>MT5 Account:</strong><br>${metaInfo.info4}
    </div>
    <div class="mb-2 p-2 border rounded bg-light">
      <strong>Viewer Password:</strong><br>${metaInfo.info3}
    </div>
    <div class="mb-2 p-2 border rounded bg-light">
      <strong>Registration Date:</strong><br>${formattedDate}
    </div>
    <div class="mb-2 p-2 border rounded bg-light">
      <strong>Initial Deposit:</strong><br>${metaInfo.info5} USD
    </div>
    <div class="mb-2 p-2 border rounded bg-light">
      <strong>Request for Compensation:</strong><br>${isPurchasable}
    </div>
    <div class="mb-2 p-2 border rounded bg-light">
      <strong>Registrant:</strong><br>${metaInfo.info6.slice(0, 4)}…${metaInfo.info6.slice(-4)}
    </div>
    <div class="mb-2 p-2 border rounded bg-light">
      <strong>Compensation Amount:</strong><br>${(metaInfo.info1 / 1e18).toFixed(2)} ZUM
    </div>

    <div class="d-flex flex-wrap gap-2 justify-content-center mt-3">
      <button type="button" class="btn btn-primary btn-sm w-100" onclick="purchase(this)" data-id="${i}">Request</button>
      <button type="button" class="btn btn-danger btn-sm w-100" onclick="cancelExit(this)" data-id="${i}">Cancel</button>
      <button type="button" class="btn btn-dark btn-sm w-100" onclick="Withdraw(this)" data-id="${i}">Withdraw</button>
      <button type="button" class="btn btn-warning btn-sm w-100" onclick="toggleAuditInput(${i})">Verify</button>
    </div>

    <div id="auditForm-${i}" class="mt-3" style="display:none;">
      <input type="number" class="form-control form-control-sm mb-2" placeholder="Reward amount (ZUM)" id="rewardInput-${i}"> 
      <button type="button" class="btn btn-success btn-sm w-100" onclick="auditReward(${i})">Confirm Reward</button> 
    </div>

  </div>
</div>`;

              infoContainer.innerHTML += infoHtml;
          }
      }
  } catch (error) {
      console.error("Error displaying meta info:", error);
  }
  }
  
  
  
  
  // 페이지 로드 시 정보 표시 함수 호출
  window.onload = displayMetaInfo;
  


  
  // 호출 코드
  topSync();
  
  function toggleAuditInput(index) {
  const form = document.getElementById(`auditForm-${index}`);
  if (form.style.display === "none") {
    form.style.display = "block";
  } else {
    form.style.display = "none";
  }
}

  // JavaScript에서 해당 ID 값을 가져와서 구매 함수 호출
  const purchase = async (button) => {
  try {
    const accountId = button.getAttribute("data-id"); // 버튼의 data-id 속성 값 가져오기
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
  
    let meta5Contract = new ethers.Contract(metaddr.metmarket, metabi.metmarket, signer);
    await meta5Contract.exit(accountId); // 해당 ID를 요청함수에 전달
    location.reload();  // ✅ 값 변경 후 자동 새로고침
  }  catch (e) {
  handleError(e);
}
  };
  
  
  
  
  // JavaScript에서 해당 ID 값을 가져와서 구매 함수 호출
  const  Withdraw = async (button) => {
    try {
      const accountId = button.getAttribute("data-id"); // 버튼의 data-id 속성 값 가져오기
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
    
      let meta5Contract = new ethers.Contract(metaddr.metmarket, metabi.metmarket, signer);
      await meta5Contract.withdrw(accountId); // 해당 ID를 요청함수에 전달
      location.reload();  // ✅ 값 변경 후 자동 새로고침
    }  catch (e) {
  handleError(e);
}
    };
  
    let Registration = async () => {
      let userProvider = new ethers.providers.Web3Provider(window.ethereum, "any");
      
      // 네트워크 추가 요청
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
    
      // 지갑 연결
      await userProvider.send("eth_requestAccounts", []);
      let signer = userProvider.getSigner();
    
      // 스마트 컨트랙트 인스턴스 생성
      let meta5Contract = new ethers.Contract(metaddr.metmarket, metabi.metmarket, signer);
    
      // 입력값 가져오기
      const account = document.getElementById('Account').value;
      const invest = document.getElementById('Invest').value;
    
      try {
        // 트랜잭션 전송
        let tx = await meta5Contract.registration(account, invest);
        console.log("트랜잭션 전송됨:", tx.hash);
    
        // 트랜잭션이 블록에 포함될 때까지 대기
        await tx.wait();
        console.log("트랜잭션 확정됨:", tx.hash);
    
        alert("등록이 완료되었습니다.");
        location.reload();  // ✅ 트랜잭션 확정 후 새로고침
      }  catch (e) {
  handleError(e);
}
    };

const cancelExit = async (button) => {
  try {
    const accountId = button.getAttribute("data-id");
    const userProvider = new ethers.providers.Web3Provider(window.ethereum, "any");
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [{
        chainId: "0xCC",
        rpcUrls: ["https://opbnb-mainnet-rpc.bnbchain.org"],
        chainName: "opBNB",
        nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
        blockExplorerUrls: ["https://opbnbscan.com"]
      }]
    });
    await userProvider.send("eth_requestAccounts", []);
    const signer = userProvider.getSigner();

    let meta5Contract = new ethers.Contract(metaddr.metmarket, metabi.metmarket, signer);
    await meta5Contract.exitcancell(accountId);
    alert("보상 신청이 취소되었습니다.");
    location.reload();
  } catch (e) {
    handleError(e);
  }
};

const auditReward = async (index) => {
  try {
    const inputField = document.getElementById(`rewardInput-${index}`);
    const rewardValue = inputField.value;

    if (!rewardValue || isNaN(rewardValue) || Number(rewardValue) <= 0) {
      alert("유효한 보상금액(BET)을 입력해주세요.");
      return;
    }

    const userProvider = new ethers.providers.Web3Provider(window.ethereum, "any");
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [{
        chainId: "0xCC",
        rpcUrls: ["https://opbnb-mainnet-rpc.bnbchain.org"],
        chainName: "opBNB",
        nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
        blockExplorerUrls: ["https://opbnbscan.com"]
      }]
    });

    await userProvider.send("eth_requestAccounts", []);
    const signer = userProvider.getSigner();

    let meta5Contract = new ethers.Contract(metaddr.metmarket, metabi.metmarket, signer);

    // 👉 parseUnits 제거: 컨트랙트에서 *1e18 하므로 숫자 그대로 넘김
    await meta5Contract.audit(index, rewardValue);
    alert("보상 검증 완료");
    location.reload();
  } catch (e) {
    handleError(e);
  }
};



    
  function handleError(e) {
  let raw = e?.data?.message || e?.error?.message || e?.message || "";
  let clean = "알 수 없는 오류가 발생했습니다.";

  if (raw.includes("execution reverted:")) {
    raw = raw.split("execution reverted:")[1];
  }

  const match = raw.match(/"([^"]+)"/); // "메시지"만 추출
  if (match && match[1]) {
    clean = match[1];
  } else if (raw) {
    clean = raw.split("(")[0].trim(); // 괄호 앞 revert 코드만
  }

  alert(clean);
  console.error("에러 상세:", e);
}
