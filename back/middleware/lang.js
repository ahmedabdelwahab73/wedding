// Language Header Middleware
// Requires 'lang' header on every request (e.g. 'ar', 'en')

const langMiddleware = (req, res, next) => {
	const lang = req.headers['lang'];

	if (!lang) {
		return res.status(400).json({
			message: 'Language header (lang) is required',
		});
	}

	// Store language on request for downstream use
	req.lang = lang;
	next();
};

module.exports = langMiddleware;
