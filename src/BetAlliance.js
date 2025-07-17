 //0x8133f5271C9636c94d68640E5b4aEF0FF69914b1

const contractAddress = {
    affiliateAddr: "0x8133f5271C9636c94d68640E5b4aEF0FF69914b1",
    BetTokenAddr: "0xBF93D17Dbb666a552bf8De43C8002FE3a3638449"
  };

  const contractAbi = {
    affiliate: [
      "function stores(string memory name,string memory homepage,string memory phone,string memory location,uint,address,uint,uint,uint) public",
      "function pay(uint256 storeId, uint256 amount) external",
      "function withdraw(uint256 storeId) external onlyStoreOwner(storeId)",
      "function tryJackpot() external",
      "function getJackpot() external view returns (uint256)",
      " function getContractBet() public view returns (uint256)",
      "function nextStoreId() public view returns(uint)",
      "function jack() public view returns(uint)",
      "function g1() public view virtual returns(uint256)",
      "function allis(uint num) public view returns(string memory name,string memory home,string memory phone,string memory add,uint rate,address owner,uint pay,uint totalpay)",
      "event reward (uint amount)"
    ],
    BetToken :[
      "function decimals() view returns (uint8)"
    ]
  };

  const MtopDataSync = async () => {
    try {
      // ethers.js setup
      const provider = new ethers.providers.JsonRpcProvider("https://opbnb-mainnet-rpc.bnbchain.org");
      const affiliateContract = new ethers.Contract(
        contractAddress.affiliateAddr,
        contractAbi.affiliate,
        provider
      );

      // Fetch total affiliates count
      const totalAffiliates = await affiliateContract.nextStoreId();
      document.getElementById("Mid").innerText = totalAffiliates;

      // Fetch balance
      const balance = await affiliateContract.getContractBet();
      document.getElementById("Betbal").innerText = (balance / 1e18).toFixed(2);
      
      const jack = await affiliateContract.getJackpot()();
      document.getElementById("Jack").innerText = (jack/ 1e18).toFixed(2);

      affiliateContract.on("reward", async (amount, event) => {
        console.log("Reward event detected!");
        console.log("Amount received:", amount.toString());
    
        // 현재 연결된 사용자의 주소를 가져오기
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        const signer = provider.getSigner();
        const userAddress = await signer.getAddress();
    
        // 이벤트 발생자의 주소를 확인 (event 객체에서 sender 주소를 추출)
        const senderAddress = event.args[0]; // assuming the sender is in the first argument
    
        // 만약 이벤트 발생자가 현재 연결된 사용자와 동일하다면
        if (userAddress.toLowerCase() === senderAddress.toLowerCase()) {
            // Convert amount to a readable format (assuming 1e18 for token decimals)
            const rewardAmount = (amount / 1e18).toFixed(2);
    
            // Display the amount in the alert
            alert(`Reward Amount: ${rewardAmount} BET`);
    
            // Optionally, log the full event
            console.log("Full event data:", event);
        }
    });
    
 


      let menListHtml = "";
      for (let i = 0; i < totalAffiliates; i++) {
        const [name, home, phone, add, rate, owner, pay, totalpay] = await affiliateContract.allis(i);
        const Image = `..\\images\\affiliate\\${i}.png`;
      
        menListHtml += `
          <div class="col-12 col-md-12 col-lg-12 mb-4">

            <div class="card shadow-sm border-0">
              <!-- Image Section -->
              <div class="card-img-top text-center p-3">
                <img src="${Image}" alt="Affiliate ${i}" class="img-fluid rounded" style="max-height: 600px; object-fit: cover;">
              </div>
              
              <!-- Affiliate Information -->
              <div class="card-body text-center">
                <h5 class="card-title text-primary"><strong>Affiliate #${i}</strong></h5>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Home:</strong> ${home}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Address:</strong> ${add}</p>
                <p><strong>Rate:</strong> ${rate}%</p>
                <p><strong>Owner:</strong> ${owner}</p>
                <p><strong>Withdrawal Amount:</strong> ${(pay / 1e18).toFixed(2)} BET</p>
                <p><strong>Cumulative Withdrawal:</strong> ${(totalpay / 1e18).toFixed(2)} BET</p>
              </div>
              
              <!-- Features Section -->
              <div class="card-footer bg-light">
                <button class="btn btn-info btn-sm mb-2 w-100" id="showFeaturesBtn${i}" onclick="toggleFeatures(${i})">See Features</button>
                <div id="featureSection${i}" style="display: none;">
                  <label for="feeInput${i}" class="form-label">Enter Fee Amount:</label>
                  <input type="number" id="feeInput${i}" class="form-control mb-2" placeholder="Enter fee in BET">
                  <button class="btn btn-success btn-sm w-100 mb-2" onclick="charge(${i})">Buy</button>
                  <button class="btn btn-warning btn-sm w-100" onclick="Outpay(${i})">Withdrawal</button>
                </div>
              </div>
              <div id="transactionStatus${i}" class="mt-3">
    <!-- 트랜잭션 영수증이 해당 아이디별로 표시될 영역 -->
</div>
            </div>
          </div>
        `;
      }

      document.getElementById("menList").innerHTML = menListHtml;

      // Add event listeners for feature buttons
      for (let i = 0; i < totalAffiliates; i++) {
        document.getElementById(`showFeaturesBtn${i}`).addEventListener("click", function () {
          const featureSection = document.getElementById(`featureSection${i}`);
          if (featureSection.style.display === "none") {
            featureSection.style.display = "block";
            this.innerText = "Hide Features";
          } else {
            featureSection.style.display = "none";
            this.innerText = "See Features";
          }
        });
      }
    } catch (error) {
      console.error("Error loading affiliate data:", error);
      document.getElementById("menList").innerHTML = `<p class="text-danger">Error loading data. Please try again later.</p>`;
    }
  };

  // Call the function
  MtopDataSync();
  
  let registerAffiliate = async () => {
    try {
        // 입력값 가져오기
        const name = document.getElementById("nameInput").value.trim();
        const home = document.getElementById("homeInput").value.trim();
        const phone = document.getElementById("phoneInput").value.trim();
        const address = document.getElementById("addressInput").value.trim();
        const rate = document.getElementById("rateInput").value.trim();

        // 입력값 확인
        if (!name || !home || !phone || !address || !rate) {
            alert("Please fill in all fields.");
            return;
        }

        if (isNaN(rate) || parseInt(rate) <= 0) {
            alert("Please enter a valid rate.");
            return;
        }

        // ethers.js provider 설정
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        await provider.send("eth_requestAccounts", []); // 지갑 연결 요청
        const signer = provider.getSigner();

        // 스마트 계약 인스턴스 생성
        const affiliateContract = new ethers.Contract(
            contractAddress.affiliateAddr,
            contractAbi.affiliate,
            signer
        );

        // 트랜잭션 실행
        const tx = await affiliateContract.registration(name, home, phone, address, parseInt(rate));

        // 트랜잭션 완료 대기
        const receipt = await tx.wait();
        console.log("Transaction successful:", receipt);

        // UI 업데이트
        document.getElementById("transactionStatus").innerHTML = `
            <p>Registration successful!</p>
            <p>Transaction Hash: <a href="https://bscscan.com/tx/${receipt.transactionHash}" target="_blank">${receipt.transactionHash}</a></p>
        `;
    } catch (e) {
      alert(e.data.message.replace('execution reverted: ', ''));
    }
};




