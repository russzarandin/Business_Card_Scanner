import validator from 'validator';
import { parsePhoneNumberWithError, ParseError } from 'libphonenumber-js';

export const processPhoneNumber = (rawNumber) => {
    const cleaned = rawNumber.replace(/[^\d+]/g, '');
    try {
        const phoneNumber = parsePhoneNumberWithError(cleaned);
        return phoneNumber.formatInternational();
    } catch (error) {
        if (/^\+?1?\d{10}$/.test(cleaned)) {
            console.log('Phone parse error:', error.message);
        }
        return cleaned.replace(/[^\d]/g, '');
    }
};

export const correctCommonOCRerrors = (text) => {
    return text
        // Email handling
        .replace(/(\S+)[\s©§a]+(\S+\.\S+)/g, '$1@$2')
        .replace(/([a-z0-9])[ .]([a-z0-9])@/g, '$1$2@')

        // Website corrections
        .replace(/(ww)(w?)/gi, (_, p1, p2) => p2 ? 'www' : p1)
        .replace(/corn|corner/gi, '.com')
        .replace(/(\.)(com|org|net|co|io)\b/gi, '$1$2')
        
        // Name capitalization
        .replace(/\b([A-Z]{2,})\b/g, (match) => 
            match.charAt(0) + match.slice(1).toLowerCase()
        )

        // Social media fixes
        .replace(/tw[i!1]tter/gi, 'twitter')
        .replace(/1inkedin/gi, 'linkedin')
        .replace(/faceb00k/gi, 'facebook');
};

export const extractWebsites = (text) => {
    const tlds = ['com', 'org', 'net', 'io', 'co', 'gov', 'edu'];
    const urlRegex = new RegExp(
        `(?:https?://)?(?:www\\.)?[a-z0-9-]+\\.[a-z]{2,}(?:\\.[a-z]{2,})?\\b(?=\\s|$|,)`,
        'gi'
    );
    
    return [...new Set(
        (text.match(urlRegex) || [])
            .filter(url => tlds.some(tld => url.endsWith(`.${tld}`)))
            .map(url => url.startsWith('http') ? url : `https://${url}`)
    )];
};


const SOCIAL_PATTERNS = {
    linkedin: [
        /linkedin\.com\/(in|company)\/[a-z0-9-]+/gi,
        /li\.[a-z]{2,3}\/[a-z0-9]+/gi
    ],
    twitter: [
        /twitter\.com\/[a-z0-9_]{1,15}/gi,
        /@[a-z0-9_]{1,15}/gi
    ],
    facebook: [
        /facebook\.com\/[a-z0-9.-]+/gi
    ]
};

const extractSocialProfiles = (text) => {
    return Object.entries(SOCIAL_PATTERNS).reduce((acc, [platform, patterns]) => {
        const matches = patterns.flatMap(pattern => 
            (text.match(pattern) || []
            ).map(match => {
                if (platform === 'twitter' && match.startsWith('@')) {
                    return `https://twitter.com/${match.slice(1)}`;
                }
                return match.startsWith('http') ? match : `https://${match}`;
            })
        )
        if (matches.length) acc[platform] = [...new Set(matches)];
        return acc;
    }, {});
};

const extractName = (lines) => {
    const nameLine = lines.find(line => 
        /^[A-Z][a-z]*\s+[A-Z][a-z]*$/.test(line) ||
        /^[A-Z]{2,}\s+[A-Z]{2,}$/.test(line)
    );
    
    return nameLine?.replace(/([a-z])([A-Z])/g, '$1 $2') // Split camelCase
        .replace(/\b([A-Z]+)\b/g, (m) => m.charAt(0) + m.slice(1).toLowerCase())
        .trim() || null;
};

export const extractContactInfo = (text) => {
    const cleanText = correctCommonOCRerrors(text);
    const lines = cleanText.split('\n').map(l => l.trim());

    const findMatches = (patterns, text, transformer = (x) => x) => {
        const matches = new Set();
        patterns.forEach(pattern => {
            try {
                const regex = new RegExp(pattern, 'gi');
                const found = text.match(regex) || [];
                found.forEach(match => matches.add(transformer(match)));
            } catch (error) {
                console.warn('Invalid regex pattern:', pattern);
            }
        });
        return Array.from(matches);
    };

    const websitePatterns = [
        'https?://(?:www\\.)?[a-z0-9-]+\\.[a-z]{2,}(?:\\.[a-z]{2,})?',
        'www\\.[a-z0-9-]+\\.[a-z]{2,}',
        '[a-z0-9-]+\\.[a-z]{2,}(?:\\.[a-z]{2,})?'
    ];
    const websites = findMatches(websitePatterns, cleanText, url => {
        if (!url.startsWith('http')) {
            return url.includes('://') ? url : `https://${url}`;
        }
        return url;
    }).filter(url => validator.isURL(url, { require_protocol: true }));

    // Social media with platform-specific handling
    const socialPatterns = {
        linkedin: [
            'linkedin\\.com/(in|company)/[a-z0-9-]+',
            'li\\.[a-z]{2,3}/[a-z0-9-]+'
        ],
        twitter: [
            'twitter\\.com/[a-z0-9_]{1,15}',
            '@[a-z0-9_]{1,15}'
        ],
        facebook: [
            'facebook\\.com/[a-z0-9.-]+'
        ]
    };
    const socialLinks = Object.entries(socialPatterns).reduce((acc, [platform, patterns]) => {
        const matches = findMatches(patterns, cleanText, match => {
            if (platform === 'twitter' && match.startsWith('@')) {
                return `https://twitter.com/${match.slice(1)}`;
            }
            return match.startsWith('http') ? match : `https://${match}`;
        });
        if (matches.length) acc[platform] = matches;
        return acc;
    }, {});

    // Title detection with position awareness
    const titleKeywords = new RegExp(
        /\b(CEO|CTO|CFO|Manager|Director|Engineer|Specialist|Analyst|Designer|Developer|Expert)\b/gi
    );
    const jobTitle = lines.find(line => 
        titleKeywords.test(line) || 
        /(Senior|Junior|Lead)\s[\w-]+/i.test(line)
    )?.replace(titleKeywords, '')?.trim();

    // Company name detection
    const companyLine = lines.find(line => 
        /\b(Inc|LLC|Ltd|Corp|Group|Technologies|Solutions|Labs|Studio|Cosulting)\b/i.test(line) ||
        /[A-Z][a-zA-Z]+ & [A-Z][a-zA-Z]+/.test(line)
    );

    return {
        name: extractName(lines),
        title: jobTitle || null,
        company: companyLine || null,
        emails: findMatches(
            [/\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi], 
            cleanText
        ).filter(e => validator.isEmail(e)),
        phones: findMatches(
            [/\+?[\d\s\-()]{7,}/g], 
            cleanText
        ).map(processPhoneNumber).filter(p => p.length >= 10),
        websites,
        social: socialLinks,
        rawText: cleanText
    };
};