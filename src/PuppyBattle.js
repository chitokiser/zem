/* ---------- 주소 & ABI ---------- */
const BATTLE_CONTRACT_ADDR = "0x4b7c4641844EC478cd0B5263174CFEe6a6e0d2E3";
const BATTLE_ABI = [
  "function bpid() view returns(uint8)",
  "function bps(uint8) view returns(uint8 mybreed, uint256 depo, uint256 power, address owner, uint8 defense)",
  "function getmypuppy(address) view returns(uint16)",
  "function getmypower(uint256 pid) view returns(uint256)",
  "function Battle(uint8 _pid) external",
  "function getreward() view returns(uint256)",
  "event lost(uint256 amount, uint256 myPower)",
  "event Bonus(address indexed user, uint256 amount, uint256 reward)",
  "event RewardGiven(address indexed user, uint256 amount, uint256 myPower)",
  "event getdepo(uint256 pay)"
];

/* ---------- provider & contract ---------- */
const providerRead = new ethers.providers.JsonRpcProvider("https://opbnb-mainnet-rpc.bnbchain.org");
const battleContractRead = new ethers.Contract(BATTLE_CONTRACT_ADDR, BATTLE_ABI, providerRead);

let signer, battleContractWrite;
let selectedSlot = 0;

/* ---------- 지갑 연결 ---------- */
async function connectWallet() {
  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    battleContractWrite = new ethers.Contract(BATTLE_CONTRACT_ADDR, BATTLE_ABI, signer);
    console.log("Wallet connected:", await signer.getAddress());
    return signer.getAddress();
  } else {
    alert("지갑을 설치해주세요!");
  }
}

/* ---------- 챔피언 리스트 렌더 ---------- */
async function renderChampionList() {
  const championListDiv = document.getElementById("championList");
  championListDiv.innerHTML = "불러오는 중...";

  try {
    const bpid = await battleContractRead.bpid();
    let html = "";
    for (let i = 0; i < bpid; i++) {
      const bp = await battleContractRead.bps(i);
      const mybreed = bp.mybreed;
      const depo = bp.depo;
      const power = bp.power;
      const owner = bp.owner;
      const defense = bp.defense;

      html += `
      <div class="card-body text-center bg-blue-50 rounded shadow p-2 m-1">
        <div class="font-bold text-blue-600">#${i + 1}</div>
        <img src="/images/puppy/${mybreed}.png" class="w-12 h-12 mx-auto rounded" alt="강아지"/>
        <div class="text-xs mt-1">품종: <span class="font-bold">${mybreed}</span></div>
        <div class="text-xs">파워: <span class="font-bold">${power}</span></div>
        <div class="text-xs">방어성공: <span class="font-bold">${defense}</span></div>
        <div class="text-[10px] truncate text-gray-400">오너: ${owner.substring(0, 6)}...${owner.substring(owner.length-4)}</div>
        <button class="mt-1 text-xs px-2 py-1 bg-pink-500 text-white rounded battle-btn" data-slot="${i}">
          도전!
        </button>
      </div>
      `;
    }
    championListDiv.innerHTML = html;

    // 각 도전 버튼에 이벤트 연결 (해당 슬롯으로 도전)
    document.querySelectorAll(".battle-btn").forEach(btn => {
      btn.onclick = () => battle(parseInt(btn.dataset.slot));
    });

  } catch (e) {
    championListDiv.innerHTML = "<span class='text-red-500'>불러오기 실패</span>";
  }
}

/* ---------- 내 강아지 정보/파워 렌더 ---------- */
async function renderMyPuppy() {
  try {
    let account = signer ? await signer.getAddress() : null;
    if (!account) return;

    const myBreed = await battleContractRead.getmypuppy(account);
    document.getElementById("myBreed").textContent = myBreed;
    document.getElementById("myPuppyImg").src = `/images/puppy/${myBreed}.png`;

    const power = await battleContractRead.getmypower(myBreed);
    document.getElementById("myPower").textContent = power.toString();
  } catch (e) {
    document.getElementById("myBreed").textContent = "?";
    document.getElementById("myPower").textContent = "?";
  }
}

/* ---------- 배틀 실행 ---------- */
async function battle(slot) {
  if (!battleContractWrite) await connectWallet();
  try {
    document.getElementById("battleResult").textContent = "대결 진행 중...";
    const tx = await battleContractWrite.Battle(slot);
    logEvent(`⏳ 배틀 트랜잭션 전송: ${tx.hash}`);

    const receipt = await tx.wait();
    logEvent(`✅ 배틀 완료: ${tx.hash}`);

    const iface = new ethers.utils.Interface(BATTLE_ABI);
    let foundResult = false;

    for (const log of receipt.logs) {
      try {
        const parsed = iface.parseLog(log);
        const name = parsed.name;
        const args = parsed.args;

        if (name === "RewardGiven") {
          foundResult = true;
          document.getElementById("battleResult").innerHTML =
            `<span class='text-blue-600 font-bold'>🎉 승리! GP 보상: ${ethers.utils.formatEther(args.amount)}</span>`;
          logEvent(`🎉 Reward: ${ethers.utils.formatEther(args.amount)} GP, 내 파워: ${args.myPower}`);
        }
        if (name === "Bonus") {
          logEvent(`🎁 Bonus: ${ethers.utils.formatEther(args.amount)} GP (능력치 ${args.reward})`);
        }
        if (name === "lost") {
          foundResult = true;
          document.getElementById("battleResult").innerHTML =
            `<span class='text-red-500 font-bold'>😢 패배! GP 소멸. 내 파워: ${args.myPower}</span>`;
          logEvent(`😢 Lost: ${ethers.utils.formatEther(args.amount)} GP, 내 파워: ${args.myPower}`);
        }
      } catch (e) { }
    }
    if (!foundResult) document.getElementById("battleResult").textContent = "결과 없음(이벤트 미검출)";
    await renderChampionList();
    await renderMyPuppy();
  } catch (err) {
    document.getElementById("battleResult").innerHTML = `<span class="text-red-500">❌ 오류: ${err.message}</span>`;
    logEvent(`❌ 오류: ${err.message}`);
  }
}

/* ---------- 로그 기록 ---------- */
function logEvent(msg) {
  const logDiv = document.getElementById("log");
  logDiv.innerHTML = `<div>${new Date().toLocaleTimeString()} ${msg}</div>` + logDiv.innerHTML;
}

/* ---------- 초기화 ---------- */
window.onload = async () => {
  await connectWallet();
  await renderChampionList();
  await renderMyPuppy();
};
