class UI {
    constructor(haApi) {
        this.ha = haApi;
        
        // Use global CONFIG or fallback to empty structure
        this.config = window.CONFIG?.ENTITIES || {
            lights: {},
            pool: [],
            geyser: [],
            alarms: []
        };

        this.ha.subscribe((entities) => this.updateUI(entities));
        this.renderStaticUI();
    }

    renderStaticUI() {
        // Render Alarm Panels once
        const alarmsContainer = document.getElementById('alarms-container');
        if (alarmsContainer && Array.isArray(this.config.ALARMS)) {
            alarmsContainer.innerHTML = '';
            this.config.ALARMS.forEach(alarm => {
                const name = alarm.name.toLowerCase();
                const div = document.createElement('div');
                div.id = `alarm-${name}-container`;
                div.className = 'alarm-panel glass-panel';
                alarmsContainer.appendChild(div);
                this.renderAlarmPanel(name, div.id, alarm.id);
            });
        }

        // Render Quick Tiles
        const quickTilesContainer = document.getElementById('quick-tiles-container');
        if (quickTilesContainer && Array.isArray(this.config.QUICK_TILES)) {
            quickTilesContainer.innerHTML = '';
            this.config.QUICK_TILES.forEach((tile, index) => {
                const div = document.createElement('div');
                div.className = 'quick-tile';
                div.dataset.target = tile.target;
                
                div.innerHTML = `
                    <span class="mdi ${tile.icon} tile-icon ${tile.color || ''}"></span>
                    <div class="tile-info">
                        <div class="tile-name">${tile.name}</div>
                        <div class="tile-state" id="qt-state-${index}">Loading...</div>
                    </div>
                `;
                
                // Add click listener natively since it's dynamic
                div.addEventListener('click', () => {
                    // switchView is defined in app.js, so we trigger a custom event or click
                    const viewSections = document.querySelectorAll('.view-section');
                    viewSections.forEach(section => {
                        if (section.id === tile.target) {
                            section.classList.remove('hidden');
                        } else {
                            section.classList.add('hidden');
                        }
                    });
                });
                
                quickTilesContainer.appendChild(div);
            });
        }

        // Render Lights, Pool, Geyser static cards
        if (this.config.LIGHTS) {
            Object.keys(this.config.LIGHTS).forEach(room => {
                this.renderGroup(this.config.LIGHTS[room], `lights-${room}-container`);
            });
        }
        
        if (this.config.POOL) this.renderGroup(this.config.POOL, 'pool-entities-container');
        if (this.config.GEYSER) this.renderGroup(this.config.GEYSER, 'geyser-entities-container');

        // Setup Lumina card
        if (!customElements.get('ha-card')) {
            class HaCard extends HTMLElement { constructor() { super(); } }
            customElements.define('ha-card', HaCard);
        }
        
        const luminaCard = document.getElementById('lumina-card');
        const energyConfig = this.config.ENERGY || {};

        if (luminaCard) {
            luminaCard.setConfig({
                type: 'custom:lumina-energy-card',
                sensor_pv_total: energyConfig.solar_total,
                sensor_pv1: energyConfig.solar_pv1,
                sensor_pv2: energyConfig.solar_pv2,
                sensor_daily: energyConfig.solar_daily,
                sensor_grid_power: energyConfig.grid_power,
                sensor_grid_import_daily: energyConfig.grid_import_daily,
                sensor_home_load: energyConfig.home_load,
                sensor_battery_flow: energyConfig.battery_flow,
                sensor_bat1_soc: energyConfig.battery_soc,
                
                // Styling and visibility fixes
                background_image: 'assets/lumina_background_nocar_real.png',
                hide_home_button: true,
                show_grid_box: false,
                show_pv_box: false,
                card_title: '',
                mini_cam_icon_image: 'assets/minicam.png',
                
                // Remove people icons (overlay images 6-9 are default people)
                overlay_image_6_enabled: false,
                overlay_image_7_enabled: false,
                overlay_image_8_enabled: false,
                overlay_image_9_enabled: false,
                
                dev_text_grid_scaleX: 0, dev_text_grid_scaleY: 0,
                dev_text_home_temperature_scaleX: 0, dev_text_home_temperature_scaleY: 0,
                dev_text_heatpump_scaleX: 0, dev_text_heatpump_scaleY: 0,
                
                // Re-enable and position battery text closer to the battery
                dev_text_battery_scaleX: 1.0, 
                dev_text_battery_scaleY: 1.0,
                dev_text_battery_x: 350,
                dev_text_battery_y: 395,
                battery_soc_font_size: 14,
                battery_power_font_size: 14,
                
                // Update Solar labels
                show_pv_strings: true,
                pv_string_1_label: 'Bar',
                pv_string_2_label: 'Bedroom',
                dev_text_solar_scaleX: 1.0,
                dev_text_solar_scaleY: 1.0,
                dev_text_solar_x: 100,
                dev_text_solar_y: 180,
                pv_font_size: 14,
                
                // Remove the "TEXT" toggle button in the bottom left
                enable_text_toggle_button: false,
                
                // Distinct flow colors
                pv_primary_color: '#ffd700', // Gold/Solar
                pv_tot_color: '#ffd700',
                battery_charge_color: '#00ff99', // Spring Green/Battery
                battery_discharge_color: '#00ff99',
                grid_import_color: '#ff4500', // Orange-Red/Grid Import
                grid_export_color: '#32cd32', // Lime Green/Grid Export
                load_flow_color: '#00bfff', // Deep Sky Blue/Load
                
                // Flow line thickness
                flow_stroke_width: 3,
                fluid_flow_stroke_width: 4,
                
                // Debug grid to help align paths with background image
                pro_debug_grid: true,
                
                // Attempting to align flow lines with the background image
                // Adjusting these offsets will shift the animated lines
                pv1_flow_offset_x: 0,
                pv1_flow_offset_y: 0,
                bat_flow_offset_x: 0,
                bat_flow_offset_y: 0,
                bat_flow_path: 'M 416 292 L 253 332',
                grid_flow_offset_x: 0,
                grid_flow_offset_y: 0,
                load_flow_offset_x: 0,
                load_flow_offset_y: 10,
                
                // 3D Battery Overlay
                battery_overlay_enabled: true,
                battery_overlay_image: 'assets/battery_real.png',
                battery_overlay_x: 210,
                battery_overlay_y: 263,
                battery_overlay_width: 140,
                battery_overlay_height: 180,
                
                // Position SOC bars inside the 3D battery casing
                dev_soc_bar_x: 295,
                dev_soc_bar_y: 303,
                dev_soc_bar_width: 28,
                dev_soc_bar_height: 90,
                soc_bar_glow: 15
            });
        }
    }
    
