import NetInfo from '@react-native-community/netinfo';
import { syncLocalToCloud } from './businessCardService';

const SYNC_INTERVAL = 30000;

let syncTimer = null;

export const syncManager = {
    init() {
        this.checkConnectivityAndSync();

        syncTimer = setInterval(() => {
            this.checkConnectivityAndSync();
        }, SYNC_INTERVAL);

        NetInfo.addEventListener(this.handleNetworkChange);
    },

    checkConnectivityAndSync() {
        NetInfo.fetch().then(state => {
            if (state.isConnected) this.syncData();
        });
    },

    handleNetworkChange(state) {
        if (state.isConnected) this.syncData();
    },

    async syncData() {
        try {
            await syncLocalToCloud();
            console.log('Background sync completed');
        } catch (error) {
            console.error('Background sync failed:', error);
        }
    },

    cleanup() {
        clearInterval(syncTimer);
        NetInfo.addEventListener(this.handleNetworkChange).remove();
    }
};