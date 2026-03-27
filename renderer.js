// Elements
const dropZone = document.getElementById('drop-zone');
const fileUpload = document.getElementById('file-upload');
const statsPanel = document.getElementById('stats-panel');
const tableContainer = document.getElementById('table-container');
const tbody = document.getElementById('table-body');
const searchInput = document.getElementById('search-input');
const filterBtns = document.querySelectorAll('.filter-btn');
const emptyState = document.getElementById('empty-state');

// Stats Elements
const statTotal = document.getElementById('stat-total');
const statSuccess = document.getElementById('stat-success');
const statWarning = document.getElementById('stat-warning');
const statCritical = document.getElementById('stat-critical');

let allEndpoints = []; // Stores all parsed data
let currentFilter = 'all';

// ================= Event Listeners =================

// File Upload Click
fileUpload.addEventListener('change', (e) => {
    if (e.target.files.length) {
        handleFile(e.target.files[0]);
    }
});

// Drag and Drop
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
        handleFile(e.dataTransfer.files[0]);
    }
});

// Search
searchInput.addEventListener('input', () => {
    renderTable();
});

// Filters
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTable();
    });
});


// ================= Core Logic =================

function handleFile(file) {
    if (!file.name.endsWith('.txt') && !file.name.endsWith('.log')) {
        alert('Por favor, sube un archivo .txt o .log');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target.result;
        parseLog(text);
        updateDashboard();
        renderTable();
        
        // UI Transitions
        dropZone.classList.add('hidden');
        statsPanel.classList.remove('hidden');
        tableContainer.classList.remove('hidden');
        statsPanel.style.display = 'grid'; // override hidden generic
    };
    reader.readAsText(file);
}

function parseLog(text) {
    allEndpoints = [];
    const lines = text.split('\n');
    
    // Expression to find common HTTP lines. 
    // This looks for an HTTP Method, a URL, and a 3-digit status code.
    // Example: "POST https://api.example.com/item 400" or similar
    // We try multiple matching strategies since logs are heterogeneous
    
    const urlRegex = /(https?:\/\/[^\s"']+)/i;
    const methodRegex = /\b(GET|POST|PUT|DELETE|PATCH)\b/i;
    const statusRegex = /\b(2\d{2}|3\d{2}|4\d{2}|5\d{2})\b/;

    // Often Jenkins logs contain requests and responses split across lines, 
    // but for simplicity we extract lines that seem to contain an endpoint.
    
    let currentMethod = 'UNKNOWN';
    let currentUrl = null;

    lines.forEach((line, index) => {
        const cleanLine = line.trim();
        if (!cleanLine) return;

        // Try to detect a request
        const methodMatch = cleanLine.match(methodRegex);
        const urlMatch = cleanLine.match(urlRegex);
        
        if (methodMatch && urlMatch) {
            currentMethod = methodMatch[1].toUpperCase();
            currentUrl = urlMatch[1];
        } else if (urlMatch && !currentUrl) {
             currentUrl = urlMatch[1];
             currentMethod = 'GET'; // Defaults
        }

        // Try to detect a status code
        const statusMatch = cleanLine.match(statusRegex);
        
        // If we have a URL and a status in the same or nearby line
        if (currentUrl && statusMatch) {
            // Exclude common noise like port numbers (e.g. 5000, 8080) that might match \b200\b inside IPs
            // The regex \b(2\d{2}...)\b covers exact 3 digits, so 8080 is excluded.
            // Port numbers matching 443 ? It's not in the 200/400/500 range (unless 443 matches, wait 4\d{2} matches 443)
            
            const statusCode = parseInt(statusMatch[1], 10);
            
            // Filter obvious false positives
            if (statusCode !== 443 && statusCode !== 404 && statusCode !== 22) {
                allEndpoints.push({
                    method: currentMethod,
                    url: currentUrl,
                    status: statusCode,
                    lineNum: index + 1
                });
                
                // Reset context to avoid duplicate mappings
                currentUrl = null;
                currentMethod = 'UNKNOWN';
            }
        }
    });

    // If the heuristics fail, we try a fallback mode:
    if (allEndpoints.length === 0) {
        let fakeId = 1;
        lines.forEach((line, index) => {
            const statusMatch = line.match(/\b(500|502|503|504|400|401|403)\b/);
            if (statusMatch) {
                allEndpoints.push({
                    method: 'ERROR',
                    url: line.substring(0, 100) + '...', // Just show snippet
                    status: parseInt(statusMatch[1]),
                    lineNum: index + 1
                });
            }
        });
    }
}

function updateDashboard() {
    statTotal.textContent = allEndpoints.length;
    
    const success = allEndpoints.filter(e => e.status >= 200 && e.status < 300).length;
    const warning = allEndpoints.filter(e => e.status >= 400 && e.status < 500).length;
    const critical = allEndpoints.filter(e => e.status >= 500).length;

    statSuccess.textContent = success;
    statWarning.textContent = warning;
    statCritical.textContent = critical;
}

function renderTable() {
    const term = searchInput.value.toLowerCase();
    
    let filtered = allEndpoints;
    
    // Apply categorical filter
    if (currentFilter === 'success') {
        filtered = filtered.filter(e => e.status >= 200 && e.status < 300);
    } else if (currentFilter === 'warning') {
        filtered = filtered.filter(e => e.status >= 400 && e.status < 500);
    } else if (currentFilter === 'critical') {
        filtered = filtered.filter(e => e.status >= 500);
    }

    // Apply text search
    if (term) {
        filtered = filtered.filter(e => 
            e.url.toLowerCase().includes(term) || 
            e.status.toString().includes(term) ||
            e.method.toLowerCase().includes(term)
        );
    }

    // Render logic
    tbody.innerHTML = '';
    
    if (filtered.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        filtered.forEach(item => {
            const tr = document.createElement('tr');
            
            let badgeClass = 'status-200';
            let label = item.status;
            
            if (item.status >= 400 && item.status < 500) {
                badgeClass = 'status-400';
            } else if (item.status >= 500) {
                badgeClass = 'status-500';
            }

            tr.innerHTML = `
                <td><span class="method">${item.method}</span></td>
                <td><span class="endpoint">${item.url}</span></td>
                <td><span class="badge ${badgeClass}">${label}</span></td>
                <td><span class="line-num">Línea ${item.lineNum}</span></td>
            `;
            tbody.appendChild(tr);
        });
    }
}
