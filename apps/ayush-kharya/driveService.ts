import { google } from 'googleapis';
import axios from 'axios';
import FormData from 'form-data';

export class WhipScribeDriveConnector {
  private drive;
  private whipScribeApiKey: string;
  private readonly SUPPORTED_MIME_TYPES = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/x-m4a',
    'video/mp4'
  ];

  constructor(accessToken: string, apiKey: string) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    this.drive = google.drive({ version: 'v3', auth });
    this.whipScribeApiKey = apiKey;
  }

  // Recursive scan for audio files in drive
  async scanFolderForAudio(folderId: string): Promise<Array<{ id: string; name: string; mimeType: string }>> {
    const query = `'${folderId}' in parents and trashed = false`;
    const response = await this.drive.files.list({
      q: query,
      fields: 'files(id, name, mimeType)',
      pageSize: 100,
    });

    const files = response.data.files || [];
    return files.filter(f => this.SUPPORTED_MIME_TYPES.includes(f.mimeType || ''));
  }

  // Stream file direct from Drive to WhipScribe API
  async dispatchToWhipScribe(fileId: string, fileName: string): Promise<string> {
    const driveStream = await this.drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    const form = new FormData();
    form.append('file', driveStream.data, { filename: fileName });
    form.append('language', 'auto');
    form.append('diarization', 'true');

    const response = await axios.post('https://api.whipscribe.com/v1/transcribe', form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${this.whipScribeApiKey}`,
      },
      maxBodyLength: Infinity,
    });

    return response.data.job_id;
  }
}
