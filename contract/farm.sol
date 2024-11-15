// SPDX-License-Identifier: MIT  
//ver1.2
pragma solidity >=0.7.0 <0.9.0;

 

  interface Ibet {     
  function balanceOf(address account) external view returns (uint256);
  function allowance(address owner, address spender) external view returns (uint256);
  function transfer(address recipient, uint256 amount) external returns (bool);
  function approve(address spender, uint256 amount) external returns (bool);
  function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}


    interface Ibutbank{      
     function depoup(address _user, uint _depo) external;
    function depodown(address _user, uint _depo) external;
    function getprice() external view returns (uint256);
    function getlevel(address user) external view returns (uint);
    function g9(address user) external view returns (uint);  // 각 depo현황
    function getmento(address user) external view returns (address);
    function expup(address _user,uint _exp) external;
  
  }  


    
 contract farm {
      

      Ibutbank butbank;
      Ibet bet;
  
      address public admin;
      uint256 public price; //농장가격 
      uint8 public remain; //나머지 설정 1~remain
      uint256 public rate; //수수료
      mapping(uint => tree) public port;   //fixnum  
      uint256 [] public pl; // fix 저장 배열 turn생성
      mapping(address => uint)public myfee; //나의 누적수수료
      mapping(address => uint)public mypay; //나의 충전금
       mapping(address => uint)public mytiket; //나의 티켓 원하는 번호로 들어 갈 수 있음
      event farmnum(uint winnum); 

    constructor(address _butbank,address _bet) { 
      butbank =Ibutbank(_butbank);
      bet =Ibet(_bet);
      admin = msg.sender;
      remain = 100;
      price = 10*1e18;
      mytiket[msg.sender] = 100;
      rate = 1e18; // 초기값 1회 0.1bet

    }
    
    struct tree{
    uint256 depo; 
    uint256 depon; //portid
    uint256 portn;    //ramain값 받음
    address owner;
    }

function seeding() public {
    uint winnum = ranmod(); // 랜덤 숫자 받기
    emit farmnum(winnum);
    require(mypay[msg.sender] >= price, "not enough seed");
    mypay[msg.sender] -= price;
    myfee[msg.sender] += rate;
    mytiket[msg.sender] += 1;
    pl.push(winnum);
        uint jack = port[winnum].depo * getbonus(winnum) /100;
        mypay[port[winnum].owner] += jack;
    
    port[winnum].depo = price;
    port[winnum].depon = pllength();
    port[winnum].portn = winnum;
    port[winnum].owner = msg.sender;  
   
}


function choice(uint8 winnum) public {
    require(mytiket[msg.sender] >= 10, "not enough tickets");
    require(winnum <= remain ,"Out of range");
    mypay[msg.sender] -= price;
    myfee[msg.sender] += rate;
    mytiket[msg.sender] -= 10;
    pl.push(winnum);
        uint jack = port[winnum].depo * getbonus(winnum) /100;
        mypay[port[winnum].owner] += jack;
    
    port[winnum].depo = price;
    port[winnum].depon = pllength();
    port[winnum].portn = winnum;
    port[winnum].owner = msg.sender;  
   
}





 function remainup(uint8 _remain)public  {   //myport에서 가져온 portid
   require(admin ==  msg.sender,"no admin");
   remain = _remain;
  }

   function priceup(uint256 _price)public  {   //농장 가격 업그레이드
   require(admin ==  msg.sender,"no admin");
   price = _price*1e18;
   rate  = _price*1e16;
  }


   function rateup(uint256 _rate)public  {   //수수료업그레이드
   require(admin ==  msg.sender,"no admin");
  
   rate  = _rate*1e16;
  }


 function charge(uint256 _mypay)public  {   //myport에서 가져온 portid
   uint pay = _mypay *1e18;
   require(pay <=  bet.balanceOf(msg.sender),"no bet");
   require(butbank.getlevel(msg.sender) >= 1, "no member"); 
   bet.approve(msg.sender, pay); 
    uint256 allowance = bet.allowance(msg.sender, address(this));
    require(allowance >= pay, "Check the token allowance");
    bet.transferFrom(msg.sender, address(this), pay);  
   mypay[msg.sender] += pay; 

  }


  function withdraw( )public  {   //수수료를 제외한 금액 이체
   uint pay = getpay(msg.sender);
   address mymento = butbank.getmento(msg.sender);
   require(pay >= 1e18,"no pay");
   require(g1() >= pay,"no bet");
   bet.transfer(msg.sender,pay); 
   butbank.depoup(mymento,mentopay(msg.sender)); //수수료 멘토에게 20% 수당
   mypay[msg.sender] = 0;
   myfee[msg.sender] = 0;
  }


 function ranmod() internal view returns(uint256) {
    uint256 winnum = uint256(keccak256(abi.encodePacked(block.timestamp, blockhash(block.number - 1)))) % remain + 1;
    return winnum;
    }  

 function getbonus(uint _win) public view returns(uint) { //보너스계산 
  return  pllength() - port[_win].depon + 100; 
  }



  
   function pllength() public view returns(uint) { //누적 거래수 
  return pl.length;
  }
   function getpl(uint num) public view returns(uint) {
  return pl[num]; //portid입렵 화분 넘버 출력
  }
 
    function getpay(address user) public view returns(uint) {
  return  mypay[user] - myfee[user] ;
  }
   
     function mentopay(address user) public view returns(uint) {
  return  myfee[user]* 20/100 ;
  }

 
  function getvalue(uint num) public view returns(uint) { //현재 가치   
  return price* (pllength() - port[num].depon + 100)/100 ;
  }  



   function getmyfarm(uint num) public view returns(uint) { //내가 가지고 있는 농장개수
  require(port[num].owner == msg.sender);
  return port[num].portn;   //내 농장 번호를  DOM에 저장
  } 

  function g1() public view virtual returns(uint256) {  
    return bet.balanceOf(address(this));
  }
  

}  

