const { ethers } = window;

const contractAddress = {
  cutbank: "0x8EBAA1f6fBb4197e83f88238e7386cB3A37bE355", // ZUMBank
  erc20: "0xB4C12Bf7491D70c91A2c272D191B7a3D4ED27bE5"   // ZEM
};

// 👉 ABI는 객체가 아닌, 따로 두 배열로 정의
const cutbankAbi = [
  "function g1() view returns(uint256)",
  "function g3() public view returns(uint)",
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

const erc20Abi = [
  "function myZEMbalances() public view returns(uint256)"
];

let provider;
let signer;
let contract;

const initialize = async () => {
  if (signer) return;

  if (!window.ethereum) {
  alert("Wallet is not installed.");
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
};


function getRevertReason(error) {
  try {
    // 1. ethers v5: error.data.message 또는 error.error.message
    if (error?.data?.message) return error.data.message.split('execution reverted: ')[1] || error.data.message;
    if (error?.error?.message) return error.error.message.split('execution reverted: ')[1] || error.error.message;

    // 2. ethers v6: error.shortMessage
    if (error?.shortMessage) return error.shortMessage.split('execution reverted: ')[1] || error.shortMessage;

    // 3. 일반 message 필드
    if (error?.message) return error.message.split('execution reverted: ')[1] || error.message;

    // 4. JSON 형태일 경우 파싱
    return JSON.stringify(error);
  } catch (e) {
    return "Unknown error";
  }
}


const MemberLogin = async () => {
  await initialize();
  const userAddress = await signer.getAddress();

  const [totaldepo, mybonus, mylev, mymento, myexp] = await contract.myinfo(userAddress);
  const levelexp = (2 ** mylev) * 10000;
  const g8Value = await contract.g8(userAddress);

  // erc20 ZEM 계약 연결 및 잔액 조회
  const erc20Contract = new ethers.Contract(contractAddress.erc20, erc20Abi, signer);
  const zemBalance = await erc20Contract.myZEMbalances();

  // DOM 업데이트
  document.getElementById("MyZem").innerText = (zemBalance / 1e18).toFixed(4);
  document.getElementById("MyZum").innerText = g8Value.toString();
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
const tx = await contract. levelup();
await tx. wait();
alert("Levelup success!");
location. reload();
} catch (e) {
  alert(shortErrorMessage(e));
}

};

const Bonuswithdraw = async () => {
  try {
    await initialize();
    await contract.withdraw();
    alert("Bonus withdrawal completed");
    location.reload();
  } catch (error) {
  console.error("Error voting:", error);
  alert(getRevertReason(error));  // 스마트컨트랙트에서 설정한 메세지만 출력
}

};

const Buff = async () => {
  try {
    await initialize();
    await contract.buffing();
    alert("Buff success!");
  } catch (error) {
  console.error("Error voting:", error);
  alert(getRevertReason(error));  // 스마트컨트랙트에서 설정한 메세지만 출력
}

};

const fetchAddresses = async () => {
  try {
    await initialize();
    const userAddress = await signer.getAddress();
    const addresses = await contract.getmymenty(userAddress);
    const addressList = document.getElementById("addressList");
    addressList.innerHTML = "";

    addresses.forEach(addr => {
      const li = document.createElement("li");
      li.textContent = addr;
      addressList.appendChild(li);
    });

    if (addresses.length === 0) {
      const li = document.createElement("li");
      li.textContent = "There are no menty.";
      addressList.appendChild(li);
    }
  } catch (error) {
  console.error("Error voting:", error);
  alert(getRevertReason(error));  // 스마트컨트랙트에서 설정한 메세지만 출력
}

};

const BuyZum = async () => {
  try {
    await initialize();
    const amount = parseInt(document.getElementById("buyAmount").value);
    await contract.buyzum(amount);
    alert("ZUM 구매 성공!");
    location.reload();
  } catch (error) {
  console.error("Error voting:", error);
  alert(getRevertReason(error));  // 스마트컨트랙트에서 설정한 메세지만 출력
}

};

const SellCut = async () => {
  try {
    await initialize();
    const amount = parseInt(document.getElementById("sellAmount").value);
    await contract.sellcut(amount);
    alert("ZUM sales success!");
    location.reload();
  } catch (error) {
  console.error("Error voting:", error);
  alert(getRevertReason(error));  // 스마트컨트랙트에서 설정한 메세지만 출력
}

};

function extractRevertReason(error) {
  if (error?.error?.data?.message) {
    return error.error.data.message.replace("execution reverted: ", "");
  }
  if (error?.data?.message) {
    return error.data.message.replace("execution reverted: ", "");
  }
  if (error?.message?.includes("execution reverted:")) {
    return error.message.split("execution reverted:")[1].trim();
  }
  return "An unknown error occurred.";
}

// 초기 실행
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
