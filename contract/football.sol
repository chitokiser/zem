// SPDX-License-Identifier: MIT  
// ver1.2
pragma solidity >=0.7.0 <0.9.0;

interface Ibet {
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool); 
}

interface Ibut {
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool); 
}

interface Ibutbank {
    function depoup(address _user, uint _depo) external;
    function depodown(address _user, uint _depo) external;
    function getprice() external view returns (uint256);
    function getlevel(address user) external view returns (uint);
    function g8(address user) external view returns(uint); //유저별 cut 현황
    function g9(address user) external view returns (uint); // 각 depo현황
    function getagent(address user) external view returns (address);
    function getmento(address user) external view returns (address);
    function expup(address _user, uint _exp) external;
}

contract footbet { 
    Ibet bet;
    Ibut but;
    Ibutbank butbank;

    address public admin; 
    address public taxbank;
    uint256 public pid; //game num
    uint256 public bid; //beter num
    uint256 public tax; 
 
    mapping(address => uint8) public staff;
    mapping(uint256 => Meta) public ms; 
    mapping(address => mapping(uint => uint)) public bets; //1.gameid 2.betmoney
    mapping(address => mapping(uint => uint8)) public betcase; //1.gameid 2.bet case

    struct Meta {
        string name; 
        uint[3] total;    // 총 배팅 금액 (승, 무, 패)
        uint[3] odds;     // 배당률 (승, 무, 패)
        uint256 endtime;
        uint8 result; 
    }
   
    constructor(address _bet, address _but, address _taxbank, address _butbank) {
        bet = Ibet(_bet);
        but = Ibut(_but);
        butbank = Ibutbank(_butbank);
        admin = msg.sender;
        staff[msg.sender] = 5;
        taxbank = _taxbank;  
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Caller is not admin");
        _;
    }

    modifier onlyStaff(uint level) {
        require(staff[msg.sender] >= level, "Insufficient staff level");
        _;
    }

    function staffup(address _staff, uint8 _level) public onlyAdmin {   
        staff[_staff] = _level;
    } 

    function newMeta(string memory _name, uint256 _endtime) public onlyStaff(5) {
        Meta storage meta = ms[pid];
        meta.name = _name;
        meta.endtime = _endtime;  
        meta.odds = [3, 3, 3]; 
        pid += 1;
    }

    function beting(uint _pid, uint _betmoney, uint8 _betcase) public {  
        require(_betcase < 3, "Invalid bet case");  // 승=0, 무=1, 패=2
        uint pay = _betmoney * 1e18;
        require(bets[msg.sender][_pid] == 0, "Already bet");
        require(butbank.getlevel(msg.sender) >= 1, "No member");
        require(ms[_pid].endtime >= block.timestamp, "Betting time ends");

        bet.approve(msg.sender, pay); 
        uint256 allowance = bet.allowance(msg.sender, address(this));
        require(allowance >= pay, "Check token allowance");
        bet.transferFrom(msg.sender, address(this), pay); 

        bets[msg.sender][_pid] = _betmoney;
        betcase[msg.sender][_pid] = _betcase;
        ms[_pid].total[_betcase] += pay;
        
    
        oddset(_pid);
        bid += 1;
    }

    function oddset(uint _pid) internal { 
        uint total = ms[_pid].total[0] + ms[_pid].total[1] + ms[_pid].total[2];
        for (uint8 i = 0; i < 3; i++) {
            ms[_pid].odds[i] = (ms[_pid].total[i] == 0) ? 3 : (total * 3 / ms[_pid].total[i]);
        }
    }

    function withdraw(uint _pid) public {
        require(bets[msg.sender][_pid] > 0, "No betting amount");
        require(ms[_pid].result != 0, "No match result");
        require(ms[_pid].result == betcase[msg.sender][_pid], "You lost");

        uint winAmount = getmybet(msg.sender, _pid);
        butbank.depoup(butbank.getmento(msg.sender), winAmount * 10 / 100);
    }

    function getCurrentTime() public view returns (uint) {
        return block.timestamp;
    }

    function getmybet(address user, uint _pid) public view returns (uint) {
        uint8 resultIndex = ms[_pid].result - 1;
        return ms[_pid].odds[resultIndex] * bets[user][_pid];
    }
    

function getOdds(uint _pid) public view returns (uint[3] memory) {
    return ms[_pid].odds;
}

function getTotal(uint _pid) public view returns (uint[3] memory) {
    return ms[_pid].total;
}


}