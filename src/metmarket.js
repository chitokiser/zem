let metaddr = {  
    metmarket: "0x58a5469af3D9F583e502d84Dca0F4dD76A9FfcA7" //metmarket2 
    
  };

  let metabi = {
  
    metmarket: [
       "function buy(uint _mid) public",
       "function mid() public view returns (uint256)",
       "function tax() public view returns (uint256)",
       "function g1() public view virtual returns(uint256)",
       "function selladd(uint _mid,uint256 _init) public",
       "function getmainpass(uint _mid) external view returns (string memory)",
       "function getpass(uint256 _mid) external view returns (string memory)",  //관람자패스
       "function getmetainfo(uint _num) public view returns (uint256, uint256, string memory, uint256,uint8, address,address) ",
       "function charge(uint _pay) public",
       "function newmeta(uint _metanum,string memory _investor,uint256 _init,string memory _mainpass) public"
      ],
      
 

  };

  let topSync = async () => {

    let provider = new ethers.providers.JsonRpcProvider('https://opbnb-mainnet-rpc.bnbchain.org');
    let meta5Contract = new ethers.Contract(metaddr.metmarket, metabi.metmarket, provider);
  
    
    let imid = await meta5Contract.mid();  //전체 발행 계좌 수
    let itax = await meta5Contract.tax();  //세금
    let ibal = await meta5Contract.g1();
   
    document.getElementById("Mid").innerHTML= (imid);
    document.getElementById("Tp").innerHTML= ((itax+ibal) /1e18).toFixed(2);  //누적매출 

    }
  
 
// ABI 함수 호출하여 정보 가져오는 함수
async function getMetaInfoByNum(contract, _num) {
  try {
      const metaInfo = await contract.getmetainfo(_num);
      // 가져온 정보를 반환합니다.
      return {
          info1: metaInfo[0], // uint256
          info2: metaInfo[1], // uint256
          info3: metaInfo[2], // string memory
          info4: metaInfo[3], // uint256
          info5: metaInfo[4], // bool
          info6: metaInfo[5], // address
          info7: metaInfo[6]  // address orgin
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

      // 각 계좌 정보를 가져와서 HTML에 표시
      for (let i = 0; i <= imid; i++) {
          const metaInfo = await getMetaInfoByNum(meta5Contract, i);
          if (metaInfo) {
              // 구매 가능 여부 텍스트 설정
              let purchasableStatus;
              switch (metaInfo.info5) {
                  case 1:
                      purchasableStatus = '플레이중';
                      break;
                  case 2:
                      purchasableStatus = '판매승인대기중';
                      break;
                  case 3:
                      purchasableStatus = '거래가능';
                      break;
                  default:
                      purchasableStatus = '알 수 없음';
              }
              const isPurchasable = purchasableStatus;

              // HTML 카드 추가
              const infoHtml = `
              <div class="card mb-3">
                  <div class="card-body">
                      <h5 class="card-title">계좌정보${i}</h5>
                      <p class="card-text"><strong>계좌:</strong> ${metaInfo.info2}</p>
                      <p class="card-text"><strong>관람자비번:</strong> ${metaInfo.info3}</p>
                      <p class="card-text"><strong>가격:</strong> ${metaInfo.info4} p</p>
                      <p class="card-text"><strong>구매가능여부:</strong> ${isPurchasable}</p>
                      <p class="card-text"><strong>계좌주인:</strong> ${metaInfo.info6}</p>
                      <p class="card-text"><strong>계좌발행자:</strong> ${metaInfo.info7}</p>
                      <button type="button" class="btn btn-primary btn-sm mr-2" onclick="purchase(this)" data-id="${i}">구매하기</button>
                      <button type="button" class="btn btn-primary btn-sm mr-2" onclick="registerSale(this)" data-id="${i}">판매등록</button>
                      <input type="number" id="saleAmount${i}" class="form-control form-control-sm" placeholder="판매금액입력">
                      <button type="button" class="btn btn-dark btn-sm mt-2" onclick="getMainPass(this)" data-id="${i}">메인 패스 가져오기</button>
                      <p id="mainPass${i}" class="mt-2"></p>
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
    await meta5Contract.buy(accountId); // 해당 ID를 buy 함수에 전달하여 구매
  } catch(e) {
    alert(e.data.message.replace('execution reverted: ',''))
  }
};



// 판매등록 함수 구현
const registerSale = async (button) => {
  try {
    const accountId = button.getAttribute("data-id"); // 버튼의 data-id 속성 값 가져오기
    const saleAmountInput = document.getElementById(`saleAmount${accountId}`); // 해당 ID의 판매금액 입력란 가져오기
    const saleAmount = parseInt(saleAmountInput.value); // 판매금액 입력란의 값 가져와서 정수형으로 변환

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
    await meta5Contract.selladd(accountId, saleAmount);
  } catch(e) {
    alert(e.data.message.replace('execution reverted: ',''))
  }
};

let Charge = async () => {
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

  try {
    await meta5Contract.charge(document.getElementById('chargeAmount').value);
  } catch(e) {
    alert(e.data.message.replace('execution reverted: ',''))
  }
};


const getMainPass = async (button) => {
  try {
      const accountId = button.getAttribute("data-id");
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
      const mainPass = await meta5Contract.getmainpass(accountId);
      document.getElementById(`mainPass${accountId}`).innerText = `메인 패스워드: ${mainPass}`;
  } catch(e) {
      alert(e.data.message.replace('execution reverted: ',''))
  }
};
