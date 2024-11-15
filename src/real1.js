let metaddr = {  
    metmarket: "0x87280638619c508967c42AE10c0c3E6d5d57f2c0" //sutrealmaret

  };

  let metabi = {
  
    metmarket: [
       "function buyMeta(uint _mid, uint _time) public",
       "function mid() public view returns (uint256)",
       "function listMetaForSale(uint _mid, uint256 _price) public ",
       "function tax() public view returns (uint256)",
       "function g1() public view virtual returns(uint256)",
       "function listMetaForSale(uint _mid, uint256 _price) public",
       "function g4(uint _mid) public view virtual returns (uint256)",
       "function charge(uint _pay) public",
       "function myInfo(address _user) external view returns (uint256[] memory,string memory)",
       "function metainfo(uint _num) public view returns (string memory,string memory,string memory,string memory, uint256,uint256,uint256,uint8,address) "
      ],
      
 

  };

  let topSync = async () => {

    let provider = new ethers.providers.JsonRpcProvider('https://opbnb-mainnet-rpc.bnbchain.org');
    let meta5Contract = new ethers.Contract(metaddr.metmarket, metabi.metmarket, provider);
  
    

    let itax = await meta5Contract.tax();  //세금
    let ibal = await meta5Contract.g1();
   
    document.getElementById("Tp").innerHTML= (itax/1e18).toFixed(2);  //누적매출 

    }
    async function getMetaInfoByNum(contract, _num) {
      try {
          const metaInfo = await contract.metainfo(_num);
          
  
          return {
              info1: metaInfo[0], // 물건이름
              info2: metaInfo[1], // 물건 위치 주소
              info3: metaInfo[2], // 물건 정보 상세 페이지
              info4: metaInfo[3], // 물건 사진
              info5: metaInfo[4], // 사용가능 시간 최소단위 1일
              info6: metaInfo[5], // 시작시간
              info7: metaInfo[6], // 가격
              info8: metaInfo[7], // 거래가능상태
              info9: metaInfo[8], // 사용자
          
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

        // 전체 발행 계약 수 가져오기
        let imid = await meta5Contract.mid();

        // HTML 컨테이너 가져오기
        const infoContainer = document.getElementById("metaInfoContainer");
        if (!infoContainer) {
            console.error("HTML element 'metaInfoContainer' not found.");
            return;
        }

        // 각 mid에 대해 반복
        for (let i = 0; i < imid; i++) {
            try {
                const metaInfo = await getMetaInfoByNum(meta5Contract, i);
               
                if (metaInfo) {
                    // 구매 가능 여부 설정
                
                    let purchasableStatus;
                    switch (metaInfo.info8) {
                        case 0:
                            purchasableStatus = '물건을 등록하세요';
                            break;
                        case 1:
                            purchasableStatus = '사용중';
                            break;
                        case 2:
                            purchasableStatus = '승인준비중';
                            break;
                        case 3:
                            purchasableStatus = '거래가능';
                            break;
                        default:
                            purchasableStatus = 'Unknown';
                    }


                    
                    const isPurchasable = purchasableStatus;
           
                    const infoHtml = `
                    <div class="card mb-3">
                        <div class="card-body">
                            <h5 class="card-title">상품아이디${i}</h5>
                            <p class="card-text"><strong>물건이름:</strong> ${metaInfo.info1}</p>
                            <p class="card-text"><strong>물건위치주소:</strong> ${metaInfo.info2}</p>
                            <p class="card-text"><strong>물건상세정보:</strong> <a href="${metaInfo.info3}" target="_blank">Click Here</a></p>
                            <p class="card-text"><img src="${metaInfo.info4}" alt="Product Image" style="width: 600px; height: auto;"></p>
                            <p class="card-text"><strong>사용자:</strong> ${metaInfo.info9}</p>
                            <p class="card-text"><strong>12개월사용가격:</strong> ${metaInfo.info7*12/1e18}CYA</p>
                            <p class="card-text"><strong>거래가능상태:</strong> ${isPurchasable}</p> 
                         
                  
                            <button type="button" class="btn btn-primary btn-sm mr-2" onclick="purchase(this)" data-id="${i}">12개월사용권구매하기</button>
                            <p>1개월이상 남았을 경우에만 판매등록 가능합니다</p>
                            <input type="number" id="saleAmount${i}" class="form-control form-control-sm" placeholder="판매할 가격을 입력하고 판매하기 버튼을 클릭하세요">
                            <button type="button" class="btn btn-primary btn-sm mr-2" onclick="registerSale(this)" data-id="${i}">판매하기</button>
                          <div>
                         <button type="button" class="btn btn-dark btn-sm mt-2" onclick="gettime(this)" data-id="${i}">남은사용시간보기</button>
                          <p id="remainingTime${i}" class="mt-2"></p>
                         </div>
                        </div>
                    </div>`;
                    infoContainer.innerHTML += infoHtml;
                }
            } catch (error) {
                console.error(`mid ${i}에 대한 메타 정보 검색 오류:`, error);
                // 특정 오류를 처리하거나 기록하는 선택적인 처리
            }
        }
    } catch (error) {
        console.error("메타 정보 표시 중 오류 발생:", error);
    }
}

// 페이지 로드 시 정보 표시 함수 호출
window.onload = displayMetaInfo;




    




 // 호출 코드
 topSync();
  
 async function gettime(button) {
  try {
      // 버튼의 data-id 속성에서 상품 ID 가져오기
      const productId = button.getAttribute("data-id");

      // JSON-RPC 프로바이더 설정
      let provider = new ethers.providers.JsonRpcProvider('https://opbnb-mainnet-rpc.bnbchain.org');

      // 메타데이터 컨트랙트 인스턴스 생성
      let meta5Contract = new ethers.Contract(metaddr.metmarket, metabi.metmarket, provider);

      // g4 함수 호출하여 남은 사용 시간 가져오기 (단위: 초)
      let remainingSeconds = await meta5Contract.g4(productId);

      // 초를 날짜, 시간, 분, 초로 변환
      let days = Math.floor(remainingSeconds / (60 * 60 * 24));
      let hours = Math.floor((remainingSeconds % (60 * 60 * 24)) / (60 * 60));
      let minutes = Math.floor((remainingSeconds % (60 * 60)) / 60);
      let seconds = remainingSeconds % 60;

      // 가져온 시간을 해당 상품의 <p> 태그에 표시
      const remainingTimeElement = document.getElementById(`remainingTime${productId}`);
      if (remainingTimeElement) {
          remainingTimeElement.textContent = `상품 ID ${productId}의 남은 사용 시간: ${days}일 ${hours}시간 ${minutes}분 ${seconds}초`;
      }
  } catch (error) {
      console.error(`상품 ID ${productId}의 남은 사용 시간을 가져오는 중 오류 발생:`, error);
  }
}



// <input type="number" id="saleAmount${i}" class="form-control form-control-sm" placeholder="판매할 가격을 입력하고 판매하기 버튼을 클릭하세요">
// <button type="button" class="btn btn-primary btn-sm mr-2" onclick="registerSale(this)" data-id="${i}">판매하기</button>
// <div>
// JavaScript에서 해당 ID 값을 가져와서 구매 함수 호출
const purchase = async (button) => {
  try {
    const accountId = button.getAttribute("data-id"); // 버튼의 data-id 속성 값 가져오기
    const userProvider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const buyMonthInput = document.getElementById(`month${accountId}`); // 해당 ID의 판매금액 입력란 가져오기
    const buyMonth = 12; // 판매금액 입력란의 값 가져와서 정수형으로 변환
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
    await meta5Contract.buyMeta(accountId,buyMonth); // 해당 ID를 buy 함수에 전달하여 구매
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
    await meta5Contract.listMetaForSale(accountId, saleAmount);
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