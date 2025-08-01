let balance = 1000;
let bets = { player: 0, banker: 0, tie: 0, ppair: 0, bpair: 0 };
let deck = [];

const balanceEl = document.getElementById('balance');
const resultEl = document.getElementById('result');
const soundBet = document.getElementById('sound-bet');
const soundWin = document.getElementById('sound-win');
const soundLose = document.getElementById('sound-lose');
const soundWind = document.getElementById('sound-wind');
const soundClick = document.getElementById('sound-click');

/* 덱 초기화 */
function initDeck() {
  const suits = ['H','D','C','S'];
  const values = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  deck = [];
  for(let d=0; d<6; d++){
    for(let s of suits){
      for(let v of values){
        deck.push({suit:s, value:v});
      }
    }
  }
  shuffle(deck);
}

/* 셔플 */
function shuffle(array) {
  for(let i=array.length-1; i>0; i--){
    const j = Math.floor(Math.random()*(i+1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/* 카드 값 계산 */
function getCardValue(card) {
  if(['J','Q','K','10'].includes(card.value)) return 0;
  if(card.value === 'A') return 1;
  return parseInt(card.value);
}

function calcTotal(hand){
  return hand.reduce((sum, card) => (sum + getCardValue(card)) % 10, 0);
}

/* 잔액 애니메이션 */
function animateBalance(newValue){
  const current = parseInt(balanceEl.textContent);
  const diff = newValue - current;
  const step = diff / 20;
  let i = 0;
  function update(){
    if(i < 20){
      balanceEl.textContent = Math.round(current + step * i);
      i++;
      requestAnimationFrame(update);
    } else {
      balanceEl.textContent = newValue;
    }
  }
  update();
}

/* 칩 스택 추가 */
function addChipToStack(area, value){
  const stack = area.querySelector('.chip-stack');
  const chipImg = document.createElement('img');
  chipImg.className = 'stack-chip';

  let chipSrc;
  if(value === 10) chipSrc = "./images/chip_10.png";
  if(value === 50) chipSrc = "./images/chip_50.png";
  if(value === 100) chipSrc = "./images/chip_100.png";
  if(value === 500) chipSrc = "./images/chip_500.png";

  chipImg.src = chipSrc;
  const count = stack.childElementCount;
  chipImg.style.bottom = `${count * 4}px`;
  stack.appendChild(chipImg);
}

/* 카드 매핑 */
function mapCard(card){
  const valueMap = { A:'ace',2:'2',3:'3',4:'4',5:'5',6:'6',7:'7',8:'8',9:'9',10:'10',J:'jack',Q:'queen',K:'king' };
  const suitMap = { H:'hearts', D:'diamonds', C:'clubs', S:'spades' };
  return `${valueMap[card.value]}_of_${suitMap[card.suit]}.png`;
}

/* 플립 카드 생성 (앞/뒤) */
function createFlippableCard(card) {
  const container = document.createElement('div');
  container.className = 'card-container';

  const inner = document.createElement('div');
  inner.className = 'card-inner';

  const front = document.createElement('img');
  front.className = 'card-front';
  front.src = `https://raw.githubusercontent.com/hayeah/playing-cards-assets/master/png/${mapCard(card)}`;
  front.style.background = '#fff'; // 흰색 배경

  const back = document.createElement('div');
  back.className = 'card-back';
  back.style.background = '#fff'; // 뒷면도 흰색 배경

  inner.appendChild(front);
  inner.appendChild(back);
  container.appendChild(inner);

  setTimeout(()=> inner.classList.add('flip'), 300); // 0.3초 후 뒤집기

  return container;
}

/* 바카라 3장 룰 */
function baccaratDrawRule(player, banker){
  let pTotal = calcTotal(player);
  let bTotal = calcTotal(banker);

  if(pTotal >= 8 || bTotal >= 8) return { player, banker };

  if(pTotal <= 5) player.push(deck.pop());
  pTotal = calcTotal(player);

  if(player.length === 2){
    if(bTotal <= 5) banker.push(deck.pop());
  } else {
    const thirdCard = getCardValue(player[2]);
    if(bTotal <= 2) banker.push(deck.pop());
    else if(bTotal === 3 && thirdCard !== 8) banker.push(deck.pop());
    else if(bTotal === 4 && [2,3,4,5,6,7].includes(thirdCard)) banker.push(deck.pop());
    else if(bTotal === 5 && [4,5,6,7].includes(thirdCard)) banker.push(deck.pop());
    else if(bTotal === 6 && [6,7].includes(thirdCard)) banker.push(deck.pop());
  }

  return { player, banker };
}

/* 승패 라벨 애니메이션 */
function showWinLabel(text) {
  const label = document.createElement('div');
  label.className = 'win-label';
  label.textContent = text;
  document.querySelector('.baccarat-container').appendChild(label);
  setTimeout(() => label.remove(), 1500);
}

/* 승패 판정 */
function checkResult(playerHand, bankerHand){
  const playerTotal = calcTotal(playerHand);
  const bankerTotal = calcTotal(bankerHand);
  let result = '';

  if(playerTotal > bankerTotal) result = 'PLAYER WIN!';
  else if(bankerTotal > playerTotal) result = 'BANKER WIN!';
  else result = 'TIE!';

  // 승패 라벨 표시
  showWinLabel(result);

  // 페어 여부
  const playerPair = (playerHand.length >= 2 && getCardValue(playerHand[0]) === getCardValue(playerHand[1]));
  const bankerPair = (bankerHand.length >= 2 && getCardValue(bankerHand[0]) === getCardValue(bankerHand[1]));

  // 배당
  if(result.includes('PLAYER')) balance += bets.player * 2;
  if(result.includes('BANKER')) balance += bets.banker * 1.95;
  if(result.includes('TIE')) balance += bets.tie * 8;
  if(playerPair) balance += bets.ppair * 11;
  if(bankerPair) balance += bets.bpair * 11;

  animateBalance(Math.floor(balance));
  resultEl.textContent = result + (playerPair ? ' + P 페어!' : '') + (bankerPair ? ' + B 페어!' : '');

  if(result.includes('WIN') || result.includes('TIE')) soundWin.play();
  else soundLose.play();

  // 초기화
  bets = { player: 0, banker: 0, tie: 0, ppair: 0, bpair: 0 };
  document.querySelectorAll('.chip-stack').forEach(stack=>stack.innerHTML = '');
}

/* Deal 버튼 */
document.getElementById('deal').addEventListener('click', ()=>{
  if(Object.values(bets).every(v=>v===0)){
    alert("베팅 후 진행하세요!");
    return;
  }

  const playerHand = [deck.pop(), deck.pop()];
  const bankerHand = [deck.pop(), deck.pop()];

  document.getElementById('player-hand').innerHTML = '';
  document.getElementById('banker-hand').innerHTML = '';

  document.getElementById('player-hand').appendChild(createFlippableCard(playerHand[0]));
  document.getElementById('banker-hand').appendChild(createFlippableCard(bankerHand[0]));
  document.getElementById('player-hand').appendChild(createFlippableCard(playerHand[1]));
  document.getElementById('banker-hand').appendChild(createFlippableCard(bankerHand[1]));

  setTimeout(()=>{
    const { player, banker } = baccaratDrawRule(playerHand, bankerHand);

    if(player.length === 3){
      document.getElementById('player-hand').appendChild(createFlippableCard(player[2]));
    }
    if(banker.length === 3){
      document.getElementById('banker-hand').appendChild(createFlippableCard(banker[2]));
    }

    setTimeout(()=>checkResult(player, banker), 2000);
  }, 1500);
});

/* 칩 클릭 */
document.querySelectorAll('.chip').forEach(chip=>{
  chip.addEventListener('click', ()=>{
    const activeBet = document.querySelector('.bet.active');
    if(!activeBet){
      alert("배팅 영역을 먼저 선택하세요!");
      return;
    }
    const value = parseInt(chip.dataset.value);
    const betKey = activeBet.id.replace('-bet','');

    if(balance >= value){
      balance -= value;
      bets[betKey] += value;
      animateBalance(balance);
      addChipToStack(activeBet, value);
      soundBet.play();
    } else {
      alert("잔액이 부족합니다!");
    }
  });
});

/* 배팅 영역 클릭 */
document.querySelectorAll('.bet').forEach(area=>{
  area.addEventListener('click', ()=>{
    soundClick.currentTime = 0;
    soundClick.play();
    document.querySelectorAll('.bet').forEach(b=>b.classList.remove('active'));
    area.classList.add('active');
  });
});

/* 리셋 */
document.getElementById('reset').addEventListener('click', ()=>{
  balance = 1000;
  bets = { player: 0, banker: 0, tie: 0, ppair: 0, bpair: 0 };
  animateBalance(balance);
  resultEl.textContent = '';
  document.getElementById('player-hand').innerHTML = '';
  document.getElementById('banker-hand').innerHTML = '';
  document.querySelectorAll('.chip-stack').forEach(stack=>stack.innerHTML = '');
  initDeck();
});

/* 초기화 */
initDeck();
