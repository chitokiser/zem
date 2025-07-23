// PuppyRace 컨트랙트 주소 & ABI(필요한 함수만 포함)
const PUPPYRACE_ADDR = "0xE3957CB30Ca5cCaaA559a5538f5004280Fed0A39"; //PuppyRace
const ABI = [
  "function getbt() view returns(uint8)",
  "function myPuppy(address) view returns(uint8)",
  "function getmypuppy(address) view returns(uint8)",
  "function getreward() view returns(uint256)",
  "function jack() view returns(uint256)",
  "function Race(uint _ticket) external",
  "function winner(uint) view returns(address)",
  "event lost(uint256 amount, uint256 myPower)",
  "event Bonus(address indexed user, uint256 amount, uint256 reward)",
  "event RewardGiven(address indexed user, uint256 amount, uint256 myPower)"
];

let providerRead = new ethers.providers.JsonRpcProvider("https://opbnb-mainnet-rpc.bnbchain.org");
let contractRead = new ethers.Contract(PUPPYRACE_ADDR, ABI, providerRead);

let signer, contractWrite;

async function connectWallet() {
  if (!window.ethereum) return alert("메타마스크를 설치하세요.");
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();
  contractWrite = new ethers.Contract(PUPPYRACE_ADDR, ABI, signer);
  logEvent("✅ 지갑 연결: " + await signer.getAddress());
  await renderMyPuppy();
}

function logEvent(msg) {
  const div = document.getElementById("log");
  div.innerHTML = `<div>${new Date().toLocaleTimeString()} ${msg}</div>` + div.innerHTML;
}

// 잭팟 및 내 정보 렌더링
async function renderStatus() {
  // 잭팟
  try {
    let jackpot = await contractRead.getreward();
    document.getElementById("jackpotValue").textContent = Number(jackpot/1e18).toFixed(2);
      document.getElementById("jackpotValue2").textContent = Number(jackpot/1e18/2).toFixed(2);
        document.getElementById("jackpotValue3").textContent = Number(jackpot/1e18/3).toFixed(2);
          document.getElementById("jackpotValue4").textContent = Number(jackpot/1e18/4).toFixed(2);
            document.getElementById("jackpotValue5").textContent = Number(jackpot/1e18/5).toFixed(2);
              document.getElementById("jackpotValue6").textContent = Number(jackpot/1e18/6).toFixed(2);
                document.getElementById("jackpotValue7").textContent = Number(jackpot/1e18/7).toFixed(2);
                  document.getElementById("jackpotValue8").textContent = Number(jackpot/1e18/8).toFixed(2);

  } catch (e) {
    document.getElementById("jackpotValue").textContent = "-";
  }
}



// 내 강아지 정보
async function renderMyPuppy() {
  try {
    let addr = signer ? await signer.getAddress() : null;
    if (!addr) {
      document.getElementById("myBreed").textContent = "?";
      document.getElementById("myPuppyImg").src = "/images/puppy/0.png";
      return;
    }
    let myBreed = await contractRead.getmypuppy(addr);
    document.getElementById("myBreed").textContent = myBreed;
    document.getElementById("myPuppyImg").src = `/images/puppy/${myBreed}.png`;
  } catch (e) {
    document.getElementById("myBreed").textContent = "?";
    document.getElementById("myPuppyImg").src = "/images/puppy/0.png";
  }
}

// 최근 승리자 표시 (최대 5명)
async function renderWinnerList() {
  let html = "";
  try {
    // 최근 5개만 출력 (winner[] 배열 크기는 외부에서 알 수 없음, try~catch로 최대 10까지 루프)
    for (let i = 0; i < 5; i++) {
      try {
        let addr = await contractRead.winner(i);
        html += `<div>${addr.substring(0, 8)}...${addr.slice(-4)}</div>`;
      } catch (e) { break; }
    }
    if (!html) html = "<span class='text-gray-400'>아직 없음</span>";
  } catch (e) {
    html = "<span class='text-red-400'>불러오기 실패</span>";
  }
  document.getElementById("winnerList").innerHTML = html;
}

// ===== 레이스 실행 =====
async function race() {
  if (!contractWrite) await connectWallet();

  let ticket = Number(document.getElementById("betAmount").value);
  if (!ticket || ticket <= 0) return alert("티켓(숫자)를 입력하세요.");

  document.getElementById("raceRank").textContent = "-";
  document.getElementById("rewardAmount").textContent = "0";
  document.getElementById("bonusAmount").textContent = "0";
  document.getElementById("log").innerHTML = "";

  try {
    document.getElementById("log").innerHTML = `<div>⏳ 트랜잭션 전송 중...</div>`;
    let tx = await contractWrite.Race(ticket);
    logEvent("트랜잭션: " + tx.hash);

    const receipt = await tx.wait();
    logEvent("✅ 완료: " + tx.hash);

    let iface = new ethers.utils.Interface(ABI);
    let found = false;
      await showDogFrameAnimationBig(); 
    for (const log of receipt.logs) {
      try {
        const parsed = iface.parseLog(log);
        const { name, args } = parsed;
        if (name === "RewardGiven") {
          found = true;
          document.getElementById("raceRank").textContent = args.myPower;
          document.getElementById("rewardAmount").textContent = Number(ethers.utils.formatEther(args.amount)).toFixed(2);
          logEvent(`🎉 보상: ${ethers.utils.formatEther(args.amount)} GP (등수 ${args.myPower})`);
        }
        if (name === "Bonus") {
          document.getElementById("bonusAmount").textContent = Number(ethers.utils.formatEther(args.amount)).toFixed(2);
          logEvent(`🎁 보너스: ${ethers.utils.formatEther(args.amount)} GP (능력치 ${args.reward})`);
        }
        if (name === "lost") {
          found = true;
          document.getElementById("raceRank").textContent = args.myPower;
          logEvent(`😢 패배! GP 소멸 (등수 ${args.myPower})`);
        }
      } catch (e) { }
    }
    if (!found) logEvent("결과 없음(이벤트 미검출)");
    await renderStatus();
    await renderWinnerList();
    await renderMyPuppy();
  } catch (err) {
    let msg = err.message;
    if (msg.includes("No Puppy")) msg = "강아지가 없습니다!";
    if (msg.includes("Not enough game points")) msg = "GP 부족!";
    if (msg.includes("The amount is too large")) msg = "잭팟 부족!";
    logEvent("❌ " + msg);
  }
}


const dogFrames = [
  "/images/puppy/race/0.png",
  "/images/puppy/race/1.png",
  "/images/puppy/race/2.png",
  "/images/puppy/race/3.png",
  "/images/puppy/race/4.png"
];

// race()에서 호출: 애니메이션 오버레이
async function showDogFrameAnimationBig() {
  const overlay = document.getElementById("raceAnimOverlay");
  const img = document.getElementById("animDogBig");
  let frame = 0;
  overlay.style.display = "flex";
  img.src = dogFrames[0];

  return new Promise((resolve) => {
    const interval = setInterval(() => {
      frame++;
      img.src = dogFrames[frame % dogFrames.length];
      if (frame >= dogFrames.length - 1) {
        clearInterval(interval);
        setTimeout(() => {
          overlay.style.display = "none";
          resolve();  // 애니 끝나면 race 로직 이어감
        }, 300); // 0.3초 후 사라짐(자연스러운 여유)
      }
    }, 180);
  });
}

// ----------- 최초 로딩 시 ----------
window.onload = async () => {
  await renderStatus();
  await renderMyPuppy();
  await renderWinnerList();
};

