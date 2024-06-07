import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import {
  Container,
  CssBaseline,
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  AppBar,
  Toolbar,
  LinearProgress,
  Snackbar,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';
import CloseIcon from '@mui/icons-material/Close';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const serverAddress = "https://e35f-34-91-221-240.ngrok-free.app"
var fileUrl;

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff1744',
    },
    secondary: {
      main: '#ff80ab',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

function App() {
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [outputVideoUrl, setOutputVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      if (file.type.startsWith('image/')) {
        setImage(file);
      } else if (file.type.startsWith('video/')) {
        setVideo(file);
      } else {
        setSnackbarMessage('Invalid file type. Please upload an image or video file.');
        setSnackbarOpen(true);
      }
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'image/*,video/mp4',
    multiple: true,
  });

  function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image || !video) {
      setSnackbarMessage('Both image and video files are required!');
      setSnackbarOpen(true);
      return;
    }
    const filename = generateRandomString(10);
    const formData = new FormData();
    formData.append('image', image);
    formData.append('video', video);
    formData.append('filename', filename);

    setLoading(true);

    fileUrl = serverAddress + '/files/' + filename + '.mp4';
    // Alert and log the file URL
    alert(fileUrl);
    console.log(fileUrl);

    // Set the output video URL
    setOutputVideoUrl(fileUrl);

    try {
      // Make the POST request using fetch
      const response = await fetch(serverAddress + '/upload', {
        method: 'POST',
        body: formData
      });

      // Check if the response is successful
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Parse the JSON response
      const data = await response.json();
      const fileUrl = data.file_url;

      // Alert and log the file URL
      alert(fileUrl);
      console.log(fileUrl);

      // Set the output video URL
      setOutputVideoUrl(fileUrl);
    } catch (error) {
      // Handle any errors that occurred during the upload
      console.error('There was an error uploading the files!', error);
      //setOutputVideoUrl(outputVideoUrl);
      const videoplayer = document.getElementById('videoplayer');
      videoplayer.load();
      alert(outputVideoUrl)
      setSnackbarMessage('Error uploading files!');
      setSnackbarOpen(true);
    } finally {
      // Hide the loading indicator
      setLoading(false);
    }

  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" color="primary">
        <Toolbar>
          <VideoCameraFrontIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Face Swap Application
          </Typography>
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth="md" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper
            elevation={3}
            sx={{
              padding: 4,
              width: '100%',
              maxWidth: 600,
              backgroundColor: '#333',
              borderRadius: 3,
              textAlign: 'center',
            }}
          >
            <Typography component="h1" variant="h5" color="secondary">
              Upload Files for Face Swap
            </Typography>
            <Box
              {...getRootProps()}
              sx={{
                border: '2px dashed #ff80ab',
                borderRadius: 2,
                padding: 4,
                mt: 3,
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: isDragActive ? '#555' : '#444',
              }}
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <Typography variant="body1" color="secondary">
                  Drop the files here ...
                </Typography>
              ) : (
                <Typography variant="body1" color="secondary">
                  Drag 'n' drop some files here, or click to select files
                </Typography>
              )}
            </Box>
            <Grid container spacing={2} justifyContent="center" sx={{ mt: 2 }}>
              <Grid item>
                <Button variant="contained" color="secondary" startIcon={<UploadFileIcon />}>
                  {image ? image.name : 'Upload Image'}
                </Button>
              </Grid>
              <Grid item>
                <Button variant="contained" color="secondary" startIcon={<VideoFileIcon />}>
                  {video ? video.name : 'Upload Video'}
                </Button>
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={handleSubmit}
              disabled={loading || !image || !video}
              color="primary"
            >
              Submit
            </Button>
            {loading && <LinearProgress color="secondary" />}
          </Paper>
          {outputVideoUrl && (
            <Card sx={{ mt: 4, width: '100%', maxWidth: 600, backgroundColor: '#444', borderRadius: 3 }}>
              <CardContent>
                <Typography component="h2" variant="h6" color="secondary">
                  Output Video
                </Typography>
                <video src={outputVideoUrl} id='videoplayer' controls style={{ width: '100%', marginTop: '10px' }} />
                <Button
                  href={outputVideoUrl}
                  download="swapped_video.mp4"
                  variant="contained"
                  sx={{ mt: 2 }}
                  fullWidth
                  color="secondary"
                >
                  Download Video
                </Button>
              </CardContent>
            </Card>
          )}
        </Box>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          message={snackbarMessage}
          action={
            <React.Fragment>
              <IconButton size="small" color="inherit" onClick={handleCloseSnackbar}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </React.Fragment>
          }
        />
      </Container>
    </ThemeProvider>
  );
}

export default App;
