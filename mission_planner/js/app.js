// Main application JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Application state
    const state = {
        currentUser: null,
        currentAgency: null,
        isLoggedIn: false,
        missions: [],
        activeMission: null,
        warningAcknowledged: false,
        users: {
            // Sample user data - in a real app this would come from a secure backend
            'police_user': { password: 'police123', name: 'Officer Smith', agency: 'police', role: 'field' },
            'homeland_user': { password: 'homeland123', name: 'Agent Johnson', agency: 'homeland', role: 'admin' },
            'marshal_user': { password: 'marshal123', name: 'Marshal Brown', agency: 'marshals', role: 'supervisor' },
            'fbi_user': { password: 'fbi123', name: 'Special Agent Cooper', agency: 'fbi', role: 'analyst' },
            'dea_user': { password: 'dea123', name: 'Agent Rodriguez', agency: 'dea', role: 'field' }
        }
    };

    // DOM Elements
    const loginForm = document.getElementById('login-form');
    const loginPanel = document.getElementById('login-panel');
    const dashboard = document.getElementById('dashboard');
    const currentUserEl = document.getElementById('current-user');
    const currentAgencyEl = document.getElementById('current-agency');
    const currentAgencyLogo = document.getElementById('current-agency-logo');
    const logoutBtn = document.getElementById('logout-btn');
    const tabs = document.querySelectorAll('.sidebar nav ul li');
    const tabContents = document.querySelectorAll('.tab-content');
    const createMissionBtn = document.getElementById('create-mission');
    const missionForm = document.getElementById('mission-form');
    const activeMissionsList = document.getElementById('active-missions');
    const governmentWarning = document.getElementById('gov-warning');
    const acknowledgeBtn = document.getElementById('acknowledge-btn');
    const agencyLogos = document.querySelectorAll('.agency-logo');
    const collabAgencyLogos = document.getElementById('collab-agency-logos');

    // Sample mission data
    const sampleMissions = [
        {
            id: 1,
            name: 'Operation Eagle Eye',
            description: 'Surveillance operation in downtown area',
            leadAgency: 'police',
            participatingAgencies: ['police', 'homeland'],
            status: 'active',
            startTime: '2023-05-15T08:00',
            endTime: '2023-05-15T16:00',
            location: { lat: 34.0522, lng: -118.2437 }
        },
        {
            id: 2,
            name: 'Operation Swift Justice',
            description: 'High-risk warrant execution',
            leadAgency: 'marshals',
            participatingAgencies: ['marshals', 'police', 'dea'],
            status: 'planning',
            startTime: '2023-05-20T06:00',
            endTime: '2023-05-20T12:00',
            location: { lat: 34.0522, lng: -118.2437 }
        }
    ];

    // Initialize application
    function init() {
        state.missions = sampleMissions;
        bindEvents();
        renderMissions();
        showGovernmentWarning();
        
        // Create necessary directories for logo storage if using the server
        ensureLogoDirectories();
    }

    // Ensure logo directories exist
    function ensureLogoDirectories() {
        // This is a client-side check to make sure logo directories are created
        // The actual creation happens on the server side via the logos.js script
        fetch('/api/create-folders', { 
            method: 'POST',
            body: JSON.stringify({
                path: 'public/images/logos'
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).catch(err => {
            console.log('Server API not available, will use placeholder logos');
            // If the server API is not available, we'll use placeholder images
            generatePlaceholderLogos();
        });
    }
    
    // Generate placeholder logos client-side as a fallback
    function generatePlaceholderLogos() {
        const agencies = ['police', 'homeland', 'marshals', 'fbi', 'dea'];
        
        // For each agency, create a simple colored div as a logo placeholder
        agencies.forEach(agency => {
            // We're creating placeholders directly in the DOM since we can't write files
            const logos = document.querySelectorAll(`.agency-logo[data-agency="${agency}"]`);
            
            logos.forEach(logo => {
                // Get the parent element
                const parent = logo.parentElement;
                
                // Create a placeholder div
                const placeholder = document.createElement('div');
                placeholder.className = 'agency-logo placeholder';
                placeholder.setAttribute('data-agency', agency);
                
                // Set agency-specific styles
                switch(agency) {
                    case 'police':
                        placeholder.style.backgroundColor = '#0038a8';
                        placeholder.textContent = 'POLICE';
                        placeholder.style.color = 'white';
                        break;
                    case 'homeland':
                        placeholder.style.backgroundColor = '#003366';
                        placeholder.textContent = 'DHS';
                        placeholder.style.color = '#ffd700';
                        break;
                    case 'marshals':
                        placeholder.style.backgroundColor = '#8b0000';
                        placeholder.textContent = 'MARSHALS';
                        placeholder.style.color = 'white';
                        break;
                    case 'fbi':
                        placeholder.style.backgroundColor = '#000000';
                        placeholder.textContent = 'FBI';
                        placeholder.style.color = '#ffd700';
                        break;
                    case 'dea':
                        placeholder.style.backgroundColor = '#006400';
                        placeholder.textContent = 'DEA';
                        placeholder.style.color = 'white';
                        break;
                }
                
                // Replace the img with our placeholder
                parent.replaceChild(placeholder, logo);
                
                // Add click event to placeholders
                placeholder.addEventListener('click', function() {
                    const selectedAgency = this.getAttribute('data-agency');
                    document.getElementById('agency').value = selectedAgency;
                    
                    // Update visual selection
                    document.querySelectorAll('.agency-logo').forEach(l => l.classList.remove('selected'));
                    this.classList.add('selected');
                });
            });
        });
    }

    // Show government warning popup
    function showGovernmentWarning() {
        if (state.warningAcknowledged) {
            governmentWarning.style.display = 'none';
            return;
        }
        
        governmentWarning.style.display = 'flex';
    }

    // Bind event listeners
    function bindEvents() {
        // Government warning acknowledgment
        acknowledgeBtn.addEventListener('click', function() {
            state.warningAcknowledged = true;
            governmentWarning.style.display = 'none';
        });
        
        // Agency logo selection
        agencyLogos.forEach(logo => {
            logo.addEventListener('click', function() {
                const selectedAgency = this.getAttribute('data-agency');
                document.getElementById('agency').value = selectedAgency;
                
                // Update visual selection
                agencyLogos.forEach(l => l.classList.remove('selected'));
                this.classList.add('selected');
            });
        });

        // Login form submission
        loginForm.addEventListener('submit', handleLogin);

        // Logout button
        logoutBtn.addEventListener('click', handleLogout);

        // Tab navigation
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('data-tab');
                activateTab(tabId);
            });
        });

        // Create mission button
        createMissionBtn.addEventListener('click', () => {
            activateTab('planning');
        });

        // Mission form submission
        missionForm.addEventListener('submit', handleMissionSubmit);
    }

    // Handle login form submission
    function handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const agency = document.getElementById('agency').value;

        const user = state.users[username];
        
        if (user && user.password === password && user.agency === agency) {
            state.currentUser = { username, ...user };
            state.currentAgency = agency;
            state.isLoggedIn = true;
            
            // Update UI to show dashboard
            loginPanel.style.display = 'none';
            dashboard.style.display = 'flex';
            currentUserEl.textContent = user.name;
            currentAgencyEl.textContent = `(${getAgencyFullName(agency)})`;
            logoutBtn.style.display = 'block';
            
            // Update agency logo - handle both image and placeholder cases
            if (document.querySelectorAll(`.agency-logo.placeholder[data-agency="${agency}"]`).length > 0) {
                // We're using placeholder divs
                const agencyLogoContainer = document.querySelector('.agency-logo-container');
                if (agencyLogoContainer) {
                    // Remove existing logo
                    while (agencyLogoContainer.firstChild) {
                        agencyLogoContainer.removeChild(agencyLogoContainer.firstChild);
                    }
                    
                    // Create a new placeholder
                    const placeholder = document.createElement('div');
                    placeholder.id = 'current-agency-logo';
                    placeholder.className = 'agency-logo placeholder';
                    placeholder.setAttribute('data-agency', agency);
                    
                    // Set agency-specific styles
                    switch(agency) {
                        case 'police':
                            placeholder.style.backgroundColor = '#0038a8';
                            placeholder.textContent = 'POLICE';
                            placeholder.style.color = 'white';
                            break;
                        case 'homeland':
                            placeholder.style.backgroundColor = '#003366';
                            placeholder.textContent = 'DHS';
                            placeholder.style.color = '#ffd700';
                            break;
                        case 'marshals':
                            placeholder.style.backgroundColor = '#8b0000';
                            placeholder.textContent = 'MARSHALS';
                            placeholder.style.color = 'white';
                            break;
                        case 'fbi':
                            placeholder.style.backgroundColor = '#000000';
                            placeholder.textContent = 'FBI';
                            placeholder.style.color = '#ffd700';
                            break;
                        case 'dea':
                            placeholder.style.backgroundColor = '#006400';
                            placeholder.textContent = 'DEA';
                            placeholder.style.color = 'white';
                            break;
                    }
                    
                    agencyLogoContainer.appendChild(placeholder);
                }
            } else {
                // We're using actual images
                if (currentAgencyLogo) {
                    currentAgencyLogo.src = `public/images/logos/${agency}.png`;
                    currentAgencyLogo.alt = getAgencyFullName(agency) + " Logo";
                }
            }

            // Load agency-specific data
            loadAgencyData(agency);
            
            // Update collaborating agencies display
            updateCollaboratingAgencies();
            
            // Fix app.__vue__ reference for map functionality
            // Since we're not using Vue, we need to make this object available
            if (!window.app) {
                window.app = { __vue__: { state: state } };
            }
        } else {
            alert('Invalid credentials. Please try again.');
        }
    }

    // Handle logout
    function handleLogout() {
        state.currentUser = null;
        state.currentAgency = null;
        state.isLoggedIn = false;
        
        // Update UI to show login
        loginPanel.style.display = 'block';
        dashboard.style.display = 'none';
        loginForm.reset();
        logoutBtn.style.display = 'none';
    }

    // Activate a specific tab
    function activateTab(tabId) {
        tabs.forEach(tab => {
            if (tab.getAttribute('data-tab') === tabId) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        tabContents.forEach(content => {
            if (content.id === tabId) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
        
        // Special actions for specific tabs
        if (tabId === 'map') {
            // Initialize map if not already done
            if (typeof initMap === 'function') {
                setTimeout(initMap, 100); // Small delay to ensure the map container is visible
            }
        }
    }

    // Handle mission form submission
    function handleMissionSubmit(e) {
        e.preventDefault();
        
        const missionName = document.getElementById('mission-name').value;
        const missionDesc = document.getElementById('mission-desc').value;
        const missionStart = document.getElementById('mission-start').value;
        const missionEnd = document.getElementById('mission-end').value;
        
        // Get selected agencies
        const agenciesSelect = document.getElementById('mission-agencies');
        const selectedAgencies = Array.from(agenciesSelect.selectedOptions).map(option => option.value);
        
        // Add current agency if not already included
        if (!selectedAgencies.includes(state.currentAgency)) {
            selectedAgencies.push(state.currentAgency);
        }
        
        // Create new mission
        const newMission = {
            id: state.missions.length + 1,
            name: missionName,
            description: missionDesc,
            leadAgency: state.currentAgency,
            participatingAgencies: selectedAgencies,
            status: 'planning',
            startTime: missionStart,
            endTime: missionEnd
        };
        
        // Add to missions array
        state.missions.push(newMission);
        
        // Update UI
        renderMissions();
        missionForm.reset();
        
        // Show success message
        alert('Mission created successfully!');
        
        // Switch to missions tab
        activateTab('missions');
        
        // After adding the new mission, update collaborating agencies display
        updateCollaboratingAgencies();
    }

    // Render missions list
    function renderMissions() {
        activeMissionsList.innerHTML = '';
        
        state.missions.forEach(mission => {
            // Only show missions where current agency is participating
            if (mission.participatingAgencies.includes(state.currentAgency)) {
                const missionElement = document.createElement('div');
                missionElement.className = `mission-item ${mission.status}`;
                missionElement.innerHTML = `
                    <h3>${mission.name}</h3>
                    <p>${mission.description}</p>
                    <div class="mission-meta">
                        <span>Status: ${mission.status}</span>
                        <span>Lead: ${getAgencyFullName(mission.leadAgency)}</span>
                        <span>Start: ${formatDateTime(mission.startTime)}</span>
                    </div>
                `;
                
                missionElement.addEventListener('click', () => {
                    state.activeMission = mission;
                    activateTab('planning');
                    // Populate mission form with selected mission data
                    populateMissionForm(mission);
                });
                
                activeMissionsList.appendChild(missionElement);
            }
        });
    }

    // Populate mission form with existing mission data
    function populateMissionForm(mission) {
        document.getElementById('mission-name').value = mission.name;
        document.getElementById('mission-desc').value = mission.description;
        document.getElementById('mission-start').value = mission.startTime;
        document.getElementById('mission-end').value = mission.endTime;
        
        // Select the participating agencies
        const agenciesSelect = document.getElementById('mission-agencies');
        Array.from(agenciesSelect.options).forEach(option => {
            option.selected = mission.participatingAgencies.includes(option.value);
        });
        
        // Update collaborating agencies
        state.activeMission = mission;
        updateCollaboratingAgencies();
    }

    // Update collaborating agencies display
    function updateCollaboratingAgencies() {
        if (!collabAgencyLogos) return;
        
        collabAgencyLogos.innerHTML = '';
        
        // Determine if we're using placeholders
        const usingPlaceholders = document.querySelectorAll('.agency-logo.placeholder').length > 0;
        
        let agenciesToShow = [];
        
        if (state.activeMission) {
            // Show logos of other agencies in active mission
            agenciesToShow = state.activeMission.participatingAgencies.filter(a => a !== state.currentAgency);
        } else {
            // Show default collaborating agencies
            agenciesToShow = ['homeland', 'fbi', 'police', 'marshals', 'dea']
                .filter(agency => agency !== state.currentAgency)
                .slice(0, 3); // Limit to 3
        }
        
        agenciesToShow.forEach(agency => {
            if (usingPlaceholders) {
                // Create placeholder divs
                const placeholder = document.createElement('div');
                placeholder.className = 'agency-logo placeholder small';
                placeholder.setAttribute('data-agency', agency);
                placeholder.title = getAgencyFullName(agency);
                
                // Set agency-specific styles
                switch(agency) {
                    case 'police':
                        placeholder.style.backgroundColor = '#0038a8';
                        placeholder.textContent = 'P';
                        placeholder.style.color = 'white';
                        break;
                    case 'homeland':
                        placeholder.style.backgroundColor = '#003366';
                        placeholder.textContent = 'DHS';
                        placeholder.style.color = '#ffd700';
                        break;
                    case 'marshals':
                        placeholder.style.backgroundColor = '#8b0000';
                        placeholder.textContent = 'US';
                        placeholder.style.color = 'white';
                        break;
                    case 'fbi':
                        placeholder.style.backgroundColor = '#000000';
                        placeholder.textContent = 'FBI';
                        placeholder.style.color = '#ffd700';
                        break;
                    case 'dea':
                        placeholder.style.backgroundColor = '#006400';
                        placeholder.textContent = 'DEA';
                        placeholder.style.color = 'white';
                        break;
                }
                
                collabAgencyLogos.appendChild(placeholder);
            } else {
                // Use image logos
                const logo = document.createElement('img');
                logo.src = `public/images/logos/${agency}.png`;
                logo.alt = getAgencyFullName(agency);
                logo.title = getAgencyFullName(agency);
                collabAgencyLogos.appendChild(logo);
            }
        });
    }

    // Load agency-specific data
    function loadAgencyData(agency) {
        // Populate personnel list
        const personnelList = document.getElementById('personnel-list');
        personnelList.innerHTML = '';
        
        // Sample data - in a real app this would come from a database
        const personnel = {
            'police': ['Officer Smith', 'Officer Jones', 'Sergeant Davis', 'Lieutenant Chen'],
            'homeland': ['Agent Johnson', 'Agent Williams', 'Analyst Garcia', 'Director Wilson'],
            'marshals': ['Marshal Brown', 'Marshal Rodriguez', 'Deputy Cox', 'Chief Deputy Adams'],
            'fbi': ['Special Agent Cooper', 'Special Agent Mulder', 'Analyst Scully', 'Supervisory Agent Skinner'],
            'dea': ['Agent Rodriguez', 'Agent Thompson', 'Undercover Officer Lee', 'Supervisory Agent Carter']
        };
        
        personnel[agency].forEach(person => {
            const li = document.createElement('li');
            li.textContent = person;
            personnelList.appendChild(li);
        });
        
        // Populate equipment list
        const equipmentList = document.getElementById('equipment-list');
        equipmentList.innerHTML = '';
        
        const equipment = {
            'police': ['Patrol cars (5)', 'Tactical vests (10)', 'Radios (15)', 'Tasers (10)'],
            'homeland': ['Surveillance drones (3)', 'Mobile command center', 'Encrypted radios (8)', 'Tactical gear (5)'],
            'marshals': ['Transport vehicles (3)', 'Body armor (8)', 'Tactical weapons (6)', 'Restraints (15)'],
            'fbi': ['Surveillance equipment', 'Forensic kits (5)', 'Mobile lab', 'Tactical gear (8)'],
            'dea': ['Unmarked vehicles (4)', 'Surveillance equipment', 'Field test kits (10)', 'Body cameras (8)']
        };
        
        equipment[agency].forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            equipmentList.appendChild(li);
        });
        
        // Populate vehicle list
        const vehicleList = document.getElementById('vehicle-list');
        vehicleList.innerHTML = '';
        
        const vehicles = {
            'police': ['Patrol Car 1 (Unit 235)', 'Patrol Car 2 (Unit 412)', 'SWAT Vehicle', 'K9 Unit'],
            'homeland': ['Unmarked SUV (Black)', 'Surveillance Van', 'Command Vehicle', 'Helicopter (Air-1)'],
            'marshals': ['Transport Van 1', 'Transport Van 2', 'Tactical SUV', 'Prisoner Bus'],
            'fbi': ['Unmarked Sedan (B1)', 'Unmarked SUV (B2)', 'Mobile Command Unit', 'Evidence Transport'],
            'dea': ['Unmarked SUV (Gray)', 'Undercover Vehicle 1', 'Undercover Vehicle 2', 'Transport Van']
        };
        
        vehicles[agency].forEach(vehicle => {
            const li = document.createElement('li');
            li.textContent = vehicle;
            vehicleList.appendChild(li);
        });
    }

    // Utility function to get agency full name
    function getAgencyFullName(agency) {
        const agencies = {
            'police': 'Police Department',
            'homeland': 'Homeland Security',
            'marshals': 'US Marshals',
            'fbi': 'FBI',
            'dea': 'DEA'
        };
        return agencies[agency] || agency;
    }

    // Format date time for display
    function formatDateTime(dateTimeStr) {
        if (!dateTimeStr) return 'N/A';
        
        const date = new Date(dateTimeStr);
        return date.toLocaleString();
    }

    // Initialize the application
    init();

    // Make state available globally for other scripts
    window.appState = state;
});
