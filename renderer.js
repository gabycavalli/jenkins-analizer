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
    
    const urlRegex = /(https?:\/\/[^\s"']+)/i;
    const methodRegex = /\b(GET|POST|PUT|DELETE|PATCH)\b/i;
    const statusRegex = /\b(2\d{2}|3\d{2}|4\d{2}|5\d{2})\b/;

    let blocks = [];
    let currentBlock = null;

    // Fase 1: Agrupar en bloques por cada Request/Endpoint
    lines.forEach((line, index) => {
        const cleanLine = line.trim();
        if (!cleanLine) return;

        if (cleanLine.match(urlRegex) || cleanLine.startsWith('Endpoint:')) {
            if (currentBlock) blocks.push(currentBlock);
            currentBlock = {
                startLineNum: index + 1,
                lines: [line], // Mantener la línea original para el formato
                urlMatch: cleanLine.match(urlRegex),
                methodMatch: cleanLine.match(methodRegex)
            };
        } else if (currentBlock) {
            // Limitar a 500 líneas por bloque para evitar excesos de memoria
            if (currentBlock.lines.length < 500) {
                currentBlock.lines.push(line);
            }
        }
    });
    if (currentBlock) blocks.push(currentBlock);

    // Fase 2: Analizar cada bloque
    blocks.forEach(block => {
        let method = 'GET';
        if (block.methodMatch) method = block.methodMatch[1].toUpperCase();
        
        let url = block.urlMatch ? block.urlMatch[1] : 'URL';
        
        // Buscar el status en todo el bloque
        let status = null;
        for (let line of block.lines) {
            const sm = line.match(statusRegex);
            if (sm) {
                const code = parseInt(sm[1], 10);
                // Filtrar ruido común (puertos, etc.)
                if (code !== 443 && code !== 404 && code !== 22 && code !== 808 && code !== 5002) {
                    status = code;
                    break;
                }
            }
        }

        if (!status) {
            const hasError = block.lines.some(l => l.toUpperCase().includes('ERROR') || l.includes('Exception'));
            if (hasError) status = 500;
        }

        if (status) {
            allEndpoints.push({
                method: method,
                url: url,
                trace: block.lines.join('\n'), // Traza completa incluyendo JSONs
                status: status,
                lineNum: block.startLineNum
            });
        }
    });

    // Fallback mode
    if (allEndpoints.length === 0) {
        lines.forEach((line, index) => {
            const statusMatch = line.match(/\b(500|502|503|504|400|401|403)\b/);
            if (statusMatch) {
                allEndpoints.push({
                    method: 'ERROR',
                    url: 'Error',
                    trace: line.trim(),
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
            e.trace.toLowerCase().includes(term) || 
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

            const lines = item.trace.split('\n');
            const summaryLine = lines[0].length > 120 ? lines[0].substring(0, 120) + '...' : lines[0];

            let traceHtml = '';
            if (lines.length > 1 || lines[0].length > 120) {
                traceHtml = `
                    <details class="trace-details">
                        <summary class="trace-summary" title="Clic para expandir traza">${escapeHTML(summaryLine)}</summary>
                        <div class="trace-content">${escapeHTML(item.trace)}</div>
                    </details>
                `;
            } else {
                traceHtml = `<div class="trace-summary">${escapeHTML(item.trace)}</div>`;
            }

            tr.innerHTML = `
                <td><span class="method">${escapeHTML(item.method)}</span></td>
                <td><div class="endpoint">${traceHtml}</div></td>
                <td><span class="badge ${badgeClass}">${label}</span></td>
                <td><span class="line-num">Línea ${item.lineNum}</span></td>
            `;
            tbody.appendChild(tr);
        });
    }
}

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}
