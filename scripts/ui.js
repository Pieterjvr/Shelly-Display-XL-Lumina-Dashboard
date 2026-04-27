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

        this.batteryControlInitialized = false;

        this.ha.subscribe((entities) => this.updateUI(entities));
        this.renderStaticUI();
        this.initBatteryControl();
    }

    initBatteryControl() {
        const onGridSetBtn = document.getElementById('bc-on-grid-set');
        const offGridSetBtn = document.getElementById('bc-off-grid-set');
        const quickChargeBtn = document.getElementById('bc-quick-charge');
        const stopChargeBtn = document.getElementById('bc-stop-charge');

        if (onGridSetBtn) {
            onGridSetBtn.addEventListener('click', () => {
                const val = document.getElementById('bc-on-grid-input').value;
                if (val !== '') {
                    this.ha.callService('number', 'set_value', { 
                        entity_id: 'number.lux_on_grid_discharge_cut_off_soc', 
                        value: parseFloat(val) 
                    });
                }
            });
        }

        if (offGridSetBtn) {
            offGridSetBtn.addEventListener('click', () => {
                const val = document.getElementById('bc-off-grid-input').value;
                if (val !== '') {
                    this.ha.callService('number', 'set_value', { 
                        entity_id: 'number.lux_off_grid_discharge_cut_off_soc', 
                        value: parseFloat(val) 
                    });
                }
            });
        }

        if (quickChargeBtn) {
            quickChargeBtn.addEventListener('click', () => {
                this.ha.callService('button', 'press', { 
                    entity_id: 'button.lux_start_charging_slot_1_180min' 
                });
            });
        }

        if (stopChargeBtn) {
            stopChargeBtn.addEventListener('click', () => {
                this.ha.callService('button', 'press', { 
                    entity_id: 'button.lux_stop_charging_slot_1' 
                });
            });
        }
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
                sensor_battery_discharge: energyConfig.battery_discharge,
                sensor_battery_charge: energyConfig.battery_charge,
                sensor_bat1_soc: energyConfig.battery_soc,
                
                // Invert grid flow: lux_grid_flow_live is < 0 for Import. 
                // Setting invert_grid: true will make < 0 values Positive inside the card,
                // which usually triggers the "Import" direction animation.
                invert_grid: true,
                
                // Styling and visibility fixes
                background_image: 'assets/lumina_background_nocar_real.png',
                hide_home_button: true,
                show_grid_box: false,
                show_pv_box: false,
                card_title: '',
                mini_cam_icon_image: 'assets/minicam.png',
                
                // Remove people icons
                overlay_image_6_enabled: false,
                overlay_image_7_enabled: false,
                overlay_image_8_enabled: false,
                overlay_image_9_enabled: false,
                
                dev_text_grid_scaleX: 0, dev_text_grid_scaleY: 0,
                dev_text_home_temperature_scaleX: 0, dev_text_home_temperature_scaleY: 0,
                dev_text_heatpump_scaleX: 0, dev_text_heatpump_scaleY: 0,
                
                // Hide internal battery and solar text (using HTML overlays instead)
                battery_soc_font_size: 0,
                battery_power_font_size: 0,
                battery_font_size: 0,
                battery_1_font_size: 0,
                battery_text_color: 'transparent',
                battery_soc_color: 'transparent',
                dev_text_battery_x: -1000, 
                dev_text_battery_y: -1000,
                dev_text_battery_scaleX: 0, 
                dev_text_battery_scaleY: 0,
                dev_text_solar_scaleX: 0,
                dev_text_solar_scaleY: 0,
                
                // Update Solar labels
                show_pv_strings: true,
                pv_string_1_label: 'Bar',
                pv_string_2_label: 'Bedroom',
                pv_font_size: 14,
                
                // Remove the "TEXT" toggle button
                enable_text_toggle_button: false,
                
                // Distinct flow colors
                pv_primary_color: '#ffd700', // Gold/Solar
                pv_tot_color: '#ffd700',
                battery_charge_color: '#39ff14', // Neon Green
                battery_discharge_color: '#ff3131', // Neon Red
                grid_import_color: '#ff4500', 
                grid_export_color: '#32cd32', 
                load_flow_color: '#00bfff', 
                
                // Flow line thickness
                flow_stroke_width: 3,
                fluid_flow_stroke_width: 4,
                
                animation_style: 'shimmer',
                
                // Path alignment
                bat_flow_path: 'M 416 292 L 253 332',
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
        this.updateFloatingData(entities);
        
        // Initialize battery control values once
        if (!this.batteryControlInitialized) {
            const onGridSoc = entities['number.lux_on_grid_discharge_cut_off_soc'];
            const offGridSoc = entities['number.lux_off_grid_discharge_cut_off_soc'];
            
            if (onGridSoc || offGridSoc) {
                const onGridInput = document.getElementById('bc-on-grid-input');
                const offGridInput = document.getElementById('bc-off-grid-input');
                
                if (onGridInput && onGridSoc && !document.activeElement.isEqualNode(onGridInput)) {
                    onGridInput.value = parseFloat(onGridSoc.state) || '';
                }
                
                if (offGridInput && offGridSoc && !document.activeElement.isEqualNode(offGridInput)) {
                    offGridInput.value = parseFloat(offGridSoc.state) || '';
                }
                
                this.batteryControlInitialized = true;
            }
        }

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

        const weatherEntity = entities[weatherConfig.entity];
        const summaryEntity = entities[weatherConfig.daily_summary];
        const forecastSensor = entities['sensor.pirate_weather_daily_forecast'] || entities[weatherConfig.forecast_daily];

        if (weatherEntity) {
            try {
                const currentTemp = Math.round(weatherEntity.attributes.temperature || 0);
                const summary = summaryEntity?.state || '';

                let html = `
                    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                        <div class="weather-left">
                            <div class="forecast-title">DAILY SUMMARY</div>
                            ${summary ? `<div class="weather-summary-text">${summary}</div>` : ''}
                        </div>
                        <div class="weather-right" style="display: flex; gap: 10px;">
                `;

                const forecast = forecastSensor?.attributes?.forecast || weatherEntity.attributes?.forecast || [];
                if (forecast.length > 0) {
                    const daysToAdd = forecast.slice(0, 3); // Today, Tomorrow, Day After
                    daysToAdd.forEach((day, index) => {
                        const dateObj = new Date(day.datetime);
                        const dayName = index === 0 ? 'Today' : dateObj.toLocaleDateString(undefined, { weekday: 'short' });
                        const high = day.temperature !== undefined ? Math.round(parseFloat(day.temperature)) : '--';
                        const low = day.templow !== undefined ? Math.round(parseFloat(day.templow)) : '--';
                        const icon = getMdiIcon(day.condition);

                        html += `
                            <div class="forecast-col">
                                <div class="day-name">${dayName}</div>
                                <span class="mdi ${icon} weather-icon"></span>
                                <div class="temp-hl">H: ${high}° / L: ${low}°</div>
                                ${index === 0 ? `<div class="current-line">Current: ${currentTemp}°</div>` : ''}
                            </div>
                        `;
                    });
                }
                html += `
                        </div>
                    </div>
                `;
                weatherBox.innerHTML = html;
            } catch (e) {
                console.error("Weather forecast error:", e);
            }
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

            // Dual-Color Grid-to-Battery Flow Logic
            const energyConfig = this.config.ENERGY || {};
            const batteryCharge = parseFloat(entities[energyConfig.battery_charge]?.state || 0);
            const gridFlow = parseFloat(entities[energyConfig.grid_power]?.state || 0);
            
            // Logic: Battery is CHARGING (>0) AND Grid is IMPORTING (<0)
            const isGridChargingBattery = (batteryCharge > 10) && (gridFlow < -10);
            
            // Apply custom class to the battery flow SVG path inside the shadow DOM
            setTimeout(() => {
                const shadow = luminaCard.shadowRoot;
                if (shadow) {
                    const paths = shadow.querySelectorAll('path');
                    paths.forEach(path => {
                        const d = path.getAttribute('d');
                        if (d && d.includes('416 292') && d.includes('253 332')) {
                            if (isGridChargingBattery) {
                                path.classList.add('flow-grid-to-battery');
                            } else {
                                path.classList.remove('flow-grid-to-battery');
                            }
                        }
                    });
                }
            }, 100);
        }
    }

    updateFloatingData(entities) {
        const energyConfig = this.config.ENERGY || {};
        
        // Solar Data - Convert W to kW
        const solarCurrentEl = document.getElementById('solar-current');
        const solarDailyEl = document.getElementById('solar-daily');
        
        if (solarCurrentEl) {
            const solarVal = parseFloat(entities[energyConfig.solar_total]?.state || 0);
            solarCurrentEl.textContent = `${(solarVal / 1000).toFixed(2)} kW`;
        }
        if (solarDailyEl) {
            const dailyVal = entities[energyConfig.solar_daily]?.state || 0;
            solarDailyEl.textContent = `${parseFloat(dailyVal).toFixed(2)} kWh`;
        }

        // Battery Data
        const batterySocEl = document.getElementById('battery-soc');
        const batteryRateEl = document.getElementById('battery-rate');
        const batteryStatusEl = document.getElementById('battery-status');
        const batteryRow3El = document.getElementById('battery-row-3');
        const batteryRemainingEl = document.getElementById('battery-remaining');
        const batteryRow4El = document.getElementById('battery-row-4');
        const batteryBoltEl = document.getElementById('battery-bolt');
        const batteryCapacityStoredEl = document.getElementById('battery-capacity-stored');

        if (batterySocEl && batteryRateEl && batteryRemainingEl && batteryRow4El && batteryRow3El) {
            const socVal = parseFloat(entities[energyConfig.battery_soc]?.state || 0);
            
            const flowVal = parseFloat(entities[energyConfig.battery_flow]?.state || 0); // Negative = Discharging, Positive = Charging
            const dischargeVal = parseFloat(entities[energyConfig.battery_discharge]?.state || 0); // Positive W
            const chargeVal = parseFloat(entities[energyConfig.battery_charge]?.state || 0); // Positive W
            
            const isDischarging = flowVal < -10 || dischargeVal > 10;
            const isCharging = flowVal > 10 || chargeVal > 10;
            
            let activeFlowW = 0;
            if (isCharging) {
                activeFlowW = chargeVal > 0 ? chargeVal : Math.abs(flowVal);
            } else if (isDischarging) {
                activeFlowW = dischargeVal > 0 ? dischargeVal : Math.abs(flowVal);
            }
            
            const flowKw = activeFlowW / 1000;
            
            const roundedSoc = Math.round(socVal);
            batterySocEl.textContent = `${roundedSoc}%`;
            
            let socColor = '#39ff14'; // Default to green (100% or >= 80%)
            if (roundedSoc < 40) {
                socColor = '#ff3131'; // Neon red below 40%
            } else if (roundedSoc < 80) {
                socColor = '#00f0ff'; // Neon blue below 80%
            }
            
            batterySocEl.style.color = socColor;
            batterySocEl.style.textShadow = `0 0 5px ${socColor}`;

            batteryRateEl.textContent = `${flowKw.toFixed(2)} kW`;
            
            const activeColor = isCharging ? '#39ff14' : (isDischarging ? '#ff3131' : '#00f0ff');
            batteryRateEl.style.color = activeColor;
            
            if (batteryBoltEl) {
                batteryBoltEl.style.color = activeColor;
                if (isCharging || isDischarging) {
                    batteryBoltEl.classList.add('neon-pulse');
                } else {
                    batteryBoltEl.classList.remove('neon-pulse');
                }
            }

            // Calculation Logic (Sunsynk Style)
            const capKwh = window.CONFIG?.BATTERY_CAPACITY_KWH || 14;
            
            if (batteryCapacityStoredEl) {
                const currentStoredKwh = (socVal / 100) * capKwh;
                batteryCapacityStoredEl.textContent = `${currentStoredKwh.toFixed(2)} kWh`;
            }

            // Grid Check
            const gridVoltage = parseFloat(entities[energyConfig.grid_voltage]?.state || 0);
            const isGridLive = gridVoltage > 200;
            
            const targetOn = parseFloat(entities['number.lux_on_grid_discharge_cut_off_soc']?.state) || this.config.SOC_ON_GRID_TARGET || 50;
            const targetOff = parseFloat(entities['number.lux_off_grid_discharge_cut_off_soc']?.state) || this.config.SOC_OFF_GRID_TARGET || 30;
            const targetSoc = isGridLive ? targetOn : targetOff;
            
            const targetOnEl = document.getElementById('battery-target-on');
            const targetOffEl = document.getElementById('battery-target-off');
            if (targetOnEl && targetOffEl) {
                targetOnEl.textContent = `On-Grid: ${targetOn}%`;
                targetOffEl.textContent = `Off-Grid: ${targetOff}%`;
            }
            
            let hoursRemaining = 0;
            let activeTargetSoc = 100;
            
            if (isCharging) {
                activeTargetSoc = 100; // Charging always targets 100%
                const neededKwh = Math.max(0, (activeTargetSoc - socVal) / 100 * capKwh);
                hoursRemaining = Math.abs(flowKw) > 0 ? neededKwh / Math.abs(flowKw) : 0;
            } else if (isDischarging) {
                activeTargetSoc = isGridLive ? targetOn : targetOff;
                const usableKwh = Math.max(0, (socVal - activeTargetSoc) / 100 * capKwh);
                hoursRemaining = Math.abs(flowKw) > 0 ? usableKwh / Math.abs(flowKw) : 0;
            }

            // Edge Case Handling: Hide rows if discharging and SOC is at or below target
            if (isDischarging && socVal <= activeTargetSoc) {
                batteryRow3El.style.display = 'none';
                batteryRow4El.style.display = 'none';
                if (batteryStatusEl) {
                    batteryStatusEl.textContent = 'DISCHARGING';
                    batteryStatusEl.style.color = activeColor;
                }
            } else if (hoursRemaining > 0 && hoursRemaining < 100) {
                batteryRow3El.style.display = 'flex';
                batteryRow4El.style.display = 'block';
                
                const h = Math.floor(hoursRemaining);
                const m = Math.round((hoursRemaining - h) * 60);
                batteryRemainingEl.textContent = h > 0 ? `${h} hrs, ${m} min` : `${m} min`;
                
                const now = new Date();
                const targetTime = new Date(now.getTime() + hoursRemaining * 3600000);
                const timeStr = targetTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                batteryRow4El.textContent = `RUNTIME TO ${activeTargetSoc}% @ ${timeStr}`;
                
                if (batteryStatusEl) {
                    batteryStatusEl.textContent = isDischarging ? 'DISCHARGING' : 'CHARGING';
                    batteryStatusEl.style.color = activeColor;
                }
            } else {
                batteryRow3El.style.display = 'none';
                batteryRow4El.style.display = 'none';
                if (batteryStatusEl) {
                    batteryStatusEl.textContent = isDischarging ? 'DISCHARGING' : (isCharging ? 'CHARGING' : 'IDLE');
                    batteryStatusEl.style.color = activeColor;
                }
            }
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
