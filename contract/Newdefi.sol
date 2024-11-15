// SPDX-License-Identifier: MIT  
//ver1.2
pragma solidity >=0.7.0 <0.9.0;


interface Icya {     
  function balanceOf(address account) external view returns (uint256);
  function allowance(address owner, address spender) external view returns (uint256);
  function transfer(address recipient, uint256 amount) external returns (bool);
  function approve(address spender, uint256 amount) external returns (bool);
  function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
  }

  
  interface Icyatree2 {    
  function g1() external view virtual returns(uint256);   //cya 잔고 확인
  function  g3() external view returns(uint);  //cut 잔고 확인
  }


  interface Icyab {     
  function getprice() external view returns (uint256);
  }
contract Newdefi  {   //여기에 C 입금
  Icya cya;
  Icyab cyab;
  Icyatree2 cyatree2; 
      uint256 public rate; //할인율
      address public ct2; //cyamoneytree에 직접 cya 이체
      uint256 public fee; //보상기준
      uint256 public tax; //누적세금
      uint256 public time; //보상까지 기준
      address public admin;
     mapping(address => my) public myinfo; //개별정보

     constructor(address _cya,address _cyab,address _cyatree2) public {
      rate = 1;
      cya=Icya(_cya);
      cyab=Icyab(_cyab);
      cyatree2=Icyatree2(_cyatree2);  
      ct2=_cyatree2;  
      admin=msg.sender;
      fee = 100; 
      }

  struct my{  
    uint256 depo; //예치금액
    uint256 depot; //예치시간
    uint256 fix; //월확정이자
    }
    

     function input(uint _pay)public{  //유동성 제공 금액
    require( myinfo[msg.sender].depo == 0,"Deposit already exists");
    require(g7(msg.sender) >= _pay,"cya little" );  
    require(g6()/10 >= _pay,"too many" );   //계약 잔고의 10% 이내 입금가능
    cya.approve(msg.sender, _pay);
        uint256 allowance = cya.allowance(msg.sender, address(this));
        require(allowance >= _pay, "Check the token allowance");
        cya.transferFrom(msg.sender, address(this), _pay);
        myinfo[msg.sender].depo = _pay;
        myinfo[msg.sender].depot = block.timestamp;
        myinfo[msg.sender].fix = rate; 
    rateup();  
    cya.transfer(ct2,_pay/4);
    tax += _pay/4;
}

function  rateup()public {
 
   rate = (g3()*g4()/g1());  // cyatree2 cut시가총액 나누기 계약잔고

}

function  feeup(uint _fee)public {
   require( admin == msg.sender ,"no admin");
   fee = _fee;  // 시가총액 발란싱

}
function  timeup(uint _time)public {
   require( admin == msg.sender ,"no admin");
   time = _time;  // 초단위 입력

}



function withdraw()public returns(bool){   //예치금 인출
    require(myinfo[msg.sender].depo>=1,"no deposit");  
    require(myinfo[msg.sender].depot + time   <  block.timestamp,"not time"); //월1회
    uint256 pay = get12(msg.sender);  
     myinfo[msg.sender].depo = 0;
     myinfo[msg.sender].depot = 0;
     myinfo[msg.sender].fix = 0;
     cya.transfer(msg.sender,pay);
     return true;
}

  function g1() public view virtual returns(uint256){  //Cyatree CYA 계약잔고
  return cyatree2.g1();   
  }
  
  function g3() public view returns(uint256){  //Cyatree2 CUT 계약잔고
  return cyatree2.g3() ;
  }


  function g4() public view returns(uint256){  //CUT 가격가져오기
  return cyab.getprice() ;
  }
 function g6() public view virtual returns(uint256){  
  return cya.balanceOf(address(this));
  }
  function g7(address user) public view virtual returns(uint256){  
  return cya.balanceOf(user);
  }
 

     function get11() public view returns (uint256){  //할인율 계산
      return rate; 
  }
  
       function get12(address user) public view returns (uint256){  //인출금액 확인
      return myinfo[user].depo* (fee+myinfo[user].fix)/fee ; 
  }
      function get13(address user) public view returns (uint256){  //만기시간 확인
      return myinfo[user].depot; 
  }
     function get14(address user) public view returns (uint256){  //예치금 확인
      return myinfo[user].depo; 
  }
     function get15(address user) public view returns (uint256){  //확정이자 확인
      return myinfo[user].fix; 
  }
  
      function get17() public view returns (uint256){  //년 정산횟수
      return 31104000/time ; 
  }
        function get18() public view returns (uint256){  //APR 년수익률
      return (get17() * rate)  ;  //100자리는 소수점
  }
  
    } 