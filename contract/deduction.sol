// SPDX-License-Identifier: MIT  
//ver1.2
pragma solidity >=0.7.0 <0.9.0;

  
  interface Icya{
  function balanceOf(address account) external view returns (uint256);
  function allowance(address owner, address spender) external view returns (uint256);
  function transfer(address recipient, uint256 amount) external returns (bool);
  function approve(address spender, uint256 amount) external returns (bool);
  function transferFrom(address sender, address recipient, uint256 amount) external returns (bool); 
  }
  


    interface Icutbank{      // 컷뱅크
     function depoup(address _user, uint _depo) external;
    function depodown(address _user, uint _depo) external;
    function getprice() external view returns (uint256);
    function getlevel(address user) external view returns (uint);
    function g9(address user) external view returns (uint);  // 각 depo현황
    function getagent(address user) external view returns (address);
    function getmento(address user) external view returns (address);
    function expup(address _user,uint _exp) external;
  
  }  
    
 
contract deduction {    // 공제
  
  Icya cya;
  Icutbank cutbank;
  address public admin; 
  address public taxbank;
  uint256 public mid;  
  uint256 public exp; 
 
  uint8 public lot; //1lot당 보상비
 
  

  mapping(address => uint8)public staff;
  mapping(uint256 => meta)public metainfo;  

      
      
   constructor(address _cya, address _cutbank) {
    cya = Icya(_cya);
    cutbank = Icutbank(_cutbank);
    admin = msg.sender;
    staff[msg.sender] = 5;
    lot = 4;
}



    struct meta{
    uint256 time; //가입날짜 
    uint256 money; //보상처리결과
    uint256 mid;  
    uint256 metanum;  //가입계좌 번호
    uint256 init;  //최초가격
    address owner;  //가입자
    uint8 act;  // 0트레이딩중,1보상신청,2보상완료 3보상금액 찾아감
    }
   

    function staffup(address _staff,uint8 _level )public {   
    require(staff[msg.sender] >= 5,"no staff");
    staff[_staff] = _level;
} 




function accession(uint256 _init,uint256 _metanum)public {   //공제가입
    uint pay = _init*1e18*10/100; //보험료 10%   
    require(cya.balanceOf(msg.sender) >= pay,"no cya");    
    cya.approve(msg.sender, pay); 
    uint256 allowance = cya.allowance(msg.sender, address(this));
    require(allowance >= pay, "Check the token allowance");
    cya.transferFrom(msg.sender, address(this), pay);  
    address _mento =  cutbank.getmento(msg.sender);
    cutbank.depoup(_mento,pay*20/100);  //멘토 수당
    metainfo[mid].time = block.timestamp;
    metainfo[mid].mid = mid;
    metainfo[mid].metanum = _metanum;
    metainfo[mid].init = _init;
    metainfo[mid].owner = msg.sender;
    mid += 1;
} 


function exit(uint256 _mid)public {   //보상신청
    
    require( metainfo[_mid].owner == msg.sender,"no owner");   
    require( metainfo[_mid].act == 0,"Processing or Processing Completed");   
  
    metainfo[_mid].act = 1; //보상신청 상태
   
} 


function audit(uint256 _mid,uint256 _money)public {   //보상검증
    
    require(staff[msg.sender] >= 5,"no staff");   
   
    metainfo[_mid].money = _money*1e18; //보상신청 상태 
    metainfo[_mid].act = 2; //처리완료
} 

function reaudit(uint256 _mid,uint256 _money)public {   //보상수정
    
    require(staff[msg.sender] >= 5,"no staff");   
   
    metainfo[_mid].money = _money*1e18; //보상신청 상태 
    metainfo[_mid].act = 2; //처리완료
} 




function  withdraw(uint256 _mid)public {   //인출
    require( metainfo[_mid].owner == msg.sender,"no owner");   
    require( metainfo[_mid].act == 2,"Does not meet requirements");  
    metainfo[_mid].act = 3; //인출완료
    cya.transfer(msg.sender,metainfo[_mid].money);
} 
    
    function lotup(uint8 _lot) public {  //가격 
      require(staff[msg.sender] >= 5,"no staff");
      lot = _lot;
    }
    
  
 
  
 function g1() public view virtual returns(uint256){  
  return cya.balanceOf(address(this));
  }

  function g2(address user) public view virtual returns(uint256){  
  return cya.balanceOf(user);
  }
  


}




  
    