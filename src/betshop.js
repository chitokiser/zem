 //0x964B87d1656dD07437192DA33d1d561a7438ec6e 이전계약에 994850BUT 잠김 관리자 모드 매출 인출 문제 업
document.addEventListener("DOMContentLoaded", function () {
    let metaddr = {
        metmarket: "0xF618cdFc5e19a3AEE0EAF03315fFFFB4F1Ab5876" //betshop
    };

    let metabi = {
        metmarket: [
            "function buy(uint _pid,uint num,string memory name,string memory house,string memory phone) public",
            "function pid() public view virtual returns(uint256)",
            "function bid() public view virtual returns(uint256)",
            "function g1() public view virtual returns(uint256)",
            "function g4() public view virtual returns(uint256)",
            "function metainfo(uint _num) public view returns (string memory,string memory,uint256,uint256,uint256,uint256)",
            "function bs(uint _num) public view returns (uint256,uint256,address,string memory,string memory,string memory,uint256)",
        ],
    };

    let topSync = async () => {  
        let provider = new ethers.providers.JsonRpcProvider('https://opbnb-mainnet-rpc.bnbchain.org');
        let meta5Contract = new ethers.Contract(metaddr.metmarket, metabi.metmarket, provider);
        
        let ipid = await meta5Contract.pid();  // 전체 꾸러미 종류
        let ibid = await meta5Contract.bid();  // 전체 구매자 수
        let ibal = await meta5Contract.g1();   //계약잔고
        let icut = await meta5Contract.g4();   //계약잔고

        document.getElementById("Pid").innerHTML = ipid;
        document.getElementById("Bid").innerHTML = ibid;
        document.getElementById("Betbal").innerHTML = ibal/1e18;  // 누적 매출
        document.getElementById("Butbal").innerHTML = icut;  // 누적 매출
    };

    async function getMetaInfoByNum(contract, _num) {
        try {
            const metaInfo = await contract.metainfo(_num);
            return {
                info0: metaInfo[0], // 물건 이름
                info1: metaInfo[1], // 물건 정보 상세 페이지
                info2: metaInfo[2], // 물건 재고
                info3: metaInfo[3], // 수당비율
                info4: metaInfo[4], // CUT제공개수
                info5: metaInfo[5], // 가격
            };
        } catch (error) {
            console.error("Error fetching meta info:", error);
            return null;
        }
    }

    async function displayMetaInfo() {
        try {
            let provider = new ethers.providers.JsonRpcProvider('https://opbnb-mainnet-rpc.bnbchain.org');
            let meta5Contract = new ethers.Contract(metaddr.metmarket, metabi.metmarket, provider);
            let ipid = await meta5Contract.pid();
            const infoContainer = document.getElementById("metaInfoContainer");
            if (!infoContainer) {
                console.error("HTML element 'metaInfoContainer' not found.");
                return;
            }
            for (let i = 0; i < ipid; i++) {
                try {
                    const metaInfo = await getMetaInfoByNum(meta5Contract, i);
                    const infoHtml = `
                      <img src="/images/betshop/${i}.png" alt="상품 이미지" class="meta-image"
                         onerror="this.onerror=null; this.src='../images/betshop/default.png';">
                        <div class="card mb-3" id="productCard${i}">
                            <div class="card-body">
                                <h5 class="card-title">물건 아이디 ${i}</h5>
                                <p class="card-text"><strong>물건 이름:</strong> ${metaInfo.info0}</p>
                                <p class="card-text"><strong>물건 상세 정보:</strong> ${metaInfo.info1}</p>
                                <p class="card-text"><strong>남은 수량:</strong> ${metaInfo.info2}개</p>
                                 <p class="card-text"><strong>수당비율:</strong> ${metaInfo.info3}%</p>
                                 <p class="card-text"><strong> BUT제공개수:</strong> ${metaInfo.info4}BUT</p>
                                <p class="card-text"><strong>가격:</strong> ${metaInfo.info5/1e18}CYA</p>
                                <button type="button" class="btn btn-primary btn-sm mr-2" onclick="openPurchaseForm(${i})">구매하기</button>
                                <div class="purchase-form-container" id="purchaseFormContainer${i}" style="display: none;">
                                <form class="purchase-form">
    <label for="productId">제품 ID:</label>
    <input type="text" id="productId" name="productId" readonly value="${i}"><br>
    
    <label for="quantity">구매 수량:</label>
    <input type="number" id="quantity${i}" name="quantity" value="1" min="1" required><br>


    <label for="buyerName">구매자 이름:</label>
    <input type="text" id="buyerName${i}" name="buyerName" required><br>

    <label for="house">주소:</label>
    <input type="text" id="house${i}" name="house" required><br>

    <label for="phone">전화번호:</label>
    <input type="text" id="phone${i}" name="phone" required><br>

    <button type="button" onclick="submitPurchaseForm(${i})">입력 완료</button>
    <button type="button" onclick="closePurchaseForm(${i})">취소</button>
</form>
                                </div>
                            </div>
                        </div>`;
                    infoContainer.innerHTML += infoHtml;
                } catch (error) {
                    console.error(`mid ${i}에 대한 메타 정보 검색 오류:`, error);
                }
            }
        } catch (error) {
            console.error("메타 정보 표시 중 오류 발생:", error);
        }
    }

    window.openPurchaseForm = function (productId) {
        const purchaseFormContainer = document.getElementById(`purchaseFormContainer${productId}`);
        if (purchaseFormContainer) {
            purchaseFormContainer.style.display = 'block';
        } else {
            console.error(`HTML element 'purchaseFormContainer${productId}' not found.`);
        }
    };

    window.closePurchaseForm = function (productId) {
        const purchaseFormContainer = document.getElementById(`purchaseFormContainer${productId}`);
        if (purchaseFormContainer) {
            purchaseFormContainer.style.display = 'none';
        } else {
            console.error(`HTML element 'purchaseFormContainer${productId}' not found.`);
        }
    };

    window.submitPurchaseForm = async function (productId) {
        const quantity = document.getElementById(`quantity${productId}`).value;
        const buyerName = document.getElementById(`buyerName${productId}`).value;
        const address = document.getElementById(`house${productId}`).value;
        const phoneNumber = document.getElementById(`phone${productId}`).value; // 중괄호 오류 수정
    
        await buy(productId, quantity, buyerName, address, phoneNumber);
    };
    

    async function buy(productId,quantity, buyerName, address, phoneNumber) {
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
            let meta5Contract = new ethers.Contract(metaddr.metmarket, metabi.metmarket, signer);
            await meta5Contract.buy(productId,quantity, buyerName, address, phoneNumber);
            alert('구매가 완료되었습니다.');
            closePurchaseForm(productId); // 구매가 완료되면 폼을 닫습니다.
        } catch (e) {
            alert(e.data?.message.replace('execution reverted: ', '') || e.message);
        }
    }

    // 페이지 로드 시 정보 표시 함수 호출
    displayMetaInfo();
  
    
 
    topSync();


async function displayBuyerInfo() {
    const buyerId = document.getElementById("buyerIdInput").value;
    if (buyerId === "") {
        alert("Please enter a Buyer ID");
        return;
    }

    try {
        const provider = new ethers.providers.JsonRpcProvider('https://opbnb-mainnet-rpc.bnbchain.org');
        const meta5Contract = new ethers.Contract(metaddr.metmarket, metabi.metmarket, provider);
        const buyerInfo = await meta5Contract.bs(buyerId);

        const buyerInfoHtml = `
            <div class="buyer-info-card">
                <h5>Buyer ID: ${buyerId}</h5>
                <p><strong>결제금액:</strong> ${buyerInfo[0]}</p>
                <p><strong>제품ID:</strong> ${buyerInfo[1]}</p>
                <p><strong>구매자어카운트:</strong> ${buyerInfo[2]}</p>
                <p><strong>구매자이름:</strong> ${buyerInfo[3]}</p>
                <p><strong>전화번호:</strong> ${buyerInfo[4]}</p>
                <p><strong>배송받을주소:</strong> ${buyerInfo[5]}</p>
                <p><strong>구매날짜:</strong> ${buyerInfo[6]}</p>
            </div>`;

        const infoContainer = document.getElementById("buyerInfoContainer");
        infoContainer.innerHTML = buyerInfoHtml;
    } catch (error) {
        console.error("Error fetching buyer info:", error);
        alert("Failed to fetch buyer info. Check console for details.");
    }
}

window.displayBuyerInfo = displayBuyerInfo;
});