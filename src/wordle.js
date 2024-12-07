//0x71c880a6C87Ad5C11FF2cB498f6c82F1A11280AE

const wordleAddress = {
    wordleAddr: "0x8EfA4325E52DbF75BE59137DeEFf926359C6ed63",
};

const wordleAbi = {
    wordle: [
        "function startGame(string memory _answer) public",
        "function withdraw(uint _wid) public",
        "function makeAttempt(string memory _word, uint _wid) public",
        "function wid() public view returns(uint)",
        "function price() public view returns(uint)",
        "function getAttempt(uint _attemptNumber, uint _wid) external view returns (string memory word, string memory feedback)",
        "function games(uint wid) public view returns (string memory answer, uint depo, address owner, uint wid)",
        "event GameStarted(address indexed player, string hint)",
        "event AttemptMade(address indexed player, uint attemptNumber, string feedback)",
        "event GameEnded(address indexed player, bool success, uint reward)"
    ]
 
};


const Priceup = async () => {
    try {

     // ethers setup
      const provider = new ethers.providers.JsonRpcProvider('https://1rpc.io/opbnb');
    const wordleContract = new ethers.Contract(
        wordleAddress.wordleAddr,
        wordleAbi.wordle,
        provider)
      let wprice = await wordleContract.price();
      document.getElementById("Wprice").innerHTML = parseFloat(wprice/ 1e18).toFixed(2);
    } catch (e) {
      // 에러 발생 시 아무 작업도 하지 않음
      console.error(e); // 필요 시 콘솔에만 에러를 출력
    }
  };
  
  Priceup();



// Initialize the Wordle Game
const WtopDataSync = async () => {
    try {
        if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const signer = provider.getSigner();
            const wordleWithSigner = new ethers.Contract(
                wordleAddress.wordleAddr,
                wordleAbi.wordle,
                signer
            );
         
            const currentWid = await wordleWithSigner.wid();
            const gameList = document.getElementById("gameList");
            gameList.innerHTML = ""; // Clear previous content to avoid duplicates
       
            for (let i = 0; i < currentWid; i++) {
                const gameData = await wordleWithSigner.games(i);
                const deposit = ethers.utils.formatEther(gameData.depo);

                // Create game card
                const card = document.createElement("div");
                card.className = "card mb-3";
                card.innerHTML = `
                    <div class="card-body">
                        <h5 class="card-title">Game ID: ${i}</h5>
                        <p class="card-text"><strong>Deposit:</strong> ${deposit} BET</p>
                        <p class="card-text"><strong>Owner:</strong> ${gameData.owner}</p>
                        <div class="form-group">
                            <label>Enter 6 uppercase letters one by one:</label>
                            <div id="input-container-${i}" class="vertical-input-container"></div>
                            <button id="attempt-button-${i}" class="btn btn-primary">Submit Attempt</button>
                              <button id="withdrawButton-${i}" class="btn btn-warning">Owner Withdraw</button>
                            </div>
                        <p id="feedback-${i}" class="text-info mt-2"></p>
                    </div>
                `;
                gameList.appendChild(card);

                // Render all attempts
                await renderAllAttempts(i, wordleWithSigner);

                // Add event listener for Submit button
                document.getElementById(`attempt-button-${i}`).addEventListener("click", async () => {
                    await handleAttemptButtonClick(i, wordleWithSigner);
                });
                document.getElementById(`withdrawButton-${i}`).addEventListener("click", async () => {
                    await handleWithdraw(i, wordleWithSigner);
                });
            }
        } else {
            alert("MetaMask or Ethereum wallet is required!");
        }
    } catch (error) {
        console.error("Error:", error);
    }
};

// Handle Attempt Submission
const handleAttemptButtonClick = async (gameId, contract) => {
    try {
        const currentRow = document.querySelector(`#input-container-${gameId} .input-row:last-child`);
        const inputs = Array.from(currentRow.querySelectorAll(".input-letter"));
        const word = inputs.map(input => input.value.toUpperCase()).join('');

        if (word.length !== 6 || !/^[A-Z]{6}$/.test(word)) {
            throw new Error("Invalid word. Please enter exactly 6 uppercase letters.");
        }

        // Submit attempt and wait for confirmation
        const tx = await contract.makeAttempt(word, gameId);
        const receipt = await tx.wait(); // Wait for transaction confirmation

        if (receipt.status === 1) {
            // Refresh the page once transaction is confirmed
            
        } else {
            throw new Error("Transaction failed.");
        }
    } catch (error) {
        const feedbackContainer = document.getElementById(`feedback-${gameId}`);
        feedbackContainer.innerText = error.data?.message || error.message || "An error occurred.";
    }
};

