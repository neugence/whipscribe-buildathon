
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
const { OAuth2Client } = require('google-auth-library');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream');
const { promisify } = require('util');

const pipelineAsync = promisify(pipeline);

const app = express();

const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5175';

const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ||
  'http://localhost:3000/auth/google/callback';

const WHIPSCRIBE_API_BASE = 'https://whipscribe.com/api/v1';
const WHIPSCRIBE_API_KEY = process.env.WHIPSCRIBE_API_KEY;

// --------------------------------------------------
// Middleware
// --------------------------------------------------

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// --------------------------------------------------
// Upload configuration
// --------------------------------------------------

const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },

  filename: function (req, file, cb) {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');

    cb(null, `${Date.now()}-${safeName}`);
  }
});

const upload = multer({
  storage,

  limits: {
    fileSize: 100 * 1024 * 1024
  }
});

// --------------------------------------------------
// Google OAuth
// --------------------------------------------------

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

// Demo-only in-memory sessions.
// For a production application, use a database/session store.
const userSessions = new Map();

// --------------------------------------------------
// Google OAuth - Start
// --------------------------------------------------

app.get('/auth/google', (req, res) => {
  try {
    const authUrl = googleClient.generateAuthUrl({
      access_type: 'offline',

      scope: [
        'openid',
        'email',
        'profile',
        'https://www.googleapis.com/auth/drive.readonly'
      ],

      prompt: 'consent'
    });

    console.log('Starting Google OAuth');
    console.log('OAuth redirect URI:', GOOGLE_REDIRECT_URI);

    res.redirect(authUrl);
  } catch (error) {
    console.error('Failed to start Google OAuth:', error.message);

    res.status(500).send('Failed to start Google authentication');
  }
});

// --------------------------------------------------
// Google OAuth - Callback
// --------------------------------------------------