    // Custom name overrides for the UI
    getFriendlyName(id) {
        if (window.CONFIG?.NAMES && window.CONFIG.NAMES[id]) {
            return window.CONFIG.NAMES[id];
        }
        const names = {
            'light.counter_lights': 'Counter',
            'light.ceiling_lights_dimmer': 'Ceiling',
            'light.fireplace_light_switch_bar_fireplace_switch_bar': 'Fireplace',
            'light.3gang_switch_lapa_left_button': 'Baselight',
            'light.3gang_switch_lapa_middle_button': 'Dartboard',
            'light.3gang_switch_lapa_right_button': 'Candle Lights',
            'light.fireplace_light_switch_lapa_fireplace_switch_lapa': 'Fireplace',
            'light.pool_light_switch': 'Pool',
            'light.bathroom_light_switch': 'Bath Tub',
            'light.bathroom_light_switch_2': 'Shower'
        };
        return names[id] || id;
    }

    getEntityIcon(id) {
        if (window.CONFIG?.ICONS && window.CONFIG.ICONS[id]) {
            return window.CONFIG.ICONS[id];
        }
        const icons = {
            'light.bathroom_light_switch': 'mdi-bathtub',
            'light.bathroom_light_switch_2': 'mdi-shower-head',
            'light.pool_light_switch': 'mdi-pool'
        };
        
        if (icons[id]) return icons[id];
        
        const domain = id.split('.')[0];
        if (domain === 'light') return 'mdi-lightbulb';
        if (domain === 'switch') return 'mdi-toggle-switch';
        if (domain === 'sensor') return 'mdi-eye';
        return 'mdi-help-circle';
    }

