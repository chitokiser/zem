const { ethers } = window;

const contractAddress = {
  cutbank: "0x7af12A131182b966b813369Eb45393657a5a1bd5",
};

const cutbankAbi = [
  "function g1() view returns(uint256)",
  "function g6() view returns(uint256)",
  "function g7() view returns(uint256)",
  "function g8(address) view returns(uint256)",
  "function g9(address) view returns(uint)",
  "function g10() view returns(uint256)",
  "function allow() view returns(uint256)",
  "function sum() view returns(uint256)",
  "function allowt(address) view returns(uint256)",
  "function g11() view returns(uint256)",
  "function getprice() view returns(uint256)",
  "function gettime() view returns(uint256)",
  "function withdraw()",
  "function buysut(uint) returns(bool)",
  "function sellsut(uint) returns(bool)",
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

const initialize = async () => {
  if (!window.ethereum) {
    alert("MetaMask가 설치되어 있지 않습니다.");
    return;
  }

  provider = new ethers.providers.Web3Provider(window.ethereum, "any");
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

  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();
  const iface = new ethers.utils.Interface(cutbankAbi);
  contract = new ethers.Contract(contractAddress.cutbank, iface, signer);
  console.log("✅ Contract connected:", contractAddress.cutbank);
};

const MemberLogin = async () => {
  await initialize();
  const userAddress = await signer.getAddress();
  const [_, mybonus, mylev, mymento, myexp] = await contract.myinfo(userAddress);
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
    await contract.levelup();
    alert("레벨업 성공!");
  } catch (e) {
    alert(e?.data?.message?.replace("execution reverted: ", "") || e.message);
  }
};

const Bonuswithdraw = async () => {
  try {
    await initialize();
    await contract.withdraw();
    alert("보너스 출금 완료");
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
      li.textContent = "There are no recommended members.";
      addressList.appendChild(li);
    }
  } catch (e) {
    alert(e?.data?.message?.replace("execution reverted: ", "") || e.message);
  }
};

window.addEventListener("load", async () => {
  await initialize();
});

document.getElementById("fetchAddresses")?.addEventListener("click", fetchAddresses);

window.onerror = function (message, source, lineno, colno, error) {
  console.error("Global error:", message, error);
};
