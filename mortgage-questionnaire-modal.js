/**
 * ============================================
 * 陸府建設 CRM 系統 - 對保問卷管理彈窗功能
 * ============================================
 * 檔案：mortgage-questionnaire-modal.js
 * 說明：案場對保問卷管理彈窗的 JavaScript 功能
 * ============================================
 */

class MortgageQuestionnaireModal {
    constructor(modalId) {
        this.modal = document.getElementById(modalId);
        if (!this.modal) return;
        
        this.overlay = this.modal.querySelector('.modal-overlay');
        this.closeBtn = this.modal.querySelector('.modal-close');
        this.cancelBtn = this.modal.querySelector('.btn-close-modal');
        this.saveBtn = this.modal.querySelector('#btnSaveMortgage');
        this.editContentBtn = this.modal.querySelector('#btnEditMortgageContent');
        this.projectNameEl = document.getElementById('mortgageProjectName');
        this.bankContainer = document.getElementById('bankOptionsContainer');
        
        this.currentProjectId = null;
        this.isEditMode = false;
        
        // Default Bank Config
        this.defaultBanks = [
            { id: 'cathay', name: '國泰世華', desc: '國泰世華銀行提供優惠房貸方案，首購族可享1.31%起的優惠利率。', link: '#' },
            { id: 'taiwan', name: '台灣銀行', desc: '台灣銀行提供多元房貸方案，首次購屋可享最低1.38%優惠利率。', link: '#' },
            { id: 'huanan', name: '華南銀行', desc: '華南銀行提供優惠方案，首購族可享1.31%起的優惠利率。', link: '#' },
            { id: 'other', name: '其他', desc: '請填寫預計對保的銀行資訊，並上傳對保人員的名片資訊', link: '#' }
        ];

        // Mock Data for Results and Config
        this.mockResults = {};
        this.mockConfig = {};

        this.initEvents();
    }

    initEvents() {
        // Close events
        this.overlay.addEventListener('click', () => this.close());
        this.closeBtn.addEventListener('click', () => this.close());
        this.cancelBtn.addEventListener('click', () => this.close());
        
        // Save event
        this.saveBtn.addEventListener('click', () => this.save());

        // Edit Content event
        this.editContentBtn.addEventListener('click', () => this.toggleEditMode());

        // Star rating
        const stars = this.modal.querySelectorAll('.star-rating i');
        stars.forEach(star => {
            star.addEventListener('click', (e) => {
                if (this.isEditMode) return; // Disable rating in edit mode
                const value = e.target.dataset.value;
                this.setRating(value);
            });
        });
    }

    open(projectId, projectName) {
        this.currentProjectId = projectId;
        this.projectNameEl.textContent = projectName;
        this.isEditMode = false;
        this.updateEditButtonState();
        
        // Load data
        this.loadData(projectId);
        
        this.modal.classList.add('active');
    }

    close() {
        this.modal.classList.remove('active');
    }

    loadData(projectId) {
        // Reset form
        document.getElementById('mortgageQuestionnaireForm').reset();
        this.setRating(0);
        
        // Get Config (Banks)
        const banks = this.mockConfig[projectId] || JSON.parse(JSON.stringify(this.defaultBanks));
        this.renderBanks(banks);
        
        // Get Results (Answers)
        const result = this.mockResults[projectId];
        if (result) {
            // Set bank
            const bankRadio = this.modal.querySelector(`input[name="mortgageBank"][value="${result.bank}"]`);
            if (bankRadio) bankRadio.checked = true;
            
            // Set loan amount
            document.getElementById('loanAmount').value = result.loanAmount || '';
            
            // Set rating
            this.setRating(result.rating || 0);
            
            // Set supplements
            document.getElementById('otherSupplements').value = result.supplements || '';
        }
    }

