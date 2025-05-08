import { useLocalSearchParams } from 'expo-router';
import AccountSharingScreen from '../auth/AccountSharingScreen';

export default function ProfilePage() {
    const params = useLocalSearchParams();
    return (<AccountSharingScreen userId={params.userId}/>);
}