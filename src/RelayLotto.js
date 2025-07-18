/*************************************
 *  기본 설정
 *************************************/
const RelayLottoAddress = {
  RelayLottoAddr: "0x898aAe1Cb9A81c308256F93DEB0BA9c7b9a2C605" //zemlotto
};

const RelayLottoAbi = [
  "function createGame(uint256[] _answer) external",
  "function guess(uint256 id,uint256[] g) external",
  "function wid() view returns(uint256)",
  "function games(uint256) view returns(bool solved,address winner)",
  "function jack() view returns(uint256)",
  "function getAttempt(uint256,uint256) view returns(string word,string feedback)",
  "function tries(address user, uint256 gameId) view returns (uint8)", // 시도횟수 조회
  "event GuessMade (uint256 indexed gameId, address indexed user, uint256[] guess, string fb)",
  "event GameEnded (uint256 indexed gameId, address indexed winner, uint256 reward)" //정답을 몇 개 맞췄는지 여부
];

const RPC = "https://1rpc.io/opbnb";

/*************************************
 *  잭팟·wid 표시
 *************************************/
async function Data() {
  try {
    const p = new ethers.providers.JsonRpcProvider(RPC);
    const c = new ethers.Contract(RelayLottoAddress.RelayLottoAddr, RelayLottoAbi, p);
    const jackBN = await c.jack();
    const widBN  = await c.wid();
    document.getElementById("Jack").textContent =
      (+ethers.utils.formatUnits(jackBN, 19)).toFixed(4);
    document.getElementById("Wid").textContent  = widBN.toString();
  } catch (e) { console.error("Data:", e); }
}
document.addEventListener("DOMContentLoaded", Data);

/*************************************
 *  provider & signer
 *************************************/
let signerC;
async function getSignerContract() {
  if (signerC) return signerC;
  if (!window.ethereum) throw new Error("MetaMask required");
  const p = new ethers.providers.Web3Provider(window.ethereum);
  await p.send("eth_requestAccounts", []);
  signerC = new ethers.Contract(
    RelayLottoAddress.RelayLottoAddr,
    RelayLottoAbi,
    p.getSigner()
  );
  return signerC;
}

/*************************************
 *  Games List 동기화
 *************************************/
async function syncRelayGameData() {
  try {
    const rp  = new ethers.providers.JsonRpcProvider(RPC);
    const rc  = new ethers.Contract(RelayLottoAddress.RelayLottoAddr, RelayLottoAbi, rp);
    const wid = (await rc.wid()).toNumber();

    const list = document.getElementById("gameList");
    list.innerHTML = "";

    for (let i = 0; i < wid; i++) {
      const g = await rc.games(i);                       // {solved, winner}
      list.appendChild(createGameCard(i, g.solved, g.winner));
    }

    if (window.ethereum && window.ethereum.isMetaMask) {
      const sc = await getSignerContract();
      for (let i = 0; i < wid; i++) await renderAllAttempts(i, sc);
    }
  } catch (e) { console.error("syncRelayGameData:", e); }
}

/*************************************
 *  카드 생성
 *************************************/
function createGameCard(id, solved, winner) {
  const solvedBadge = solved ? `<span class="badge bg-success ms-2">Solved</span>` : "";
  const card = document.createElement("div");
  card.className = "col-12 col-md-6 col-lg-4";
  card.innerHTML = `
    <div class="card h-100">
      <div class="card-body d-flex flex-column">
        <h5 class="card-title">Game #${id} ${solvedBadge}</h5>
        <p class="card-text mb-2"><strong>Winner:</strong> ${
  winner === ethers.constants.AddressZero
    ? "—"
    : `${winner.slice(0, 6)}...${winner.slice(-4)}`
}</p>

        <div id="input-container-${id}" class="mb-3 flex-grow-1">
          ${!solved ? createInputRowHtml() : ""}
        </div>
        <button class="btn btn-primary w-100 mb-2"
                id="attempt-btn-${id}"
                ${solved ? "disabled" : ""}>Submit</button>
      </div>
      <p id="result-${id}" class="text-center mt-2 fw-bold text-success"></p>
    </div>`;
  card.querySelector(`#attempt-btn-${id}`)
      .addEventListener("click", () => handleAttemptButtonClick(id));
  return card;
}

/* 빈 입력행 HTML 5칸 */
function createInputRowHtml() {
  return [...Array(5)]
    .map(() => '<input type="number" min="1" max="45" class="form-control me-1" style="width:60px;">')
    .join("");
}

/*************************************
 *  시도·피드백 렌더링
 *************************************/
const MAX_TRIES = 6;

