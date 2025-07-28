/*************************************
 *  기본 설정
 *************************************/
const RelayLottoAddress = {
  RelayLottoAddr: "0x0A48566cc662Af153823139a04FbCe2165DaCC9b" // ZumLotto
};

const RelayLottoAbi = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "gameId", "type": "uint256" },
      { "internalType": "uint256[]", "name": "numbers", "type": "uint256[]" }
    ],
    "name": "guess",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  "function wid() view returns(uint256)",
  "function jack() view returns(uint256)",
  "function tries(address, uint256) view returns(uint8)",
  "function createGame(uint256[])",
  "function getGameInfo(uint256) view returns(bool, address)",
  "function jackup(uint256)",
  "function setStaff(address, uint8)",
  "function getmento(address) view returns(address)",
  "event GameCreated(uint256 indexed gameId)",
  "event GuessMade(uint256 indexed gameId, address indexed user, uint256 matched)",
  "event GameEnded(uint256 indexed gameId, address indexed winner, uint256 reward)"
];

const RPC = "https://1rpc.io/opbnb";

/*************************************
 *  잭팟 및 게임 ID(wid) 표시
 *************************************/
async function Data() {
  try {
    const provider = new ethers.providers.JsonRpcProvider(RPC);
    const contract = new ethers.Contract(RelayLottoAddress.RelayLottoAddr, RelayLottoAbi, provider);

    const [jackBN, widBN] = await Promise.all([
      contract.jack(),
      contract.wid()
    ]);

    const jackFormatted = ethers.utils.formatUnits(jackBN, 19 ); 
    const wid = widBN.toString();

    const jackElem = document.getElementById("Jack");
    const widElem = document.getElementById("Wid");
    if (jackElem) jackElem.textContent = (+jackFormatted).toFixed(4);
    if (widElem) widElem.textContent = wid;

  } catch (error) {
    console.error("❌ Data() error:", error);
  }
}

/*************************************
 *  게임 생성
 *************************************/
async function CreateGame() {
  try {
    const nums = [
      +document.getElementById("num1").value,
      +document.getElementById("num2").value,
      +document.getElementById("num3").value,
      +document.getElementById("num4").value,
      +document.getElementById("num5").value
    ];

    if (nums.some(n => isNaN(n) || n < 1 || n > 45)) {
      alert("Only numbers between 1 and 45 can be entered.");
      return;
    }

    const unique = new Set(nums);
    if (unique.size !== 5) {
      alert("The number must be 5 without duplicates.");
      return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      RelayLottoAddress.RelayLottoAddr,
      RelayLottoAbi,
      signer
    );

    const tx = await contract.createGame(nums);
    alert("⏳ Sending transaction... Please wait.");
    await tx.wait();
    alert("✅ Game creation success!");
  } catch (err) {
    console.error("❌ CreateGame Error:", err);
    alert("Game creation failed: " + (err.reason || err.message));
  }
}

/*************************************
 *  정답 제출용 함수
 *************************************/
