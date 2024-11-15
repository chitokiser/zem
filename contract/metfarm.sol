// SPDX-License-Identifier: MIT  
//ver1.2
pragma solidity >=0.7.0 <0.9.0;
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
  

  


    interface Imutbank{      //멋뱅크
     function depoup(address _user, uint _depo) external;
    function depodown(address _user, uint _depo) external;
    function getprice() external view returns (uint256);
    function getlevel(address user) external view returns (uint);
    function g9(address user) external view returns (uint);  // 각 depo현황
    function getagent(address user) external view returns (address);
    function getmento(address user) external view returns (address);
    function expup(address _user,uint _exp) external;
  
  }  
    
 contract Metfarm {
      

      Imutbank mutbank;
      using SafeMath for uint256;
      address public admin;
      uint256 public tax; //세금
      uint256 public price; //농장가격 
      uint8 public remain; //나머지 설정 1~remain
      mapping(uint => tree) public port;   //fixnum  
      uint256 [] public pl; // fix 저장 배열 turn생성
      
      mapping(address => uint)public mygain; //나의 이익금 
      event farmnum(uint winnum); 

    constructor(address _mutb) { 
      mutbank =Imutbank(_mutb);
      admin = msg.sender;
      remain = 15;
      price = 10*1e18;

    }
    
    struct tree{
    uint256 depo;  
    uint256 depon; //portid
    uint256 portn;    //ramain값 받음
    address owner;
    uint256 start;
    }



 function seeding() public {
    uint winnum = ranmod(); // 랜덤 숫자 받기
    tree storage newport = port[winnum]; 
    require(mutbank.g9(msg.sender) >= price, "not enough point");  
    mutbank.depodown(msg.sender, price);
    pl.push(winnum);
    newport.start = block.timestamp;
    tax += price;
    emit farmnum(winnum);
    uint _rate = rate();
    
    if (newport.depo > 0) { // 기존 주인이 있으면
        uint bonus = pl.length - newport.depon; 
        uint jack = price * (bonus + _rate) / 100;
        mutbank.depoup(newport.owner, jack);  // 수금완료
        mygain[newport.owner] += jack - newport.depo;  // 이익금 누적액
        tax -= jack;
    newport.depo = price;
    newport.depon = pl.length ;
    newport.portn = winnum;
    newport.owner = msg.sender;  
    }else{
       newport.depo = price;
    newport.depon = pl.length ;
    newport.portn = winnum;
    newport.owner = msg.sender;     
    }
}


    function ranmod() internal view returns(uint256) {
        // 외부 라이브러리인 SafeMath를 사용하여 안전한 랜덤 값을 생성합니다.
        return uint256(keccak256(abi.encodePacked(block.timestamp, blockhash(block.number - 1)))) % remain + 1;
    }


 function remainup(uint8 _remain)public  {   //myport에서 가져온 portid
   require(admin ==  msg.sender,"no admin");
   remain = _remain;
  }

   function priceup(uint256 _price)public  {   //농장 가격 업그레이드
   require(admin ==  msg.sender,"no admin");
   price = _price*1e18;
  }




function rate() public view virtual returns(uint256){  
    uint256 lowerBound = price * remain * 40 / 100; // 세금 비율이 90인 경우의 하한값
    uint256 middleBound = price * remain * 75 / 100; // 세금 비율이 95인 경우의 하한값

    if (tax < lowerBound){ 
        return 90;
    }
    else if (tax >= lowerBound && tax < middleBound){ 
        // 세금 비율이 91에서 94까지의 경우
        uint256 step = (middleBound - lowerBound) / 4; // 구간을 4등분하여 계산
        return 91 + ((tax - lowerBound) / step);
    }
    else { 
        // 세금 비율이 95에서 100까지의 경우
        uint256 step = (price * remain - middleBound) / 5;
        return 95 + ((tax - middleBound) / step); // 95에서부터 계산하도록 수정
    }
}





  
   function pllength() public view returns(uint) { //누적 거래수 
  return pl.length;
  }
   function getpl(uint num) public view returns(uint) {
  return pl[num]; //portid입렵 화분 넘버 출력
  }
  function allportinfo(uint num) public view returns(uint depo,uint depon,uint portn,address owner,uint start) {  //현재 상태의 포트정보 pl에서 가져온 윈넘입력
  return (port[num].depo,
          port[num].depon,  //포트생성순서
          port[num].portn,  //포트고정값
          port[num].owner,
          port[num].start);
  }  




 function getperiod(uint num) public view returns(uint) { //누적 상금액   
  require(port[num].start >1,"empty") ;
  return  block.timestamp - port[num].start;
  }  
 
  function getvalue(uint num) public view returns(uint) { //현재 가치   
  return price* (pllength() - port[num].depon + 100)/100 ;
  }  



   function getmyfarm(uint num) public view returns(uint) { //내가 가지고 있는 농장개수
  require(port[num].owner == msg.sender);
  return port[num].portn;   //내 농장 번호를  DOM에 저장
  } 
   function getmygain() public view returns(uint) { //나의 이익금
  return mygain[msg.sender];   //나의 누적 이익금
  } 

     
}
  