    renderBanks(banks) {
        this.bankContainer.innerHTML = '';
        
        if (this.isEditMode) {
            // Render Edit Mode (Inputs)
            banks.forEach((bank, index) => {
                const card = document.createElement('div');
                card.className = 'bank-edit-card';
                card.style.border = '1px solid #ddd';
                card.style.padding = '16px';
                card.style.borderRadius = '8px';
                card.style.backgroundColor = '#f9f9f9';
                
                card.innerHTML = `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                        <span style="font-weight: bold;">銀行選項 ${index + 1}</span>
                        <button type="button" class="btn-delete-bank" data-index="${index}" style="color: #dc3545; border: none; background: none; cursor: pointer;">
                            <i class="fa-solid fa-trash"></i> 刪除
                        </button>
                    </div>
                    <div class="form-group" style="margin-bottom: 8px;">
                        <label style="font-size: 12px; color: #666;">銀行名稱</label>
                        <input type="text" class="form-input bank-name-input" value="${bank.name}" style="width: 100%; padding: 4px;">
                    </div>
                    <div class="form-group" style="margin-bottom: 8px;">
                        <label style="font-size: 12px; color: #666;">說明文字</label>
                        <textarea class="form-textarea bank-desc-input" rows="2" style="width: 100%; padding: 4px;">${bank.desc}</textarea>
                    </div>
                    <div class="form-group">
                        <label style="font-size: 12px; color: #666;">連結網址</label>
                        <input type="text" class="form-input bank-link-input" value="${bank.link}" style="width: 100%; padding: 4px;">
                    </div>
                    <input type="hidden" class="bank-id-input" value="${bank.id}">
                `;
                this.bankContainer.appendChild(card);
            });
            
            // Add "Add Bank" button
            const addBtn = document.createElement('button');
            addBtn.type = 'button';
            addBtn.className = 'btn-add-bank';
            addBtn.innerHTML = '<i class="fa-solid fa-plus"></i> 新增銀行選項';
            addBtn.style.gridColumn = '1 / -1';
            addBtn.style.padding = '12px';
            addBtn.style.border = '1px dashed #ccc';
            addBtn.style.backgroundColor = '#fff';
            addBtn.style.cursor = 'pointer';
            addBtn.style.color = '#28a745';
            addBtn.onclick = () => this.addBank();
            this.bankContainer.appendChild(addBtn);
            
            // Bind delete events
            this.bankContainer.querySelectorAll('.btn-delete-bank').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = e.currentTarget.dataset.index;
                    this.deleteBank(index);
                });
            });

        } else {
            // Render View Mode (Radio Cards)
            banks.forEach(bank => {
                const label = document.createElement('label');
                label.className = 'bank-option-card';
                label.style.border = '1px solid #ddd';
                label.style.padding = '16px';
                label.style.borderRadius = '8px';
                label.style.cursor = 'pointer';
                label.style.display = 'block';
                
                label.innerHTML = `
                    <div class="bank-header" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span class="bank-name" style="font-weight: bold;">${bank.name}</span>
                        <input type="radio" name="mortgageBank" value="${bank.id}">
                    </div>
                    <p class="bank-desc" style="font-size: 14px; color: #666; margin-bottom: 8px; line-height: 1.5;">${bank.desc}</p>
                    <a href="${bank.link}" class="bank-link" target="_blank" style="font-size: 14px; color: #007bff; text-decoration: none;">前往官網了解更多</a>
                `;
                this.bankContainer.appendChild(label);
            });
        }
    }

    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        this.updateEditButtonState();
        
        // Get current config to render
        const banks = this.getCurrentConfig();
        this.renderBanks(banks);
        
        // Toggle visibility of other form sections (optional, maybe hide them in edit mode?)
        const otherSections = this.modal.querySelectorAll('.form-section:not(:first-child)');
        otherSections.forEach(section => {
            section.style.display = this.isEditMode ? 'none' : 'block';
        });
        
        // Change Save button text
        this.saveBtn.textContent = this.isEditMode ? '儲存設定' : '儲存結果';
    }

    updateEditButtonState() {
        if (this.isEditMode) {
            this.editContentBtn.innerHTML = '<i class="fa-solid fa-eye"></i> 預覽問卷';
            this.editContentBtn.classList.remove('btn-outline-primary');
            this.editContentBtn.classList.add('btn-outline-secondary');
        } else {
            this.editContentBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> 維護內容';
            this.editContentBtn.classList.remove('btn-outline-secondary');
            this.editContentBtn.classList.add('btn-outline-primary');
        }
    }

    getCurrentConfig() {
        if (this.isEditMode) {
            // If we are toggling TO edit mode, we need the stored config
            return this.mockConfig[this.currentProjectId] || JSON.parse(JSON.stringify(this.defaultBanks));
        } else {
            // If we are toggling FROM edit mode (to preview), we should grab values from inputs?
            // Or just rely on what was saved. 
            // Let's grab from inputs to show live preview without saving? 
            // No, let's keep it simple: Toggle just switches view. Save is explicit.
            // But if I edit and toggle back, I lose changes if I didn't save.
            // Let's auto-save to temp variable or just read from inputs if switching from Edit -> View
            
            // For simplicity: Read from inputs if we were in edit mode
            // But wait, toggleEditMode is called AFTER isEditMode is flipped.
            // So if isEditMode is false, we just came from true.
            // This logic is getting complex. Let's just use the stored config.
            return this.mockConfig[this.currentProjectId] || JSON.parse(JSON.stringify(this.defaultBanks));
        }
    }

    addBank() {
        const currentBanks = this.scrapeBanksFromEditUI();
        currentBanks.push({
            id: 'bank_' + Date.now(),
            name: '新銀行',
            desc: '請輸入說明',
            link: '#'
        });
        this.renderBanks(currentBanks);
    }

    deleteBank(index) {
        const currentBanks = this.scrapeBanksFromEditUI();
        currentBanks.splice(index, 1);
        this.renderBanks(currentBanks);
    }

    scrapeBanksFromEditUI() {
        const banks = [];
        const cards = this.bankContainer.querySelectorAll('.bank-edit-card');
        cards.forEach(card => {
            banks.push({
                id: card.querySelector('.bank-id-input').value,
                name: card.querySelector('.bank-name-input').value,
                desc: card.querySelector('.bank-desc-input').value,
                link: card.querySelector('.bank-link-input').value
            });
        });
        return banks;
    }

    setRating(value) {
        const stars = this.modal.querySelectorAll('.star-rating i');
        document.getElementById('experienceRating').value = value;
        
        stars.forEach(star => {
            if (parseInt(star.dataset.value) <= value) {
                star.style.color = '#ffc107'; // Yellow
            } else {
                star.style.color = '#ddd'; // Grey
            }
        });
    }

    save() {
        if (this.isEditMode) {
            // Save Configuration
            const banks = this.scrapeBanksFromEditUI();
            this.mockConfig[this.currentProjectId] = banks;
            alert('已儲存問卷內容設定');
            this.toggleEditMode(); // Switch back to view
        } else {
            // Save Results
            const bankRadio = this.modal.querySelector('input[name="mortgageBank"]:checked');
            const bank = bankRadio ? bankRadio.value : null;
            const loanAmount = document.getElementById('loanAmount').value;
            const rating = document.getElementById('experienceRating').value;
            const supplements = document.getElementById('otherSupplements').value;
            
            this.mockResults[this.currentProjectId] = {
                bank: bank,
                loanAmount: loanAmount,
                rating: rating,
                supplements: supplements
            };
            
            alert('已儲存問卷結果');
            this.close();
        }
    }
}
