let metaddr = {  
    metmarket: "0x74d9A08baA32Cc3720C87df31b457389f016F145" //pack1
    
  };

  let metabi = {
  
    metmarket: [
       "function memberadd(uint _pid,address user) public",
       "function delivery(uint _bid) public",
       "function getmetainfo(uint _num) public view returns (string memory,string memory,string memory, uint256,uint256,uint256) ",
       "function memberadd(uint _pid,address user) public",
       "function delivery(uint _bid) public",
       "function newMeta(string memory _name,string memory _detail, string memory _img, uint256 _price,uint256 _left,uint256 _rate) public onlyStaff(5)"
      ],
      

  };

  let Approval = async () => {   //판매승인
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

    let metContract = new ethers.Contract(metaddr.metmarket, metabi.metmarket, signer);

    try {
      await metContract.approval(document.getElementById('Mt5id').value);
    } catch(e) {
      alert(e.data.message.replace('execution reverted: ',''))
    }
  };


  let Master = async () => {
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

    let metContract = new ethers.Contract(metaddr.metmarket, metabi.metmarket, signer);

    try {
      await metContract.masterup(document.getElementById('Telid').value);
    } catch(e) {
      alert(e.data.message.replace('execution reverted: ',''))
    }
  };



  


  let MemberLogin = async () => {
    try {
        // MetaMask 또는 지갑 연결
        await window.ethereum.request({ method: "eth_requestAccounts" });
        
        // 스마트 계약 인스턴스 생성
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const metContract = new ethers.Contract(metaddr.metmarket, metabi.metmarket, signer);

        // 사용자 정보 가져오기
        const my = await metContract.getmyInfo(await signer.getAddress());
        const myid = my[1];  //내 시작 아이디 
        const myMeta = my[2];
        const mytel = my[3];

        // 결과를 HTML에 업데이트
        document.getElementById("Mymid").innerHTML = parseInt(myid);
        document.getElementById("Myid").innerHTML = myMeta.toString();
        document.getElementById("Mytel").innerHTML = mytel.toString();
    } catch(e) {
      alert(e.data.message.replace('execution reverted: ',''))
    }
};

 
let newMeta = async () => {
  try {
      // MetaMask 또는 지갑 연결
      await window.ethereum.request({ method: "eth_requestAccounts" });
      
      // 스마트 계약 인스턴스 생성
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const metContract = new ethers.Contract(metaddr.metmarket, metabi.metmarket, signer);

      // 사용자 입력값 가져오기
      const metanum = document.getElementById("metanum").value;
      const investor = document.getElementById("investor").value;
      const init = document.getElementById("init").value;
      const mainpass = document.getElementById("mainpass").value;
      const mainid = document.getElementById("mainid").value;

      // newmeta 함수 호출
      const tx = await metContract.newmeta(metanum, investor, init, mainpass,mainid);

      // 트랜잭션 완료까지 대기
      await tx.wait();

      console.log("Transaction successful:", tx.hash);
  } catch (error) {
      // 오류 처리
      if (error.data && error.data.message) {
          alert(error.data.message.replace('execution reverted: ',''));
      } else {
          console.error("Error:", error);
      }
  }
};



  


