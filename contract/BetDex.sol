//SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;



interface Ibet {     
  function balanceOf(address account) external view returns (uint256);
  function allowance(address owner, address spender) external view returns (uint256);
  function transfer(address recipient, uint256 amount) external returns (bool);
  function approve(address spender, uint256 amount) external returns (bool);
  function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
  }

interface Ibutbank{
  function levelcheck(address user)external view returns(uint8);
  function expup(address user,uint pay) external returns(bool);
}
contract BetDex {
    uint256 public price;
    uint256 public tax;
    uint256 public lastPriceUpdate;
    address allow;
    address admin;
    mapping(address => uint8)public black;
    mapping(address => uint8)public staff;
   
    Ibet bet; 
    Ibutbank butbank;
   
    constructor(address _bet,address _butbank,address _allow) {
        bet = Ibet(_bet);
        butbank = Ibutbank(_butbank);
        price = 300;
        allow = _allow;
        admin = msg.sender;
        staff[msg.sender] = 10;
         }
    

    function alloweup(address _allow)public{
        require( admin == msg.sender);
        allow= _allow;
        }

    function blackup(address _black)public{
        require( staff[msg.sender] >= 5);
        black[_black] = 5;
        }
 
     function betbuy() payable public {
        uint256 pay = msg.value*price/1000;
        require(pay <= betbalances(), "Not enough tokens");
        bet.transfer(msg.sender,pay); 
        }

    function bnbsell(uint256 num) public {  
    
        uint256 pay = (num/price)*g1(msg.sender); 
        uint256 ttax = (num/price)*1000;
        
        require( g2(msg.sender) >= num,"no bet");
        require( black[msg.sender] == 0,"you black");
        require(balance() >= pay,"no BNB");
        bet.approve(msg.sender,num);
        uint256 allowance = bet.allowance(msg.sender, address(this));
        require(allowance >= num, "Check allowance");
        bet.transferFrom(msg.sender, address(this), num);
        payable(msg.sender).transfer(pay); 
        tax += ttax - pay;
        }

    function priceup(uint256 num)public {  
        require(staff[msg.sender] >= 1,"no staff"); 
        price = num; 
        if(tax >= 1e18){ 
        bet.transfer(allow,tax);
        tax =0;
        }
         }


    function staffup(uint8 num,address _staff)public {  
        require(admin == msg.sender,"no amdin");
        staff[_staff] = num; }
    
    function deposit()external payable{
    }

    function getprice()public view returns(uint256){  
        return price;
    }

    function balance()public view returns(uint256){   
        return address(this).balance;
   }
    
    function betbalances() public view returns(uint256) {
        return bet.balanceOf(address(this));
    }
   

   function g1(address user) public view returns(uint256) {
        return 900+butbank.levelcheck(user);
    }

function  g2(address user) public view returns(uint256) {
        return bet.balanceOf(user);
    }
 
}

