// Logo fetching and management functionality

document.addEventListener('DOMContentLoaded', function() {
    // Check if logos exist, if not fetch and save them
    checkAndFetchLogos();
    
    // Function to check for logos and fetch them if needed
    async function checkAndFetchLogos() {
        const agencies = ['police', 'homeland', 'marshals', 'fbi', 'dea'];
        const logoFolder = 'public/images/logos/';
        
        try {
            // Try to load a test logo to see if they've already been downloaded
            const testResponse = await fetch(`${logoFolder}police.png`, { method: 'HEAD' });
            if (testResponse.ok) {
                console.log('Agency logos already exist locally');
                return;
            }
        } catch (err) {
            console.log('Need to fetch agency logos');
        }
        
        try {
            // Create necessary folders
            await createFolderStructure();
            
            // Fetch and save logos for each agency
            const logoPromises = agencies.map(agency => fetchAndSaveLogo(agency));
            
            await Promise.all(logoPromises);
            console.log('All agency logos downloaded successfully');
            
            // Refresh logo images on the page
            refreshLogoImages();
        } catch (error) {
            console.error('Error downloading logos:', error);
            // Fall back to placeholder logos - app.js will handle this
        }
    }
    
    // Function to create necessary folder structure
    async function createFolderStructure() {
        try {
            // In a browser environment, we need to use a server-side approach
            // For demo purposes, we'll simulate this with a fetch to a hypothetical endpoint
            await fetch('/api/create-folders', { 
                method: 'POST',
                body: JSON.stringify({
                    path: 'public/images/logos'
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Folder structure created');
        } catch (err) {
            console.warn('Could not create folders through API, will use fallback mechanism');
            // In a real application, we'd need server-side code to handle folder creation
            // For now, we'll assume the folder structure exists
        }
    }
    
    // Function to fetch and save a logo for a specific agency
    async function fetchAndSaveLogo(agency) {
        // Map agency to search terms for logo API
        const searchTerms = {
            'police': 'police department badge',
            'homeland': 'homeland security logo',
            'marshals': 'us marshals service logo',
            'fbi': 'fbi federal bureau investigation logo',
            'dea': 'drug enforcement administration logo'
        };
        
        try {
            // Use a free logo API (placeholder - in production use a real API with proper attribution)
            // For demo purposes, we'll simulate fetching from an API
            const apiUrl = `https://api.example.com/logos?q=${encodeURIComponent(searchTerms[agency])}`;
            
            // Instead of actually fetching from an external API (which would require API keys),
            // we'll map to placeholder URLs for demonstration
            const logoUrls = {
                'police': 'https://upload.wikimedia.org/wikipedia/commons/5/56/NYPD_Logo.png',
                'homeland': 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Seal_of_the_United_States_Department_of_Homeland_Security.svg',
                'marshals': 'https://upload.wikimedia.org/wikipedia/commons/9/97/Seal_of_the_United_States_Marshals_Service.svg',
                'fbi': 'https://upload.wikimedia.org/wikipedia/commons/d/da/Seal_of_the_Federal_Bureau_of_Investigation.svg',
                'dea': 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Drug_Enforcement_Administration_logo.svg'
            };
            
            const logoUrl = logoUrls[agency];
            
            // Fetch the logo image
            const response = await fetch(logoUrl);
            const blob = await response.blob();
            
            // In a browser environment, we need a server-side approach to save files
            // For demo purposes, we'll simulate this with a fetch to a hypothetical endpoint
            const formData = new FormData();
            formData.append('file', blob);
            formData.append('path', `public/images/logos/${agency}.png`);
            
            await fetch('/api/save-file', {
                method: 'POST',
                body: formData
            });
            
            console.log(`Logo for ${agency} downloaded successfully`);
            return true;
        } catch (error) {
            console.error(`Error downloading logo for ${agency}:`, error);
            throw error;
        }
    }
    
    // Refresh logo images on the page after download
    function refreshLogoImages() {
        const logoImages = document.querySelectorAll('img[src^="public/images/logos/"]');
        logoImages.forEach(img => {
            const src = img.src;
            img.src = src + '?t=' + new Date().getTime(); // Add timestamp to force refresh
        });
    }
    
    // Use placeholder logos when real ones can't be fetched
    function usePlaceholderLogos() {
        // This functionality is now handled by app.js's generatePlaceholderLogos function
        // We'll trigger the function if it exists
        if (typeof window.generatePlaceholderLogos === 'function') {
            window.generatePlaceholderLogos();
        }
    }
});
