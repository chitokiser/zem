
   //history 

   let contractAddress = {
    trustAddr: "0x6fd803fF2DE336DAbd46cF69FDfF4c80e6eA812E", // but bank trust contract address
  }; 
  
  let contractAbi = {
    trust: [
      "function manAdd(string memory _name,uint _pay) public",
      "function designateSpender(address _spender, uint256 amount) public",
      "function removeSpender(address _spender) public",
      "function withdraw(uint _mid) public",
      "function charge(uint256 pay) public",
      "function getMid(address user) public view virtual returns(uint256)",
      "function getPay(uint256 _mid) public view returns (uint256)",
      "function getPayTime(uint256 _mid) public view returns (uint256)",
      "function g1() public view virtual returns(uint256)",
      "function mid( ) public view returns(uint)", 
      "function men(uint num) public view returns(string memory,uint,uint,address)",

    ]
  };


  const MtopDataSync = async () => {
    try {
      // ethers.js setup
      const provider = new ethers.providers.JsonRpcProvider('https://opbnb-mainnet-rpc.bnbchain.org');
      const trustContract = new ethers.Contract(contractAddress.trustAddr, contractAbi.trust, provider);
  
      // Retrieve total `mid` count
      const midCount = await trustContract.mid();
      document.getElementById("Mid").innerText = midCount;
  
      // Retrieve g1 balance
      const g1Balance = await trustContract.g1();
      document.getElementById("Betbal").innerText = (g1Balance / 1e18).toFixed(2) + " BET"; // Add "BET" to balance
  
      // Loop through each `mid` and fetch data from `men`
      let menListHtml = ""; // Accumulate HTML content
      for (let i = 0; i <= midCount; i++) {
        const menData = await trustContract.men(i); // Fetch men data
        const [name, pay, payTime, address] = menData; // Destructure the response
  
        // Convert UNIX time to readable date
        const date = new Date(payTime * 1000); // Convert seconds to milliseconds
        const formattedDate = date.toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
  
        // Create a list item for each entry
        menListHtml += `
          <div class="men-item card mb-3" style="max-width: 600px; margin: 20px auto; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            <div class="card-header" style="background-color: #f8f9fa; font-size: 1.2rem;">
              <strong>Money Manager ID #${i}</strong>
            </div>
            <div class="card-body" style="background-color: #ffffff; padding: 15px;">
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Deposit:</strong> ${(pay / 1e18).toFixed(2)} BET</p>
              <p><strong>Join date:</strong> ${formattedDate}</p>
              <p><strong>Owner:</strong> ${address}</p>
              <hr>
  
            
    
  
              <!-- 기능 보기 버튼 -->
              <button id="showFeaturesBtn${i}" class="btn btn-outline-info" style="padding: 10px 20px; font-size: 1rem; background-color: #17a2b8; color: white; border-radius: 5px; border: none; transition: background-color 0.3s;">
             See Money Manager features
              </button>
  
              <!-- 숨겨진 기능들 -->
              <div id="featureSection${i}" style="display: none; margin-top: 20px;">
                <div class="mb-3">
                  <label for="chargeInput${i}" class="form-label">Deposit Recharge:</label>
                  <input type="number" id="chargeInput${i}" class="form-control" placeholder="Enter amount" style="max-width: 200px;" />
                </div>
  
                <button class="btn btn-outline-success" onclick="Charge(${i})" style="padding: 10px 20px; font-size: 1rem; background-color: #28a745; color: white; border-radius: 5px; border: none; transition: background-color 0.3s;">
                  Charge
                </button>
                
                <hr>
  
                <div class="mb-3">
                  <label for="spenderInput${i}" class="form-label">Spender Address:</label>
                  <input type="text" id="spenderInput${i}" class="form-control" placeholder="Enter spender address" />
                </div>
  
                <div class="mb-3">
                  <label for="spenderAmountInput${i}" class="form-label">Amount to Designate:</label>
                  <input type="number" id="spenderAmountInput${i}" class="form-control" placeholder="Enter amount" />
                </div>
  
                <button class="btn btn-outline-warning" onclick="designateSpender(${i})" style="padding: 10px 20px; font-size: 1rem; background-color: #ffc107; color: white; border-radius: 5px; border: none; transition: background-color 0.3s;">
                  Designate Spender
                </button>
              </div>
            </div>
          </div>
        `;
      }
  
      // Inject the HTML into the `div`
      document.getElementById("menList").innerHTML = menListHtml;
  
      // Add click event listeners for each "기능 보기" button
      for (let i = 0; i <= midCount; i++) {
        document.getElementById(`showFeaturesBtn${i}`).addEventListener("click", function() {
          const featureSection = document.getElementById(`featureSection${i}`);
          
          // 펼치기/접기 동작
          if (featureSection.style.display === "none") {
            featureSection.style.display = "block";
            this.innerText = "Hide feature"; // 버튼 텍스트 변경
          } else {
            featureSection.style.display = "none";
            this.innerText = "See Money Manager features"; // 버튼 텍스트 변경
          }
        });
      }
  
    } catch (error) {
      console.error("Error fetching men data:", error);
      document.getElementById("menList").innerHTML = `<p>Error loading data. Please try again later.</p>`;
    }
  };
  
  // Call the function
  MtopDataSync();
  



  let ManAdd = async () => {
    try {
      // 입력 값 가져오기
      const name = document.getElementById("nameInput").value;
      const payAmount = document.getElementById("payInput").value;
    
      // 입력 값 확인
      if (!name || !payAmount) {
        alert("Please enter both Name and Deposit Amount.");
        return;
      }
  
      // payAmount가 숫자인지 확인
      if (isNaN(payAmount) || payAmount <= 0) {
        alert("Please enter a valid deposit amount.");
        return;
      }
  
      // ethers.js provider setup
      const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
      await provider.send("eth_requestAccounts", []); // 지갑 연결 요청
      const signer = provider.getSigner();
  
      // 스마트 계약 인스턴스 생성
      const trustContract = new ethers.Contract(contractAddress.trustAddr, contractAbi.trust, signer);
  
      // 트랜잭션 전송 (payAmount 그대로 사용, name은 string 타입)
      const tx = await trustContract.manAdd(name,payAmount); 
  
      // 트랜잭션이 처리될 때까지 대기
      const receipt = await tx.wait();
      console.log("Transaction successful:", receipt);
  
      // UI 업데이트
      document.getElementById("transactionStatus").innerHTML = `
        <p>Transaction successful!</p>
        <p>Transaction Hash: <a href="https://bscscan.com/tx/${receipt.transactionHash}" target="_blank">${receipt.transactionHash}</a></p>
      `;
    }catch(e) {
        alert(e.data.message.replace('execution reverted: ',''))
      }
  };
  


  let Charge = async (i) => {
    try {
      // Get charge amount for the specific user
      const chargeAmount = document.getElementById(`chargeInput${i}`).value;
  
      // Validate charge amount
      if (isNaN(chargeAmount) || chargeAmount <= 0) {
        alert("Please enter a valid deposit amount.");
        return;
      }
  
      // ethers.js provider setup
      const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
      await provider.send("eth_requestAccounts", []); // 지갑 연결 요청
      const signer = provider.getSigner();
  
      // 스마트 계약 인스턴스 생성
      const trustContract = new ethers.Contract(contractAddress.trustAddr, contractAbi.trust, signer);
  
      // 트랜잭션 전송 (chargeAmount는 uint256로 전달)
      const tx = await trustContract.charge(ethers.BigNumber.from(chargeAmount.toString()));
  
      // 트랜잭션이 처리될 때까지 대기
      const receipt = await tx.wait();
      console.log("Transaction successful:", receipt);
  
      // UI 업데이트
      document.getElementById("transactionStatus").innerHTML = `
        <p>Transaction successful!</p>
        <p>Transaction Hash: <a href="https://bscscan.com/tx/${receipt.transactionHash}" target="_blank">${receipt.transactionHash}</a></p>
      `;
    } catch (e) {
      // 에러 처리: revert 메시지 출력
      alert(e.data ? e.data.message.replace('execution reverted: ', '') : e.message);
    }
  };
  


  let designateSpender = async (i) => {
    try {
        // 입력 값 가져오기
        const spenderAddress = document.getElementById(`spenderInput${i}`).value;
        const amount = document.getElementById(`spenderAmountInput${i}`).value;

        // 입력 값 확인
        if (!spenderAddress || !amount) {
            alert("Please enter both Spender Address and Amount.");
            return;
        }

        // `amount`가 숫자인지 확인
        if (isNaN(amount) || amount <= 0) {
            alert("Please enter a valid amount.");
            return;
        }

        // ethers.js provider setup
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        await provider.send("eth_requestAccounts", []); // 지갑 연결 요청
        const signer = provider.getSigner();

        // 스마트 계약 인스턴스 생성
        const trustContract = new ethers.Contract(contractAddress.trustAddr, contractAbi.trust, signer);

        // 트랜잭션 전송 (spenderAddress와 amount)
        const tx = await trustContract.designateSpender(spenderAddress, amount);

        // 트랜잭션이 처리될 때까지 대기
        const receipt = await tx.wait();
        console.log("Transaction successful:", receipt);

        // UI 업데이트
        document.getElementById("transactionStatus").innerHTML = `
            <p>Transaction successful!</p>
            <p>Transaction Hash: <a href="https://bscscan.com/tx/${receipt.transactionHash}" target="_blank">${receipt.transactionHash}</a></p>
        `;
    } catch (e) {
        alert(e.data.message.replace('execution reverted: ', ''));
    }
};

