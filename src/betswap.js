 // testnet
 let contractAddress = {
    cyafarmAddr: "0xbe0D905967F26A93E6F6C56BE2E55Bc2e83e17BE",  //betswap
  };  
   let contractAbi = {
  
    cyafarm: [
      "function loaning(uint _but) public",
      "function deposing(uint _num) public",
      "function withdraw() public ",
      "function clear() public",
      "function g1() public view returns(uint)",
      "function g7() public view returns(uint)",
      "function g3() public view returns(uint)",
      "function g4() public view returns(uint)",
      "function g10() public view returns(uint)",
      "function g11() public view returns(uint256)",
      "function tax( ) public view returns(uint256)",
      "function mydepo(address user ) public view returns(uint256,uint256,uint256,uint8)",
      "function myloan(address user ) public view returns(uint256,uint256,uint256,uint256)",
      
    ]
  
  };
  
  
  const BtopDataSync = async () => {
    // ethers setup
    const provider = new ethers.providers.JsonRpcProvider('https://opbnb-mainnet-rpc.bnbchain.org');
    const cyafarmContract = new ethers.Contract(contractAddress.cyafarmAddr,contractAbi.cyafarm,provider);
    const apr = await cyafarmContract.g10();
    let ali = Number(apr) + 10;
    let n = 52; 
    let apy = (Math.pow(1 + ((apr-100) / 100) / n, n) - 1) * 100;
    const betbal = await cyafarmContract.g1();
    const butbal = await cyafarmContract.g3();
    const total = await cyafarmContract.g4();
    document.getElementById("Ali").innerHTML = ali-100;
    document.getElementById("Apr").innerHTML = apr-100;
    document.getElementById("Apy").innerHTML = apy.toFixed(2);
    document.getElementById("Betbal").innerHTML = parseFloat(betbal/1e18).toFixed(2);
    document.getElementById("Butbal").innerHTML = (butbal);
    document.getElementById("Total").innerHTML = parseFloat(total/1e18).toFixed(2);         
  }  
       
  BtopDataSync();
  
  
  
   let Withdraw = async () => {  //해결완료  에러메세지 작동함
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
    const signer = userProvider.getSigner();
  
    const cyafarmContract = new ethers.Contract(contractAddress.cyafarmAddr, contractAbi.cyafarm, signer);
  
    try {
      await cyafarmContract.withdraw();
    } catch(e) {  
      alert(e.data.message.replace('execution reverted: ',''))
    }
  };


  let Repay = async () => {  
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
    const signer = userProvider.getSigner();
  
    const cyafarmContract = new ethers.Contract(contractAddress.cyafarmAddr, contractAbi.cyafarm, signer);
  
    try {
      await cyafarmContract.clear();
    } catch(e) {  
      alert(e.data.message.replace('execution reverted: ',''))
    }
  };
  
  let Mystatus = async () => {
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
    let mybond = await cyafarmContract .mydepo(await signer.getAddress());
    let depoA =  (await mybond[0]);
    let asset =  (await mybond[1]);
    let tiket =  (await mybond[3]);
    document.getElementById("DepoA").innerHTML= parseInt(depoA/1e18).toFixed(2);
    document.getElementById("Asset").innerHTML = (asset / 1e18).toFixed(2);
    document.getElementById("Tiket").innerHTML= parseInt(tiket);
    let myt =  parseInt (await mybond[2]);  //시간
    let time2 = parseInt(604800); 
    let nowt = Math.floor(new Date().getTime()/ 1000);
    let left = parseInt((myt + time2)- nowt );
    let day = parseInt(left/60/60/24);
    let hour = parseInt(left/3600)%24;
    let min = parseInt((left/60)%60);
    let sec = left%60;

    document.getElementById("Myt").innerHTML = left > 0 ? `${day}일${hour}시간${min}분${sec}초` : ''; 
    
    let myloan = await cyafarmContract .myloan(await signer.getAddress());
    let mydepo2 =  (await myloan[0]);  //갚을돈
    let mydepo3 =  (await myloan[1]); //대출실행된돈
    let mydepo5 =  (await myloan[2]); //but담보개수
   
    document.getElementById("Mdepo2").innerHTML= parseInt(mydepo2/1e18).toFixed(2);  //충전금 총액
    document.getElementById("LoanA").innerHTML = parseInt(mydepo3/1e18).toFixed(2);
    document.getElementById("Mortgage").innerHTML = parseInt(mydepo5);
    
    let myt2 =  parseInt(await myloan[3]); //상환까지 남은시간
    let time3 = parseInt(31536000); 
    let nowt2 = Math.floor(new Date().getTime()/ 1000);
    let left2 = parseInt((myt2 + time3)- nowt2 );
    let day2 = parseInt(left2/60/60/24);
    let hour2 = parseInt(left2/3600)%24;
    let min2 = parseInt((left2/60)%60);
    let sec2 = left2%60;
    document.getElementById("Myt2").innerHTML = left2 > 0 ? `${day2}일${hour2}시간${min2}분${sec2}초` : ''; 
  

  };
  
  

  
  let Deposing = async () => {
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
    try {
      await cyafarmContract.deposing(document.getElementById('Seed').value);
    } catch(e) {
      alert(e.data.message.replace('execution reverted: ',''))
    }
  };
  
  let Loan = async () => {
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
    try {
      await cyafarmContract.loaning(document.getElementById('Seed2').value);
    } catch(e) {
      alert(e.data.message.replace('execution reverted: ',''))
    }
  };
  
 


  