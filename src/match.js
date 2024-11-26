
  
  
  let contractAddress = {
    matchAddr: "0xf4dDbb5Fb419b5437d254D5032430cd94cb79c90", // match contract address
  }; 
  
  let contractAbi = {
    match: [
      "function manAdd(string memory _mysns) public",
      "function ladyAdd(string memory _mysns, address _lady) public",
      "function HusbandApproval(address _man) public",
      "function acceptWife(uint256 _lid) public",
      "function withdraw() public",
      "function divorce() public",
      "function lid( ) public view returns(uint)", 
      "function g1( ) public view returns(uint)", 
      "function men(uint num) public view returns(string memory,uint,uint,uint,address,address,uint8)",
      "function ladies(uint num) public view returns(string memory,uint,address,address,uint8)",
    ]
  };
  
  const MtopDataSync = async () => {
    try {
      // ethers setup
      const provider = new ethers.providers.JsonRpcProvider('https://opbnb-mainnet-rpc.bnbchain.org');
      const matchContract = new ethers.Contract(contractAddress.matchAddr, contractAbi.match, provider);
  
      // Retrieve Lid (total number of ladies)
      const lid = await matchContract.lid();
      document.getElementById("Lid").innerHTML = lid;
  
      // Fetch BET balance
      const betbal = await matchContract.g1();
      document.getElementById("Betbal").innerHTML = (betbal / 1e18);
  
      // Clear existing lady data in the HTML
      const ladyListElement = document.getElementById("LadyList");
      ladyListElement.innerHTML = "";
  
      // Loop through each lady ID from 0 to lid - 1
      for (let i = 0; i < lid; i++) {
        try {
          const ladyDetails = await matchContract.ladies(i);
  
          // Extract details from the ladyDetails array
          const ladyName = ladyDetails[0]; // Name of the lady
          const ladyAge = ladyDetails[1]; // Age of the lady
          const ladyAddress = ladyDetails[2]; // Address of the lady
  
          // Match the lady with the corresponding image
          const ladyImage = `..\\images\\miyanma\\${i}.png`;
  
          // Create a new HTML element for this lady
          const ladyItem = document.createElement("div");
          ladyItem.className = "lady-item";
          ladyItem.innerHTML = `
            <img src="${ladyImage}" alt="Lady ${i + 1}" />
            <p><strong>Lady ${i + 1}</strong></p>
            <p>Name: ${ladyName}</p>
            <p>Age: ${ladyAge}</p>
            <p>Address: ${ladyAddress}</p>
          `;
  
          // Append the new element to the lady list
          ladyListElement.appendChild(ladyItem);
        } catch (ladyError) {
          console.error(`Error fetching lady details for ID ${i}:`, ladyError);
        }
      }
    } catch (error) {
      console.error("Error fetching data from contract:", error);
    }
  };
  
  
  
  
  // Execute the function
  MtopDataSync();
  
  

  

  
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
          let matchContract = new ethers.Contract(contractAddress.matchAddr, contractAbi.match, signer);
        
          let mygain = await matchContract.getpay(await signer.getAddress());
          let imytiket = await matchContract.mytiket(await signer.getAddress());
      
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
    let matchContract = new ethers.Contract(contractAddress.matchAddr, contractAbi.match, signer)
  
    try {
      await matchContract.seeding();
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
    let matchContract = new ethers.Contract(contractAddress.matchAddr, contractAbi.match, signer)
    const mid = document.getElementById('Mid').value;
    try {
      await matchContract.choice(mid);
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
    let matchContract = new ethers.Contract(contractAddress.matchAddr, contractAbi.match, signer)
    const iamount = document.getElementById('Amount').value;
    try {
      await matchContract.charge(iamount);
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
    let matchContract = new ethers.Contract(contractAddress.matchAddr, contractAbi.match, signer)
  
    try {
      await matchContract.withdraw();
    } catch(e) {
      alert(e.message.replace('execution reverted: ',''));
    }
  
  }