function toggleForm() {
  const form = document.getElementById("registrationForm");
  const toggleButton = document.getElementById("toggleFormButton");

  // 폼 상태 토글 (숨김/표시)
  if (form.style.display === "none") {
      form.style.display = "block";
      toggleButton.textContent = "Hide Registration Form";
  } else {
      form.style.display = "none";
      toggleButton.textContent = "Show Registration Form";
  }
}


document.getElementById(`showFeaturesBtn${i}`).addEventListener("click", function () {
  const featureSection = document.getElementById(`featureSection${i}`);
  if (featureSection.style.display === "none") {
    featureSection.style.display = "block";
    this.innerText = "Hide Features";
  } else {
    featureSection.style.display = "none";
    this.innerText = "See Features";
  }
});

async function charge(id) {
  try {
    const feeInput = document.getElementById(`feeInput${id}`);
    const feeAmount = parseFloat(feeInput.value);

    if (isNaN(feeAmount) || feeAmount <= 0) {
      alert("유효한 금액을 입력하세요.");
      return;
    }

    // ethers.js 제공자 설정 (메타마스크와 같은 Web3 제공자 사용)
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    await provider.send("eth_requestAccounts", []);  // 계정 접근 요청
    const signer = provider.getSigner();

    // Affiliate 계약 인스턴스를 생성
    const affiliateContract = new ethers.Contract(
      contractAddress.affiliateAddr,  // 계약 주소 (실제 주소로 변경)
      contractAbi.affiliate,         // 계약 ABI (실제 ABI로 변경)
      signer                          // 트랜잭션 서명을 위한 signer
    );

    // buy 함수 호출, id와 feeAmount를 파라미터로 전달
    const tx = await affiliateContract.buy(id, feeAmount);

    // 트랜잭션이 처리될 때까지 기다림
    const receipt = await tx.wait();

    // 트랜잭션 성공 시 콘솔에 영수증 정보 출력
    console.log("트랜잭션 성공:", receipt);

    // 해당 ID에 대한 영수증을 화면에 표시
    displayReceipt(id, receipt, feeAmount);

    alert("Purchase completed successfully!");

  } catch (e) {
    const errorMessage = e.data ? e.data.message.replace('execution reverted: ', '') : e.message;
    alert(`오류 발생: ${errorMessage}`);
    console.error("트랜잭션 실패:", errorMessage, e);
  }
}

