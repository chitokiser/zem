const RelayLottoAddress = {
    RelayLottoAddr: "0xcAd10e4aE9b4579810ce99de6a8eec64C00C2e5e",
};

const RelayLottoAbi = {
    RelayLotto: [
        "function createGame(uint256[] memory _answer) public",
        "function withdraw(uint _wid) public",
        "function guess(uint256 _wid, uint256[] memory _guess) external",
        "function wid() public view returns(uint)",
        "function price() public view returns(uint)",
        "function getAttempt(uint _attemptNumber, uint _wid) external view returns (string memory word, string memory feedback)",
        "function games(uint wid) public view returns (uint256 depo, address owner)",
        "event GameCreated(uint256 indexed gameId, address indexed creator, uint256 rewardPool)",
        "event GuessMade(uint256 indexed gameId, address indexed player, uint256[] guess, uint256 reward)",
        "event GameEnded(uint256 indexed gameId, address winner, uint256 reward)"
    ]
};

const Priceup = async () => {
    try {

     // ethers setup
      const provider = new ethers.providers.JsonRpcProvider('https://1rpc.io/opbnb');
      const RelayLottoWithSigner = new ethers.Contract(
        RelayLottoAddress.RelayLottoAddr,
        RelayLottoAbi.RelayLotto,
        provider
    );
      let wprice = await RelayLottoWithSigner.price();
      document.getElementById("Wprice").innerHTML = parseFloat(wprice/ 1e18).toFixed(2);
    } catch (e) {
      // 에러 발생 시 아무 작업도 하지 않음
      console.error(e); // 필요 시 콘솔에만 에러를 출력
    }
  };
  
  Priceup();

const provider = new ethers.providers.JsonRpcProvider('https://1rpc.io/opbnb');

