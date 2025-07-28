(async () => {
    'use strict';

    // ====== 스마트컨트랙트 설정 ======
    const contractAddress = {
      cyacoopAddr: "0x8EBAA1f6fBb4197e83f88238e7386cB3A37bE355" // ZUMbank
    };
    const contractAbi = {
      cyacoop: [
        "function g5(uint256 _num) public view returns(uint256)"
      ]
    };

    const provider = new ethers.providers.JsonRpcProvider(
      'https://opbnb-mainnet.nodereal.io/v1/64a9df0874fb4a93b9d0a3849de012d3'
    );
    const cyacoopContract = new ethers.Contract(
      contractAddress.cyacoopAddr,
      contractAbi.cyacoop,
      provider
    );

    // ====== 상태 변수 ======
    let i = 0;          // 데이터 인덱스
    let j = 4;          // OHLC 4틱 카운터
    let k = 0;          // 캔들 번호
    let chartData = []; // 캔들 데이터 저장

    // ====== 캔들 데이터 로드 함수 ======
    async function loadCandleData() {
      try {
        while (true) {
          const rawClose = await cyacoopContract.g5(i);
          const close = parseFloat(ethers.utils.formatUnits(rawClose, 18)); // 숫자 유지

          if (j === 4) {
            // 새로운 캔들 시작
            j = 0;
            k++;
            chartData.push({
              x: k,
              y: [close, close, close, close] // [open, high, low, close]
            });
          } else {
            // 기존 캔들 업데이트
            const candle = chartData[k - 1].y;

            if (close > candle[1]) candle[1] = close; // high
            if (close < candle[2]) candle[2] = close; // low
            if (j === 3) candle[3] = close;           // close
          }

          i++;
          j++;
        }
      } catch (e) {
        // 데이터 없을 때 종료
        document.getElementById("calD").innerHTML = "Loaded candles: " + i;
      }
    }

    // ====== 차트 초기화 ======
    var options = {
      series: [{ data: chartData }],
      chart: {
        type: 'candlestick',
        height: 380,
        width: '100%'
      },
      xaxis: {
        type: 'numeric'
      },
      yaxis: {
        tooltip: { enabled: true }
      }
    };

    var chart = new ApexCharts(document.getElementById("myChart"), options);
    chart.render();

    // ====== 최초 데이터 로드 후 렌더링 ======
    await loadCandleData();
    chart.updateSeries([{ data: chartData }]);

    // ====== 자동 업데이트 (10초마다 갱신) ======
    setInterval(async () => {
      await loadCandleData();                     // 새 데이터 불러오기
      chart.updateSeries([{ data: chartData }]);  // 차트 갱신
    }, 10000);

  })();