document.addEventListener('DOMContentLoaded', function() {
    // Get unit ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    const unitId = parseInt(urlParams.get('id'));

    // Initialize data
    initData();

    if (action === 'add') {
        // Add mode
        document.querySelector('.page-title').textContent = '新增戶別';
        bindEvents(null);
    } else {
        // Edit mode
        if (!unitId) {
            alert('無效的戶別 ID');
            window.location.href = 'unit-list.html';
            return;
        }
        loadUnitData(unitId);
        bindEvents(unitId);
    }
});

function initData() {
    // Ensure units are in localStorage
    if (!localStorage.getItem('crm_units')) {
        if (typeof CRMMockData !== 'undefined' && CRMMockData.units) {
            localStorage.setItem('crm_units', JSON.stringify(CRMMockData.units));
        }
    }
}

function loadUnitData(id) {
    const unitsStr = localStorage.getItem('crm_units');
    const units = unitsStr ? JSON.parse(unitsStr) : [];
    
    if (!units || units.length === 0) {
        alert('系統資料未初始化，請先回到列表頁重新載入');
        window.location.href = 'unit-list.html';
        return;
    }

    const unit = units.find(u => u.id === id);

    if (!unit) {
        alert('找不到該戶別資料');
        window.location.href = 'unit-list.html';
        return;
    }

    // Basic Info
    setValue('cProductId', unit.projectName);
    setValue('cHouseName', unit.doorNumber);
    setValue('cContractNumber', unit.contractNumber);
    setValue('cAddress', unit.address);
    setValue('cSalesStatus', unit.status);
    setValue('cPurchaseType', unit.purchaseType || '房屋');
    setValue('cPurchaseSubType', unit.purchaseSubType);
    setValue('cPreSalesForm', unit.preSalesForm || '不開放');

    // Purchase Info
    setValue('cOwner', unit.owner);
    setValue('cOwnerPassword', unit.ownerPassword);
    setValue('cGeneralPassword', unit.generalPassword);
    setValue('cLandOwner', unit.landOwner);
    setValue('cCollectionOwner', unit.collectionOwner);

    // Contract Info
    setValue('cContractDate', unit.contractDate);
    setValue('cDeliverDate', unit.handoverDate);
    setValue('cStructureWarrantyDate', unit.structureWarrantyDate);
    setValue('cTileWarrantyDate', unit.tileWarrantyDate);
    setValue('cWaterproofWarrantyDate', unit.waterproofWarrantyDate);
    setValue('cElectromechanicalWarrantyDate', unit.electromechanicalWarrantyDate);
    setValue('cWarrantyRemark', unit.warrantyRemark);

    // Area Info
    setValue('cLandHold', unit.landHold);
    setValue('cSquareFootage', unit.area);
    setValue('cWarrantArea', unit.warrantArea);
    setValue('cIndoorArea', unit.mainArea);
    setValue('cFlowerBedArea', unit.flowerBedArea);
    setValue('cBalconyArea', unit.balconyArea);
    setValue('cArcadeArea', unit.arcadeArea);
    setValue('cUmbrellaArea', unit.umbrellaArea);
    setValue('cTerraceArea', unit.terraceArea);
    setValue('cOtherArea', unit.otherArea);
    setValue('cLargePublicEstablishment', unit.publicArea);
    setValue('cSmallPublicEstablishment', unit.smallPublicEstablishment);

    // Parking Info
    setValue('cCarNo', unit.parkingSpace);
    setValue('cCarSquareFootage', unit.parkingArea);

    // Amount Info
    setValue('cPrice', unit.price);
    setValue('cReservePrice', unit.reservePrice);
    setValue('cSalePrice', unit.salePrice);
    setValue('cContractPrice', unit.totalAmount);
    setValue('cHousePrice', unit.housePrice);
    setValue('cPerSquareFootagePrice', unit.perSquareFootagePrice);
    setValue('cParkingPrice', unit.parkingPrice);
    setValue('cOtherPrice', unit.otherPrice);
}

function setValue(id, value) {
    const el = document.getElementById(id);
    if (el) {
        el.value = value !== undefined && value !== null ? value : '';
    }
}

function bindEvents(unitId) {
    // Handle Save Unit
    const saveBtns = document.querySelectorAll('#unit-profile-form .btn-primary');
    saveBtns.forEach(btn => {
        if (btn.textContent.includes('確定') || btn.textContent.includes('儲存')) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                saveUnitData(unitId);
            });
        }
    });

    // Handle Cancel/Back
    const cancelBtns = document.querySelectorAll('#unit-profile-form .btn-secondary');
    cancelBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'unit-list.html';
        });
    });
}

