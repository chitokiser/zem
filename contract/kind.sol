
// SPDX-License-Identifier: MIT  
// ver1.2
pragma solidity >=0.7.0 <0.9.0;

interface Ibet {
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool); 
}

interface Ibut {
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool); 
}

interface Ibutbank {
    function depoup(address _user, uint _depo) external;
    function depodown(address _user, uint _depo) external;
    function getprice() external view returns (uint256);
    function getlevel(address user) external view returns (uint);
    function g8(address user) external view returns(uint); //유저별 but 현황
    function g9(address user) external view returns (uint); // 각 depo현황
    function getagent(address user) external view returns (address);
    function getmento(address user) external view returns (address);
    function expup(address _user, uint _exp) external;
}

contract kind { //현물출자 리스트
    Ibet bet;
    Ibut but;
    Ibutbank butbank;

    address public admin; 
    address public taxbank;
    uint256 public pid; //출자자수
    uint256 public bid; //구매자수
    uint256 public tax; // 매출
 
 
  
    mapping(address => uint8) public staff;
    mapping(uint256 => Meta) public metainfo; // 제품id별 추적
   
   

      
    constructor(address _bet,address _but, address _taxbank, address _butbank) {
        bet = Ibet(_bet);
        but = Ibut(_but);
        butbank = Ibutbank(_butbank);
        admin = msg.sender;
        staff[msg.sender] = 5;
        taxbank = _taxbank;  
   
    }

    struct Meta {
        string name; // 물건이름
        uint256 price; // 가격
        uint256 payrate; //수당 적립금
        uint256 butreward;  //but제공 개수
        bool sale; //판매가능 
         address kinder; // 최초 출자자
          address registrant; // 등록자
           address owner; // 구매자
       }
  
    modifier onlyAdmin() {
        require(msg.sender == admin, "Caller is not admin");
        _;
    }

    modifier onlyStaff(uint level) {
        require(staff[msg.sender] >= level, "Insufficient staff level");
        _;
    }

    function staffup(address _staff, uint8 _level) public onlyStaff(5) {   
        staff[_staff] = _level;
    } 

   

     function nameup(uint256 _mid,string memory _name) public onlyStaff(5) {   
        metainfo[_mid].name = _name;
    } 
  

    
     function butrewardup(uint256 _mid,uint256 _butreward) public onlyStaff(5) {   
        metainfo[_mid].butreward = _butreward;
    } 

  
    



        function priceup(uint256 _bid,uint256 _price) public onlyStaff(5) {   
        metainfo[_bid].price = _price ;
    } 

  

        function saleup(uint _pid) public onlyStaff(5) {   //판매가능여부
          metainfo[_pid].sale = true;
    } 


    function taxbankup(address _taxbank) public onlyStaff(5) {   
        taxbank = _taxbank;
    } 



    
    function newMeta(string memory _name, uint256 _price,uint256 _rate,uint256 _butreward,address _kinder) public onlyStaff(5) {
       require( g5() >= _butreward, "Not enough BUT");
       require( butbank.getlevel(_kinder)>= 1, "No member");
        Meta storage meta = metainfo[pid];
        meta.name = _name;
        meta.price = _price *1e18; //bet기준 제품가격
        meta.payrate = _rate;
        meta.butreward = _butreward;  //최초등록자에게 보상해줌
        meta.sale = true;
        meta.kinder = _kinder;
        meta.registrant = msg.sender;
        pid += 1 ;
        but.transfer(_kinder,_butreward);
    }

  

    function buy(uint _pid,uint num) public {  
        uint pay = metainfo[_pid].price*num;
        require(metainfo[_pid].sale == true, "Not for sale");
        require(g2(msg.sender) >= pay, "bet not enough");

        bet.approve(msg.sender, pay); 
        uint256 allowance = bet.allowance(msg.sender, address(this));
        require(allowance >= pay, "Check the token allowance");
        bet.transferFrom(msg.sender, address(this), pay); 
        address mymento =  butbank.getmento(metainfo[_pid].kinder);
        butbank.depoup(mymento,pay * metainfo[_pid].payrate /100);
        metainfo[_pid].owner = msg.sender;
        metainfo[_pid].sale = false;
        bid += 1;
        
    }


    function withdraw(uint num) public onlyStaff(5) {  
        uint pay = num *1e18;
        require(g1() >= pay, "bet not enough");
        bet.transfer(msg.sender,pay*80/100);
        bet.transfer(taxbank,pay*20/100);     
    }


    function g1() public view virtual returns (uint256) {  
        return bet.balanceOf(address(this));
    }

    function g2(address user) public view virtual returns (uint256) {  
        return bet.balanceOf(user);
    }

    function g3(address user) public view virtual returns (uint256) {  //유저별 but보유현황 꾸러미 등록전
        return butbank.g8(user);
    }
     

      function g5() public view virtual returns (uint256) {  
        return but.balanceOf(address(this));
    }

    

}