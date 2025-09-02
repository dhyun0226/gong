import React, { useEffect } from 'react';
import { StatusBar, View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { initDatabase } from './app/data/db';
import { useSettingsStore } from './app/store/useSettings';
import { colors } from './app/theme/colors';

import { Home } from './app/screens/Home';
import { NewBook } from './app/screens/NewBook';
import { BookDetail } from './app/screens/BookDetail';
import { EditBook } from './app/screens/EditBook';
import { EditEntryModal } from './app/screens/EditEntryModal';
import { Settings } from './app/screens/Settings';
import { MonthlySummary } from './app/screens/MonthlySummary';

export type RootStackParamList = {
  Home: undefined;
  NewBook: undefined;
  BookDetail: { bookId: string };
  EditBook: { bookId: string };
  EditEntryModal: { bookId: string; entry?: any };
  Settings: undefined;
  MonthlySummary: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={colors.text} />
  </View>
);

export default function App() {
  const [isReady, setIsReady] = React.useState(false);
  const { loadSettings } = useSettingsStore();

  useEffect(() => {
    const initialize = async () => {
      try {
        await initDatabase();
        await loadSettings();
        
        
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setIsReady(true);
      }
    };

    initialize();
  }, []);

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={colors.background} 
      />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen 
            name="NewBook" 
            component={NewBook}
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen name="BookDetail" component={BookDetail} />
          <Stack.Screen 
            name="EditBook" 
            component={EditBook}
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen 
            name="EditEntryModal" 
            component={EditEntryModal}
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen name="Settings" component={Settings} />
          <Stack.Screen name="MonthlySummary" component={MonthlySummary} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});