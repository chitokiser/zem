let metaddr = {  
    metmarket: "0xEf04368eA4AB74C44BD0B700E0AAcB3eA82fd772" //agit
    
  };

  let metabi = {
  
    metmarket: [
       "function buy(uint _mid) public",
       "function forrent(uint _mid) public",
       "function rent(uint _mid) public",
       "function cancell(uint _mid) public",
       "function g1() public view virtual returns(uint256)",
       "function mid() public view virtual returns(uint256)",
       "function time() public view virtual returns(uint256)",
       " function g4() public view virtual returns (uint256)",
       "function metainfo(uint _num) public view returns (string memory,string memory,string memory,string memory, uint256,uint256,uint8, address,address,uint256,uint256) ",
      
      ],
      
 

  };

  let topSync = async () => {

    let provider = new ethers.providers.JsonRpcProvider('https://opbnb-rpc.publicnode.com');
    let meta5Contract = new ethers.Contract(metaddr.metmarket, metabi.metmarket, provider);
  
    
    let imid = await meta5Contract.mid();  //전체 발행 부동산 수
    let itime = await meta5Contract.time();  //임대기간
    let ibal = await meta5Contract.g1();
    let icrut = await meta5Contract.g4();
    document.getElementById("Time").innerHTML= (itime/60/60/24);
    document.getElementById("Mid").innerHTML= (imid);
    document.getElementById("Ibal").innerHTML= (ibal/1e18); 
    document.getElementById("Icrut").innerHTML= (icrut); 
    }
  
    async function getMetaInfoByNum(contract, _num) {
        try {
            const metaInfo = await contract.metainfo(_num);
            
    
            return {
                info0: metaInfo[0], // 물건이름
                info1: metaInfo[1], // 물건 위치 주소
                info2: metaInfo[2], // 물건 정보 상세 페이지
                info3: metaInfo[3], // 물건 사진
                info4: metaInfo[4], // crut기준 임대 보증금
                info5: metaInfo[5], // crut반환해야할 보증금
                info6: metaInfo[6], // 거래가능성 4:해지신청 3: 임대가능, 2: 사용중, 1: 거래가능 0:준비중
                info7: metaInfo[7], // 사용자
                info8: metaInfo[8], // 오너
                info9: metaInfo[9], // 매매가격
                info10: metaInfo[10], //임대시작시간
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
                                purchasableStatus = '임대등록을 하세요';
                                break;
                            case 1:
                                purchasableStatus = '매매거래가능 상태입니다';
                                break;
                            case 2:
                                purchasableStatus = '임대자 사용상태';
                                break;
                            case 3:
                                purchasableStatus = '임대가능';
                                break;
                            default:
                                purchasableStatus = 'Unknown';
                        }
    
                        const isPurchasable = purchasableStatus;
    
                        // 남은 임대 기간 계산 함수
                        function calculateRemainingLeaseTime(startTimeInSeconds) {
                            const leaseDurationInDays = 365; // 계약 기간 365일
                            const secondsInADay = 86400; // 하루는 86,400초
    
                            const currentTimeInSeconds = Math.floor(Date.now() / 1000); // 현재 시간을 초로 변환
    
                            const elapsedTime = currentTimeInSeconds - startTimeInSeconds; // 경과 시간 계산
                            const remainingTimeInSeconds = Math.max((leaseDurationInDays * secondsInADay) - elapsedTime, 0); // 남은 시간 계산
    
                            return Math.floor(remainingTimeInSeconds / secondsInADay); // 남은 시간을 일 단위로 반환
                        }
    
                        // 남은 임대 기간을 가져옴
                        const remainingDays = calculateRemainingLeaseTime(metaInfo.info10);
    
                        // 동적으로 HTML 생성
                        const infoHtml = `
                        <div class="card mb-3">
                            <div class="card-body">
                                <h5 class="card-title">물건아이디${i}</h5>
                                <p class="card-text"><strong>물건이름:</strong> ${metaInfo.info0}</p>
                                <p class="card-text"><strong>물건위치주소:</strong> ${metaInfo.info1}</p>
                                <p class="card-text"><strong>물건상세정보:</strong> <a href="${metaInfo.info2}" target="_blank">Click Here</a></p>
                                <p class="card-text"><img src="${metaInfo.info3}" alt="Product Image" class="responsive-img"></p>
                                <p class="card-text"><strong>임대보증금:</strong> ${metaInfo.info4}CRUT</p>
                                <p class="card-text"><strong>반환해야할보증금:</strong> ${metaInfo.info5}CRUT</p>
                                <p class="card-text"><strong>사용자:</strong> ${metaInfo.info7}</p>
                                <p class="card-text"><strong>주인:</strong> ${metaInfo.info8}</p>
                                <p class="card-text"><strong>매매가격:</strong> ${(metaInfo.info9 / 1e18).toFixed(2)}CYA</p>
                                <p class="card-text"><strong>남은임대기간:</strong> ${remainingDays}일</p>
                                <p class="card-text"><strong>거래가능상태:</strong> ${isPurchasable}</p>
    
                                <button type="button" class="btn btn-primary btn-sm mr-2" onclick="purchase(this)" data-id="${i}">구매하기</button>
                                <button type="button" class="btn btn-primary btn-sm mr-2" onclick="registerSale(this)" data-id="${i}">임대등록하기</button>
                                <div>
                                    <button type="button" class="btn btn-dark btn-sm mt-2" onclick="Rent(this)" data-id="${i}">임대하기</button>
                                    <button type="button" class="btn btn-dark btn-sm mt-2" onclick="Cancell(this)" data-id="${i}">임대종료하고 보증금(CRUT)돌려주기</button>
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
    await meta5Contract.buy(accountId); // 해당 ID를 buy 함수에 전달하여 구매
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
    await meta5Contract.forrent(accountId);
  } catch(e) {
    alert(e.data.message.replace('execution reverted: ',''))
  }
};


// 임대하기 함수 구현
const Rent = async (button) => {
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
      await meta5Contract.rent(accountId);
    } catch(e) {
      alert(e.data.message.replace('execution reverted: ',''))
    }
  };


// 임대종료하고 보증금 돌려주기 함수 구현
const Cancell = async (button) => {
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
      await meta5Contract.cancell(accountId);
    } catch(e) {
      alert(e.data.message.replace('execution reverted: ',''))
    }
  };
