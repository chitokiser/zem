 //history 

 let noticeAddress = {
    noticeAddr: "0x4a420021307AB722d9Fc0331e009fF9D7d598F3a", // ZumVote
  }; 
  
  let noticeAbi = {
    notice: [
       "function g3( ) public view returns(uint)",
      "function postNotice(string memory content) external onlyPostEligible",
      "function addComment(uint256 noticeId, string memory content) external onlyCommentEligible",
      "function vote(uint256 noticeId, bool agree) external",
      "function issueCommentReward(uint256 noticeId,uint256 cId) public",
      "function NoticeReward(uint256 noticeId) public",
      "function getCommentIDs(uint256 noticeId) public view returns (uint256[] memory)",
      "function tax( ) public view returns(uint)", 
      "function fee( ) public view returns(uint)", 
      "function noticeCount( ) public view returns(uint)", 
      "function commentCount( ) public view returns(uint)", 
      "function notices(uint num) public view returns( uint256 id,address author,string content,uint256 timestamp,uint256 agreeVotes,uint256 disagreeVotes,uint256 agreeWeight,uint256 disagreeWeight)",
      "function comments(uint num) public view returns( uint256 id,address commenter,string content,uint256 timestamp)"
    ]
  };

  let Ntopdate = async () => {
    try {
        const provider = new ethers.providers.JsonRpcProvider("https://1rpc.io/opbnb");
        const contract = new ethers.Contract(noticeAddress.noticeAddr, noticeAbi.notice, provider);
      
        ntvl = await contract.g3();  //전역변수 선언
        document.getElementById("Ntvl").innerHTML = parseFloat(ntvl);
  
        lottoContract.on("LottoResult", (winnum) => {
            console.log("LottoResult event received:", winnum);
            // Process the winnum array as needed and update the HTML
            updateLottoResults(winnum);
        });
    } catch (error) {
        console.error("Error in Ltopdate:", error);
    }
  };
  Ntopdate();
  
  // Utility function to truncate addresses
const truncateAddress = (address) => {
    if (address.length > 10) {
      return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }
    return address;
  };
  
  
  
 async function fetchNotices() {
  const provider = new ethers.providers.JsonRpcProvider("https://1rpc.io/opbnb");
  const contract = new ethers.Contract(noticeAddress.noticeAddr, noticeAbi.notice, provider);
  const noticesContainer = document.getElementById("notices-container");

  try {
    const noticeCount = await contract.noticeCount();

    for (let i = 0; i < noticeCount; i++) {
      try {
        const notice = await contract.notices(i);

        const noticeDiv = document.createElement("div");
        noticeDiv.classList.add("card", "mb-4", "w-100");
        noticeDiv.style.border = "1px solid #ccc";
        noticeDiv.style.margin = "10px";
        noticeDiv.style.padding = "20px";
        noticeDiv.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
        noticeDiv.style.borderRadius = "8px";

        noticeDiv.innerHTML = `
          <div class="row g-3 align-items-center">
            <div class="col-md-12">
              <h5 class="card-title">제안 ID: ${notice.id}</h5>
              <p><strong>작성자:</strong> ${truncateAddress(notice.author)}</p>
              <p><strong>제안내용:</strong> ${notice.content}</p>
              <p><strong>작성시간:</strong> ${new Date(notice.timestamp * 1000).toLocaleString('en-GB', { timeZone: 'Etc/GMT-3' })}</p>
              <p><strong>투표내용:</strong> 찬성 (${notice.agreeWeight}), 반대 (${notice.disagreeVotes})</p>
              <div class="d-flex justify-content-between my-3">
                <button class="btn btn-success w-25" onclick="vote(${notice.id}, 1)">찬성</button>
                <button class="btn btn-danger w-25" onclick="vote(${notice.id}, 2)">반대</button>
              </div>
              <div class="d-flex justify-content-between my-3">
                <button class="btn btn-warning w-50" onclick="claimNoticeReward(${notice.id})">작성자 보상요구</button>
              </div>
            </div>
            <div class="col-md-12">
              <h6>댓글내용:</h6>
              <ul class="list-group mb-3" id="comments-${notice.id}"></ul>
              <div class="input-group mb-3">
                <input type="text" class="form-control" id="comment-input-${notice.id}" placeholder="댓글 입력">
                <button class="btn btn-primary" onclick="addComment(${notice.id})">Submit</button>
              </div>
              <div class="d-flex justify-content-between my-3">
                <button class="btn btn-info w-50" onclick="claimCommentReward(${notice.id})">댓글보상</button>
              </div>
            </div>
          </div>
        `;

        noticesContainer.appendChild(noticeDiv);

        // 댓글 목록 로드
        const commentIds = await contract.getCommentIDs(notice.id);
        const commentsList = document.getElementById(`comments-${notice.id}`);

        for (const commentId of commentIds) {
          try {
            const comment = await contract.comments(commentId);

            const commentItem = document.createElement("li");
            commentItem.classList.add("list-group-item");
            commentItem.innerHTML = `
              <strong>${truncateAddress(comment.commenter)}</strong>: ${comment.content}<br>
              <small>${new Date(comment.timestamp * 1000).toLocaleString('en-GB', { timeZone: 'Etc/GMT-3' })}</small>
            `;
            commentsList.appendChild(commentItem);
          } catch (err) {
            console.warn(`댓글 ${commentId} 로드 실패`, err);
          }
        }
      } catch (e) {
        console.warn(`notice ${i} 로드 실패`, e);
        continue; // 다음 notice로 진행
      }
    }
  } catch (error) {
    console.error("전체 notice 불러오기 실패:", error);
  }
}

  async function addComment(noticeId) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(noticeAddress.noticeAddr, noticeAbi.notice, signer);

    const inputField = document.getElementById(`comment-input-${noticeId}`);
    const commentContent = inputField.value;

    if (!commentContent) {
      alert("Comment cannot be empty.");
      return;
    }

    try {
      const tx = await contract.addComment(noticeId, commentContent);
      await tx.wait();

      // Append the comment to the UI
      const commentsList = document.getElementById(`comments-${noticeId}`);
      const newCommentItem = document.createElement("li");
      newCommentItem.classList.add("list-group-item");
      newCommentItem.innerHTML = `
        <strong>${await signer.getAddress()}</strong>: ${commentContent} <br>
        <small>${new Date().toLocaleString()}</small>
      `;
      commentsList.appendChild(newCommentItem);

      // Clear the input field
      inputField.value = "";
      alert("Comment added successfully!");
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment. Please try again.");
    }
  }

