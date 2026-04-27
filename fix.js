const fs = require('fs');
let src = fs.readFileSync('scripts/ui.js', 'utf8');

src = src.replace(/window\.CONFIG\?\.ENTITIES/g, '(window.CONFIG && window.CONFIG.ENTITIES)');
src = src.replace(/window\.CONFIG\?\.NAMES/g, '(window.CONFIG && window.CONFIG.NAMES)');
src = src.replace(/window\.CONFIG\?\.ICONS/g, '(window.CONFIG && window.CONFIG.ICONS)');
src = src.replace(/summaryEntity\?\.state/g, '(summaryEntity && summaryEntity.state)');
src = src.replace(/forecastSensor\?\.attributes\?\.forecast/g, '(forecastSensor && forecastSensor.attributes && forecastSensor.attributes.forecast)');
src = src.replace(/weatherEntity\.attributes\?\.forecast/g, '(weatherEntity.attributes && weatherEntity.attributes.forecast)');
src = src.replace(/entities\[energyConfig\.battery_charge\]\?\.state/g, '(entities[energyConfig.battery_charge] && entities[energyConfig.battery_charge].state)');
src = src.replace(/entities\[energyConfig\.grid_power\]\?\.state/g, '(entities[energyConfig.grid_power] && entities[energyConfig.grid_power].state)');
src = src.replace(/entities\[energyConfig\.solar_total\]\?\.state/g, '(entities[energyConfig.solar_total] && entities[energyConfig.solar_total].state)');
src = src.replace(/entities\[energyConfig\.solar_daily\]\?\.state/g, '(entities[energyConfig.solar_daily] && entities[energyConfig.solar_daily].state)');
src = src.replace(/entities\[energyConfig\.battery_soc\]\?\.state/g, '(entities[energyConfig.battery_soc] && entities[energyConfig.battery_soc].state)');
src = src.replace(/entities\[energyConfig\.battery_flow\]\?\.state/g, '(entities[energyConfig.battery_flow] && entities[energyConfig.battery_flow].state)');
src = src.replace(/entities\[energyConfig\.battery_discharge\]\?\.state/g, '(entities[energyConfig.battery_discharge] && entities[energyConfig.battery_discharge].state)');
src = src.replace(/window\.CONFIG\?\.BATTERY_CAPACITY_KWH/g, '(window.CONFIG && window.CONFIG.BATTERY_CAPACITY_KWH)');
src = src.replace(/entities\[energyConfig\.grid_voltage\]\?\.state/g, '(entities[energyConfig.grid_voltage] && entities[energyConfig.grid_voltage].state)');
src = src.replace(/entities\['number\.lux_on_grid_discharge_cut_off_soc'\]\?\.state/g, "(entities['number.lux_on_grid_discharge_cut_off_soc'] && entities['number.lux_on_grid_discharge_cut_off_soc'].state)");
src = src.replace(/entities\['number\.lux_off_grid_discharge_cut_off_soc'\]\?\.state/g, "(entities['number.lux_off_grid_discharge_cut_off_soc'] && entities['number.lux_off_grid_discharge_cut_off_soc'].state)");

fs.writeFileSync('scripts/ui.js', src);
