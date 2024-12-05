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

interface Igp {
    function gpup(address _user, uint _gp) external;
    function gpdown(address _user, uint _gp) external;
    function g1() external view returns (uint256);
    function g2(address user) external view returns (uint256);
}

contract RelayLotto{
    Igp public gp;
    Ibutbank public butbank;
    Ibet public bet;

    address public admin;
    uint256 public price; // 게임 개설 비용
    uint256 public wid; // 게임 ID 카운터

    mapping(address => uint8) public staff;
    mapping(address => mapping(uint => uint)) public tiket;
    mapping(uint => mapping(address => bool)) public correct; // 정답자
    mapping(uint256 => Game) public games;
    mapping(address => mapping(uint => Attempt[])) private attemptRecords;

    event GameCreated(uint256 indexed gameId, address indexed creator, uint256 rewardPool);
    event GuessMade(uint256 indexed gameId, address indexed player, uint256[] guess, uint256 reward);
    event GameEnded(uint256 indexed gameId, address winner, uint256 reward);

    uint public maxAttempts = 6; // 최대 시도 횟수

    constructor(address _butbank, address _bet, address _gp) {
        bet = Ibet(_bet);
        gp = Igp(_gp);
        butbank = Ibutbank(_butbank);
        admin = msg.sender;
        staff[msg.sender] = 10;
        price = 10 * 1e18;
    }

    struct Game {
        uint256[] answer; // 정답 숫자 배열
        uint256 depo; // 상금 풀
        address owner; // 문제 생성자
    }

    struct Attempt {
        string word;
        string feedback;
    }

    function priceup(uint _fee) public {
        require(staff[msg.sender] >= 1, "No staff");
        price = _fee * 1e18;
    }

    function staffup(address _staff, uint8 _fee) public {
        require(admin == msg.sender, "No admin");
        staff[_staff] = _fee;
    }

    function withdraw(uint _wid) public {
        require(games[_wid].owner == msg.sender, "No owner");
        uint pay = games[_wid].depo;
        butbank.depoup(msg.sender, pay);
        games[_wid].depo = 0;
    }

    function createGame(uint256[] memory _answer) public {
        require(gp.g2(msg.sender) >= price, "Not enough game points");
        require(_answer.length == 5, "Must choose 5 numbers");
        require(isValidNumbers(_answer), "Numbers must be between 1 and 45");

        gp.gpdown(msg.sender, price);

        games[wid] = Game({
            answer: _answer,
            depo: price,
            owner: msg.sender
        });
        wid += 1;
        emit GameCreated(wid, msg.sender, price);
    }

   
function guess(uint256 _wid, uint256[] memory _guess) external {
    Game storage game = games[_wid];
    uint attemptNumber = tiket[msg.sender][_wid];

    // Validations
    require(!correct[_wid][msg.sender], "Already solved");
    require(_guess.length == game.answer.length, "Guess length must match the answer length");
    require(isValidNumbers(_guess), "Numbers must be between 1 and 45");
    require(gp.g2(msg.sender) >= game.depo * 5 / 100, "Not enough game points");
    require(tiket[msg.sender][_wid] < maxAttempts, "Maximum attempts reached");

    // Generate feedback
    string memory feedback = generateFeedback(game.answer, _guess);

    // Record the attempt
    attemptRecords[msg.sender][_wid].push(Attempt({
        word: uintArrayToString(_guess),
        feedback: feedback
    }));
    tiket[msg.sender][_wid] += 1;

    // Check if all guesses are correct
    if (keccak256(abi.encodePacked(feedback)) == keccak256(abi.encodePacked("GGGGG"))) {
        uint256 reward = calculateReward(game.depo, attemptNumber + 1);
        butbank.depoup(msg.sender, reward);
        game.depo -= reward;
        correct[_wid][msg.sender] = true;
        emit GameEnded(_wid, msg.sender, reward);
    } else {
        uint256 penalty = game.depo * 5 / 100;
        gp.gpdown(msg.sender, penalty);
        emit GuessMade(_wid, msg.sender, _guess, 0);
    }
}

    function getAttempt(uint _attemptNumber, uint _wid) external view returns (string memory word, string memory feedback) {
        require(_attemptNumber > 0 && _attemptNumber <= tiket[msg.sender][_wid], "Invalid attempt number");
        Attempt storage attempt = attemptRecords[msg.sender][_wid][_attemptNumber - 1];
        return (attempt.word, attempt.feedback);
    }

    function calculateReward(uint256 _rewardPool, uint256 _attemptNumber) private pure returns (uint256) {
        if (_attemptNumber == 1) return _rewardPool;
        if (_attemptNumber == 2) return _rewardPool / 2;
        if (_attemptNumber == 3) return _rewardPool / 4;
        if (_attemptNumber == 4) return _rewardPool / 5;
        if (_attemptNumber == 5) return _rewardPool / 10;
        return 0;
    }

    function isValidNumbers(uint256[] memory numbers) private pure returns (bool) {
        bool[46] memory seen;
        for (uint256 i = 0; i < numbers.length; i++) {
            uint256 num = numbers[i];
            if (num < 1 || num > 45 || seen[num]) {
                return false;
            }
            seen[num] = true;
        }
        return true;
    }

    function uintArrayToString(uint256[] memory arr) private pure returns (string memory) {
        bytes memory strBytes;
        for (uint256 i = 0; i < arr.length; i++) {
            strBytes = abi.encodePacked(strBytes, uintToString(arr[i]), ",");
        }
        return string(strBytes);
    }

    function uintToString(uint256 _num) private pure returns (string memory) {
        if (_num == 0) return "0";
        uint256 temp = _num;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (_num != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(_num % 10)));
            _num /= 10;
        }
        return string(buffer);
    }

    function generateFeedback(uint256[] memory answer, uint256[] memory attempt) private pure returns (string memory) {
        require(answer.length == attempt.length, "Lengths do not match");

        string memory feedback = new string(answer.length);
        bytes memory feedbackBytes = bytes(feedback);
        bool[] memory used = new bool[](answer.length);

        for (uint i = 0; i < answer.length; i++) {
            if (attempt[i] == answer[i]) {
                feedbackBytes[i] = "G";
                used[i] = true;
            } else {
                feedbackBytes[i] = "X";
            }
        }

        for (uint i = 0; i < answer.length; i++) {
            if (feedbackBytes[i] == "X") {
                for (uint j = 0; j < answer.length; j++) {
                    if (!used[j] && attempt[i] == answer[j]) {
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
