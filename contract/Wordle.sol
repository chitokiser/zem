// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface Ibet {      
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function transfer(address recipient, uint256 happy) external returns (bool);
    function approve(address spender, uint256 happy) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 happy) external returns (bool);
    function g1() external view returns(uint256);
}

interface Ibutbank {
    function depoup(address _user, uint _depo) external;
    function depodown(address _user, uint _depo) external;
    function getprice() external view returns (uint256);
    function getlevel(address user) external view returns (uint);
    function getmentolevel(address user) external view returns (uint);
    function g9(address user) external view returns (uint);
}

interface Igp {
    function gpup(address _user, uint _gp) external;
    function gpdown(address _user, uint _gp) external;
    function g1() external view returns (uint256);
    function g2(address user) external view returns (uint256);
}

contract Wordle {
    Igp public gp;
    Ibutbank public butbank;
    Ibet public bet;
    address public admin; 
    uint256 public wid; // 퀴즈 인덱스
    uint256 public price; // 등록 가격
    uint public maxAttempts = 5; // 최대 시도 횟수
    uint public wordLength = 6; // 단어 길이
    mapping(uint => Game) public games;
    mapping(address => uint8) public staff;
    mapping(address => mapping(uint => uint)) public tiket;
    mapping(uint => mapping(address => bool)) public correct; // 정답자
    mapping(address => mapping(uint => Attempt[5])) public attemptRecords;

    event GameStarted(address indexed player, string hint);
    event AttemptMade(address indexed player, uint attemptNumber, string feedback);
    event GameEnded(address indexed player, bool success, uint reward);

    constructor(address _bet, address _gp, address _butbank) {
        bet = Ibet(_bet);
        gp = Igp(_gp);
        butbank = Ibutbank(_butbank);
        admin = msg.sender;
        staff[msg.sender] = 10;
        price = 10*1e18;
    }

    struct Game {
        string answer;
        uint depo;
        address owner;
        uint wid;
    }

    struct Attempt {
        string word;
        string feedback;
    }
function priceup(uint8 _fee) public {
    require(staff[msg.sender] >= 1, "No staff"); // 호출자가 적어도 'staff' 권한을 가지고 있어야 함
    price = _fee * 1e18; // `_fee`를 10^18로 변환하여 `price`로 설정
}

function staffup(address _staff, uint8 _fee) public {
    require(admin == msg.sender, "no admin"); // 호출자가 관리자여야 함
    staff[_staff] = _fee; // `_staff` 주소에 `_fee` 권한을 설정
}

function withdraw(uint _wid)public {
     require(games[_wid].owner == msg.sender, "No owner");
     uint pay = games[_wid].depo * 20/100;
     butbank.depoup(msg.sender,pay);
     games[_wid].depo -= pay;
}

    function startGame(string memory _answer) public {
        require(butbank.getlevel(msg.sender) >= 1, "No membership level");
        require(bytes(_answer).length == wordLength, "Answer must be 6 letters");
        require(gp.g2(msg.sender) >= price, "Not enough game points");

        for (uint i = 0; i < bytes(_answer).length; i++) {
            require(bytes(_answer)[i] >= 0x41 && bytes(_answer)[i] <= 0x5A, "Answer must be uppercase letters");
        }

        gp.gpdown(msg.sender, price);
        games[wid] = Game(_answer, price, msg.sender, wid);
        wid++;
        emit GameStarted(msg.sender, "Game started! Guess the 6-letter word.");
    }

    function makeAttempt(string memory _word, uint _wid) public {
        Game storage game = games[_wid];
         uint pay =  game.depo *20/100;
        require(butbank.getlevel(msg.sender) >= 1, "No membership level");
        require(correct[_wid][msg.sender] == false, "Already solved");
        require(bytes(_word).length == wordLength, "Word must be 6 letters");
        require(tiket[msg.sender][_wid] < maxAttempts, "Maximum attempts reached");
        require(gp.g2(msg.sender) >= pay, "Not enough game points");

        string memory feedback = _generateFeedback(game.answer, _word);

        tiket[msg.sender][_wid] += 1; // 시도 횟수 증가
        attemptRecords[msg.sender][_wid][tiket[msg.sender][_wid] - 1] = Attempt(_word, feedback);
       
        if (keccak256(abi.encodePacked(_word)) == keccak256(abi.encodePacked(game.answer))) {
            gp.gpup(msg.sender, pay);
            game.depo -= pay;
            correct[_wid][msg.sender] = true;
            emit GameEnded(msg.sender, true, pay);
        } else if (tiket[msg.sender][_wid] == maxAttempts) {
            gp.gpdown(msg.sender, pay);
            game.depo += pay;
            butbank.depoup(game.owner, pay);
            emit GameEnded(msg.sender, false,pay);
        } else {
            emit AttemptMade(msg.sender, tiket[msg.sender][_wid], feedback);
        }
    }

    function getAttempt(uint _attemptNumber, uint _wid) external view returns (string memory word, string memory feedback) {
        require(_attemptNumber > 0 && _attemptNumber <= tiket[msg.sender][_wid], "Invalid attempt number");
        Attempt storage attempt = attemptRecords[msg.sender][_wid][_attemptNumber - 1];
        return (attempt.word, attempt.feedback);
    }

    function _generateFeedback(string memory answer, string memory attempt) private pure returns (string memory) {
        bytes memory answerBytes = bytes(answer);
        bytes memory attemptBytes = bytes(attempt);
        require(answerBytes.length == attemptBytes.length, "Lengths do not match");

        string memory feedback = new string(answerBytes.length);
        bytes memory feedbackBytes = bytes(feedback);
        bool[] memory used = new bool[](answerBytes.length);

        for (uint i = 0; i < answerBytes.length; i++) {
            if (attemptBytes[i] == answerBytes[i]) {
                feedbackBytes[i] = "G";
                used[i] = true;
            } else {
                feedbackBytes[i] = "X";
            }
        }

        for (uint i = 0; i < answerBytes.length; i++) {
            if (feedbackBytes[i] == "X") {
                for (uint j = 0; j < answerBytes.length; j++) {
                    if (!used[j] && attemptBytes[i] == answerBytes[j]) {
                        feedbackBytes[i] = "Y";
                        used[j] = true;
                        break;
                    }
                }
            }
        }

        return string(feedbackBytes);
    }
}
