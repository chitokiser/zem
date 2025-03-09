let contractAddress = {
  cyafarmAddr: "0x8E78B8cFC0Bc3698E7000d5C7031e9531BF56F9e", // betfarm
}; 

let contractAbi = {
  cyafarm: [
      "function seeding() public",
      "function choice(uint8 winnum) public",
      "function charge(uint256 _mypay) public",
      "function withdraw() public",
      "function pllength() public view returns(uint)",
      "function getpl(uint num) public view returns(uint)",
      "function port(uint num) public view returns(uint,uint,uint,address)",
      "function mypay(address user) public view returns(uint)",
      "function getvalue(uint num) public view returns(uint)",
      "function getmyfarm(uint num) public view returns(uint)",
      "function getmygain() public view returns(uint)",
      "function tax() public view returns(uint)", 
      "function mytiket(address user) public view returns(uint)", 
      "function rate() public view returns(uint)",
      "function remain() public view returns(uint256)",
      "function price() public view returns(uint256)",
      "function g1() public view virtual returns(uint256)",
      "event farmnum(uint winnum)"
  ]
};

const provider = new ethers.providers.JsonRpcProvider('https://opbnb-mainnet-rpc.bnbchain.org');
const cyafarmContract = new ethers.Contract(contractAddress.cyafarmAddr, contractAbi.cyafarm, provider);

// ✅ 실시간 데이터 동기화 함수
const topDataSync = async () => {
  try {
      const fprice = await cyafarmContract.price();
      const fsum = await cyafarmContract.remain();
      const irate = await cyafarmContract.rate();
      const ipl = await cyafarmContract.pllength();
     const ibal = await cyafarmContract.g1();

      document.getElementById("Fprice").innerHTML = (fprice / 1e18).toFixed(4);
      document.getElementById("Farmtotal").innerHTML = fsum;
      document.getElementById("Rate").innerHTML = (100 - irate) + "%";
      document.getElementById("Pl").innerHTML = ipl;
      document.getElementById("Cyabal").innerHTML = (ibal / 1e18).toFixed(4);
  } catch (error) {
      console.error("Error fetching contract data:", error);
  }
};

//  `farmnum` 이벤트 리스너 추가
cyafarmContract.on("farmnum", (winnum) => {
  console.log("🏆 Winning Farm Number:", winnum);

  // HTML 업데이트
  let eventElement = document.getElementById("eventFarmnum");
  if (eventElement) {
      eventElement.innerText = `🏆파종성공 화분번호: ${winnum}`;
  }
});

// ✅ **자동 데이터 갱신 (setTimeout 방식)**
async function startDataSync() {
  await topDataSync();
  setTimeout(startDataSync, 5000);
}

// ✅ 초기 실행
startDataSync();


// ✅ port 데이터를 화면에 표시
async function displayPortData() {
  try {
      let container = document.getElementById("portDataContainer");
      if (!container) {
          console.error("HTML 요소 'portDataContainer'를 찾을 수 없습니다.");
          return;
      }
      container.innerHTML = "";

      for (let num = 1; num <= 100; num++) {
          let [value1, value2, value3, owner] = await cyafarmContract.port(num);
          let [currentValue] = await Promise.all([
      
            cyafarmContract.getvalue(num)
        ]);
          let card = document.createElement("div");
          card.className = "card stylish-card";
          card.innerHTML = `
                 <div class="card-body">
                    <h6 class="card-title stylish-title">🌱 Pot ${num}</h6>
                    <p class="card-text stylish-text">💰 원금: ${(value1 / 1e18).toFixed(2)} BET</p>
                    <p class="card-text stylish-text">📈 현재 가치: ${(currentValue / 1e18).toFixed(2)} BET</p>
                    <p class="card-text stylish-text">📊 파종 순번: ${value2}</p>
                    <p class="card-text stylish-text">👤 화분주인: ${owner}</p>
                </div>
          `;

          container.appendChild(card);
      }
  } catch (error) {
      console.error("Error fetching port data:", error);
  }
}
window.onload = displayPortData;

    
  