// Sync data and display games
const syncRelayGameData = async () => {
    try {
        if (!window.ethereum) {
            alert("MetaMask or Ethereum wallet is required!");
            return;
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const signer = provider.getSigner();
        const RelayLottoWithSigner = new ethers.Contract(
            RelayLottoAddress.RelayLottoAddr,
            RelayLottoAbi.RelayLotto,
            signer
        );

        const currentWid = await RelayLottoWithSigner.wid();
        const gameList = document.getElementById("gameList");
        gameList.innerHTML = "";

        for (let i = 0; i < currentWid; i++) {
            const gameData = await RelayLottoWithSigner.games(i);
            const deposit = (gameData.depo / 1e18).toFixed(2);

            const card = document.createElement("div");
            card.className = "card mb-3";
            card.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">Game ID: ${i}</h5>
                    <p class="card-text"><strong>Jackpot:</strong> ${deposit} BET</p>
                    <p class="card-text"><strong>Owner:</strong> ${gameData.owner}</p>
                    <div id="input-container-${i}" class="input-container"></div>
                    <button id="attempt-button-${i}" class="btn btn-primary">Submit Attempt</button>
                    <button id="withdraw-button-${i}" class="btn btn-warning">Owner Withdraw</button>
                    <p id="feedback-${i}" class="text-info mt-2"></p>
                </div>
            `;
            gameList.appendChild(card);

            await renderAllAttempts(i, RelayLottoWithSigner);

            document.getElementById(`attempt-button-${i}`).addEventListener("click", async () => {
                await handleAttemptButtonClick(i, RelayLottoWithSigner);
            });

            document.getElementById(`withdraw-button-${i}`).addEventListener("click", async () => {
                await handleWithdraw(i, RelayLottoWithSigner);
            });
        }
    } catch (error) {
        console.error("Error syncing game data:", error);
    }
};

// Render All Attempts
const renderAllAttempts = async (gameId, contract) => {
    const inputContainer = document.getElementById(`input-container-${gameId}`);
    inputContainer.innerHTML = ""; // Clear previous content
    const maxAttempts = 11;

    for (let attemptNumber = 1; attemptNumber <= maxAttempts; attemptNumber++) {
        try {
            const attemptData = await contract.getAttempt(attemptNumber, gameId);
            const submittedNumbers = attemptData.word.split(',');
            const feedback = attemptData.feedback;

            const attemptRow = createInputRow(gameId, attemptNumber, submittedNumbers);
            applyFeedbackToInputs(attemptRow, feedback);
            inputContainer.appendChild(attemptRow);
        } catch (error) {
            if (attemptNumber === 1 || inputContainer.childElementCount < maxAttempts) {
                const newInputRow = createInputRow(gameId, "new");
                inputContainer.appendChild(newInputRow); // Add new input row for next attempt
            }
            break;
        }
    }
};

// Handle Attempt Submission
const handleAttemptButtonClick = async (gameId, contract) => {
    try {
        const inputContainer = document.getElementById(`input-container-${gameId}`);
        const currentRow = inputContainer.querySelector(".input-row.new");
        const inputs = Array.from(currentRow.querySelectorAll(".input-number"));
        const numbers = inputs.map(input => Number(input.value));

        if (numbers.length !== 5 || numbers.some(num => isNaN(num) || num < 1 || num > 45)) {
            alert("Invalid input. Please enter exactly 5 numbers between 1 and 45.");
            return;
        }

        const tx = await contract.guess(gameId, numbers);
        const receipt = await tx.wait();

        if (receipt.status === 1) {
            await renderAllAttempts(gameId, contract); // Refresh attempts after successful submission
        } else {
            throw new Error("Transaction failed.");
        }
    } catch (error) {
        console.error("Error submitting attempt:", error);
        alert(error.data?.message || error.message || "An error occurred.");
    }
};

// Apply Feedback to Inputs
const applyFeedbackToInputs = (inputRow, feedback) => {
    const inputs = Array.from(inputRow.querySelectorAll(".input-number"));
    feedback.split("").forEach((feedbackChar, idx) => {
        const input = inputs[idx];
        switch (feedbackChar) {
            case "G":
                input.style.backgroundColor = "lightgreen";
                break;
            case "Y":
                input.style.backgroundColor = "yellow";
                break;
            case "X":
                input.style.backgroundColor = "gray";
                break;
            default:
                input.style.backgroundColor = "";
        }
    });
};

// Create Input Row
const createInputRow = (gameId, attemptNumber, values = []) => {
    const inputRow = document.createElement("div");
    inputRow.className = `d-flex mb-2 input-row ${attemptNumber === "new" ? "new" : ""}`;
    inputRow.id = `input-row-${attemptNumber}-${gameId}`;

    Array.from({ length: 5 }).forEach((_, idx) => {
        const input = document.createElement("input");
        input.type = "number";
        input.className = "form-control input-number";
        input.min = 1;
        input.max = 45;
        input.value = values[idx] || "";
        input.disabled = attemptNumber !== "new";
        input.style.marginRight = "10px";
        input.style.width = "60px";
        inputRow.appendChild(input);
    });

    return inputRow;
};

// Withdraw Handler
const handleWithdraw = async (gameId, contract) => {
    try {
        const tx = await contract.withdraw(gameId);
        const receipt = await tx.wait();

        if (receipt.status === 1) {
            alert("Withdrawal successful!");
            location.reload();
        } else {
            throw new Error("Transaction failed.");
        }
    } catch (error) {
        console.error("Error withdrawing funds:", error);
        alert(error.data?.message || error.message || "Withdraw failed.");
    }
};

// Initialize Data Sync
syncRelayGameData();


// Handle game creation
const CreateGame = async () => {
    try {
        const answer = [
            parseInt(document.getElementById('num1').value),
            parseInt(document.getElementById('num2').value),
            parseInt(document.getElementById('num3').value),
            parseInt(document.getElementById('num4').value),
            parseInt(document.getElementById('num5').value)
        ];

        if (answer.length !== 5 || answer.some(num => isNaN(num) || num < 1 || num > 45)) {
            alert("Invalid input. Please enter 5 numbers between 1 and 45.");
            return;
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const RelayLottoWithSigner = new ethers.Contract(
            RelayLottoAddress.RelayLottoAddr,
            RelayLottoAbi.RelayLotto,
            signer
        );

        const tx = await RelayLottoWithSigner.createGame(answer);
        await tx.wait();
        alert("Game created successfully!");
        location.reload();
    } catch (e) {
        console.error("Error creating game:", e);
        alert(e.data?.message || e.message || "An error occurred.");
    }
};