// 영수증을 해당 ID에 표시하는 함수
function displayReceipt(id, receipt, feeAmount) {
  const receiptElement = document.getElementById(`transactionStatus${id}`);

  // 영수증 내용 표시
  const receiptContent = `
<h5>Transaction Receipt</h5>
<p><strong>Transaction Hash:</strong> <a href="https://opbnbscan.com/tx/${receipt.transactionHash}" target="_blank">${receipt.transactionHash}</a></p>
<p><strong>Block Number:</strong> ${receipt.blockNumber}</p>
<p><strong>Block Hash:</strong> ${receipt.blockHash}</p>
<p><strong>Status:</strong> ${receipt.status === 1 ? 'Success' : 'Failure'}</p>
<p><strong>Amount Paid:</strong> ${feeAmount} BET</p>
  `;

  // 화면에 표시
  receiptElement.innerHTML = receiptContent;
}




// Function to handle the withdrawal (outpay)
async function Outpay(id) {
  try {
    // Set up ethers.js provider and contract instance
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    await provider.send("eth_requestAccounts", []);  // Request account access
    const signer = provider.getSigner();

    const affiliateContract = new ethers.Contract(
      contractAddress.affiliateAddr,
      contractAbi.affiliate,
      signer
    );

    // Call the 'outpay' function with the provided affiliate id
    const tx = await affiliateContract.outpay(id);
    
    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    
    console.log("Withdrawal successful:", receipt);
    alert("Withdrawal successful!");

    // Optionally, update the UI with new data after withdrawal, if needed
    // For example, refreshing the balance or affiliate information
    MtopDataSync(); // Call the MtopDataSync function to refresh the data

  } catch (e) {
    alert(e.data.message.replace('execution reverted: ', ''));
  }
}
