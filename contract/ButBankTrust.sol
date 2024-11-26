// SPDX-License-Identifier: MIT
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
    function g9(address user) external view returns (uint);
    function getmento(address user) external view returns (address);
    function expup(address _user, uint _exp) external;
}

contract ButBankTrust {
    Ibutbank public butbank;
    Ibet public bet;

    address public admin;
    address public taxbank;
    uint256 public taxtotal; 
    uint256 public mid; 
    uint256 public profit;  //멘토수당
    mapping(address => uint8) public staff; 
    mapping(uint256 => Man) public men; 
    mapping(address => uint256) public myMid; 

    
    struct Man {
        uint256 depo;
        uint256 time;
        address owner;
        mapping(address => uint256)pay; //내가 지정한 수혜자  수혜금액
        mapping(address => uint256)paytime; //인출 가능 시간
    }

    constructor(address _butbank, address _bet) {
        butbank = Ibutbank(_butbank);
        bet = Ibet(_bet);
        taxbank = _butbank;
        admin = msg.sender;
        staff[msg.sender] = 5;
        profit = 10; 
    }

    function manAdd(uint _pay) public {
        uint256 pay = _pay*1e18;
        require(bet.balanceOf(msg.sender) >= pay, "Not enough BET");
        require(butbank.getlevel(msg.sender) >= 2, "Level 2 or higher required");
        require(myMid[msg.sender] == 0, "Already registered");

        bet.approve(address(this), pay);
        uint256 allowance = bet.allowance(msg.sender, address(this));
        require(allowance >= pay, "Check the token allowance");
        bet.transferFrom(msg.sender, address(this), pay);

        men[mid].depo = pay;
        men[mid].time = block.timestamp;
        men[mid].owner = msg.sender;
    

        myMid[msg.sender] = mid;
        mid += 1;

        address mentor = butbank.getmento(msg.sender);
        if (mentor != address(0)) {
            butbank.depoup(mentor, pay * profit / 100);
        }


    }




function designateSpender(address _spender, uint256 _amount) public {
    require(_spender != address(0), "Invalid spender address");
    require(butbank.getlevel(_spender) >= 2, "Level 2 or higher required");
    require(_amount > 0, "Amount must be greater than zero");

    // Get the caller's Man ID
    uint256 _mid = myMid[msg.sender];
    require(_mid != 0, "User not registered"); // Ensure the caller is registered

    Man storage user = men[_mid];
    require(user.owner == msg.sender, "Not the owner of this account"); // Ensure the caller is the owner

    // Set the spender and their spending limit
    user.pay[_spender] = _amount;
    user.paytime[_spender] = block.timestamp;
}

  function removeSpender(address _spender) public {
        // Get the caller's Man ID
        uint256 _mid = myMid[msg.sender];
        require(_mid != 0, "User not registered"); // Ensure the caller is registered

        Man storage user = men[_mid];
        require(user.owner == msg.sender, "Not the owner of this account"); // Ensure the caller is the owner

        // Remove the spender and reset their allowance to 0
        user.pay[_spender] = 0;
        user.paytime[_spender] = 0;

     
    }
    
function withdraw() public {
    // Ensure the caller is a designated beneficiary
    uint256 depositorMid = myMid[msg.sender];
    require(depositorMid != 0, "Caller is not a registered depositor");

    Man storage depositor = men[depositorMid];

    // Ensure the caller has been designated as a spender
    uint256 allowedAmount = depositor.pay[msg.sender];
    require(allowedAmount > 0, "No allowance for withdrawal");
     require(depositor.depo >= allowedAmount, "Insufficient balance for withdrawal");
    // Enforce cooldown period
    uint256 nextAvailableTime = depositor.paytime[msg.sender] + 7 days;
    require(block.timestamp >= nextAvailableTime, "Withdrawal not available yet");

    // Calculate the withdrawal amount
    uint256 withdrawAmount = allowedAmount; // Can be adjusted for partial withdrawals if needed

    // Update the cooldown time
    depositor.paytime[msg.sender] = block.timestamp;

    // Send the withdrawal amount to the beneficiary
    butbank.depoup(msg.sender, withdrawAmount);

    // Reward the mentor if applicable
    address mentor = butbank.getmento(msg.sender);
    if (mentor != address(0)) {
        uint256 mentorReward = (withdrawAmount * profit) / 100; // e.g., 10% reward
        butbank.depoup(mentor, mentorReward);
    }

}


function charge(uint256 pay) public {
    uint  _amount = pay * 1e18;
    require(_amount > 0, "Amount must be greater than zero");
    require(bet.balanceOf(msg.sender) >= _amount, "Insufficient BET balance");
    
    uint256 allowance = bet.allowance(msg.sender, address(this));
    require(allowance >= _amount, "Check the token allowance");
    
    // Transfer BET tokens from user to the contract
    bet.transferFrom(msg.sender, address(this), _amount);
    
    // Update user's depo balance
    uint256 userMid = myMid[msg.sender];
    require(userMid != 0, "User not registered"); // Ensure user is registered

    Man storage user = men[userMid];
    user.depo += _amount;
    taxtansfer();
}


  function taxtansfer()public {
    taxtotal += g1();
    bet.transfer(taxbank,g1());
  }

 function staffup(address user,uint8 _num)public {
    require(admin == msg.sender, "no admin");
    staff[user] = _num;
  }


 

 function profitup(uint _profit)public {
    require(staff[msg.sender] >= 1, "no staff");
    profit = _profit;
  }


    function getMento(address user) public view returns (address) {
        return butbank.getmento(user);
    }

    function getLevel(address user) public view returns (uint256) {
        return butbank.getlevel(user);
    }

  


      function getMid(address user) public view virtual returns(uint256) {  
    return myMid[user];
}

  

 function g1() public view virtual returns(uint256) {  
    return bet.balanceOf(address(this));
}

 function g2() public view virtual returns(uint256) {  
    return myMid[msg.sender];
}

   function getPay(uint256 _mid) public view returns (uint256) {

        require(men[_mid].owner != address(0), "Man not found");
        return men[_mid].pay[msg.sender];
    }

     function getPayTime(uint256 _mid) public view returns (uint256) {

        require(men[_mid].owner != address(0), "Man not found");
        return men[_mid].paytime[msg.sender];
    }

}
