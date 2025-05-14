import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';


export const generateAvatar = (options) => {
    const baseUrl = 'https://api.dicebear.com/9.x/avataaars/svg';
    const params = new URLSearchParams();

    const seed = options.seed || Math.random().toString(36).substring(2, 10);
    params.set('seed', seed);

    for (const [key, value] of Object.entries(options)) {
        if (value === undefined || value === null || key === 'seed') continue;

        if (key === 'facialHair') {
            if (value === 'none' || (Array.isArray(value) && value.includes('none'))) {
                params.set('facialHairProbability', '0');
            } else {
                if (options.facialHairProbability !== 100) {
                    params.set('facialHairProbability', String(options.facialHairProbability || 100));
                }
                if (Array.isArray(value)) {
                    value.filter(v => v !== 'none').forEach(v => params.append(key, v));
                } else {
                    params.append(key, value);
                }
            }
        } else if (key === 'accessories') {
            if (value === 'none' || (Array.isArray(value) && value.includes('none'))) {
                params.set('accessoriesProbability', '0');
            } else {
                if (options.accessoriesProbability !== 100) {
                    params.set('accessoriesProbability', String(options.accessoriesProbability || 100));
                }
                if (Array.isArray(value)) {
                    value.filter(v => v !== 'none').forEach(v => params.append(key, v));
                } else{
                    params.append(key, value);
                }
            }
        } else if (key.endsWith('Color')) {
            const colors = Array.isArray(value) ? value : [value];
            colors.forEach(color => {
                const cleanColor = String(color).replace('#', '').trim();
                if (cleanColor && cleanColor.match(/^([a-fA-F0-9]{6}|transparent)$/)) {
                    params.append(key, cleanColor);
                }
            });
        } else if (key !== 'facialHairProbability' && key !== 'accessoriesProbability' ) {
            const values = Array.isArray(value) ? value : [value];
            values.forEach(v => params.append(key, v));
        }
    }

    const finalUrl = `${baseUrl}?${params.toString()}`;
    console.log('Generated avatar URL:', finalUrl);
    return finalUrl;
};

// Used to generate the default option (currently used for the default profile picture)
export const defaultAvatarOptions = () => ({
    // return createAvatar(avataaars, { for js-library
    seed: 'Wyatt',
    flip: false,
    backgroundColor: ['65c9ff'],
    backgroundType: ['solid'],
    accessories: ['kurt'],
    accessoriesColor: ['262e33'],
    clothing: ['overall'],
    clothesColor: ['ffffff'],
    eyebrows: ['defaultNatural'],
    eyes: ['default'],
    facialHair: ['beardMajestic'],
    facialHairColor: ['a55728'],
    hairColor: ['a55728'],
    hatColor: ['aaaaff'],
    mouth: ['smile'],
    top: ['hat'],
    skinColor: ['ffdbb4']
});

export const parseAvatarUrl = (url) => {
    const defaultOptions = defaultAvatarOptions();

    try {
        const urlObj = new URL(url);
        const params = new URLSearchParams(urlObj.search);

        const options = {};

        params.forEach((value, key) => {
            if (options[key] === undefined) {
                options[key] = [value];
            } else {
                options[key].push(value);
            }
        });

        Object.keys(options).forEach(key => {
            if (options[key].length === 1 && !key.endsWith('Color') && key !== 'backgroundColor') {
                options[key] = options[key][0];
            }
        });

        if (!params.has('facialHairProbability') && params.has('facialHair') && !params.get('facialHair').includes('none')) {
            options.facialHairProbability = 100;
        }

        if (!params.has('accessoriesProbability') && params.has('accessories') && !params.get('accessories').includes('none')) {
            options.accessoriesProbability = 100;
        }

        return {
            ...defaultOptions,
            ...options,
            seed: options.seed || defaultOptions.seed
        };
    } catch (error) {
        console.error('Error parsing avatar URL:', error);
        return defaultOptions;
    }
};