// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface Izum {
    function balanceOf(address) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function transfer(address to, uint256) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256) external returns (bool);
}

interface Izumbank {
    function depoup(address _user, uint256 _depo) external;
    function depodown(address _user, uint256 _depo) external;
    function g9(address user) external view returns (uint256);
}

contract ZumVote {
    struct Comment {
        address commenter;
        string content;
        uint256 timestamp;
    }

    struct Notice {
        uint256 id;
        address author;
        string content;
        uint256 timestamp;
        uint256 agreeVotes;
        uint256 disagreeVotes;
        uint256 agreeWeight;
        uint256 disagreeWeight;
        Comment[] comments;
    }

    Izum public zum;
    Izumbank public zumbank;

    address public admin;
    uint256 public postThreshold = 500;
    uint256 public commentThreshold = 1;
    uint256 public noticeCount;
    uint256 public tax;
    uint256 public fee = 100;
    uint256 public support = 3;

    mapping(address => uint256) public staff;
    mapping(uint256 => Notice) public notices;
    mapping(uint256 => Comment[]) public allComments;
    mapping(address => mapping(uint256 => bool)) public rewards;
    mapping(address => mapping(uint256 => bool)) public hasVoted;

    event NoticePosted(uint256 indexed noticeId, address indexed author, string content, uint256 timestamp);
    event CommentAdded(uint256 indexed noticeId, address indexed commenter, string content, uint256 timestamp);
    event Voted(uint256 indexed noticeId, address indexed voter, bool agree, uint256 weight);
    event RewardIssued(address indexed recipient, uint256 amount, string rewardType);

    constructor(address _zum, address _zumbank) {
        zum = Izum(_zum);
        zumbank = Izumbank(_zumbank);
        admin = msg.sender;
        staff[msg.sender] = 10;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier onlyStaff() {
        require(staff[msg.sender] >= 5, "Only staff");
        _;
    }

    modifier onlyPostEligible() {
        require(zum.balanceOf(msg.sender) >= postThreshold, "Not enough ZUM");
        _;
    }

    modifier onlyCommentEligible() {
        require(zum.balanceOf(msg.sender) >= commentThreshold, "Not enough ZUM");
        _;
    }

    function updatePostThreshold(uint256 newThreshold) external onlyAdmin {
        postThreshold = newThreshold;
    }

    function updateCommentThreshold(uint256 newThreshold) external onlyAdmin {
        commentThreshold = newThreshold;
    }

    function updateFee(uint256 newFee) external onlyAdmin {
        fee = newFee;
    }

    function staffUp(address _user, uint256 _level) external onlyAdmin {
        staff[_user] = _level;
    }

    function supportUp(uint256 newSupport) external onlyStaff {
        support = newSupport;
    }

    function postNotice(string memory content) external onlyPostEligible {
        require(bytes(content).length > 0, "Empty content");
        require(g4(msg.sender) >= fee, "Not enough ZUM");
         zum.approve(msg.sender, fee);
    uint256 allowance = zum.allowance(msg.sender, address(this));
    require(allowance >= fee, "Check the allowance");
    zum.transferFrom(msg.sender, address(this), fee); 
        tax += fee;

        Notice storage newNotice = notices[noticeCount];
        newNotice.id = noticeCount;
        newNotice.author = msg.sender;
        newNotice.content = content;
        newNotice.timestamp = block.timestamp;

        emit NoticePosted(noticeCount, msg.sender, content, block.timestamp);
        noticeCount++;
    }

    function editNotice(uint256 _nid, string memory content) external onlyStaff {
        require(_nid < noticeCount, "Invalid ID");
        Notice storage n = notices[_nid];
        n.content = content;
        n.timestamp = block.timestamp;
        emit NoticePosted(_nid, msg.sender, content, block.timestamp);
    }

    function addComment(uint256 noticeId, string memory content) external onlyCommentEligible {
        require(noticeId < noticeCount, "Invalid ID");
        require(bytes(content).length > 0, "Empty comment");

        Comment memory c = Comment(msg.sender, content, block.timestamp);
        notices[noticeId].comments.push(c);
        allComments[noticeId].push(c);

        emit CommentAdded(noticeId, msg.sender, content, block.timestamp);
    }

    function vote(uint256 noticeId, bool agree) external {
        require(noticeId < noticeCount, "Invalid ID");
        require(!hasVoted[msg.sender][noticeId], "Already voted");

        uint256 bal = zum.balanceOf(msg.sender);
        require(bal > 0, "No ZUM");

        hasVoted[msg.sender][noticeId] = true;
        Notice storage n = notices[noticeId];

        if (agree) {
            n.agreeVotes++;
            n.agreeWeight += bal;
        } else {
            n.disagreeVotes++;
            n.disagreeWeight += bal;
        }

        emit Voted(noticeId, msg.sender, agree, bal);
    }

    function issueNoticeReward(uint256 noticeId) public {
        Notice storage n = notices[noticeId];
        require(n.author == msg.sender, "Not author");
        require(n.agreeVotes >= support, "Not enough support");
        require(!rewards[msg.sender][noticeId], "Already claimed");

        uint256 amount = tax / 100;
        require(tax >= amount, "Insufficient pool");

        zum.transfer(msg.sender, amount);
        tax -= amount;
        rewards[msg.sender][noticeId] = true;

        emit RewardIssued(msg.sender, amount, "Notice Reward");
    }

    function issueCommentReward(uint256 noticeId) public {
        require(!rewards[msg.sender][noticeId], "Already claimed");
        uint256 amount = tax / 1000;
        require(tax >= amount, "Insufficient pool");

        zum.transfer(msg.sender, amount);
        tax -= amount;
        rewards[msg.sender][noticeId] = true;

        emit RewardIssued(msg.sender, amount, "Comment Reward");
    }

    function getCommentIDs(uint256 noticeId) public view returns (uint256[] memory) {
        uint256 len = allComments[noticeId].length;
        uint256[] memory ids = new uint256[](len);
        for (uint i = 0; i < len; i++) {
            ids[i] = i;
        }
        return ids;
    }

    function comments(uint256 noticeId, uint256 index) public view returns (address, string memory, uint256) {
        Comment memory c = allComments[noticeId][index];
        return (c.commenter, c.content, c.timestamp);
    }

    function g3() public view returns (uint) {
        return zum.balanceOf(address(this));
    }

    function g4(address user) public view returns (uint) {
        return zum.balanceOf(user);
    }
}
