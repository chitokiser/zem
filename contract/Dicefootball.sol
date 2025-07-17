// SPDX-License-Identifier: MIT  
// ver1.0
pragma solidity >=0.7.0 <0.9.0;

interface Izem {     
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

interface Izumbank {
    function depoup(address _user, uint _depo) external;
    function getlevel(address user) external view returns (uint);
    function getmento(address user) external view returns (address);
}

interface Igp {
    function gpup(address _user, uint _gp) external;
    function gpdown(address _user, uint _gp) external;
    function g1() external view returns (uint256); // contract balance
    function g2(address user) external view returns (uint256); // user balance
}

contract Dicefootball {
    Izem public zem;
    Igp public gp;
    Izumbank public zumbank;
    address public admin;
    mapping(address => uint) public staff;

    event Result(address indexed user, uint home, uint away); // added user filter
    event Reward(address user, uint amount);
    event Loss(address user, uint amount);

    constructor(address _zem, address _gp, address _zumbank) {
        zem = Izem(_zem);
        gp = Igp(_gp);
        zumbank = Izumbank(_zumbank);
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not an admin");
        _;
    }

    modifier onlyMember() {
        require(zumbank.getlevel(msg.sender) >= 1, "Not a member");
        _;
    }

    function staffUp(address _staff, uint8 num) public onlyAdmin {
        staff[_staff] = num;
    }

function play(uint8 _winnum, uint _zem) public onlyMember {
    require(1 <= _winnum && _winnum <= 3, "Invalid choice");

    uint pay = _zem * 1e18;
    require(gp.g1() >= pay * 5, "No zem in the contract");
    require(gp.g2(msg.sender) >= pay * 5, "Not enough gamepoints");

    uint home = ran1();
    uint away = ran2();
    emit Result(msg.sender, home, away); // emit with user address

    uint _loss = 0;
    uint winnings = 0;

    // Check the win/loss condition
    if (_winnum == 1 && home > away) {
        winnings = pay * (home - away); // 홈팀이 이긴 경우 점수 차이 * 배팅 금액
    } else if (_winnum == 2 && home == away) {
        winnings = pay * 350 / 100; // 350% for a draw
    } else if (_winnum == 3 && away > home) {
        winnings = pay * (away - home); // 어웨이팀이 이긴 경우 점수 차이 * 배팅 금액
    } else {
        // 패배 조건 계산
        if (_winnum == 1 && (home == away || away > home)) {
            _loss = (home == away) ? pay : pay * (away - home); // 무승부 시 전체 손실, 그렇지 않으면 점수 차이만큼 손실
        } else if (_winnum == 2 && home != away) {
            _loss = pay; // 무승부를 선택했지만 틀린 경우 전체 배팅 금액 손실
        } else if (_winnum == 3 && (home == away || home > away)) {
            _loss = (home == away) ? pay : pay * (home - away); // 무승부 시 전체 손실, 그렇지 않으면 점수 차이만큼 손실
        }
    }

    // Update user state and emit events
    if (winnings > 0) {
        gp.gpup(msg.sender, winnings);
        emit Reward(msg.sender, winnings);
    } else {
        gp.gpdown(msg.sender, _loss);
        emit Loss(msg.sender, _loss);
        address mento = zumbank.getmento(msg.sender);
        zumbank.depoup(mento, pay * 10 / 100); // 멘토에게 배팅금액의 10% 지급
    }
}




    function g1() public view returns (uint256) {
        return zem.balanceOf(address(this));
    }

    function g2(address user) public view returns (uint) {
        return zem.balanceOf(user);
    }

    function ran1() internal returns (uint) {
        return uint(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % 6 + 1;
    }

    function ran2() internal returns (uint) {
        return uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, "ran2"))) % 6 + 1;
    }

    // Fallback function to receive Ether
    receive() external payable {}
}
