import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';

export async function initNFC() {
    try{
        await NfcManager.requestTechnology(NfcTech.Ndef);

        const bytes = Ndef.encodeMessage([Ndef.textRecord(payload)]);

        await NfcManager.writeDefMessage(bytes);
        console.log('NFC tage written successfully');
    } catch (error) {
        console.error('Error writing NFC tag', error);
    }
};

export async function writeNFCTag(payload) {
    try {
        await NfcManager.requestTechnology(NfcTech.Ndef);
        const bytes = Ndef.encodeMessage([Ndef.textRecord(payload)]);
        await NfcManager.writeNdefMessage(bytes);
        console.log('NFC tag written successfully');
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
        console.log('NFC tag read:', tag);
        return tag;
    } catch (error) {
        console.error('Error handling NFC tag:', error)
    } finally {
        NfcManager.cancelTechnologyRequest();
    }
};