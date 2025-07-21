
//SPDX-License-Identifier: MIT  
//ver1.2
pragma solidity >=0.7.0 <0.9.0;

/*─────────────────── External Interfaces ───────────────────*/
interface IZUM {
    function balanceOf(address) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function transfer(address to, uint256) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256) external returns (bool);
}

interface IZUMBank {
    function depoup(address user, uint256 depo) external;
    function depodown(address user, uint256 depo) external;
    function getprice() external view returns (uint256);
    function getlevel(address user) external view returns (uint256);
    function g9(address user) external view returns (uint256);
    function getagent(address user) external view returns (address);
    function getmento(address user) external view returns (address);
    function expup(address user, uint256 exp) external;
}

interface IGP {
    function gpup(address user, uint256) external;
    function gpdown(address user, uint256) external;
    function g1() external view returns (uint256);
    function g2(address user) external view returns (uint256);
}

/*────────────────────── Main Contract ──────────────────────*/
contract PuppyZum {
    /* ───────────── State ───────────── */
    IGP       public immutable gp;
    IZUM      public immutable zum;
    IZUMBank  public immutable zumbank;
    address public immutable tbank;
    address public immutable admin;
    uint256 public fee   = 10*1e18;   // 기본 생성비용(GP) 1e19 → 10e18 로 가독성 개선
    uint8   public bt   ;         // 품종 수(1-30)

    uint256 public pid;                // 강아지 전역 ID

    mapping(address => uint8)  public staff;    // 권한 등급
    mapping(address => uint8)  public myPuppy;  // 유저->소유 품종(0이면 없음)
    mapping(address => uint)  public myPuppyid;  // 유저->breed
    mapping(uint256 => Puppy)  public puppys;   // Puppy breed
    mapping(uint256 => my)  public myinfo;   // 나의 스킬
    /* ───────────── Struct ───────────── */
        struct my {
   uint16 intell;
    uint16 courage;
    uint16 strength;
    uint16 agility;
    uint16 endurance;
    uint16 flexibility;
    }
    
    
    struct Puppy {
        uint8  breed;      // 1-30
        string name;
        bool    forSale;
        uint256 price;
        uint256 totalGP;
        uint256 battleExp;
        address owner;
    }

  

    /* ───────────── Constructor ───────────── */
    constructor(address _zum, address _zumbank, address _gp) {
        zum     = IZUM(_zum);
        zumbank = IZUMBank(_zumbank);
        gp      = IGP(_gp);
        tbank   = _zumbank;
        admin = msg.sender;
        staff[msg.sender] = 10; // 최고등급
        bt = 60;
    }

    /*────────────────────── Core Logic ──────────────────────*/
/** @notice 강아지 최초 구매(생성) */
function buyPuppy(string calldata _name) external {
    require(bytes(_name).length != 0, "name empty");
    require(myPuppy[msg.sender] == 0,  "already owns");
    require(gp.g2(msg.sender)  >= fee, "insufficient GP");

    
    uint8 breed = ran1();
    puppys[pid] = Puppy({
        breed:       breed,
        name:        _name,
        owner:       msg.sender,
        battleExp:  0,
        totalGP:    0,
        price:      fee,
        forSale:   false
    });
       
    
    PurchaseReward(msg.sender,breed);
}

  function PurchaseReward(address user,uint8 _breed)internal{
    gp.gpdown(user, fee);
    myPuppy[user] = _breed;
    myPuppyid[user] = pid;
    /*────────── 6. 멘토 보상 & 경험치 ──────────*/
    address mentor = zumbank.getmento(msg.sender);
    if (mentor != address(0)) {
        zumbank.depoup(mentor, (fee * 10) / 100);   // 10 % 멘토 보상
    }
    zumbank.expup(msg.sender, fee / 1e16);          // 경험치 기여i
     pid += 1; 

  }

   function sellpuppy(uint256 _pid,uint _price) external {
        require(puppys[_pid].owner == msg.sender, "not owner");
        require(puppys[_pid].forSale == false, "already applied for sale");
        puppys[_pid].forSale = true;
        puppys[_pid].price = _price;
        
    }
  
   function forsale(uint256 _pid ) external {
         require(puppys[_pid].forSale == true, "This puppy is not for sale.");
        require(puppys[_pid].price <= gp.g2(msg.sender), "You don't have enough game points.");
         address user = puppys[_pid].owner ;
        gp.gpup(user,puppys[_pid].price );
        gp.gpdown(msg.sender,puppys[_pid].price );
        myPuppy[user] = 0;
        myPuppyid[user] = 0;
        puppys[_pid].owner = msg.sender;
    }

    function rename(uint256 _pid, string calldata _newName) external {
        require(bytes(_newName).length > 0, "name empty");
        require(puppys[_pid].owner == msg.sender, "not owner");
        require(gp.g2(msg.sender) >= 1, "GP<1");
        gp.gpdown(msg.sender, 1 ether);
        puppys[_pid].name = _newName;
    }


    function boostIntell(uint256 _pid) external {
        require(puppys[_pid].owner == msg.sender, "not owner");
        require(zum.balanceOf(msg.sender) >= 10, "zum is not enough");
        zum.approve(msg.sender,10); 
       uint256 allowance = zum.allowance(msg.sender, address(this));
       require(allowance >= 10, "Check the token allowance");
        zum.transferFrom(msg.sender, address(this), 10); 
        myinfo[_pid].intell += ran2();
    }


    function boostCourage(uint256 _pid) external {
      require(puppys[_pid].owner == msg.sender, "not owner");
        require(zum.balanceOf(msg.sender) >= 10, "zum is not enough");
        zum.approve(msg.sender,10); 
    uint256 allowance = zum.allowance(msg.sender, address(this));
    require(allowance >= 10, "Check the token allowance");
    zum.transferFrom(msg.sender, address(this), 10); 
    myinfo[_pid].courage += ran2();
    }

    function boostStrength(uint256 _pid) external {
       require(puppys[_pid].owner == msg.sender, "not owner");
        require(zum.balanceOf(msg.sender) >= 10, "zum is not enough");
        zum.approve(msg.sender,10); 
    uint256 allowance = zum.allowance(msg.sender, address(this));
    require(allowance >= 10, "Check the token allowance");
    zum.transferFrom(msg.sender, address(this), 10); 
    myinfo[_pid].strength += ran2();
                      
    }

    function boostAgility(uint256 _pid) external {
        require(puppys[_pid].owner == msg.sender, "not owner");
        require(zum.balanceOf(msg.sender) >= 10, "zum is not enough");
        zum.approve(msg.sender,10); 
    uint256 allowance = zum.allowance(msg.sender, address(this));
    require(allowance >= 10, "Check the token allowance");
    zum.transferFrom(msg.sender, address(this), 10); 
    myinfo[_pid].agility+= ran2();
    }

    function boostEndurance(uint256 _pid) external {
        require(puppys[_pid].owner == msg.sender, "not owner");
        require(zum.balanceOf(msg.sender) >= 10, "zum is not enough");
        zum.approve(msg.sender,10); 
    uint256 allowance = zum.allowance(msg.sender, address(this));
    require(allowance >= 10, "Check the token allowance");
    zum.transferFrom(msg.sender, address(this), 10); 
    myinfo[_pid].endurance += ran2();
    }

    function boostFlexibility(uint256 _pid) external {
       require(puppys[_pid].owner == msg.sender, "not owner");
        require(zum.balanceOf(msg.sender) >= 10, "zum is not enough");
        zum.approve(msg.sender,10); 
    uint256 allowance = zum.allowance(msg.sender, address(this));
    require(allowance >= 10, "Check the token allowance");
    zum.transferFrom(msg.sender, address(this), 10); 
    myinfo[_pid].flexibility += ran2();
    }

    /*──────────────── Admin ────────────────*/
       
    function setStaff(address _staff,uint8 level) external {
        require(staff[msg.sender] >= 10, "staff only");
        staff[_staff] = level;
    }
    function setFee(uint256 newFee) external {
        require(staff[msg.sender] >= 5, "staff only");
        fee = newFee;
    }
   
    
    function setBt(uint8 newBt) external {
        require(staff[msg.sender] >= 5, "staff only");
        bt = newBt;
    }

     function transZum(uint _amount) external {
        require(staff[msg.sender] >= 5, "staff only");
        require(g1() >= _amount, "zum is not enough");
        zum.transfer(tbank,_amount);
    }

    function ran1() internal view returns (uint8) {
    uint256 rand = uint256(
        keccak256(
            abi.encodePacked(block.prevrandao, block.timestamp, msg.sender)
        )
    );
    return uint8(rand % bt + 1); // 1-bt
}


    function ran2() internal view returns (uint16) {
    uint256 rand = uint256(
        keccak256(
            abi.encodePacked(block.prevrandao, block.timestamp, msg.sender)
        )
    );
    return uint8(rand % 100 + 1); // 1-100
}

    function geti(uint _pid)public view returns (uint16){
    
    return myinfo[_pid].intell;
    }

      function getc(uint _pid)public view returns (uint16){

    return myinfo[_pid].courage;
    }

     function gets(uint _pid)public view returns (uint16){
    
    return myinfo[_pid].strength;
    }

      function geta(uint _pid)public view returns (uint16){
    
    return myinfo[_pid].agility;
    }

       function gete(uint _pid)public view returns (uint16){
    
    return myinfo[_pid].endurance;
    }

        function getf(uint _pid)public view returns (uint16){
    
    return myinfo[_pid].flexibility;
    }
    
    function g1() public view virtual returns(uint256){  
    return zum.balanceOf(address(this));
  }

  
}