    renderGroup(entityIds, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';

        entityIds.forEach(id => {
            // Create placeholder card, will be updated by updateUI
            const card = document.createElement('div');
            card.className = 'entity-card';
            card.id = `card-${id.replace(/\./g, '-')}`;
            
            const domain = id.split('.')[0];
            const icon = this.getEntityIcon(id);
            
            const friendlyName = this.getFriendlyName(id);
            const isDimmer = id === 'light.ceiling_lights_dimmer';
            
            card.innerHTML = `
                <div class="entity-info">
                    <div class="icon-container">
                        <span class="mdi ${icon} entity-icon"></span>
                    </div>
                    <div class="entity-details">
                        <div class="entity-name-row">
                            <div class="entity-name" id="name-${id.replace(/\./g, '-')}">${friendlyName}</div>
                            ${isDimmer ? `<div class="brightness-percent" id="percent-${id.replace(/\./g, '-')}">0%</div>` : ''}
                        </div>
                        <div class="entity-state" id="state-${id.replace(/\./g, '-')}">Loading...</div>
                    </div>
                </div>
                <div class="entity-controls">
                    ${isDimmer ? `
                        <div class="brightness-slider-container">
                            <input type="range" class="brightness-slider" id="slider-${id.replace(/\./g, '-')}" min="0" max="255" value="0">
                        </div>
                    ` : ''}
                </div>
            `;
            
            if (isDimmer) {
                const slider = card.querySelector('.brightness-slider');
                slider.addEventListener('click', (e) => e.stopPropagation()); // Don't toggle when sliding
                slider.addEventListener('mousedown', (e) => e.stopPropagation());
                slider.addEventListener('touchstart', (e) => e.stopPropagation());
                slider.addEventListener('input', (e) => {
                    const brightness = parseInt(e.target.value);
                    const percent = Math.round((brightness / 255) * 100);
                    const percentEl = card.querySelector('.brightness-percent');
                    if (percentEl) percentEl.textContent = `${percent}%`;
                    this.ha.callService('light', 'turn_on', { entity_id: id, brightness: brightness });
                });
            }
            
            if (domain === 'light' || domain === 'switch') {
                card.addEventListener('click', () => {
                    this.ha.callService(domain, 'toggle', { entity_id: id });
                });
            }
            
            container.appendChild(card);
        });
    }

    renderAlarmPanel(name, containerId, entityId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = `
            <div class="alarm-header">
                <div class="alarm-status" id="alarm-status-${name}">
                    <span class="mdi mdi-lock-outline"></span>
                    <span id="alarm-text-${name}">${name.toUpperCase()}</span>
                </div>
            </div>
            <div class="alarm-actions">
                <button class="alarm-btn arm-away" onclick="window.ha.callService('alarm_control_panel', 'alarm_arm_away', {entity_id: '${entityId}'})">
                    <span class="mdi mdi-shield-lock-outline"></span> Arm Away
                </button>
                <button class="alarm-btn arm-stay" onclick="window.ha.callService('alarm_control_panel', 'alarm_arm_home', {entity_id: '${entityId}'})">
                    <span class="mdi mdi-shield-home-outline"></span> Arm Stay
                </button>
                <button class="alarm-btn disarm" onclick="window.ha.callService('alarm_control_panel', 'alarm_disarm', {entity_id: '${entityId}'})">
                    <span class="mdi mdi-shield-lock-open-outline"></span> Disarm
                </button>
            </div>
        `;
    }

    updateUI(entities) {
        this.updateClock();
        this.updateWeather(entities);
        this.updateQuickTiles(entities);
        this.updateLuminaFlow(entities);
        
        // Update all individual entity cards from config
        if (this.config.LIGHTS) {
            Object.values(this.config.LIGHTS).forEach(roomLights => {
                roomLights.forEach(id => this.updateEntityCard(entities[id]));
            });
        }
        if (this.config.POOL) this.config.POOL.forEach(id => this.updateEntityCard(entities[id]));
        if (this.config.GEYSER) this.config.GEYSER.forEach(id => this.updateEntityCard(entities[id]));

        // Update Alarm statuses
        if (Array.isArray(this.config.ALARMS)) {
            this.config.ALARMS.forEach(alarm => {
                const entity = entities[alarm.id];
                const name = alarm.name.toLowerCase();
                if (entity) {
                    const statusEl = document.getElementById(`alarm-status-${name}`);
                    const textEl = document.getElementById(`alarm-text-${name}`);
                    if (!statusEl || !textEl) return;

                    const isDisarmed = entity.state.toLowerCase() === 'disarmed';
                    
                    statusEl.className = `alarm-status ${isDisarmed ? 'disarmed' : 'armed'}`;
                    statusEl.querySelector('.mdi').className = `mdi ${isDisarmed ? 'mdi-lock-open-outline' : 'mdi-lock-outline'}`;
                    textEl.textContent = `${alarm.name.toUpperCase()} - ${entity.state}`;
                }
            });
        }
    }

