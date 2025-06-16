// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface Ibut {
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function g1() external view returns (uint256);
}

interface Ibutbank {
    function expup(address _user, uint _exp) external;
    function depodown(address _user, uint _depo) external;
    function getprice() external view returns (uint256);
    function getlevel(address user) external view returns (uint);
    function getmentolevel(address user) external view returns (uint);
    function g9(address user) external view returns (uint);
}

contract QuizGame {
    Ibut public but;
    Ibutbank public butbank;

    address public admin;
    address public bank;
   uint public requiredJewelCount = 50;
    uint public butAmount ;
    uint public qid;
    uint public cards;
    uint public total;

    mapping(address => My) public myinfo;
    mapping(address => uint) public staff;
    mapping(uint => Quiz) public qs;
    mapping(address => mapping(uint => bool)) public claimedTreasure;
    mapping(address => uint256[]) public collect;
    event JewelsCombined(address indexed user, uint amount, uint level);


    struct My {
        uint256 opal;
        uint256 pearl;
        uint256 garnet;
        uint256 jade;
        uint256 zircon;
        uint256 crystal;
    }

    struct Quiz {
        uint id;
        uint reward;
        bytes32 answerHash;
        string answerEnc;
        string question;
    }

    event RewardClaimed(address indexed user, uint qrId, uint reward, string jewelType);
    event Wrong(string message);

    constructor(address _but, address _butbank) {
        but = Ibut(_but);
        butbank = Ibutbank(_butbank);
        admin = msg.sender;
        staff[msg.sender] = 10;
        bank = _butbank;
        butAmount = 600;
    }

    function registerQuiz(uint _reward, string memory _answer, string memory _question) public {
        require(staff[msg.sender] >= 5, "No staff access");
        qs[qid] = Quiz({
            id: qid,
            reward: _reward,
            answerHash: keccak256(abi.encodePacked(_answer)),
            answerEnc: _answer,
            question: _question
        });
        qid++;
    }

    function updateQuizAnswer(uint id, string memory _answer) public {
        require(staff[msg.sender] >= 5, "No staff access");
        qs[id].answerHash = keccak256(abi.encodePacked(_answer));
        qs[id].answerEnc = _answer;
    }

     function updateQuizQuestion(uint id, string memory _question) public {
        require(staff[msg.sender] >= 5, "No staff access");
        qs[id].question = _question;
    }

    function answer(uint qrId, string memory _answer) external {
        require(!claimedTreasure[msg.sender][qrId], "Already claimed");
        require(qrId < qid, "Invalid quiz ID");
      require(but.balanceOf(msg.sender) >= 1, "Requires 1 BUT token. ");

    but.approve(msg.sender, 1);
    uint256 allowance = but.allowance(msg.sender, address(this));
    require(allowance >= 1, "Check the allowance");
    but.transferFrom(msg.sender, address(this), 1); 

        if (qs[qrId].answerHash != keccak256(abi.encodePacked(_answer))) {
        emit Wrong("Wrong answer, try again.");
        return;
    }


        uint level = butbank.getlevel(msg.sender);
        require(level >= 1, "Insufficient level");

        (string memory jewelType, uint reward) = calculateReward(level,qrId);
        My storage user = myinfo[msg.sender];

        bytes32 jewelHash = keccak256(bytes(jewelType));
        if (jewelHash == keccak256("opal")) user.opal += reward;
        else if (jewelHash == keccak256("pearl")) user.pearl += reward;
        else if (jewelHash == keccak256("garnet")) user.garnet += reward;
        else if (jewelHash == keccak256("jade")) user.jade += reward;
        else if (jewelHash == keccak256("zircon")) user.zircon += reward;
        else user.crystal += reward;

        claimedTreasure[msg.sender][qrId] = true;
        butbank.expup(msg.sender, 500 * level);

        emit RewardClaimed(msg.sender, qrId, reward, jewelType);
    }

    function calculateReward(uint level,uint qrId) internal view returns (string memory, uint) {
        string[6] memory jewels = ["opal", "pearl", "garnet", "jade", "zircon", "crystal"];
        uint rand = uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, level))) % jewels.length;
        uint reward = (2 * level) + qs[qrId].reward;
        return (jewels[rand], reward);
    }

   function openbox1() public {
    My storage user = myinfo[msg.sender];

    require(user.opal >= requiredJewelCount, "Need more opal");
    require(user.pearl >= requiredJewelCount, "Need more pearl");
    require(user.garnet >= requiredJewelCount, "Need more garnet");

    user.opal -= requiredJewelCount;
    user.pearl -= requiredJewelCount;
    user.garnet -= requiredJewelCount;

    uint level = butbank.getlevel(msg.sender);
    uint rewardAmount = butAmount;

    require(but.balanceOf(address(this)) >= rewardAmount, "Insufficient BUT in contract");
    but.transfer(msg.sender, rewardAmount);

    emit JewelsCombined(msg.sender, rewardAmount, level);
}

  function openbox2() public {
    My storage user = myinfo[msg.sender];


    require(user.jade >= requiredJewelCount, "Need more jade");
    require(user.zircon >= requiredJewelCount, "Need more zircon");
    require(user.crystal >= requiredJewelCount, "Need more crystal");


    user.jade -= requiredJewelCount;
    user.zircon -= requiredJewelCount;
    user.crystal -= requiredJewelCount;

    uint level = butbank.getlevel(msg.sender);
    uint rewardAmount = butAmount*2;

    require(but.balanceOf(address(this)) >= rewardAmount, "Insufficient BUT in contract");
    but.transfer(msg.sender, rewardAmount);

    emit JewelsCombined(msg.sender, rewardAmount, level);
}



    function getAnswer(uint _id) public view returns (string memory) {
        require(staff[msg.sender] >= 5, "No staff access");
        return qs[_id].answerEnc;
    }

    function getcollect(address _address) external view returns (uint256[] memory) {
        return collect[_address];
    }

    function getCollectedCount(address _address) external view returns (uint256) {
        return collect[_address].length;
    }

    function isNumberCollected(address _address, uint256 _number) internal view returns (bool) {
        uint256[] memory collected = collect[_address];
        for (uint256 i = 0; i < collected.length; i++) {
            if (collected[i] == _number) {
                return true;
            }
        }
        return false;
    }

    function checkcollect(address _address) external view returns (bool) {
        for (uint256 i = 1; i <= cards; i++) {
            if (!isNumberCollected(_address, i)) {
                return false;
            }
        }
        return true;
    }

    function g3() public view returns (uint) {
        return but.balanceOf(address(this));
    }

    function getlevel(address user) public view returns (uint) {
        return butbank.getlevel(user);
    }
}
