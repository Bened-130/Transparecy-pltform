import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { api } from '../services/api';

export const AuthScreen = ({ navigation, onAuthSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [electionId] = useState('your-election-id-here');

  const handleRequestOTP = async () => {
    if (!phoneNumber.match(/^\+?[0-9]{10,15}$/)) {
      Alert.alert('Invalid', 'Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/request-otp', {
        phoneNumber,
        electionId,
      });
      setStep('otp');
      Alert.alert('Success', 'OTP sent to your phone');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid', 'OTP must be 6 digits');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/verify-otp', {
        phoneNumber,
        otpCode: otp,
        electionId,
      });

      // Save token to secure storage
      const { token, refreshToken, userId } = response.data;
      await Promise.all([
        // Store tokens (use @react-native-async-storage/async-storage in production)
      ]);

      onAuthSuccess({ token, userId, phoneNumber });
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Election Transparency Platform</Text>

      {step === 'phone' ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter phone number (+254...)"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            editable={!loading}
            keyboardType="phone-pad"
          />
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRequestOTP}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Send OTP</Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.label}>Enter OTP sent to {phoneNumber}</Text>
          <TextInput
            style={styles.input}
            placeholder="000000"
            value={otp}
            onChangeText={setOtp}
            maxLength={6}
            editable={!loading}
            keyboardType="number-pad"
          />
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleVerifyOTP}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Verify OTP</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setStep('phone')}>
            <Text style={styles.link}>Back to phone number</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 14,
    marginBottom: 10,
    color: '#666',
  },
  link: {
    color: '#007AFF',
    marginTop: 15,
    textAlign: 'center',
    fontSize: 14,
  },
});