// 5초마다 데이터 갱신
setInterval(() => {
  topDataSync();
}, 5000);


  
         let MemberLogin = async () => {
          let userProvider = new ethers.providers.Web3Provider(window.ethereum, "any");
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
                chainId: "0xCC",
                rpcUrls: ["https://opbnb-mainnet-rpc.bnbchain.org"],
                chainName: "opBNB",
                nativeCurrency: {
                    name: "BNB",
                    symbol: "BNB",
                    decimals: 18
                },
                blockExplorerUrls: ["https://opbnbscan.com"]
            }]
          });
          await userProvider.send("eth_requestAccounts", []);
          
          let signer = userProvider.getSigner();
          let cyafarmContract = new ethers.Contract(contractAddress.cyafarmAddr, contractAbi.cyafarm, signer);
        
          let mygain = await cyafarmContract.mypay(await signer.getAddress());
          let imytiket = await cyafarmContract.mytiket(await signer.getAddress());
      
          document.getElementById("Farmgain").innerHTML = (parseFloat(mygain) / 1e18).toFixed(2);

          document.getElementById("LevelBar").style.width = `${imytiket/10*100}%`; 
        };
        
  
  
  
  
  
  let Buyfarm = async () => {
    let userProvider = new ethers.providers.Web3Provider(window.ethereum, "any");
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [{
          chainId: "0xCC",
          rpcUrls: ["https://opbnb-mainnet-rpc.bnbchain.org"],
          chainName: "opBNB",
          nativeCurrency: {
              name: "BNB",
              symbol: "BNB",
              decimals: 18
          },
          blockExplorerUrls: ["https://opbnbscan.com"]
      }]
    });
    await userProvider.send("eth_requestAccounts", []);
    let signer = userProvider.getSigner();
    let cyafarmContract = new ethers.Contract(contractAddress.cyafarmAddr, contractAbi.cyafarm, signer)
  
    try {
      await cyafarmContract.seeding();
    } catch(e) {
      alert(e.message.replace('execution reverted: ',''));
    }
  
  }
  

  let Choice = async () => {
    let userProvider = new ethers.providers.Web3Provider(window.ethereum, "any");
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [{
          chainId: "0xCC",
          rpcUrls: ["https://opbnb-mainnet-rpc.bnbchain.org"],
          chainName: "opBNB",
          nativeCurrency: {
              name: "BNB",
              symbol: "BNB",
              decimals: 18
          },
          blockExplorerUrls: ["https://opbnbscan.com"]
      }]
    });
    await userProvider.send("eth_requestAccounts", []);
    let signer = userProvider.getSigner();
    let cyafarmContract = new ethers.Contract(contractAddress.cyafarmAddr, contractAbi.cyafarm, signer)
    const mid = document.getElementById('Mid').value;
    try {
      await cyafarmContract.choice(mid);
    } catch(e) {
      alert(e.message.replace('execution reverted: ',''));
    }
  
  }
  

  
  let Charge= async () => {
    let userProvider = new ethers.providers.Web3Provider(window.ethereum, "any");
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [{
          chainId: "0xCC",
          rpcUrls: ["https://opbnb-mainnet-rpc.bnbchain.org"],
          chainName: "opBNB",
          nativeCurrency: {
              name: "BNB",
              symbol: "BNB",
              decimals: 18
          },
          blockExplorerUrls: ["https://opbnbscan.com"]
      }]
    });
    await userProvider.send("eth_requestAccounts", []);
    let signer = userProvider.getSigner();
    let cyafarmContract = new ethers.Contract(contractAddress.cyafarmAddr, contractAbi.cyafarm, signer)
    const iamount = document.getElementById('Amount').value;
    try {
      await cyafarmContract.charge(iamount);
    } catch(e) {
      alert(e.message.replace('execution reverted: ',''));
    }
  
  }
  

  let Withdraw = async () => {
    let userProvider = new ethers.providers.Web3Provider(window.ethereum, "any");
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [{
          chainId: "0xCC",
          rpcUrls: ["https://opbnb-mainnet-rpc.bnbchain.org"],
          chainName: "opBNB",
          nativeCurrency: {
              name: "BNB",
              symbol: "BNB",
              decimals: 18
          },
          blockExplorerUrls: ["https://opbnbscan.com"]
      }]
    });
    await userProvider.send("eth_requestAccounts", []);
    let signer = userProvider.getSigner();
    let cyafarmContract = new ethers.Contract(contractAddress.cyafarmAddr, contractAbi.cyafarm, signer)
  
    try {
      await cyafarmContract.withdraw();
    } catch(e) {
      alert(e.message.replace('execution reverted: ',''));
    }
  
  }