
   //history 0xf4dDbb5Fb419b5437d254D5032430cd94cb79c90,0x6f940638987C72673b69d7Dd17E77B3daD79c194,0x3726a6060c79c736e82926791bd577322d662E77

  let contractAddress = {
    matchAddr: "0x9f738D8aA594e56B6d0A3d0c7a0519F4F19b9E94", // match contract address
  }; 
  
  let contractAbi = {
    match: [
      "function manAdd(string memory _mysns) public",
      "function ladyAdd(string memory _mysns, address _lady) public",
      "function HusbandApproval(uint8 _choice) public",
      "function acceptWife(uint256 _lid) public",
      "function withdraw() public",
      "function Propose(uint _lid) public",
      "function setPrice(uint256 _price) public",
      "function charge(uint256 _amount) public",
      "function divorce() public",
      "function lid( ) public view returns(uint)", 
      "function g1( ) public view returns(uint)", 
      "function getMid(address user) public view virtual returns(uint256)",
      "function getlid(address user) public view virtual returns(uint256)",
      "function getSns(uint _lid) public view returns (string memory)",
      "function men(uint num) public view returns(string memory,uint,uint,uint,address,address,uint8)",
      "function ladies(uint num) public view returns(string memory,uint,address,address,address,bool,uint8,uint)",
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
          const sns = ladyDetails[0]; // Name of the lady
          const time = ladyDetails[1]; // Age of the lady
          const address= ladyDetails[2]; // Address of the lady
          const waiter= ladyDetails[3]; 
          const myman= ladyDetails[4]; 
          const ok= ladyDetails[5]; 
          const num= ladyDetails[6]; 
          // Match the lady with the corresponding image
          const ladyImage = `..\\images\\miyanma\\${i}.png`;
  
          // Create a new HTML element for this lady
          const ladyItem = document.createElement("div");
          ladyItem.className = "lady-item";
          ladyItem.innerHTML = `
            <img src="${ladyImage}" alt="Lady ${i + 1}" />
            <p><strong>Lady ${i}</strong></p>
            <p>Time: ${time}</p>
            <p>Address: ${address}</p>
            <p>Proposal Waiter: ${waiter}</p>
            <p>Accept the proposal: ${ok}</p>
            <p>Number of times: ${num}</p>
             <button class="sns-button" id="snsButton-${i}">View SNS</button>
             <button class="propose-button" id="proposeButton-${i}">Propose</button>
          
          `;
  
      
          ladyListElement.appendChild(ladyItem);      
          document.getElementById(`snsButton-${i}`).addEventListener("click", async () => {
            try {
              const provider = new ethers.providers.Web3Provider(window.ethereum);
              await provider.send("eth_requestAccounts", []);
              const signer = provider.getSigner();
              const matchContractWithSigner = new ethers.Contract(
                contractAddress.matchAddr,
                contractAbi.match,
                signer
              );
          
              const sns = await matchContractWithSigner.getSns(i);
              if (sns && sns.startsWith("http")) {
                window.open(sns, "_blank"); // 새 탭에서 URL 열기
              } else {
                alert("SNS URL is invalid or not available.");
              }
            } catch (error) {
              console.error("Blockchain error:", error);
              let errorMessage = "An unknown error occurred.";
              if (error.data && error.data.message) {
                errorMessage = error.data.message;
              } else if (error.reason) {
                errorMessage = error.reason;
              } else if (error.message) {
                errorMessage = error.message;
              }
          
              if (errorMessage.includes("execution reverted:")) {
                errorMessage = errorMessage.split("execution reverted:")[1].trim();
              }
          
              alert(`Error: ${errorMessage}`);
            }
          });
          
        
          
  
  
          document.getElementById(`proposeButton-${i}`).addEventListener("click", async () => {
            try {
              const provider = new ethers.providers.Web3Provider(window.ethereum);
          

              await provider.send("eth_requestAccounts", []);
        
              const signer = provider.getSigner();
          
              // 서명자로 스마트 컨트랙트 호출 준비
              const matchContractWithSigner = new ethers.Contract(
                contractAddress.matchAddr,
                contractAbi.match,
                signer
              );
          
              // Propose 함수 호출
              const tx = await matchContractWithSigner.Propose(i);
          
              // 트랜잭션 완료 대기
              await tx.wait();
          
              alert(`Proposal sent for Lady ${i}!`);
            } catch (e) {
              // 스마트 컨트랙트 에러 메시지 추출
              let errorMessage = "";
          
              if (e.error && e.error.message) {
                // ethers.js가 제공하는 에러 메시지
                errorMessage = e.error.message;
              } else if (e.data && e.data.message) {
                // 트랜잭션 데이터에 포함된 메시지
                errorMessage = e.data.message;
              } else if (e.message) {
                // 일반 에러 메시지
                errorMessage = e.message;
              }
          
              // Solidity에서 `require` 또는 `revert`로 보낸 메시지만 추출
              if (errorMessage.includes("execution reverted:")) {
                errorMessage = errorMessage.split("execution reverted:")[1].trim();
              }
          
              // 사용자에게 에러 메시지 출력
              alert(`Error: ${errorMessage}`);
            }
          });
          
                    
          

} catch (ladyError) {
  console.error(`Error fetching lady details for ID ${i}:`, ladyError);
  ladyListElement.innerHTML += `<p>Error loading data for Lady ${i}</p>`;
}
}
} catch (error) {
console.error("Error fetching data from contract:", error);
}
};
  
  
  // Execute the function
  MtopDataSync();
  
  
// Toggle 버튼 클릭 시 섹션을 접거나 펼침
document.getElementById("toggleButton").addEventListener("click", function() {
    const statusSection = document.getElementById("myStatusSection");
    if (statusSection.classList.contains("collapse")) {
      statusSection.classList.remove("collapse");
      statusSection.classList.add("mystatusshow");
    } else {
      statusSection.classList.remove("mystatusshow");
      statusSection.classList.add("collapse");
    }
  });
  

  


  


 




