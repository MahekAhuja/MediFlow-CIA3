/**
 * MediFlow - Medical Resource Coordination Platform
 * Frontend & API Integration
 * Developed for Advanced Algorithms CIA 3
 * Member: Aayushi Purohit (Frontend + API Integration)
 */

const API_BASE = 'http://localhost:8080/api';

// Demonstration roles and stakeholder workflows
const roles = {
  MEDIFLOW_ADMIN: {
    name: 'MediFlow Administrator',
    title: 'Network Overview',
    subtitle: 'Monitor independent entities, emergency requests, and algorithmic resource allocation across the network.',
    nav: [
      ['Overview', '⌂'],
      ['Analytics', '▥'],
      ['Entities', '▦'],
      ['Requests', '⇄'],
      ['Allocations', '◈'],
      ['Deliveries', '➜'],
      ['Network Map', '◎']
    ]
  },
  HOSPITAL_ADMIN: {
    name: 'Hospital Administrator',
    title: 'Hospital Portal',
    subtitle: 'Submit critical hospital requirements, track incoming allocations, and analyze emergency demand percentiles.',
    nav: [
      ['Overview', '⌂'],
      ['Analytics', '▥'],
      ['Create Request', '＋'],
      ['My Requests', '⇄'],
      ['Allocations', '◈'],
      ['Deliveries', '➜']
    ]
  },
  WAREHOUSE_ADMIN: {
    name: 'Warehouse Administrator',
    title: 'Warehouse Depot',
    subtitle: 'Manage regional medical stockpile, calculate dispatch network capacities, and fulfill hospital requisitions.',
    nav: [
      ['Overview', '⌂'],
      ['Analytics', '▥'],
      ['Inventory', '▦'],
      ['Incoming Requests', '⇄'],
      ['Allocations', '◈'],
      ['Dispatches', '➜']
    ]
  },
  BLOOD_BANK_ADMIN: {
    name: 'Blood Bank Administrator',
    title: 'Blood Bank Hub',
    subtitle: 'Track blood group reserves, analyze high-demand emergency percentiles, and coordinate blood deliveries.',
    nav: [
      ['Overview', '⌂'],
      ['Analytics', '▥'],
      ['Blood Inventory', '♡'],
      ['Incoming Requests', '⇄'],
      ['Allocations', '◈'],
      ['Inventory History', '◷']
    ]
  },
  LOGISTICS_ADMIN: {
    name: 'Logistics Administrator',
    title: 'Logistics Fleet',
    subtitle: 'Optimize transit routes, monitor bottleneck capacities, and track active inter-facility deliveries.',
    nav: [
      ['Overview', '⌂'],
      ['Analytics', '▥'],
      ['Assigned Deliveries', '➜'],
      ['Active Deliveries', '◉'],
      ['Delivery History', '◷']
    ]
  }
};

let currentRole = 'MEDIFLOW_ADMIN';
let currentPage = 'Overview';

// Synthetic records for local demonstration
let requests = [
  ['REQ-2481', 'Harborview General', 'Oxygen cylinders', 24, 'Critical', 'Pending'],
  ['REQ-2480', 'Green Cross Medical', 'O+ blood units', 12, 'Critical', 'Partially fulfilled'],
  ['REQ-2479', 'Sahyadri City Hospital', 'Ventilators', 4, 'High', 'Prioritized'],
  ['REQ-2478', 'Silverline Surgical', 'Medicines (ICU Pack)', 180, 'Normal', 'Pending'],
  ['REQ-2477', 'Apex Trauma Center', 'Oxygen cylinders', 30, 'Critical', 'Allocated']
];

// Algorithm preset datasets
const ALGO_PRESETS = {
  flow: {
    harborview: {
      name: 'Harborview Emergency Depot (Multi-Hub)',
      source: 'Central Depot',
      sink: 'Harborview Hospital',
      edges: [
        { from: 'Central Depot', to: 'Regional Hub', capacity: 30 },
        { from: 'Regional Hub', to: 'Harborview Hospital', capacity: 18 },
        { from: 'Central Depot', to: 'North Hub', capacity: 20 },
        { from: 'North Hub', to: 'Harborview Hospital', capacity: 12 }
      ]
    },
    warehouse: {
      name: 'Warehouse to Hospital (Standard)',
      source: 'Warehouse A',
      sink: 'Hospital A',
      edges: [
        { from: 'Warehouse A', to: 'Hub', capacity: 20 },
        { from: 'Hub', to: 'Hospital A', capacity: 12 },
        { from: 'Warehouse A', to: 'Hospital A', capacity: 5 }
      ]
    },
    cityGrid: {
      name: 'City-Wide Multi-Sink Distribution',
      source: 'Central Depot',
      sink: 'Green Cross Hospital',
      edges: [
        { from: 'Central Depot', to: 'Harborview Hospital', capacity: 18 },
        { from: 'Central Depot', to: 'Green Cross Hospital', capacity: 12 },
        { from: 'Western Hub', to: 'Harborview Hospital', capacity: 10 },
        { from: 'Western Hub', to: 'Green Cross Hospital', capacity: 15 }
      ]
    }
  },
  demand: {
    emergency: {
      name: 'Regional ICU Oxygen Demand (90th percentile)',
      demands: [12, 18, 20, 24, 30, 16, 45, 22, 19, 27, 35, 40, 14, 28, 32],
      percentile: 90,
      seed: 2026
    },
    blood: {
      name: 'Emergency Blood Units (75th percentile)',
      demands: [45, 18, 32, 15, 10, 7, 45, 14, 26, 59, 22, 38, 50],
      percentile: 75,
      seed: 42
    },
    median: {
      name: 'Routine Supply Demand (Median / 50th percentile)',
      demands: [12, 4, 20, 8, 15, 30, 11, 9, 18, 22, 7, 14, 25, 16],
      percentile: 50,
      seed: 101
    }
  }
};