app.get('/auth/google/callback', async (req, res) => {
  try {
    const { code, error } = req.query;

    if (error) {
      console.error('Google OAuth error:', error);

      return res.status(400).send(
        `Google authentication failed: ${error}`
      );
    }

    if (!code) {
      return res.status(400).send(
        'Missing OAuth authorization code'
      );
    }

    console.log('Google OAuth callback received');

    const { tokens } = await googleClient.getToken(code);

    if (!tokens.access_token) {
      console.error('Google did not return an access token');

      return res.status(500).send(
        'Google did not return an access token'
      );
    }

    googleClient.setCredentials(tokens);

    let userId;

    // Google should return an ID token because we requested
    // openid/email/profile scopes.
    if (tokens.id_token) {
      const ticket = await googleClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();

      userId = payload.sub;
    } else {
      // Fallback: retrieve Google profile using the access token.
      const userInfo = await axios.get(
        'https://openidconnect.googleapis.com/v1/userinfo',
        {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`
          }
        }
      );

      userId = userInfo.data.sub;
    }

    if (!userId) {
      return res.status(500).send(
        'Unable to determine Google user'
      );
    }

    // Store OAuth tokens for this user.
    userSessions.set(userId, {
      tokens,
      createdAt: Date.now()
    });

    console.log('Google OAuth successful');

    // Send the user back to the React application.
    res.redirect(
      `${FRONTEND_URL}/?userId=${encodeURIComponent(userId)}`
    );
  } catch (error) {
    console.error(
      'OAuth callback error:',
      error.response?.data || error.message
    );

    res.status(500).send(
      'Authentication failed'
    );
  }
});

// --------------------------------------------------
// Authentication middleware
// --------------------------------------------------

function verifyGoogleToken(req, res, next) {
  const userId =
    req.headers['x-user-id'] ||
    req.query.userId;

  if (!userId) {
    return res.status(401).json({
      error: 'Missing user ID'
    });
  }

  const session = userSessions.get(userId);

  if (!session) {
    return res.status(401).json({
      error: 'Google session not found. Please sign in again.'
    });
  }

  if (!session.tokens?.access_token) {
    return res.status(401).json({
      error: 'Google access token is missing'
    });
  }

  req.userId = userId;
  req.googleTokens = session.tokens;

  next();
}

// --------------------------------------------------
// Authentication status
// --------------------------------------------------

app.get('/api/auth/status', verifyGoogleToken, async (req, res) => {
  try {
    res.json({
      authenticated: true,
      userId: req.userId
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to check authentication status'
    });
  }
});

// --------------------------------------------------
// Google Drive - List folders
// --------------------------------------------------

app.get('/api/drive/folders', verifyGoogleToken, async (req, res) => {
  try {
    const accessToken = req.googleTokens.access_token;

    const response = await axios.get(
      'https://www.googleapis.com/drive/v3/files',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },

        params: {
          q: "mimeType = 'application/vnd.google-apps.folder' and trashed = false",
          fields: 'nextPageToken,files(id,name,parents,modifiedTime)',
          pageSize: 100,
          orderBy: 'name'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(
      'Drive folders error:',
      error.response?.data || error.message
    );

    res.status(500).json({
      error: 'Failed to fetch Google Drive folders',
      details: error.response?.data || error.message
    });
  }
});

// --------------------------------------------------
// Google Drive - List files in folder
// --------------------------------------------------

app.get('/api/drive/files', verifyGoogleToken, async (req, res) => {
  try {
    const {
      folderId,
      pageToken
    } = req.query;

    const accessToken = req.googleTokens.access_token;

    const queryParts = [
      'trashed = false'
    ];

    if (folderId) {
      queryParts.push(
        `'${folderId}' in parents`
      );
    }

    // Audio/video files only for Track 3.
    queryParts.push(
      "(mimeType contains 'audio/' or mimeType contains 'video/')"
    );

    const response = await axios.get(
      'https://www.googleapis.com/drive/v3/files',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },

        params: {
          q: queryParts.join(' and '),

          fields:
            'nextPageToken,files(id,name,mimeType,size,modifiedTime,webViewLink)',

          pageSize: 100,

          orderBy: 'name',

          ...(pageToken
            ? { pageToken }
            : {})
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(
      'Drive files error:',
      error.response?.data || error.message
    );

    res.status(500).json({
      error: 'Failed to fetch Google Drive files',
      details: error.response?.data || error.message
    });
  }
});

// --------------------------------------------------
// Google Drive - Download file
// --------------------------------------------------

app.get(
  '/api/drive/files/:fileId/download',
  verifyGoogleToken,
  async (req, res) => {
    try {
      const {
        fileId
      } = req.params;

      const accessToken = req.googleTokens.access_token;

      // Get metadata first.
      const metadataResponse = await axios.get(
        `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
          fileId
        )}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          },

          params: {
            fields: 'id,name,mimeType,size'
          }
        }
      );

      const metadata = metadataResponse.data;

      // Stream the actual file.
      const fileResponse = await axios.get(
        `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
          fileId
        )}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          },

          params: {
            alt: 'media'
          },

          responseType: 'stream'
        }
      );

      res.setHeader(
        'Content-Type',
        metadata.mimeType || 'application/octet-stream'
      );

      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(
          metadata.name
        )}"`
      );

      fileResponse.data.pipe(res);
    } catch (error) {
      console.error(
        'Drive download error:',
        error.response?.data || error.message
      );

      res.status(500).json({
        error: 'Failed to download Drive file',
        details: error.response?.data || error.message
      });
    }
  }
);

// --------------------------------------------------
// Google Drive - Stream file for audio/video playback
// Supports HTTP Range requests for seeking.
// --------------------------------------------------

