// SPDX-License-Identifier: MIT  
// ver1.0
pragma solidity >=0.7.0 <0.9.0;


interface Ibet {     
  function balanceOf(address account) external view returns (uint256);
  function allowance(address owner, address spender) external view returns (uint256);
  function transfer(address recipient, uint256 happy) external returns (bool);
  function approve(address spender, uint256 happy) external returns (bool);
  function transferFrom(address sender, address recipient, uint256 happy) external returns (bool);
  }

  interface Ibutbank{      //벳뱅크
    function depoup(address _user,uint _depo)external;
    function getprice( ) external view returns (uint256);
    function getlevel(address user) external view returns(uint);
    function getmentolevel(address user) external view returns(uint);
    function getmento(address user) external view returns (address);

  }


 //누적수당 기록
    contract BetAlliance {
  
      Ibet bet;
      Ibutbank butbank;
      address public admin;  
       uint256 public tax;  //세금
      uint256 public jack;  //마일리지 
      uint256 public aid ; //가맹점 id
      uint256 public bonus ; //마일리지 보너스
      address public bank ; //bet을 bank에 보냄
      mapping (uint256 => alli) public allis; //가맹점들
      mapping (address => uint)public staff;
      event reward (uint amount);
    
     constructor(address _bet,address _butbank) public { 
    
      bet = Ibet(_bet);
      butbank = Ibutbank(_butbank);
      bank = _butbank;
      admin =msg.sender;
      staff[msg.sender] = 5;
     }
  
    struct alli {
    string  name; //가맹점 이름
    string  home; //홈페이지
    string  phone; //전화번호
    string  add; //매장 주소
     uint256 rate; //dc비율
    address owner; //가맹점 주인
    uint256 pay; //가맹점 인출가능 매출 인출할때 rate빼고 bet로 바로 이체됨
    uint256 totalpay; //가맹점토탈매출
    uint256 id;   //가맹점 id

    }
    
 
   //등록 대기
   function registration(string memory name,string memory home,string memory phone,string memory add,uint rate) public {  //스텝만 등록 가능
    require(butbank.getlevel(msg.sender) >=2,"Level 2 and above can be registered"); 
    require(1<=rate&&rate<=50,"Write it down well"); 
    allis[aid].name = name;
    allis[aid].home = home; //홈페이지
    allis[aid].phone = phone; //전화번호
    allis[aid].add = add; //매장 주소
    allis[aid].rate =rate;
    allis[aid].owner = msg.sender;
    allis[aid].id = aid;
    aid += 1;
}



   //편집
   function editing(uint id,string memory name,string memory home,string memory phone,string memory add,uint rate,address owner) public {  //멘토이상만 등록 가능
    require(staff[msg.sender] >=5,"no staff");  //스테프 여부
    require(allis[id].rate >=1,"does not exist"); 
     allis[aid].name = name;
    allis[aid].home = home; //홈페이지
    allis[aid].phone = phone; //홈페이지
    allis[aid].add = add; //매장 주소
    allis[aid].rate =rate;
    allis[aid].owner = owner;


}
 

   function jackup(uint _jack)public {    //bet bank
        require(staff[msg.sender] >= 5,"no staff"); 
        jack = _jack *1e18;
        }   



 function bankup(address _bank)public {    //bet bank
        require(staff[msg.sender] >= 5,"no staff"); 
        bank = _bank;
        }   



  function staffup(address _staff,uint8 num)public {  
        require( admin == msg.sender,"no admin"); 
        staff[_staff] = num;
        }   





function buy(uint id,uint _fee)public {   //가맹점 id bet결제
     uint fee = _fee * 1e18;
     require(getlevel(msg.sender) >= 1,"no member");
    require(g2(msg.sender) >= fee,"no bet");
    bet.approve(msg.sender,fee);
    uint256 allowance = bet.allowance(msg.sender, address(this));
    require(allowance >= fee, "Check the  allowance");
    bet.transferFrom(msg.sender, address(this),fee);
    
    allis[id].pay += fee; //가맹점에 매출 기록
    uint point1 = fee * allis[id].rate / 100;
    jack += point1 * 80/100; 
    tax += point1 * 20/100; 
    uint point = getjack(point1);
    butbank.depoup(msg.sender,point);
    jack -= point;
    emit reward(point);
    
  
}

function outpay(uint id )public {   //가맹점 매출 인출
    require(allis[id].owner == msg.sender,"no owner"); 
    uint fee = allis[id].pay * (100-allis[id].rate)/100;
    require(fee >= 1e18,"no pay"); 
    require(fee <= g1(),"bet is not enough"); 
     allis[id].pay = 0;
     allis[id].totalpay += fee;
     bet.transfer(msg.sender,fee);
     address mymento = butbank.getmento(msg.sender);
     butbank.depoup(mymento,fee*1/100);
     bal();
}


function bal()public  {   //잔고조절
     bet.transfer(bank,tax);
     tax = 0;
}


  


function g1() public view virtual returns(uint256) {  
    return bet.balanceOf(address(this));
}

function  g2(address user) public view returns(uint) { //BEt 잔고 확인
  return bet.balanceOf(user);
  }  

function  getjack(uint _pay) public view returns(uint) { //BEt 잔고 확인
  return jack * (_pay * ran1())/1e22;
  } 
   
      function  g9() public view returns(uint) {  //bet가격
  return butbank.getprice();
  }  
  function ran1( ) public view  returns(uint){
   return uint(keccak256(abi.encodePacked(block.timestamp,msg.sender))) % 1000; 
   }

  
 function  getlevel(address user) public view returns(uint) {  //but가격
  return butbank.getlevel(user);
  }  
  
  function deposit()external payable{
  }
 
}
  