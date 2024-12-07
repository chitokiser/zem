let metaddr = {  
  metmarket: "0x8c27Eb543E26ee0492FE724a2caDA16Acb1B473A" //deduction

};

let metabi = {

  metmarket: [
    "function accession(uint256 _init,uint256 _metanum)public",
      "function exit(uint256 _mid)public",
      "function withdrw(uint256 _mid)public",
     "function mid() public view returns (uint256)",
     "function g1() public view virtual returns(uint256)",
     "function g2() public view virtual returns(uint256)",
     "function metainfo(uint256 _mid) public view virtual returns(uint256,uint256,uint256,uint256,uint256,address,uint8)",
    
    ],
    
};

let topSync = async () => {

  let provider = new ethers.providers.JsonRpcProvider('https://opbnb-mainnet-rpc.bnbchain.org');
  let meta5Contract = new ethers.Contract(metaddr.metmarket, metabi.metmarket, provider);

  

  let ibal = await meta5Contract.g1();  //계약보유잔금
  document.getElementById("Ibal").innerHTML= (ibal/1e18).toFixed(2);  //누적매출 

  }


// ABI 함수 호출하여 정보 가져오는 함수
async function getMetaInfoByNum(contract, _num) {
try {
    const metaInfo = await contract.metainfo(_num);
    // 가져온 정보를 반환합니다.
    return {
        info0: metaInfo[0], // 가입날짜
        info1: metaInfo[1], // 보상금액
        info2: metaInfo[2], // 가입ID
        info3: metaInfo[3], // 가입계좌번호
        info4: metaInfo[4], // 최초잔금
        info5: metaInfo[5], // 가입자
        info6: metaInfo[6], // 상태
    
      
      
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
          switch (metaInfo.info6) {
            case 0:
              purchasableStatus = '보상 신청을 하지않은 상태입니다';
              break;
              case 1:
                  purchasableStatus = '보상신청이 완료되고 심사중입니다';
                  break;
              case 2:
                  purchasableStatus = '보상금을 받을 수 있습니다';
                  break;
              case 3:
                  purchasableStatus = '보상금을 인출하였습니다';
                  break;
               
              default:
                  purchasableStatus = 'Unknown';
          }
            const isPurchasable = purchasableStatus;

        
            const infoHtml = `
            <div class="card mb-3">
            <div class="card-body">
                <h5 class="card-title">계좌ID:${i}</h5>
                <p class="card-text"><strong>계좌번호:</strong> ${metaInfo.info3}</p>
                <p class="card-text"><strong>가입날짜:</strong> ${metaInfo.info0}</p>
                <p class="card-text"><strong>최초잔금:</strong> ${metaInfo.info4}USD</p>
                <p class="card-text"><strong>보상요청:</strong> ${isPurchasable}</p>
                <p class="card-text"><strong>가입자:</strong> ${metaInfo.info5}</p>
                <p class="card-text"><strong>승인된 보상금액:</strong> ${metaInfo.info1}</p>
                <button type="button" class="btn btn-primary btn-sm mr-2" onclick="purchase(this)" data-id="${i}">보상신청</button>
                <button type="button" class="btn btn-dark btn-sm mr-2" onclick="Withdraw(this)" data-id="${i}">보상금인출하기</button>
         
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
} catch(e) {
  alert(e.data.message.replace('execution reverted: ',''))
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
  } catch(e) {
    alert(e.data.message.replace('execution reverted: ',''))
  }
  };

let Accession = async () => {
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

let meta5Contract = new ethers.Contract(metaddr.metmarket, metabi.metmarket, signer);
const account = document.getElementById('Account').value;
const amount = document.getElementById('Amount').value;
try {
  await meta5Contract.accession(parseInt(amount, 10), account);
} catch(e) {
  let errorMessage = e.data && e.data.message ? e.data.message : e.message;
  alert(errorMessage.replace('execution reverted: ', ''));
}
};

