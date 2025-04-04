// Communication features for inter-agency collaboration

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const sendMessageBtn = document.getElementById('send-message');
    const newMessageInput = document.getElementById('new-message');
    const messageArea = document.getElementById('message-area');

    // Sample messages for demonstration
    const sampleMessages = [
        {
            id: 1,
            sender: { name: 'Officer Smith', agency: 'police' },
            timestamp: '2023-05-15T08:15:00',
            message: 'Team Alpha in position at north entrance.',
            recipientAgencies: ['police', 'homeland']
        },
        {
            id: 2,
            sender: { name: 'Agent Johnson', agency: 'homeland' },
            timestamp: '2023-05-15T08:17:30',
            message: 'Surveillance systems online. No suspicious activity detected.',
            recipientAgencies: ['police', 'homeland']
        },
        {
            id: 3,
            sender: { name: 'Dispatcher', agency: 'police' },
            timestamp: '2023-05-15T08:20:15',
            message: 'Be advised: Traffic congestion reported on Main St. Consider alternate routes for response teams.',
            recipientAgencies: ['police', 'homeland', 'marshals', 'fbi', 'dea']
        }
    ];

    // Initialize comms
    function init() {
        if (!sendMessageBtn || !newMessageInput || !messageArea) {
            console.error('Communications elements not found in the DOM');
            return;
        }

        bindEvents();
        displayMessages();
    }

    // Bind event listeners
    function bindEvents() {
        // Send message button
        sendMessageBtn.addEventListener('click', sendMessage);
        
        // Also allow sending with Enter key
        newMessageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    // Send a new message
    function sendMessage() {
        if (!newMessageInput.value.trim()) return;
        
        const appState = window.appState;
        if (!appState || !appState.isLoggedIn || !appState.currentUser) {
            console.error('No logged in user');
            return;
        }
        
        // Create new message object
        const newMessage = {
            id: Date.now(),
            sender: {
                name: appState.currentUser.name,
                agency: appState.currentAgency
            },
            timestamp: new Date().toISOString(),
            message: newMessageInput.value.trim(),
            recipientAgencies: getRecipientAgencies()
        };
        
        // Add to messages (in a real app, this would be sent to a server)
        sampleMessages.push(newMessage);
        
        // Update UI
        displayMessages();
        
        // Clear input
        newMessageInput.value = '';
    }

    // Get recipient agencies based on current context
    function getRecipientAgencies() {
        const appState = window.appState;
        if (!appState) {
            return ['police', 'homeland', 'marshals', 'fbi', 'dea']; // Default to all
        }
        
        // If there's an active mission, use its participating agencies
        if (appState.activeMission && appState.activeMission.participatingAgencies) {
            return [...appState.activeMission.participatingAgencies];
        }
        
        // Otherwise, just use current agency
        return [appState.currentAgency];
    }

    // Display messages
    function displayMessages() {
        if (!messageArea) return;
        
        const appState = window.appState;
        if (!appState || !appState.currentAgency) {
            console.error('Application state not accessible');
            return;
        }
        
        // Clear existing messages
        messageArea.innerHTML = '';
        
        // Show only messages relevant to current agency
        const relevantMessages = sampleMessages.filter(msg => 
            msg.recipientAgencies.includes(appState.currentAgency)
        );
        
        relevantMessages.sort((a, b) => 
            new Date(a.timestamp) - new Date(b.timestamp)
        );
        
        // Display messages
        relevantMessages.forEach(msg => {
            const msgElement = document.createElement('div');
            msgElement.className = `message ${msg.sender.agency === appState.currentAgency ? 'own-message' : 'other-message'}`;
            
            const timestamp = new Date(msg.timestamp);
            
            msgElement.innerHTML = `
                <div class="message-header">
                    <span class="sender">${msg.sender.name} (${getAgencyDisplayName(msg.sender.agency)})</span>
                    <span class="timestamp">${formatTime(timestamp)}</span>
                </div>
                <div class="message-body">
                    ${msg.message}
                </div>
            `;
            
            messageArea.appendChild(msgElement);
        });
        
        // Scroll to bottom
        messageArea.scrollTop = messageArea.scrollHeight;
    }

    // Format time for display
    function formatTime(date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Get display name for agency
    function getAgencyDisplayName(agency) {
        const agencies = {
            'police': 'Police',
            'homeland': 'Homeland',
            'marshals': 'Marshals',
            'fbi': 'FBI',
            'dea': 'DEA'
        };
        return agencies[agency] || agency;
    }

    // Initialize when the DOM is loaded
    init();

    // Update messages when tab is clicked
    const commsTab = document.querySelector('[data-tab="comms"]');
    if (commsTab) {
        commsTab.addEventListener('click', displayMessages);
    }

    // Make function available globally
    window.refreshComms = displayMessages;
});

// Setup real-time communication (simulated for demo)
function setupRealTimeComms() {
    // In a real application, this would set up WebSockets or similar
    console.log('Setting up real-time communication...');
    
    // Simulate incoming messages
    setInterval(() => {
        // Check if user is logged in
        const appState = window.appState;
        if (!appState || !appState.isLoggedIn) {
            return;
        }
        
        // 10% chance of receiving a new message
        if (Math.random() < 0.1) {
            simulateIncomingMessage();
        }
    }, 30000); // Check every 30 seconds
}

// Simulate an incoming message
function simulateIncomingMessage() {
    const appState = window.appState;
    if (!appState) return;
    
    // Sample messages
    const messages = [
        "Status update: All units in position.",
        "Be advised: Weather conditions may impact visibility in sector 3.",
        "Intelligence update: Target vehicle identified heading eastbound on Main St.",
        "Request backup at southeast perimeter.",
        "Surveillance team reports all clear at primary location."
    ];
    
    // Sample senders (different from current user)
    const senders = [
        { name: 'Officer Rodriguez', agency: 'police' },
        { name: 'Agent Thompson', agency: 'homeland' },
        { name: 'Marshal Davis', agency: 'marshals' },
        { name: 'Special Agent Morris', agency: 'fbi' },
        { name: 'Agent Wilson', agency: 'dea' }
    ].filter(sender => sender.agency !== appState.currentAgency);
    
    if (senders.length === 0) return;
    
    // Select random message and sender
    const message = messages[Math.floor(Math.random() * messages.length)];
    const sender = senders[Math.floor(Math.random() * senders.length)];
    
    // Create new message
    const newMessage = {
        id: Date.now(),
        sender: sender,
        timestamp: new Date().toISOString(),
        message: message,
        recipientAgencies: getRecipientAgencies()
    };
    
    // Add to messages
    if (typeof sampleMessages !== 'undefined') {
        sampleMessages.push(newMessage);
        
        // Update UI if on comms tab
        if (document.querySelector('#comms.active')) {
            window.refreshComms();
        }
    }
}

// Initialize real-time comms simulation
document.addEventListener('DOMContentLoaded', setupRealTimeComms);
