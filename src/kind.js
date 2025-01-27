document.addEventListener("DOMContentLoaded", async function () {
    let kindaddr = {
        kindmarket: "0xcaE36BCE3092B34868a0cC7755BdDA8c7d83206E"
    };

    let kindabi = {
        kindmarket: [
            "function buy(uint _pid,uint num) public",
            "function pid() public view returns(uint256)",
            "function bid() public view returns(uint256)",
            "function g1() public view returns(uint256)",
            "function g5() public view returns(uint256)",
            "function metainfo(uint _num) public view returns (string memory,uint256,uint256,uint256,bool,address,address,address)"
        ]
    };

    let provider = new ethers.providers.JsonRpcProvider('https://opbnb-mainnet-rpc.bnbchain.org');
    let signer;
    let kinda5Contract;

    async function connectWallet() {
        if (window.ethereum) {
            try {
                await window.ethereum.request({ method: "eth_requestAccounts" });
                provider = new ethers.providers.Web3Provider(window.ethereum);
                signer = provider.getSigner();
                kinda5Contract = new ethers.Contract(kindaddr.kindmarket, kindabi.kindmarket, signer);
                console.log("지갑 연결 성공!");
            } catch (error) {
                console.error("지갑 연결 실패:", error);
            }
        } else {
            alert("MetaMask 또는 Web3 지갑을 설치해주세요.");
        }
    }

    let topSync = async () => {
        try {
            let ipid = await kinda5Contract.pid();
            let ibid = await kinda5Contract.bid();
            let ibal = await kinda5Contract.g1();
            let icut = await kinda5Contract.g5();

            document.getElementById("Pid").innerText = ipid.toString();
            document.getElementById("Bid").innerText = ibid.toString();
            document.getElementById("Betbal").innerText = (ibal / 1e18).toFixed(4);
            document.getElementById("Butbal").innerText = icut.toString();
        } catch (error) {
            console.error("topSync 오류 발생:", error);
        }
    };

    let loadMetaInfo = async () => {
        try {
            let maxPid = await kinda5Contract.pid();
            maxPid = parseInt(maxPid.toString());
            console.log("총 PID 개수:", maxPid);

            let container = document.getElementById("MetaInfoContainer");
            if (!container) {
                console.error("MetaInfoContainer 요소가 없습니다.");
                return;
            }
            container.innerHTML = "";

            for (let i = 0; i < maxPid; i++) {
                let [name, value1, value2, value3, isActive, addr1, addr2, addr3] = await kinda5Contract.metainfo(i);

                const shortAddress = (addr) => addr.slice(0, 6) + "...";

                let card = document.createElement("div");
                card.classList.add("meta-card");

                card.innerHTML = `
                    <img src="/images/kind/${i}.png" alt="상품 이미지" class="meta-image"
                         onerror="this.onerror=null; this.src='../images/kind/default.png';">

                    <div class="meta-content">
                        <h3>${name}</h3>
                        <p><strong>가격:</strong> ${(value1 / 1e18).toFixed(4)} BET</p>
                        <p><strong>멘토보상비율:</strong> ${value2}%</p>
                        <p><strong>출자보상:</strong> ${value3} BUT</p>
                        <p><strong>거래가능여부:</strong> ${isActive ? "✅ 가능" : "❌ 거래완료"}</p>
                        <p><strong>출자자:</strong> ${shortAddress(addr1)}</p>
                        <p><strong>등록자:</strong> ${shortAddress(addr2)}</p>
                        <p><strong>오너:</strong> ${shortAddress(addr3)}</p>
                        <button class="btn btn-outline-success w-100 buy-btn" data-id="${i}">구매하기</button>
                    </div>
                `;

                container.appendChild(card);
            }
        } catch (error) {
            console.error("loadMetaInfo 오류 발생:", error);
        }
    };

    document.getElementById("MetaInfoContainer").addEventListener("click", async function(event) {
        if (event.target.classList.contains("buy-btn")) {
            let pid = event.target.getAttribute("data-id");
            await buyItem(pid, 1);
        }
    });

    async function buyItem(pid, num) {
        if (!signer) {
            await connectWallet();
            signer = provider.getSigner();
            kinda5Contract = new ethers.Contract(kindaddr.kindmarket, kindabi.kindmarket, signer);
        }
        try {
            let tx = await kinda5Contract.buy(pid, num);
            await tx.wait();
            alert(`구매 성공! TX Hash: ${tx.hash}`);
        } catch (e) {
            alert(e.data?.message.replace('execution reverted: ', '') || e.message);
        }
    }

    await connectWallet();
    await topSync();
    await loadMetaInfo();
});
