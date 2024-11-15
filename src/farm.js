 
 let contractAddress = {
    cyafarmAddr: "0xC83E8A5701728C8F9bf5b30AB5FcdE65517A71Ce", //betfarm  
  }; 
   let contractAbi = {
  
    cyafarm: [
      "function seeding() public",
      "function choice(uint8 winnum) public",
      "function charge(uint256 _mypay)public",
      "function withdraw( )public",
      "function pllength( ) public view returns(uint)",
      "function getpl(uint num) public view returns(uint)",
      "function port(uint num) public view returns(uint,uint,uint,address)",
      "function getpay(address user) public view returns(uint)",
      "function mentopay(address user) public view returns(uint)",
      "function getvalue(uint num) public view returns(uint)",
      "function getmyfarm(uint num) public view returns(uint) ",
      "function getmygain() public view returns(uint) ",
      "function tax( ) public view returns(uint)", 
      "function mytiket(address user) public view returns(uint)", 
      "function rate( ) public view returns(uint)",
      "function remain( ) public view returns(uint256)",
      "function price( ) public view returns(uint256)",
      "function g1() public view virtual returns(uint256)",
      "event farmnum(uint winnum)"
    ]
  
  };
  
  
  const topDataSync = async () => {
    try {
      // ethers setup
      const provider = new ethers.providers.JsonRpcProvider('https://opbnb-mainnet-rpc.bnbchain.org');
      const cyafarmContract = new ethers.Contract(contractAddress.cyafarmAddr, contractAbi.cyafarm, provider);
  
      
      const fprice = await cyafarmContract.price();
      const fsum = await cyafarmContract.remain();
      const irate = await cyafarmContract.rate();
      const ipl = await cyafarmContract.pllength();
      const ibal = await cyafarmContract.g1();
  
      // 데이터를 HTML에 표시
      document.getElementById("Fprice").innerHTML = (fprice / 1e18);
      document.getElementById("Farmtotal").innerHTML = (fsum);
      document.getElementById("Rate").innerHTML = (irate / 1e18);
      document.getElementById("Pl").innerHTML = (ipl);
      document.getElementById("Cyabal").innerHTML = (ibal / 1e18);
  
      // Register event listener after contract initialization
      cyafarmContract.on('farmnum', (winnum) => {
        console.log('슬롯번호:', winnum);
        let eventS1Element = document.getElementById('event');
        if (eventS1Element) {
          eventS1Element.innerText = `예치된 슬롯: ${winnum}`;
        } else {
          console.error('Error: Element with ID "event" not found.');
        }
      });
  
      // NFT 관련 정보를 업데이트
      const nftIds = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
        11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
        31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
        41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
        51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
        61, 62, 63, 64, 65, 66, 67, 68, 69, 70,
        71, 72, 73, 74, 75, 76, 77, 78, 79, 80,
        81, 82, 83, 84, 85, 86, 87, 88, 89, 90,
        91, 92, 93, 94, 95, 96, 97, 98, 99, 100];
  
      const updateFarmCard = async (nftId) => {
        const depoInfo = await cyafarmContract.port(nftId);
        const valueInfo = await cyafarmContract.getvalue(nftId);
        const ownerInfo = depoInfo[3]; // 소유자 정보 추가 
  
        // 카드 구성 요소 생성
        const card = document.createElement("div");
        card.className = "card stylish-card";
  
        const cardBody = document.createElement("div");
        cardBody.className = "card-body";
  
        const cardTitle = document.createElement("h6");
        cardTitle.className = "card-title stylish-title";
        cardTitle.textContent = `Pot ${nftId}`;
  
        const depoText = document.createElement("p");
        depoText.className = "card-text stylish-text";
        depoText.textContent = `Seed price : ${depoInfo[0] / 1e18} BET`;
  
        const deponText = document.createElement("p");
        deponText.className = "card-text stylish-text";
        deponText.textContent = `Seeding NO : ${depoInfo[1]} th`;
  
        const valueText = document.createElement("p");
        valueText.className = "card-text stylish-text";
        valueText.textContent = `Value : ${valueInfo / 1e18} CYA`;
  
        const ownerText = document.createElement("p");
        ownerText.className = "card-text stylish-text";
        ownerText.textContent = `Owner : ${ownerInfo}`;
  
        // 카드 내용 구성
        cardBody.appendChild(cardTitle);
        cardBody.appendChild(depoText);
        cardBody.appendChild(deponText);
        cardBody.appendChild(valueText);
        cardBody.appendChild(ownerText);
        card.appendChild(cardBody);
  
    
        const farmCards = document.getElementById("farmCards");
        farmCards.appendChild(card);
      };
  
      // NFT 정보를 갱신
      for (const nftId of nftIds) {
        await updateFarmCard(nftId);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  // 함수 실행
  topDataSync();
  

  
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
        
          let mygain = await cyafarmContract.getpay(await signer.getAddress());
          let imytiket = await cyafarmContract.mytiket(await signer.getAddress());
      
          document.getElementById("Farmgain").innerHTML = parseInt(mygain/1e18).toFixed(2); //순이익 총액
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