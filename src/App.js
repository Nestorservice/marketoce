import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet, StatusBar } from 'react-native'; // Import StatusBar
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer } from '@react-navigation/native';
import { Store, persistor } from './Store';
import auth from '@react-native-firebase/auth';
import Navigation from './navigations/Navigation'; // Assuming this is your main app navigation
import AuthScreen from './services/Auth'; // Your authentication screen

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Firebase auth state observer
    const unsubscribe = auth().onAuthStateChanged(u => {
      setUser(u);
      if (initializing) {
        setInitializing(false);
      }
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, [initializing]); // Dependency array: re-run if 'initializing' changes (though it typically won't after first render)

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        {/* You could add a custom splash screen component here */}
        <ActivityIndicator size="large" color="#4CAF50" /> {/* A specific color, like green */}
      </View>
    );
  }

  return (
    <Provider store={Store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          {/* Dynamically render main app navigation or authentication screen */}
          {user ? <Navigation /> : <AuthScreen />}
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // A clean white background for the loading screen
  },
});

export default App;