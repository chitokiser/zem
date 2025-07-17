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
  "event GuessMade (uint256 indexed gameId, address indexed user, uint256[] guess, string fb)",
  "event GameEnded (uint256 indexed gameId, address indexed winner, uint256 reward)"
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
          winner === ethers.constants.AddressZero ? "—" : winner
        }</p>
        <div id="input-container-${id}" class="mb-3 flex-grow-1">
          ${!solved ? createInputRowHtml() : ""}
        </div>
        <button class="btn btn-primary w-100 mb-2"
                id="attempt-btn-${id}"
                ${solved ? "disabled" : ""}>Submit</button>
      </div>
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

  for (let n = 1; n <= MAX_TRIES; n++) {
    try {
      const at = await c.getAttempt(n, id);
      const row = createInputRow(at.word.replace(/,$/, "").split(","), false);
      applyFeedbackToInputs(row, at.feedback);
      box.appendChild(row);
    } catch { break; }
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
  const c   = await getSignerContract();
  const box = document.getElementById(`input-container-${id}`);
  const nums = [...box.querySelectorAll("input")]
                 .map(v => Number(v.value))
                 .filter(n => !isNaN(n));

  if (nums.length !== 5 || nums.some(n => n < 1 || n > 45) ||
      new Set(nums).size !== 5) {
    alert("1–45 사이 중복 없는 숫자 5개 입력"); return;
  }

  await (await c.guess(id, nums)).wait();   // ↔ ABI 실행
  await Data();                          // 잭팟 갱신
  await syncRelayGameData();                // 카드·피드백 갱신
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
