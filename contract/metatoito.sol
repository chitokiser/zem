// SPDX-License-Identifier: MIT
// ver1.0
pragma solidity >=0.7.0 <0.9.0;

interface Icya {     
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

interface Imut {      
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function g1() external view returns(uint256);
    function getdepot(address user) external view returns(uint256);
}

interface Imutbank {  
    function depoup(address _user, uint _depo) external;
    function depodown(address _user, uint _depo) external;
    function getprice() external view returns (uint256);
    function getlevel(address user) external view returns (uint);
    function g9(address user) external view returns (uint);
    function getagent(address user) external view returns (address);
    function getmento(address user) external view returns (address);
    function expup(address _user, uint _exp) external;
}

contract Metatoito {
    Icya cya;
    Imut mut;
    Imutbank mutbank;
    uint256 public rate;
    address public bank;
    address public admin;
    uint256 public sum;
    uint256 public tax;
    address public owner;
    uint256 public price;
    mapping(address => MyInfo) public myinfo;
    mapping(address => uint) public staff;
    
    event Deposit(address indexed user, uint amount);
    event Withdraw(address indexed user, uint amount);
    event Purchase(address indexed buyer, uint256 amount, uint256 price);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Caller is not admin");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    modifier onlyStaff(uint level) {
        require(staff[msg.sender] >= level, "Insufficient staff level");
        _;
    }

    constructor(address _cya, address _mut, address _mutb) {
        cya = Icya(_cya);
        mut = Imut(_mut);
        mutbank = Imutbank(_mutb);
        bank = _mutb;
        admin = msg.sender;
        staff[msg.sender] = 10;
        rate = 50;
    }
    
    struct MyInfo {
        uint256 mydepo;
        uint256 depo;
        address[] mymenty;
        uint[] mentydepo;
    }
    
    function staffup(address _staff, uint8 num) public onlyAdmin {
        staff[_staff] = num;
    }   

    function ownerup(address _owner) public onlyStaff(5) {
        owner = _owner;
    }

    function bankup(address _bank) public onlyStaff(5) {
        bank = _bank;
    }

    function rateup(uint _rate) public onlyStaff(5) {
        rate = _rate;
    }

    function buymut(uint _num) public returns(bool) {
        uint pay = _num * price;
        require(g3() >= _num, "mut sold out");
        require(1 <= _num, "1 or more");
        require(1 <= g10(msg.sender), "no member");
        require(cya.balanceOf(msg.sender) >= pay, "no cya");
        
        // approve and transferFrom in a single step to prevent race condition
        cya.approve(address(this), pay);
        uint256 allowance = cya.allowance(msg.sender, address(this));
        require(allowance >= pay, "Check the token allowance");
        cya.transferFrom(msg.sender, address(this), pay);

        mut.transfer(msg.sender, _num);
        mutbank.expup(msg.sender, pay * 10 / 100);

        address mentor = g11(msg.sender);
        myinfo[mentor].depo += _num * 30 / 100;
        myinfo[mentor].mymenty.push(msg.sender);
        myinfo[mentor].mentydepo.push(_num * 30 / 100);

        emit Purchase(msg.sender, _num, pay);
        return true;     
    }

    function ownerwithdraw() public onlyOwner {
        uint pay = g1();
        require(pay >= 1e18, "no mut");

        tax += pay;
        cya.transfer(msg.sender, pay * rate / 100);
        cya.transfer(bank, pay * (100 - rate) / 100);

        emit Withdraw(msg.sender, pay);
    }

    function mentowithdraw() public {
        uint pay = myinfo[msg.sender].depo;
        require(pay >= 1, "Nothing to receive");

        myinfo[msg.sender].depo = 0;
        require(pay <= g3(), "no mut");

        mut.transfer(msg.sender, pay);
        myinfo[msg.sender].mydepo += pay;

        emit Withdraw(msg.sender, pay);
    }

    function g1() public view virtual returns(uint256) {
        return cya.balanceOf(address(this));
    }

    function g3() public view returns(uint) {
        return mut.balanceOf(address(this));
    }

    function g6() public view virtual returns(uint256) {
        return mut.balanceOf(address(this));
    }

    function g8(address user) public view returns(uint) {
        return mut.balanceOf(user);
    }

    function g10(address user) public view returns(uint) {
        return mutbank.getlevel(user);
    }

    function g11(address user) public view returns (address) {
        return mutbank.getmento(user);
    }

    function g12(uint256 _num) public view virtual returns(uint256) {
        return getprice() * _num;
    }

    function getmymenty() public view returns (address[] memory) {
        return myinfo[msg.sender].mymenty;
    }

    function getmentydepo() public view returns (uint[] memory) {
        return myinfo[msg.sender].mentydepo;
    }

    function getprice() public view returns (uint256) {
        return price;
    }

    function deposit() external payable {
        emit Deposit(msg.sender, msg.value);
    }
}
