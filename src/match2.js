

   //history 0xf4dDbb5Fb419b5437d254D5032430cd94cb79c90,0x6f940638987C72673b69d7Dd17E77B3daD79c194,0x3726a6060c79c736e82926791bd577322d662E77

   let contractAddress2 = {
    matchAddr2: "0x9f738D8aA594e56B6d0A3d0c7a0519F4F19b9E94", // match contract address
  }; 
  
  let contractAbi2 = {
    match2: [
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





// Mystatus를 전역 범위에 선언
let Mystatus = async () => {
    try {
      // Web3 provider 설정
      let userProvider = new ethers.providers.Web3Provider(window.ethereum, "any");
      
      // 네트워크 추가 요청
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
  
      // 서명자 가져오기
      let signer = userProvider.getSigner();
      let matchContract2 = new ethers.Contract(contractAddress2.matchAddr2, contractAbi2.match2, signer);
  
      // getMid 호출하여 사용자의 mid를 가져옵니다
      let userAddress = await signer.getAddress();
      let mid = await matchContract2.getMid(userAddress); // getMid 호출
      
      // men 함수 호출
      let men = await matchContract2.men(mid); // getMid로 받은 mid 값을 men 함수에 전달
  
      // 반환값 추출 및 HTML에 표시
      document.getElementById("Sns").innerHTML = `SNS: ${men[0]}`;
      document.getElementById("Depo").innerHTML = `Deposit: ${men[1] / 1e18} BET`; // assuming depo is in wei, convert to BNB
      document.getElementById("Time").innerHTML = `Time: ${men[2]}`;
      document.getElementById("Price").innerHTML = `One-time withdrawal amount: ${men[3] / 1e18} BET`;
      document.getElementById("Owner").innerHTML = `Owner Address: ${men[4]}`;
      document.getElementById("Mylady").innerHTML = `My wife: ${men[5]}`;
      document.getElementById("Num").innerHTML = `Number: ${men[6]}`;
    } catch (e) {
        alert(e.data.message.replace('execution reverted: ', ''))
    }
  };
  
  
  
  
    let setPrice = async () => {
      try {
        // Web3 Provider 설정
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    
        // 지갑 연결 요청
        await provider.send("eth_requestAccounts", []);
    
        // 서명자 가져오기
        const signer = provider.getSigner();
    
        // 스마트 컨트랙트와 연결
        const matchContract2 = new ethers.Contract(
          contractAddress2.matchAddr2,
          contractAbi2.match2,
          signer
        );
    
        // HTML 입력값 가져오기
        const priceInput = document.getElementById("priceInput").value;
    
        // 입력값 검증
        if (!priceInput || isNaN(priceInput) || priceInput <= 0) {
          alert("유효한 금액(양수)을 입력하세요.");
          return;
        }
    
  
    
        // 트랜잭션 실행
        const tx = await matchContract2.setPrice(priceInput);
    
        alert("Price update transaction sent! Waiting for confirmation...");
    
        // 트랜잭션 완료 대기
        const receipt = await tx.wait();
    
        alert("Price has been updated successfully!");
        console.log("Transaction receipt:", receipt);
      } catch (error) {
        console.error("Error in setPrice:", error);
    
        // 스마트 컨트랙트 에러 메시지 처리
        let errorMessage = "알 수 없는 에러가 발생했습니다.";
        if (error.data && error.data.message) {
          errorMessage = error.data.message.replace("execution reverted: ", "");
        } else if (error.message) {
          errorMessage = error.message;
        }
    
        alert(`Error: ${errorMessage}`);
      }
    };
    
  // handleAcceptWife는 사용자가 입력한 아내 번호를 가져와 acceptWife 함수에 전달합니다.
  let handleAcceptWife = async () => {
      // 입력된 번호 가져오기
      const wifeNumber = document.getElementById("wifeNumber").value;
    
      // 유효성 검사
      if (wifeNumber === "" || isNaN(wifeNumber) || wifeNumber <= 0) {
        alert("Please enter a valid women number.");
        return;
      }
    
      // 아내 수락 함수 호출
      await acceptWife(wifeNumber);
    };
    
    // acceptWife는 스마트 컨트랙트에서 아내 수락 트랜잭션을 실행하는 함수입니다.
    let acceptWife = async (_lid) => {
      try {
        // Web3 Provider 설정
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    
        // 지갑 연결 요청
        await provider.send("eth_requestAccounts", []);
    
        // 서명자 가져오기
        const signer = provider.getSigner();
    
        // 스마트 컨트랙트와 연결
        const matchContract2 = new ethers.Contract(
          contractAddress2.matchAddr2,
          contractAbi2.match2,
          signer
        );
    
        // 트랜잭션 실행
        const tx = await matchContract2.acceptWife(_lid);
    
        alert("Transaction sent! Waiting for confirmation...");
    
        // 트랜잭션 완료 대기
        const receipt = await tx.wait();
    
        alert("Wife acceptance successful!");
        console.log("Transaction receipt:", receipt);
      } catch (error) {
        console.error("Error in acceptWife:", error);
    
        // 스마트 컨트랙트 에러 메시지 처리
        let errorMessage = "알 수 없는 에러가 발생했습니다.";
        if (error.data && error.data.message) {
          errorMessage = error.data.message.replace("execution reverted: ", "");
        } else if (error.message) {
          errorMessage = error.message;
        }
    
        alert(`Error: ${errorMessage}`);
      }
    };
    
  
    let handleDivorce = async () => {
        try {
            // Web3 Provider 설정
            const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        
            // 네트워크 변경 시도
            try {
                await window.ethereum.request({
                    method: "wallet_switchEthereumChain",
                    params: [{ chainId: "0xCC" }], // 예시: opBNB ChainId
                });
            } catch (switchError) {
                // 네트워크가 없으면 추가
                if (switchError.code === 4902) {
                    await window.ethereum.request({
                        method: "wallet_addEthereumChain",
                        params: [
                            {
                                chainId: "0xCC",
                                rpcUrls: ["https://opbnb-mainnet-rpc.bnbchain.org"],
                                chainName: "opBNB",
                                nativeCurrency: {
                                    name: "BNB",
                                    symbol: "BNB",
                                    decimals: 18,
                                },
                                blockExplorerUrls: ["https://opbnbscan.com"],
                            },
                        ],
                    });
                } else {
                    throw switchError;
                }
            }
        
            // 지갑 연결 요청
            await provider.send("eth_requestAccounts", []);
        
            // 서명자 가져오기
            const signer = provider.getSigner();
        
            // 스마트 컨트랙트와 연결
            const matchContract2 = new ethers.Contract(
              contractAddress2.matchAddr2,
              contractAbi2.match2,
              signer
            );
        
            // 트랜잭션 실행
            const tx = await matchContract2.divorce();
        
            alert("Divorce request sent! Waiting for confirmation...");
        
            // 트랜잭션 완료 대기
            const receipt = await tx.wait();
        
            alert("Divorce successful! Transaction Hash: " + receipt.transactionHash);
      
        } catch (e) {
            let errorMessage = "An unknown error occurred";
            // 에러 메시지 추출
            if (e.data && e.data.message) {
                errorMessage = e.data.message.replace('execution reverted: ', '');
            } else if (e.message) {
                errorMessage = e.message;
            }
            alert(`Error: ${errorMessage}`);
        }
    };
    
    
  
    // handleCharge는 charge 기능을 실행하는 함수입니다.
  let handleCharge = async () => {
      try {
        // Web3 Provider 설정
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    
        // 지갑 연결 요청
        await provider.send("eth_requestAccounts", []);
    
        // 서명자 가져오기
        const signer = provider.getSigner();
    
        // 스마트 컨트랙트와 연결
        const matchContract2 = new ethers.Contract(
          contractAddress2.matchAddr2,
          contractAbi2.match2,
          signer
        );
    
        // 사용자로부터 금액 입력 받기
        const chargeAmount = document.getElementById("chargeAmount").value;
        if (!chargeAmount || chargeAmount <= 0) {
          alert("Please enter a valid amount to charge.");
          return;
        }
    
    
        // 트랜잭션 실행
        const tx = await matchContract2.charge(chargeAmount);
    
        alert("Charge request sent! Waiting for confirmation...");
    
        // 트랜잭션 완료 대기
        const receipt = await tx.wait();
    
        alert("Charge successful!");
        console.log("Transaction receipt:", receipt);
      } catch (error) {
        console.error("Error in charge:", error);
    
        // 스마트 컨트랙트 에러 메시지 처리
        let errorMessage = "알 수 없는 에러가 발생했습니다.";
        if (error.data && error.data.message) {
          errorMessage = error.data.message.replace("execution reverted: ", "");
        } else if (error.message) {
          errorMessage = error.message;
        }
    
        alert(`Error: ${errorMessage}`);
      }
    };
    
  
  
    
    
  
  let addManData = async () => {
    try {
      // Web3 Provider 설정
      const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  
      // 네트워크 변경
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xCC" }], // opBNB ChainId
      });
  
      // 지갑 연결 요청
      await provider.send("eth_requestAccounts", []);
  
      // 서명자 가져오기
      const signer = provider.getSigner();
  
      // 스마트 컨트랙트와 연결
      const matchContract2 = new ethers.Contract(
        contractAddress2.matchAddr2,
        contractAbi2.match2,
        signer
      );
  
      // 사용자 입력값 가져오기
      const snsInput = document.getElementById("ManSnsInput").value;
      if (!snsInput || snsInput.trim() === "") {
        alert("SNS 주소를 입력하세요!");
        return;
      }
  
      // 트랜잭션 실행
      const tx = await matchContract2.manAdd(snsInput);
      alert("Transaction sent! Waiting for confirmation...");
  
      // 트랜잭션 완료 대기
      const receipt = await tx.wait();
  
      alert("SNS 정보가 성공적으로 저장되었습니다!");
      console.log("Transaction receipt:", receipt);
    } catch (error) {
      console.error("Error in addManData:", error);
  
      // 에러 메시지 추출
      let errorMessage = "알 수 없는 에러가 발생했습니다.";
      if (error.data && error.data.message) {
        errorMessage = error.data.message.replace("execution reverted: ", "");
      } else if (error.message) {
        errorMessage = error.message;
      }
  
      alert(`Error: ${errorMessage}`);
    }
  };
  
  
  let addLadyData = async () => {
    try {
      // Web3 Provider 설정
      const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  
      // 지갑 연결 요청
      await provider.send("eth_requestAccounts", []);
  
      // 서명자 가져오기
      const signer = provider.getSigner();
  
      // 스마트 컨트랙트와 연결
      const matchContract = new ethers.Contract(
        contractAddress.matchAddr,
        contractAbi.match,
        signer
      );
  
      // 사용자 입력값 가져오기
      const snsInput = document.getElementById("LadySnsInput").value; // Lady SNS 주소 입력
      const ladyAddressInput = document.getElementById("LadyAddressInput").value; // Lady 주소 입력
  
      if (!snsInput || snsInput.trim() === "") {
        alert("SNS 주소를 입력하세요!");
        return;
      }
      if (!ladyAddressInput || ladyAddressInput.trim() === "") {
        alert("Lady 주소를 입력하세요!");
        return;
      }
  
      // 트랜잭션 실행
      const tx = await matchContract.ladyAdd(snsInput, ladyAddressInput);
      alert("Transaction sent! Waiting for confirmation...");
  
      // 트랜잭션 완료 대기
      const receipt = await tx.wait();
  
      alert("Lady 정보가 성공적으로 저장되었습니다!");
      console.log("Transaction receipt:", receipt);
    } catch (error) {
      console.error("Error in addLadyData:", error);
  
      // 에러 메시지 추출
      let errorMessage = "알 수 없는 에러가 발생했습니다.";
      if (error.data && error.data.message) {
        // 스마트 컨트랙트에서 발생한 `revert` 메시지 추출
        errorMessage = error.data.message.replace("execution reverted: ", "");
      } else if (error.message) {
        // 다른 종류의 에러 메시지
        errorMessage = error.message;
      }
  
      alert(`Error: ${errorMessage}`);
    }
  };
  

  let Approval = async () => {
    try {
      // Web3 provider 설정
      let userProvider = new ethers.providers.Web3Provider(window.ethereum, "any");
  
      // 네트워크 추가 요청
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: "0xCC",  // opBNB network ID
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
  
      // 서명자 가져오기
      let signer = userProvider.getSigner();
      let matchContract2 = new ethers.Contract(contractAddress2.matchAddr2, contractAbi2.match2, signer);
  
      // 승인을 선택한 값을 가져옵니다
      let choice = document.getElementById("approvalChoice").value;
  
      // HusbandApproval 함수 호출
      const tx = await matchContract2.HusbandApproval(choice);
  
      alert("Transaction sent! Waiting for confirmation...");
  
      // 트랜잭션 완료 대기
      const receipt = await tx.wait();
  
      alert("Approval action successful!");
      console.log("Transaction receipt:", receipt);
  
    } catch (error) {
      console.error("Error in HusbandApproval:", error);
  
      // 스마트 컨트랙트 에러 메시지 처리
      let errorMessage = "알 수 없는 에러가 발생했습니다.";
      if (error.data && error.data.message) {
        // 스마트 컨트랙트에서 발생한 오류 메시지 추출
        const revertReason = error.data.message.replace("execution reverted: ", "");
        errorMessage = `Smart contract error: ${revertReason}`;
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      } else {
        errorMessage = `Unexpected error: ${error}`;
      }
  
      // 에러 메시지 알림
      alert(errorMessage);
    }
};


