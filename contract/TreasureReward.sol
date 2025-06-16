// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface Ibut {      
  function balanceOf(address account) external view returns (uint256);
  function allowance(address owner, address spender) external view returns (uint256);
  function transfer(address recipient, uint256 amount) external returns (bool);
  function approve(address spender, uint256 amount) external returns (bool);
  function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
  function g1() external view returns(uint256);
  function getdepot(address user) external view returns(uint256);
}

interface Ibutbank {
    function depoup(address _user, uint _depo) external;
    function depodown(address _user, uint _depo) external;
    function getprice() external view returns (uint256);
    function getlevel(address user) external view returns (uint);
    function g8(address user) external view returns(uint);
    function g9(address user) external view returns (uint);
    function getagent(address user) external view returns (address);
    function getmento(address user) external view returns (address);
    function expup(address _user, uint _exp) external;
}

contract TreasureReward {
    address public owner;
    Ibutbank public butbank;
    Ibut public but;
    uint public butAmount;
    // treasure 등록 리스트 및 존재 확인용
    uint[] public treasure;
    mapping(uint => bool) public treasureList;

    // 사용자별 보석 정보
    struct My {
        uint256 ruby;
        uint256 sapp;
        uint256 emer;
        uint256 topa;
        uint256 dia;
        uint256 gold;
    }

    mapping(address => My) public myinfo;

    // 사용자별 보물 기록
    mapping(address => uint[]) public mytreasure;

    // 사용자별 보물 클레임 여부
    mapping(address => mapping(uint => bool)) public claimedTreasure;

    event RewardClaimed(address indexed user, uint qrId, uint amount, string jewel);
    event open(address indexed useer, uint rewardAmount, uint level);


    constructor(address _but,address _butbank) {
        owner = msg.sender;
        but = Ibut(_but);
        butbank = Ibutbank(_butbank);
        butAmount = 3000;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    // ✅ 보물 등록 (관리자만 가능)
    function registerTreasure(uint qrId) external onlyOwner {
        require(!treasureList[qrId], "Already registered");
        treasure.push(qrId);
        treasureList[qrId] = true;
    }

    // ✅ 보물 but보상 (관리자만 가능)
    function butedit(uint _but) external onlyOwner {
      butAmount = _but;
    }

 function claimTreasure(uint qrId) external {
    require(treasureList[qrId], "Invalid treasure");
    require(!claimedTreasure[msg.sender][qrId], "Already claimed");
    require(but.balanceOf(msg.sender) >= 1, "Requires 1 BUT token. ");

    but.approve(msg.sender, 1);
    uint256 allowance = but.allowance(msg.sender, address(this));
    require(allowance >= 1, "Check the allowance");
    but.transferFrom(msg.sender, address(this), 1); 

    uint level = butbank.getlevel(msg.sender);
    require(level >= 1, "Not enough level");

    (string memory jewelType, uint reward) = calculateReward(level);

    // 보석 기록 (단순화)
    My storage user = myinfo[msg.sender];
    bytes32 jewelHash = keccak256(bytes(jewelType));

    if (jewelHash == keccak256("ruby")) {
        user.ruby += reward;
    } else if (jewelHash == keccak256("sapp")) {
        user.sapp += reward;
    } else if (jewelHash == keccak256("emer")) {
        user.emer += reward;
    } else if (jewelHash == keccak256("topa")) {
        user.topa += reward;
    } else if (jewelHash == keccak256("dia")) {
        user.dia += reward;
    } else {
        user.gold += reward;
    }

    // 보물 등록 및 경험치 추가
    mytreasure[msg.sender].push(qrId);
    claimedTreasure[msg.sender][qrId] = true;
    butbank.expup(msg.sender, 500 * level);

    emit RewardClaimed(msg.sender, qrId, reward, jewelType);
}




   function openbox1() public {
          require(myinfo[msg.sender].ruby >= 50, "Need at least 10 ruby");
    require(myinfo[msg.sender].sapp >= 50, "Need at least 10 sapphire");
    require(myinfo[msg.sender].emer >= 50, "Need at least 10 emerald");


    myinfo[msg.sender].ruby -= 50;
    myinfo[msg.sender].sapp -= 50;
    myinfo[msg.sender].emer -= 50;

    uint level = butbank.getlevel(msg.sender);
    uint rewardAmount = butAmount ;

    require(but.balanceOf(address(this)) >= rewardAmount, "Not enough BUT tokens in contract");
    but.transfer(msg.sender, rewardAmount);

    emit open(msg.sender, rewardAmount, level);
}
function openbox2() public {
  
    require(myinfo[msg.sender].topa >= 50, "Need at least 10 topaz");
    require(myinfo[msg.sender].dia >= 50, "Need at least 10 diamond");
    require(myinfo[msg.sender].gold >= 50, "Need at least 10 gold");

    myinfo[msg.sender].topa -= 50;
    myinfo[msg.sender].dia -= 50;
    myinfo[msg.sender].gold -= 50;

    uint level = butbank.getlevel(msg.sender);
    uint rewardAmount = butAmount * 2;

    require(but.balanceOf(address(this)) >= rewardAmount, "Not enough BUT tokens in contract");

    but.transfer(msg.sender, rewardAmount);

    emit open(msg.sender, rewardAmount, level);
}


    // ✅ 보상 계산 함수 (보석 랜덤화 포함)
    function calculateReward(uint level) internal view returns (string memory, uint) {
        string[6] memory jewels = ["ruby", "sapp", "emer", "topa", "dia", "gold"];
        uint rand = uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, level))) % jewels.length;
        uint reward = (10 * level) + (rand * 2); // 레벨 기반 보상 + 난수 보너스
        return (jewels[rand], reward);
    }

    // ✅ 보유한 보물 ID 확인
    function getMyTreasure(address user) external view returns (uint[] memory) {
        return mytreasure[user];
    }

    // ✅ 보물 여부 확인
    function isTreasure(uint qrId) external view returns (bool) {
        return treasureList[qrId];
    }

    // ✅ 클레임 여부 확인
    function hasClaimed(address user, uint qrId) external view returns (bool) {
        return claimedTreasure[user][qrId];
    }
    
    function g3() public view returns(uint) { 
    return but.balanceOf(address(this));
}  
function g8(address user) public view returns(uint) {  
    return but.balanceOf(user);
} 


}
