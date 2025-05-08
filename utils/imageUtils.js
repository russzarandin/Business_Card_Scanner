import { manipulate, SaveFormat } from 'expo-image-manipulator';

export const preprocessImage = async(uri) => {
    try {
        const result = await manipulate(
            uri,
            [
                { resize: { width: 1080 } }
            ],
            { compress: 1, format: SaveFormat.JPEG }
        );
        return result.uri;
    } catch (error) {
        console.error('preprocessImage failed:', error);
        return uri;
    }
};

export const cropAndAlignBoxes = async (uri, boxes = []) => {
    const croppedURIs = [];
    for (let i = 0; i < boxes.length; i++) {
        const box = boxes[i];
        try {
            const result = await manipulate(
                uri,
                [{ crop: { originX: box.x, originY: box.y, width: box.width, height: box.height } }],
                { compress: 1, format: SaveFormat.JPEG }
            );
            croppedURIs.push(result.uri);
        } catch (error) {
            console.error(`cropAndAlignBoxes failed on box #${i}:`, error);
        }
    }

    return croppedURIs;
};