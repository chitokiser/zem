document.addEventListener("DOMContentLoaded", function () {
    let receiptaddr = {
        receipt: "0x395B2B2BBfCa4E9f92bCa0cE118EdDC7E7B1F3A6" //receipt
    };
    
    let receiptabi = {
        receipt: [
            "function claim(uint _cid, string memory _receipt) public",
            "function  check(uint _rid,uint _reward,uint8 _status) public",
            "function  DocRegistration() public",
            "function  ComRegistration(string memory _name) public",
            "function  charge(uint cid,uint _pay) public",
            "function withdraw(uint _rid) public ",
            "function comwithdraw(uint _cid,uint _pay) public",
            "function g1() public view virtual returns(uint256)",
            "function getReceiptsByUser(address user) public view returns (uint[] memory) ",
            "function getClaimsById(uint claimId) public view returns (uint[] memory)",
            "function rs(uint _num) public view returns (uint,uint,uint,string memory,address)",
            "function cs(uint _num) public view returns (uint,string memory,address)",
            "function ds(uint _num) public view returns (address,uint8,uint)",
            "function did() public view virtual returns(uint256)",
            "function cid() public view virtual returns(uint256)",
            "function rid() public view virtual returns(uint256)",
            "function tax() public view virtual returns(uint256)",
        ],
    };

    let RtopSync = async () => {  
        let provider = new ethers.providers.JsonRpcProvider('https://opbnb-mainnet-rpc.bnbchain.org');
        let receiptContract = new ethers.Contract(receiptaddr.receipt, receiptabi.receipt, provider);
        
        let idid = await receiptContract.did();  // 전체 닥터
        let icid = await receiptContract.cid();  // 전체 제약사
        let irid = await receiptContract.rid();  // 전체 청구서
        let ibal = await receiptContract.g1();   //계약잔고
        let itax = await receiptContract.tax();   //누적매출

        document.getElementById("Did").innerHTML = idid;
        document.getElementById("Cid").innerHTML = icid;
        document.getElementById("Rid").innerHTML = irid;
        document.getElementById("Betbal").innerHTML =  parseFloat(ibal/ 1e18).toFixed(2);
        document.getElementById("Tax").innerHTML =  parseFloat(itax/ 1e18).toFixed(2);
    };
    RtopSync();


   
    async function displayCompanies() {
        try {
            let provider = new ethers.providers.JsonRpcProvider('https://opbnb-mainnet-rpc.bnbchain.org');
            let receiptContract = new ethers.Contract(receiptaddr.receipt, receiptabi.receipt, provider);

            // Get the total number of companies (cid value)
            const totalCid = await receiptContract.cid();

            // Table header
            let tableHtml = `
                <table border="1" style="width: 100%; text-align: left;">
                    <thead>
                        <tr>
                            <th>CompanyID</th>
                            <th>Company Name</th>
                            <th>Deposit</th>
                            <th>Owner Address</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            // Loop through all `cid` values and fetch company details
            for (let i = 0; i < totalCid; i++) {
                const company = await receiptContract.cs(i);
                const truncatedAddress = `${company[2].slice(0, 10)}...`; // Truncate the address

                // Append each company data as a table row
                tableHtml += `
                    <tr>
                        <td>${i}</td>
                        <td>${company[1]}</td>
                        <td>${(company[0] / 1e18).toFixed(2)} BET</td>
                  
                        <td>${truncatedAddress}</td>
                        <td>
                            <input type="text" id="receiptInput_${i}" placeholder="Enter Receipt URL" style="width: 150px; margin-right: 5px;">
                            <button onclick="claimReceipt(${i})">Claim</button>
                        </td>
                    </tr>
                `;
            }

            // Close table
            tableHtml += `
                    </tbody>
                </table>
            `;

            // Display table in the HTML container
            document.getElementById("companyTableContainer").innerHTML = tableHtml;
        } catch (error) {
            console.error("Error fetching company data:", error);
            alert("Failed to load company data. Check console for details.");
        }
    }

    async function displayReceipts() {
        try {
            let provider = new ethers.providers.JsonRpcProvider('https://opbnb-mainnet-rpc.bnbchain.org');
            let receiptContract = new ethers.Contract(receiptaddr.receipt, receiptabi.receipt, provider);
    
            // Get the total number of receipts (rid value)
            const totalRid = await receiptContract.rid();
    
            // Table header
            let tableHtml = `
                <table border="1" style="width: 100%; text-align: left;">
                    <thead>
                        <tr>
                            <th>ReceiptID</th>
                            <th>CompanyID</th>
                            <th>Reward</th>
                            <th>Status</th>
                            <th>Receipt URL</th>
                            <th>Owner Address</th>
                            <th>Verify</th>
                            <th>Withdraw</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
    
            // Loop through all `rid` values and fetch receipt details
            for (let i = 0; i < totalRid; i++) {
                const receipt = await receiptContract.rs(i);
                const truncatedAddress = `${receipt[4].slice(0, 10)}...`; // Truncate the address
    
                // Map status codes to their corresponding descriptions
                let statusDescription = "";
                const statusCode = Number(receipt[2]); // Convert to number
    
                switch (statusCode) {
                    case 1:
                        statusDescription = "Claimed";
                        break;
                    case 2:
                        statusDescription = "Approved";
                        break;
                    case 3:
                        statusDescription = "Rejected";
                        break;
                    case 4:
                        statusDescription = "Withdrawed";
                        break;
                    default:
                        statusDescription = "Before approval";
                }
    
                // Append each receipt data as a table row
                tableHtml += `
                    <tr>
                        <td>${i}</td>
                        <td>${receipt[0]}</td>
                        <td>${(receipt[1] / 1e18 * 70 / 100).toFixed(2)} BET</td>
                        <td>${statusDescription}</td>
                        <td><a href="${receipt[3]}" target="_blank">View</a></td>
                        <td>${truncatedAddress}</td>
                        <td>
                            <input type="text" id="rewardInput_${i}" placeholder="Enter Reward" style="width: 100px; margin-right: 5px;">
                            <select id="statusSelect_${i}" style="margin-right: 5px;">
                                <option value="">Select Status</option>
                                <option value="2">Approved</option>
                                <option value="3">Rejected</option>
                            </select>
                            <button onclick="checkReceipt(${i})">Check</button>
                        </td>
                        <td>
                            <button onclick="withdrawReceipt(${i})">Withdraw</button>
                        </td>
                    </tr>
                `;
            }
    
            // Close table
            tableHtml += `
                    </tbody>
                </table>
            `;
    
            // Display table in the HTML container
            document.getElementById("receiptTableContainer").innerHTML = tableHtml;
        } catch (error) {
            console.error("Error fetching receipt data:", error);
            alert("Failed to load receipt data. Check console for details.");
        }
    }
    
    // Function to handle withdraw action
    window.withdrawReceipt = async function (_rid) {
        try {
            let userProvider = new ethers.providers.Web3Provider(window.ethereum);
            await userProvider.send("eth_requestAccounts", []);
            let signer = userProvider.getSigner();
            let receiptContract = new ethers.Contract(receiptaddr.receipt, receiptabi.receipt, signer);
    
            const tx = await receiptContract.withdraw(_rid);
            await tx.wait();
    
            alert("Withdraw successfully completed.");
            window.location.reload();
        } catch(e) {
            alert(e.data.message.replace('execution reverted: ',''))
          }
    };
    
    
 
    
    // Function to handle check action
    window.checkReceipt = async function (_rid) {
        try {
            const rewardInput = document.getElementById(`rewardInput_${_rid}`).value;
            const statusSelect = document.getElementById(`statusSelect_${_rid}`).value;
    
            if (!rewardInput || !statusSelect) {
                alert("Please enter a reward and select a status.");
                return;
            }
    
            let userProvider = new ethers.providers.Web3Provider(window.ethereum);
            await userProvider.send("eth_requestAccounts", []);
            let signer = userProvider.getSigner();
            let receiptContract = new ethers.Contract(receiptaddr.receipt, receiptabi.receipt, signer);
    
            const tx = await receiptContract.check(_rid, rewardInput, parseInt(statusSelect));
            await tx.wait();
    
            alert("Check successfully submitted.");
            window.location.reload();
        } catch (error) {
            console.error("Error submitting check:", error);
            alert("Failed to submit check. Check console for details.");
        }
    };
    



window.claimReceipt = async function (_cid) {
    try {
        const receiptInput = document.getElementById(`receiptInput_${_cid}`).value;
        if (!receiptInput) {
            alert("Please enter a receipt URL.");
            return;
        }

        let userProvider = new ethers.providers.Web3Provider(window.ethereum);
        await userProvider.send("eth_requestAccounts", []);
        let signer = userProvider.getSigner();
        let receiptContract = new ethers.Contract(receiptaddr.receipt, receiptabi.receipt, signer);

        const tx = await receiptContract.claim(_cid, receiptInput);
        await tx.wait();

        alert("Claim successfully submitted.");
         // 페이지 새로고침
         window.location.reload()
    } catch (error) {
        console.error("Error submitting claim:", error);
        alert("Failed to submit claim. Check console for details.");
    }
};



    // Trigger the functions to display companies and receipts
    displayCompanies();
    displayReceipts();
});
