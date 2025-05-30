import React, { useState } from 'react';
import { Container, Typography, Box, Button, Stack } from '@mui/material';
import FileUpload from '../components/Registration/FileUpload';
import fileService from '../services/fileService';

const FileTest = () => {
  const [files, setFiles] = useState([]);
  const [testResults, setTestResults] = useState([]);

  const addTestResult = (test, success, details = '') => {
    setTestResults(prev => [...prev, { test, success, details, timestamp: new Date().toISOString() }]);
  };

  const testFileService = async () => {
    // Test 1: File upload
    const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const uploadResult = await fileService.uploadFile(testFile, 'Test file');
    addTestResult('File Upload', uploadResult.success, JSON.stringify(uploadResult.data || uploadResult.error));

    if (uploadResult.success) {
      // Test 2: Get file by ID
      const getResult = await fileService.getFileById(uploadResult.data.id);
      addTestResult('Get File By ID', getResult.success, `Data present: ${!!getResult.data?.data}`);

      // Test 3: Get files by IDs
      const getMultipleResult = await fileService.getFilesByIds([uploadResult.data.id]);
      addTestResult('Get Files By IDs', getMultipleResult.success, `Files count: ${getMultipleResult.data?.length}`);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          File Upload Test Page
        </Typography>
        
        <Stack spacing={4}>
          <Box>
            <Typography variant="h6" gutterBottom>
              File Upload Component Test
            </Typography>
            <FileUpload
              files={files}
              onFilesChange={setFiles}
              maxFiles={5}
            />
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              Uploaded Files Data
            </Typography>
            <pre style={{ backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '4px', overflow: 'auto' }}>
              {JSON.stringify(files, null, 2)}
            </pre>
          </Box>

          <Box>
            <Button variant="contained" onClick={testFileService}>
              Test File Service
            </Button>
            
            {testResults.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Test Results
                </Typography>
                {testResults.map((result, index) => (
                  <Box key={index} sx={{ mb: 1, p: 1, bgcolor: result.success ? 'success.light' : 'error.light', borderRadius: 1 }}>
                    <Typography variant="body2">
                      {result.test}: {result.success ? '✅ Success' : '❌ Failed'}
                    </Typography>
                    {result.details && (
                      <Typography variant="caption" color="text.secondary">
                        {result.details}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Stack>
      </Box>
    </Container>
  );
};

export default FileTest;