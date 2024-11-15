 
 let contractAddress = {
  cyafarmAddr: "0x47d69959a78753884784c287BAe66206FC6321eE",
};
 let contractAbi = {

  cyafarm: [
    "function seeding() public",
    "function pllength( ) public view returns(uint)",
    "function getpl(uint num) public view returns(uint)",
    "function allportinfo(uint num) public view returns(uint depo,uint depon,uint portn,address owner,uint start)",
    "function getperiod(uint num) public view returns(uint)",
    "function getvalue(uint num) public view returns(uint)",
    "function getmyfarm(uint num) public view returns(uint) ",
    "function getmygain() public view returns(uint) ",
    "function tax( ) public view returns(uint)", 
    "function rate( ) public view returns(uint)",
    "function remain( ) public view returns(uint256)",
    "function price( ) public view returns(uint256)",
    "event farmnum(uint winnum)"
  ]

};


const topDataSync = async () => {
  // ethers setup
  const provider = new ethers.providers.JsonRpcProvider('https://opbnb-mainnet-rpc.bnbchain.org');
  const cyafarmContract = new ethers.Contract(contractAddress.cyafarmAddr,contractAbi.cyafarm,provider);
  const fprice = await cyafarmContract.price();

  const fsum = await cyafarmContract.remain();
  const ttax = await cyafarmContract.rate();
  const creatnum = await cyafarmContract.pllength();
  //계약잔고
  const fcyabal = await cyafarmContract.tax();
  document.getElementById("Fprice").innerHTML = (fprice/1e18);

  document.getElementById("farmtotal").innerHTML = (fsum);
  document.getElementById("farmnum").innerHTML = (creatnum);
  document.getElementById("fcyatvl").innerHTML = (fcyabal/1e18).toFixed(2);;
  document.getElementById("Ttax").innerHTML = (100-ttax+1);
  
  const nftIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

const updateFarmCard = async (nftId) => {
    const depoInfo = await cyafarmContract.allportinfo(nftId);
    const periodInfo = await cyafarmContract.getperiod(nftId);
    const valueInfo = await cyafarmContract.getvalue(nftId);
    const ownerInfo = depoInfo.owner; // 소유자 정보 추가 
    const card = document.createElement("div");
    card.className = "card";
    
    const cardBody = document.createElement("div");
    cardBody.className = "card-body";
    
    const cardTitle = document.createElement("h6");
    cardTitle.className = "card-title";
    cardTitle.textContent = `농장번호 ${nftId}`;
    
    const depoText = document.createElement("p");
    depoText.className = "card-text";
    depoText.textContent = `최초농장가치 : ${depoInfo.depo/1e18} P`;
    
    const deponText = document.createElement("p");
    deponText.className = "card-text";
    deponText.textContent = `농장생성순서 : ${depoInfo.depon} 번째`;
    
    const periodText = document.createElement("p");
    periodText.className = "card-text";
    periodText.textContent = `농장운영기간 : ${periodInfo} 초`;
    
    const valueText = document.createElement("p");
    valueText.className = "card-text";
    valueText.textContent = `농장현재가치 : ${valueInfo/1E18} P`;
    
    // 소유자 정보를 추가
    const ownerText = document.createElement("p");
    ownerText.className = "card-text";
    ownerText.textContent = `농장소유자 : ${ownerInfo}`;
    
    cardBody.appendChild(cardTitle);
    cardBody.appendChild(depoText);
    cardBody.appendChild(deponText);
    cardBody.appendChild(periodText);
    cardBody.appendChild(valueText);
    // 카드 하단에 소유자 정보를 추가
    cardBody.appendChild(ownerText);  
    card.appendChild(cardBody);
    
    // 카드를 farmCards div에 추가
    const farmCards = document.getElementById("farmCards");
    farmCards.appendChild(card);
};

// 위에서 정의한 함수를 사용하여 농장 카드 업데이트
for (const nftId of nftIds) {
    updateFarmCard(nftId);
}

cyafarmContract.on('farmnum', (winnum) => {
    console.log('구매한농장ID:', winnum);
    document.getElementById('eventData').innerText = `구매한농장ID: ${winnum}`;
});

        
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
      
        let mygain = await cyafarmContract.getmygain();
        
        // let myFarms = [];
        // for (let i = 1; i <= 15; i++) {
        //   let farm = await cyafarmContract.getmyfarm(i);
        //   myFarms.push(farm);
        // }
        
        // document.getElementById("Myfarm").innerHTML = myFarms.join("<br>");
        document.getElementById("Farmgain").innerHTML = parseInt(mygain); //순이익 총액
       
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



topDataSync();
