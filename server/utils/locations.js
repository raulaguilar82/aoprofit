const LOCATIONS = {
  5003: 'Brecilien', 2004: 'Bridgewatch', 3005: 'Caerleon',
  4002: 'Fort Sterling', 1002: 'Lymhurst', 3008: 'Martlock',
  7: 'Thetford', 3003: 'Black Market'
};

function getCity(locationId) {
  return LOCATIONS[locationId] || `City${locationId}`;
}

module.exports = { getCity };