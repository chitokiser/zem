

// SPDX-License-Identifier: MIT  
// ver1.0
pragma solidity >=0.7.0 <0.9.0;


interface Izem {     
  function balanceOf(address account) external view returns (uint256);
  function allowance(address owner, address spender) external view returns (uint256);
  function transfer(address recipient, uint256 happy) external returns (bool);
  function approve(address spender, uint256 happy) external returns (bool);
  function transferFrom(address sender, address recipient, uint256 happy) external returns (bool);
  }

    interface Izumbank{      
    function depoup(address _user, uint _depo) external;
    function getprice() external view returns (uint256);
    function getlevel(address user) external view returns (uint);
    function g9(address user) external view returns (uint);  // 각 depo현황
    function getagent(address user) external view returns (address);
    function getmento(address user) external view returns (address);
    function expup(address _user,uint _exp) external;
  
  }  
    

    contract gamepoint {
  
      Izem zem;
      Izumbank zumbank;
     uint tax;
     address public admin;
     address public tbank;
      mapping (address => uint)public mygp;
      mapping (address => uint)public staff;
      mapping (address => uint)public fa;
   
  

     constructor(address _zem,address _zumbank) public { 
    
      zem = Izem(_zem);
      zumbank = Izumbank(_zumbank);
      tbank = _zumbank;
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
    require(g3(msg.sender) >= pay,"no zem");
    zem.approve(msg.sender,pay);
    uint256 allowance = zem.allowance(msg.sender, address(this));
    require(allowance >= pay, "Check the  allowance");
    zem.transferFrom(msg.sender, address(this),pay);
    address _mento =  zumbank.getmento(msg.sender);
    zumbank.depoup(_mento,pay*1/100);  //멘토 수당
    zumbank.expup(msg.sender,pay*1/1E16);  //경험치
    mygp[msg.sender] += pay;
  }

  function withdraw( )public {     
    uint pay = mygp[msg.sender]*950/1000;
    require(pay >=1e16,"0.01zem or more");   
    require(pay <= g1(),"no zem");  
    address _mento =  zumbank.getmento(msg.sender);
    zumbank.depoup(_mento,pay*1/100);  //멘토 수당
    zumbank.expup(msg.sender,pay*1/1E16);  //경험치
    mygp[msg.sender] = 0;
    zem.transfer(msg.sender,pay);

   }
  
   
   function taxout( )public{
    zem.transfer(tbank, g1()*50/100);

   } 



 function g1() public view virtual returns(uint256){  
  return zem.balanceOf(address(this));
  }
  
  function g2(address user) public view virtual returns(uint256){  
  return mygp[user];
  }

   function  g3(address user) public view returns(uint) {  
  return zem.balanceOf(user);
  }  

  



  function deposit()external payable{
  }
 
}
  