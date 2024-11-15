// SPDX-License-Identifier: MIT  
// ver1.0
pragma solidity >=0.7.0 <0.9.0;


 interface Imutbank{      //멋뱅크
    function depoup(address _user, uint _depo) external;
    function depodown(address _user, uint _depo) external;
    function getprice() external view returns (uint256);
    function getlevel(address user) external view returns (uint);
    function g9(address user) external view returns (uint);  // 각 depo현황
    function getagent(address user) external view returns (address);
    function getmento(address user) external view returns (address);
    function expup(address _user,uint _exp) external;
  
  }  
    

interface Imt5{     
 function getmetainfo(uint _num) external view returns (uint256, uint256, string memory, uint256,uint8, address,address);
  }


    contract metatree {
      Imutbank mutbank;
      Imt5 mt5;
      uint[12] taxnft; // for tax
      address admin;
      uint256 public sum;  
      uint256 public happy; //수당금액
      uint256 public fee;
      mapping (address => my)public myinfo;

   
     constructor(address _mt5,address _mutbank) public { 
    
      happy = 20e18; //기본수당
      fee = 15000;  //
      mt5 = Imt5(_mt5);
      mutbank = Imutbank(_mutbank);
      admin =msg.sender;
      myinfo[msg.sender].dep = 2;
      myinfo[msg.sender].mynum = 1;
    
      }

    struct my {
    uint256 depo; 
    uint256 dep;
    uint256 mynum;
    uint8 wc;  //withdraw limit
    uint256 bonus;
    
    }

function memberjoin(uint _mid,address mento)public {   
    require( fetchOwnerAddress( _mid)  == msg.sender,"no owner"); 
    require (myinfo[msg.sender].dep == 0,"Already a member");
      myinfo[msg.sender].dep = 2;
      myinfo[msg.sender].mynum = sum;
      myinfo[mento].bonus += 1;
      sum += 1;
}


function check() public { 
    my storage tmy = myinfo[msg.sender]; 
    require(tmy.dep >=1 ,"no member");
    require(sum - tmy.mynum >= tmy.dep,"little member");
    require(tmy.wc < 10,"over withdraw");  //10회 인출 가능
    require(myinfo[msg.sender].bonus > 1,"Get recommended more than twice");
    tmy.wc += 1;
    tmy.depo += (happy*tmy.dep) +(happy*tmy.bonus);  //수당지급
    tmy.mynum = (tmy.mynum+2)*2;
    tmy.dep = tmy.dep*2;
   
}
   
  function withdraw( )public {   
   uint256 pay = myinfo[msg.sender].depo;
   require(pay > 0,"no depo");
    require(myinfo[msg.sender].bonus > 1,"Get recommended more than twice");
   myinfo[msg.sender].depo = 0; 
   mutbank.depoup(msg.sender,pay);
   mutbank.expup(msg.sender,pay/1e17); //경험치 증가
  }
  

     
  function happyup(uint _happy) public {
   require(admin == msg.sender,"no admin");
      happy = _happy;  
   } 


 function fetchMetaInfo(uint _num) public view returns (uint256, uint256, string memory, uint256, uint8, address, address) {
        return mt5.getmetainfo(_num);
    }
  

    // getmetainfo 함수를 호출하여 6번째 address 정보만 반환합니다.
    function fetchOwnerAddress(uint _num) public view returns (address) {
        (, , , , , address ownerAddress, ) = mt5.getmetainfo(_num);
        return ownerAddress;
    }
    


 function getsum( ) public view returns(uint) {
  return sum;
    }

    function thistimepoint() public view returns(uint) { 
      my memory tmy = myinfo[msg.sender]; 
      uint pay = happy*tmy.dep;
  return pay + (tmy.bonus*happy);
    }

  function deposit()external payable{
  }
    
}