    updateClock() {
        const clockEl = document.getElementById('clock');
        if (clockEl) {
            clockEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    }

    updateWeather(entities) {
        const weatherConfig = this.config.WEATHER || {};
        const weatherBox = document.getElementById('weather-box');
        if (!weatherBox) return;

        const currentTemp = entities[weatherConfig.current_temperature];
        const currentCond = entities[weatherConfig.current_condition];
        
        // Very basic mapping from HA standard conditions to MDI
        const getMdiIcon = (condition) => {
            const map = {
                'clear-night': 'mdi-weather-night',
                'cloudy': 'mdi-weather-cloudy',
                'fog': 'mdi-weather-fog',
                'hail': 'mdi-weather-hail',
                'lightning': 'mdi-weather-lightning',
                'lightning-rainy': 'mdi-weather-lightning-rainy',
                'partlycloudy': 'mdi-weather-partly-cloudy',
                'partly-cloudy-day': 'mdi-weather-partly-cloudy',
                'partly-cloudy-night': 'mdi-weather-night-partly-cloudy',
                'pouring': 'mdi-weather-pouring',
                'rainy': 'mdi-weather-rainy',
                'snowy': 'mdi-weather-snowy',
                'snowy-rainy': 'mdi-weather-snowy-rainy',
                'sunny': 'mdi-weather-sunny',
                'windy': 'mdi-weather-windy',
                'windy-variant': 'mdi-weather-windy-variant'
            };
            return map[condition] || 'mdi-weather-cloudy';
        };

        if (currentTemp && currentTemp.state && currentTemp.state !== 'unavailable') {
            const tempVal = Math.round(parseFloat(currentTemp.state)) + '°';
            const condIcon = getMdiIcon(currentCond ? currentCond.state : '');
            
            let html = `
                <div class="weather-day">
                    <span class="mdi ${condIcon}"></span>
                    <span class="temp">${tempVal}</span>
                    <span class="day">Now</span>
                </div>
            `;
            
            // Try explicit sensors first (e.g. Pirate Weather day_1_high)
            const tHigh = entities[weatherConfig.tomorrow_high];
            const tLow = entities[weatherConfig.tomorrow_low];
            const tCond = entities[weatherConfig.tomorrow_condition];
            
            const daHigh = entities[weatherConfig.day_after_high];
            const daLow = entities[weatherConfig.day_after_low];
            const daCond = entities[weatherConfig.day_after_condition];
            
            if (tHigh && tLow && daHigh && daLow) {
                // Tomorrow
                html += `
                    <div class="weather-day">
                        <span class="mdi ${getMdiIcon(tCond ? tCond.state : '')}"></span>
                        <span class="temp">${Math.round(parseFloat(tLow.state))}°-${Math.round(parseFloat(tHigh.state))}°</span>
                        <span class="day">Tomorrow</span>
                    </div>
                `;
                // Day After
                const date = new Date();
                date.setDate(date.getDate() + 2);
                const dayName = date.toLocaleDateString(undefined, { weekday: 'short' });

                html += `
                    <div class="weather-day">
                        <span class="mdi ${getMdiIcon(daCond ? daCond.state : '')}"></span>
                        <span class="temp">${Math.round(parseFloat(daLow.state))}°-${Math.round(parseFloat(daHigh.state))}°</span>
                        <span class="day">${dayName}</span>
                    </div>
                `;
            } else {
                // Fallback: Use standard weather entity forecast attributes if provided
                const forecastEntity = entities[weatherConfig.forecast_daily];
                if (forecastEntity && forecastEntity.attributes && Array.isArray(forecastEntity.attributes.forecast)) {
                    // Start from index 1 (assuming index 0 is today, or index 1 is tomorrow depending on the integration)
                    // HA weather forecasts usually put tomorrow at index 1 if daily.
                    const daysToAdd = forecastEntity.attributes.forecast.slice(1, 3);
                    
                    daysToAdd.forEach((day, index) => {
                        const dateObj = new Date(day.datetime);
                        const dayName = index === 0 ? 'Tomorrow' : dateObj.toLocaleDateString(undefined, { weekday: 'short' });
                        
                        // Some integrations use templow, some just temperature for high and templow for low
                        const fHigh = day.temperature !== undefined ? Math.round(parseFloat(day.temperature)) : '--';
                        const fLow = day.templow !== undefined ? Math.round(parseFloat(day.templow)) : '--';
                        const fIcon = getMdiIcon(day.condition);
                        
                        // If we have both high and low, display range, else just temp
                        const tempDisplay = (fLow !== '--' && fHigh !== '--') ? `${fLow}°-${fHigh}°` : `${fHigh}°`;

                        html += `
                            <div class="weather-day">
                                <span class="mdi ${fIcon}"></span>
                                <span class="temp">${tempDisplay}</span>
                                <span class="day">${dayName}</span>
                            </div>
                        `;
                    });
                }
            }

            weatherBox.innerHTML = html;
        }
    }

    updateQuickTiles(entities) {
        if (!Array.isArray(this.config.QUICK_TILES)) return;

        this.config.QUICK_TILES.forEach((tile, index) => {
            const el = document.getElementById(`qt-state-${index}`);
            if (!el) return;

            const entity = entities[tile.id];
            if (!entity) return;

            let displayText = entity.state;

            if (tile.type === 'lights') {
                const count = parseInt(entity.state || 0);
                if (count > 0) {
                    displayText = `${count} On`;
                    el.style.display = 'block';
                } else {
                    displayText = '';
                    el.style.display = 'none'; // hide entirely
                }
            } else if (tile.type === 'pool') {
                displayText = entity.state === 'on' ? 'Pump Running' : 'Idle';
                el.style.display = 'block';
            } else {
                el.style.display = 'block';
            }

            el.textContent = displayText;
        });
    }

    updateLuminaFlow(entities) {
        const luminaCard = document.getElementById('lumina-card');
        if (luminaCard) {
            luminaCard.hass = { states: entities };
        }
    }

    updateEntityCard(entity) {
        if (!entity) return;
        const card = document.getElementById(`card-${entity.entity_id.replace(/\./g, '-')}`);
        if (!card) return;

        const nameEl = document.getElementById(`name-${entity.entity_id.replace(/\./g, '-')}`);
        const stateEl = document.getElementById(`state-${entity.entity_id.replace(/\./g, '-')}`);
        const sliderEl = document.getElementById(`slider-${entity.entity_id.replace(/\./g, '-')}`);
        
        if (nameEl) nameEl.textContent = this.getFriendlyName(entity.entity_id);
        
        if (sliderEl && entity.attributes.brightness !== undefined) {
            sliderEl.value = entity.attributes.brightness || 0;
        }
        
        let displayState = entity.state;
        if (entity.attributes.unit_of_measurement) {
            displayState += ` ${entity.attributes.unit_of_measurement}`;
        }
        if (stateEl) stateEl.textContent = displayState;

        const isOn = entity.state === 'on';
        if (isOn) {
            card.classList.add('state-on');
        } else {
            card.classList.remove('state-on');
        }

        // Update percent label for dimmers
        if (sliderEl && entity.attributes.brightness !== undefined) {
            const percentEl = document.getElementById(`percent-${entity.entity_id.replace(/\./g, '-')}`);
            if (percentEl) {
                const percent = Math.round((entity.attributes.brightness / 255) * 100);
                percentEl.textContent = `${percent}%`;
                percentEl.style.display = isOn ? 'block' : 'none';
            }
            // Also hide slider if off
            const sliderContainer = card.querySelector('.brightness-slider-container');
            if (sliderContainer) {
                sliderContainer.style.display = isOn ? 'block' : 'none';
            }
        }
    }
}
