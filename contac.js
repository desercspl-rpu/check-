// Ensure toggleModal is globally available immediately
window.toggleModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.toggle('hidden');
    }
};

document.getElementById("currentYear").textContent = new Date().getFullYear();

function toggleHeaderSearch(e) {
    e.stopPropagation();
    const searchBox = document.getElementById('headerSearchBox');
    const searchInput = document.getElementById('searchInput');
    if (searchBox.classList.contains('hidden')) {
        searchBox.classList.remove('hidden');
        searchInput.focus();
    } else {
        searchBox.classList.add('hidden');
    }
}

function closeHeaderSearch() {
    document.getElementById('headerSearchBox').classList.add('hidden');
}

document.addEventListener('click', function(event) {
    const wrapper = document.getElementById('headerSearchWrapper');
    const searchBox = document.getElementById('headerSearchBox');
    if (wrapper && !wrapper.contains(event.target)) {
        searchBox.classList.add('hidden');
    }

    // Hide employee dropdown if clicked outside
    const empInput = document.getElementById('ticketEmpId');
    const empDropdown = document.getElementById('empDropdownList');
    if (empInput && empDropdown && !empInput.contains(event.target) && !empDropdown.contains(event.target)) {
        empDropdown.classList.add('hidden');
    }
});

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('bg-brand-600', 'text-white', 'shadow-sm');
        btn.classList.add('text-slate-600', 'hover:bg-slate-200');
    });
    document.getElementById(`content-${tabName}`).classList.remove('hidden');
    const activeBtn = document.getElementById(`tab-${tabName}`);
    activeBtn.classList.remove('text-slate-600', 'hover:bg-slate-200');
    activeBtn.classList.add('bg-brand-600', 'text-white', 'shadow-sm');
}

function filterCards() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const items = document.querySelectorAll('.searchable-item');
    items.forEach(item => {
        const text = item.innerText.toLowerCase();
        if (text.includes(query)) {
            item.style.display = "";
        } else {
            item.style.display = "none";
        }
    });
}

// Global variable to keep track of hidden fields data for the selected employee
let selectedEmployeeRecord = null;

function filterEmployeeDropdown(query) {
    const dropdown = document.getElementById('empDropdownList');
    const nameInput = document.getElementById('ticketEmail'); // Full Name Field
    const companyInput = document.getElementById('ticketCompany'); // Company Name Field
    
    // Reset selected employee record when typing manually
    selectedEmployeeRecord = null;
    nameInput.value = "";

    if (!query || query.trim() === "") {
        dropdown.classList.add('hidden');
        dropdown.innerHTML = "";
        companyInput.value = "";
        return;
    }

    const lowerQuery = query.toLowerCase();
    const matchedEmployees = employeeDatabase.filter(emp => emp.employeeId.toLowerCase().includes(lowerQuery));

    if (matchedEmployees.length === 0) {
        dropdown.classList.add('hidden');
        dropdown.innerHTML = "";
        return;
    }

    dropdown.innerHTML = matchedEmployees.map(emp => `
        <div onclick="selectEmployee('${emp.employeeId}')" class="px-3 py-2 text-xs hover:bg-slate-100 cursor-pointer border-b border-slate-100 last:border-none">
            <span class="font-bold text-slate-900">${emp.employeeId}</span> - <span class="text-slate-600">${emp.fullName}</span>
        </div>
    `).join('');
    
    dropdown.classList.remove('hidden');
}

function selectEmployee(empId) {
    const emp = employeeDatabase.find(e => e.employeeId === empId);
    if (emp) {
        selectedEmployeeRecord = emp;
        document.getElementById('ticketEmpId').value = emp.employeeId;
        document.getElementById('ticketEmail').value = emp.fullName;
        document.getElementById('ticketCompany').value = emp.companyName; // Employee can edit this
        document.getElementById('empDropdownList').classList.add('hidden');
        document.getElementById('formErrorMsg').classList.add('hidden');
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const errorEl = document.getElementById('formErrorMsg');
    errorEl.classList.add('hidden');
    
    // Capture form fields
    const employeeIdInput = document.getElementById('ticketEmpId').value.trim();
    
    // STRICT VALIDATION RULE: Check if employee was selected from database list
    if (!selectedEmployeeRecord || selectedEmployeeRecord.employeeId !== employeeIdInput) {
        errorEl.innerText = "Error: Please select a valid employee from the dropdown list.";
        errorEl.classList.remove('hidden');
        return;
    }

    const employeeId = selectedEmployeeRecord.employeeId;
    const fullName = document.getElementById('ticketEmail').value;
    const company = document.getElementById('ticketCompany').value; // Editable value
    const subject = document.getElementById('ticketSubject').value;
    const remark = document.getElementById('ticketRemark').value;

    const mobileNumber = selectedEmployeeRecord.mobileNumber;
    const designation = selectedEmployeeRecord.designation;

    // Your Power Automate URL
    const powerAutomateUrl = "https://default7055ba6336ec48e083eb932bb1602d.a1.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/28/workflows/20ab591d138948adb435ddb768fd6bad/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=A_lGxRU47nHr3DbFWYyKezULhcWahe-3yBYiamskbIs";

    try {
        await fetch(powerAutomateUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                employeeId: employeeId,
                fullName: fullName,
                mobileNumber: mobileNumber,
                designation: designation,
                company: company,
                subject: subject,
                remark: remark,
                submittedAt: new Date().toISOString()
            })
        });

        // Close the ticket form modal first
        window.toggleModal('ticketModal');
        e.target.reset();
        selectedEmployeeRecord = null;
        document.getElementById('ticketEmail').value = "";
        
        // Show clean custom success modal instead of alert()
        window.toggleModal('successModal');
        
    } catch (err) {
        console.error(err);
        errorEl.innerText = "Error: Report submission failed. Please check network and try again.";
        errorEl.classList.remove('hidden');
    }
}

function checkLink(event, url) {
    if (url.includes('index.html') && window.location.protocol === 'file:') {
        try {
            return true;
        } catch (err) {
            event.preventDefault();
            showPageError("Error: Page or link not available.");
        }
    }
}

function showPageError(message) {
    const errBox = document.getElementById('pageErrorMsg');
    if (errBox) {
        errBox.innerText = message;
        errBox.classList.remove('hidden');
    }
}