async function vote(noticeId, option) {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(noticeAddress.noticeAddr, noticeAbi.notice, signer);

  try {
    const agree = option === 1 ? true : false; // ✔️ bool 타입으로 변환
    await contract.vote(noticeId, agree);
    alert(agree ? "Voted Agree!" : "Voted Disagree!");
    location.reload(); // Reload to update the vote count
  } catch (error) {
    console.error("Error voting:", error);
    alert("Failed to cast your vote:\n" + (error?.data?.message || error.message));
  }
}




async function postNotice() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  const userAddress = await signer.getAddress();

  const contract = new ethers.Contract(
    noticeAddress.noticeAddr,
    noticeAbi.notice,
    signer
  );

  const zumToken = new ethers.Contract(
    noticeAddress.zumTokenAddr,
    zumAbi,
    signer
  );

  const fee = ethers.utils.parseUnits("100", 18); // 소수점 없는 100 ZUM

  const content = document.getElementById("post-content").value;
  if (!content.trim()) {
    alert("내용을 입력해주세요.");
    return;
  }

  try {
    // 1단계: 토큰 승인
    const approveTx = await zumToken.approve(noticeAddress.noticeAddr, fee);
    alert("ZUM 승인 진행 중...");
    await approveTx.wait();

    // 2단계: 게시글 작성
    const tx = await contract.postNotice(content);
    alert("게시글 작성 중입니다...");
    await tx.wait();

    alert("게시글이 성공적으로 등록되었습니다!");
    location.reload();
  } catch (err) {
    console.error("Error posting notice:", err);
    alert("게시글 등록 실패:\n" + (err?.data?.message || err.message));
  }
}





  function togglePostForm() {
    const form = document.getElementById("post-notice-form");
    form.style.display = form.style.display === "none" ? "block" : "none";
}

async function claimNoticeReward(noticeId) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(noticeAddress.noticeAddr, noticeAbi.notice, signer);
  
    try {
      const tx = await contract.NoticeReward(noticeId);
      alert("Claiming notice reward...");
      await tx.wait();
      alert("Notice reward claimed successfully!");
      location.reload(); // 페이지 새로고침
    } catch (error) {
      console.error("Error claiming notice reward:", error);
      alert("Failed to claim notice reward. Please try again.");
    }
  }
  

  async function claimCommentReward(noticeId) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(noticeAddress.noticeAddr, noticeAbi.notice, signer);
  
    // cId를 가져오는 논리를 추가해야 함
    const commentId = prompt("Enter the comment ID to claim the reward:");
  
    if (!commentId) {
      alert("Comment ID is required!");
      return;
    }
  
    try {
      const tx = await contract.issueCommentReward(noticeId, commentId);
      alert("Claiming comment reward...");
      await tx.wait();
      alert("Comment reward claimed successfully!");
      location.reload(); // 페이지 새로고침
    } catch (e) {
        alert(e.data?.message.replace('execution reverted: ', '') || e.message);
    }
  }
  
  window.onload = async () => {
    if (typeof window.ethereum === "undefined") {
      alert("MetaMask가 설치되어 있지 않습니다. MetaMask 설치 후 이용하세요.");
    }
    
    // MetaMask가 설치된 경우 공지사항을 불러옴
    fetchNotices();
  };
  