// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// BET Token Interface
interface Ibet {
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function transfer(address recipient, uint256 happy) external returns (bool);
    function approve(address spender, uint256 happy) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 happy) external returns (bool);
}

// BUTBANK Interface
interface Ibutbank {
    function depoup(address _user, uint _depo) external;
    function getprice() external view returns (uint256);
    function getlevel(address user) external view returns (uint);
    function getmentolevel(address user) external view returns (uint);
    function getmento(address user) external view returns (address);
}

contract BetAlliance {
    // Structs
    struct Store {
        string name;
        string homepage;
        string phone;
        string location;
        uint256 rewardRate; // 1~50 (%)
        address owner;
        uint256 balance;
        uint256 totalRevenue;
        uint256 id;
    }

    // Interfaces
    Ibet public bet;
    Ibutbank public butbank;

    // State
    address public admin;
    address public taxWallet;
    uint256 public taxPool;
    uint256 public jackpotPool;
    uint256 public nextStoreId;
    uint256 public rate;
    mapping(uint256 => Store) public stores;
    mapping(address => uint8) public staffLevel;
    mapping(address => uint256) public mileage;

    // Events
    event RewardGiven(address indexed user, uint256 mileage);
    event JackpotWon(address indexed user, uint256 amount);

    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlyStaff(uint8 level) {
        require(staffLevel[msg.sender] >= level, "Insufficient staff level");
        _;
    }

    modifier onlyStoreOwner(uint256 storeId) {
        require(stores[storeId].owner == msg.sender, "Not store owner");
        _;
    }

    constructor(address _bet, address _butbank) {
        bet = Ibet(_bet);
        butbank = Ibutbank(_butbank);
        admin = msg.sender;
        taxWallet = _butbank;
        rate = 10000;
        staffLevel[msg.sender] = 5; // 최고 관리자
    }

    // 가맹점 등록
    function registerStore(string memory name, string memory homepage, string memory phone, string memory location, uint256 rewardRate) external {
        require(butbank.getlevel(msg.sender) >= 1, "Level too low");
        require(rewardRate >= 1 && rewardRate <= 50, "Invalid reward rate");

        stores[nextStoreId] = Store(name, homepage, phone, location, rewardRate, msg.sender, 0, 0, nextStoreId);
        nextStoreId++;
    }

    // 가맹점 정보 수정
    function editStore(uint256 storeId, string memory name, string memory homepage, string memory phone, string memory location, uint256 rewardRate, address newOwner) external onlyStaff(5) {
        require(stores[storeId].rewardRate >= 1, "Store not found");

        Store storage s = stores[storeId];
        s.name = name;
        s.homepage = homepage;
        s.phone = phone;
        s.location = location;
        s.rewardRate = rewardRate;
        s.owner = newOwner;
    }

    // 결제 및 리워드 처리
    function pay(uint256 storeId, uint256 amount) external {
        require(butbank.getlevel(msg.sender) >= 1, "Not a member");
        uint256 fee = amount * 1e18;
        require(bet.balanceOf(msg.sender) >= fee, "Insufficient BET");

          bet.approve(msg.sender, fee); 
        uint256 allowance = bet.allowance(msg.sender, address(this));
        require(allowance >= fee, "Check the token allowance");
        bet.transferFrom(msg.sender, address(this), fee); 

        uint256 reward = (fee * stores[storeId].rewardRate) / 100;
        uint256 jackpotPart = (reward * 80) / 100;
        uint256 taxPart = reward - jackpotPart;

        jackpotPool += jackpotPart;
        taxPool += taxPart;

        stores[storeId].balance += fee;
        mileage[msg.sender] += reward;

        emit RewardGiven(msg.sender, reward);
    }

    // 잭팟 응모
    function tryJackpot() external {
        require(mileage[msg.sender] >= 5e18, "Insufficient mileage");
        mileage[msg.sender] -= 5e18;

        uint256 luck = _random();
       uint256 jackpotAmount = (jackpotPool * luck) / rate/2;


        require(jackpotAmount > 0, "Jackpot too small");
        jackpotPool -= jackpotAmount;

        butbank.depoup(msg.sender, jackpotAmount);
        emit JackpotWon(msg.sender, jackpotAmount);
    }

    // 가맹점 매출 출금
    function withdraw(uint256 storeId) external onlyStoreOwner(storeId) {
        Store storage s = stores[storeId];
        uint256 withdrawable = (s.balance * (100 - s.rewardRate)) / 100;

        require(withdrawable >= 1e18, "Too small to withdraw");
        require(withdrawable <= bet.balanceOf(address(this)), "Insufficient contract balance");

        s.balance = 0;
        s.totalRevenue += withdrawable;

        require(bet.transfer(msg.sender, withdrawable), "Withdrawal failed");
        _sendTax();
    }

    // 스태프 지정
    function setStaff(address staff, uint8 level) external onlyAdmin {
        staffLevel[staff] = level;
    }

    // 관리자용 잭팟 수동 설정
    function setJackpot(uint256 amount) external onlyStaff(5) {
        jackpotPool = amount * 1e18;
    }

    // 관리자용 세금 지갑 변경
    function setTaxWallet(address newWallet) external onlyStaff(5) {
        taxWallet = newWallet;
    }

    // 내부: 세금 전송
    function _sendTax() internal {
        require(bet.transfer(taxWallet, taxPool), "Tax transfer failed");
        taxPool = 0;
    }

    // 유틸: 난수 생성 (0~999)
    function _random() internal view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, block.prevrandao))) % rate;
    }

    // 뷰 함수
    function getUserBET(address user) external view returns (uint256) {
        return bet.balanceOf(user);
    }

    function getUserMileage(address user) external view returns (uint256) {
        return mileage[user];
    }

    function getJackpot() external view returns (uint256) {
        return jackpotPool;
    }

    function getTaxPool() external view returns (uint256) {
        return taxPool;
    }
     function getContractBet() public view returns (uint256) {
        return bet.balanceOf(address(this));
    }
    receive() external payable {}
}
