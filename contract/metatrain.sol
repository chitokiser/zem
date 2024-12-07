// SPDX-License-Identifier: MIT  
// ver1.2
pragma solidity >=0.7.0 <0.9.0;

interface Imut {      
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function g1() external view returns(uint256);
    function getdepot(address user) external view returns(uint256);
}

interface Imutbank {      // 멋뱅크
    function depoup(address _user, uint _depo) external;
    function depodown(address _user, uint _depo) external;
    function getprice() external view returns (uint256);
    function getlevel(address user) external view returns (uint);
    function g9(address user) external view returns (uint);  // 각 depo현황
    function getagent(address user) external view returns (address);
    function getmento(address user) external view returns (address);
    function expup(address _user, uint _exp) external;
}

contract Metatree{  // 멧큐   mut을 담보로 하여 이자율이 변동되는 디파이
    Imut mut;
    Imutbank mutbank;
    address public taxbank;
    address public admin;
    uint256 public tax; // 수익 
    uint256 public tax2; // 지출
    uint256 public price; // 가격
    uint256 public rate; // 
    mapping(address => input) public myinput; // 입금
    mapping (address => uint) public staff;

  
    constructor(address _mut, address _mutb) { 
        mut = Imut(_mut);
        mutbank = Imutbank(_mutb);
        taxbank = _mutb;
        admin = msg.sender;
        tax2 = 2000;
        rate = 200 ;
        price = 2000;
    }
    
    struct input{
 
        uint256 depo;   // 출금가능mut
        uint256 depot;  // 입금해야 할 시간
        uint256 tiket;  //  입금횟수
        bool complete;  //입금완료
    }

   

  function initing() public {  // 유동성 제공
    require(g2(msg.sender) >= price, "not enough mut"); 
    require(myinput[msg.sender].depo == 0, "already deposit"); 
    require(g6(msg.sender) != address(0), "no member"); 
    
    mut.approve(msg.sender,price);
    uint256 allowance = mut.allowance(msg.sender, address(this));
    require(allowance >= price, "Check the allowance");
    mut.transferFrom(msg.sender, address(this),price); 
    uint pay = price * g7() *5/100;
    mutbank.depoup(g6(msg.sender), pay);
    tax += price;
    uint myprice = price * rate / 100;   
    myinput[msg.sender].depo = myprice;  //1회 인출금액
    myinput[msg.sender].tiket += 1;
    myinput[msg.sender].depot = block.timestamp;
   
}


  function inputing() public {  // 유동성 제공
    require(g2(msg.sender) >= price, "not enough mut");  
    require(myinput[msg.sender].depot + 7 days <= block.timestamp , "not time yet"); 
    require(myinput[msg.sender].depot + 8 days >= block.timestamp , "time out"); 
    require(myinput[msg.sender].complete == false , "Unable to deposit"); 
    uint pay = price * g7() *5/100;
    mut.approve(msg.sender,price);
    uint256 allowance = mut.allowance(msg.sender, address(this));
    require(allowance >= price, "Check the allowance");
    mut.transferFrom(msg.sender, address(this),price); 
    mutbank.depoup(g6(msg.sender), pay);
     rateup();
    tax += price;
    uint myprice = price * rate / 100;  
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
    require(g3() >= pay, "not enough mut");  
    require(myinput[msg.sender].depot + 7 days <= block.timestamp , "not time yet"); 
    require(myinput[msg.sender].tiket  >= 1 , "not enough tiket"); 
    mut.transfer(msg.sender,pay);
    tax2 += pay; 
    myinput[msg.sender].tiket -= 1;
    myinput[msg.sender].depot = block.timestamp;
    rateup();
    if(myinput[msg.sender].tiket == 0){
    myinput[msg.sender].complete = false;   
    }
    }




     function clear() public {  // 유동성 제공
    
    require(myinput[msg.sender].depo >= 1, "No need to clear");  
    
    myinput[msg.sender].depo = 0;  //1회 인출금액
    myinput[msg.sender].depot = 0;
    myinput[msg.sender].tiket = 0;
    myinput[msg.sender].complete = false; 
}

   function rateup() public { // 대출 이자 보조 지표
    rate = (tax/tax2)+120;
   }

     function priceup(uint num) public { // 대출 이자 보조 지표
        require(staff[msg.sender] >=5, "no staff"); 
    price = num;
   }


    function staffup(address _staff, uint8 num) public {  
        require(admin == msg.sender, "no admin"); 
        staff[_staff] = num;
    }   

  
       function g2(address user) public view returns(uint) { 
        return mut.balanceOf(user) ;
    }  

    function g3() public view returns(uint) { 
        return mut.balanceOf(address(this)) ;
    }  

    function g4() public view returns(uint) { // 계약이 가지고 있는 mut 시가총액
        return g3() * g7();
    }

    function g5(address user) public view returns(uint) { // 나의 mut 시가총액
        return g8(user) * g7();
    }

    function g6(address user) public view returns (address)
{  //멘토 가져오기
        return mutbank.getmento(user);
    }

    function g7() public view returns(uint) { // mut 시세
        return mutbank.getprice();
    }

    function g8(address user) public view returns(uint) { // mut 보유 현황
        return mut.balanceOf(user);
    }
  
    function g9(address user) public view returns(uint) { // 포인트 보유 현황
        return mutbank.g9(user);
    }

 function g10() public view returns(uint) { // 인출가능비율
        return  100*rate/100;
    }
   


function g12(address user) public view returns(uint) { // 레벨가져오기
        return  mutbank.getlevel(user);
    }
}
