const NodeCache = require('node-cache');
const cache = new NodeCache({
	stdTTL: 7000,
	checkperiod: 120
});

module.exports = { cache };