const fs = require('fs');
const path = require('path');

const workspaceDir = __dirname;
const sourceFile = path.join(workspaceDir, 'index.html');
const targetFiles = [
    "activity-list.html", "activity-registration.html", "crm-email.html", 
    "crm-milestone.html", "crm-project.html", "crm-vendor.html", 
    "crm-warranty.html", "green-contract.html", "green-service.html", 
    "house-checkup-items.html", "house-checkup-schedule.html", 
    "member-bindline.html", "member-list.html", "reservation-collateral.html", 
    "reservation-custom.html", "reservation-handover.html", 
    "reservation-inspection.html", "system-log.html", "system-role.html", 
    "system-user.html", "unit-list.html", "unit-payment.html", "work-order.html",
    "case-list.html", "case-edit.html", "green-case-list.html", "green-case-edit.html",
    "green-case-quotation.html", "green-contract-add.html", "green-contract-payment.html",
    "green-performance.html", "green-reservation.html", "green-reservation-add.html",
    "green-reservation-completion.html", "green-reservation-edit.html", 
    "green-reservation-report.html", "green-site.html", "green-site-schedule.html",
    "unit-profile.html", "resident-profile.html",
    "green-quotation-confirm.html", "reservation-handover-edit.html", 
    "reservation-handover-schedule.html", "reservation-handover-survey-fill.html", 
    "reservation-handover-survey.html", "unit-appointment.html"
];

function getSidebarContent(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const startMarker = "<!-- 側邊欄選單 -->";
    const endMarker = "<!-- 主內容區域 -->";
    
    const startIndex = content.indexOf(startMarker);
    const endIndex = content.indexOf(endMarker);
    
    if (startIndex !== -1 && endIndex !== -1) {
        return content.substring(startIndex, endIndex);
    }
    return null;
}

function updateFile(filePath, newSidebar) {
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${path.basename(filePath)}`);
        return false;
    }

    let content = fs.readFileSync(filePath, 'utf-8');
    const startMarker = "<!-- 側邊欄選單 -->";
    const endMarker = "<!-- 主內容區域 -->";
    
    const startIndex = content.indexOf(startMarker);
    const endIndex = content.indexOf(endMarker);
    
    if (startIndex === -1 || endIndex === -1) {
        console.log(`Skipping ${path.basename(filePath)}: Markers not found.`);
        return false;
    }
    
    const newContent = content.substring(0, startIndex) + newSidebar + content.substring(endIndex);
    fs.writeFileSync(filePath, newContent, 'utf-8');
    return true;
}

function main() {
    console.log("Extracting sidebar from index.html...");
    const sidebarContent = getSidebarContent(sourceFile);
    
    if (!sidebarContent) {
        console.error("Error: Could not extract sidebar from index.html");
        return;
    }
    
    console.log(`Sidebar content length: ${sidebarContent.length} chars`);
    
    let successCount = 0;
    for (const filename of targetFiles) {
        const filePath = path.join(workspaceDir, filename);
        console.log(`Updating ${filename}...`);
        if (updateFile(filePath, sidebarContent)) {
            successCount++;
        }
    }
    
    console.log(`Done. Updated ${successCount} files.`);
}

main();
