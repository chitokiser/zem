// SPDX-License-Identifier: MIT  
// ver1.0
pragma solidity >=0.7.0 <0.9.0;

interface Izem {     
  function balanceOf(address account) external view returns (uint256);
  function allowance(address owner, address spender) external view returns (uint256);
  function transfer(address recipient, uint256 amount) external returns (bool);
  function approve(address spender, uint256 amount) external returns (bool);
  function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

interface Izum {      
  function balanceOf(address account) external view returns (uint256);
  function allowance(address owner, address spender) external view returns (uint256);
  function transfer(address recipient, uint256 amount) external returns (bool);
  function approve(address spender, uint256 amount) external returns (bool);
  function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
  function g1() external view returns(uint256);
  function getdepot(address user) external view returns(uint256);
}

contract zumbank {
  Izem zem;
  Izum zum;
  uint256 public totaltax; 
  uint256 public zumAmount;
  uint256 public tax;  
  uint8 public act;  
  uint256 public allow;
  address public bank; 
  address public admin;
  uint256 public sum;   
  uint256 public sold;  
  uint8 public commission; 
  uint256 public fix;  
  address public owner; 
  uint256[] public chart; 
  uint256 public price;  
  mapping (address => my) public myinfo;
  mapping (address => address[]) public mymenty;
  mapping (address => uint) public staff;
  mapping (address => uint) public fa;
  mapping (address => uint) public allowt; 
  mapping (address => bool) public buffcheck;
  event getdepo(uint amount);

     
  constructor(address _zem, address _zum, address _zumb) {
    fix = 1e16;  
    zem = Izem(_zem);
    zum = Izum(_zum);
    bank = _zumb;  
    price = 1e16;
    sold = 1000;
    act =3 ;
    admin = msg.sender;
    staff[msg.sender] = 10;
    myinfo[msg.sender].level = 10;
    commission = 30;
    zumAmount = 500;
  }
    
  struct my {
    uint256 totaldepo; 
    uint256 depo;
    uint256 level;
    address mento; 
    uint256 exp;
  }
    


  function actup(uint8 _num) public {  
    require(admin == msg.sender, "no admin"); 
    act = _num;
  }
  function staffup(address _staff, uint8 num) public {  
    require(admin == msg.sender, "no admin"); 
    staff[_staff] = num;
  }   

  function faup(address _fa) public {  
    require(admin == msg.sender, "no admin"); 
    fa[_fa] = 5;
  }   
  
  function depoup(address _user, uint _depo) public {  
    require(fa[msg.sender] >= 5, "no family");
    myinfo[_user].depo += _depo;
  }

  function expup(address _user, uint _exp) public {  
    require(fa[msg.sender] >= 5, "no family");
    myinfo[_user].exp += _exp;
  }

  function depodown(address _user, uint _depo) public {  
    require(fa[msg.sender] >= 5, "no family");
    myinfo[_user].depo -= _depo;
  }



  function memberjoin(address _mento) public {  
    require(myinfo[msg.sender].level == 0, "already member"); 
    require(myinfo[_mento].level >= 2, "no mento"); 
    myinfo[msg.sender].level = 1;
    myinfo[msg.sender].mento = _mento;
    mymenty[_mento].push(msg.sender);
    sum += 1;
  }

  function ownerup(address _owner) public {  
    require(staff[msg.sender] >= 5, "no staff");
    owner = _owner;
  }

  function bankup(address _bank) public {  
    require(staff[msg.sender] >= 5, "no staff");
    bank = _bank;  
  }

  function buyzum(uint _num) public returns(bool) {  
    uint pay = _num * price;
    require(act >= 1, "Not for sale");  
    require(g3() >= _num, "Cut sold out");  
    require(1 <= _num, "1 or more");
    require(1 <= myinfo[msg.sender].level, "no member");
    require(zem.balanceOf(msg.sender) >= pay, "no cya"); 
    zem.approve(msg.sender, pay); 
    uint256 allowance = zem.allowance(msg.sender, address(this));
    require(allowance >= pay, "Check the token allowance");
    zem.transferFrom(msg.sender, address(this), pay);  
    zum.transfer(msg.sender, _num);
    myinfo[msg.sender].exp += _num / 10;
    myinfo[myinfo[msg.sender].mento].depo += pay * commission / 100;
    allowt[msg.sender] = block.timestamp;
    priceup();
    tax += pay * 5 / 100;
    return true;     
}

function levelup() public {
    uint256 mylev = myinfo[msg.sender].level;
    uint256 myexp = myinfo[msg.sender].exp;
    require(mylev >= 1  && myexp >= 2**mylev * 10000, "Insufficient requirements");
    myinfo[msg.sender].exp -= 2**mylev * 10000;
    myinfo[msg.sender].level += 1;
    myinfo[myinfo[msg.sender].mento].exp += mylev*5555;
}

function sellcut(uint num) public returns(bool) {      
    uint256 pay = num * price;  
    require(act >= 3, "Can't sell"); 
    require(1 <= num, "1 or more");
    require(6 <= getlevel(msg.sender), "Level 6 or higher"); 
    require(g8(msg.sender) >= num, "no vet");
    require(g1() >= pay, "no cya");
    zum.approve(msg.sender, num);
    uint256 allowance = zum.allowance(msg.sender, address(this));
    require(allowance >= num, "Check the allowance");
    zum.transferFrom(msg.sender, address(this), num); 
    zem.transfer(msg.sender, pay);
    myinfo[msg.sender].level -= 1; 
    priceup();
    return true;
}

function allowcation() public returns(bool) {   
    require(act >= 2, "No dividend");  
    require(getlevel(msg.sender) >= 1, "no member");  
    require(g8(msg.sender) >= 5000, "More than 5000SUT"); 
    require(allowt[msg.sender] + 7 days < block.timestamp, "not time"); 
    require(zum.getdepot(msg.sender) + 7 days < block.timestamp, "zum not time"); 
    allowt[msg.sender] = block.timestamp;
    uint256 pay = getpay(msg.sender); 
    myinfo[msg.sender].depo += pay;
    myinfo[msg.sender].exp += 5000;
    emit getdepo(pay);
    return true;
}
  
function withdraw() public {    
    uint pay = myinfo[msg.sender].depo;
    require(pay >= 1, "No commission to pay"); 
    myinfo[msg.sender].depo = 0;
    myinfo[myinfo[msg.sender].mento].depo += pay * commission/60; 
    require(pay <= g1(), "no zem");  
    myinfo[msg.sender].totaldepo += pay;
    zem.transfer(msg.sender, pay );
}

 function buffing() public {  
    require(zum.balanceOf(msg.sender) >= zumAmount, "zum is not enough"); 
    require(zumbank.getlevel(msg.sender)>= 1, "Must be level 1 or higher"); 
    require(buffcheck[msg.sender] == false, "Already got the buff"); 
    
    buffcheck[msg.sender] = true;
    myinfo[msg.sender].level = 2;
  }


function fixup(uint256 _fix) public { 
    require(admin == msg.sender, "no admin");
    fix = _fix;  
}  


function commissionup(uint8 _commission) public {  
    require(admin == msg.sender, "no admin");
    commission = _commission;  
}  

function priceup() public {
    sold = g11();
    allow = g1() / (sold); 
    price = allow + fix;
    chart.push(price);   
}


function g1() public view virtual returns(uint256) {  
    return zem.balanceOf(address(this));
}

function g3() public view returns(uint) { 
    return zum.balanceOf(address(this));
}  

  function g4() public view virtual returns(uint){  
  return chart.length;
  }
    function g5(uint _num) public view virtual returns(uint256){  
  return chart[_num];
  }
function g6() public view virtual returns(uint256){  
  return zum.balanceOf(address(this));
  }
function g8(address user) public view returns(uint) {  
    return zum.balanceOf(user);
}  

function g9(address user) public view returns(uint) {  
    return myinfo[user].depo;
}  

function getlevel(address user) public view returns(uint) {  
    return myinfo[user].level;
}  


    
function getmento(address user) public view returns(address) {  
    return myinfo[user].mento;
}  

function g10() public view virtual returns(uint256) {  
    return zum.g1();  
}

function g11() public view virtual returns(uint256) {  
    return g10() - g3();  
}
  

function getpay(address user) public view returns (uint256) { 
    return g8(user) * allow * getlevel(user) / 2000;
}
  
function gettime() public view returns (uint256) {  
    return (allowt[msg.sender] + 604800) - block.timestamp;
}

function getprice() public view returns (uint256) {  
    return price;
}

function getmymenty(address user) public view returns (address[]memory) {  
    return mymenty[user];
}

function deposit() external payable {}
}