function saveUnitData(id) {
    const units = JSON.parse(localStorage.getItem('crm_units')) || [];
    
    // Collect form data
    const formData = {
        // Basic Info
        projectName: document.getElementById('cProductId').value,
        doorNumber: document.getElementById('cHouseName').value,
        contractNumber: document.getElementById('cContractNumber').value,
        address: document.getElementById('cAddress').value,
        status: document.getElementById('cSalesStatus').value,
        purchaseType: document.getElementById('cPurchaseType').value,
        purchaseSubType: document.getElementById('cPurchaseSubType').value,
        preSalesForm: document.getElementById('cPreSalesForm').value,

        // Purchase Info
        owner: document.getElementById('cOwner').value,
        ownerPassword: document.getElementById('cOwnerPassword').value,
        generalPassword: document.getElementById('cGeneralPassword').value,
        landOwner: document.getElementById('cLandOwner').value,
        collectionOwner: document.getElementById('cCollectionOwner').value,

        // Contract Info
        contractDate: document.getElementById('cContractDate').value,
        handoverDate: document.getElementById('cDeliverDate').value,
        structureWarrantyDate: document.getElementById('cStructureWarrantyDate').value,
        tileWarrantyDate: document.getElementById('cTileWarrantyDate').value,
        waterproofWarrantyDate: document.getElementById('cWaterproofWarrantyDate').value,
        electromechanicalWarrantyDate: document.getElementById('cElectromechanicalWarrantyDate').value,
        warrantyRemark: document.getElementById('cWarrantyRemark').value,

        // Area Info
        landHold: document.getElementById('cLandHold').value,
        area: parseFloat(document.getElementById('cSquareFootage').value) || 0,
        warrantArea: parseFloat(document.getElementById('cWarrantArea').value) || 0,
        mainArea: parseFloat(document.getElementById('cIndoorArea').value) || 0,
        flowerBedArea: parseFloat(document.getElementById('cFlowerBedArea').value) || 0,
        balconyArea: parseFloat(document.getElementById('cBalconyArea').value) || 0,
        arcadeArea: parseFloat(document.getElementById('cArcadeArea').value) || 0,
        umbrellaArea: parseFloat(document.getElementById('cUmbrellaArea').value) || 0,
        terraceArea: parseFloat(document.getElementById('cTerraceArea').value) || 0,
        otherArea: parseFloat(document.getElementById('cOtherArea').value) || 0,
        publicArea: parseFloat(document.getElementById('cLargePublicEstablishment').value) || 0,
        smallPublicEstablishment: parseFloat(document.getElementById('cSmallPublicEstablishment').value) || 0,

        // Parking Info
        parkingSpace: document.getElementById('cCarNo').value,
        parkingArea: parseFloat(document.getElementById('cCarSquareFootage').value) || 0,

        // Amount Info
        price: parseFloat(document.getElementById('cPrice').value) || 0,
        reservePrice: parseFloat(document.getElementById('cReservePrice').value) || 0,
        salePrice: parseFloat(document.getElementById('cSalePrice').value) || 0,
        totalAmount: parseFloat(document.getElementById('cContractPrice').value) || 0,
        housePrice: parseFloat(document.getElementById('cHousePrice').value) || 0,
        perSquareFootagePrice: parseFloat(document.getElementById('cPerSquareFootagePrice').value) || 0,
        parkingPrice: parseFloat(document.getElementById('cParkingPrice').value) || 0,
        otherPrice: parseFloat(document.getElementById('cOtherPrice').value) || 0
    };

    if (id) {
        // Update existing
        const index = units.findIndex(u => u.id === id);
        if (index === -1) {
            alert('儲存失敗：找不到原始資料');
            return;
        }
        units[index] = { ...units[index], ...formData };
    } else {
        // Create new
        const newId = units.length > 0 ? Math.max(...units.map(u => u.id)) + 1 : 1;
        const newUnit = {
            id: newId,
            projectId: 1, // Default
            building: formData.doorNumber.charAt(0) + '棟', // Simple guess
            ...formData
        };
        units.push(newUnit);
    }

    localStorage.setItem('crm_units', JSON.stringify(units));
    
    alert('儲存成功！');
    window.location.href = 'unit-list.html';
}
