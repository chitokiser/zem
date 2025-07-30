// SPDX-License-Identifier: MIT  
//ver1.2
pragma solidity >=0.7.0 <0.9.0;

  
  interface Izem{
  function balanceOf(address account) external view returns (uint256);
  function allowance(address owner, address spender) external view returns (uint256);
  function transfer(address recipient, uint256 amount) external returns (bool);
  function approve(address spender, uint256 amount) external returns (bool);
  function transferFrom(address sender, address recipient, uint256 amount) external returns (bool); 
  }
  



    interface Izumbank{      
     function depoup(address _user, uint _depo) external;
    function depodown(address _user, uint _depo) external;
    function getprice() external view returns (uint256);
    function getlevel(address user) external view returns (uint);
    function g9(address user) external view returns (uint);  // 각 depo현황
    function getagent(address user) external view returns (address);
    function getmento(address user) external view returns (address);
    function expup(address _user,uint _exp) external;
  
  }  
    
 
contract Mt5_10{   //10000usd 1/10
  
  Izem zem;
  Izumbank zumbank;
  address public admin; 
  address public tbank; 
  uint256 public mid;  
  uint256 public fee; 
  uint256 public tax; 
 
  

  mapping(address => uint8)public staff;
  mapping(uint256 => meta)public metainfo;  

      
      
   constructor(address _zem, address _zumbank) {
    zem = Izem(_zem);
    zumbank = Izumbank(_zumbank);
    tbank = _zumbank;
    admin = msg.sender;
    staff[msg.sender] = 5;
    fee = 1000*1e18; //10000usd 1/10
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




function registration(uint256 _metanum,string memory  _invest)public {   //참여 데모계좌등록
    require(zem.balanceOf(msg.sender) >= fee,"no zem");    
    require(zumbank.getlevel(msg.sender) >= 2,"no member"); 
    zem.approve(msg.sender, fee); 
    uint256 allowance = zem.allowance(msg.sender, address(this));
    require(allowance >= fee, "Check the token allowance");
    zem.transferFrom(msg.sender, address(this), fee);  
    address _mento =  zumbank.getmento(msg.sender);
    zumbank.depoup(_mento,fee*10/100);  //멘토 수당
    zumbank.expup(msg.sender,fee*1/1E16);  //경험치
    tax += fee*1/100;
    metainfo[mid].time = block.timestamp;
    metainfo[mid].mid = mid;
    metainfo[mid].metanum = _metanum;
    metainfo[mid].init = 10000;
    metainfo[mid].invest = _invest;   //관람자 비번
    metainfo[mid].owner = msg.sender;
    mid += 1;
 
} 


function exit(uint256 _mid)public {   //보상신청
    
    require( metainfo[_mid].owner == msg.sender,"no owner");   
    require( metainfo[_mid].act == 0,"Processing or Processing Completed");   
  
    metainfo[_mid].act = 1; //보상신청 상태
   
} 

function exitcancell(uint256 _mid)public {   //보상신청 취소
    
    require( metainfo[_mid].owner == msg.sender,"no owner");   
    require( metainfo[_mid].act == 1,"Compensation application not in progress");   
  
    metainfo[_mid].act = 0; //보상신청 상태
   
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
    require(g1() >= pay,"no zum"); 
    address _mento =  zumbank.getmento(msg.sender);
    zumbank.depoup(_mento,pay* 3/100);  //멘토 수당
    metainfo[_mid].act = 3; //인출완료
    zem.transfer(msg.sender,pay* 97/100);
    taxtran();

} 

function  taxtran()public{
  zem.transfer(tbank,tax);
  tax = 0;
}
    
    function feeup(uint256 _fee) public {  //기본값 1000e18
      require(staff[msg.sender] >= 5,"no staff");
      fee = _fee*1e18;
    }
    
  
 
  
  function g1() public view virtual returns(uint256){  
  return zem.balanceOf(address(this));
  }

  function g2(address user) public view virtual returns(uint256){  
  return zem.balanceOf(user);
  }

}




  
    