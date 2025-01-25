// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface Ibet {
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function transfer(address recipient, uint256 happy) external returns (bool);
    function approve(address spender, uint256 happy) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 happy) external returns (bool);
    function g1() external view returns (uint256);
}

interface Ibutbank {
    function depoup(address _user, uint _depo) external;
    function depodown(address _user, uint _depo) external;
    function getprice() external view returns (uint256);
    function getlevel(address user) external view returns (uint);
    function getmentolevel(address user) external view returns (uint);
    function g9(address user) external view returns (uint);
}

contract Receipt {

    Ibutbank public butbank;
    Ibet public bet;

    address public admin;
    address public bank;
    uint256 public did; // Doctor ID
    uint256 public cid; // Company ID
    uint256 public rid; // Receipt ID
    uint256 public tax; 

    mapping(address => uint8) public staff;
    mapping(uint256 => Doc) public ds;
    mapping(uint256 => Com) public cs;
    mapping(uint256 => ReceiptStruct) public rs;
    mapping(address => uint[]) public MyReceipt; 
    mapping(uint => uint[]) public MyClaim;
    mapping(address => uint) public myreward;
    mapping(address => string) private License;
    mapping(address => uint) public Mydid;
    
    constructor(address _butbank, address _bet) {
        bet = Ibet(_bet);
        butbank = Ibutbank(_butbank);
        admin = msg.sender;
        staff[msg.sender] = 10;
        bank = _butbank;
    }

    struct Doc {
        address owner;
        uint8 status; // 1=Active, 2=Inactive
        uint256 did;
    }

    struct Com {
        uint256 depo;
        string name;
        address owner;
    }

    struct ReceiptStruct {
        uint256 cid;
        uint256 reward;
        uint status; // 1=Claimed, 2=Approved, 3=Rejected, 4=Withdrawn
        string receipt;
        address owner;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "No admin");
        _;
    }

    modifier onlyStaff() {
        require(staff[msg.sender] >= 5, "No staff");
        _;
    }

    function staffup(address _staff, uint8 _num) public onlyAdmin {
        staff[_staff] = _num;
    }

    function claim(uint _cid, string memory _receipt) public {
        uint mydid = Mydid[msg.sender];
        require(mydid >= 1,"No member");
        require(ds[mydid].status == 1, "Not approved");
        require(ds[mydid].owner == msg.sender, "No owner");

        rs[rid] = ReceiptStruct({
            cid: _cid,
            reward: 0,
            status: 1,
            receipt: _receipt,
            owner: msg.sender
        });

        MyReceipt[msg.sender].push(rid);
        MyClaim[_cid].push(rid);
        rid += 1;    
    }

    function check(uint _rid, uint _reward, uint8 _status) public {
        uint pay = _reward * 1e18;
        uint _cid = rs[_rid].cid;

        require(cs[_cid].depo >= pay, "Not enough deposit");
        require(staff[msg.sender] >= 5 || cs[_cid].owner == msg.sender, "No authority");

        rs[_rid].reward = pay;
        rs[_rid].status = _status;
    }

    function levelup(uint _did, uint8 _status) public onlyStaff {
        ds[_did].status = _status;
    }

    function DocRegistration(string memory _url) public {
        require(butbank.getlevel(msg.sender) >= 1, "No member");

        ds[did] = Doc({
            owner: msg.sender,
            status: 1,
            did: did
        });

        License[msg.sender] = _url;
        Mydid[msg.sender] = did;
        did += 1;
    }

    function ComRegistration(string memory _name) public {
        uint pay = 10e18;

        require(butbank.getlevel(msg.sender) >= 1, "No member");
        require(bet.balanceOf(msg.sender) >= pay, "Not enough BET");

        bet.approve(msg.sender, pay); 
        uint256 allowance = bet.allowance(msg.sender, address(this));
        require(allowance >= pay, "Check the token allowance");

        bet.transferFrom(msg.sender, address(this), pay);  

        cs[cid] = Com({
            depo: pay,
            name: _name,
            owner: msg.sender
        });

        cid += 1;
        tax += pay;
    }

    function charge(uint _cid, uint _pay) public {
        uint pay = _pay * 1e18;

        require(cs[_cid].owner == msg.sender, "No owner"); 
        require(bet.balanceOf(msg.sender) >= pay, "Not enough BET");

        bet.approve(msg.sender, pay); 
        uint256 allowance = bet.allowance(msg.sender, address(this));
        require(allowance >= pay, "Check the token allowance");

        bet.transferFrom(msg.sender, address(this), pay);  

        cs[_cid].depo += pay;
        tax += pay;
        taxtransfer();
    }

    function taxtransfer() public {
        bet.transfer(bank, g1());
    }

    function withdraw(uint _rid) public {
        require(rs[_rid].owner == msg.sender, "No owner");
        require(rs[_rid].status == 2, "No OK");

        uint pay = rs[_rid].reward * 70 / 100;
        uint _cid = rs[_rid].cid;

        butbank.depoup(msg.sender, pay);
        cs[_cid].depo -= pay;
        rs[_rid].status = 4;
        myreward[msg.sender] += pay;
    }

    function comwithdraw(uint _cid, uint _pay) public {
        uint pay = _pay * 1e18;

        require(cs[_cid].owner == msg.sender, "No owner");
        require(cs[_cid].depo >= pay, "Not enough deposit");

        cs[_cid].depo -= pay;
        butbank.depoup(msg.sender, pay * 70 / 100);   
    }

    function getReceiptsByUser(address user) public view returns (uint[] memory) {
        return MyReceipt[user];
    }

    function getClaimsById(uint claimId) public view returns (uint[] memory) {
        return MyClaim[claimId];
    }

    function g1() public view virtual returns (uint256) {  
        return bet.balanceOf(address(this));
    }

    function getLicense(address _user) public view returns (string memory) {
        require(staff[msg.sender] >= 5, "No staff");
        return License[_user];
    }

    function getImage(uint _rid) public view returns (string memory) {
        address owner = cs[rs[_rid].cid].owner;
        require(owner == msg.sender, "No owner");
        return rs[_rid].receipt;
    }
}