async function submitAnswer(gameId) {
  const inputs = [];

  for (let i = 0; i < 5; i++) {
    const val = document.getElementById(`answer-${gameId}-${i}`).value.trim();
    if (!val || isNaN(val) || +val < 1 || +val > 45) {
      alert(`Please enter a number between 1 and 45 in box ${i + 1}.`);
      return;
    }
    inputs.push(+val);
  }

  const unique = new Set(inputs);
  if (unique.size !== 5) {
    alert("Please enter 5 numbers without duplicates.");
    return;
  }

  try {
    // 1. Web3 provider 및 signer 준비
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const user = await signer.getAddress();

    // 2. contract 인스턴스 연결
    const contract = new ethers.Contract(
      RelayLottoAddress.RelayLottoAddr,
      RelayLottoAbi,
      signer
    );

    // 3. 트랜잭션 전송
    const tx = await contract.guess(gameId, inputs);
    const receipt = await tx.wait();

    // 4. 이벤트에서 matched 추출
    const iface = new ethers.utils.Interface(RelayLottoAbi);
    let matched = null;

    for (const log of receipt.logs) {
      try {
        const parsed = iface.parseLog(log);
        if (
          parsed.name === "GuessMade" &&
          parsed.args.gameId.toString() === gameId.toString() &&
          parsed.args.user.toLowerCase() === user.toLowerCase()
        ) {
          matched = parsed.args.matched.toString();
          break;
        }
      } catch (e) {
        // 로그가 decode되지 않으면 무시
        continue;
      }
    }

    // 5. 시도 횟수 확인
    const tries = await contract.tries(user, gameId);

    // 6. 카드에 메시지 표시
    const resultDiv = document.createElement("div");
    resultDiv.className = "alert alert-success mt-2 fw-bold";
    resultDiv.textContent = `🎉 ${tries}th attempt! ${matched ?? '?'} correct!`;
    resultDiv.style.transition = "opacity 0.5s ease-in-out";
    resultDiv.style.opacity = "1";

    const cardBody = document.querySelector(`#gameList .card:nth-child(${gameId + 1}) .card-body`);
    if (cardBody) {
      cardBody.appendChild(resultDiv);
      setTimeout(() => {
        resultDiv.style.opacity = "0";
        setTimeout(() => {
          resultDiv.remove();
          renderAllGames();
        }, 500);
      }, 3000);
    } else {
      renderAllGames(); // 카드 못 찾았으면 그냥 새로고침
    }

  } catch (error) {
    console.error("❌ Failed to submit answer:", error);

    if (error.code === 4001) {
      alert("User rejected Metamask signing.");
    } else if (error.reason) {
      alert("Failure reason: " + error.reason);
} else if (error.data && error.data.message) {
alert("Failure message: " + error.data.message);
} else {
alert("An unknown error occurred while submitting the answer");
    }
  }
}




/*************************************
 *  전체 게임 렌더링
 *************************************/
async function renderAllGames() {
  const container = document.getElementById("gameList");
  container.innerHTML = "⏳ Loading game list...";

  try {
    const provider = new ethers.providers.JsonRpcProvider(RPC);
    const contract = new ethers.Contract(
      RelayLottoAddress.RelayLottoAddr,
      RelayLottoAbi,
      provider
    );

    const wid = await contract.wid();
    const gameCards = [];
   
    for (let i = 0; i < wid; i++) {
      const [solved, winner] = await contract.getGameInfo(i);

      const inputHTML = !solved ? ` 
<div class="mt-3"> 
<div class="d-flex justify-content-center gap-2 flex-wrap mb-2"> 
${[0,1,2,3,4].map(n => ` 
<input type="number" min="1" max="45" maxlength="2" id="answer-${i}-${n}" 
class="form-control text-center" 
placeholder="${n + 1}" 
style="width: 50px;" /> 
`).join('')} 
</div> 
<div class="d-flex justify-content-center"> 
<button class="btn btn-outline-primary btn-sm px-4" onclick="submitAnswer(${i})">Submit answer</button> 
</div> 
</div> 
` 
: ""; 

const shortWinner = solved 
? `${winner.slice(0, 6)}...${winner.slice(-4)}` 
: "Not yet";

const cardHTML = ` 
<div class="card mb-3 border-${solved ? "success" : "secondary"}"> 
<div class="card-body text-center"> 
<h5 class="card-title">🎯 Game #${i}</h5> 
<p class="card-text"> 
Status: <strong>${solved ? "✅ Completed" : "⏳ In Progress"}</strong><br> 
Winner: <br><small class="text-muted">${shortWinner}</small> 
</p> 
${inputHTML} 
</div> 
</div>
`;


      gameCards.push(cardHTML);
    }

    container.innerHTML = gameCards.join("");
  } catch (err) {
    console.error("❌ renderAllGames Error:", err);
    container.innerHTML = "<p class='text-danger'>게임 정보를 불러오는 데 실패했습니다.</p>";
  }
}

/*************************************
 *  최초 로드 시 실행
 *************************************/
document.addEventListener("DOMContentLoaded", async () => {
  await Data();
  await renderAllGames();
});
