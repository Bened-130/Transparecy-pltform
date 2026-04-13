import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
} from 'react-native';
import { Camera, useCameraPermissions } from 'expo-camera';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { api } from '../services/api';

interface UploadScreenProps {
  route: {
    params: {
      electionId: string;
      pollingStationId: string;
      token: string;
    };
  };
  navigation: any;
}

export const UploadScreen = ({ route, navigation }: UploadScreenProps) => {
  const { electionId, pollingStationId, token } = route.params;
  const cameraRef = useRef<Camera | null>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [photos, setPhotos] = useState<string[]>([]);
  const [cameraMode, setCameraMode] = useState(true);
  const [uploading, setUploading] = useState(false);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Camera Permission Required</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });

        // Resize image
        const resized = await manipulateAsync(
          photo.uri,
          [{ resize: { width: 1200, height: 1600 } }],
          { compress: 0.7, format: SaveFormat.JPEG }
        );

        setPhotos([...photos, resized.uri]);
        Alert.alert('Success', `Photo captured (${photos.length + 1}/10)`);
      } catch (error) {
        Alert.alert('Error', 'Failed to capture photo');
      }
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_photo: string, i: number) => i !== index));
  };

  const submitUpload = async () => {
    if (photos.length === 0) {
      Alert.alert('Error', 'Please capture at least one photo');
      return;
    }

    setUploading(true);
    try {
      // Convert images to base64
      const imagePromises = photos.map(async (photoUri: string, index: number) => {
        const base64 = await FileSystem.readAsStringAsync(photoUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        return {
          filename: `tally_sheet_${index + 1}.jpg`,
          mimeType: 'image/jpeg',
          size: base64.length,
          base64,
        };
      });

      const images = await Promise.all(imagePromises);

      const response = await api.post(
        '/uploads/election-data',
        {
          electionId,
          pollingStationId,
          images,
          metadata: {
            uploadedBy: 'mobile-app',
            timestamp: new Date(),
            pollingStationName: 'Station Name',
            constituency: 'Constituency',
            county: 'County',
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert('Success', 'Upload submitted for processing');
      navigation.navigate('Status', {
        uploadId: response.data.uploadId,
        electionId,
        token,
      });
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (cameraMode && photos.length < 10) {
    return (
      <View style={styles.container}>
        <Camera style={styles.camera} ref={cameraRef} />
        <View style={styles.cameraControls}>
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <Text style={styles.captureButtonText}>📸 Capture</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => photos.length > 0 && setCameraMode(false)}
            disabled={photos.length === 0}
          >
            <Text style={styles.buttonText}>Next ({photos.length}/10)</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Review Photos</Text>
      <FlatList
        data={photos}
        scrollEnabled={false}
        renderItem={({ item, index }: { item: string; index: number }) => (
          <View style={styles.photoContainer}>
            <Image source={{ uri: item }} style={styles.photo} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removePhoto(index)}
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(_item: string, i: number) => i.toString()}
      />

      <View style={styles.actions}>
        {photos.length < 10 && (
          <TouchableOpacity style={styles.button} onPress={() => setCameraMode(true)}>
            <Text style={styles.buttonText}>Add More Photos</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.button, styles.submitButton, uploading && { opacity: 0.6 }]}
          onPress={submitUpload}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Submit Upload</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  camera: {
    flex: 1,
    minHeight: 400,
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    backgroundColor: '#f0f0f0',
  },
  captureButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  captureButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 15,
    paddingTop: 15,
    marginBottom: 10,
  },
  photoContainer: {
    marginHorizontal: 15,
    marginVertical: 10,
  },
  photo: {
    width: '100%',
    height: 300,
    borderRadius: 8,
  },
  removeButton: {
    backgroundColor: '#FF6B6B',
    padding: 10,
    marginTop: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  actions: {
    paddingHorizontal: 15,
    paddingVertical: 20,
    gap: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});