let Withdraw = async () => {
    try {
      // Web3 provider 설정
      let userProvider = new ethers.providers.Web3Provider(window.ethereum, "any");
  
      // 네트워크 추가 요청
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: "0xCC",  // opBNB network ID
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
  
      // 서명자 가져오기
      let signer = userProvider.getSigner();
      let matchContract2 = new ethers.Contract(contractAddress2.matchAddr2, contractAbi2.match2, signer);


      const tx = await matchContract2.withdraw();
  
      alert("Transaction sent! Waiting for confirmation...");
  
      // 트랜잭션 완료 대기
      const receipt = await tx.wait();
  
      alert("Approval action successful!");
      console.log("Transaction receipt:", receipt);
  
    } catch (error) {
      console.error("Error in HusbandApproval:", error);
  
      // 스마트 컨트랙트 에러 메시지 처리
      let errorMessage = "알 수 없는 에러가 발생했습니다.";
      if (error.data && error.data.message) {
        // 스마트 컨트랙트에서 발생한 오류 메시지 추출
        const revertReason = error.data.message.replace("execution reverted: ", "");
        errorMessage = `Smart contract error: ${revertReason}`;
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      } else {
        errorMessage = `Unexpected error: ${error}`;
      }
  
      // 에러 메시지 알림
      alert(errorMessage);
    }
}; 