let getPayInfo = async (mid) => {
    try {
      // ethers.js provider setup
      const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
      await provider.send("eth_requestAccounts", []); // 지갑 연결 요청
      const signer = provider.getSigner();
  
      // 스마트 계약 인스턴스 생성
      const trustContract = new ethers.Contract(contractAddress.trustAddr, contractAbi.trust, signer);
  
      // getPay와 getPayTime 호출
      const pay = await trustContract.getPay(mid);
      const payTime = await trustContract.getPayTime(mid);
  
      // 7일을 초로 변환 (7일 * 24시간 * 60분 * 60초)
      const sevenDaysInSeconds = 7 * 24 * 60 * 60;
  
      // payTime에 7일을 더한 시간
      const withdrawalTime = parseInt(payTime, 10) + sevenDaysInSeconds; // payTime을 명확하게 숫자로 변환
  
      // 현재 시간 (UNIX 타임스탬프)
      const currentTime = Math.floor(Date.now() / 1000); // 밀리초 -> 초로 변환
  
      // 남은 시간 계산
      const remainingTimeInSeconds = withdrawalTime - currentTime;
  
      if (remainingTimeInSeconds > 0) {
        // 남은 시간이 있을 경우, 이를 일, 시간, 분, 초로 변환
        const days = Math.floor(remainingTimeInSeconds / (24 * 60 * 60)); // 일 계산
        const hours = Math.floor((remainingTimeInSeconds % (24 * 60 * 60)) / 3600); // 시간 계산
        const minutes = Math.floor((remainingTimeInSeconds % 3600) / 60); // 분 계산
        const seconds = remainingTimeInSeconds % 60; // 초 계산
  
        // UI 업데이트
        document.getElementById("payAmount").innerText = `MyPay: ${(pay / 1e18).toFixed(2)} BET`; // BET 단위
        document.getElementById("payTime").innerText = `Time remaining: ${days}day ${hours}h ${minutes}m ${seconds}s`;
      } else {
        document.getElementById("payTime").innerText = "Withdrawal period has passed.";
      }
    } catch (error) {
      console.error("Error getting pay info:", error);
      document.getElementById("payTime").innerText = "Error fetching data. Please try again later.";
    }
  };
  
  
      


let withdrawFunds = async () => {
    try {
      // MID 값을 가져오기
      const mid = document.getElementById("midInput").value;
    
      // MID 값이 없으면 경고 메시지 표시
      if (!mid) {
        alert("Please enter your MID.");
        return;
      }
  
      // ethers.js provider setup
      const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
      await provider.send("eth_requestAccounts", []); // 지갑 연결 요청
      const signer = provider.getSigner();
  
      // 스마트 계약 인스턴스 생성
      const trustContract = new ethers.Contract(contractAddress.trustAddr, contractAbi.trust, signer);
  
      // withdraw 함수 호출
      const tx = await trustContract.withdraw(mid);
  
      // 트랜잭션이 처리될 때까지 대기
      const receipt = await tx.wait();
      console.log("Transaction successful:", receipt);
  
      // UI 업데이트
      document.getElementById("transactionStatus").innerHTML = `
        <p>Transaction successful!</p>
        <p>Transaction Hash: <a href="https://bscscan.com/tx/${receipt.transactionHash}" target="_blank">${receipt.transactionHash}</a></p>
      `;
    } catch (e) {
        alert(e.data.message.replace('execution reverted: ', ''));
    }
  };
  