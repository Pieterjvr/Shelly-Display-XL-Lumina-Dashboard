document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI
    const ui = new UI(window.ha);
    
    // Connect to HA (loads local JSON for now)
    window.ha.connect();
    
    // --- View Navigation Logic ---
    const viewSections = document.querySelectorAll('.view-section');
    
    function switchView(viewId) {
        viewSections.forEach(section => {
            if (section.id === viewId) {
                section.classList.remove('hidden');
            } else {
                section.classList.add('hidden');
            }
        });
        resetIdleTimer();
    }

    // Quick Access Tiles click handlers
    const quickTiles = document.querySelectorAll('.quick-tile');
    quickTiles.forEach(tile => {
        tile.addEventListener('click', () => {
            if (tile.dataset.target) {
                switchView(tile.dataset.target);
            }
        });
    });
    
    // Back buttons click handlers
    const backBtns = document.querySelectorAll('.back-btn');
    backBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.dataset.back) {
                switchView(btn.dataset.back);
            }
        });
    });

    // Sidebar
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (item.dataset.view) {
                switchView(item.dataset.view);
            }
        });
    });

    // --- Idle Auto-Return Logic (Tablet specific) ---
    const IDLE_TIMEOUT_MS = 30000; // 30 seconds
    let idleTimer = null;

    function resetIdleTimer() {
        clearTimeout(idleTimer);
        
        // Find current active view
        const activeSection = document.querySelector('.view-section:not(.hidden)');
        if (!activeSection) return;

        // If not on energy-view, start the return timer
        if (activeSection.id !== 'energy-view') {
            idleTimer = setTimeout(() => {
                console.log("Idle timeout reached. Returning to energy-view.");
                switchView('energy-view');
            }, IDLE_TIMEOUT_MS);
        }
    }

    // Listen for user activity to reset the timer
    ['touchstart', 'mousemove', 'mousedown', 'keydown', 'click'].forEach(evt => {
        document.addEventListener(evt, () => {
            // Only reset if we are not on the main dashboard to save cycles
            const activeSection = document.querySelector('.view-section:not(.hidden)');
            if (activeSection && activeSection.id !== 'energy-view') {
                resetIdleTimer();
            }
        }, { passive: true });
    });

    // Update Clock occasionally
    setInterval(() => {
        if (ui && typeof ui.updateClock === 'function') {
            ui.updateClock();
        }
    }, 1000 * 30); // 30 seconds update loop for clock
});
