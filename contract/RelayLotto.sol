// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;



interface Igp {
    function gpup(address, uint256) external;
    function gpdown(address, uint256) external;
    function g1() external view returns (uint256);
    function g2(address) external view returns (uint256);
}

/*─────────────────── 메인 컨트랙트 ───────────────────*/
contract RelayLotto {
    /*――――― 상수 & 저장소 ―――――*/
    uint8   public constant NUMBERS   = 5;          // 정답 길이
    uint8   public constant MAX_TRIES = 6;          // 시도 제한
    uint256 public constant ENTRY_FEE = 1e18;       // 1 GP
    uint8   public constant RATE      = 10;         // 잭팟/10 지급

    Igp      public gp;
   
    address  public admin;
    uint256  public wid;          // 다음 게임 ID
    uint256  public jack;         // 잭팟(GP)

    mapping(address => uint8)                    public staff;   // 스태프 등급
    mapping(uint256 => Game)                    public games;   // 게임 ID → 게임
    mapping(address => mapping(uint256 => uint8)) public tries;  // 시도 횟수
    mapping(address => mapping(uint256 => Attempt[]))
              private attemptBook;                              // 시도 기록

    /*――――― 자료구조 ―――――*/
    struct Game {
        uint256[] answer;   // 정답 숫자 배열
        bool      solved;   // 해결 여부
        address   winner;   // 당첨자
    }
    struct Attempt {
        string  word;
        string  fb;
    }

    /*――――― 이벤트 ―――――*/
    event GameCreated(uint256 indexed gameId);
    event GuessMade (uint256 indexed gameId, address indexed user, uint256[] guess, string fb);
    event GameEnded (uint256 indexed gameId, address indexed winner, uint256 reward);

    /*――――― 생성자 ―――――*/
    constructor( address _gp) {

        gp             = Igp(_gp);

        admin          = msg.sender;
        staff[msg.sender] = 10; // 배포자 최고등급
    }

    /*───────────────── 접근제어 ─────────────────*/
    modifier onlyAdmin()          { require(msg.sender == admin, "ADMIN"); _; }
    modifier onlyStaff(uint8 lev) { require(staff[msg.sender] >= lev, "STAFF"); _; }

    function setStaff(address who, uint8 lev) external onlyAdmin {
        staff[who] = lev;
    }

    /*───────────────── 게임 생성 ─────────────────*/
    function createGame(uint256[] calldata _answer) external onlyStaff(5) {
        require(_answer.length == NUMBERS, "LEN!=5");
        require(validNums(_answer),        "1~45 uniq");

        games[wid].answer = _answer;
        emit GameCreated(wid);
        wid += 1;
    }

        /*───────────────── Jackup ─────────────────*/
    function jackup(uint _jack) external onlyStaff(5) {
      jack = _jack*1e18;
    }

    /*───────────────── 추측(참가) ─────────────────*/
    function guess(uint256 id, uint256[] calldata g) external {
        Game storage game = games[id];
        require(!game.solved,                  "SOLVED");
        require(g.length == NUMBERS,           "LEN");
        require(validNums(g),                  "BAD NUMS");
        require(gp.g2(msg.sender) >= ENTRY_FEE,"GP<1");
        require(tries[msg.sender][id] < MAX_TRIES, "MAX 6");

        /* 참가비 차감 & 잭팟 적립 */
        gp.gpdown(msg.sender, ENTRY_FEE);
        jack += ENTRY_FEE;
        tries[msg.sender][id] += 1;

        /* 피드백 생성 & 기록 */
        string memory fb = feedback(game.answer, g);
        attemptBook[msg.sender][id].push(Attempt({
            word: arrToStr(g),
            fb:   fb
        }));

        /* 정답 여부 */
        if (keccak256(bytes(fb)) == keccak256(bytes("GGGGG"))) {
            uint256 reward = jack / RATE;
            gp.gpup(msg.sender, reward);
            jack          -= reward;
            game.solved    = true;
            game.winner    = msg.sender;

            emit GameEnded(id, msg.sender, reward);
        } else {
            emit GuessMade(id, msg.sender, g, fb);
        }
    }

    /*───────────────── 기록 조회 ─────────────────*/
    function attemptsOf(address user, uint256 id)
        external view returns (Attempt[] memory)
    {   return attemptBook[user][id]; }

    /*───────────────── 내부 헬퍼 ─────────────────*/
    function validNums(uint256[] calldata a) internal pure returns (bool) {
        bool[46] memory seen;
        for (uint i; i < a.length; ++i) {
            uint n = a[i];
            if (n == 0 || n > 45 || seen[n]) return false;
            seen[n] = true;
        }
        return true;
    }

    function arrToStr(uint256[] calldata a) internal pure returns (string memory) {
        bytes memory out;
        for (uint i; i < a.length; ++i)
            out = abi.encodePacked(out, uintToStr(a[i]), i == a.length-1 ? "" : ",");
        return string(out);
    }

    function uintToStr(uint n) internal pure returns (string memory) {
        if (n == 0) return "0";
        uint len; uint x = n;
        while (x != 0) { len++; x /= 10; }
        bytes memory b = new bytes(len);
        while (n != 0) { b[--len] = bytes1(uint8(48 + n % 10)); n /= 10; }
        return string(b);
    }

    function feedback(uint256[] storage ans, uint256[] calldata at)
        internal view returns (string memory)
    {
        bytes memory fb = new bytes(NUMBERS);
        bool[NUMBERS] memory used;

        /* 1) 자리 & 숫자 일치 = G */
        for (uint i; i < NUMBERS; ++i) {
            if (at[i] == ans[i]) {
                fb[i] = bytes1("G");
                used[i] = true;
            } else {
                fb[i] = bytes1("X");
            }
        }
        /* 2) 숫자만 포함 = Y */
        for (uint i; i < NUMBERS; ++i) if (fb[i] == bytes1("X")) {
            for (uint j; j < NUMBERS; ++j)
                if (!used[j] && at[i] == ans[j]) {
                    fb[i] = bytes1("Y");
                    used[j] = true;
                    break;
                }
        }
        return string(fb); // 예: "GXYYX"
    }
}
