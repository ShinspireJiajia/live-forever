/**
 * ============================================
 * 陸府建設 CRM 系統 - 交屋滿意度問卷 JavaScript
 * ============================================
 * 檔案：reservation-handover-survey.js
 * 說明：處理交屋滿意度問卷管理頁面的互動邏輯
 * 建立日期：2025-12-29
 * ============================================
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化側邊欄
    if (typeof SidebarManager !== 'undefined') {
        const sidebarManager = new SidebarManager();
    }
    
    // 分頁設定
    let currentPage = 1;
    const pageSize = 10;
    
    // 初始化
    loadSurveyData();
    loadStatistics();
    
    /**
     * 載入問卷統計資料
     */
    function loadStatistics() {
        // 模擬統計資料
        const stats = {
            sent: 85,
            filled: 62,
            pending: 23,
            avgRating: 4.5
        };
        
        // 更新統計卡片
        const statSent = document.getElementById('statSent');
        const statFilled = document.getElementById('statFilled');
        const statPending = document.getElementById('statPending');
        const statRating = document.getElementById('statRating');
        
        if (statSent) statSent.textContent = stats.sent;
        if (statFilled) statFilled.textContent = stats.filled;
        if (statPending) statPending.textContent = stats.pending;
        if (statRating) statRating.textContent = stats.avgRating.toFixed(1);
    }
    
    /**
     * 載入問卷發送紀錄
     */
    function loadSurveyData(filters) {
        // 模擬問卷資料
        const mockData = [
            {
                id: 1,
                projectName: '陸府原森',
                unitName: 'A棟12A',
                memberName: '張小明',
                handoverDate: '2025-01-10',
                sendDate: '2025-01-10',
                fillDate: '2025-01-12',
                status: 'filled',
                rating: 5
            },
            {
                id: 2,
                projectName: '陸府原森',
                unitName: 'A棟12B',
                memberName: '李美玲',
                handoverDate: '2025-01-11',
                sendDate: '2025-01-11',
                fillDate: null,
                status: 'sent',
                rating: null
            },
            {
                id: 3,
                projectName: '陸府觀微',
                unitName: 'B棟8A',
                memberName: '王大明',
                handoverDate: '2025-01-08',
                sendDate: '2025-01-08',
                fillDate: '2025-01-09',
                status: 'filled',
                rating: 4
            },
            {
                id: 4,
                projectName: '陸府觀微',
                unitName: 'B棟9A',
                memberName: '陳小華',
                handoverDate: '2025-01-05',
                sendDate: '2025-01-05',
                fillDate: null,
                status: 'pending',
                rating: null
            },
            {
                id: 5,
                projectName: '陸府植森',
                unitName: 'C棟3A',
                memberName: '林志明',
                handoverDate: '2025-01-12',
                sendDate: '2025-01-12',
                fillDate: '2025-01-13',
                status: 'filled',
                rating: 5
            }
        ];
        
        renderTable(mockData);
    }
    
    /**
     * 渲染表格
     */
    function renderTable(data) {
        const tbody = document.getElementById('surveyTableBody');
        if (!tbody) return;
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="text-center">無資料</td></tr>';
            return;
        }
        
        tbody.innerHTML = data.map(function(survey, index) {
            // 狀態標籤
            let statusHtml = '';
            switch(survey.status) {
                case 'filled':
                    statusHtml = '<span class="survey-status filled">已填寫</span>';
                    break;
                case 'sent':
                    statusHtml = '<span class="survey-status sent">已發送</span>';
                    break;
                case 'pending':
                    statusHtml = '<span class="survey-status pending">待追蹤</span>';
                    break;
                case 'expired':
                    statusHtml = '<span class="survey-status expired">已過期</span>';
                    break;
            }
            
            // 星級評分
            let ratingHtml = '-';
            if (survey.rating) {
                ratingHtml = '<div class="star-rating" data-rating="' + survey.rating + '">';
                for (let i = 1; i <= 5; i++) {
                    const starClass = i <= survey.rating ? 'fa-solid' : 'fa-regular';
                    ratingHtml += `<i class="${starClass} fa-star"></i>`;
                }
                ratingHtml += '</div>';
            }
            
            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${survey.projectName}</td>
                    <td>${survey.unitName}</td>
                    <td>${survey.memberName}</td>
                    <td>${survey.handoverDate}</td>
                    <td>${survey.sendDate}</td>
                    <td>${survey.fillDate || '-'}</td>
                    <td>${statusHtml}</td>
                    <td>${ratingHtml}</td>
                    <td>
                        <div class="action-buttons">
                            ${survey.status === 'filled' ? `
                                <button class="btn-action btn-view" data-id="${survey.id}" title="查看回覆">
                                    <i class="fa-solid fa-eye"></i>
                                </button>
                            ` : `
                                <button class="btn-action btn-resend" data-id="${survey.id}" title="再次發送">
                                    <i class="fa-solid fa-paper-plane"></i>
                                </button>
                            `}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        bindTableEvents();
    }
    
    /**
     * 綁定表格事件
     */
    function bindTableEvents() {
        // 查看回覆
        document.querySelectorAll('.btn-view').forEach(function(btn) {
            btn.addEventListener('click', function() {
                const id = this.dataset.id;
                viewSurveyResponse(id);
            });
        });
        
        // 再次發送
        document.querySelectorAll('.btn-resend').forEach(function(btn) {
            btn.addEventListener('click', function() {
                const id = this.dataset.id;
                resendSurvey(id);
            });
        });
    }
    
    /**
     * 查看問卷回覆
     */
    function viewSurveyResponse(id) {
        // 開啟問卷回覆彈窗或頁面
        alert('查看問卷回覆 ID: ' + id);
    }
    
    /**
     * 再次發送問卷
     */
    function resendSurvey(id) {
        if (confirm('確定要再次發送問卷嗎？')) {
            alert('已重新發送問卷');
            loadSurveyData();
        }
    }
    
    // 批次發送問卷
    document.getElementById('btnBatchSend')?.addEventListener('click', function() {
        if (confirm('確定要對所有未填寫問卷的住戶發送提醒嗎？')) {
            alert('已發送批次提醒');
        }
    });
    
    // 匯出報表
    document.getElementById('btnExport')?.addEventListener('click', function() {
        alert('匯出功能開發中...');
    });
    
    // 查詢表單
    document.getElementById('searchForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        currentPage = 1;
        loadSurveyData();
    });
    
    // 重置表單
    document.getElementById('searchForm')?.addEventListener('reset', function() {
        setTimeout(function() {
            currentPage = 1;
            loadSurveyData();
        }, 0);
    });
});

