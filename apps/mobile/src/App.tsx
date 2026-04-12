import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthScreen } from './screens/AuthScreen';
import { UploadScreen } from './screens/UploadScreen';
import { StatusScreen } from './screens/StatusScreen';

const Stack = createStackNavigator();

export default function App() {
  const [state, dispatch] = React.useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return {
            ...prevState,
            userToken: action.token,
            isLoading: false,
          };
        case 'SIGN_IN':
          return {
            ...prevState,
            isSignout: false,
            userToken: action.token,
          };
        case 'SIGN_OUT':
          return {
            ...prevState,
            isSignout: true,
            userToken: null,
          };
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userToken: null,
    }
  );

  useEffect(() => {
    const bootstrapAsync = async () => {
      let token;
      try {
        token = await AsyncStorage.getItem('userToken');
      } catch (e) {
        // Restoring token failed
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
