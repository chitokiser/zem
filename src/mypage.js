const { ethers } = window;

const contractAddress = {
  cutbank: "0x8EBAA1f6fBb4197e83f88238e7386cB3A37bE355", // ZUMBank
};

const cutbankAbi = [
  "function g1() view returns(uint256)",
  "function g6() view returns(uint256)",
  "function g8(address) view returns(uint)",
  "function g9(address) view returns(uint)",
  "function g10() view returns(uint256)",
  "function g11() view returns(uint256)",
  "function allow() view returns(uint256)",
  "function allowt(address) view returns(uint256)",
  "function sum() view returns(uint256)",
  "function getprice() view returns(uint256)",
  "function gettime() view returns(uint256)",
  "function withdraw()",
  "function buyzum(uint) returns(bool)",
  "function sellcut(uint) returns(bool)",
  "function getpay(address) view returns(uint256)",
  "function allowcation() returns(bool)",
  "function getlevel(address) view returns(uint)",
  "function getmento(address) view returns(address)",
  "function memberjoin(address)",
  "function myinfo(address) view returns(uint256,uint256,uint256,address,uint256)",
  "function levelup()",
  "function buffing()",
  "function getmymenty(address) view returns(address[])"
];

let provider;
let signer;
let contract;
let initialized = false;

const initialize = async () => {
  if (initialized) return;

  if (!window.ethereum) {
    alert("지갑이 설치되어 있지 않습니다.");
    return;
  }

  provider = new ethers.providers.Web3Provider(window.ethereum, "any");

  try {
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [{
        chainId: "0xCC",
        rpcUrls: ["https://opbnb-mainnet-rpc.bnbchain.org"],
        chainName: "opBNB",
        nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
        blockExplorerUrls: ["https://opbnbscan.com"]
      }]
    });
  } catch (e) {
    console.warn("네트워크 전환 실패:", e.message);
  }

  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();
  contract = new ethers.Contract(contractAddress.cutbank, cutbankAbi, signer);
  initialized = true;

  console.log("✅ Contract connected:", contractAddress.cutbank);
};

const MemberLogin = async () => {
  await initialize();
  const userAddress = await signer.getAddress();
  const [totaldepo, mybonus, mylev, mymento, myexp] = await contract.myinfo(userAddress);
  const levelexp = (2 ** mylev) * 10000;

  document.getElementById("Mymento").innerText = mymento;
  document.getElementById("Mylev").innerText = mylev;
  document.getElementById("Mylev2").innerText = mylev;
  document.getElementById("Exp").innerText = myexp;
  document.getElementById("Expneeded").innerText = levelexp;
  document.getElementById("Mypoint").innerText = (mybonus / 1e18).toFixed(4);
  document.getElementById("LevelBar").style.width = `${(myexp / levelexp) * 100}%`;
};

const Levelup = async () => {
  try {
    await initialize();
    const tx = await contract.levelup();
    await tx.wait();
    alert("레벨업 성공!");
    location.reload();
  } catch (e) {
    // 스마트컨트랙트의 revert 메시지를 추출
    const message = extractRevertReason(e);
    alert("레벨업 실패: " + message);
    console.error("레벨업 실패 상세:", e);
  }
};

function extractRevertReason(error) {  //스마트 컨트렉트 에러 메세지 
  // ethers.js v5 기준
  if (error?.error?.data?.message) {
    return error.error.data.message.replace("execution reverted: ", "");
  }

  if (error?.data?.message) {
    return error.data.message.replace("execution reverted: ", "");
  }

  if (error?.message?.includes("execution reverted:")) {
    return error.message.split("execution reverted:")[1].trim();
  }

  return "알 수 없는 오류가 발생했습니다.";
}




const Bonuswithdraw = async () => {
  try {
    await initialize();
    await contract.withdraw();
    alert("보너스 출금 완료");
    location.reload();
  } catch (e) {
    alert(e?.data?.message?.replace("execution reverted: ", "") || e.message);
  }
};

const Buff = async () => {
  try {
    await initialize();
    await contract.buffing();
    alert("버프 성공!");
  } catch (e) {
    alert(e?.data?.message?.replace("execution reverted: ", "") || e.message);
  }
};

const fetchAddresses = async () => {
  try {
    await initialize();
    const userAddress = await signer.getAddress();
    const addresses = await contract.getmymenty(userAddress);
    const addressList = document.getElementById("addressList");
    addressList.innerHTML = "";

    if (addresses.length > 0) {
      addresses.forEach(addr => {
        const li = document.createElement("li");
        li.textContent = addr;
        addressList.appendChild(li);
      });
    } else {
      const li = document.createElement("li");
      li.textContent = "추천인이 없습니다.";
      addressList.appendChild(li);
    }
  } catch (e) {
    alert(e?.data?.message?.replace("execution reverted: ", "") || e.message);
  }
};

const BuyZum = async () => {
  try {
    await initialize();
    const amount = parseInt(document.getElementById("buyAmount").value);
    await contract.buyzum(amount);
    alert("ZUM 구매 성공!");
    location.reload();
  } catch (e) {
    alert(e?.data?.message?.replace("execution reverted: ", "") || e.message);
  }
};

const SellCut = async () => {
  try {
    await initialize();
    const amount = parseInt(document.getElementById("sellAmount").value);
    await contract.sellcut(amount);
    alert("ZUM 판매 성공!");
    location.reload();
  } catch (e) {
    alert(e?.data?.message?.replace("execution reverted: ", "") || e.message);
  }
};

window.addEventListener("load", async () => {
  await initialize();
  await MemberLogin();
});

document.getElementById("fetchAddresses")?.addEventListener("click", fetchAddresses);
document.getElementById("levelUp")?.addEventListener("click", Levelup);
document.getElementById("withdraw")?.addEventListener("click", Bonuswithdraw);
document.getElementById("buff")?.addEventListener("click", Buff);
document.getElementById("buyZumBtn")?.addEventListener("click", BuyZum);
document.getElementById("sellCutBtn")?.addEventListener("click", SellCut);

window.onerror = function (message, source, lineno, colno, error) {
  console.error("Global error:", message, error);
};
