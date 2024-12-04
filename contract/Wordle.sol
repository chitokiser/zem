// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
 interface Ibet {      
  function balanceOf(address account) external view returns (uint256);
  function allowance(address owner, address spender) external view returns (uint256);
  function transfer(address recipient, uint256 happy) external returns (bool);
  function approve(address spender, uint256 happy) external returns (bool);
  function transferFrom(address sender, address recipient, uint256 happy) external returns (bool);
  function g1()external view returns(uint256);
  

  }

    interface Ibutbank{      //벳뱅크
    function depoup(address _user,uint _depo)external;
    function depodown(address _user,uint _depo)external;
    function getprice( ) external view returns (uint256);
    function getlevel(address user) external view returns(uint);
    function getmentolevel(address user) external view returns(uint);
    function  g9(address user) external view returns(uint);  //depo현황
  }
  
  interface Igp {
    function gpup(address _user, uint _gp) external;
    function gpdown(address _user, uint _gp) external;
    function g1() external view returns (uint256); // contract balance
    function g2(address user) external view returns (uint256); // user balance
}

contract Wordle {

      Igp public gp;
      Ibutbank butbank;
      Ibet bet;
      address public admin; 
      uint256 public wid; //퀴즈인덱스
      uint256 public price; //등록가격
      address public bank;  //계약이 가지고 있는 bet을 보내기 위해 필요
      mapping (address => uint)public staff;
    uint public maxAttempts = 5; // 최대 시도 횟수
    uint public wordLength = 6; // 단어 길이 (고정된 길이)
    mapping(uint => Game) public games;
    mapping(address => mapping(uint =>uint)) public tiket;
    mapping(uint => mapping( address => bool)) public correct; //정답자
    mapping(address => mapping(uint => Attempt[5])) attemptRecords; // 시도 기록

    event GameStarted(address indexed player, string hint);
    event AttemptMade(address indexed player, uint attemptNumber, string feedback);
    event GameEnded(address indexed player, bool success,uint reword);
     
      constructor(address _bet, address _gp, address _butbank) {
        bet = Ibet(_bet);
        gp = Igp(_gp);
        butbank = Ibutbank(_butbank);
        admin = msg.sender;
        price = 1e18;
   
    }
   
      

    struct Game {
        string answer; // 정답 단어
        uint depo;
        address owner; //게임 게시자
        uint wid;
       
    }

    struct Attempt {
        string word; // 제출된 단어
        string feedback; // 피드백
    }

         // 금액 설정
    function priceup(uint8 _fee) public {
        require(staff[msg.sender] >= 1, "No staff");
        price = _fee*1e18;
    }
    function staffup(address _staff,uint8 _fee) public {
        require(admin == msg.sender, "no admin");
        staff[_staff] = _fee;
    }
    /// 새로운 Wordle 게임 시작
    function startGame(string memory _answer) public {
        require(butbank.getlevel(msg.sender) >=1 , "no member");
        require(bytes(_answer).length == wordLength, "Answer must be 6 letters");
        require(gp.g2(msg.sender) >= price, "Not enough game points");
          for (uint i = 0; i < bytes(_answer).length; i++) {
    bytes1 char = bytes(_answer)[i];
    require(char >= 0x41 && char <= 0x5A, "Word must contain only uppercase letters (A-Z)");
}
        gp.gpdown(msg.sender,price);
        Game storage newGame = games[wid];
        newGame.answer = _answer;
        newGame.depo = price;
        newGame.owner = msg.sender;
        newGame.wid = wid;
        wid += 1;
        emit GameStarted(msg.sender, "Game started! Guess the 6-letter word.");
    }

    function withdraw(uint _wid)public {
     require(games[_wid].depo > price, "No deposit");
     require(games[_wid].owner== msg.sender, "No owner");
     uint pay = games[_wid].depo - price;
     games[_wid].depo -= pay;
     butbank.depoup(msg.sender,pay);
    }

    /// 단어 제출
    function makeAttempt(string memory _word,uint _wid) public {
        Game storage game = games[_wid];
        require(butbank.getlevel(msg.sender) >=1 , "no member");
        require(correct[_wid][msg.sender] == false, "correct answer");
        require(bytes(_word).length == wordLength, "Word must be 6 letters");
      
        require(tiket[msg.sender][_wid]< maxAttempts, "Maximum attempts reached");
        require(game.depo >= price, "No deposit");
        require(gp.g2(msg.sender) >= price, "Not enough game points");

        // 피드백 생성
        string memory feedback = _generateFeedback(game.answer, _word);

 
       require(tiket[msg.sender][_wid] < 5, "Maximum attempts reached");
       tiket[msg.sender][_wid] += 1;
     // 현재 시도 기록 저장
      attemptRecords[msg.sender][_wid][tiket[msg.sender][_wid]] = Attempt(_word, feedback);
    
        if (keccak256(abi.encodePacked(_word)) == keccak256(abi.encodePacked(game.answer))) {
            gp.gpup(msg.sender,price);
            game.depo -= price;
            correct[_wid][msg.sender] = true;
            emit GameEnded(msg.sender, true ,price);
            
        } else if (tiket[msg.sender][_wid] == maxAttempts) {
            gp.gpdown(msg.sender,price);
            game.depo += price;
            butbank.depoup(game.owner,price);
            emit GameEnded(msg.sender, false,0);
            
        } else {
         emit AttemptMade(msg.sender,tiket[msg.sender][_wid], feedback);
        }
    }





 
    /// 특정 시도의 피드백 가져오기
    function getAttempt(uint _attemptNumber,uint _wid) external view returns (string memory word, string memory feedback) {
        Game storage game = games[_wid];
        require(_attemptNumber > 0 && _attemptNumber <= tiket[msg.sender][_wid], "Invalid attempt number");

        Attempt storage attempt = attemptRecords[msg.sender][_wid][_attemptNumber];
        return (attempt.word, attempt.feedback);
    }

 



    /// 피드백 생성
   function _generateFeedback(string memory answer, string memory attempt) private pure returns (string memory) {
    bytes memory answerBytes = bytes(answer);
    bytes memory attemptBytes = bytes(attempt);

    require(answerBytes.length == attemptBytes.length, "Word lengths do not match");

    string memory feedback = new string(answerBytes.length);
    bytes memory feedbackBytes = bytes(feedback);

    // Used array to track matched letters
    bool[] memory used = new bool[](answerBytes.length);

    for (uint i = 0; i < answerBytes.length; i++) {
        if (attemptBytes[i] == answerBytes[i]) {
            feedbackBytes[i] = "G"; // Green for correct letter and position
            used[i] = true;         // Mark as used
        } else {
            feedbackBytes[i] = "X"; // Default to blank
        }
    }

    for (uint i = 0; i < answerBytes.length; i++) {
        if (feedbackBytes[i] == "X") { // If not already matched
            for (uint j = 0; j < answerBytes.length; j++) {
                if (!used[j] && attemptBytes[i] == answerBytes[j]) {
                    feedbackBytes[i] = "Y"; // Yellow for correct letter but wrong position
                    used[j] = true;         // Mark as used
                    break;
                }
            }
        }
    }

    return string(feedbackBytes);
}
}