

// SPDX-License-Identifier: MIT  
// ver1.0
pragma solidity >=0.7.0 <0.9.0;


interface Ibet {     
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





 //누적수당 기록
    contract Dicefootball {
      Ibet bet;
      Ibutbank butbank;
      address public admin;
      mapping (address => uint)public staff;
      event result(uint num1,uint num2);
     event reward(address indexed user, uint amount);
     event loss(address indexed user, uint amount);
       
  

     constructor(address _bet,address _butbank) public { 
      bet = Ibet(_bet);
      butbank = Ibutbank(_butbank);
      admin = msg.sender;
    
      }
 

  function staffup(address _staff,uint8 num)public {  
        require( admin == msg.sender,"no admin"); 
        staff[_staff] = num;
        }   



   function play(uint8 _winnum, uint _bet) public {  
    require(1 <= _winnum && _winnum <= 3, "Invalid choice");
    uint pay = _bet*1e18;
    require(g1() >= pay*6, "No BET in the contract");
    require(g2(msg.sender) >= pay*6, "not enough Bet");
 
    uint home = ran1();
    uint away = ran2();
    emit result(home, away);

    // 승리한 경우
    if ((home > away && _winnum == 1) || (home == away && _winnum == 2) || (home < away && _winnum == 3)) {
        uint winnings;
        if (_winnum == 1) {
            winnings = pay * (home - away);
        } else if (_winnum == 2) {
            winnings = pay * 550 / 100;
        } else {
            winnings = pay * (away - home);
        }
        bet.transfer(msg.sender, winnings);
        emit reward(winnings);
    } 
    // 패배한 경우
    else {
        uint _loss;
        if (_winnum == 1) {
            _loss = pay * (away - home);
        } else if (_winnum == 3) {
            _loss = pay * (home - away);
        } else {
            _loss = pay;
        }
        bet.approve(msg.sender,_loss); 
        uint256 allowance = bet.allowance(msg.sender, address(this));
        require(allowance >= _loss, "Check token allowance");
        bet.transferFrom(msg.sender, address(this),_loss); 
        emit loss(_loss);
    }
}
 

    
function g1() public view virtual returns(uint256) {  
    return bet.balanceOf(address(this));
}

function  g2(address user) public view returns(uint) { //cut 잔고 확인
  return bet.balanceOf(user);
  }  

  
  function ran1( ) internal returns(uint){
   return uint(keccak256(abi.encodePacked(block.timestamp,msg.sender))) % 6+1; 
   }

  function ran2( ) internal returns(uint){
   return uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, "ran2"))) % 6 + 1;
  }


  function deposit()external payable{
  }
 
}
  