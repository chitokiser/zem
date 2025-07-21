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
      alert("1~45 범위의 숫자만 입력 가능합니다.");
      return;
    }

    const unique = new Set(nums);
    if (unique.size !== 5) {
      alert("숫자는 중복 없이 5개여야 합니다.");
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
    alert("⏳ 트래전션 전송 중... 잠시 기다려 주세요.");
    await tx.wait();
    alert("✅ 게임 생성 성공!");
  } catch (err) {
    console.error("❌ CreateGame Error:", err);
    alert("게임 생성 실패: " + (err.reason || err.message));
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
      alert(`${i + 1}번 칸에 1~45 숫자를 입력해주세요.`);
      return;
    }
    inputs.push(+val);
  }

  const unique = new Set(inputs);
  if (unique.size !== 5) {
    alert("중복 없이 5개의 숫자를 입력해주세요.");
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
    resultDiv.textContent = `🎉 ${tries}번째 시도! 정답 ${matched ?? '?'}개 맞춤!`;
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
    console.error("❌ 정답 제출 실패:", error);

    if (error.code === 4001) {
      alert("사용자가 Metamask 서명을 거부했습니다.");
    } else if (error.reason) {
      alert("실패 사유: " + error.reason);
    } else if (error.data && error.data.message) {
      alert("실패 메시지: " + error.data.message);
    } else {
      alert("정답 제출 중 알 수 없는 오류 발생");
    }
  }
}




/*************************************
 *  전체 게임 렌더링
 *************************************/
async function renderAllGames() {
  const container = document.getElementById("gameList");
  container.innerHTML = "⏳ 게임 목록 불러오는 중...";

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

      const inputHTML = !solved
        ? `
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
              <button class="btn btn-outline-primary btn-sm px-4" onclick="submitAnswer(${i})">정답 제출</button>
            </div>
          </div>
        `
        : "";
     
    const shortWinner = solved
  ? `${winner.slice(0, 6)}...${winner.slice(-4)}`
  : "아직 없음";

const cardHTML = `
  <div class="card mb-3 border-${solved ? "success" : "secondary"}">
    <div class="card-body text-center">
      <h5 class="card-title">🎯 Game #${i}</h5>
      <p class="card-text">
        상태: <strong>${solved ? "✅ 완료" : "⏳ 진행 중"}</strong><br>
        당첨자: <br><small class="text-muted">${shortWinner}</small>
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
