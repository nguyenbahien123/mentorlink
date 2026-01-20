/**
 * Utility functions for mentor-related operations
 */

/**
 * Get country name from country object or string
 * @param {Object|string} country - Country object with name property or string
 * @returns {string} Country name
 */
export const getCountryName = (country) => {
    if (typeof country === 'string') {
        return country;
    }
    return country?.name || country?.code || 'Unknown';
};

/**
 * Get country flag URL from country object
 * @param {Object|string} country - Country object with flagUrl property or string
 * @returns {string|null} Flag URL or null
 */
export const getCountryFlagUrl = (country) => {
    // If country is an object with a flagUrl, return it
    if (country && typeof country === 'object') {
        return country?.flagUrl || null;
    }

    // If country is a string, try to map to a known ISO code and use a public CDN
    if (typeof country === 'string') {
        const name = country.trim().toLowerCase();
        // A small mapping from common Vietnamese names to ISO country codes
        const mapping = {
            'mỹ': 'us',
            'my': 'us',
            'hoa kỳ': 'us',
            'hàn': 'kr',
            'hàn quốc': 'kr',
            'nhật': 'jp',
            'nhật bản': 'jp',
            'kanada': 'ca',
            'canada': 'ca',
            'anh': 'gb',
            'anh quốc': 'gb',
            'pháp': 'fr',
            'đức': 'de',
            'trung quốc': 'cn',
            'singapore': 'sg',
            'australia': 'au',
            'úc': 'au',
            'malaysia': 'my',
            'hồng kông': 'hk'
        };

        const code = mapping[name] || name.slice(0, 2);
        // Use flagcdn.com small png (16x12 or 20x15) — prefer 20x15 for clarity
        if (code && code.length === 2) {
            return `https://flagcdn.com/20x15/${code}.png`;
        }
    }

    return null;
};

/**
 * Get country code from country object or string
 * @param {Object|string} country - Country object with code property or string
 * @returns {string} Country code
 */
export const getCountryCode = (country) => {
    if (typeof country === 'string') {
        return country.toLowerCase().replace(/\s+/g, '');
    }
    return country?.code || country?.name?.toLowerCase().replace(/\s+/g, '') || 'unknown';
};

/**
 * Format approved countries for display
 * @param {Array} approvedCountries - Array of country objects or strings
 * @returns {Array} Formatted countries array
 */
export const formatApprovedCountries = (approvedCountries) => {
    if (!Array.isArray(approvedCountries)) {
        return [];
    }

    return approvedCountries.map(country => ({
        name: getCountryName(country),
        flagUrl: getCountryFlagUrl(country),
        code: getCountryCode(country),
        original: country
    }));
};

/**
 * Get unique country names for filtering
 * @param {Array} mentors - Array of mentor objects
 * @returns {Array} Unique country names
 */
export const getUniqueCountries = (mentors) => {
    const countrySet = new Set();

    mentors.forEach(mentor => {
        if (mentor.approvedCountries && Array.isArray(mentor.approvedCountries)) {
            mentor.approvedCountries.forEach(country => {
                const countryName = getCountryName(country);
                if (countryName && countryName !== 'Unknown') {
                    countrySet.add(countryName);
                }
            });
        }
    });

    return Array.from(countrySet).sort();
};