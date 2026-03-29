import fs from "fs";
import path from "node:path";

const baseUrl = "https://data.cityofnewyork.us/resource/fc53-9hrv.json";
const chargerType = process.env.CHARGER_TYPE;
const params = new URLSearchParams({
	"$select": "station_name,type_of_charger,no_of_ports,public_charger_,borough,street,city,postcode,latitude,longitude",
	"$order": "postcode DESC, station_name DESC",
    "$where": "borough != 'Upstate'"
});

if (chargerType) {
	params.set("$where", `type_of_charger='${chargerType.replace(/'/g, "''")}'`);
}

const appToken = process.env.SOCRATA_APP_TOKEN;
const response = await fetch(`${baseUrl}?${params.toString()}`, {
	headers: appToken ? { "X-App-Token": appToken } : {}
});

if (!response.ok) {
	const errorText = await response.text();
	throw new Error(`Fetch failed (${response.status}): ${errorText}`);
}

const chargers = await response.json();

if (!Array.isArray(chargers)) {
	throw new Error(`Unexpected API response: ${JSON.stringify(chargers)}`);
}

console.log(`Fetched ${chargers.length} chargers.`);
const dataDir = path.join("src", "lib", "data");
fs.mkdirSync(dataDir, { recursive: true });

const outputPath = path.join(dataDir, "chargers.json");
fs.writeFileSync(outputPath, JSON.stringify(chargers, null, 2));
console.log(`Saved to ${outputPath}`);