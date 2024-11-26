// SPDX-License-Identifier: MIT  
// ver1.2
pragma solidity >=0.7.0 <0.9.0;



interface Ibet {      
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function g1() external view returns(uint256);
    function getdepot(address user) external view returns(uint256);
}

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

contract Betswap{  
    Ibut but;
    Ibet bet;
    Ibutbank butbank;
    address public taxbank;
    address public admin;
    uint256 public tax; 
    uint256 public rate; 
    mapping(address => loan) public myloan; //나의 대출
    mapping(address => depo) public mydepo; //나의 유동성제공
    mapping (address => uint) public staff;

  
    constructor(address _but,address _bet, address _butb) { 
        but = Ibut(_but);
        bet = Ibet(_bet);
        butbank = Ibutbank(_butb);
        taxbank = _butb;
        admin = msg.sender;
        rate = 136 ; //이자율
    }
    
    struct loan{
        uint256 principal;   // 갚아야 할 원금
        uint256 loanA;   // 대출금액
        uint256 mortgage;   // but담보
        uint256 loant;  // 대출시작 시간
    }
    
     struct depo{

        uint256 depoA;   // 유동성제공 원금
        uint256 asset;   // bet으로 뺄 수 있는 자금
        uint256 depot;  // 유동성제공 시간
        uint8 tiket;  // 인출가능 티켓
    }



    function loaning(uint _but) public {  // 담보대출
    require(butbank.getlevel(msg.sender) >= 6, "Level 6 or higher");  //레벨6이상 인가?
    require(g2(msg.sender) >= _but, "but this is not enough"); //담보but을 보유하고 있는가?
    uint loanAmount = getloanAble(_but);
    require(g1() >= loanAmount, "not enough bet in the contract");   //계약에 대출해줄 잔고가 있는가?
    myloan[msg.sender].principal = _but * g7();  //갚을돈
    myloan[msg.sender].loanA = loanAmount;  //대출금액
    myloan[msg.sender].mortgage = _but;  //담보갯수
    myloan[msg.sender].loant = block.timestamp;
    bet.transfer(msg.sender,loanAmount);
    }

  function deposing(uint _num) public {  // 유동성 제공
    uint num = _num * 1e18;
    require(g1()*10/100 >= num, "Deposit is limited to 10% of the contract balance"); 
    require(g8(msg.sender) >= num, "not enough bet"); 
    require(mydepo[msg.sender].depoA == 0, "already have a deposit");   //계약에 대출해줄 잔고가 있는가?
     bet.approve(msg.sender,num);
        uint256 allowance = bet.allowance(msg.sender, address(this));
        require(allowance >= num, "Check allowance");
        bet.transferFrom(msg.sender, address(this), num);
    mydepo[msg.sender].depoA = num;  //원금
    mydepo[msg.sender].asset = num * rate/100 /52;  //1회 인출 가능 금액
    mydepo[msg.sender].depot = block.timestamp;  
    mydepo[msg.sender].tiket = 52; 
    tax += num * 10/100;
}





    function withdraw() public {  //유동성 제공한 돈 인출
    require(mydepo[msg.sender].tiket >= 1, "No money to withdraw"); 
    require(mydepo[msg.sender].depot + 7 days <= block.timestamp , "not time yet");
     require(g1() >= mydepo[msg.sender].asset, "not enough bet in the contract"); 
    rateup(); 
     if(mydepo[msg.sender].tiket == 1){
         bet.transfer(msg.sender,mydepo[msg.sender].asset);
     mydepo[msg.sender].depoA = 0;
     mydepo[msg.sender].tiket =0; 
     bet.transfer(msg.sender,mydepo[msg.sender].asset);
     mydepo[msg.sender].asset = 0;
     mydepo[msg.sender].depot = 0;
     }
    else{
    mydepo[msg.sender].tiket -= 1; 
    mydepo[msg.sender].depot = block.timestamp;
    bet.transfer(msg.sender,mydepo[msg.sender].asset);
    taxup();
    }
    }




   function clear() public {  // 빚갚기

    uint pay = myloan[msg.sender].principal;
    require(myloan[msg.sender].loant + 365 days >= block.timestamp, "Exceeded repayment period");  
    require(myloan[msg.sender].loanA >= 1, "No debt");
    require(g8(msg.sender) >= pay , "not enough bet");  
      bet.approve(msg.sender,pay);
        uint256 allowance = bet.allowance(msg.sender, address(this));
        require(allowance >= pay, "Check allowance");
        bet.transferFrom(msg.sender, address(this), pay);
        but.transfer(msg.sender,myloan[msg.sender].mortgage);
    myloan[msg.sender].principal = 0;  //갚을돈
    myloan[msg.sender].loanA = 0;  //대출금액
    myloan[msg.sender].mortgage = 0;  //담보갯수
    myloan[msg.sender].loant = 0;
 
}

   function rateup() public { // 대출 이자 보조 지표
    rate = getrate();
   }
   
    function taxup() public { // 대출 이자 보조 지표
    bet.transfer(taxbank,tax);
    tax = 0;
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

    function g8(address user) public view returns(uint) { // bet 보유 현황
        return bet.balanceOf(user);
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
     
       function getrate() public view returns(uint) { // 담보제공한 but의 시세
        return  100*g4()/g1();
    }

    function getloanAble(uint _but) public view returns(uint) { // 담보제공한 but의 시세
        return  _but*g7() * 100/(rate+10);
    }
}
