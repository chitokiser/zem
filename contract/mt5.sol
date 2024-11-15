// SPDX-License-Identifier: MIT  
//ver1.2
pragma solidity >=0.7.0 <0.9.0;

  
  interface Ibet{
  function balanceOf(address account) external view returns (uint256);
  function allowance(address owner, address spender) external view returns (uint256);
  function transfer(address recipient, uint256 amount) external returns (bool);
  function approve(address spender, uint256 amount) external returns (bool);
  function transferFrom(address sender, address recipient, uint256 amount) external returns (bool); 
  }
  



    interface Ibutbank{      // 컷뱅크
     function depoup(address _user, uint _depo) external;
    function depodown(address _user, uint _depo) external;
    function getprice() external view returns (uint256);
    function getlevel(address user) external view returns (uint);
    function g9(address user) external view returns (uint);  // 각 depo현황
    function getagent(address user) external view returns (address);
    function getmento(address user) external view returns (address);
    function expup(address _user,uint _exp) external;
  
  }  
    
 
contract mt5 {   
  
  Ibet bet;
  Ibutbank butbank;
  address public admin; 
  address public cbank; 
  uint256 public mid;  
  uint256 public fee; 
 
  

  mapping(address => uint8)public staff;
  mapping(uint256 => meta)public metainfo;  

      
      
   constructor(address _bet, address _butbank) {
    bet = Ibet(_bet);
    butbank = Ibutbank(_butbank);
    cbank = _butbank;
    admin = msg.sender;
    staff[msg.sender] = 5;
    fee = 100*1e18; //100bet
}



    struct meta{
    uint256 time; 
    uint256 reward; 
    uint256 mid;  
    string invest; // 관람자비번
    uint256 metanum;  //가입계좌 번호
    uint256 init;  //최초가격
    address owner;  //가입자
    uint8 act;  // 0트레이딩중,1보상신청,2보상완료 3보상금액 찾아감
    }
   

    function staffup(address _staff,uint8 _level )public {   
    require(staff[msg.sender] >= 5,"no staff");
    staff[_staff] = _level;
    } 




function registration(uint256 _metanum,string memory  _invest)public {   //랠리 참여 데모계좌등록
    require(bet.balanceOf(msg.sender) >= fee,"no bet");    
    require(butbank.getlevel(msg.sender) >= 2,"no member"); 
    bet.approve(msg.sender, fee); 
    uint256 allowance = bet.allowance(msg.sender, address(this));
    require(allowance >= fee, "Check the token allowance");
    bet.transferFrom(msg.sender, address(this), fee);  
    address _mento =  butbank.getmento(msg.sender);
    butbank.depoup(_mento,fee*20/100);  //멘토 수당
    metainfo[mid].time = block.timestamp;
    metainfo[mid].mid = mid;
    metainfo[mid].metanum = _metanum;
    metainfo[mid].init = 5000;
    metainfo[mid].invest = _invest;   //관람자 비번
    metainfo[mid].owner = msg.sender;
    mid += 1;
 
} 


function exit(uint256 _mid)public {   //보상신청
    
    require( metainfo[_mid].owner == msg.sender,"no owner");   
    require( metainfo[_mid].act == 0,"Processing or Processing Completed");   
  
    metainfo[_mid].act = 1; //보상신청 상태
   
} 


function audit(uint256 _mid,uint256 _reward)public {   //보상검증
    
    require(staff[msg.sender] >= 5,"no staff");   
   
    metainfo[_mid].reward = _reward*1e18;
    metainfo[_mid].act = 2; //처리완료

} 



function  withdrw(uint256 _mid)public {   //인출
    uint pay = metainfo[_mid].reward;
    require( metainfo[_mid].owner == msg.sender,"no owner");   
    require( metainfo[_mid].act == 2,"Processing");  
    require(g1() >= pay,"no but"); 

    metainfo[_mid].act = 3; //인출완료
    bet.transfer(msg.sender,pay);
} 
    
    function feeup(uint8 _fee) public {  //기본값 30e18
      require(staff[msg.sender] >= 5,"no staff");
      fee = _fee*1e18;
    }
    
  
 
  
  function g1() public view virtual returns(uint256){  
  return bet.balanceOf(address(this));
  }

  function g2(address user) public view virtual returns(uint256){  
  return bet.balanceOf(user);
  }

}




  
    