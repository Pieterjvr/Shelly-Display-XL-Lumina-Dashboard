/**
 * Configuration for Shelly XL Lumina Dashboard
 * Rename this file to config.js and fill in your details.
 */
window.CONFIG = {
    // Home Assistant Connection
	HA_URL: "http://YOUR HOMEASSISTANT IP:8123",
    HA_TOKEN: "YOUR API TOKEN FROM HOME ASSISTANT",

    // Entity IDs
    ENTITIES: {
        // Energy / Lumina Card
        ENERGY: {
            solar_total: 'sensor.lux_solar_output_live',
            solar_pv1: 'sensor.lux_solar_output_array_1_live',
            solar_pv2: 'sensor.lux_solar_output_array_2_live',
            solar_daily: 'sensor.lux_solar_output_daily',
            grid_power: 'sensor.lux_grid_flow_live',
            grid_voltage: 'sensor.lux_grid_voltage_live',
            grid_import_daily: 'sensor.lux_power_from_grid_daily',
            home_load: 'sensor.lux_home_consumption_live',
            battery_flow: 'sensor.lux_battery_flow_live',
            battery_discharge: 'sensor.lux_battery_discharge_live',
            battery_charge: 'sensor.lux_battery_charge_live',
            battery_soc: 'sensor.lux_battery'
        },

        // Battery Calculation Constants
        BATTERY_CAPACITY_KWH: 14,
        SOC_ON_GRID_TARGET: 50,
        SOC_OFF_GRID_TARGET: 30,

        // Quick Access Tiles
        QUICK_TILES: [
            { id: 'sensor.light_on_count', name: 'Lights', icon: 'mdi-lamps', target: 'lights-view', color: 'text-amber', type: 'lights' },
            { id: 'alarm_control_panel.house', name: 'Alarm', icon: 'mdi-shield-home', target: 'alarm-view', color: 'text-red', type: 'alarm' },
            { id: 'switch.pool_pump_switch', name: 'Pool', icon: 'mdi-pool', target: 'pool-view', color: 'text-blue', type: 'pool' },
            { id: 'sensor.backup_backup_manager_state', name: 'Geyser', icon: 'mdi-heat-pump', target: 'geyser-view', color: 'text-green', type: 'geyser' }
        ],

        // Weather
        WEATHER: {
            entity: 'weather.pirateweather',
            current_temperature: 'sensor.pirateweather_temperature',
            current_condition: 'sensor.pirateweather_icon', // e.g. partly-cloudy-day
            daily_summary: 'sensor.pirateweather_daily_summary',
            
            // Option A: Use a weather entity's forecast attribute (Recommended for standard HA)
            forecast_daily: 'weather.pirateweather', 
            
            // Option B: Use explicit sensors for Min/Max
            tomorrow_high: 'sensor.pirateweather_day_1_high',
            tomorrow_low: 'sensor.pirateweather_day_1_low',
            tomorrow_condition: 'sensor.pirateweather_day_1_icon',
            day_after_high: 'sensor.pirateweather_day_2_high',
            day_after_low: 'sensor.pirateweather_day_2_low',
            day_after_condition: 'sensor.pirateweather_day_2_icon'
        },

        // Detailed Views
        LIGHTS: {
            bar: [
                'light.counter_lights', 
                'light.ceiling_lights_dimmer', 
                'light.fireplace_light_switch_bar_fireplace_switch_bar'
            ],
            lapa: [
                'light.3gang_switch_lapa_left_button',
                'light.3gang_switch_lapa_middle_button',
                'light.3gang_switch_lapa_right_button',
                'light.fireplace_light_switch_lapa_fireplace_switch_lapa'
            ],
            pool: [
                'light.pool_light_switch'
            ],
            bathroom: [
                'light.bathroom_light_switch',
                'light.bathroom_light_switch_2'
            ]
        },
        POOL: [
            'switch.pool_pump_switch',
            'light.pool_light_switch'
        ],
        GEYSER: [
            'switch.geyser_isolator_switch',
            'sensor.gas_level_percentage',
            'sensor.pro_check_66f5_temperature',
            'sensor.pro_check_66f5_battery',
            'sensor.pro_check_66f5_reading_quality'
        ],
        ALARMS: [
            { id: 'alarm_control_panel.house', name: 'House' },
            { id: 'alarm_control_panel.flat', name: 'Flat' }
        ]
    },

    // Optional: Custom Names for entities
    NAMES: {
        'light.counter_lights': 'Counter',
        'light.ceiling_lights_dimmer': 'Ceiling'
    },

    // Optional: Custom Icons for entities
    ICONS: {
        'light.bathroom_light_switch': 'mdi-bathtub'
    }
};