// Render All Attempts
const renderAllAttempts = async (gameId, contract) => {
    const maxAttempts = 5;
    let lastAttemptIndex = 0;

    for (let attemptNumber = 0; attemptNumber < maxAttempts; attemptNumber++) {
        try {
            const attemptData = await contract.getAttempt(attemptNumber + 1, gameId);
            const submittedWord = attemptData.word;
            const feedback = attemptData.feedback;

            // Create input row if not exists
            createInputRowIfNeeded(gameId, attemptNumber);

            // Apply feedback to inputs
            applyFeedbackToInputs(submittedWord, feedback, gameId, attemptNumber);

            lastAttemptIndex = attemptNumber + 1; // Update last valid attempt
        } catch (error) {
            if (error.data?.message.includes("Invalid attempt number")) {
                createNewInputFields(gameId, lastAttemptIndex); // Add a new input field
                break;
            } else {
                console.error("Error fetching attempt data:", error);
            }
        }
    }
};

// Apply Feedback to Inputs
const applyFeedbackToInputs = (word, feedback, gameId, attemptNumber) => {
    const inputs = Array.from(
        document.querySelectorAll(`#input-row-${attemptNumber}-${gameId} .input-letter`)
    );

    word.split('').forEach((char, idx) => {
        const input = inputs[idx];
        if (!input) return;

        input.value = char;
        input.disabled = true;

        switch (feedback[idx]) {
            case 'G':
                input.style.backgroundColor = 'lightgreen';
                break;
            case 'Y':
                input.style.backgroundColor = 'yellow';
                break;
            case 'X':
                input.style.backgroundColor = 'gray';
                break;
            default:
                input.style.backgroundColor = '';
        }
    });
};

// Create Input Row If Needed
const createInputRowIfNeeded = (gameId, attemptNumber) => {
    const inputContainer = document.getElementById(`input-container-${gameId}`);
    const existingRow = document.getElementById(`input-row-${attemptNumber}-${gameId}`);

    if (existingRow) return;

    const newInputRow = document.createElement("div");
    newInputRow.className = "d-flex mb-3 input-row";
    newInputRow.id = `input-row-${attemptNumber}-${gameId}`;

    Array.from({ length: 6 }).forEach((_, idx) => {
        const input = document.createElement("input");
        input.type = "text";
        input.className = "form-control input-letter";
        input.maxLength = 1;
        newInputRow.appendChild(input);
    });

    inputContainer.appendChild(newInputRow);
};

// Create New Input Fields for Next Attempt
const createNewInputFields = (gameId, attemptNumber) => {
    createInputRowIfNeeded(gameId, attemptNumber);
};



// Withdraw 핸들러 함수
const handleWithdraw = async (wid, contract) => {
    try {
        // Withdraw 트랜잭션 실행
        const tx = await contract.withdraw(wid);
        console.log(`Transaction sent: ${tx.hash}`);

        // "Processing" 메시지 표시
        const resultContainer = document.createElement("p");
        resultContainer.id = `withdrawResult-${wid}`;
        resultContainer.innerText = "Processing transaction...";
        document.getElementById(`withdrawButton-${wid}`).parentNode.appendChild(resultContainer);

        // 트랜잭션 확인 대기
        const receipt = await tx.wait();

        if (receipt.status === 1) {
            // 성공 메시지
            resultContainer.innerText = "Withdrawal successful!";
            console.log("Transaction successful:", receipt);
            location.reload();
        } else {
            // 실패 메시지
            throw new Error("Transaction failed.");
        }
    } catch (error) {
        console.error("Withdraw failed:", error);
        // 에러 메시지 표시
        const resultContainer = document.getElementById(`withdrawResult-${wid}`);
        if (resultContainer) {
            resultContainer.innerText = 
                error.data?.message || error.message || "Withdraw failed.";
        }
    }
};




WtopDataSync();


let StartGame = async () => {
    let userProvider = new ethers.providers.Web3Provider(window.ethereum, "any");
    
    // 네트워크 추가 요청 (필요 시 삭제 가능)
    await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
            chainId: "0xCC", // opBNB 네트워크 체인 ID
            rpcUrls: ["https://opbnb-mainnet-rpc.bnbchain.org"], // opBNB RPC URL
            chainName: "opBNB", // 네트워크 이름
            nativeCurrency: {
                name: "BNB",
                symbol: "BNB",
                decimals: 18
            },
            blockExplorerUrls: ["https://opbnbscan.com"] // 블록 탐색기 URL
        }]
    });

    // 사용자 계정 연결 요청
    await userProvider.send("eth_requestAccounts", []);
    let signer = userProvider.getSigner();

    // 스마트 컨트랙트 인스턴스 생성
    let wordleContract = new ethers.Contract(
        wordleAddress.wordleAddr, // 스마트 컨트랙트 주소
        wordleAbi.wordle,         // ABI
        signer                    // Signer
    );

    try {
        // HTML 입력 필드에서 값을 가져와 함수 호출
        let answer = document.getElementById('gameAnswer').value;
        const tx = await wordleContract.startGame(answer);

        // 트랜잭션 대기
        console.log("Transaction sent successfully. Confirming...");
        await tx.wait();

        console.log("Your game has been successfully registered!");

        // 트랜잭션 성공 시 페이지 새로고침
        location.reload();
    } catch (e) {
        alert(e.data?.message.replace('execution reverted: ', '') || e.message);
    }
};
