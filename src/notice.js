 //history 

 let noticeAddress = {
    noticeAddr: "0x94d213508e716511c6615E464E7cD4A9203435D9", // notice contract address
  }; 
  
  let noticeAbi = {
    notice: [
      "function postNotice(string memory content) external onlyPostEligible",
      "function addComment(uint256 noticeId, string memory content) external onlyCommentEligible",
      "function vote(uint256 noticeId, uint8 _num) external",
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
      
        ntvl = await contract.tax();  //전역변수 선언
        document.getElementById("Ntvl").innerHTML = parseFloat(ntvl / 1e18).toFixed(2);
  
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
  
      for (let i = 1; i <= noticeCount; i++) {
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
            <h5 class="card-title">Proposal ID: ${notice.id}</h5>
            <p><strong>Author:</strong> ${truncateAddress(notice.author)}</p>
            <p><strong>Content:</strong> ${notice.content}</p>
            <p><strong>Timestamp:</strong> ${new Date(notice.timestamp * 1000).toLocaleString()}</p>
            <p><strong>Votes:</strong> Agree (${notice.agreeVotes}), Disagree (${notice.disagreeVotes})</p>
            <div class="d-flex justify-content-between my-3">
              <button class="btn btn-success w-25" onclick="vote(${notice.id}, 1)">Agree</button>
              <button class="btn btn-danger w-25" onclick="vote(${notice.id}, 2)">Disagree</button>
            </div>
            <div class="d-flex justify-content-between my-3">
              <button class="btn btn-warning w-50" onclick="claimNoticeReward(${notice.id})">Claim Proposal Reward</button>
            </div>
          </div>
          <div class="col-md-12">
            <h6>Comments:</h6>
            <ul class="list-group mb-3" id="comments-${notice.id}">
              <!-- Comments will be dynamically added here -->
            </ul>
            <div class="input-group mb-3">
              <input type="text" class="form-control" id="comment-input-${notice.id}" placeholder="Write a comment">
              <button class="btn btn-primary" onclick="addComment(${notice.id})">Submit</button>
            </div>
            <div class="d-flex justify-content-between my-3">
              <button class="btn btn-info w-50" onclick="claimCommentReward(${notice.id})">Claim Comment Reward</button>
            </div>
          </div>
        </div>
      `;
      
  
        noticesContainer.appendChild(noticeDiv);
  
        // Fetch associated comment IDs
        const commentIds = await contract.getCommentIDs(notice.id);
  
        // Fetch comments for the notice
        const commentsList = document.getElementById(`comments-${notice.id}`);
        for (const commentId of commentIds) {
          const comment = await contract.comments(commentId);
  
          const commentItem = document.createElement("li");
          commentItem.classList.add("list-group-item");
          commentItem.innerHTML = `
            <p><strong>ID:</strong> ${comment.id}</p>
            <strong>${truncateAddress(comment.commenter)}</strong>: ${comment.content} <br>
            <small>${new Date(comment.timestamp * 1000).toLocaleString()}</small>
          `;
          commentsList.appendChild(commentItem);
        }
      }
    } catch (error) {
      console.error("Error fetching notices:", error);
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
      await contract.vote(noticeId, option);
      alert(option === 1 ? "Voted Agree!" : "Voted Disagree!");
      location.reload(); // Reload to update the vote count
    } catch (error) {
      console.error("Error voting:", error);
      alert("Failed to cast your vote.");
    }
  }




  // Function to post a new notice
  async function postNotice() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(noticeAddress.noticeAddr, noticeAbi.notice, signer);

    // Fetch content from textarea
    const content = document.getElementById("post-content").value;

    if (!content.trim()) {
        alert("Content cannot be empty!");
        return;
    }

    try {
        // Call the postNotice function
        const tx = await contract.postNotice(content);
        alert("Posting your notice...");
        await tx.wait();
        alert("Notice posted successfully!");
        location.reload(); // Reload the page to fetch updated notices
    } catch (error) {
        console.error("Error posting notice:", error);
        alert("Failed to post notice. Please try again.");
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
  
  window.onload = fetchNotices;