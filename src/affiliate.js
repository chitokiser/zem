 //0x69664D033214F9CA92b764361087C69dF4CF3fc1

const contractAddress = {
    affiliateAddr: "0x0E847436D632E614e28EbA9505593516975f3661",
  };

  const contractAbi = {
    affiliate: [
      "function registration(string memory name,string memory home,string memory phone,string memory add,uint rate) public",
      "function buy(uint id,uint _fee) public",
      "function outpay(uint id) public",
      "function aid() public view returns(uint)",
      "function jack() public view returns(uint)",
      "function g1() public view virtual returns(uint256)",
      "function allis(uint num) public view returns(string memory name,string memory home,string memory phone,string memory add,uint rate,address owner,uint pay,uint totalpay)",
      "event reward (uint amount);"
    ],
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
      const totalAffiliates = await affiliateContract.aid();
      document.getElementById("Mid").innerText = totalAffiliates;

      // Fetch balance
      const balance = await affiliateContract.g1();
      document.getElementById("Betbal").innerText = (balance / 1e18).toFixed(2);
      
      const jack = await affiliateContract.jack();
      document.getElementById("Jack").innerText = (jack/ 1e9).toFixed(2);

      affiliateContract.on("reward", (amount, event) => {
        console.log("Reward event detected!");
        console.log("Amount received:", amount.toString());
    
        // Convert amount to a readable format (assuming 1e18 for token decimals)
        const rewardAmount = (amount / 1e18).toFixed(2);
    
        // Display the amount in the alert
        alert(`Reward Amount: ${rewardAmount} BET`);
    
        // Optionally, log the full event
        console.log("Full event data:", event);
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
                  <input type="number" id="feeInput${i}" class="form-control mb-2" placeholder="Enter fee in BNB">
                  <button class="btn btn-success btn-sm w-100 mb-2" onclick="charge(${i})">Buy</button>
                  <button class="btn btn-warning btn-sm w-100" onclick="Outpay(${i})">Withdrawal</button>
                </div>
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

// The charge function that calls the buy function on the contract
async function charge(id) {
  try {
    const feeInput = document.getElementById(`feeInput${id}`);
    const feeAmount = parseFloat(feeInput.value);

    if (isNaN(feeAmount) || feeAmount <= 0) {
      alert("Please enter a valid fee amount.");
      return;
    }

    // Set up ethers.js provider
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    await provider.send("eth_requestAccounts", []);  // Request account access
    const signer = provider.getSigner();

    // Contract instance
    const affiliateContract = new ethers.Contract(
      contractAddress.affiliateAddr,
      contractAbi.affiliate,
      signer
    );

    // Call the buy function with the provided fee and affiliate id
    const tx = await affiliateContract.buy(id,feeAmount);
    
    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    
    console.log("Transaction successful:", receipt);
    alert("Purchase successful!");

  } catch (e) {
    alert(e.data.message.replace('execution reverted: ', ''));
  }
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
