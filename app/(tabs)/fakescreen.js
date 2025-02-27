import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import captureCropAndRecognizeText from 'react-native-ocr-scanner';
import validator from 'validator';
import { parsePhoneNumberWithError, parseError } from 'libphonenumber-js';

const correctCommonOCRerrors = (text) => {
    return text
        .replace(/(^|\s)([Oo])(\s|$)/g, '$10$3') // O/o to 0 in numeric contexts 
        .replace(/\s@/g, '@')                    // Fix spaced @ 
        .replace(/[a»ÂÃ]/g, '@')                 // Common @ misreads
        .replace(/(\S+)a(\S+\.\S+)/g, '$1@$2')   // a to @ in emails
        .replace(/[`’]/g, "'")                   // Fix quotes
        .replace(/(\d)[,.](\d)/g, '$1$2')        // Remove number separators
        .replace(/corn/g, '.com')                // Common URL misread
        .replace(/\[dot\]/g, '.')                // Alternative domain notation
        .replace(/(linkedin|twitter|facebook)\s*(:?\/\/?)/gi, '$1://'); // Fix social UR formats
};


const extractContactInfo = (text) => {
    const cleanText = correctCommonOCRerrors(text);
    const lines = cleanText.split('\n').filer(line => line.trim());

    const findBestMatch = (patterns, text) => {
        const matches = new Set();
        patterns.forEach(pattern => {
            const regex = new RegExp(pattern, 'gi');
            const found = text.match(regex);
            if (found) matches.add(...found);
        });
        return Array.from(matches);
    };

    const websites = findBestMatch([
        'https?://[\\w.-]+\\.[a-z]{2,}',
        '(www\\.)?[\\w-]+\\.[a-z]{2.}(\\.[a-z]{2,})?',
        '[a-z0-9-]+\\.[a-z]{2,}\\b'
    ], cleanText).filter(url => {
        const tlds = ['.com', '.org', '.net', '.io', '.co'];
        return tlds.some(tld => url.includes(tld)) && !url.includes('@');
    });

    const socialPatterns = {
        linkedin: ['linkedin\\.com/in/[\\w-]+', 'li\\./[\\w-]+'],
        twitter: ['twitter\\.com/[\\w-]+', '@[\\w-]+'],
        facebook: ['facebook\\.com/[\\w-]+'],
        instagram: ['instagram\\.com/[\\w-]+']
    };

    const socialLinks = Object.entries(socialPatterns).reduce((acc, [platform, patterns]) => {
        const matches = findBestMatch(patterns, cleanText)
            .map(url => url.startsWith('@') ? `https://twitter.com${url.slice(1)}` : url);
        if (matches.length) acc[platform] = matches;
        return acc;
    }, {});

    const titleKeywords = [
        'CEO', 'CTO', 'CFO', 'Manager', 'Director', 'Engineer', 'Specialist',
        'Analyst', 'Designer', 'Developer'
    ];

    const jobTitle = lines.find(line => 
        titleKeywords.some(keyword => line.includes(keyword)) ||
        /(Senior|Junior|Lead)\s+[A-Z][a-z]+/.test(line)
    );

    const companyIndicators = ['Inc', 'LLC', 'Ltd', 'Corp', 'Group'];
    const companyLine = lines.find(line =>
        companyIndicators.some(indicator => line.endsWith(indicator)) ||
        /[A-Z][a-zA-Z]+\s+(Technologies|Solutions|Labs)/.test(line)
    );

    const education = findBestMatch([
        'B\.?Sc\.?', 'M\.?Sc\.?', 'PhD', 'MBA',
        'Certified', 'AWS', 'PMP', 'CEH'
    ], cleanText);

    const phoneCandidates = cleanText.match(/\+?[\d\s\-()]{7,}/g) || [];
    const validPhones = phoneCandidates
        .map(p => processPhoneNumber(p))
        .filter(p => p.length >= 7);
    
    const emailCandidates = cleanText.match(/\S+@\S+\.\S/g) || [];
    const validEmails = emailCandidates.filter(e => validator.isEmail(e));

    const nameLine = lines.find(line =>
        /^[A-Z][a-z]+\s+[A-Z][a-z]+/.test(line) &&
        !validator.isEmail(line) &&
        !line.match(/http/) &&
        !jobTitle?.includes(line)
    );

    return {
        name: nameLine?.trim() || null,
        title: jobTitle?.replace(nameLine, '').trim() || null,
        company: companyLine?.trim() || null,
        emails: [...new Set(validEmails)],
        phones: [...new Set(validPhones)],
        websites: [...new Set(websites)],
        social: socialLinks,
        education: [...new Set(education)],
        rawText: cleanText
    };
};


export default function OCRScreen() {
    const handleOCR = async () => {
        try {
            const result = await captureCropAndRecognizeText();
            const processedData = extractContactInfo(result.text);

            console.log('--- Structured Contact Info ---');
            console.log('Name:', processedData.name);
            console.log('Title:', processedData.title);
            console.log('Company:', processedData.company);
            console.log('Emails:', processedData.emails);
            console.log('Phones:', processedData.phones);
            console.log('Websites:', processedData.websites);
            console.log('Socials:', processedData.social);
            console.log('Education/Certs:', processedData.education);

            console.log('\n--- Contextual Line Analysis ---');
            result.blocks.forEach((block, index) => {
                console.log(`Line ${index +1}:`, {
                    text: block.text,
                    type: determineLineType(block.text, processedData)
                });
            });
        } catch (error) {
            console.error('OCR Error:', error);
        }
    };

    const determineLineType = (text, data) => {
        if (data.name === text) return 'NAME';
        if (data.titel === text) return 'TITLE';
        if (data.company === text) return 'COMPANY';
        if (data.emails.includes(text)) return 'EMAIL';
        if (data.phones.some(p => text.includes(p))) return 'PHONE';
        if (data.websites.includes(text)) return 'WEBSITE';
        if (Object.values(data.socia).flat().includes(text)) return 'SOCIAL';
        if (data.education.includes(text)) return 'EDUCATION';
        return 'OTHER';
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={handleOCR} style={styles.}>
                <Text style={{ color: '#FFFFFF'}}>Scan Business Card</Text>    
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F5F5'
    },
    scanButton: {
        paddingVertical: 15,
        paddingHorizontal: 30,
        backgroundColor: '#007AAF',
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5
    },
    buttonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
        letterSpacing: 0.5
    }
});

