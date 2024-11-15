 
      const contractAddress = {
        
        cyabankAddr:"0x7af12A131182b966b813369Eb45393657a5a1bd5" //new butbank
   }
   
      const contractAbi = {


        cyabank: [
          "function g1() public view virtual returns(uint256)",
          "function g3() public view virtual returns(uint256)",
          "function g6() public view virtual returns(uint256)",
          "function g7() public view virtual returns(uint256)",
          "function g8(address user) public view virtual returns(uint256)",
          "function g9(address user) public view returns(uint)",
          "function g10() public view virtual returns(uint256)",
          "function allow() public view returns(uint256)",
          "function sum() public view returns(uint256)",
          "function act() public view returns(uint256)",
          "function allowt(address user) public view returns(uint256)",
          "function g11() public view virtual returns(uint256)",
          "function getprice() public view returns (uint256)",
          "function gettime() external view returns (uint256)",
          "function withdraw() public ",
          "function buycut(uint _num) public returns(bool)",
          "function sellcut(uint num)public returns(bool)",
          "function getpay(address user) public view returns (uint256)",
          "function allowcation() public returns(bool) "
 
        ]
    
      };

      const topMut = async () => {

        let provider = new ethers.providers.JsonRpcProvider('https://opbnb-mainnet-rpc.bnbchain.org');
      let cyabankContract = new ethers.Contract(contractAddress.cyabankAddr, contractAbi.cyabank, provider);

     

       let cyabal = await cyabankContract.g1(); //cya잔고
       let mutbal = await cyabankContract.g3(); //mut잔고
       let mutcir = await cyabankContract.g11();  //mut유통량
       let iprice = await cyabankContract.getprice();
       let iallow = await cyabankContract.allow();
       let iact = await cyabankContract.act();  //거래가능상태
       document.getElementById("Cyabal").innerHTML = (cyabal/2e21).toFixed(4);
       document.getElementById("Mutbal").innerHTML = (mutbal);
       document.getElementById("Mutcir").innerHTML = (mutcir);
       document.getElementById("Mprice").innerHTML = (iprice/1e18).toFixed(4);
       document.getElementById("Mallow").innerHTML = (iallow*10/2000/1e18*52).toFixed(8);
       document.getElementById("Act").innerHTML = (iact);
     };
  
     topMut();


     let cutmemberLogin = async () => {
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
      let provider = new ethers.providers.JsonRpcProvider('https://opbnb-mainnet-rpc.bnbchain.org');
      let signer = userProvider.getSigner();
      let cyabankContract = new ethers.Contract(contractAddress.cyabankAddr, contractAbi.cyabank, signer);
      let cyabankContract2 = new ethers.Contract(contractAddress.cyabankAddr, contractAbi.cyabank, provider);
      let mycut = parseInt(await cyabankContract.g8(await signer.getAddress()));
      let bankprice = parseInt(await cyabankContract2.getprice());
      let myallow= parseInt(await cyabankContract.getpay(await signer.getAddress()));
    
    
      document.getElementById("myCut").innerHTML = (mycut).toFixed(0);
      document.getElementById("myCutvalue").innerHTML = (mycut*(bankprice/1e18)).toFixed(4);
      document.getElementById("myAllow").innerHTML = (myallow/1e18).toFixed(4);
      
     
    
      let myt = parseInt(await cyabankContract2.allowt(await signer.getAddress()));
      let time2 = parseInt(604800); 
      let nowt = Math.floor(new Date().getTime()/ 1000);
      let left = parseInt((myt + time2)- nowt );
      let day = parseInt(left/60/60/24);
      let hour = parseInt(left/3600)%24;
      let min = parseInt((left/60)%60);
      let sec = left%60;
  
      document.getElementById("epsLeftTime").innerHTML = left > 0 ? `${day}일${hour}시간${min}분${sec}초` : '';
    };

  let Allow = async () => {
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

    let cyabankContract = new ethers.Contract(contractAddress.cyabankAddr, contractAbi.cyabank, signer);

    try {
      await cyabankContract.allowcation();
    } catch(e) {
      alert(e.data.message.replace('execution reverted: ',''))
    }
  };


  

  let Buymut = async () => {
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

    let cyabankContract = new ethers.Contract(contractAddress.cyabankAddr, contractAbi.cyabank, signer);

    try {
      await cyabankContract.buycut(document.getElementById('buyAmount').value);
    } catch(e) {
      alert(e.data.message.replace('execution reverted: ',''))
    }
  };

  let Sellmut = async () => {
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

    let cyabankContract = new ethers.Contract(contractAddress.cyabankAddr, contractAbi.cyabank, signer);

    try {
      await cyabankContract.sellcut(document.getElementById('sellAmount').value);
    } catch(e) {
      alert(e.data.message.replace('execution reverted: ',''))
    }
  };

  let Salebuycut = async () => {
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

    let cutdefiContract = new ethers.Contract(contractAddress.cutdefiAddr, contractAbi.cutdefi, signer);

    try {
      await cutdefiContract.buycut();
    } catch(e) {
      alert(e.data.message.replace('execution reverted: ',''))
    }
  };

  let Salesellcut = async () => {
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

    let cutdefiContract = new ethers.Contract(contractAddress.cutdefiAddr, contractAbi.cutdefi, signer);

    try {
      await cutdefiContract.sellcut(document.getElementById('salesell').value);
    } catch(e) {
      alert(e.data.message.replace('execution reverted: ',''))
    }
  };
 


      
    