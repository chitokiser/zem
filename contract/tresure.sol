// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
 interface Ibut {      
  function balanceOf(address account) external view returns (uint256);
  function allowance(address owner, address spender) external view returns (uint256);
  function transfer(address recipient, uint256 happy) external returns (bool);
  function approve(address spender, uint256 happy) external returns (bool);
  function transferFrom(address sender, address recipient, uint256 happy) external returns (bool);
  function g1()external view returns(uint256);
  
  }

    interface Ibutbank{      //벳뱅크
    function expup(address _user, uint _exp) external;
    function depodown(address _user,uint _depo)external;
    function getprice( ) external view returns (uint256);
    function getlevel(address user) external view returns(uint);
    function getmentolevel(address user) external view returns(uint);
    function  g9(address user) external view returns(uint);  //depo현황
  }
  
contract tresure {

 
      Ibutbank butbank;
      Ibut but;  //card에 따라 but보상
      uint256 public cards; //심볼 카드 수량
      uint256 public total;  // 누적 상금액
      address public admin; 
      uint256 public qid; //퀴즈인덱스
      address public bank;  //계약이 가지고 있는 but을 보내기 위해 필요
      mapping (address => my)public myinfo;
      mapping (address => uint)public staff;
      mapping (uint => quiz)public qs;
      mapping(address => mapping(uint => bool)) public myqs;  //참여중복확인
    // 한 문제당 1회 참여 가능
      mapping(address => uint256[]) public collect; //수집한 카드
      event reward(uint amount);  //맞았을 때 이벤트
      event wrong(string message);

     constructor(address _but,address _butbank) { 

      but = Ibut(_but);
      butbank = Ibutbank(_butbank);
      admin =msg.sender;
      staff[msg.sender] = 10;
      bank = _butbank; 
      }
    
    struct my {
 
    uint256 total; //맞춘 문제 수
    uint256 point; 
    uint256 tiket;
    bool ok;
    }

   struct quiz {
    uint id;
    uint reward;  // 점수
    bytes32 answerHash;  // 정답의 해시값 저장 (사용자 비교용)
    string answerEnc;    // 암호화된 정답 (관리자만 볼 수 있음)
    string question;
}


    function buttran(uint _amount) public {  
    require(admin == msg.sender, "no admin");
    require(_amount <= g3(), "Insufficient contract balance");
    but.transfer(bank, _amount);
}

   
 function answerup(uint id, string memory _answer) public {  
    require(staff[msg.sender] >= 5, "no staff");
    qs[id].answerHash = keccak256(abi.encodePacked(_answer)); // 해시값 업데이트
    qs[id].answerEnc = _answer; // 원본 정답 업데이트
}

 function member( ) public {  
    require(getlevel(msg.sender) >= 2, "Level 2 or higher");
     require(myinfo[msg.sender].ok == false, "already gave you the ticket");
    myinfo[msg.sender].tiket = 100;
    myinfo[msg.sender].ok = true;

}
   

 
function regiquiz(uint _reward, string memory _answer,string memory _question) public {
    require(staff[msg.sender] >= 5, "no staff");
    qs[qid] = quiz({
        id: qid,
        reward: _reward,
        answerHash: keccak256(abi.encodePacked(_answer)),
        answerEnc: _answer,
        question: _question
    });
    qid += 1;
}



function withdraw() public { 
    uint mypoint = myinfo[msg.sender].point;
    require(mypoint >= 100, "Not enough point");
    require(g3() >= mypoint, "Not enough BUT token");
    myinfo[msg.sender].point = 0;
    myinfo[msg.sender].tiket += mypoint/100;
    but.transfer(msg.sender, mypoint);  // 사용자에게 지급
}


function openbox(uint _id, string memory _answer) public { 
    uint fee = qs[_id].reward;
    require (myinfo[msg.sender].tiket >= 1, "Not enough tiket");
    require(!myqs[msg.sender][_id], "Already solved this quiz");
     myinfo[msg.sender].tiket -= 1;
    if (qs[_id].answerHash == keccak256(abi.encodePacked(_answer))) {
        yes(_id, fee, msg.sender);
    } else {
        emit wrong("Lost Ticket");
    }
}


function compareStrings(string memory a, string memory b) internal pure returns (bool) {
    return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
}

 function yes(uint _id,uint fee,address user) internal {   //정답

        emit reward(fee);
        total += fee;
        myinfo[user].total += 1;
        myinfo[user].point += fee;
        collect[user].push(_id);
        butbank.expup(msg.sender,fee*100);
        myqs[user][_id] = true;
 }



function getAnswer(uint _id) public view returns (string memory) {
    require(staff[msg.sender] >= 5, "no staff"); // 관리자만 볼 수 있음
    return qs[_id].answerEnc;
}



 function  g3() public view returns(uint) { //but 잔고 확인
  return but.balanceOf(address(this));
  }  

 
 function  g6() public view returns(uint) { //bet 가격 가져오기
  return butbank.getprice();
  }  


  
    function  g9(address user) public view returns(uint) {   // 유저 depo
   return butbank.g9(user);
  }  

 function isTreasureFound(address user, uint _id) internal view returns (bool) {
    return myqs[user][_id];
}

function  getlevel(address user) public view returns(uint) {  //유저 레벨확인
  return butbank.getlevel(user);
  }  

 
  function deposit()external payable{
  }


    function checkcollect(address _address) external view returns (bool) {
    for (uint256 i = 1; i <= cards; i++) {
        if (!isNumberCollected(_address, i)) {
            return false;
        }
    }
    return true;
    }

    // 개인이 모은 번호를 반환하는 함수
    function getcollect(address _address) external view returns (uint256[] memory) {
        return collect[_address];
    }

    // 개인이 모은 번호 수를 반환하는 함수
    function getCollectedCount(address _address) external view returns (uint256) {
        return collect[_address].length;
    }


function isNumberCollected(address _address, uint256 _number) internal view returns (bool) {
    uint256[] memory collected = collect[_address];
    for (uint256 i = 0; i < collected.length; i++) {
        if (collected[i] == _number) {
            return true;
        }
    }
    return false;
}
 
}
  