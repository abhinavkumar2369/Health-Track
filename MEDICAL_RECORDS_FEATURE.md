# Medical Record Upload Feature - AWS S3 Integration

## Overview
This feature enables patients to upload, view, download, and delete their medical records securely using AWS S3 storage.

## Features Implemented

### Backend (Express.js + MongoDB + AWS S3)

1. **Document Model** (`backend/models/Document.js`)
   - Extended existing schema with S3 fields
   - Fields: fileName, originalName, fileType, fileSize, s3Key, s3Url, category, status
   - Supports categories: lab-report, prescription, scan, consultation, other
   - Status tracking: pending, verified, under-review

2. **Document Routes** (`backend/routes/documentRoutes.js`)
   - `POST /api/documents/upload` - Upload file to S3 and save metadata
   - `POST /api/documents/list` - Get all documents for authenticated patient
   - `POST /api/documents/view/:documentId` - Generate pre-signed URL for viewing (1 hour validity)
   - `POST /api/documents/download/:documentId` - Generate pre-signed URL for download
   - `DELETE /api/documents/:documentId` - Delete from S3 and database

3. **File Validation**
   - Supported formats: PDF, JPG, PNG, DOC, DOCX
   - Maximum file size: 25MB
   - MIME type and extension validation

4. **Security**
   - JWT token authentication
   - Patient ownership verification
   - Private S3 bucket with pre-signed URLs
   - 1-hour temporary access URLs

### Frontend (React + Tailwind CSS)

1. **Upload Interface** (`frontend/src/pages/PatientDashboard.jsx`)
   - Drag and drop file upload
   - File browser selection
   - Real-time file validation
   - Upload progress indication
   - Success/error message display

2. **Document Management**
   - List all uploaded documents
   - View documents (opens in new tab)
   - Download documents
   - Delete documents with confirmation
   - Display file size and upload date
   - Status badges (Pending, Verified, Under Review)
   - Category-based icon colors

### AWS Configuration

**Environment Variables** (`.env`)
```
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=your_aws_region
AWS_BUCKET_NAME=your_bucket_name
```

> **Note:** Add your actual AWS credentials to the `.env` file. Never commit real credentials to version control.

## Installation

Backend packages installed:
```bash
npm install aws-sdk multer jsonwebtoken
```

## How to Use

### For Patients:

1. **Upload a Medical Record**
   - Navigate to "Medical Records" tab
   - Click the upload area or drag and drop a file
   - Supported: PDF, JPG, PNG, DOC (max 25MB)
   - Click "Upload Record" button
   - Wait for success message

2. **View a Record**
   - Click "View" button on any record
   - Opens in new browser tab
   - URL expires after 1 hour for security

3. **Download a Record**
   - Click "Download" button
   - File downloads to your device
   - Original filename preserved

4. **Delete a Record**
   - Click "Delete" button
   - Confirm deletion
   - Removes from both S3 and database

## Security Features

- All uploads require JWT authentication
- Patients can only access their own documents
- S3 bucket set to private (no public access)
- Pre-signed URLs expire after 1 hour
- File type and size validation
- Ownership verification on all operations

## API Endpoints

### Upload Document
```
POST http://localhost:5000/api/documents/upload
Content-Type: multipart/form-data
Body: {
  document: File
  token: JWT_TOKEN
  category: string (optional)
  description: string (optional)
}
```

### List Documents
```
POST http://localhost:5000/api/documents/list
Body: { token: JWT_TOKEN }
```

### View Document
```
POST http://localhost:5000/api/documents/view/:documentId
Body: { token: JWT_TOKEN }
```

### Download Document
```
POST http://localhost:5000/api/documents/download/:documentId
Body: { token: JWT_TOKEN }
```

### Delete Document
```
DELETE http://localhost:5000/api/documents/:documentId
Body: { token: JWT_TOKEN }
```

## S3 Bucket Structure

```
health-track-project/
└── medical-records/
    └── {patientId}/
        └── {patientId}_{timestamp}_{originalFilename}
```

## Error Handling

- File size validation (> 25MB)
- File type validation (only PDF, JPG, PNG, DOC)
- Authentication errors
- S3 upload failures
- Database errors
- User-friendly error messages displayed in UI

## Testing

1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm run dev`
3. Sign in as a patient
4. Navigate to Medical Records tab
5. Upload a test file
6. Verify upload, view, download, and delete operations

## Notes

- Pre-signed URLs are temporary (1 hour)
- Files are stored with unique names to prevent conflicts
- Original filenames are preserved for download
- All operations are logged in console for debugging
- Status badges indicate document verification state
- Category colors help organize different document types

## Troubleshooting

**Upload fails:**
- Check AWS credentials in .env file
- Verify S3 bucket exists and region is correct
- Check file size (< 25MB) and type (PDF, JPG, PNG, DOC)

**View/Download not working:**
- Ensure pre-signed URL hasn't expired (1 hour)
- Check S3 bucket permissions
- Verify document exists in database

**Authentication errors:**
- Verify JWT token is valid
- Check user is logged in as patient
- Confirm token is included in request
