class HomeAssistantAPI {
    constructor() {
        this.entities = {};
        this.listeners = [];
        this.isConnected = false;
        this.ws = null;
        this.msgId = 1;
    }

    async connect() {
        console.log("Connecting to Home Assistant...");
        
        const haUrl = window.CONFIG?.HA_URL || 'http://homeassistant.local:8123';
        const haToken = window.CONFIG?.HA_TOKEN;

        if (haToken && haToken !== "YOUR_LONG_LIVED_ACCESS_TOKEN_HERE") {
            const wsUrl = haUrl.replace(/^http/, 'ws') + '/api/websocket';
            console.log("HA Token found, connecting to WS:", wsUrl);
            
            this.ws = new WebSocket(wsUrl);

            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                
                if (data.type === 'auth_required') {
                    this.ws.send(JSON.stringify({ type: 'auth', access_token: haToken }));
                } else if (data.type === 'auth_ok') {
                    console.log("HA WebSocket Auth OK");
                    this.isConnected = true;
                    // Get initial states
                    this.ws.send(JSON.stringify({ id: this.msgId++, type: 'get_states' }));
                    // Subscribe to state changes
                    this.ws.send(JSON.stringify({ id: this.msgId++, type: 'subscribe_events', event_type: 'state_changed' }));
                } else if (data.type === 'auth_invalid') {
                    console.error("HA WebSocket Auth Invalid");
                } else if (data.type === 'result') {
                    // Initial states fallback (if get_states was id: 1)
                    if (data.id === 1 && Array.isArray(data.result)) {
                        const newEntities = {};
                        data.result.forEach(entity => {
                            newEntities[entity.entity_id] = entity;
                        });
                        this.entities = newEntities;
                        console.log("Initial states loaded.");
                        this.notifyListeners();
                    }
                } else if (data.type === 'event' && data.event.event_type === 'state_changed') {
                    const entity_id = data.event.data.entity_id;
                    const new_state = data.event.data.new_state;
                    if (new_state) {
                        // Create a new reference of entities to trigger standard HA Custom Card renders
                        this.entities = {
                            ...this.entities,
                            [entity_id]: new_state
                        };
                        // Real-time UI update
                        this.notifyListeners();
                    }
                }
            };

            this.ws.onclose = () => {
                console.log("HA WebSocket Disconnected. Reconnecting in 5s...");
                this.isConnected = false;
                setTimeout(() => this.connect(), 5000);
            };
            
            this.ws.onerror = (err) => console.error("HA WS Error:", err);
            
        } else {
            console.log("No valid token, falling back to local mock data.");
            try {
                const response = await fetch('ha_entities.json');
                if (!response.ok) throw new Error("Failed to load entities file");
                
                const data = await response.json();
                
                const newEntities = {};
                data.forEach(entity => {
                    newEntities[entity.entity_id] = entity;
                });
                this.entities = newEntities;
                
                this.isConnected = true;
                console.log("Connected! Loaded entities:", Object.keys(this.entities).length);
                this.notifyListeners();
                
            } catch (error) {
                console.error("Connection error:", error);
            }
        }
    }

    subscribe(callback) {
        this.listeners.push(callback);
        if (this.isConnected) {
            callback(this.entities);
        }
    }

    notifyListeners() {
        this.listeners.forEach(callback => callback(this.entities));
    }

    callService(domain, service, serviceData = {}) {
        if (this.ws && this.isConnected) {
            this.ws.send(JSON.stringify({
                id: this.msgId++,
                type: 'call_service',
                domain: domain,
                service: service,
                service_data: serviceData
            }));
        } else {
            console.log(`[MOCK] Calling service: ${domain}.${service}`, serviceData);
            
            // Mock state change
            if (serviceData.entity_id && this.entities[serviceData.entity_id]) {
                const entity = { ...this.entities[serviceData.entity_id] };
                if (service === 'turn_on') {
                    entity.state = 'on';
                    if (serviceData.brightness !== undefined) {
                        entity.attributes = { ...entity.attributes, brightness: serviceData.brightness };
                    }
                } else if (service === 'turn_off') {
                    entity.state = 'off';
                } else if (service === 'toggle') {
                    entity.state = entity.state === 'on' ? 'off' : 'on';
                }
                
                this.entities = {
                    ...this.entities,
                    [serviceData.entity_id]: entity
                };
                
                this.notifyListeners();
            }
        }
    }
}

// Export singleton instance
const ha = new HomeAssistantAPI();
window.ha = ha;