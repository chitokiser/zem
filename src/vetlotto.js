let ltvl;
let address4= {
  delottoAddr: "0x1D157F2F4dc3255B077A46e8B4A8A9162143A669"};//주소만 바꾸었음
let abi4 = {

  delotto: [
      "function play(uint256[] memory numbers) public",
      " function withdraw( )public returns(bool)",
      " function  myreward(address user) public view returns(uint) ",
      "function  jack() public view returns(uint)",
      "function myinfo(address user) public view returns (uint256,uint256)",
      "event LottoResult(uint256[] winnum);",
      "event reward(uint amount);"
    ]

};

let Ltopdate = async () => {
  try {
      const provider = new ethers.providers.JsonRpcProvider('https://opbnb-mainnet-rpc.bnbchain.org');
      let lottoContract = new ethers.Contract(address4.delottoAddr, abi4.delotto, provider);
      ltvl = await lottoContract.jack();  //전역변수 선언
      document.getElementById("Ltvl").innerHTML = parseFloat(ltvl / 1e18).toFixed(2);

      lottoContract.on("LottoResult", (winnum) => {
          console.log("LottoResult event received:", winnum);
          // Process the winnum array as needed and update the HTML
          updateLottoResults(winnum);
      });
  } catch (error) {
      console.error("Error in Ltopdate:", error);
  }
};

function updateLottoResults(winnum) {
  // Process the winnum array and update the HTML
  let lottoResultsElement = document.getElementById("lottoResults");
  lottoResultsElement.innerHTML = ""; // Clear existing results
  for (let i = 0; i < winnum.length; i++) {
      let listItem = document.createElement("li");
      listItem.textContent = "Number " + (i + 1) + ": " + winnum[i].toString();
      lottoResultsElement.appendChild(listItem);
  }
}

async function listenForReward() {
  try {
      let userProvider = new ethers.providers.Web3Provider(window.ethereum, "any");
      let signer = userProvider.getSigner();
      let lottoContract = new ethers.Contract(address4.delottoAddr, abi4.delotto, signer);
      
      // Listen for the LottoResult event
      lottoContract.on("LottoResult", (winnum) => {
          console.log("LottoResult event received:", winnum);
          // Call the function to update the HTML with the Lotto results
          updateLottoResults(winnum);
      });

      // Listen for the reward event
      lottoContract.on("reward", (amount) => {
          console.log("Reward event received:", amount);
          // Call the function to update the HTML with the reward amount
          updateReward(amount);
      });
  } catch (error) {
      console.error("Error listening for events:", error);
  }
}

function updateReward(amount) {
  let rewardElement = document.getElementById("rewardAmount");
  rewardElement.textContent = "Reward Amount: " + amount;
}
 
function activateLottoAnimation(winnum){
    var lottoWrapperDiv = document.querySelector(".lotto-wrapper");
    var lottoBalls = lottoWrapperDiv.querySelectorAll(".lotto-ball");
    
    // Loop through each lotto ball and activate CSS animation if it matches the winnum
    lottoBalls.forEach((ball) => {
        var number = parseInt(ball.querySelector(".number").textContent);
        if (winnum.includes(number)) {
            ball.classList.add("active");
        }
    });
}

// Call the functions to start listening for events
Ltopdate();
listenForReward();



      async function Lplay() { // Play button function
        try {
            // Connect to Web3 provider using MetaMask
            let userProvider = new ethers.providers.Web3Provider(window.ethereum, "any");
            
            // Add Binance Smart Chain network to MetaMask
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
            
            // Request access to user accounts
            await userProvider.send("eth_requestAccounts", []);
            
            // Get signer and contract instance
            let signer = userProvider.getSigner();
            let lottoContract = new ethers.Contract(address4.delottoAddr, abi4.delotto, signer);
    
            // Get input numbers from the input field
            let inputNumbers = document.getElementById('inputNumbers').value;
            let numbersArray = inputNumbers.split(',').map(Number); // Convert input string to array of numbers
            
            // Check if exactly six numbers are provided
            if (numbersArray.length !== 6) {
                throw new Error("Please provide exactly six numbers separated by commas");
            }
    
            // Call the play function with the provided numbers
            await lottoContract.play(numbersArray);
        } catch (error) {
            // Display error message if execution fails
            alert(error.message);
        }
    }




    let Lottologin = async () => {
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
      let lottoContract = new ethers.Contract(address4.delottoAddr, abi4.delotto, signer);

      let my = await lottoContract.myinfo(await signer.getAddress());
      let tpoint =  parseInt(await my[0]);  //누적 인출금액
      let point =  parseInt(await my[1]);   //인출가능 상금
      
      let one =  parseInt((point+(ltvl*25/100)) * 2 );
      let two =  parseInt((point+(ltvl*5/100)) * 2 );
      // let three =  parseInt(point+ ) * 2 );

      document.getElementById("Ltotalpoint").innerHTML= (tpoint/1E18).toFixed(2); 
      document.getElementById("Lpoint").innerHTML= (point/1E18).toFixed(2); 
      document.getElementById("One").innerHTML= (one/1E18).toFixed(2); 
      document.getElementById("Two").innerHTML= (two/1E18).toFixed(2);
      document.getElementById("Three").innerHTML= ((point+4e18)/1E18).toFixed(2);
      document.getElementById("Four").innerHTML= ((point+3e18)/1E18).toFixed(2);
      document.getElementById("Five").innerHTML= ((point+2e18)/1E18).toFixed(2);

    };
  


  Ltopdate();