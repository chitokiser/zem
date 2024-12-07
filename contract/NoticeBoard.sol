// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface Ibet {
    function balanceOf(address account) external view returns (uint256);
}

interface Ibut {
    function balanceOf(address account) external view returns (uint256);
}

interface Ibutbank {
    function depoup(address _user, uint256 _depo) external;
    function depodown(address _user, uint256 _depo) external;
    function g9(address user) external view returns (uint256);
}

contract NoticeBoard {
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

    struct Comment {
        address commenter;
        string content;
        uint256 timestamp;
    }

    Ibet public bet;
    Ibut public but;
    Ibutbank public butbank;

    address public admin;
    uint256 public postThreshold = 50000 * 10**18;
    uint256 public commentThreshold = 5000 * 10**18;
    uint256 public noticeCount;
    uint256 public tax;
    uint256 public fee = 1e18;
    uint256 public support = 1;

    mapping(address => uint256) public staff;
    mapping(uint256 => Notice) public notices;
    mapping(address => mapping(uint256 => bool)) public rewards;
    mapping(address => mapping(uint256 => bool)) public hasVoted;

    event NoticePosted(uint256 indexed noticeId, address indexed author, string content, uint256 timestamp);
    event CommentAdded(uint256 indexed noticeId, address indexed commenter, string content, uint256 timestamp);
    event Voted(uint256 indexed noticeId, address indexed voter, bool agree, uint256 weight);
    event RewardIssued(address indexed recipient, uint256 amount, string rewardType);

    constructor(address _but, address _bet, address _butbank) {
        but = Ibut(_but);
        bet = Ibet(_bet);
        butbank = Ibutbank(_butbank);
        admin = msg.sender;
        staff[msg.sender] = 10;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action.");
        _;
    }

    modifier onlyStaff() {
        require(staff[msg.sender] >= 5, "Only staff can perform this action.");
        _;
    }

    modifier onlyPostEligible() {
        require(but.balanceOf(msg.sender) >= postThreshold, "Not enough BUT tokens to post.");
        _;
    }

    modifier onlyCommentEligible() {
        require(but.balanceOf(msg.sender) >= commentThreshold, "Not enough BUT tokens to comment.");
        _;
    }

    function updatePostThreshold(uint256 newThreshold) external onlyAdmin {
        postThreshold = newThreshold;
    }

    function updateCommentThreshold(uint256 newThreshold) external onlyAdmin {
        commentThreshold = newThreshold;
    }

    function updateFee(uint256 newFee) external onlyAdmin {
        fee = newFee * 1e18;
    }

    function staffUp(address _user, uint256 _level) external onlyAdmin {
        staff[_user] = _level;
    }

    function supportUp(uint256 newSupport) external onlyStaff {
        support = newSupport;
    }

    function postNotice(string memory content) external onlyPostEligible {
        require(bytes(content).length > 0, "Content cannot be empty.");
        require(butbank.g9(msg.sender) >= fee, "Insufficient funds for posting.");

        butbank.depodown(msg.sender, fee);
        tax += fee;

        noticeCount++;
        Notice storage newNotice = notices[noticeCount];
        newNotice.id = noticeCount;
        newNotice.author = msg.sender;
        newNotice.content = content;
        newNotice.timestamp = block.timestamp;

        emit NoticePosted(noticeCount, msg.sender, content, block.timestamp);
    }

    function addComment(uint256 noticeId, string memory content) external onlyCommentEligible {
        require(noticeId > 0 && noticeId <= noticeCount, "Invalid notice ID.");
        require(bytes(content).length > 0, "Content cannot be empty.");

        Notice storage notice = notices[noticeId];
        notice.comments.push(Comment(msg.sender, content, block.timestamp));

        emit CommentAdded(noticeId, msg.sender, content, block.timestamp);
    }

    function vote(uint256 noticeId, bool agree) external {
        require(noticeId > 0 && noticeId <= noticeCount, "Invalid notice ID.");
        require(!hasVoted[noticeId][msg.sender], "You have already voted.");
        uint256 voterBalance = but.balanceOf(msg.sender);
        require(voterBalance > 0, "Must hold BUT tokens to vote.");

        hasVoted[noticeId][msg.sender] = true;
        Notice storage notice = notices[noticeId];

        if (agree) {
            notice.agreeVotes++;
            notice.agreeWeight += voterBalance;
        } else {
            notice.disagreeVotes++;
            notice.disagreeWeight += voterBalance;
        }

        emit Voted(noticeId, msg.sender, agree, voterBalance);
    }

    function issueNoticeReward(uint256 noticeId) public {
        require(notices[noticeId].author == msg.sender, "You are not the author.");
        require(notices[noticeId].agreeVotes >= support, "Not enough supporters.");
        require(!rewards[msg.sender][noticeId], "Reward already issued.");

        uint256 rewardAmount = tax / 100;
        require(tax >= rewardAmount, "Insufficient tax pool.");

        butbank.depoup(msg.sender, rewardAmount);
        tax -= rewardAmount;
        rewards[msg.sender][noticeId] = true;

        emit RewardIssued(msg.sender, rewardAmount, "Notice Reward");
    }

    function issueCommentReward(uint256 noticeId) public {
        require(!rewards[msg.sender][noticeId], "Reward already issued.");
        uint256 rewardAmount = tax / 1000;
        require(tax >= rewardAmount, "Insufficient tax pool.");

        butbank.depoup(msg.sender, rewardAmount);
        tax -= rewardAmount;
        rewards[msg.sender][noticeId] = true;

        emit RewardIssued(msg.sender, rewardAmount, "Comment Reward");
    }

    function getNotice(uint256 noticeId)
        external
        view
        returns (
            address author,
            string memory content,
            uint256 timestamp,
            uint256 agreeVotes,
            uint256 disagreeVotes,
            uint256 agreeWeight,
            uint256 disagreeWeight,
            Comment[] memory comments
        )
    {
        require(noticeId > 0 && noticeId <= noticeCount, "Invalid notice ID.");
        Notice storage notice = notices[noticeId];
        return (
            notice.author,
            notice.content,
            notice.timestamp,
            notice.agreeVotes,
            notice.disagreeVotes,
            notice.agreeWeight,
            notice.disagreeWeight,
            notice.comments
        );
    }
}


    function g1() public view virtual returns(uint256) {  
    return bet.balanceOf(address(this));
}

    function g2(address user) public view virtual returns(uint256) {  
    return bet.balanceOf(user);
}

function g3() public view returns(uint) { 
    return but.balanceOf(address(this));
}  
function g4(address user) public view returns(uint) { 
    return but.balanceOf(user);
}  

}
