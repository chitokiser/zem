let metaddr = {  
    metmarket: "0x81c1FBbD9BbC699db833C8cdb6cCC255D3c7a258" //minishouse
    
  };

  let metabi = {
  
    metmarket: [
       "function buyhouse(uint _mid) public",
       "function termination(uint _mid) public",
       "function g1() public view virtual returns(uint256)",
       "function mid() public view virtual returns(uint256)",
       "function time() public view virtual returns(uint256)",
       " function g4(uint _mid) public view virtual returns (uint256)",
       "function metainfo(uint _num) public view returns (string memory,string memory,string memory,string memory, uint256,uint256,uint8, address) ",
      
      ],
      
 

  };

  let topSync = async () => {

    let provider = new ethers.providers.JsonRpcProvider('https://opbnb-mainnet-rpc.bnbchain.org');
    let meta5Contract = new ethers.Contract(metaddr.metmarket, metabi.metmarket, provider);
  
    
    let imid = await meta5Contract.mid();  //전체 발행 부동산 수
    let itime = await meta5Contract.time();  //의무보유기간
    let ibal = await meta5Contract.g1();
   
    document.getElementById("Time").innerHTML= (itime/60/60/24);
    document.getElementById("Mid").innerHTML= (imid);
    document.getElementById("Hutbal").innerHTML= (ibal);  //누적매출 

    }
  
    async function getMetaInfoByNum(contract, _num) {
        try {
            const metaInfo = await contract.metainfo(_num);
            
    
            return {
                info0: metaInfo[0], // 물건이름
                info1: metaInfo[1], // 물건 위치 주소
                info2: metaInfo[2], // 물건 정보 상세 페이지
                info3: metaInfo[3], // 물건 사진
                info4: metaInfo[4], // 시작시간
                info5: metaInfo[5], // 가격
                info6: metaInfo[6], // 거래가능성
                info7: metaInfo[7], // 사용자
            
            
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
                      switch (metaInfo.info6) {
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
                              <h5 class="card-title">물건아이디${i}</h5>
                              <p class="card-text"><strong>물건이름:</strong> ${metaInfo.info0}</p>
                              <p class="card-text"><strong>물건위치주소:</strong> ${metaInfo.info1}</p>
                              <p class="card-text"><strong>물건상세정보:</strong> <a href="${metaInfo.info2}" target="_blank">Click Here</a></p>

                              <p class="card-text"><img src="${metaInfo.info3}" alt="Product Image" class="responsive-img"></p>
                              <p class="card-text"><strong>가격:</strong> ${metaInfo.info5}HUT</p>
                               <p class="card-text"><strong>오너:</strong> ${metaInfo.info7}HUT</p>
                              <p class="card-text"><strong>거래가능상태:</strong> ${isPurchasable}</p> 
                           
                    
                              <button type="button" class="btn btn-primary btn-sm mr-2" onclick="purchase(this)" data-id="${i}">구매하기</button>
                              <p>구매 후 의무소유기간이 지난 다음에 판매가능합니다</p>
                            
                              <button type="button" class="btn btn-primary btn-sm mr-2" onclick="registerSale(this)" data-id="${i}">판매하기</button>
                            <div>
                           <button type="button" class="btn btn-dark btn-sm mt-2" onclick="gettime(this)" data-id="${i}">남은의무소유기간보기</button>
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
    await meta5Contract.buyhouse(accountId); // 해당 ID를 buy 함수에 전달하여 구매
  } catch(e) {
    alert(e.data.message.replace('execution reverted: ',''))
  }
};




// 판매등록 함수 구현
const registerSale = async (button) => {
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
    await meta5Contract.termination(accountId);
  } catch(e) {
    alert(e.data.message.replace('execution reverted: ',''))
  }
};

async function gettime(button) {
    const id = button.getAttribute('data-id');
    try {
        // JSON-RPC 프로바이더 설정
        let provider = new ethers.providers.JsonRpcProvider('https://opbnb-mainnet-rpc.bnbchain.org');
        let meta5Contract = new ethers.Contract(metaddr.metmarket, metabi.metmarket, provider);

        let remainingTime = await meta5Contract.g4(id);
        remainingTime =  Math.floor(remainingTime / 60 / 60 / 24);
        document.getElementById(`remainingTime${id}`).innerText = `남은 사용 시간: ${remainingTime}일`;
    } catch (error) {
        console.error(`남은 사용 시간 조회 중 오류:`, error);
    }
}


