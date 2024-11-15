// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;


interface Idegame {      
  function depoup(address _user,uint _depo) external; 
  function depodown(address _user,uint _depo) external;
  function g2(address user) external view  virtual returns(uint256);
  function taxup(address _user,uint _tax) external;
  function g1() external view  virtual returns(uint256);
  function totaltaxup(uint _tax) external;
}
  


contract Delotto {


    Idegame degame;
    uint public jack;
    address admin;
    uint256[] public winnum;  //당첨번호 자동 업글
    mapping(address =>my)public myinfo;

    mapping(address => uint256[]) public playerNumbers;


    event LottoResult(uint256[] winnum);
    event reward(uint amount);
     
  
    
    constructor(address _degame) public { 
  
      degame = Idegame(_degame);
      admin = msg.sender;
    }
     

     struct my{
        uint totalreward;
        uint reward;

     }
   function winup()public {
    require(admin == msg.sender,"Not eligible");
    generateWinningNumbers();
   }

 function play(uint256[] memory numbers) public {
 
    require(numbers.length == 6, "Please provide exactly 6 numbers");

    // Check if all numbers are unique
    require(!hasDuplicate(numbers), "Please provide unique numbers");

    // Check if the player has enough game money
    require(getdepo(msg.sender) >= 1e18, "Recharge your game money");

    // Check if the player has withdrawn their winnings
    require(myreward(msg.sender) <= jack * 25 / 100, "Withdraw your winnings");

    // Record the player's numbers and mark them as played
    playerNumbers[msg.sender] = numbers;
  

    // Calculate bet and tax
    uint bet = 1e18 * 80 / 100;
    uint tax = 1e18 * 20 / 100;

    // Update game contract data
    degame.taxup(msg.sender, tax * 80 / 100);
    degame.totaltaxup(tax * 20 / 100);
    degame.depodown(msg.sender, 1e18);
    jack += bet * 80 / 100;

    // Generate winning numbers and check if the player won
    generateWinningNumbers();
    bool won = checkWinningNumbers(numbers);
    emit LottoResult(winnum);
}

function hasDuplicate(uint256[] memory numbers) internal pure returns (bool) {
    for (uint256 i = 0; i < numbers.length - 1; i++) {
        for (uint256 j = i + 1; j < numbers.length; j++) {
            if (numbers[i] == numbers[j]) {
                return true; // Found duplicate
            }
        }
    }
    return false; // No duplicates found
}
    
function generateWinningNumbers() internal {
    winnum = new uint256[](6); // 크기 6의 winnum 배열 초기화
    
    uint256[] memory pool = new uint256[](45);
    for (uint256 i = 0; i < 45; i++) {
        pool[i] = i + 1;
    }
    
    uint256 randomNumber;
    uint256 index;
    
    for (uint256 i = 0; i < 6; i++) {
        // pool에서 무작위 인덱스 선택
        index = uint256(keccak256(abi.encodePacked(block.timestamp, i))) % pool.length;
        
        // pool에서 선택한 인덱스에 해당하는 숫자 가져오기
        randomNumber = pool[index];
        
        // 선택한 숫자를 pool에서 제거하기 (마지막 요소와 교환)
        pool[index] = pool[pool.length - 1];
        assembly {
            mstore(pool, sub(mload(pool), 1))
        }
        
        // 유일한 난수를 winnum 배열에 할당
        winnum[i] = randomNumber;
    }
}

function checkWinningNumbers(uint256[] memory numbers) internal returns (bool) {
    require(winnum.length == 6, "Winning numbers not yet generated");

    uint256 matches = 0;
    for (uint256 i = 0; i < 6; i++) {
        for (uint256 j = 0; j < 6; j++) {
            if (numbers[i] == winnum[j]) {
                matches++;
                break;
            }
        }
    }

    // Calculate reward amount based on matches
    uint256 rewardAmount;
    if (matches >= 2 && matches <= 4) {
        rewardAmount = 1e18 * matches; // 0.1 CYA for 1 match, 0.2 CYA for 2 matches, and so on
    } else if (matches == 5) {
        rewardAmount = jack * 5 / 100; // 5% of jackpot
    } else if (matches == 6) {
        rewardAmount = jack * 25 / 100; // 25% of jackpot
    }

    // Update player's reward and emit event
    if (matches >= 1 && matches <= 6) {
        uint pay = rewardAmount + myinfo[msg.sender].reward;
        myinfo[msg.sender].reward += pay * 2;
        emit reward(pay * 2);
        jack -= pay * 2;
    }

    return matches == 6;
}

   function withdraw( )public returns(bool){     //depo
    uint pay = myinfo[msg.sender].reward;
    require(pay >=1e16,"0.01CYA or more");   
    require(pay <= jack,"no cya");  
     

     degame.depoup(msg.sender,pay);
     myinfo[msg.sender].reward = 0;
     myinfo[msg.sender].totalreward += pay;
     generateWinningNumbers();
   
}
  

   function  myreward(address user) public view returns(uint) {
  return myinfo[msg.sender].reward;
  }  
   function  getdepo(address user) public view returns(uint) {
  return degame.g2(user);
  }  

  function  getbal() public view returns(uint) { //degame cya잔고 확인
  return degame.g1();
  }  
   
function getwinnum() public view returns (uint256[] memory) {
    return winnum;
}
 function playernum(address user) public view returns (uint256[] memory) {
    return playerNumbers[user];
}


  function deposit()external payable{
  }



}



