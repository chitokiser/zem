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
    }catch (e) {
  alert(shortErrorMessage(e));
}

  };
  Ntopdate();
  

function shortErrorMessage(error) {
  let msg = "";

  // 1. data.message 형식
  if (error?.data?.message) {
    msg = error.data.message;
  }
  // 2. error.message 직접
  else if (error?.message) {
    msg = error.message;
  }
  // 3. 기타 JSON.stringify
  else {
    msg = JSON.stringify(error);
  }

  // 4. 공통 접두사 제거
  msg = msg.replace("execution reverted: ", "").replace("VM Exception while processing transaction: reverted with reason string ", "");

  // 5. 너무 길면 앞 60글자만 표시
  if (msg.length > 60) msg = msg.substring(0, 60) + "...";

  return msg;
}


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
<h5 class="card-title">Offer ID: ${notice.id}</h5> 
<p><strong>Author:</strong> ${truncateAddress(notice.author)}</p> 
<p><strong>Suggestion:</strong> ${notice.content}</p> 
<p><strong>Creation time:</strong> ${new Date(notice.timestamp * 1000).toLocaleString('en-GB', { timeZone: 'Etc/GMT-3' })}</p> 
<p><strong>Voting content:</strong> approval (${notice.agreeWeight}), opposition(${notice.disagreeVotes})</p> 
<div class="d-flex justify-content-between my-3"> 
<button class="btn btn-success w-25" onclick="vote(${notice.id}, 1)">approval</button> 
<button class="btn btn-danger w-25" onclick="vote(${notice.id}, 2)">opposition</button> 
</div> 

</div> 


</div> 
</div> 
`;

        noticesContainer.appendChild(noticeDiv);

 // load comment list 
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
console.warn(`Failed to load comment ${commentId}`, err);
}
}
} catch (e) {
console.warn(`Failed to load notice ${i}`, e);
continue; // Go to next notice
}
}
}catch (e) {
  alert(shortErrorMessage(e));
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
    } catch (e) {
  alert(shortErrorMessage(e));
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
  } catch (e) {
  alert(shortErrorMessage(e));
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
alert("Please enter content.");
return;
}

try {
// Step 1: Token approval
const approveTx = await zumToken.approve(noticeAddress.noticeAddr, fee);
alert("ZUM approval in progress...");
await approveTx.wait();

// Step 2: Posting
const tx = await contract.postNotice(content);
alert("Writing post...");
await tx.wait();

alert("Post successfully registered!");
location.reload();
} catch (e) {
  alert(shortErrorMessage(e));
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
    } catch (e) {
  alert(shortErrorMessage(e));
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
  alert(shortErrorMessage(e));
}

  }
  
window.onload = async () => {
if (typeof window.ethereum === "undefined") {
alert("MetaMask is not installed. Please install MetaMask and use it.");
}


// If MetaMask is installed, load the notices
fetchNotices();
  };
  