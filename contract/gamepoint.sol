

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



    contract gamepoint {
  
      Ibet bet;
     uint tax;
     address public admin;
     address public butbank;
      mapping (address => uint)public mygp;
      mapping (address => uint)public staff;
      mapping (address => uint)public fa;
   
  

     constructor(address _bet,address _butbank) public { 
    
      bet = Ibet(_bet);
      butbank = _butbank;
      admin =msg.sender;
      staff[msg.sender] = 10;
      
      }
    


  function staffup(address _staff,uint8 num)public {  
        require( admin == msg.sender,"no admin"); 
        staff[_staff] = num;
        }   

  function faup(address _fa)public {  
        require( admin == msg.sender,"no admin"); 
        fa[_fa] = 5;
        }   


  
  function gpup(address _user,uint _gp) public {  
    require(fa[msg.sender] >= 5,"no family");
    mygp[_user] += _gp; 
  }

    function gpdown(address _user,uint _gp) public {  
    require(fa[msg.sender] >= 5,"no family");
    mygp[_user] -= _gp; 
  }



  function charge (uint _pay)public {
    uint pay = _pay*1e18;
    require(g3(msg.sender) >= pay,"no bet");
    bet.approve(msg.sender,pay);
    uint256 allowance = bet.allowance(msg.sender, address(this));
    require(allowance >= pay, "Check the  allowance");
    bet.transferFrom(msg.sender, address(this),pay);
    mygp[msg.sender] += pay;
    tax += _pay*10/100;
  }

  function withdraw( )public {     
    uint pay = mygp[msg.sender];
    require(pay >=1e16,"0.01bet or more");   
    require(pay <= g1(),"no bet");  
    
    mygp[msg.sender] = 0;
    bet.transfer(msg.sender,pay);
    taxout();
   }
  
   
   function taxout( )public{
    bet.transfer(butbank, tax);
    tax = 0;
   } 



 function g1() public view virtual returns(uint256){  
  return bet.balanceOf(address(this));
  }
  
  function g2(address user) public view virtual returns(uint256){  
  return mygp[user];
  }

   function  g3(address user) public view returns(uint) {  
  return bet.balanceOf(user);
  }  

  



  function deposit()external payable{
  }
 
}
  