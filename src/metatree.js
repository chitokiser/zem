 // testnet
 let contractAddress = {
    metatreeAddr: "0xf0eA125e362a89D5F9e7e942e978F95d07A9F974",

  };
   let contractAbi = {
   
    metatree: [
   
      "function check() public",
      "function memberjoin(uint _mid,address mento)public",
      "function withdraw()public",
      "function myinfo(address user) public view returns (uint256, uint256,uint256, uint8,uint256)",
      "function sum() public view returns(uint)",
      "function thistimepoint() public view returns(uint)",  //이번 수확할 가치
      "function happy() public view returns(uint)",
   
    ]

 
  };
  
  
  let metatreeds = async () => {
    // ethers setup
    let provider = new ethers.providers.JsonRpcProvider('https://opbnb-mainnet-rpc.bnbchain.org');
    let cyatreeContract = new ethers.Contract(contractAddress.metatreeAddr,contractAbi.metatree,provider);
    //계약잔고
 
    let treesum = await cyatreeContract.sum();
    let thappy = await cyatreeContract.happy();

  
    document.getElementById("tsum").innerHTML = parseInt(treesum);
    document.getElementById("happy").innerHTML = (thappy/1e18).toFixed(2);
   
   
  };
  
  metatreeds();






    

  
    let Mtmemberjoin = async () => {
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
      let signer = userProvider.getSigner();
      let cyatreeContract = new ethers.Contract(contractAddress.metatreeAddr,contractAbi.metatree,signer);

      try {
        await cyatreeContract.memberjoin(document.getElementById('mtmid').value,document.getElementById('mtmento').value);
      } catch(e) {
        alert(e.data.message.replace('execution reverted: ',''))
      }
    };

    let MtmemberLogin = async () => { 
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
      let signer = userProvider.getSigner();
      let cyatreeContract = new ethers.Contract(contractAddress.metatreeAddr, contractAbi.metatree, signer);
      let thishappy = await cyatreeContract.thistimepoint();
      
      // 여기에서 'await'를 추가합니다.
      let g2 = await cyatreeContract.myinfo(await signer.getAddress());
  
      let point = parseInt(g2[0]); 
      let dep = parseInt(g2[1]);
      let mynum = parseInt(g2[2]);
      let myt = parseInt(g2[3]); // 인출티켓
      let bonus = parseInt(g2[4]); // 인출티켓
      let sum = await cyatreeContract.sum();
  
      document.getElementById("thappy").innerHTML = (thishappy / 1e18).toFixed(2); // 이번 수확예정 열매가치
  
      document.getElementById("mywc").innerHTML = (10 - myt); // 남아 있는 CYA Token 인출 티켓
      document.getElementById("tdep").innerHTML = (dep); // 나의 깊이
      document.getElementById("tmynum").innerHTML = (mynum); // 나의 번호
      document.getElementById("Tjack").innerHTML = (point / 1e18).toFixed(2); // 현재 인출가능 포인트
      document.getElementById("RipeBar").style.width = `${(sum - mynum) / dep * 100}%`;
      document.getElementById("Bonus").innerHTML = (bonus); 
    };
  

      
    let Mtcheck = async () => {
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
      let signer = userProvider.getSigner();
      let cyatreeContract = new ethers.Contract(contractAddress.metatreeAddr,contractAbi.metatree,signer);

      try {
        await cyatreeContract.check();
      } catch(e) {
        alert(e.data.message.replace('execution reverted: ',''))
      }
    };


    let Mtwithdraw = async () => {
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
      let signer = userProvider.getSigner();
      let cyatreeContract = new ethers.Contract(contractAddress.metatreeAddr,contractAbi.metatree,signer);

      try {
        await cyatreeContract.withdraw();
      } catch(e) {
        alert(e.data.message.replace('execution reverted: ',''))
      }
    };