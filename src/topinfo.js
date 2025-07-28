

      const cA = {
        cyadexAddr: "0x547c1A704d610bb76988d6ff6aE0121a4A7cfE9b", //zemEX
        betgp: "0xdF904563a357971dC98052efe48a716Bee5CAaFA",  //gamepoint chage
        mutbankAddr:"0x8EBAA1f6fBb4197e83f88238e7386cB3A37bE355", //ZUMBank
        erc20: "0xB4C12Bf7491D70c91A2c272D191B7a3D4ED27bE5", //ZEM Token
      };
      const cB = {
        cyadex: [
          "function getprice() public view returns(uint256)",
          "function balance() public view returns(uint256)",
          "function cyabalances() public view returns(uint256)",
          "function buy() payable public",
          "function sell(uint256 num) public"
        ],
        betgp: [
          "function charge (uint _pay)public ",
          "function withdraw( )public",
          "function g1() public view virtual returns(uint256)",
          "function g2(address user) public view virtual returns(uint256)"
         
        ],

        mutbank: [
        "function memberjoin(address _mento) public",
        ],
        erc20: [
          "function approve(address spender, uint256 amount) external returns (bool)",
          "function allowance(address owner, address spender) external view returns (uint256)"
        ]
      };
      const topData = async () => {
        try {
          const responseBinanceTicker = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT');
          const bnbPrice = parseFloat(responseBinanceTicker.data.price);
          document.getElementById("bPrice").innerHTML = bnbPrice.toFixed(4);
          document.getElementById("cPrice2").innerHTML = (1 / bnbPrice).toFixed(4);
      
          // ethers setup
          const provider = new ethers.providers.JsonRpcProvider('https://1rpc.io/opbnb');
          let cyadexContract = new ethers.Contract(cA.cyadexAddr, cB.cyadex, provider);
          const betgpContract = new ethers.Contract(cA.betgp, cB.betgp, provider);
          let dexBal1 = await cyadexContract.balance();
          let dexBal = Number(dexBal1) + (967*1e16);
          let gpbal = await betgpContract.g1();
          document.getElementById("Tvl").innerHTML = parseFloat(dexBal / 1e18).toFixed(4);
          document.getElementById("Gpbal").innerHTML = parseFloat(gpbal / 1e18).toFixed(2);
        } catch (e) {
          // 에러 발생 시 아무 작업도 하지 않음
          console.error(e); // 필요 시 콘솔에만 에러를 출력
        }
      };
      
      topData();
      
      
      const addTokenZEM = async () => {
        await window.ethereum.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: {
              address: "0xB4C12Bf7491D70c91A2c272D191B7a3D4ED27bE5",//ZEM
              symbol: "ZEM",
              decimals: 18, 
              // image: tokenImage,
            },
          },
        });
      }

   
      const addTokenZUM = async () => {
        await window.ethereum.request({ 
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: {
              address: "0xD6F82173ca4Ffa2eC3dF47645A47931A1DDdE22f",  //ZUM
              symbol: "ZUM",
              decimals: 0, 
              // image: tokenImage,
            },
          },
        });
      }
   
     



let Tmemberjoin = async () => {
  try {
    const userProvider = new ethers.providers.Web3Provider(window.ethereum, "any");

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
    const signer2 = userProvider.getSigner();

    const meta5Contract = new ethers.Contract(cA.mutbankAddr, cB.mutbank, signer2);

    const mento = document.getElementById('Maddress').value;
    const tx = await meta5Contract.memberjoin(mento);
    await tx.wait(); // 트랜잭션 완료까지 기다리기
    alert("가입 성공!");
  }  catch (e) {
  let errorMessage = "오류 발생";

  if (e?.data?.message) {
    errorMessage = e.data.message;
  } else if (e?.error?.message) {
    errorMessage = e.error.message;
  } else if (e?.message) {
    errorMessage = e.message;
  }

  errorMessage = errorMessage.replace("execution reverted: ", "");

  alert(`Smart contract error message: ${errorMessage}`);
  console.error("memberjoin 오류 상세:", e);
}
};


// Function to initialize the provider and add the opBNB network if needed
async function initializeProvider() {
  userProvider = new ethers.providers.Web3Provider(window.ethereum, "any");
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
  signer2 = userProvider.getSigner();
}



let Betcharge = async () => {
  try {
    await initializeProvider();

    const betgpContract = new ethers.Contract(cA.betgp, cB.betgp, signer2);
    const amount = parseInt(document.getElementById('Amount').value);

    const transaction = await betgpContract.charge(amount);
    await transaction.wait();

    alert("충전 성공!");
 
  } catch (e) {
    const raw = e?.data?.message || e?.error?.message || e?.message || "";
    let clean = "알 수 없는 오류가 발생했습니다.";

    if (raw.includes("execution reverted:")) {
      const parts = raw.split("execution reverted:");
      clean = parts[1]?.split("(")[0]?.trim() || clean;
    }

    alert("오류: " + clean);
  }
};


document.getElementById("chargeButton").onclick = Betcharge;

// Betwithdraw function for the "withdraw" method in the contract
let Betwithdraw = async () => {
  try {
    await initializeProvider();

    const betgpContract = new ethers.Contract(cA.betgp, cB.betgp, signer2);

    const transaction = await betgpContract.withdraw();
    await transaction.wait();
    document.getElementById("resultMessage").innerText = "Withdrawal successful!";
   
  } catch (e) {
    document.getElementById("resultMessage").innerText = `Error: ${e.message.replace('execution reverted: ', '')}`;
  }
};

document.getElementById("withdrawButton").onclick = Betwithdraw;
let getUserMypgValue = async () => {
  try {
    await initializeProvider();
    
    const userAddress = await signer2.getAddress();
    const betgpContract = new ethers.Contract(cA.betgp, cB.betgp, signer2);

    const mygpValue = await betgpContract.g2(userAddress);

    document.getElementById("mypgResult").innerText = `${(mygpValue / 1e18).toFixed(2)} GP`;
 
  } catch (e) {
    document.getElementById("mypgResult").innerText = `Error: ${e.message.replace('execution reverted: ', '')}`;
  }
};

document.getElementById("checkMypgButton").onclick = getUserMypgValue;

// ✅ 지갑이 연결되어 있으면 자동으로 내 게임포인트(GP)를 표시하는 코드 추가

window.addEventListener("load", async () => {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.listAccounts();

    if (accounts.length > 0) {
      try {
        signer2 = provider.getSigner();
        const betgpContract = new ethers.Contract(cA.betgp, cB.betgp, signer2);

        const userAddress = await signer2.getAddress();
        const mygpValue = await betgpContract.g2(userAddress);

        const gpElement = document.getElementById("mypgResult");
        if (gpElement) {
          gpElement.innerText = `${(mygpValue / 1e18).toFixed(2)} GP`;
        }
      } catch (e) {
        const msg = e?.data?.message || e?.error?.message || e?.message || "오류 발생";
        document.getElementById("mypgResult").innerText = msg.replace("execution reverted: ", "");
      }
    }
  }
});