app.get(
  '/api/drive/files/:fileId/stream',
  verifyGoogleToken,
  async (req, res) => {
    try {
      const { fileId } = req.params;
      const accessToken = req.googleTokens.access_token;

      // Get file metadata
      const metadataResponse = await axios.get(
        `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
          fileId
        )}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            fields: 'id,name,mimeType,size',
          },
        }
      );

      const metadata = metadataResponse.data;

      const range = req.headers.range;

      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };

      const params = {
        alt: 'media',
      };

      // No range: normal streaming response
      if (!range) {
        const fileResponse = await axios.get(
          `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
            fileId
          )}`,
          {
            headers,
            params,
            responseType: 'stream',
          }
        );

        res.setHeader(
          'Content-Type',
          metadata.mimeType || 'application/octet-stream'
        );

        if (metadata.size) {
          res.setHeader('Content-Length', metadata.size);
        }

        res.setHeader('Accept-Ranges', 'bytes');

        fileResponse.data.pipe(res);

        return;
      }

      // Range request
      const fileSize = Number(metadata.size);

      if (!Number.isFinite(fileSize) || fileSize <= 0) {
        return res.status(416).json({
          error: 'File size unavailable for range request',
        });
      }

      const rangeMatch = range.match(/bytes=(\d+)-(\d*)/);

      if (!rangeMatch) {
        return res.status(416).end();
      }

      const start = Number(rangeMatch[1]);

      let end = rangeMatch[2]
        ? Number(rangeMatch[2])
        : fileSize - 1;

      if (start >= fileSize) {
        res.setHeader('Content-Range', `bytes */${fileSize}`);
        return res.status(416).end();
      }

      end = Math.min(end, fileSize - 1);

      const chunkSize = end - start + 1;

      const fileResponse = await axios.get(
        `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
          fileId
        )}`,
        {
          headers: {
            ...headers,
            Range: `bytes=${start}-${end}`,
          },
          params,
          responseType: 'stream',
        }
      );

      res.status(206);

      res.setHeader(
        'Content-Type',
        metadata.mimeType || 'application/octet-stream'
      );

      res.setHeader('Accept-Ranges', 'bytes');

      res.setHeader('Content-Length', chunkSize);

      res.setHeader(
        'Content-Range',
        `bytes ${start}-${end}/${fileSize}`
      );

      fileResponse.data.pipe(res);
    } catch (error) {
      console.error(
        'Drive stream error:',
        error.response?.data || error.message
      );

      if (!res.headersSent) {
        res.status(
          error.response?.status || 500
        ).json({
          error: 'Failed to stream Drive file',
          details:
            error.response?.data ||
            error.message,
        });
      }
    }
  }
);

// --------------------------------------------------
// WhipScribe - Transcribe Google Drive file
// --------------------------------------------------

app.post(
  '/api/whipscribe/transcribe',
  verifyGoogleToken,
  upload.single('file'),
  async (req, res) => {
    let filePath = null;

    try {
      if (!WHIPSCRIBE_API_KEY) {
        return res.status(500).json({
          error: 'WHIPSCRIBE_API_KEY is not configured'
        });
      }

      let fileName;
      let fileMimeType;

      // --------------------------------------------------
      // Google Drive file
      // --------------------------------------------------

      if (req.body?.fileId) {
        const fileId = req.body.fileId;
        const accessToken = req.googleTokens.access_token;

        console.log(`Downloading Google Drive file: ${fileId}`);

        // Get file metadata
        const metadataResponse = await axios.get(
          `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            },
            params: {
              fields: 'id,name,mimeType,size'
            }
          }
        );

        const metadata = metadataResponse.data;

        console.log('Drive file metadata:', {
          name: metadata.name,
          mimeType: metadata.mimeType,
          size: metadata.size
        });

        // Make sure it is audio/video
        if (
          !metadata.mimeType ||
          !(
            metadata.mimeType.startsWith('audio/') ||
            metadata.mimeType.startsWith('video/')
          )
        ) {
          return res.status(400).json({
            error: 'Selected Google Drive file is not an audio or video file'
          });
        }

        fileName =
          metadata.name ||
          req.body.fileName ||
          `drive-${fileId}`;

        fileMimeType =
          metadata.mimeType ||
          req.body.mimeType ||
          'application/octet-stream';

        // Make filename safe
        const safeName = fileName.replace(
          /[^a-zA-Z0-9._-]/g,
          '_'
        );

        filePath = path.join(
          uploadsDir,
          `${Date.now()}-${safeName}`
        );

        // --------------------------------------------------
        // Download actual file from Google Drive
        // --------------------------------------------------

        console.log(`Downloading ${fileName}...`);

        const driveFileResponse = await axios.get(
          `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            },
            params: {
              alt: 'media'
            },
            responseType: 'stream'
          }
        );

        await pipelineAsync(
          driveFileResponse.data,
          fs.createWriteStream(filePath)
        );

        console.log(`Drive file downloaded to: ${filePath}`);
      }

      // --------------------------------------------------
      // Direct local upload fallback
      // --------------------------------------------------

      else if (req.file) {
        filePath = req.file.path;
        fileName = req.file.originalname;
        fileMimeType = req.file.mimetype;

        console.log(`Using uploaded file: ${fileName}`);
      }

      // --------------------------------------------------
      // No file
      // --------------------------------------------------

      else {
        return res.status(400).json({
          error: 'No Google Drive file or uploaded file provided'
        });
      }

      // --------------------------------------------------
      // Send file to WhipScribe
      // --------------------------------------------------

      console.log(`Sending ${fileName} to WhipScribe...`);

      const form = new FormData();

      form.append(
        'file',
        fs.createReadStream(filePath),
        {
          filename: fileName,
          contentType: fileMimeType
        }
      );

      form.append('language', 'auto');
      form.append('diarize', 'true');
      form.append('word_timestamps', 'true');

      const response = await axios.post(
        `${WHIPSCRIBE_API_BASE}/transcribe`,
        form,
        {
          headers: {
            ...form.getHeaders(),
            'X-API-Key': WHIPSCRIBE_API_KEY
          },

          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );

      console.log(
        'WhipScribe transcription started:',
        response.data
      );

      res.status(202).json(response.data);

    } catch (error) {

      console.error(
        'WhipScribe transcription error:',
        error.response?.data || error.message
      );

      res.status(
        error.response?.status || 500
      ).json({
        error: 'Failed to start transcription',

        details:
          error.response?.data ||
          error.message
      });

    } finally {

      // --------------------------------------------------
      // Delete temporary file
      // --------------------------------------------------

      if (
        filePath &&
        fs.existsSync(filePath)
      ) {
        try {
          fs.unlinkSync(filePath);

          console.log(
            `Deleted temporary file: ${filePath}`
          );

        } catch (cleanupError) {

          console.error(
            'Failed to delete temporary transcription file:',
            cleanupError.message
          );
        }
      }
    }
  }
);

// --------------------------------------------------
// WhipScribe - Get job status
// --------------------------------------------------

app.get(
  '/api/whipscribe/jobs/:jobId',
  verifyGoogleToken,
  async (req, res) => {
    try {
      if (!WHIPSCRIBE_API_KEY) {
        return res.status(500).json({
          error: 'WHIPSCRIBE_API_KEY is not configured'
        });
      }

      const {
        jobId
      } = req.params;

      const response = await axios.get(
        `${WHIPSCRIBE_API_BASE}/jobs/${encodeURIComponent(
          jobId
        )}`,
        {
          headers: {
            'X-API-Key': WHIPSCRIBE_API_KEY
          }
        }
      );

      res.json(response.data);
    } catch (error) {
      console.error(
        'WhipScribe job status error:',
        error.response?.data || error.message
      );

      res.status(
        error.response?.status || 500
      ).json({
        error: 'Failed to fetch transcription status',
        details:
          error.response?.data ||
          error.message
      });
    }
  }
);

// --------------------------------------------------
// WhipScribe - Get transcript result
// --------------------------------------------------

app.get(
  '/api/whipscribe/jobs/:jobId/result',
  verifyGoogleToken,
  async (req, res) => {
    try {
      if (!WHIPSCRIBE_API_KEY) {
        return res.status(500).json({
          error: 'WHIPSCRIBE_API_KEY is not configured'
        });
      }

      const {
        jobId
      } = req.params;

      const {
        format = 'json'
      } = req.query;

      const response = await axios.get(
        `${WHIPSCRIBE_API_BASE}/jobs/${encodeURIComponent(
          jobId
        )}/result`,
        {
          headers: {
            'X-API-Key': WHIPSCRIBE_API_KEY
          },

          params: {
            format
          }
        }
      );

      res.json(response.data);
    } catch (error) {
      console.error(
        'WhipScribe transcript error:',
        error.response?.data || error.message
      );

      res.status(
        error.response?.status || 500
      ).json({
        error: 'Failed to fetch transcript',
        details:
          error.response?.data ||
          error.message
      });
    }
  }
);

// --------------------------------------------------
// Health check
// --------------------------------------------------

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// --------------------------------------------------
// Start server
// --------------------------------------------------

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend URL: ${FRONTEND_URL}`);
  console.log(`Google OAuth callback: ${GOOGLE_REDIRECT_URI}`);
});

module.exports = app;