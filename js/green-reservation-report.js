document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    let formData = null;

    // Try to load from Mock Data if ID is present
    if (id && window.CRMMockData) {
        // Extract numeric ID if it's a string like "RES-001"
        const numericId = parseInt(id.replace(/\D/g, '')) || parseInt(id);
        
        const service = CRMMockData.getById('greenServices', numericId);
        if (service) {
            let unitName = '未知戶別';
            let residentName = '未知住戶';
            
            // Join with Contract data
            if (service.contractId && CRMMockData.greenContracts) {
                const contract = CRMMockData.getById('greenContracts', service.contractId);
                if (contract) {
                    unitName = contract.unitName;
                }
            }

            formData = {
                inspectionDate: service.serviceDate,
                houseNumber: unitName,
                residentName: residentName,
                sections: [
                    {
                        title: '服務紀錄',
                        subSections: [
                            {
                                title: '執行項目',
                                items: [
                                    { name: '服務項目', status: '已完成', notes: service.items },
                                    { name: '備註', status: '說明', notes: service.notes }
                                ]
                            }
                        ]
                    }
                ],
                residentSignature: '',
                managerSignature: ''
            };
        }
    }

    if (!formData) {
        const formDataString = localStorage.getItem('inspectionData');
        if (formDataString) {
            formData = JSON.parse(formDataString);
        }
    }

    if (formData) {
        populateResults(formData);
        // Optional: Clear the data from localStorage after use
        // localStorage.removeItem('inspectionData');
    } else {
        // Handle case where no data is found
        document.getElementById('results-content').innerHTML = '<p style="text-align:center; padding: 20px; color: #666;">找不到健檢資料，請先填寫完工確認單。</p>';
        // Disable print button
        const printBtn = document.querySelector('.print-btn');
        if (printBtn) {
            printBtn.disabled = true;
            printBtn.style.backgroundColor = '#ccc';
        }
    }
});

function populateResults(data) {
    // Populate header
    document.getElementById('inspection-date').textContent = data.inspectionDate || '未填寫';
    document.getElementById('house-number').textContent = data.houseNumber || '未填寫';
    document.getElementById('resident-name').textContent = data.residentName || '未填寫';

    // Populate inspection items
    const resultsContent = document.getElementById('results-content');
    resultsContent.innerHTML = ''; // Clear previous content

    for (const section of data.sections) {
        // Check if section has any checked items
        const hasCheckedItems = section.subSections.some(ss => 
            ss.items.some(i => i.status && i.status !== '未檢查')
        );
        
        if (!hasCheckedItems) continue;

        const sectionTitle = document.createElement('h2');
        sectionTitle.textContent = section.title;
        resultsContent.appendChild(sectionTitle);

        for (const subSection of section.subSections) {
            // Check if subsection has any checked items
            const subSectionHasItems = subSection.items.some(i => i.status && i.status !== '未檢查');
            if (!subSectionHasItems) continue;

            if(subSection.title){
                const subSectionTitle = document.createElement('h3');
                subSectionTitle.textContent = subSection.title;
                resultsContent.appendChild(subSectionTitle);
            }

            const table = document.createElement('table');
            table.innerHTML = `
                <thead>
                    <tr>
                        <th width="25%">檢查項目</th>
                        <th width="20%">檢查狀態</th>
                        <th width="25%">拍照記錄</th>
                        <th width="30%">備註改善項目</th>
                    </tr>
                </thead>
            `;
            const tbody = document.createElement('tbody');
            table.appendChild(tbody);

            for (const item of subSection.items) {
                if (!item.status || item.status === '未檢查') continue;
                const row = document.createElement('tr');
                
                // Handle photo display
                let photoHtml = '無照片';
                if (item.photo && item.photo !== 'undefined' && item.photo !== '') {
                    photoHtml = `<div class="photo-preview"><img src="${item.photo}" alt="${item.name} 照片"></div>`;
                }

                row.innerHTML = `
                    <td>${item.name}</td>
                    <td>${item.status}</td>
                    <td>${photoHtml}</td>
                    <td>${item.notes || ''}</td>
                `;
                tbody.appendChild(row);
            }
            resultsContent.appendChild(table);
        }
    }

    // Populate signatures
    if (data.residentSignature) {
        document.getElementById('resident-signature').src = data.residentSignature;
    }
    if (data.managerSignature) {
        document.getElementById('manager-signature').src = data.managerSignature;
    }
}
