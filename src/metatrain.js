 // metatree
 let mtAddress = {
  metatreeAddr: "0x898a086aA39868826c4c5659F93384F671Ad1067",
};  
 let mtAbi = {

  metatree: [
    "function initing() public",
    "function withdraw( )public",
    "function inputing() public",
    "function clear() public ",
    "function rate() public view returns(uint256)",
    "function tax( ) public view returns(uint256)",
    "function tax2( ) public view returns(uint256)",
    "function price( ) public view returns(uint256)",
    "function g3() public view returns(uint) ",
    "function g10() public view returns(uint) ", //수익율
    "function myinput(address user) public view returns(uint256,uint256,uint256,uint256,bool)",
    
    
  ]

};


const topDataSync = async () => {
  // ethers setup
  const provider = new ethers.providers.JsonRpcProvider('https://opbnb-mainnet-rpc.bnbchain.org');
  const cyafarmContract = new ethers.Contract(mtAddress.metatreeAddr,mtAbi.metatree,provider);
  const mutbal = await cyafarmContract.g3();
  const mrate = await cyafarmContract.rate();
  const price = await cyafarmContract.price();
  
  document.getElementById("Mutbal").innerHTML = (mutbal);
  document.getElementById("Mrate").innerHTML = (mrate);
  document.getElementById("Price").innerHTML = (price);
   
         
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
  const cyafarmContract = new ethers.Contract(mtAddress.metatreeAddr,mtAbi.metatree,signer);
  let mybond = await cyafarmContract.myinput(await signer.getAddress());
  let myt =  parseInt (await mybond[1]);
  let mytiket =  parseInt (await mybond[2]);
  let complete = await mybond[3] === 'true'; // complete 값 가져오기
  let time2 = parseInt(7 * 24 * 3600); // 7일 (초 단위)
  let nowt = Math.floor(new Date().getTime() / 1000);
  let left = parseInt((myt + time2) - nowt); // 남은 시간 계산
  let sevenDaysPassed = left <= 0; // 7일이 지났는지 여부 확인

  // 출금 버튼을 표시 또는 숨깁니다.
  if (complete && sevenDaysPassed) {
      document.getElementById("withdrawButton").style.display = "block"; // 출금 버튼 표시
      document.getElementById("withdrawMessage").innerText = "출금 가능"; // 출금 가능 메시지 표시
  } else {
      document.getElementById("withdrawButton").style.display = "none"; // 출금 버튼 숨김
      document.getElementById("withdrawMessage").innerText = ""; // 메시지 초기화
  }


  try {
    await cyafarmContract.withdraw();
  } catch(e) {  
    alert(e.data.message.replace('execution reverted: ',''))
  }
};


let Init = async () => {  
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

  const cyafarmContract = new ethers.Contract(mtAddress.metatreeAddr,mtAbi.metatree,signer);

  try {
    await cyafarmContract.initing();
  } catch(e) {  
    alert(e.data.message.replace('execution reverted: ',''))
  }
};



let Clear = async () => {  
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

  const cyafarmContract = new ethers.Contract(mtAddress.metatreeAddr,mtAbi.metatree,signer);

  try {
    await cyafarmContract.clear();
  } catch(e) {  
    alert(e.data.message.replace('execution reverted: ',''))
  }
};


let Tinput = async () => {  
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

  const cyafarmContract = new ethers.Contract(mtAddress.metatreeAddr,mtAbi.metatree,signer);

  try {
    await cyafarmContract.inputing();
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
  const cyafarmContract = new ethers.Contract(mtAddress.metatreeAddr,mtAbi.metatree,signer);
  let mybond = await cyafarmContract.myinput(await signer.getAddress());
  let mydepo =  (await mybond[0]);
  let myseed =  parseInt (await mybond[1]);
  let myt =  parseInt (await mybond[2]);
  let mytiket =  parseInt (await mybond[3]);
  let complete = await mybond[4] === 'true';
  document.getElementById("Mseed").innerHTML= (myseed);  //원금
  document.getElementById("Mdepo").innerHTML= (mydepo);  //1회인출가능금액 
  document.getElementById("Bar").style.width = `${mytiket/10*100}%`; // CHECK:: 소수점으로 나오는 것 같아 *100 했습니다.  
  let time2 = parseInt(86400);  // 1일
  let nowt = Math.floor(new Date().getTime() / 1000);
  let left = parseInt((myt + time2) - nowt); // 남은 시간 계산
  let day = parseInt(left / 60 / 60 / 24);
  let hour = parseInt(left / 3600) % 24;
  let min = parseInt((left / 60) % 60);
  let sec = left % 60;
  
  // 남은 시간이 24시간 이하인 경우에만 카운트다운을 표시합니다.
  if (left > 0 && left <= 24 * 3600) {
      document.getElementById("Mdepot").innerHTML = `24시간 안에 입금하세요: ${hour}시간 ${min}분 ${sec}초`;
  } else if (left > 24 * 3600) {
      // 아직 일주일이 안 지났을 경우에는 남은 시간을 표시합니다.
      let leftWeek = parseInt(left / (24 * 3600)); // 남은 일 수
      let leftHour = parseInt((left % (24 * 3600)) / 3600); // 남은 시간
      let leftMin = parseInt((left % 3600) / 60); // 남은 분
      let leftSec = left % 60; // 남은 초
      document.getElementById("Mdepot").innerHTML = `입금 가능까지 ${leftWeek}일 ${leftHour}시간 ${leftMin}분 ${leftSec}초 남았습니다.`;
  } else {
      document.getElementById("Mdepot").innerHTML = '';
  }
  
  
};








