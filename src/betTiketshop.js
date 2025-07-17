// SPDX-License-Identifier: MIT
// JavaScript dApp Frontend for betTiketshop

document.addEventListener("DOMContentLoaded", function () {
    let metaddr = {
        metmarket: "0xcBe58Cdd5eB41f9891a8A7c0DBeAD81b47cabA69" // betTiketshop
    };

    let metabi = {
        metmarket: [
            "function buy(uint256 _pid, uint256 _num) public",
            "function pid() public view returns(uint256)",
            "function bid() public view returns(uint256)",
            "function getContractBut() public view returns (uint256)",
            "function getContractBet() public view returns (uint256)",
            "function getMyTickets(address) view returns (uint256[] tiketIds, uint256[] productIds)",
            "function metainfo(uint _num) public view returns (string memory,string memory,uint256,uint256,uint256,uint256)",
            "function transferMyTiket(address _to, uint256 _tiketId) public"
        ]
    };

    async function topSync() {
        let provider = new ethers.providers.JsonRpcProvider('https://opbnb-mainnet-rpc.bnbchain.org');
        let meta5Contract = new ethers.Contract(metaddr.metmarket, metabi.metmarket, provider);

        let ipid = await meta5Contract.pid();
        let ibid = await meta5Contract.bid();
        let ibut = await meta5Contract.getContractBut();
        let ibet = await meta5Contract.getContractBet();

        document.getElementById("Pid").innerHTML = ipid;
        document.getElementById("Bid").innerHTML = ibid;
        document.getElementById("Betbal").innerHTML = ibet / 1e18;
        document.getElementById("Butbal").innerHTML = ibut;
    }

    async function getMetaInfoByNum(contract, _num) {
        try {
            const metaInfo = await contract.metainfo(_num);
            return {
                info0: metaInfo[0],
                info1: metaInfo[1],
                info2: metaInfo[2],
                info3: metaInfo[3],
                info4: metaInfo[4],
                info5: metaInfo[5],
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

            for (let i = 0; i < ipid; i++) {
                const metaInfo = await getMetaInfoByNum(meta5Contract, i);
                const infoHtml = `
                    <div class="card mb-4" style="min-height: 550px;">
                        <img src="/images/betshop/${i}.png" class="card-img-top img-fluid" style="width: 100%; height: 250px; object-fit: contain;" onerror="this.onerror=null; this.src='../images/betshop/default.png';"/>
                        <div class="card-body">
                            <h5 class="card-title">물건 아이디 ${i}</h5>
                            <p class="card-text"><strong>물건 이름:</strong> ${metaInfo.info0}</p>
                            <p class="card-text"><a href="${metaInfo.info1}" class="btn btn-outline-info btn-sm" target="_blank">자세히 보기</a></p>
                            <p class="card-text"><strong>남은 수량:</strong> ${metaInfo.info2}개</p>
                            <p class="card-text"><strong>수당 비율:</strong> ${metaInfo.info3}%</p>
                            <p class="card-text"><strong>BUT 제공:</strong> ${metaInfo.info4} BUT</p>
                            <p class="card-text"><strong>가격:</strong> ${metaInfo.info5 / 1e18} BET</p>
                            <button class="btn btn-primary btn-sm" onclick="openPurchaseForm(${i})">구매하기</button>
                            <div class="purchase-form-container mt-3" id="purchaseFormContainer${i}" style="display: none;">
                                <form class="purchase-form">
                                    <div class="form-group">
                                        <label>구매 수량:</label>
                                        <input type="number" id="quantity${i}" class="form-control form-control-sm" value="1" min="1" required>
                                    </div>
                                    <button type="button" class="btn btn-success btn-sm" onclick="submitPurchaseForm(${i})">입력 완료</button>
                                    <button type="button" class="btn btn-secondary btn-sm" onclick="closePurchaseForm(${i})">취소</button>
                                </form>
                            </div>
                        </div>
                    </div>`;

                infoContainer.innerHTML += infoHtml;
            }
        } catch (error) {
            console.error("메타 정보 표시 중 오류 발생:", error);
        }
    }

    window.openPurchaseForm = function (productId) {
        document.getElementById(`purchaseFormContainer${productId}`).style.display = 'block';
    };

    window.closePurchaseForm = function (productId) {
        document.getElementById(`purchaseFormContainer${productId}`).style.display = 'none';
    };

    window.submitPurchaseForm = async function (productId) {
        const quantity = document.getElementById(`quantity${productId}`).value;
        await buy(productId, quantity);
    };

    async function buy(productId, quantity) {
        try {
            const userProvider = new ethers.providers.Web3Provider(window.ethereum, "any");
            await window.ethereum.request({ method: "wallet_addEthereumChain", params: [{
                chainId: "0xCC",
                rpcUrls: ["https://opbnb-mainnet-rpc.bnbchain.org"],
                chainName: "opBNB",
                nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
                blockExplorerUrls: ["https://opbnbscan.com"]
            }] });
            await userProvider.send("eth_requestAccounts", []);
            const signer = userProvider.getSigner();
            const meta5Contract = new ethers.Contract(metaddr.metmarket, metabi.metmarket, signer);
            await meta5Contract.buy(productId, quantity);
            alert('구매가 완료되었습니다.');
            closePurchaseForm(productId);
        } catch (e) {
            alert(e.data?.message.replace('execution reverted: ', '') || e.message);
        }
    }

    window.displayMyTickets = async function () {
        const [user] = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.JsonRpcProvider('https://opbnb-mainnet-rpc.bnbchain.org');
        const contract = new ethers.Contract(metaddr.metmarket, metabi.metmarket, provider);
        const container = document.getElementById("myTicketContainer");
        container.innerHTML = "";

        try {
            const [tiketIds, productIds] = await contract.getMyTickets(user);
            for (let i = 0; i < tiketIds.length; i++) {
                const meta = await contract.metainfo(productIds[i]);
                const html = `
                    <div class="card mb-3">
                        <div class="card-body">
                            <h5 class="card-title">티켓 ID: ${tiketIds[i]}</h5>
                            <p class="card-text"><strong>상품명:</strong> ${meta[0]}</p>
                            <p class="card-text"><strong>상품ID:</strong> ${productIds[i]}</p>
                            <p class="card-text"><strong>남은 수량:</strong> ${meta[2]}</p>
                            <p class="card-text"><strong>BUT 보상:</strong> ${meta[4]}</p>
                            <p class="card-text"><strong>가격:</strong> ${(meta[5] / 1e18).toFixed(4)} BET</p>
                            <a href="${meta[1]}" class="btn btn-outline-info btn-sm" target="_blank">상품 정보 보기</a>
                            <div class="form-group mt-3">
                                <label>받는 주소:</label>
                                <input type="text" class="form-control form-control-sm" id="recipient_${tiketIds[i]}" placeholder="0x...">
                                <button class="btn btn-warning btn-sm mt-2" onclick="transferMyTicket('${tiketIds[i]}')">티켓 이체</button>
                            </div>
                        </div>
                    </div>`;
                container.innerHTML += html;
            }
        } catch (err) {
            console.error("내 티켓 조회 오류:", err);
            container.innerHTML = "<p>티켓 정보를 불러오지 못했습니다.</p>";
        }
    }

    window.transferMyTicket = async function (tiketId) {
        const recipient = document.getElementById(`recipient_${tiketId}`).value;
        if (!ethers.utils.isAddress(recipient)) {
            alert("유효한 이더리움 주소를 입력해주세요.");
            return;
        }

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(metaddr.metmarket, metabi.metmarket, signer);
            const tx = await contract.transferMyTiket(recipient, tiketId);
            await tx.wait();
            alert(`티켓 ${tiketId}번을 ${recipient}에게 이체했습니다.`);
            displayMyTickets();
        } catch (err) {
            console.error("티켓 이체 오류:", err);
            alert(err.data?.message?.replace("execution reverted: ", "") || err.message);
        }
    }

    // 초기 로딩
    displayMetaInfo();
    topSync();
});
