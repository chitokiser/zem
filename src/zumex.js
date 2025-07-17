 
      const contractAddress = {
        
        cyabankAddr:"0x8EBAA1f6fBb4197e83f88238e7386cB3A37bE355" //zumbank
   }
   
      const contractAbi = {


        cyabank: [
        "function g1() public view virtual returns(uint256)",
        "function g3() public view returns(uint) ",
        "function g11() public view virtual returns(uint256)",
        "function getprice() public view returns (uint256) ",
        "function allow() view returns(uint256)",
        "function allowt(address) view returns(uint256)",
        "function act() view returns(uint256)",
        "function g8(address user) public view returns(uint)",
        "function getpay(address user) public view returns (uint256)",
        "function buyzum(uint _num) public returns(bool)",
        "function sellcut(uint num) public returns(bool)",
        "function allowcation() public returns(bool) ",
 
        ]
    
      };

      const topMut = async () => {

        let provider = new ethers.providers.JsonRpcProvider('https://opbnb-mainnet-rpc.bnbchain.org');
      let cyabankContract = new ethers.Contract(contractAddress.cyabankAddr, contractAbi.cyabank, provider);

     

       let cyabal = await cyabankContract.g1(); //zem잔고
       let mutbal = await cyabankContract.g3(); //zum잔고
       let mutcir = await cyabankContract.g11();  //zum유통량
       let iprice = await cyabankContract.getprice();
       let iallow = await cyabankContract.allow();
       let iact = await cyabankContract.act();  //거래가능상태
       document.getElementById("Cyabal").innerHTML = (cyabal/1e18).toFixed(4);
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
  
      document.getElementById("epsLeftTime").innerHTML = left > 0 ? `${day}day${hour}hour${min}min${sec}sec` : '';
    };

 let Allow = async () => {
  let userProvider = new ethers.providers.Web3Provider(window.ethereum, "any");

  // 체인 추가
  await window.ethereum.request({
    method: "wallet_addEthereumChain",
    params: [{
      chainId: "0xCC", // opBNB Mainnet
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

  let cyabankContract = new ethers.Contract(
    contractAddress.cyabankAddr,
    contractAbi.cyabank,
    signer
  );

  try {
    await cyabankContract.allowcation();
  } catch (e) {
    // 스마트컨트랙트에서 revert 메시지 추출
    let errorMessage = "Unknown error";
    if (e.data && e.data.message) {
      // 메시지가 존재하면 정제
      errorMessage = e.data.message.replace("execution reverted: ", "");
    } else if (e.error && e.error.message) {
      errorMessage = e.error.message.replace("execution reverted: ", "");
    } else if (e.message) {
      errorMessage = e.message.replace("execution reverted: ", "");
    }

    alert(errorMessage);
  }
};


function handleError(e) {
  let rawMessage = e?.data?.message || e?.error?.message || e?.message || "";
  let cleanMessage = "알 수 없는 오류가 발생했습니다.";

  // execution reverted: 메시지 제거
  if (rawMessage.includes("execution reverted:")) {
    rawMessage = rawMessage.split("execution reverted:")[1];
  }

  // 괄호 안 한국어 메시지 추출 (예: revert INSUFFICIENT_FUNDS("잔액 부족"))
  const match = rawMessage.match(/"([^"]+)"/); // 큰따옴표 안 내용
  if (match && match[1]) {
    cleanMessage = match[1]; // "잔액 부족"
  } else {
    // 따옴표 없으면 revert 코드만 보여주기 (예: INSUFFICIENT_FUNDS)
    cleanMessage = rawMessage.split("(")[0].trim();
  }

  alert(cleanMessage);
  console.error("전체 에러:", e);
}

  
let Buymut = async () => {
  let userProvider = new ethers.providers.Web3Provider(window.ethereum, "any");

  try {
    // 네트워크 추가 및 스위치
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

    // 사용자 계정 요청
    await userProvider.send("eth_requestAccounts", []);
    let signer = userProvider.getSigner();

    // 스마트 계약 객체 생성
    let cyabankContract = new ethers.Contract(
      contractAddress.cyabankAddr,
      contractAbi.cyabank,
      signer
    );

    // 스마트 계약 메서드 호출
    await cyabankContract.buyzum(document.getElementById('buyAmount').value);
  } catch (e) {
    handleError(e);
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
        handleError(e);
    }
  };

  
 


      
    