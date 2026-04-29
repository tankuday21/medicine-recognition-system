const osmService = require('./osmService');

async function test() {
  console.log('Testing OSM Pharmacy Search...');
  const lat = 19.222107;
  const lng = 72.852869;
  const pharmacies = await osmService.getNearbyPharmacies(lat, lng, 5);
  console.log(`Found ${pharmacies.length} pharmacies.`);
  pharmacies.forEach(p => {
    console.log(`- ${p.name} (${p.distance}km) [Source: ${p.source}]`);
  });
}

test();