async function renderAllAttempts(id, c) {
  const box = document.getElementById(`input-container-${id}`);
  if (!box) return;
  box.innerHTML = "";

  const addr = await c.signer.getAddress();
for (let n = 1; n <= MAX_TRIES; n++) {
  try {
    const at = await c.getAttempt(addr, id); // 순서 수정
    const row = createInputRow(at.word.replace(/,$/, "").split(","), false);
    applyFeedbackToInputs(row, at.feedback);
    box.appendChild(row);
  } catch {
    break;
  }
}

  const g = await c.games(id);
  if (!g.solved) box.appendChild(createInputRow([], true));
}

function createInputRow(vals = [], editable = false) {
  const row = document.createElement("div");
  row.className = "d-flex mb-2";
  for (let i = 0; i < 5; i++) {
    const inp = document.createElement("input");
    inp.type = "number"; inp.min = 1; inp.max = 45;
    inp.className = "form-control me-1";
    inp.value = vals[i] || "";
    inp.disabled = !editable;
    row.appendChild(inp);
  }
  return row;
}
function applyFeedbackToInputs(row, fb) {
  [...row.querySelectorAll("input")].forEach((inp, i) => {
    const c = fb[i] || "";
    inp.classList.remove("match-green","match-yellow","match-gray");

    if (c === "G")      inp.classList.add("match-green");   // 초록
    else if (c === "Y") inp.classList.add("match-yellow");  // 노랑
    else                inp.classList.add("match-gray");    // 회색
  });
}


/*************************************
 *  시도 제출
 *************************************/
async function handleAttemptButtonClick(id) {
  const c = await getSignerContract();
  const addr = await c.signer.getAddress();
  const box = document.getElementById(`input-container-${id}`);
  const nums = [...box.querySelectorAll("input")]
    .map(v => Number(v.value))
    .filter(n => !isNaN(n));

  if (nums.length !== 5 || nums.some(n => n < 1 || n > 45) ||
      new Set(nums).size !== 5) {
    alert("1–45 사이 중복 없는 숫자 5개 입력");
    return;
  }

  try {
    // 시도 제출
    await (await c.guess(id, nums)).wait();
    await Data();

    // 정확한 시도 횟수 조회
    const tryCount = await c.tries(addr, id);
    const remaining = 6 - tryCount;

    // 마지막 시도 결과 가져오기
    const at = await c.getAttempt(tryCount, id);
    const fb = at.feedback;
    const green = (fb.match(/G/g) || []).length;
    const yellow = (fb.match(/Y/g) || []).length;
    const totalMatch = green + yellow;

    let message = `🧪 <strong>${tryCount}번째 시도</strong> — `;

    if (fb === "GGGGG") {
      message += `🎉 <span class="text-success">정답! 상금 획득!</span>`;
    } else if (totalMatch === 0) {
      message += `❌ <span class="text-muted">하나도 못 맞췄습니다.</span>`;
    } else {
      message += `🎯 ${totalMatch}개 맞춤 (정확한 위치 ${green}개, 숫자만 일치 ${yellow}개)`;
    }

    message += `<br>💡 남은 시도 횟수: <strong>${remaining}회</strong>`;

    document.getElementById(`result-${id}`).innerHTML = message;

    // 새로고침 지연
    setTimeout(() => {
      syncRelayGameData();
    }, 3000);
 } catch (e) {
  console.error("guess 실패:", e);

  let msg = "알 수 없는 오류가 발생했습니다.";

  if (e.error?.message) {
    msg = e.error.message;
  } else if (e.data?.message) {
    msg = e.data.message;
  } else if (e.reason) {
    msg = e.reason;
  } else if (e.message) {
    msg = e.message;
  }

  // Revert reason 깔끔하게 추출
  msg = msg.replace("execution reverted: ", "").replace("execution reverted", "실패");

  document.getElementById(`result-${id}`).innerHTML = `
    <span class="text-danger">🚫 ${msg}</span>
  `;
}

}





/*************************************
 *  게임 생성 (스태프)
 *************************************/
async function CreateGame() {
  const nums = [...Array(5)].map((_, i) =>
    Number(document.getElementById(`num${i+1}`).value));
  if (nums.some(n => n < 1 || n > 45) || new Set(nums).size !== 5) {
    alert("중복 없이 1–45 숫자 5개"); return;
  }
  const c = await getSignerContract();
  await (await c.createGame(nums)).wait();
  alert("Game created!");
  await syncRelayGameData();
}

/*************************************
 *  최초 로드
 *************************************/
window.addEventListener("DOMContentLoaded", syncRelayGameData);
