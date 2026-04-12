import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { api } from '../services/api';

export const StatusScreen = ({ route, navigation }) => {
  const { uploadId, electionId, token } = route.params;
  const [uploadStatus, setUploadStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tallies, setTallies] = useState<any[]>([]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await api.get(`/uploads/${uploadId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUploadStatus(response.data);
        if (response.data.tallies) {
          setTallies(response.data.tallies);
        }
        setLoading(false);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch status');
        setLoading(false);
      }
    };

    fetchStatus();

    // Poll every 5 seconds while processing
    let interval: any;
    if (uploadStatus?.status === 'processing') {
      interval = setInterval(fetchStatus, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [uploadId, token, uploadStatus?.status]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return '#34C759';
      case 'failed':
      case 'rejected':
        return '#FF6B6B';
      case 'processing':
        return '#007AFF';
      case 'pending':
        return '#FFB800';
      default:
        return '#666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return '✓';
      case 'failed':
      case 'rejected':
        return '✗';
      case 'processing':
        return '⟳';
      default:
        return '○';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.text}>Loading status...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.statusCard, { borderLeftColor: getStatusColor(uploadStatus?.status) }]}>
        <Text style={styles.statusIcon}>{getStatusIcon(uploadStatus?.status)}</Text>
        <View style={styles.statusInfo}>
          <Text style={styles.statusTitle}>
            {uploadStatus?.status === 'verified' && 'Upload Verified ✓'}
            {uploadStatus?.status === 'rejected' && 'Upload Rejected ✗'}
            {uploadStatus?.status === 'failed' && 'Processing Failed'}
            {uploadStatus?.status === 'processing' && 'Processing...'}
            {uploadStatus?.status === 'pending' && 'Pending Review'}
          </Text>
          <Text style={styles.statusDate}>
            {new Date(uploadStatus?.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {uploadStatus?.processingResult && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Processing Results</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Confidence:</Text>
            <Text style={styles.value}>
              {(uploadStatus.processingResult.confidenceScore * 100).toFixed(1)}%
            </Text>
          </View>
          {uploadStatus.processingResult.flaggedForReview && (
            <View style={styles.warningBox}>
              <Text style={styles.warningTitle}>⚠️ Flagged for Review</Text>
              <Text style={styles.warningText}>
                This upload has been flagged and requires verification by an admin.
              </Text>
            </View>
          )}
        </View>
      )}

      {tallies.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Vote Tallies</Text>
          {tallies.map((tally, index) => (
            <View key={index} style={styles.tallyRow}>
              <Text style={styles.candidateName}>{tally.candidate_name}</Text>
              <Text style={styles.votes}>{tally.votes} votes</Text>
              <Text style={styles.verificationStatus}>{tally.verification_status}</Text>
            </View>
          ))}
        </View>
      )}

      {uploadStatus?.failureReason && (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Failure Reason</Text>
          <Text style={styles.errorText}>{uploadStatus.failureReason}</Text>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Upload')}
        >
          <Text style={styles.buttonText}>New Upload</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  text: {
    marginTop: 15,
    textAlign: 'center',
    color: '#666',
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 5,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statusIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    color: '#666',
    fontSize: 14,
  },
  value: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  warningBox: {
    backgroundColor: '#FFF3CD',
    borderRadius: 6,
    padding: 12,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFB800',
  },
  warningTitle: {
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 6,
  },
  warningText: {
    color: '#856404',
    fontSize: 12,
  },
  tallyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  candidateName: {
    flex: 1,
    fontWeight: '600',
    color: '#333',
  },
  votes: {
    fontWeight: 'bold',
    fontSize: 14,
    marginHorizontal: 10,
  },
  verificationStatus: {
    fontSize: 11,
    backgroundColor: '#f0f0f0',
    padding: 4,
    borderRadius: 4,
  },
  errorBox: {
    backgroundColor: '#F8D7DA',
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  errorTitle: {
    fontWeight: 'bold',
    color: '#721C24',
    marginBottom: 6,
  },
  errorText: {
    color: '#721C24',
    fontSize: 14,
  },
  actions: {
    paddingBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
