// script.js
// 示例数据
const sampleLogs = [
    {
        id: 1,
        date: "2023-07-01",
        content: "熟悉公司环境，参加新员工培训，了解公司规章制度",
        learnings: "学习了公司的产品线和基本业务流程",
        hours: 6,
        status: "completed"
    },
    {
        id: 2,
        date: "2023-07-02",
        content: "参与团队会议，了解当前项目进展，分配工作任务",
        learnings: "了解了敏捷开发流程和团队协作方式",
        hours: 8,
        status: "completed"
    },
    {
        id: 3,
        date: "2023-07-03",
        content: "完成第一个任务：用户登录界面设计",
        learnings: "掌握了Figma设计工具的基本操作",
        hours: 7,
        status: "completed"
    },
    {
        id: 4,
        date: "2023-07-04",
        content: "与导师讨论界面设计细节，进行修改优化",
        learnings: "学习了用户体验设计的基本原则",
        hours: 6,
        status: "completed"
    },
    {
        id: 5,
        date: "2023-07-05",
        content: "开始前端开发工作，搭建项目框架",
        learnings: "熟悉了React框架的基本使用",
        hours: 7,
        status: "pending"
    }
];

// 获取DOM元素
const logForm = document.getElementById('logForm');
const logsContainer = document.getElementById('logsContainer');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const exportBtn = document.getElementById('exportBtn');
const toast = document.getElementById('toast');
const filterStatus = document.getElementById('filterStatus');
const modal = document.getElementById('detailModal');
const closeBtn = document.querySelector('.close-btn');

// 从localStorage获取日志或使用示例数据
let logs = JSON.parse(localStorage.getItem('internshipLogs')) || sampleLogs;

// 初始化页面
function init() {
    renderLogs(logs);
    updateStats();
    
    // 设置默认日期为今天
    document.getElementById('logDate').valueAsDate = new Date();
    
    // 添加事件监听器
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
}

// 更新统计信息
function updateStats() {
    document.getElementById('logCount').textContent = logs.length;
    
    const totalHours = logs.reduce((total, log) => total + parseInt(log.hours), 0);
    document.getElementById('totalHours').textContent = totalHours;
    
    const uniqueDays = new Set(logs.map(log => log.date)).size;
    document.getElementById('totalDays').textContent = uniqueDays;
}

// 渲染日志列表
function renderLogs(logsArray) {
    const statusFilter = filterStatus.value;
    let filteredLogs = logsArray;
    
    // 应用状态过滤
    if (statusFilter !== 'all') {
        filteredLogs = logsArray.filter(log => log.status === statusFilter);
    }
    
    if (filteredLogs.length === 0) {
        logsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-file-alt"></i>
                <h3>未找到匹配的日志</h3>
                <p>尝试不同的搜索条件</p>
            </div>
        `;
        return;
    }
    
    logsContainer.innerHTML = `
        <div class="log-header">
            <div>日期</div>
            <div>工作内容</div>
            <div>学习收获</div>
            <div>工作时长</div>
            <div>状态</div>
            <div>操作</div>
        </div>
    `;
    
    // 按日期倒序排序
    filteredLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    filteredLogs.forEach(log => {
        const logElement = document.createElement('div');
        logElement.className = 'log-item';
        logElement.innerHTML = `
            <div class="log-date">${formatDate(log.date)}</div>
            <div class="log-content" title="${log.content}">${log.content}</div>
            <div class="log-content" title="${log.learnings || '-'}">${log.learnings || '-'}</div>
            <div class="log-hours">${log.hours} 小时</div>
            <div>
                <span class="log-status status-${log.status}">
                    ${log.status === 'completed' ? '已完成' : '进行中'}
                </span>
            </div>
            <div class="log-actions">
                <button class="action-btn view-btn" data-id="${log.id}" title="查看详情">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn edit-btn" data-id="${log.id}" title="编辑">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" data-id="${log.id}" title="删除">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        logsContainer.appendChild(logElement);
    });
    
    // 添加事件监听器
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => viewLog(btn.dataset.id));
    });
    
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editLog(btn.dataset.id));
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteLog(btn.dataset.id));
    });
}

// 查看日志详情
function viewLog(id) {
    const log = logs.find(log => log.id == id);
    if (log) {
        document.getElementById('detail-date').textContent = formatDate(log.date);
        document.getElementById('detail-content').textContent = log.content;
        document.getElementById('detail-learnings').textContent = log.learnings || '无记录';
        document.getElementById('detail-hours').textContent = log.hours;
        document.getElementById('detail-status').textContent = 
            log.status === 'completed' ? '已完成' : '进行中';
        
        modal.classList.add('show');
    }
}

// 编辑日志
function editLog(id) {
    const log = logs.find(log => log.id == id);
    if (log) {
        document.getElementById('logDate').value = log.date;
        document.getElementById('logContent').value = log.content;
        document.getElementById('learnings').value = log.learnings || '';
        document.getElementById('hours').value = log.hours;
        document.getElementById('status').value = log.status;
        
        // 移除日志
        logs = logs.filter(log => log.id != id);
        saveLogs();
        renderLogs(logs);
        updateStats();
        
        showToast('请修改日志内容并重新提交');
        
        // 滚动到表单位置
        document.getElementById('logForm').scrollIntoView({
            behavior: 'smooth'
        });
    }
}
//测试
// 删除日志
function deleteLog(id) {
    if (confirm('确定要删除这条日志吗？此操作不可撤销。')) {
        logs = logs.filter(log => log.id != id);
        saveLogs();
        renderLogs(logs);
        updateStats();
        showToast('日志已删除');
    }
}

// 添加新日志
logForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newLog = {
        id: Date.now(), // 使用时间戳作为唯一ID
        date: document.getElementById('logDate').value,
        content: document.getElementById('logContent').value,
        learnings: document.getElementById('learnings').value,
        hours: parseInt(document.getElementById('hours').value),
        status: document.getElementById('status').value
    };
    
    logs.push(newLog);
    saveLogs();
    renderLogs(logs);
    updateStats();
    
    // 重置表单
    logForm.reset();
    document.getElementById('hours').value = 8;
    document.getElementById('logDate').valueAsDate = new Date();
    
    showToast('日志已成功添加！');
});

// 搜索日志
searchBtn.addEventListener('click', searchLogs);
searchInput.addEventListener('keyup', function(e) {
    if (e.key === 'Enter') {
        searchLogs();
    }
});

filterStatus.addEventListener('change', searchLogs);

function searchLogs() {
    const searchTerm = searchInput.value.toLowerCase();
    if (!searchTerm) {
        renderLogs(logs);
        return;
    }
    
    const filteredLogs = logs.filter(log => 
        log.content.toLowerCase().includes(searchTerm) || 
        (log.learnings && log.learnings.toLowerCase().includes(searchTerm))
    );
    
    renderLogs(filteredLogs);
}

// 导出日志
exportBtn.addEventListener('click', function() {
    let csvContent = "日期,工作内容,学习收获,工作时长(小时),状态\n";
    
    logs.forEach(log => {
        const row = [
            formatDate(log.date),
            `"${log.content}"`,
            `"${log.learnings || ''}"`,
            log.hours,
            log.status === 'completed' ? '已完成' : '进行中'
        ];
        csvContent += row.join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `实习日志_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('日志已导出为CSV文件');
});

// 辅助函数
function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}

function saveLogs() {
    localStorage.setItem('internshipLogs', JSON.stringify(logs));
}

function showToast(message) {
    toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// 初始化应用
init();