import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

import { AuthScreen } from './screens/AuthScreen';
import { UploadScreen } from './screens/UploadScreen';
import { StatusScreen } from './screens/StatusScreen';
import { useAuth } from './hooks/useAuth';

const Stack = createStackNavigator();

export default function App() {
  const { isLoading, userToken } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken == null ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : (
          <>
            <Stack.Screen name="Upload" component={UploadScreen} />
            <Stack.Screen name="Status" component={StatusScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
      }
      dispatch({ type: 'RESTORE_TOKEN', token });
    };

    bootstrapAsync();
  }, []);

  const authContext = React.useMemo(
    () => ({
      signIn: async (phoneNumber, otpCode, electionId) => {
        // Handled by AuthScreen
      },
      signOut: async () => {
        await AsyncStorage.removeItem('userToken');
        dispatch({ type: 'SIGN_OUT' });
      },
      signUp: async (data) => {
        // Handled by AuthScreen
      },
    }),
    []
  );

  if (state.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          animationEnabled: true,
          headerShown: true,
        }}
      >
        {state.userToken == null ? (
          <Stack.Screen
            name="Auth"
            options={{
              headerShown: false,
            }}
          >
            {(props) => (
              <AuthScreen
                {...props}
                onAuthSuccess={async (data) => {
                  await AsyncStorage.setItem('userToken', data.token);
                  dispatch({ type: 'SIGN_IN', token: data.token });
                  props.navigation.reset({
                    index: 0,
                    routes: [{ name: 'Upload', params: data }],
                  });
                }}
              />
            )}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen
              name="Upload"
              options={{
                title: 'Upload Tally Sheet',
                headerBackTitle: 'Back',
              }}
            >
              {(props) => (
                <UploadScreen
                  {...props}
                  token={state.userToken}
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="Status"
              options={{
                title: 'Upload Status',
                headerBackTitle: 'Back',
              }}
            >
              {(props) => (
                <StatusScreen
                  {...props}
                  token={state.userToken}
                />
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
