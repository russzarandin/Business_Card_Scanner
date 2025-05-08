import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';


export const generateAvatar = (options) => {
    // For the js-library implmentation
    // return createAvatar(avataaars, options).toString();

    const baseUrl = 'https://api.dicebear.com/9.x/avataaars/svg';

    const params = new URLSearchParams({ seed: options.seed || 'default' });
    
    for (const [key, value] of Object.entries(options)) {
        if (key !== 'seed' && value !== undefined) {
            if (Array.isArray(value)) {
                params.append(key, Array.isArray(value) ? value.join(',') : value);
            } else {
                params.append(key, value);
            }
        }
    }

    return `${baseUrl}?${params.toString()}`;
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
    facialHairProbability: 100,
    facialHairColor: ['a55728'],
    hairColor: ['a55728'],
    hatColor: ['AAAAFF'],
    mouth: ['smile'],
    top: ['hat'],
    skinColor: ['ffdbb4']
});

