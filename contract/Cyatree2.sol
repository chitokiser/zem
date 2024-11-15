

// SPDX-License-Identifier: MIT  
// ver1.0
pragma solidity >=0.7.0 <0.9.0;


interface Icya {     
  function balanceOf(address account) external view returns (uint256);
  function allowance(address owner, address spender) external view returns (uint256);
  function transfer(address recipient, uint256 happy) external returns (bool);
  function approve(address spender, uint256 happy) external returns (bool);
  function transferFrom(address sender, address recipient, uint256 happy) external returns (bool);
  }


interface Icut {     
  function balanceOf(address account) external view returns (uint256);
  function allowance(address owner, address spender) external view returns (uint256);
  function transfer(address recipient, uint256 happy) external returns (bool);
  function approve(address spender, uint256 happy) external returns (bool);
  function transferFrom(address sender, address recipient, uint256 happy) external returns (bool);
  }



  interface Icyab {     
  function getprice() external view returns (uint256);
  }
 //누적수당 기록
    contract cyatree2 {
  
      Icya cya;
      Icut cut;
      Icyab cyab;  // cya 뱅크 인스턴스
      uint256 public tax; // bank에 세금 이체
      uint256 public totaltax; // 토탈 세금
      address public bank; // cyabank
      address admin;
      uint256 public sum;  
      uint256 public happy; 
      uint256 public fee;  //참가비
      uint256 public fixfee;  //추천수당 
      uint256 public numwc;  //인출가능횟수 기본값 10
      mapping (address => my)public myinfo;
      
   
     constructor(address _cya,address _cut,address _cyab) public { 
    
      happy = 10e18; //1개당 수당 액수 기본값$10
      fee = 150e18;  //가입시 지불 CYA개수 기본값 $150
      fixfee = 50e18;  //추천수당
      numwc = 10; //인출가능 횟수
      cya = Icya(_cya);
       cut = Icut(_cut);
         cyab = Icyab(_cyab); //cyabank
         bank = _cyab;
      admin =msg.sender;
      myinfo[msg.sender].dep = 2;
      myinfo[msg.sender].mynum = 2;
      myinfo[msg.sender].push = 1;
      
      }

    struct my {
    uint256 depo; //인출가능한 수당액
    uint256 totaldepo; //누적 수당
    uint256 dep;  //깊이
    uint256 mynum;
    uint256 asum; //   sum -(asum + mynum) >=dep
    uint8 wc;   //withdraw limit
    uint push;   //추천수당
    uint pushpay;   //누적 추천 수당
    }

function memberjoin(address _mento)public {   
    require(myinfo[msg.sender].dep == 0,"already member"); 
    require(myinfo[_mento].push >= 1,"no mento"); 
      require(g3() >= g4(),"no cut");  //cut 잔고여부확인
    require (cya.balanceOf(msg.sender)>=fee,"no cya");
        cya.approve(msg.sender,fee);
        uint256 allowance = cya.allowance(msg.sender, address(this));
    require(allowance >= fee, "Check the token allowance");
        cya.transferFrom(msg.sender, address(this), fee);
        cut.transfer(msg.sender,g4());   //cut을 g4()만큼 이체 
      tax += fee*5/100;
      myinfo[msg.sender].dep = 2;
      myinfo[msg.sender].push = 1;
      myinfo[_mento].push += fixfee; //추천수당 기본값 $50
      myinfo[msg.sender].mynum = 2;
      myinfo[msg.sender].asum = sum;
      sum += 1; //전체 참여자 수

}


function check() public {  //개인 정보 업데이트
    my storage tmy = myinfo[msg.sender]; 
    require(tmy.dep >=1 ,"no member");
    require(sum - (tmy.asum +tmy.mynum) >= tmy.dep,"little member");
    require(tmy.wc < numwc,"over withdraw");  //기본값 10회 인출 가능
    tmy.wc += 1;
    tmy.depo += happy*tmy.dep;
    tmy.mynum = (tmy.mynum)*2;
    uint pay = tmy.dep*2;
    tmy.dep = pay;
    tmy.asum = pay +sum;
}
   
  function withdraw( )public {   
   uint256 pay = myinfo[msg.sender].depo;
   require(pay > 0,"No allowance"); //받을 수당이 있는지?
   require(g1() >= pay,"no cya");
   myinfo[msg.sender].totaldepo += myinfo[msg.sender].depo; //수당누적
   myinfo[msg.sender].depo = 0; 
   cya.transfer(msg.sender,pay);
    cya.transfer(bank,tax); //뱅크에 세금 입금 누적세금 기록
    totaltax += tax;
    tax = 0;
  }

    function expush( )public {   //추천수당 받기 
   require(myinfo[msg.sender].push >= fixfee,"No allowance"); //받을 수당이 있는지?
   uint256 pay = myinfo[msg.sender].push;
   myinfo[msg.sender].push = 1;
   myinfo[msg.sender].depo += pay;
   myinfo[msg.sender].pushpay += pay;  
  
  }
  

     
  function happyup(uint _happy) public {  //수당 
   require(admin == msg.sender,"no admin");
      happy = _happy*1e18;  
   } 

       
  function bankup(address _bank) public {
   require(admin == msg.sender,"no admin");
      bank = _bank;  
   } 
    
  function feeup(uint _fee) public {//참여 금액 
   require(admin == msg.sender,"no admin");
      fee = _fee;  
   }  

       
  function fixpayup(uint _push) public {//추천수당
   require(admin == msg.sender,"no admin");
      fixfee = _push *1e18;  
   }  

     function numwcup(uint _numwc) public {//인출가능횟수
   require(admin == msg.sender,"no admin");
    numwc = _numwc;  
   }  

 function g1() public view virtual returns(uint256){  
  return cya.balanceOf(address(this));
  }
  
 function g2(address user) public view returns( uint256 depo,uint256 totaldepo,uint256 dep,uint256 mynum,uint256 asum,uint8 wc,uint push,uint256 pushpay){  
   my storage tmy=myinfo[user];
  return ( tmy.depo,
          tmy.totaldepo,
           tmy.dep,
           tmy.mynum,
           tmy.asum,
           tmy.wc,
           tmy.push,
           tmy.pushpay);
  }    

  
 function  g3() public view returns(uint) { //cut 잔고 확인
  return cut.balanceOf(address(this));
  }  
    function  g4() public view returns(uint) { //가격을 가져온 후 $150에 해당하는 cut수량 출력
  return fee/cyab.getprice();
  }  

  function  g5(address user) public view returns(uint) {  //세금 확인
  return tax;
  }  

    function  g6(address user) public view returns(uint) {  //cut 잔고 확인
  return cut.balanceOf(address(this));
  }  

 function getsum( ) public view returns(uint) {
  return sum;
    }

    function thistimepoint( ) public view returns(uint) { 
      my memory tmy = myinfo[msg.sender]; 
  return happy*tmy.dep;
    }
  function deposit()external payable{
  }
 

}
  