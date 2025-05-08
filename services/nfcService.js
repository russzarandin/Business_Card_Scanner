import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';

export async function initNFC() {
    try{
        await NfcManager.start();
        return true;
    } catch (error) {
        console.error('Error initialising NFC', error);
        return false;
    }
};

export async function writeNFCTag(userId) {
    try {
        await NfcManager.requestTechnology(NfcTech.Ndef);
        const url = `ai-ar-business-card://profile/${userId}`;
        const uriRecord = Ndef.uriRecord(url);
        const bytes = Ndef.encodeMessage([uriRecord]);

        await NfcManager.writeNdefMessage(bytes);
        console.log('NFC tag written succesfully');
        return true;
    } catch (error) {
        console.error('Error writing NFC tag:', error);
        throw error;
    } finally {
        NfcManager.cancelTechnologyRequest();
    }
};

export async function readNFCTag() {
    try {
        await NfcManager.requestTechnology(NfcTech.Ndef);
        const tag = await NfcManager.getTag();
        
        if (tag.ndefMessage) {
            const uri = Ndef.uri.decodePayload(
                tag.ndefMessage[0].payload
            );
            console.log('NFC tag read:', uri);
            return uri;
        }
        console.log('NFC tag read:', uri);
        return tag;
    } catch (error) {
        console.error('Error handling NFC tag:', error);
        throw error;
    } finally {
        NfcManager.cancelTechnologyRequest();
    }
};