let GetLadyStatus = async () => {
    try {
    
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

        // 사용자 계정 요청
        await userProvider.send("eth_requestAccounts", []);

        // 서명자 가져오기
        let signer = userProvider.getSigner();
        let matchContract2 = new ethers.Contract(contractAddress2.matchAddr2, contractAbi2.match2, signer);

        // getlid 호출하여 사용자의 lid 가져오기
        let userAddress = await signer.getAddress();
        let lid = await matchContract2.getlid(userAddress); // getlid 호출하여 lid 값 가져오기

        // ladies 함수 호출하여 여자 정보 가져오기
        let lady = await matchContract2.ladies(lid); // getlid로 받은 lid 값을 ladies 함수에 전달

        // 반환값 추출
        let sns = lady[0];   // SNS
        let time = parseInt(lady[1]); // Deposit (초 단위)
        let owner = lady[2]; // Waiter address
        let waiter = lady[3];  // Man address
        let myman = lady[4];  // Owner address
        let ok = lady[5];     
        let num = lady[6];

        // 출금 가능 시간 계산
        const now = Math.floor(Date.now() / 1000); // 현재 시간 (초 단위)
        const withdrawalTime = time + 7 * 24 * 60 * 60; // 7 days를 더한 출금 가능 시간
        const timeLeft = withdrawalTime - now; // 남은 시간 계산

        let timeLeftFormatted = "";
        if (timeLeft > 0) {
            // 남은 시간을 일, 시, 분, 초로 계산
            const days = Math.floor(timeLeft / (24 * 60 * 60));
            const hours = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60));
            const minutes = Math.floor((timeLeft % (60 * 60)) / 60);
            const seconds = timeLeft % 60;
            timeLeftFormatted = `${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`;
        } else {
            timeLeftFormatted = "Withdrawal time is available!";
        }

        // HTML에 표시
        document.getElementById("LadySns").innerHTML = `SNS: ${sns}`;
        document.getElementById("LadyTime").innerHTML = `Time left until withdrawal: ${timeLeftFormatted}`;  
        document.getElementById("LadyOwner").innerHTML = `Owner Address: ${owner}`;
        document.getElementById("LadyWaiter").innerHTML = `Waiter: ${waiter}`;
        document.getElementById("LadyMyman").innerHTML = `Myman: ${myman}`;
        document.getElementById("LadyOk").innerHTML = `Approved: ${ok ? "Yes" : "No"}`;
        document.getElementById("LadyNum").innerHTML = `Number: ${num}`;

        // 실시간 남은 시간 업데이트
        if (timeLeft > 0) {
            setInterval(() => {
                const now = Math.floor(Date.now() / 1000);
                const newTimeLeft = withdrawalTime - now;

                if (newTimeLeft > 0) {
                    const newDays = Math.floor(newTimeLeft / (24 * 60 * 60));
                    const newHours = Math.floor((newTimeLeft % (24 * 60 * 60)) / (60 * 60));
                    const newMinutes = Math.floor((newTimeLeft % (60 * 60)) / 60);
                    const newSeconds = newTimeLeft % 60;

                    document.getElementById("LadyTime").innerHTML = 
                        `Time left until withdrawal: ${newDays} days ${newHours} hours ${newMinutes} minutes ${newSeconds} seconds`;
                } else {
                    document.getElementById("LadyTime").innerHTML = "Withdrawal time is available!";
                    clearInterval();
                }
            }, 1000);
        }

    } catch (error) {
        console.error("Error in GetLadyStatus:", error);
        alert("Failed to retrieve lady's data.");
    }
};