/**
 * ============================================
 * 問卷填寫頁面專用（住戶端）
 * ============================================
 */

/**
 * 初始化星級評分
 */
function initStarRating() {
    document.querySelectorAll('.rating-stars').forEach(function(container) {
        const stars = container.querySelectorAll('i');
        
        stars.forEach(function(star, index) {
            star.addEventListener('click', function() {
                const rating = index + 1;
                container.dataset.rating = rating;
                
                // 更新星星顯示
                stars.forEach(function(s, i) {
                    if (i < rating) {
                        s.classList.remove('fa-regular');
                        s.classList.add('fa-solid', 'active');
                    } else {
                        s.classList.remove('fa-solid', 'active');
                        s.classList.add('fa-regular');
                    }
                });
            });
            
            // Hover 效果
            star.addEventListener('mouseenter', function() {
                stars.forEach(function(s, i) {
                    if (i <= index) {
                        s.style.color = '#f5b301';
                    }
                });
            });
            
            star.addEventListener('mouseleave', function() {
                const rating = parseInt(container.dataset.rating) || 0;
                stars.forEach(function(s, i) {
                    if (i < rating) {
                        s.style.color = '#f5b301';
                    } else {
                        s.style.color = '#ddd';
                    }
                });
            });
        });
    });
}

/**
 * 提交問卷
 */
function submitSurvey() {
    const ratings = {};
    
    // 收集評分
    document.querySelectorAll('.rating-stars').forEach(function(container) {
        const questionId = container.dataset.question;
        const rating = parseInt(container.dataset.rating) || 0;
        ratings[questionId] = rating;
    });
    
    // 收集意見
    const feedback = document.getElementById('feedbackText')?.value || '';
    
    // 驗證
    let hasEmptyRating = false;
    Object.keys(ratings).forEach(function(key) {
        if (ratings[key] === 0) {
            hasEmptyRating = true;
        }
    });
    
    if (hasEmptyRating) {
        alert('請完成所有評分項目');
        return;
    }
    
    // 提交
    console.log('提交問卷：', { ratings, feedback });
    
    // 顯示感謝頁面
    document.getElementById('surveyForm').style.display = 'none';
    document.getElementById('thankYouPage').style.display = 'block';
}

// 如果是問卷填寫頁面，初始化星級評分
if (document.querySelector('.rating-stars')) {
    document.addEventListener('DOMContentLoaded', initStarRating);
}
