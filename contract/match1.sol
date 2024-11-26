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
    uint256 public mid; // 남자 데이터 배열 인덱스
    uint256 public lid; // 여자 데이터 배열 인덱스

    mapping(uint256 => Man) public men; // 남자 데이터
    mapping(uint256 => Lady) public ladies; // 여자 데이터
    mapping(address => uint256) public myMid; // 남자 ID
    mapping(address => uint256) public myLid; // 여자 ID

    struct Man {
        string mysns; // SNS 주소
        uint256 depo; // 보증금
        uint256 time; // 가입 시점
        uint256 price; 
        address owner;
        address mylady;
    }

    struct Lady {
        string mysns; // SNS 주소
        uint256 time; // 가입 시점
        address owner;
        address myman;
        uint8 num;
    }

    event Farmnum(uint256 winnum);

    constructor(address _butbank, address _bet) {
        butbank = Ibutbank(_butbank);
        bet = Ibet(_bet);
        taxbank =_butbank;
        admin = msg.sender;

    }

    function manAdd(string memory _mysns) public {
        uint256 pay = 75*1e18*10;
        require(bet.balanceOf(msg.sender) >= pay, "Not enough BET"); // BET 토큰 잔고 확인
        require(getLevel(msg.sender) >= 2, "Level 2 or higher required"); // 레벨 확인
        require(myMid[msg.sender] == 0, "Already registered"); // 중복 등록 방지

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
            price : 75 * 1e18
        });

        myMid[msg.sender] = mid;
        mid += 1;

        address mentor = getMento(msg.sender);
        if (mentor != address(0)) {
            butbank.depoup(mentor, pay * 10 / 100); // 멘토에게 수당 지급
        }
    }

    function manEdit(uint256 _mid, string memory _mysns) public {
        require(men[_mid].owner == msg.sender, "Not the owner");
        men[_mid].mysns = _mysns;
    }

    function ladyAdd(string memory _mysns,address _lady) public {
        require(getLevel(msg.sender) >= 2, "Level 2 or higher required"); // 등록자 레벨 확인

        ladies[lid] = Lady({
            mysns: _mysns,
            time: block.timestamp,
            owner: _lady,  
            myman: address(0),
            num: 0
        });

        myLid[msg.sender] = lid;
        lid += 1;
    }

    function ladyEdit(uint256 _lid, string memory _mysns) public {
        require(ladies[_lid].owner == msg.sender, "Not the owner");
        ladies[_lid].mysns = _mysns;
    }



    function acceptWife(uint256 _lid) public {
        require(men[myMid[msg.sender]].mylady == address(0), "already have a wife");
        require(ladies[_lid].myman == address(0), "already have a husband");
        require(men[myMid[msg.sender]].depo >= 750*1e18, "not enough deposit");
        men[myMid[msg.sender]].mylady = ladies[_lid].owner;

      
    }

    function withdraw() public {
         
        address _myman = ladies[myLid[msg.sender]].myman;
         uint _lid = myLid[msg.sender];   //내 id
        uint _mid = myMid[_myman];   //내 남편 id
        uint _price = men[_mid].price;
        require(men[_mid].depo >= men[_mid].price, "Not enough deposit");//내 남편의 계좌에 돈이 있는지?
        require(men[_mid].mylady == msg.sender, "No wife");//내 남편의 계좌에 돈이 있는지?
        require(block.timestamp >= ladies[_lid].time + 7 days, "It's not time yet");

        men[_mid].depo -= _price;
        ladies[_lid].time = block.timestamp;

        butbank.depoup(msg.sender, _price * 80 / 100);
        butbank.depoup(getMento(msg.sender), _price * 10 / 100);
        
    }

    function divorce() public {   //남자가 이혼을 원할때
        uint256 _mid = myMid[msg.sender];
        require(men[_mid].owner == msg.sender, "Not the owner");
        require(men[_mid].mylady != address(0), "Not married");
        uint256 _lid = myLid[men[_mid].mylady];
        ladies[_lid].myman = address(0);
        ladies[_lid].num += 1;

    }

 
    function setPrice(uint256 _price) public {
        require(men[myMid[msg.sender]].owner == msg.sender, "No owner");
        men[myMid[msg.sender]].price = _price *1e18;
    }

    function charge(uint256 _amount) public {
        uint256 pay = _amount * 1e18;
        uint256 _mid = myMid[msg.sender];
        require(men[_mid].owner == msg.sender, "Not the owner");
        require(bet.balanceOf(msg.sender) >= pay, "Not enough BET");

        require(bet.approve(address(this), pay), "Approval failed");
        uint256 allowance = bet.allowance(msg.sender, address(this));
        require(allowance >= pay, "Check token allowance");
        require(bet.transferFrom(msg.sender, address(this), pay), "Transfer failed");
        men[_mid].depo += pay;
    }

    function getMento(address user) public view returns (address) {
        return butbank.getmento(user);
    }

    function getLevel(address user) public view returns (uint256) {
        return butbank.getlevel(user);
    }

    function trans()public {
      bet.transfer(taxbank,g1());
    }


    function getlid() public view virtual returns(uint256) {  
    return bet.balanceOf(address(this));
}


 function g1() public view virtual returns(uint256) {  
    return bet.balanceOf(address(this));
}

}

