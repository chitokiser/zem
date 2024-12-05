

      const cA = {
        cyadexAddr: "0x40A29c38cA258020c6e2EdbcE9BD99f006f6260e", //NEW BUTEX
        betgp: "0x35575D072f2974414Bd1679047aD2EaD11EA8CF7",  //gamepoint chage
        mutbankAddr:"0x7af12A131182b966b813369Eb45393657a5a1bd5", //butbank
        erc20: "0xFA7A4b67adCBe60B4EFed598FA1AC1f79becf748",
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
        "function memberjoin(address _mento) public ",
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
          let dexBal = await cyadexContract.balance();
          let gpbal = await betgpContract.g1();
          document.getElementById("Tvl").innerHTML = parseFloat(dexBal / 1e18).toFixed(4);
          document.getElementById("Gpbal").innerHTML = parseFloat(gpbal / 1e18).toFixed(4);
        } catch (e) {
          // 에러 발생 시 아무 작업도 하지 않음
          console.error(e); // 필요 시 콘솔에만 에러를 출력
        }
      };
      
      topData();
      
      
      const addTokenBet = async () => {
        await window.ethereum.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: {
              address: "0xBF93D17Dbb666a552bf8De43C8002FE3a3638449",
              symbol: "BET",
              decimals: 18, 
              // image: tokenImage,
            },
          },
        });
      }

   
      const addTokenBut = async () => {
        await window.ethereum.request({ 
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: {
              address: "0xaCdA496b1f65F19Bb64E89B1D8fB89f10a47A163",  //new But
              symbol: "BUT",
              decimals: 0, 
              // image: tokenImage,
            },
          },
        });
      }
   
     



      


 let Tmemberjoin = async () => {
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

  let meta5Contract = new ethers.Contract(cA.mutbankAddr,cB.mutbank,signer);

  try {   
    await meta5Contract.memberjoin(document.getElementById('Maddress').value);
  } catch(e) {
    alert(e.data.message.replace('execution reverted: ',''))
  }
};


let userProvider, signer;

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
  signer = userProvider.getSigner();
}



let Betcharge = async () => {
  try {
    await initializeProvider();

    const betgpContract = new ethers.Contract(cA.betgp, cB.betgp, signer);
    const amount = parseInt(document.getElementById('Amount').value);

    const transaction = await betgpContract.charge(amount);
    await transaction.wait();
    document.getElementById("resultMessage").innerText = "Charge transaction successful!";
  } catch (e) {
    document.getElementById("resultMessage").innerText = `Error: ${e.message.replace('execution reverted: ', '')}`;
  }
};

document.getElementById("chargeButton").onclick = Betcharge;

// Betwithdraw function for the "withdraw" method in the contract
let Betwithdraw = async () => {
  try {
    await initializeProvider();

    const betgpContract = new ethers.Contract(cA.betgp, cB.betgp, signer);

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
    
    const userAddress = await signer.getAddress();
    const betgpContract = new ethers.Contract(cA.betgp, cB.betgp, signer);

    const mygpValue = await betgpContract.g2(userAddress);

    document.getElementById("mypgResult").innerText = `${(mygpValue / 1e18).toFixed(2)} GP`;

  } catch (e) {
    document.getElementById("mypgResult").innerText = `Error: ${e.message.replace('execution reverted: ', '')}`;
  }
};

document.getElementById("checkMypgButton").onclick = getUserMypgValue;

