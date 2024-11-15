 // testnet
 let contractAddress = {
    cyafarmAddr: "0xFe854Efc07aF56c67ecC9A7E604E5e67C9663F2d",
  };  
   let contractAbi = {
  
    cyafarm: [
      "function bonding(uint _pay) public",
      "function withdraw( )public",
      "function loaning(uint num) public",
      "function payback( ) public",
      "function g7() public view returns(uint)",
      "function g3() public view returns(uint)",
      "function g10(address user) public view returns(uint)",
      "function g11() public view returns(uint256)",
      "function tax( ) public view returns(uint256)",
      "function mybond(address user ) public view returns(uint256,uint256)",
      "function myloan(address user ) public view returns(uint256,uint256,uint256,uint256)",
      
    ]
  
  };
  
  
  const topDataSync = async () => {
    // ethers setup
    const provider = new ethers.providers.JsonRpcProvider('https://opbnb-mainnet-rpc.bnbchain.org');
    const cyafarmContract = new ethers.Contract(contractAddress.cyafarmAddr,contractAbi.cyafarm,provider);
    const mrate = await cyafarmContract.g11();
    const tax = await cyafarmContract.tax();
    const mutbal = await cyafarmContract.g3();
    const tprice = await cyafarmContract.g7();
    document.getElementById("Mrate").innerHTML = (mrate-100);
    document.getElementById("Mrate2").innerHTML = (mrate-80);
    document.getElementById("Tax").innerHTML = (tax / 1e18).toFixed(2);
    document.getElementById("Mutbal").innerHTML = (mutbal);
    document.getElementById("Tprice").innerHTML = (mutbal*tprice/1e18).toFixed(2); //담보시가총액
     
           
  }  
       
  topDataSync();
  
  
  
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


  let Payback = async () => {  
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
      await cyafarmContract.payback();
    } catch(e) {  
      alert(e.data.message.replace('execution reverted: ',''))
    }
  };
  
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
    let mybond = await cyafarmContract .mybond(await signer.getAddress());
    let mydepo =  (await mybond[0]);
    let myt =  parseInt (await mybond[1]);
    document.getElementById("Mdepo").innerHTML= parseInt(mydepo/1e18);  //충전금 총액
    let time2 = parseInt(7776000); 
    let nowt = Math.floor(new Date().getTime()/ 1000);
    let left = parseInt((myt + time2)- nowt );
    let day = parseInt(left/60/60/24);
    let hour = parseInt(left/3600)%24;
    let min = parseInt((left/60)%60);
    let sec = left%60;

    document.getElementById("Mdepot").innerHTML = left > 0 ? `${day}일${hour}시간${min}분${sec}초` : ''; 
    
    let myloan = await cyafarmContract .myloan(await signer.getAddress());
    let mydepo2 =  (await myloan[0]);  //갚을돈
    let mydepo3 =  (await myloan[1]); //대출실행된돈
    let mydepo5 =  (await myloan[3]); //담보개수
    document.getElementById("Mdepo2").innerHTML= parseInt(mydepo2/1e18);  //충전금 총액
    document.getElementById("Mdepo3").innerHTML = parseInt(mydepo3/1e18);

    document.getElementById("Mdepo5").innerHTML = parseInt(mydepo5);
    
    let myt2 =  parseInt (await myloan[2]);
    let time3 = parseInt(7776000); 
    let nowt2 = Math.floor(new Date().getTime()/ 1000);
    let left2 = parseInt((myt2 + time3)- nowt2 );
    let day2 = parseInt(left2/60/60/24);
    let hour2 = parseInt(left2/3600)%24;
    let min2 = parseInt((left2/60)%60);
    let sec2 = left2%60;
    document.getElementById("Mdepo4").innerHTML = left2 > 0 ? `${day2}일${hour2}시간${min2}분${sec2}초` : ''; 
  
    let myloanable = await cyafarmContract .g10(await signer.getAddress());
    document.getElementById("Loanable").innerHTML = parseInt(myloanable/1e18);
  };
  
  

  
  let Bond = async () => {
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
      await cyafarmContract.bonding(document.getElementById('Seed').value);
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
      alert(e.message.replace('execution reverted: ',''));
    }
  };


 


  