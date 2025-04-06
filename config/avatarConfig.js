import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';

export const generateAvatar = (options) => {
    return createAvatar(avataaars, options).toString();
};


export const defaultAvatarOptions = () => {
    return createAvatar(avataaars, {
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
        hatColor: ['AAAAFF'],
        mouth: ['smile'],
        top: ['hat'],
        skinColor: ['ffdbb4']
    }).toString();
};

// export const dataUri = defaultAvatarOptions.toString();
