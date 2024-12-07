// SPDX-License-Identifier: MIT  
// ver1.0
pragma solidity >=0.7.0 <0.9.0;

interface Icya {     
  function balanceOf(address account) external view returns (uint256);
  function allowance(address owner, address spender) external view returns (uint256);
  function transfer(address recipient, uint256 amount) external returns (bool);
  function approve(address spender, uint256 amount) external returns (bool);
  function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}


contract cya_governance {
  Icya cya;
  uint256 public mid; //요청id
  uint8 public syndicate; //임원 수

  bool public Withdrawalapproval; //인출승인
  address public admin;
  address public owner; //자금집행자
  mapping (address => uint8) public staff;  //cya임원
  mapping(uint256 => Proposal) public ps;  //자금요청들


  constructor(address _cya) {
    cya = Icya(_cya);
    admin = msg.sender;
    owner = msg.sender;
    staff[msg.sender] = 1;
    syndicate = 1;
  }

  struct Proposal {
    uint256 time; //요청 날짜 
    uint8 act; //   0=인출불가 1=10%인출가능 2=20%인출가능 3=30% 4=40% 5=50% 
    uint8 tiket; // 투표수
    uint256 mid;  //요청 ID
    bool ok; //승인 상태
    string agenda;  //아젠다 링크된 블로그 주소 입력
    address[] voter;  //투표자
  }

  function request(uint8 _act,string memory _agenda) public {   // 자금 인출 요구
    require(owner == msg.sender, "no owner");
   require(_act<= 5, "Only 5 or less");
    ps[mid].act = _act;
    ps[mid].mid = mid;
    ps[mid].time =  block.timestamp;
    ps[mid].agenda =  _agenda;
    mid += 1;
  }

  function staffup(address _staff, uint8 num) public {  
    require(admin == msg.sender, "no admin"); 
    staff[_staff] = num;
    syndicate += num;
  }   

  function voting(uint _mid) public {  
    require(staff[msg.sender] >= 1, "no staff"); 
    require(isVoter(_mid, msg.sender) == false, "already voted"); 
    ps[_mid].tiket += staff[msg.sender];
    ps[_mid].voter.push(msg.sender);
    if(ps[_mid].tiket > syndicate / 2) {
      ps[_mid].ok = true;
    }
  }   
  
  function withdraw(uint _mid) public {    
    require(owner == msg.sender, "no owner");
    require(ps[_mid].ok == true, "no ok");
    uint pay = g1() * ps[_mid].act / 10;
    require(pay<= g1(), "no cya");
    cya.transfer(msg.sender, pay);
    ps[_mid].ok = false;
  }

  function g1() public view virtual returns(uint256) {  
    return cya.balanceOf(address(this));
  }

  function getlevel() public view returns(uint) {  // 유저 레벨 확인
    return staff[msg.sender];
  }  

  function isVoter(uint256 _mid, address _voter) internal view returns (bool) {
    Proposal storage proposal = ps[_mid]; // 특정 Proposal 가져오기
    for (uint256 i = 0; i < proposal.voter.length; i++) {
      if (proposal.voter[i] == _voter) {
        return true;
      }
    }
    return false;
  }
}
