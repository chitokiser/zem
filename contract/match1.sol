// SPDX-License-Identifier: MIT
// ver1.3
pragma solidity >=0.7.0 <0.9.0;

interface Ibet {
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
    function g9(address user) external view returns (uint);  // 각 depo 현황
    function getmento(address user) external view returns (address);
    function expup(address _user, uint _exp) external;
}

contract Match1 {
    Ibutbank public butbank;
    Ibet public bet;

    address public admin;
    address public taxbank;
    uint256 public taxtotal; // 누적세금
    uint256 public mid; // 남자 데이터 배열 인덱스
    uint256 public lid; // 여자 데이터 배열 인덱스
    uint8 public mentofee; //멘토수수료
    mapping(address => uint8) public staff;
    mapping(uint256 => Man) public men; // 남자 데이터
    mapping(uint256 => Lady) public ladies; // 여자 데이터
    mapping(address => uint256) public myMid; // 남자 ID
    mapping(address => uint256) public myLid; // 여자 ID



    struct Man {
        string mysns; // SNS 주소
        uint256 depo; // 보증금
        uint256 time; // 가입 시점
        uint256 price; // 1회 인출 금액 설정
        address owner;
        address mylady;
        uint8 num;
    }

    struct Lady {
        string mysns; // SNS 주소
        uint256 time; // 가입 시점
        address owner;
        address waiter;  
        address myman;
        bool ok;
        uint8 num;
        uint256 mylid;
    }

    constructor(address _butbank, address _bet) {
        butbank = Ibutbank(_butbank);
        bet = Ibet(_bet);
        taxbank = _butbank;
        admin = msg.sender;
        staff[msg.sender] = 5; // 초기 관리자 권한 설정
    }

    // 남성 등록
    function manAdd(string memory _mysns) public {
        uint256 pay = 1000 * 1e18; // 10배의 BET 토큰 지불
        require(bet.balanceOf(msg.sender) >= pay, "Not enough BET");
        require(getLevel(msg.sender) >= 2, "Level 2 or higher required");
        require(myMid[msg.sender] == 0, "Already registered");

        bet.approve(msg.sender, pay); 
        uint256 allowance = bet.allowance(msg.sender, address(this));
        require(allowance >= pay, "Check the token allowance");
        bet.transferFrom(msg.sender, address(this), pay);  

        men[mid] = Man({
            mysns: _mysns,
            depo: pay,
            time: block.timestamp,
            owner: msg.sender,
            mylady: address(0),
            price: 75 * 1e18,
            num: 0
        });

        myMid[msg.sender] = mid;
        mid += 1;

        address mentor = getMento(msg.sender);
        if (mentor != address(0)) {
            butbank.depoup(mentor, pay * mentofee / 100); // 멘토에게 수당 지급
        }
    }

    // 여성 등록
    function ladyAdd(string memory _mysns, address _lady) public {
        require(getLevel(msg.sender) >= 2, "Level 2 or higher required");
        require(getLevel(_lady) >= 1, "Level 1 or higher required");
        require(myLid[_lady] == 0, "Already registered");
        ladies[lid] = Lady({
            mysns: _mysns,
            time: block.timestamp,
            owner: _lady,
            waiter: address(0),
            myman: address(0),
            ok: false,
            num: 0,
            mylid: lid
        });

        myLid[_lady] = lid;
        lid += 1;
    }


    function manedit(string memory _mysns, address _man) public{
       uint _mid = myMid[_man];
       require (men[_mid].owner == _man || staff[msg.sender] >= 1,"no husband"); 
        men[_mid].mysns = _mysns; 
    }
    function ladedit(string memory _mysns, address _lady) public{
        uint _lid = myLid[_lady];
       require (ladies[_lid].owner == _lady || staff[msg.sender] >= 1,"no husband"); 
        ladies[_lid].mysns = _mysns; 
    }

      // 프로포즈
    function Propose(uint _lid) public {
        uint pay = men[myMid[msg.sender]].depo;
        require(500 *1e18 <  pay, "insufficient equity");
        require(ladies[_lid].waiter == address(0), "already have a waiter");
        ladies[_lid].waiter = msg.sender;
        men[myMid[msg.sender]].depo -= 10 * 1e18;
    }

    // 남편 승인
    function HusbandApproval(uint8 _choice) public {
        uint256 _lid = myLid[msg.sender];
        require(ladies[_lid].waiter != address(0), "no waiter");
        require(ladies[_lid].myman == address(0), "already have a husband");
   
        if(_choice == 1){ladies[_lid].ok = true;

        }else if(_choice == 2){
         ladies[_lid].waiter = address(0);   
        }
        
    }

    // 아내 수락
    function acceptWife(uint256 _lid) public {
        require(men[myMid[msg.sender]].mylady == address(0), "already have a wife");
        require(ladies[_lid].waiter == msg.sender, "Not approved");
        require(ladies[_lid].ok == true, "Not yet approved");
        require(ladies[_lid].myman == address(0), "already have a husband");
        require(men[myMid[msg.sender]].depo >= 500 * 1e18, "not enough deposit");

        men[myMid[msg.sender]].mylady = ladies[_lid].owner;
        ladies[_lid].myman = msg.sender;
    }

    // 출금 기능
    function withdraw() public {
        uint256 _lid = myLid[msg.sender];
        uint256 _mid = myMid[ladies[_lid].myman];
        uint256 _price = men[_mid].price;

        require(men[_mid].depo >= _price, "Not enough deposit");
        require(men[_mid].mylady == msg.sender, "No wife");
        require(block.timestamp >= ladies[_lid].time + 7 days, "It's not time yet");

        // 상태 업데이트: 출금 전에 보증금 차감
        men[_mid].depo -= _price;
        ladies[_lid].time = block.timestamp;

        // 출금 처리 및 멘토에게 수수료 지급
        butbank.depoup(msg.sender, _price * 80 / 100);
        butbank.depoup(getMento(msg.sender), _price * mentofee / 100);
    }

    // 이혼 처리
    function divorce() public {
        uint256 _mid = myMid[msg.sender];
        require(men[_mid].owner == msg.sender, "Not the owner");
        require(men[_mid].mylady != address(0), "Not married");
        require(men[_mid].time + 30 days <= block.timestamp, "There is time left");

        uint256 _lid = myLid[men[_mid].mylady];
        ladies[_lid].myman = address(0);
        ladies[_lid].waiter = address(0);
        ladies[_lid].num += 1;

        men[_mid].mylady = address(0);
        men[_mid].num += 1;
    }

    // 금액 설정
    function setPrice(uint256 _price) public {
        require(men[myMid[msg.sender]].owner == msg.sender, "No owner");
        men[myMid[msg.sender]].price = _price * 1e18;
        taxtansfer();
    }


       // 금액 설정
    function Mentofeeup(uint8 _fee) public {
        require(staff[msg.sender] >= 1, "No staff");
        mentofee = _fee;
    }

    // 충전 기능
    function charge(uint256 _amount) public {  
        uint256 _mid = myMid[msg.sender];
        uint256 pay = _amount * 1e18;

        require(men[_mid].owner == msg.sender, "Not the owner");
        require(bet.balanceOf(msg.sender) >= pay, "Not enough BET");
        require(bet.approve(address(this), pay), "Approval failed");

        uint256 allowance = bet.allowance(msg.sender, address(this));
        require(allowance >= pay, "Check token allowance");
        require(bet.transferFrom(msg.sender, address(this), pay), "Transfer failed");

        men[_mid].depo += pay;
    }
  function taxtansfer()public {
    taxtotal += g1();
    bet.transfer(taxbank,g1());
  }

 function staffup(address user,uint8 _num)public {
    require(admin == msg.sender, "no admin");
    staff[user] = _num;
  }


    function getMento(address user) public view returns (address) {
        return butbank.getmento(user);
    }

    function getLevel(address user) public view returns (uint256) {
        return butbank.getlevel(user);
    }

     function getSns(uint _lid) public view returns (string memory) {
        require (ladies[_lid].waiter == msg.sender || ladies[_lid].myman == msg.sender ,"no husband");
        return ladies[_lid].mysns;
    }

  

    function getlid(address user) public view virtual returns(uint256) {  
    return myLid[user];
}

      function getMid(address user) public view virtual returns(uint256) {  
    return myMid[user];
}

  

 function g1() public view virtual returns(uint256) {  
    return bet.balanceOf(address(this));
}

}
