// SPDX-License-Identifier: MIT  
// ver1.2
pragma solidity >=0.7.0 <0.9.0;

interface Ibut {      
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function g1() external view returns(uint256);
    function getdepot(address user) external view returns(uint256);
}

interface Ibutbank {      // 벗뱅크
    function depoup(address _user, uint _depo) external;
    function depodown(address _user, uint _depo) external;
    function getprice() external view returns (uint256);
    function getlevel(address user) external view returns (uint);
    function g9(address user) external view returns (uint);  // 각 depo현황
    function getagent(address user) external view returns (address);
    function getmento(address user) external view returns (address);
    function expup(address _user, uint _exp) external;
}

contract Metatrain2{  // 메타트레인2     포인트를 직접  매일넣고 이자를 받는 디파이
    Ibut but;
    Ibutbank butbank;
    address public taxbank;
    address public admin;
    uint256 public tax; // 수익 
    uint256 public tax2; // 지출
    uint256 public price; // 가격
    uint256 public rate; // 
    mapping(address => input) public myinput; // 입금
    mapping (address => uint) public staff;

  
    constructor(address _but, address _butb) { 
        but = Ibut(_but);
        butbank = Ibutbank(_butb);
        taxbank = _butb;
        admin = msg.sender;
        tax2 = 2e19;
        rate = 120 ; //이자율
        price = 2e19;  //10달러
    }
    
    struct input{
 
        uint256 depo;   // 출금가능 포인트
        uint256 seed;   // 최초원금
        uint256 depot;  // 입금해야 할 시간
        uint256 tiket;  //  입금횟수
        bool complete;  //입금완료
    }

    function loan(uint _but) public {  // 담보대출
    require(butbank.getlevel(msg.sender) >= 6, "Level 6 or higher");  //레벨6이상 인가?
    require(g2(msg.sender) >= _but, "but this is not enough"); //담보but을 보유하고 있는가?
    uint loanAmount = 
    require(g1() != address(0), "not enough bet in the contract");   //계약에 대출해줄 잔고가 있는가?
    
    butbank.depodown(msg.sender, price);
    tax += price;
    uint myprice = price * rate / 100; 
    myinput[msg.sender].seed = price;  //1회 인출금액  
    myinput[msg.sender].depo = myprice;  //1회 인출금액
    myinput[msg.sender].tiket += 1;
    myinput[msg.sender].depot = block.timestamp;
   

  function initing() public {  // 유동성 제공
    require(g9(msg.sender) >= price, "not enough point"); 
    require(myinput[msg.sender].depo == 0, "already deposit"); 
    require(g6(msg.sender) != address(0), "no member"); 
    
    butbank.depodown(msg.sender, price);
    tax += price;
    uint myprice = price * rate / 100; 
    myinput[msg.sender].seed = price;  //1회 인출금액  
    myinput[msg.sender].depo = myprice;  //1회 인출금액
    myinput[msg.sender].tiket += 1;
    myinput[msg.sender].depot = block.timestamp;
   
}


  function inputing() public {  // 유동성 제공
    uint pay = myinput[msg.sender].seed;
    require(g9(msg.sender) >= pay, "not enough point");  
    require(myinput[msg.sender].depot + 1 days<= block.timestamp , "not time yet"); 
    require(myinput[msg.sender].depot + 2 days >= block.timestamp , "time out"); 
    require(myinput[msg.sender].complete == false , "Unable to deposit"); 
    
    butbank.depodown(msg.sender, pay);  //자신의포인트 차감
    rateup();
    tax += pay;
    myinput[msg.sender].tiket += 1;
    myinput[msg.sender].depot = block.timestamp;
    if(myinput[msg.sender].tiket > 9){
    myinput[msg.sender].complete = true;   
    }else{
    myinput[msg.sender].complete = false;   
    }
}


    function withdraw() public {  // 유동성 제공한 금액 인출
    uint pay = myinput[msg.sender].depo;
    require(myinput[msg.sender].complete == true, "Mission not completed");  
    require(g9(msg.sender) >= price, "not enough point");  
    require(myinput[msg.sender].depot + 1 days <= block.timestamp , "not time yet"); 
    require(myinput[msg.sender].tiket  >= 1 , "not enough tiket"); 
    butbank.depoup(msg.sender, pay);
    tax2 += pay; 
    myinput[msg.sender].tiket -= 1;
    myinput[msg.sender].depot = block.timestamp;
    rateup();
    if(myinput[msg.sender].tiket == 0){
    myinput[msg.sender].complete = false;   
    }
    }




   function clear() public {  // 리셋
    
    require(myinput[msg.sender].depo >= 1, "No need to clear");  
    
    myinput[msg.sender].depo = 0;  //1회 인출금액
     myinput[msg.sender].seed = 0;  
    myinput[msg.sender].depot = 0;
    myinput[msg.sender].tiket = 0;
    myinput[msg.sender].complete = false; 
}

   function rateup() public { // 대출 이자 보조 지표
    rate = (tax/tax2)+100;
   }

     function priceup(uint num) public { // 대출 이자 보조 지표
        require(staff[msg.sender] >=3, "no staff"); 
    price = num;
   }


    function staffup(address _staff, uint8 num) public {  
        require(admin == msg.sender, "no admin"); 
        staff[_staff] = num;
    }   

     function g1() public view returns(uint) { 
        return bet.balanceOf(address(this)) ;
    }  


       function g2(address user) public view returns(uint) { 
        return but.balanceOf(user) ;
    }  

    function g3() public view returns(uint) { 
        return but.balanceOf(address(this)) ;
    }  

    function g4() public view returns(uint) { // 계약이 가지고 있는 but 시가총액
        return g3() * g7();
    }

    function g5(address user) public view returns(uint) { // 나의 but 시가총액
        return g8(user) * g7();
    }

    function g6(address user) public view returns (address)
{  //멘토 가져오기
        return butbank.getmento(user);
    }

    function g7() public view returns(uint) { // but 시세
        return butbank.getprice();
    }

    function g8(address user) public view returns(uint) { // but 보유 현황
        return but.balanceOf(user);
    }
  
    function g9(address user) public view returns(uint) { // 포인트 보유 현황
        return butbank.g9(user);
    }

 function g10() public view returns(uint) { // 인출가능비율
        return  100*rate/100;
    }
   


function g12(address user) public view returns(uint) { // 대출이자 보조지표
        return  butbank.getlevel(user);
    }


    function getloanAble(uint _but) public view returns(uint) { // 담보제공한 but의 시세
        return  _but*g7() * 100/rate;
    }
}
