import AsyncStorage from '@react-native-async-storage/async-storage';
class NavigationStore {
  setPendingDeepLink = async (url: any) => {
    await AsyncStorage.setItem('pendingNavigation', url);
  };

  getPendingDeepLink = async () => {
    const link = await AsyncStorage.getItem('pendingNavigation');
    await AsyncStorage.removeItem('pendingNavigation'); // Clear after getting
    return link;
  };
}

export const navigationStore = new NavigationStore();
