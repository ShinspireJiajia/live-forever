import os
import re

# Configuration
workspace_dir = r"c:\Users\rena3\doc\AI-PT\陸府建設"
source_file = os.path.join(workspace_dir, "index.html")
target_files = [
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
]

def get_sidebar_content(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract content between markers
    start_marker = "<!-- 側邊欄選單 -->"
    end_marker = "<!-- 主內容區域 -->"
    
    pattern = re.compile(f"({re.escape(start_marker)}.*?){re.escape(end_marker)}", re.DOTALL)
    match = pattern.search(content)
    
    if match:
        return match.group(1)
    else:
        return None

def update_file(file_path, new_sidebar):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    start_marker = "<!-- 側邊欄選單 -->"
    end_marker = "<!-- 主內容區域 -->"
    
    # Regex to find the block to replace
    # We look for the block between the markers, including the start marker but excluding the end marker
    # The end marker is part of the next section, so we keep it in the replacement (or just don't consume it)
    
    # Actually, let's replace everything from start_marker up to (but not including) end_marker
    pattern = re.compile(f"{re.escape(start_marker)}.*?{re.escape(end_marker)}", re.DOTALL)
    
    # Check if the file has the markers
    if not pattern.search(content):
        print(f"Skipping {os.path.basename(file_path)}: Markers not found.")
        return False
        
    # The new_sidebar includes the start_marker but not the end_marker (based on extraction logic)
    # So we replace the found block with new_sidebar + end_marker
    
    # Wait, let's look at extraction again.
    # match.group(1) includes start_marker and content up to end_marker.
    
    new_content = pattern.sub(new_sidebar + end_marker, content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    return True

def main():
    print("Extracting sidebar from index.html...")
    sidebar_content = get_sidebar_content(source_file)
    
    if not sidebar_content:
        print("Error: Could not extract sidebar from index.html")
        return

    # Remove the end marker from the extracted content if it was included by the regex group(1) logic
    # My regex was `({re.escape(start_marker)}.*?){re.escape(end_marker)}`
    # group(1) captures everything BEFORE end_marker.
    # So sidebar_content contains start_marker + sidebar html.
    
    print(f"Sidebar content length: {len(sidebar_content)} chars")
    
    success_count = 0
    for filename in target_files:
        file_path = os.path.join(workspace_dir, filename)
        if os.path.exists(file_path):
            print(f"Updating {filename}...")
            if update_file(file_path, sidebar_content):
                success_count += 1
        else:
            print(f"File not found: {filename}")
            
    print(f"Done. Updated {success_count} files.")

if __name__ == "__main__":
    main()
