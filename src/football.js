document.addEventListener("DOMContentLoaded", async function () {
   
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    const signer = provider.getSigner();
    
    
    
    const metaddr = {
        metmarket: "0xec2d1835f77Fc92FDBA3EcA531c1482C970D1B07" //football
    };

    const metabi = {
        metmarket: [
            "function beting(uint _pid, uint _betmoney, uint8 _betcase) public",
            "function withdraw(uint _pid) public",
            "function pid() public view returns(uint256)",
            "function bid() public view returns(uint256)",
            "function bets(address user,uint _pid) public view returns(uint256)",
            "function getCurrentTime() public view returns (uint)",
            "function getmybet(address user, uint _pid) public view returns (uint)",
            "function ms(uint _num) public view returns (string,uint,uint8,uint,uint)",
            "function getmybet(address user, uint _pid) public view returns (uint)",
            "function getOdds(uint _pid) public view returns (uint[3] memory) ",
            "function getTotal(uint _pid) public view returns (uint[3] memory)",
            "function resultup(uint _pid,uint8 _result,uint _hs,uint _as)", 
        ]
    };  

    const meta5Contract = new ethers.Contract(metaddr.metmarket, metabi.metmarket, provider);
    const metaContract = new ethers.Contract(metaddr.metmarket, metabi.metmarket, signer);
    async function ftopSync() {
        try {
          
            const ipid = (await meta5Contract.pid()).toString();

            const ibid = (await meta5Contract.bid()).toString();

            document.getElementById("Pid").innerHTML = ipid;
            document.getElementById("Bid").innerHTML = ibid;
        } catch (error) {
       
            document.getElementById("Pid").innerHTML = "Error loading PID";
            document.getElementById("Bid").innerHTML = "Error loading BID";
        }
    }

    async function getMetaInfoByNum(contract, _num) {
        try {
            console.log(`Fetching ms data for _num: ${_num}`);
            const metaInfo = await contract.ms(_num);

            return {
                name: metaInfo[0],        // string: 이름 (
                endtime: metaInfo[1],     // uint256: 종료 시간 (타임스탬프)
                result: metaInfo[2],      // uint8: 결과 (0)
                homescore: metaInfo[3],   // uint256: 홈팀 점수
                awayscore: metaInfo[4]    // uint256: 원정팀 점수
            };
        } catch (error) {
            console.error(`Error fetching data for _num ${_num}:`, error);
            return null;
        }
    }

    async function displayMetaInfo() {
        try {
        
            const ipid = await meta5Contract.pid();  // PID 값 얻기
            console.log(`Total PIDs: ${ipid}`);
            const infoContainer = document.getElementById("metaInfoContainer");

            // PID가 0부터 ipid-1까지 데이터가 있다고 가정하고 순차적으로 가져오기
            for (let i = 0; i < ipid; i++) {
                const metaInfo = await getMetaInfoByNum(meta5Contract, i);
                if (!metaInfo) continue;  // 메타 정보가 없으면 건너뜁니다.
                const odds = await meta5Contract.getOdds(i);
                const totalBets = await meta5Contract.getTotal(i);

                const infoHtml = `
   <div class="card mb-3" id="productCard${i}">
<div class="card-body">
<h5 class="card-title">${metaInfo.name}</h5>
<p class="card-text"><strong>Match Start (GMT):</strong> ${new Date(metaInfo.endtime * 1000).toLocaleString("en-US", { timeZone: "GMT" })}</p>
<p class="card-text"><strong>Result:</strong>
${metaInfo.result === 0 ? "In Progress" :
metaInfo.result === 1 ? "Home Team Wins" :
metaInfo.result === 2 ? "Draw" : "Away win"}
</p>
<p class="card-text"><strong>Home score:</strong> ${metaInfo.homescore}</p>
<p class="card-text"><strong>Away score:</strong> ${metaInfo.awayscore}</p>
<!-- Display Odds and Total Bets -->
<p class="card-text"><strong>Odds:</strong> Home (${odds[0]/10}), Draw (${odds[2]/10}), Away (${odds[1]/10})</p>
<p class="card-text"><strong>Accumulated bet:</strong> Home (${totalBets[0]/1E18} GP), Draw (${totalBets[2]/1E18} GP), Away Team (${totalBets[1]/1e18}GP)</p>
<!-- Bet Button and Betting Form -->
<button type="button" onclick="openBetForm(${i})">Bet</button>
<div id="betFormContainer${i}" style="display: none;">
<form id="betForm${i}">
<label for="betMoney${i}">Bet Amount:</label>
<input type="number" id="betMoney${i}" min="1" required>
<label for="betCase${i}">Betting Options (0: Home Win, 1: Away Win, 2: Draw):</label>
<select id="betCase${i}">
<option value="0">Home Win</option>
<option value="1">Away team wins</option>
<option value="2">Draw</option>
</select>
<button type="button" onclick="submitBetForm(${i})">Betting completed</button>
<button type="button" onclick="closeBetForm(${i})">Close betting window</button>
</form>
</div>

<button type="button" onclick="viewMyPayout(${i})">View betting amount</button>
<button type="button" onclick="withdrawPayout(${i})">Withdraw dividends</button>
</div>

<div id="resultFormContainer${i}" style="display: none;">
<form id="resultForm${i}">
<label for="result${i}">Match result (0: Home team win, 1: Away team win, 2: Draw):</label>
<select id="result${i}">
<option value="1">Match result: Home team win</option>
<option value="2">Match result: Away team win</option>
<option value="0">Match result: Draw</option>
</select>
<label for="homeScore${i}">Home team score:</label>
<input type="number" id="homeScore${i}" required>
<label for="awayScore${i}">Away team score:</label>
<input type="number" id="awayScore${i}" required>
<button type="button" onclick="submitResultForm(${i})">Submit result</button>
<button type="button" onclick="closeResultForm(${i})">Cancel</button>
</form>
</div>
</div>
</div>`;

                // HTML을 하나씩 추가
                infoContainer.innerHTML += infoHtml;

                // 각 데이터를 순차적으로 표시 후 일정 시간 지연
                await new Promise(resolve => setTimeout(resolve, 300));  // 300ms 지연 후 다음 항목 추가
            }
        } catch (error) {
            console.error("메타 정보 표시 중 오류 발생:", error);
        }
    }

    // 배팅 폼 열기
    window.openBetForm = function(i) {
        document.getElementById(`betFormContainer${i}`).style.display = 'block';
    };

    // 배팅 폼 닫기
    window.closeBetForm = function(i) {
        document.getElementById(`betFormContainer${i}`).style.display = 'none';
    };

    // 배팅 완료 제출
    window.submitBetForm = async function(i) {
        const betMoney = document.getElementById(`betMoney${i}`).value;
        const betCase = document.getElementById(`betCase${i}`).value;

        try {
            const tx = await metaContract.beting(i, betMoney, betCase, { gasLimit: 500000 });

            console.log(`배팅 완료! 트랜잭션 해시: ${tx.hash}`);
            // 트랜잭션 완료 후 처리 로직
        } catch (e) {
            alert(e.message.replace('execution reverted: ',''));
        }
    };

    // Function to view the user's payout amount
window.viewMyPayout = async function(pid) {
    try {
        const userAddress = await signer.getAddress();
        const payoutAmount = await meta5Contract.bets(userAddress, pid);
        alert(`나의배팅금액: ${payoutAmount/1e18}GP`);
    } catch (error) {
        console.error("Error fetching my payout:", error);
        alert("배팅금액이 없습니다");
    }
};

// Function to withdraw the payout amount for the specified PID
window.withdrawPayout = async function(pid) {
    try {
        const tx = await metaContract.withdraw(pid);
        console.log(`배당금 인출 요청 성공! 트랜잭션 해시: ${tx.hash}`);
        alert(`배당금 인출 요청이 성공했습니다! 트랜잭션 해시: ${tx.hash}`);
    } catch (error) {
        console.error("Error withdrawing payout:", error);
        alert("배당금이 없습니다");
    }
};


// 결과 입력 폼 열기
window.openResultForm = function(i) {
    document.getElementById(`resultFormContainer${i}`).style.display = 'block';
};

// 결과 입력 폼 닫기
window.closeResultForm = function(i) {
    document.getElementById(`resultFormContainer${i}`).style.display = 'none';
};

// 결과 입력 완료 제출
window.submitResultForm = async function(i) {
    const result = document.getElementById(`result${i}`).value;
    const homeScore = document.getElementById(`homeScore${i}`).value;
    const awayScore = document.getElementById(`awayScore${i}`).value;

    try {
        const tx = await metaContract.resultup(i, result, homeScore, awayScore);
        console.log(`결과 입력 완료! 트랜잭션 해시: ${tx.hash}`);
        // 트랜잭션 완료 후 처리 로직
    } catch (e) {
        alert(e.message.replace('execution reverted: ',''));
    }
};


    // 데이터 로딩 함수 호출
    await ftopSync();
    await displayMetaInfo();
});
