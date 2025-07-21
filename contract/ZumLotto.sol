// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface Izumbank {
    function depoup(address _user, uint256 _depo) external;
    function depodown(address _user, uint256 _depo) external;
    function g9(address user) external view returns (uint256);
    function getmento(address user) external view returns(address);
}

interface Igp {
    function gpup(address, uint256) external;
    function gpdown(address, uint256) external;
    function g1() external view returns (uint256);
    function g2(address) external view returns (uint256);
}

contract ZumLotto {
    uint8 public constant NUMBERS = 5;
    uint8 public constant MAX_TRIES = 6;
    uint256 public constant ENTRY_FEE = 1e18;
    uint8 public constant RATE = 10;

    Igp public gp;
    Izumbank public zumbank;
    address public admin;
    uint256 public wid;
    uint256 public jack;

    mapping(address => uint8) public staff;
    mapping(uint256 => Game) private games; // ✅ 정답 숨김 (private)
    mapping(address => mapping(uint256 => uint8)) public tries;

    struct Game {
        uint256[5] answer;
        bool solved;
        address winner;
    }

    event GameCreated(uint256 indexed gameId);
    event GuessMade(uint256 indexed gameId, address indexed user, uint256 matched);
    event GameEnded(uint256 indexed gameId, address indexed winner, uint256 reward);

    constructor(address _gp, address _zumbank) {
        gp = Igp(_gp);
        zumbank = Izumbank(_zumbank);
        admin = msg.sender;
        staff[msg.sender] = 10;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "ADMIN");
        _;
    }

    modifier onlyStaff(uint8 lev) {
        require(staff[msg.sender] >= lev, "STAFF");
        _;
    }

    function setStaff(address who, uint8 lev) external onlyAdmin {
        staff[who] = lev;
    }

    function jackup(uint _jack) external onlyStaff(5) {
        jack = _jack * 1e18;
    }

    function createGame(uint256[] calldata _answer) external onlyStaff(10) {
        require(_answer.length == NUMBERS, "LEN!=5");
        require(validNums(_answer), "1~45 uniq");

        Game storage g = games[wid];
        for (uint i = 0; i < NUMBERS; i++) {
            g.answer[i] = _answer[i];
        }
        emit GameCreated(wid);
        wid += 1;
    }

    function guess(uint256 id, uint256[] calldata g) external {
        Game storage game = games[id];
        require(!game.solved, "SOLVED");
        require(g.length == NUMBERS, "LEN");
        require(validNums(g), "BAD NUMS");
        require(gp.g2(msg.sender) >= ENTRY_FEE, "GP<1");
        require(tries[msg.sender][id] < MAX_TRIES, "MAX 6");

        gp.gpdown(msg.sender, ENTRY_FEE);
        jack += ENTRY_FEE;
        tries[msg.sender][id] += 1;

        uint matched = countMatch(game.answer, g);

        if (matched == NUMBERS) {
            uint256 reward = jack / RATE;
            address mento = zumbank.getmento(msg.sender);

            gp.gpup(msg.sender, reward * 95 / 100);
            if (mento != address(0)) {
                gp.gpup(mento, reward * 5 / 100);
            }

            jack -= reward;
            game.solved = true;
            game.winner = msg.sender;

            emit GameEnded(id, msg.sender, reward);
        } else {
            emit GuessMade(id, msg.sender, matched);
        }
    }

    function getGameInfo(uint256 id) external view returns (bool solved, address winner) {
        Game storage g = games[id];
        return (g.solved, g.winner);
    }

    function validNums(uint256[] calldata a) internal pure returns (bool) {
        bool[46] memory seen;
        for (uint i = 0; i < a.length; ++i) {
            uint n = a[i];
            if (n == 0 || n > 45 || seen[n]) return false;
            seen[n] = true;
        }
        return true;
    }

function countMatch(uint256[5] storage ans, uint256[] calldata g) internal view returns (uint matched) {
    bool[46] memory answerMap;
    for (uint i = 0; i < NUMBERS; ++i) {
        answerMap[ans[i]] = true;
    }

    for (uint i = 0; i < NUMBERS; ++i) {
        if (g[i] >= 1 && g[i] <= 45 && answerMap[g[i]]) {
            matched++;
            answerMap[g[i]] = false; // 중복 방지
        }
    }
}


    function getmento(address user) external view returns (address) {
        return zumbank.getmento(user);
    }
}
