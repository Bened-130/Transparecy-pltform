// apps/mobile/src/screens/UploadScreen.tsx
export function UploadScreen() {
  const [uploadState, setUploadState] = useState<UploadState>({
    poUpload: null,
    dpoUpload: null,
    status: 'awaiting_po'
  });

  const handlePhotoCapture = async (photo: PhotoFile) => {
    // Upload to temporary storage
    const uploadId = await api.uploadTemp(photo);
    
    // If PO uploads first, wait for DPO
    // If DPO uploads, trigger immediate AI comparison
    const result = await api.verifyDualUpload({
      uploadId,
      stationId,
      kiemsKitId,
      userType: currentUser.role
    });
    
    if (result.status === 'verified') {
      // Show success, result is now public
      navigation.navigate('Success', { publicUrl: result.publicUrl });
    } else if (result.status === 'awaiting_counterpart') {
      // Show waiting screen with timer
      setUploadState({ ...uploadState, status: 'awaiting_dpo' });
    }
  };
}