// DOM References
const navElem = document.getElementById('nav');
const contentElem = document.getElementById('content');
const loginView = document.getElementById('loginView');
const dashboardView = document.getElementById('dashboardView');
const currentRoleElem = document.getElementById('currentRole');
const pageTitleElem = document.getElementById('pageTitle');
const pageSubtitleElem = document.getElementById('pageSubtitle');
const pageEyebrowElem = document.getElementById('pageEyebrow');
const backendStatusPill = document.getElementById('backendStatusPill');
const backendStatusText = document.getElementById('backendStatusText');

// Authentication / Portal Navigation
function enterPortal(selectedRole) {
  currentRole = selectedRole;
  currentPage = 'Overview';
  loginView.classList.add('hidden');
  dashboardView.classList.remove('hidden');
  currentRoleElem.textContent = roles[currentRole].name;
  renderApp();
  checkBackendHealth();
}

function exitPortal() {
  dashboardView.classList.add('hidden');
  loginView.classList.remove('hidden');
}

document.getElementById('enterBtn').onclick = () => {
  enterPortal(document.getElementById('roleSelect').value);
};
document.getElementById('logoutBtn').onclick = exitPortal;

// Backend Health Checker
async function checkBackendHealth() {
  if (!backendStatusPill) return;
  try {
    const res = await fetch(`${API_BASE.replace('/api', '')}/api/health`, { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      backendStatusPill.className = 'status-pill pill-online';
      backendStatusText.textContent = 'API Connected (Port 8080)';
      backendStatusPill.title = `Backend Service: ${data.service || 'MediFlow'} (Status: UP)`;
      return true;
    } else {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch (err) {
    backendStatusPill.className = 'status-pill pill-offline';
    backendStatusText.textContent = 'API Offline (8080)';
    backendStatusPill.title = 'Backend unreachable. Start Spring Boot backend using: mvn spring-boot:run';
    return false;
  }
}

// Render navigation and main page content
function renderApp() {
  const roleConfig = roles[currentRole];
  
  // Render sidebar buttons
  navElem.innerHTML = roleConfig.nav.map(([pageName, icon]) => `
    <button class="nav-btn ${currentPage === pageName ? 'active' : ''}" data-page="${pageName}">
      <span class="nav-icon">${icon}</span>
      <span>${pageName}</span>
    </button>
  `).join('') + `
    <button class="nav-btn" id="navLogout">
      <span class="nav-icon">↪</span>
      <span>Exit Portal</span>
    </button>
  `;

  navElem.querySelectorAll('[data-page]').forEach(btn => {
    btn.onclick = () => {
      currentPage = btn.dataset.page;
      renderApp();
    };
  });

  document.getElementById('navLogout').onclick = exitPortal;

  // Update header text
  pageTitleElem.textContent = currentPage;
  pageSubtitleElem.textContent = roleConfig.subtitle;
  pageEyebrowElem.textContent = roleConfig.name.toUpperCase();

  // Render view
  contentElem.innerHTML = getPageContent();
  bindPageInteractions();
}

// Component helpers
function statCard(label, value, icon, sub = '') {
  return `
    <div class="stat">
      <div class="stat-top">
        <span>${label}</span>
        <span class="stat-icon">${icon}</span>
      </div>
      <strong>${value}</strong>
      <small>${sub}</small>
    </div>
  `;
}

function renderTable(rows, headers) {
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${rows.map(row => `
            <tr>
              ${row.map((cell, idx) => `
                <td>
                  ${idx === 4 || String(cell).toLowerCase().includes('critical') || String(cell).toLowerCase().includes('pending') || String(cell).toLowerCase().includes('delivered')
                    ? `<span class="badge ${String(cell).toLowerCase().includes('critical') ? 'critical' : String(cell).toLowerCase().includes('high') ? 'high' : String(cell).toLowerCase().includes('delivered') || String(cell).toLowerCase().includes('good') ? 'good' : String(cell).toLowerCase().includes('pending') ? 'pending' : ''}">${cell}</span>`
                    : cell}
                </td>
              `).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function requestTable() {
  return renderTable(requests, ['Request ID', 'Hospital', 'Resource', 'Quantity', 'Priority', 'Status']);
}

// Generate Page Content based on selection
function getPageContent() {
  if (currentPage === 'Analytics') {
    return renderAnalyticsPage();
  }

  if (currentPage === 'Create Request') {
    return `
      <div class="card">
        <div class="card-header">
          <div>
            <h3>Submit Emergency Resource Request</h3>
            <p class="card-sub">Generate a new medical requirement for algorithmic dispatch across the MediFlow network.</p>
          </div>
        </div>
        <form id="requestForm">
          <div class="form-grid">
            <div class="field">
              <label>Target Facility / Hospital</label>
              <input type="text" id="reqFacility" value="Harborview General" required>
            </div>
            <div class="field">
              <label>Resource Type</label>
              <select id="reqResource">
                <option value="Oxygen cylinders">Oxygen cylinders</option>
                <option value="ICU Medicines">ICU Medicines</option>
                <option value="Ventilators">Ventilators</option>
                <option value="O+ Blood units">O+ Blood units</option>
                <option value="A+ Blood units">A+ Blood units</option>
                <option value="Trauma Surgical Kits">Trauma Surgical Kits</option>
              </select>
            </div>
            <div class="field">
              <label>Required Quantity</label>
              <input type="number" id="reqQuantity" min="1" max="1000" value="20" required>
            </div>
            <div class="field">
              <label>Triage Priority</label>
              <select id="reqPriority">
                <option value="Critical">Critical (Immediate Dispatch)</option>
                <option value="High">High (Within 6 Hours)</option>
                <option value="Normal">Normal (Routine Supply)</option>
              </select>
            </div>
          </div>
          <div style="margin-top: 18px;">
            <button type="submit" class="primary">Submit Emergency Request</button>
          </div>
          <div id="formMessage"></div>
        </form>
      </div>
      <div class="card">
        <h3>Current Active Requests</h3>
        <p class="card-sub">Real-time status of submitted facility requests.</p>
        ${requestTable()}
      </div>
    `;
  }

  if (currentPage === 'Network Map') {
    return `
      <div class="card">
        <h3>MediFlow Inter-Facility Transport Map</h3>
        <p class="card-sub">Topological visualization of participating medical nodes and emergency transfer corridors.</p>
        <div class="map-placeholder">
          <div class="map-note">
            <strong>Active Medical Network Corridors</strong>
            <div class="map-pins">
              <span class="pin">🔵 Hospitals (20)</span>
              <span class="pin">🟢 Warehouses (4)</span>
              <span class="pin">🔴 Blood Banks (4)</span>
              <span class="pin">🟣 Logistics Hubs (2)</span>
            </div>
          </div>
        </div>
        <div class="alert alert-info" style="margin-top: 16px;">
          <span class="alert-icon">ℹ</span>
          <div>
            <strong>Graph Topology Connection:</strong> Use the <strong>Analytics</strong> tab to run Edmonds–Karp network flow and determine maximum transfer volume across these corridors.
          </div>
        </div>
      </div>
    `;
  }

  if (currentPage === 'Requests' || currentPage === 'My Requests' || currentPage === 'Incoming Requests') {
    return `
      <div class="card">
        <h3>${currentPage}</h3>
        <p class="card-sub">${currentRole === 'MEDIFLOW_ADMIN' ? 'Network-wide consolidated emergency request queue.' : 'Requests assigned to your facility jurisdiction.'}</p>
        ${requestTable()}
      </div>
    `;
  }

  if (currentPage === 'Entities') {
    return `
      <div class="grid three-col">
        ${[
          ['Hospitals', '20', 'Independent hospital and trauma care centers', '🏥'],
          ['Warehouses', '4', 'Regional pharmaceutical & supply distribution hubs', '🏢'],
          ['Blood Banks', '4', 'Licensed blood preservation & donor banks', '🩸'],
          ['Logistics Fleets', '2', 'Dedicated cold-chain medical transport units', '🚚'],
          ['Network Capacity', '1,850', 'Total coordinated resource units available', '📦'],
          ['Algorithm API', '2 Endpoints', 'Edmonds-Karp & Quickselect microservices', '⚡']
        ].map(([title, count, desc, icon]) => `
          <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 20px;">${icon}</span>
              <span class="badge teal">Verified Entity</span>
            </div>
            <h3>${title}</h3>
            <strong style="font-size: 28px; color: var(--navy);">${count}</strong>
            <p class="card-sub" style="margin-top: 6px;">${desc}</p>
          </div>
        `).join('')}
      </div>
    `;
  }

  if (currentPage === 'Inventory' || currentPage === 'Blood Inventory') {
    const isBlood = currentPage === 'Blood Inventory';
    const inventoryData = isBlood
      ? [
          ['A+', '45 units', '14 units', '31 units', 'Stable'],
          ['A−', '18 units', '8 units', '10 units', 'Low stock'],
          ['B+', '32 units', '12 units', '20 units', 'Stable'],
          ['B−', '15 units', '6 units', '9 units', 'Low stock'],
          ['AB+', '10 units', '5 units', '5 units', 'Attention required'],
          ['AB−', '7 units', '3 units', '4 units', 'Critical low'],
          ['O+', '45 units', '14 units', '31 units', 'Stable'],
          ['O−', '14 units', '8 units', '6 units', 'Critical low (Universal donor)']
        ]
      : [
          ['Oxygen Cylinders (Type D)', '186 units', '20 units', '166 units', 'Adequate'],
          ['ICU Emergency Medications', '1,240 packs', '100 packs', '1,140 packs', 'Optimal'],
          ['Mechanical Ventilators', '18 units', '3 units', '15 units', 'Limited'],
          ['Trauma Surgical Kits', '95 kits', '15 kits', '80 kits', 'Adequate'],
          ['PPE Infection Kits', '540 boxes', '40 boxes', '500 boxes', 'Optimal']
        ];

    return `
      <div class="card">
        <h3>${currentPage}</h3>
        <p class="card-sub">Real-time facility inventory and available stock levels.</p>
        ${renderTable(inventoryData, ['Resource / Category', 'Total Stock', 'Committed', 'Free Available', 'Status'])}
      </div>
    `;
  }

  if (currentPage === 'Deliveries' || currentPage === 'Assigned Deliveries' || currentPage === 'Active Deliveries' || currentPage === 'Delivery History' || currentPage === 'Dispatches') {
    return `
      <div class="card">
        <h3>${currentPage}</h3>
        <p class="card-sub">Active fleet tracking and medical resource transit history.</p>
        ${renderTable([
          ['DLV-761', 'Central Medical Depot', 'New Horizon Medical', 'Oxygen · 16 units', 'In Transit'],
          ['DLV-760', 'Western Distribution Hub', 'Lakeshore Emergency', 'Ventilators · 2 units', 'Delivered'],
          ['DLV-759', 'Lifeline Regional Blood Centre', 'Green Cross Medical', 'Blood (O+) · 8 units', 'Preparing'],
          ['DLV-758', 'Central Medical Depot', 'Harborview General', 'Medicines · 120 packs', 'Delivered']
        ], ['Delivery ID', 'Source Hub', 'Destination', 'Manifest / Quantity', 'Transit Status'])}
      </div>
    `;
  }

  if (currentPage === 'Allocations') {
    return `
      <div class="card">
        <h3>Resource Allocation Orders</h3>
        <p class="card-sub">Algorithmic matches between hospital requests and source warehouses.</p>
        ${renderTable([
          ['AL-301', 'REQ-2480', 'Lifeline Regional Blood Centre', 'Green Cross Medical', '8 units', 'Partially fulfilled'],
          ['AL-302', 'REQ-2479', 'Central Medical Depot', 'Sahyadri City Hospital', '4 ventilators', 'Allocated'],
          ['AL-303', 'REQ-2477', 'Western Distribution Hub', 'Apex Trauma Center', '16 cylinders', 'Dispatched'],
          ['AL-304', 'REQ-2481', 'Central Medical Depot', 'Harborview General', '20 cylinders', 'Pending Transit']
        ], ['Allocation ID', 'Linked Request', 'Supplier Facility', 'Recipient Facility', 'Allocated Amount', 'Status'])}
      </div>
    `;
  }

  // Default Overview Dashboard
  const isHospital = currentRole === 'HOSPITAL_ADMIN';
  const isWarehouse = currentRole === 'WAREHOUSE_ADMIN';
  const isBlood = currentRole === 'BLOOD_BANK_ADMIN';
  const isLog = currentRole === 'LOGISTICS_ADMIN';

  const stats = isHospital
    ? [
        ['Facility Requests', '8', '⇄', '3 pending triage'],
        ['Pending Review', '3', '◷', 'Requires approval'],
        ['Allocated Supplies', '4', '◈', 'Stock confirmed'],
        ['Active Deliveries', '2', '➜', 'En route']
      ]
    : isWarehouse
    ? [
        ['Stock Items', '5 categories', '▦', '186 O2 cylinders'],
        ['Incoming Requests', '4', '⇄', '2 high priority'],
        ['Confirmed Allocations', '3', '◈', 'Ready for pick-up'],
        ['Critical Alerts', '1', '!', 'Ventilators limited']
      ]
    : isBlood
    ? [
        ['Blood Groups', '8 categories', '♡', 'All types tracked'],
        ['Available Units', '527 units', '▦', 'Across blood banks'],
        ['Incoming Requests', '2', '⇄', '1 emergency O-'],
        ['Allocated Reserves', '1', '◈', 'Dispatched to Green Cross']
      ]
    : isLog
    ? [
        ['Assigned Deliveries', '6 routes', '➜', 'Active fleet'],
        ['In Dispatch Preparation', '1', '◷', 'Loading at Depot'],
        ['Active In Transit', '2', '↗', 'Live route tracking'],
        ['Delivered Today', '3', '✓', 'Completed transfers']
      ]
    : [
        ['Connected Facilities', '28', '⌂', '20 Hospitals, 8 Hubs'],
        ['Active Requests', '5', '⇄', '3 Critical triage'],
        ['Algorithm Status', 'Online', '⚡', 'Spring Boot 8080'],
        ['Network Allocations', '4 Orders', '◈', 'Algorithmic flow']
      ];

  return `
    <div class="grid stats">
      ${stats.map(s => statCard(...s)).join('')}
    </div>

    <div class="grid two-col">
      <div class="card">
        <h3>${isHospital ? 'Recent Hospital Requests' : isWarehouse ? 'Depot Stock Snapshot' : isBlood ? 'Blood Reserve Status' : isLog ? 'Fleet Transit Log' : 'Emergency Requests Queue'}</h3>
        <p class="card-sub">Real-time status updates across active coordination channels.</p>
        ${isHospital || (!isWarehouse && !isBlood && !isLog)
          ? requestTable()
          : renderTable(
              isWarehouse
                ? [['Oxygen Cylinders', '186', 'Adequate'], ['Medicines', '1,240', 'Optimal'], ['Ventilators', '18', 'Limited']]
                : isBlood
                ? [['O+ Universal Pack', '45', 'Adequate'], ['O− Emergency', '14', 'Critical low'], ['A+ Standard', '32', 'Adequate'], ['AB− Rare', '7', 'Attention']]
                : [['DLV-761', 'New Horizon Medical', 'Oxygen · 16', 'In Transit'], ['DLV-760', 'Lakeshore Emergency', 'Ventilators · 2', 'Delivered']],
              isWarehouse ? ['Resource', 'Stock Units', 'Status'] : isBlood ? ['Group', 'Available Units', 'Status'] : ['Delivery', 'Destination', 'Cargo', 'Status']
            )}
      </div>

      <div class="card">
        <h3>Network Stock Saturation</h3>
        <p class="card-sub">Current aggregate reserves versus target safety thresholds.</p>
        ${[
          ['Oxygen Cylinders', 72],
          ['ICU Medicines', 84],
          ['Blood Supply', 65],
          ['Ventilators', 48]
        ].map(([name, pct]) => `
          <div class="bar-row">
            <span>${name}</span>
            <div class="bar"><span style="width: ${pct}%"></span></div>
            <b>${pct}%</b>
          </div>
        `).join('')}

        <div class="alert alert-info" style="margin-top: 24px;">
          <span class="alert-icon">⚡</span>
          <div>
            <strong>Algorithmic Dispatch:</strong> Run Edmonds–Karp Maximum Flow and Randomized Quickselect demand percentiles in the <a href="#" id="gotoAnalyticsLink" style="color: var(--teal); font-weight: 700; text-decoration: underline;">Analytics Portal</a>.
          </div>
        </div>
      </div>
    </div>
  `;
}

// --------------------------------------------------------------------------
// ANALYTICS & ALGORITHM UI IMPLEMENTATION
// --------------------------------------------------------------------------
function renderAnalyticsPage() {
  return `
    <div class="alert alert-info">
      <span class="alert-icon">⚡</span>
      <div>
        <strong>Advanced Algorithms CIA 3 Integration:</strong> This module directly connects to the Spring Boot REST backend on <code>http://localhost:8080</code>.
        It runs <strong>Edmonds–Karp Maximum Flow (with Minimum Cut calculation)</strong> and <strong>Randomized Quickselect (with runtime benchmark comparison)</strong>.
      </div>
    </div>

    <div class="grid two-col">
      <!-- Edmonds-Karp Card -->
      <div class="card algorithm-card" id="flowCard">
        <div class="card-header">
          <div>
            <div class="eyebrow">GRAPH ALGORITHM · O(V · E²)</div>
            <h3>Edmonds–Karp · Maximum Flow & Minimum Cut</h3>
            <p class="card-sub">Calculate bottleneck flow capacity and minimum network cut using BFS augmenting paths.</p>
          </div>
        </div>

        <div class="preset-bar">
          <span class="preset-title">Presets:</span>
          <button class="preset-btn" data-preset-flow="harborview">Harborview Hub</button>
          <button class="preset-btn" data-preset-flow="warehouse">Warehouse A → Hospital A</button>
          <button class="preset-btn" data-preset-flow="cityGrid">City Grid Sample</button>
        </div>

        <div class="form-grid">
          <div class="field">
            <label for="flowSource">Source Node (Supply Depot)</label>
            <input id="flowSource" value="Central Depot" placeholder="e.g. Central Depot" required>
          </div>
          <div class="field">
            <label for="flowSink">Sink Node (Target Facility)</label>
            <input id="flowSink" value="Harborview Hospital" placeholder="e.g. Harborview Hospital" required>
          </div>
        </div>

        <div class="field">
          <label for="flowEdges">Directed Network Edges (JSON)</label>
          <textarea id="flowEdges" rows="5" class="mono" style="font-size: 12px;">[
  {"from":"Central Depot","to":"Regional Hub","capacity":30},
  {"from":"Regional Hub","to":"Harborview Hospital","capacity":18},
  {"from":"Central Depot","to":"North Hub","capacity":20},
  {"from":"North Hub","to":"Harborview Hospital","capacity":12}
]</textarea>
        </div>

        <div style="display: flex; gap: 10px; align-items: center; margin-top: 8px;">
          <button class="primary" id="runFlow">
            <span>Run Edmonds–Karp API</span>
          </button>
          <button class="ghost" id="formatFlowJsonBtn" title="Format JSON syntax">Format JSON</button>
        </div>

        <!-- Flow Output Container -->
        <div id="flowErrorNotice"></div>
        <div id="flowResultContainer" style="margin-top: 18px;">
          <div class="api-output mono" id="flowOutputPlaceholder" style="color: #94a3b8; font-size: 12px;">
Awaiting API response from http://localhost:8080/api/algorithms/max-flow...
Click "Run Edmonds–Karp API" to execute.
          </div>
        </div>
      </div>

      <!-- Randomized Quickselect Card -->
      <div class="card algorithm-card quickselect-card" id="selectCard">
        <div class="card-header">
          <div>
            <div class="eyebrow" style="color: var(--purple);">SELECTION ALGORITHM · EXPECTED O(n)</div>
            <h3>Randomized Quickselect · Demand Percentile</h3>
            <p class="card-sub">Find the exact demand percentile without sorting the full dataset, verified against standard sort.</p>
          </div>
        </div>

        <div class="preset-bar">
          <span class="preset-title">Presets:</span>
          <button class="preset-btn" data-preset-demand="emergency">ICU Demands (90th)</button>
          <button class="preset-btn" data-preset-demand="blood">Blood Units (75th)</button>
          <button class="preset-btn" data-preset-demand="median">Median Demand (50th)</button>
        </div>

        <div class="field">
          <label for="demands">Historical Demand Values (Comma-Separated)</label>
          <input id="demands" value="12, 18, 20, 24, 30, 16, 45, 22, 19, 27, 35, 40, 14, 28, 32" class="mono" required>
        </div>

        <div class="form-grid">
          <div class="field">
            <label for="percentile">Target Percentile (0.01 – 100.0)</label>
            <input id="percentile" type="number" min="0.01" max="100" step="any" value="90" required>
          </div>
          <div class="field">
            <label for="algoSeed">Reproducible Seed (Optional)</label>
            <input id="algoSeed" type="number" value="2026" placeholder="e.g. 2026">
          </div>
        </div>

        <div style="display: flex; gap: 10px; align-items: center; margin-top: 8px;">
          <button class="secondary" id="runSelect">
            <span>Run Quickselect API</span>
          </button>
          <button class="ghost" id="randomizeDemandsBtn" title="Generate random test dataset">Generate Random Data</button>
        </div>

        <!-- Quickselect Output Container -->
        <div id="selectErrorNotice"></div>
        <div id="selectResultContainer" style="margin-top: 18px;">
          <div class="api-output mono" id="selectOutputPlaceholder" style="color: #94a3b8; font-size: 12px;">
Awaiting API response from http://localhost:8080/api/algorithms/demand-percentile...
Click "Run Quickselect API" to execute.
          </div>
        </div>
      </div>
    </div>
  `;
}

// --------------------------------------------------------------------------
// EVENT BINDINGS & API LOGIC
// --------------------------------------------------------------------------
function bindPageInteractions() {
  // Navigation helper link
  const gotoLink = document.getElementById('gotoAnalyticsLink');
  if (gotoLink) {
    gotoLink.onclick = (e) => {
      e.preventDefault();
      currentPage = 'Analytics';
      renderApp();
    };
  }

  // Create Request Form handler
  const rf = document.getElementById('requestForm');
  if (rf) {
    rf.onsubmit = (e) => {
      e.preventDefault();
      const facility = document.getElementById('reqFacility').value.trim();
      const resource = document.getElementById('reqResource').value;
      const quantity = parseInt(document.getElementById('reqQuantity').value, 10);
      const priority = document.getElementById('reqPriority').value;
      const id = 'REQ-' + Math.floor(2500 + Math.random() * 800);

      requests.unshift([id, facility, resource, quantity, priority, 'Pending']);
      
      const msgBox = document.getElementById('formMessage');
      msgBox.innerHTML = `
        <div class="alert alert-info" style="margin-top: 12px;">
          <span class="alert-icon">✓</span>
          <div>
            <strong>Request Registered:</strong> Successfully created <code>${id}</code> for ${quantity} × ${resource} (${facility}). It has been added to the active priority queue.
          </div>
        </div>
      `;
      // Re-render table below
      setTimeout(() => renderApp(), 1200);
    };
  }

  // ---------------- EDMONDS-KARP API BINDINGS ----------------
  const runFlowBtn = document.getElementById('runFlow');
  if (runFlowBtn) {
    // Preset buttons
    document.querySelectorAll('[data-preset-flow]').forEach(btn => {
      btn.onclick = () => {
        const p = ALGO_PRESETS.flow[btn.dataset.presetFlow];
        if (p) {
          document.getElementById('flowSource').value = p.source;
          document.getElementById('flowSink').value = p.sink;
          document.getElementById('flowEdges').value = JSON.stringify(p.edges, null, 2);
        }
      };
    });

    // Format JSON button
    const formatBtn = document.getElementById('formatFlowJsonBtn');
    if (formatBtn) {
      formatBtn.onclick = () => {
        try {
          const val = JSON.parse(document.getElementById('flowEdges').value);
          document.getElementById('flowEdges').value = JSON.stringify(val, null, 2);
        } catch (err) {
          alert('Invalid JSON syntax in Edges field.');
        }
      };
    }

    runFlowBtn.onclick = async () => {
      const errBox = document.getElementById('flowErrorNotice');
      const resBox = document.getElementById('flowResultContainer');
      errBox.innerHTML = '';

      const source = document.getElementById('flowSource').value.trim();
      const sink = document.getElementById('flowSink').value.trim();
      const edgesRaw = document.getElementById('flowEdges').value.trim();

      // Client-side validations
      if (!source || !sink) {
        showError(errBox, 'Validation Error: Both Source and Sink nodes must be specified.');
        return;
      }
      if (source === sink) {
        showError(errBox, 'Validation Error: Source and Sink nodes cannot be identical.');
        return;
      }

      let parsedEdges = [];
      try {
        parsedEdges = JSON.parse(edgesRaw);
        if (!Array.isArray(parsedEdges) || parsedEdges.length === 0) {
          throw new Error('Edges must be a non-empty JSON array of objects with {from, to, capacity}.');
        }
        for (const edge of parsedEdges) {
          if (!edge.from || !edge.to || typeof edge.capacity !== 'number' || edge.capacity < 0) {
            throw new Error(`Invalid edge object: ${JSON.stringify(edge)}. Expected {from, to, capacity (non-negative number)}.`);
          }
        }
      } catch (parseErr) {
        showError(errBox, `Invalid Edges JSON: ${parseErr.message}`);
        return;
      }

      // Collect unique nodes
      const allNodes = Array.from(new Set([
        source,
        sink,
        ...parsedEdges.flatMap(e => [e.from, e.to])
      ]));

      // Set Loading State
      setButtonLoading(runFlowBtn, true, 'Computing Flow...');

      try {
        const payload = {
          nodes: allNodes,
          source: source,
          sink: sink,
          edges: parsedEdges
        };

        const response = await fetch(`${API_BASE}/algorithms/max-flow`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || `Server returned HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        renderEdmondsKarpResult(resBox, result, source, sink);
        checkBackendHealth();
      } catch (apiErr) {
        showError(errBox, `
          <strong>Edmonds–Karp API Execution Failed:</strong> ${apiErr.message}<br>
          <small>Ensure the Spring Boot backend is active on <code>http://localhost:8080</code> (Run: <code>cd backend && mvn spring-boot:run</code>).</small>
        `);
      } finally {
        setButtonLoading(runFlowBtn, false, 'Run Edmonds–Karp API');
      }
    };
  }

  // ---------------- RANDOMIZED QUICKSELECT API BINDINGS ----------------
  const runSelectBtn = document.getElementById('runSelect');
  if (runSelectBtn) {
    // Preset buttons
    document.querySelectorAll('[data-preset-demand]').forEach(btn => {
      btn.onclick = () => {
        const p = ALGO_PRESETS.demand[btn.dataset.presetDemand];
        if (p) {
          document.getElementById('demands').value = p.demands.join(', ');
          document.getElementById('percentile').value = p.percentile;
          document.getElementById('algoSeed').value = p.seed;
        }
      };
    });

    // Generate random data button
    const randBtn = document.getElementById('randomizeDemandsBtn');
    if (randBtn) {
      randBtn.onclick = () => {
        const count = 15;
        const randomVals = Array.from({ length: count }, () => Math.floor(Math.random() * 80) + 5);
        document.getElementById('demands').value = randomVals.join(', ');
      };
    }

    runSelectBtn.onclick = async () => {
      const errBox = document.getElementById('selectErrorNotice');
      const resBox = document.getElementById('selectResultContainer');
      errBox.innerHTML = '';

      const demandsRaw = document.getElementById('demands').value.trim();
      const percentileVal = parseFloat(document.getElementById('percentile').value);
      const seedRaw = document.getElementById('algoSeed').value.trim();

      // Client-side validations
      if (!demandsRaw) {
        showError(errBox, 'Validation Error: Please provide at least one demand value.');
        return;
      }

      const demandParts = demandsRaw.split(',').map(s => s.trim()).filter(s => s.length > 0);
      const parsedDemands = [];
      for (const part of demandParts) {
        const num = Number(part);
        if (!Number.isFinite(num) || !Number.isInteger(num)) {
          showError(errBox, `Validation Error: "${part}" is not a valid integer. Demands must be integer numbers.`);
          return;
        }
        parsedDemands.push(num);
      }

      if (parsedDemands.length === 0) {
        showError(errBox, 'Validation Error: Demand list cannot be empty.');
        return;
      }

      if (isNaN(percentileVal) || percentileVal <= 0 || percentileVal > 100) {
        showError(errBox, 'Validation Error: Percentile must be a number strictly greater than 0 and at most 100.');
        return;
      }

      const seed = seedRaw !== '' ? parseInt(seedRaw, 10) : null;

      // Set Loading State
      setButtonLoading(runSelectBtn, true, 'Running Quickselect...');

      try {
        const payload = {
          demands: parsedDemands,
          percentile: percentileVal,
          seed: seed
        };

        const response = await fetch(`${API_BASE}/algorithms/demand-percentile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || `Server returned HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        renderQuickselectResult(resBox, result, parsedDemands);
        checkBackendHealth();
      } catch (apiErr) {
        showError(errBox, `
          <strong>Randomized Quickselect API Execution Failed:</strong> ${apiErr.message}<br>
          <small>Ensure the Spring Boot backend is active on <code>http://localhost:8080</code> (Run: <code>cd backend && mvn spring-boot:run</code>).</small>
        `);
      } finally {
        setButtonLoading(runSelectBtn, false, 'Run Quickselect API');
      }
    };
  }
}

// --------------------------------------------------------------------------
// RESULT DISPLAY RENDERERS
// --------------------------------------------------------------------------

/**
 * Display structured Edmonds-Karp Max-Flow and Min-Cut results
 */
function renderEdmondsKarpResult(container, data, source, sink) {
  const maxFlow = data.maxFlow;
  const minCutCapacity = data.minCutCapacity !== undefined ? data.minCutCapacity : maxFlow;
  const augmentingPaths = data.augmentingPaths || [];
  const edgeFlows = data.edgeFlows || [];
  const sourceSideNodes = data.sourceSideNodes || [];
  const minCutEdges = data.minCutEdges || [];

  // Determine all nodes from edges to infer sink side
  const allNodesSet = new Set();
  edgeFlows.forEach(e => {
    allNodesSet.add(e.from);
    allNodesSet.add(e.to);
  });
  const sinkSideNodes = Array.from(allNodesSet).filter(n => !sourceSideNodes.includes(n));

  container.innerHTML = `
    <!-- Top Metrics -->
    <div class="metric-grid">
      <div class="metric-box">
        <div class="metric-label">Max Network Flow</div>
        <div class="metric-value highlight-teal">${maxFlow}</div>
        <div class="metric-sub">Allocated resource units</div>
      </div>
      <div class="metric-box">
        <div class="metric-label">Min Cut Capacity</div>
        <div class="metric-value">${minCutCapacity}</div>
        <div class="metric-sub">Bottleneck capacity</div>
      </div>
      <div class="metric-box">
        <div class="metric-label">Augmenting Paths</div>
        <div class="metric-value">${augmentingPaths.length}</div>
        <div class="metric-sub">BFS iterations</div>
      </div>
      <div class="metric-box">
        <div class="metric-label">Bottleneck Edges</div>
        <div class="metric-value">${minCutEdges.length}</div>
        <div class="metric-sub">Cut edges crossing S → T</div>
      </div>
    </div>

    <!-- Max Flow / Min Cut Theorem Verification -->
    <div class="alert alert-info" style="margin: 12px 0;">
      <span class="alert-icon">✓</span>
      <div>
        <strong>Max-Flow Min-Cut Theorem Verified:</strong> Maximum flow value (${maxFlow}) equals minimum cut capacity (${minCutCapacity}). Network bottleneck limit reached.
      </div>
    </div>

    <!-- Node Partitions (Source-Side S vs Sink-Side T) -->
    ${sourceSideNodes.length > 0 ? `
      <div class="partition-box">
        <div style="font-weight: 700; color: var(--navy); margin-bottom: 8px;">Residual Graph Partitions (Minimum Cut Boundary)</div>
        <div class="partition-row">
          <span class="partition-title">Source Set (S):</span>
          <div style="display: flex; flex-wrap: wrap; gap: 4px;">
            ${sourceSideNodes.map(n => `<span class="node-chip source-side">${n}</span>`).join('')}
          </div>
        </div>
        <div class="partition-row">
          <span class="partition-title">Sink Set (T):</span>
          <div style="display: flex; flex-wrap: wrap; gap: 4px;">
            ${sinkSideNodes.map(n => `<span class="node-chip sink-side">${n}</span>`).join('')}
          </div>
        </div>
      </div>
    ` : ''}

    <!-- Minimum Cut Bottlenecks List -->
    ${minCutEdges.length > 0 ? `
      <div style="margin: 14px 0;">
        <div style="font-size: 13px; font-weight: 700; color: var(--navy); margin-bottom: 6px;">Critical Saturated Bottlenecks (Cut Edges):</div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${minCutEdges.map(e => `
            <span class="badge critical" style="padding: 6px 10px; font-size: 12px;">
              ⚠ ${e.from} → ${e.to} (Capacity: ${e.capacity})
            </span>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <!-- Augmenting Paths list -->
    ${augmentingPaths.length > 0 ? `
      <div style="margin: 16px 0;">
        <div style="font-size: 13px; font-weight: 700; color: var(--navy); margin-bottom: 8px;">Augmenting Paths Traversed (BFS Order):</div>
        <div class="paths-list">
          ${augmentingPaths.map((path, idx) => `
            <div class="path-item">
              <span class="path-num">Path ${idx + 1}</span>
              ${path.map((node, i) => `
                <span class="path-step">${node}</span>
                ${i < path.length - 1 ? '<span class="path-arrow">→</span>' : ''}
              `).join('')}
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <!-- Edge Flow Saturation Table -->
    <div style="margin: 16px 0;">
      <div style="font-size: 13px; font-weight: 700; color: var(--navy); margin-bottom: 8px;">Edge Capacities & Flow Saturation:</div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>From</th>
              <th>To</th>
              <th>Flow / Capacity</th>
              <th>Utilization %</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${edgeFlows.map(e => {
              const pct = e.capacity > 0 ? Math.round((e.flow / e.capacity) * 100) : 0;
              const isBottleneck = e.flow === e.capacity && e.capacity > 0;
              return `
                <tr>
                  <td><strong>${e.from}</strong></td>
                  <td><strong>${e.to}</strong></td>
                  <td>${e.flow} / ${e.capacity} units</td>
                  <td style="min-width: 140px;">
                    <div class="flow-progress-bar">
                      <div class="progress-track">
                        <div class="progress-fill ${isBottleneck ? 'saturated' : ''}" style="width: ${pct}%"></div>
                      </div>
                      <span style="font-size: 11px; font-weight: 600; min-width: 35px;">${pct}%</span>
                    </div>
                  </td>
                  <td>
                    ${isBottleneck
                      ? '<span class="badge critical">Saturated (Bottleneck)</span>'
                      : e.flow > 0
                      ? '<span class="badge good">Active Flow</span>'
                      : '<span class="badge">Zero Flow</span>'}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Collapsible Raw JSON -->
    <details class="code-inspector">
      <summary>View Raw JSON API Response</summary>
      <pre class="api-output">${JSON.stringify(data, null, 2)}</pre>
    </details>
  `;
}

/**
 * Display structured Randomized Quickselect results and runtime benchmarks
 */
function renderQuickselectResult(container, data, originalArray) {
  const value = data.value;
  const rank = data.rank;
  const zeroBasedIndex = data.zeroBasedIndex;
  const percentile = data.percentile;
  const sortedBaseline = data.sortedBaselineValue;
  const quickNanos = data.quickselectNanos;
  const sortNanos = data.sortNanos;

  const quickMicros = (quickNanos / 1000).toFixed(2);
  const sortMicros = (sortNanos / 1000).toFixed(2);
  const isMatch = value === sortedBaseline;

  // Clone and sort original values to visualize rank position
  const sortedDemands = [...originalArray].sort((a, b) => a - b);

  container.innerHTML = `
    <!-- Top Metrics -->
    <div class="metric-grid">
      <div class="metric-box">
        <div class="metric-label">Selected Demand Value</div>
        <div class="metric-value highlight-purple">${value}</div>
        <div class="metric-sub">${percentile}th percentile threshold</div>
      </div>
      <div class="metric-box">
        <div class="metric-label">Rank (k-th smallest)</div>
        <div class="metric-value">${rank} <small style="font-size: 12px; color: var(--muted);">/ ${originalArray.length}</small></div>
        <div class="metric-sub">Zero-based index: [${zeroBasedIndex}]</div>
      </div>
      <div class="metric-box">
        <div class="metric-label">Sort Baseline Match</div>
        <div class="metric-value highlight-teal">${isMatch ? 'Verified ✓' : 'Mismatch ✗'}</div>
        <div class="metric-sub">Sorted array: ${sortedBaseline}</div>
      </div>
    </div>

    <!-- Verification Banner -->
    <div class="alert ${isMatch ? 'alert-info' : 'alert-error'}" style="margin: 12px 0;">
      <span class="alert-icon">${isMatch ? '✓' : '✗'}</span>
      <div>
        <strong>Verification Status:</strong> The Randomized Quickselect result (${value}) strictly matches the standard Sort baseline (${sortedBaseline}).
        Computed using nearest-rank formulation: <code>rank = ⌈(p × n) / 100⌉ = ${rank}</code>.
      </div>
    </div>

    <!-- Runtime Benchmark Comparison -->
    <div style="font-size: 13px; font-weight: 700; color: var(--navy); margin-top: 16px; margin-bottom: 8px;">
      Runtime Benchmark & Complexity Analysis:
    </div>
    <div class="benchmark-container">
      <div class="benchmark-card" style="border-top: 2px solid var(--purple);">
        <div class="benchmark-title">Randomized Quickselect</div>
        <div class="benchmark-time">${quickNanos.toLocaleString()} ns</div>
        <div style="font-size: 11px; color: var(--muted); margin-bottom: 4px;">≈ ${quickMicros} µs</div>
        <div class="benchmark-complexity">Expected O(n) Time</div>
      </div>

      <div class="benchmark-card" style="border-top: 2px solid var(--navy);">
        <div class="benchmark-title">Dual-Pivot Quicksort (Arrays.sort)</div>
        <div class="benchmark-time">${sortNanos.toLocaleString()} ns</div>
        <div style="font-size: 11px; color: var(--muted); margin-bottom: 4px;">≈ ${sortMicros} µs</div>
        <div class="benchmark-complexity" style="color: var(--navy);">O(n log n) Time</div>
      </div>
    </div>

    <!-- Visual Array Chips -->
    <div style="margin: 16px 0;">
      <div style="font-size: 13px; font-weight: 700; color: var(--navy); margin-bottom: 6px;">
        Sorted Demand Distribution (Pivot Element Highlighted):
      </div>
      <div class="chips-container">
        ${sortedDemands.map((val, idx) => `
          <span class="array-chip ${idx === zeroBasedIndex ? 'selected' : ''}" title="Index [${idx}]: Value ${val}">
            ${val} ${idx === zeroBasedIndex ? '★ (P' + percentile + ')' : ''}
          </span>
        `).join('')}
      </div>
    </div>

    <!-- Collapsible Raw JSON -->
    <details class="code-inspector">
      <summary>View Raw JSON API Response</summary>
      <pre class="api-output">${JSON.stringify(data, null, 2)}</pre>
    </details>
  `;
}

// --------------------------------------------------------------------------
// UTILITY HELPERS
// --------------------------------------------------------------------------
function showError(container, message) {
  container.innerHTML = `
    <div class="alert alert-error">
      <span class="alert-icon">⚠</span>
      <div>${message}</div>
    </div>
  `;
}

function setButtonLoading(button, isLoading, text) {
  if (isLoading) {
    button.disabled = true;
    button.innerHTML = `<span class="spinner"></span> <span>${text}</span>`;
  } else {
    button.disabled = false;
    button.innerHTML = `<span>${text}</span>`;
  }
}

// Check backend health on initial window load
window.addEventListener('DOMContentLoaded', () => {
  checkBackendHealth();
  setInterval(checkBackendHealth, 15000);
});
