import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';


export const generateAvatar = (options) => {
    // For the js-library implementation
    // return createAvatar(avataaars, options).toString();

    const baseUrl = 'https://api.dicebear.com/9.x/avataaars/svg';
    const params = new URLSearchParams({ seed: options.seed || 'default' });

    for (const [key, value] of Object.entries(options)) {
        if (key !== 'seed' && value !== undefined) {
            if (key === 'facialHair') {
                if (value === 'none' || (Array.isArray(value) && value[0] === 'none')) {
                    params.append('facialHairProbability', '0');
                } else {
                    params.append('facialHairProbability', '100');
                    params.append(key, Array.isArray(value) ? value[0] : value);
                }
            } else if (key === 'accessories') {
                if (value === 'none' || (Array.isArray(value) && value[0] === 'none')) {
                    params.append('accessoriesProbability', '0');
                } else {
                    params.append('accessoriesProbability', '100');
                    params.append(key, Array.isArray(value) ? value[0] : value);
                }
            } else if (key.endsWith('Color')) {
                let colorValue = Array.isArray(value) ? value[0] : value;
                colorValue = colorValue ? String(colorValue).replace('#', '') : '';
                params.append(key, colorValue);
            } else {
                const paramValue = Array.isArray(value) ? value.join(',') : value;
                params.append(key, paramValue);
            }
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
    // scale: 105, this is for the issue cropping with js-library
    backgroundColor: ['65c9ff'],
    backgroundType: ['solid'],
    accessories: ['kurt'],
    accessoriesColor: ['262e33'],
    clothing: ['overall'],
    clothesColor: ['ffffff'],
    eyebrows: ['defaultNatural'],
    eyes: ['default'],
    facialHair: ['beardMajestic'],
    facialHairProbability: 0,
    facialHairColor: ['a55728'],
    hairColor: ['a55728'],
    hatColor: ['AAAAFF'],
    mouth: ['smile'],
    top: ['hat'],
    skinColor: ['ffdbb4']
});

