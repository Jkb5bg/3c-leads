# 3C Leads CRM - Setup Guide

Complete guide to set up and run your government contract leads CRM.

## Prerequisites

- Node.js (v14 or higher)
- AWS Account
- Your leads.txt file

## Step 1: AWS S3 Setup

### 1.1 Create an S3 Bucket

1. Log into your AWS Console
2. Navigate to S3 service
3. Click "Create bucket"
4. Choose a unique bucket name (e.g., `my-company-leads-crm`)
5. Select your preferred region (e.g., `us-east-1`)
6. **Important:** Uncheck "Block all public access" is NOT needed - keep it blocked for security
7. Enable versioning (optional but recommended)
8. Click "Create bucket"

### 1.2 Configure CORS (Cross-Origin Resource Sharing)

1. Click on your newly created bucket
2. Go to the "Permissions" tab
3. Scroll to "Cross-origin resource sharing (CORS)"
4. Click "Edit" and paste this configuration:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "DELETE",
            "HEAD"
        ],
        "AllowedOrigins": [
            "*"
        ],
        "ExposeHeaders": []
    }
]
```

5. Click "Save changes"

### 1.3 Create IAM User with S3 Access

1. Navigate to IAM service in AWS Console
2. Click "Users" → "Add users"
3. Enter a username (e.g., `leads-crm-user`)
4. Select "Access key - Programmatic access"
5. Click "Next: Permissions"
6. Click "Attach existing policies directly"
7. Search for and select "AmazonS3FullAccess" (or create a custom policy for just your bucket)
8. Click through to create the user
9. **IMPORTANT:** Save your Access Key ID and Secret Access Key - you'll need these!

### Custom Policy (More Secure - Recommended)

Instead of full S3 access, create a custom policy that only grants access to your specific bucket:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::your-bucket-name/*",
                "arn:aws:s3:::your-bucket-name"
            ]
        }
    ]
}
```

Replace `your-bucket-name` with your actual bucket name.

## Step 2: Project Setup

### 2.1 Install Dependencies

```bash
npm install
```

### 2.2 Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and fill in your values:
```env
REACT_APP_AWS_ACCESS_KEY_ID=your_access_key_from_step_1.3
REACT_APP_AWS_SECRET_ACCESS_KEY=your_secret_key_from_step_1.3
REACT_APP_AWS_REGION=us-east-1
REACT_APP_S3_BUCKET_NAME=your-bucket-name
REACT_APP_LOGIN_PASSWORD=YourSecurePassword123
```

**IMPORTANT:** Never commit the `.env` file to git! It's already in `.gitignore`.

## Step 3: Import Your Leads

### Option 1: Via Web Interface (Recommended)

1. Start the application:
```bash
npm start
```

2. Login with your password (from `REACT_APP_LOGIN_PASSWORD`)
3. Click "Import Leads.txt" button
4. Select your leads.txt file
5. Wait for the upload to complete

### Option 2: Manual Upload to S3

1. Parse your leads.txt file using the parser
2. Upload the resulting JSON to S3 as `leads-data.json`

## Step 4: Run the Application

### Development Mode

```bash
npm start
```

The app will open at `http://localhost:3000`

### Production Build

```bash
npm run build
```

This creates an optimized build in the `build/` folder that you can deploy to any static hosting service (Netlify, Vercel, AWS S3 + CloudFront, etc.).

## Features

### Lead Management
- View all leads with statistics
- Search and filter by status
- Sort by various criteria
- Click on any lead to view details

### Lead Details
- Update contact information (phone, email)
- Change lead status (new, contacted, qualified, unqualified)
- Add call records with outcomes and notes
- Track call history
- Add general notes

### Call Tracking
- Log every call with date/time
- Record call outcome (answered, voicemail, no answer, busy)
- Add call duration and notes
- View complete call history

### Data Storage
- All data stored securely in your S3 bucket
- Automatic backups can be enabled
- Changes sync immediately to S3
- Data persists between sessions

## Security Notes

1. **Password Protection**: The app uses a simple single password. For multiple users, consider implementing proper authentication.

2. **AWS Credentials**: Keep your AWS credentials secret. Never commit them to version control.

3. **S3 Bucket**: Keep your bucket private. The app accesses it using AWS SDK credentials.

4. **HTTPS**: When deploying to production, use HTTPS to protect data in transit.

## Troubleshooting

### "Failed to load leads" Error

- Check your AWS credentials in `.env`
- Verify your S3 bucket name is correct
- Check CORS configuration on your bucket
- Check browser console for detailed error messages

### "Access Denied" Error

- Verify your IAM user has S3 permissions
- Check that the bucket policy allows your IAM user
- Verify credentials are correctly set in `.env`

### Import Fails

- Check that your leads.txt file matches the expected format
- Look at browser console for parsing errors
- Try a smaller sample file first

## Cost Estimates

AWS S3 is very inexpensive for this use case:

- **Storage**: ~$0.023 per GB per month
  - For several thousand leads (~5-10MB): Less than $0.01/month
- **Requests**:
  - PUT/POST: $0.005 per 1,000 requests
  - GET: $0.0004 per 1,000 requests
  - Typical usage: Less than $0.10/month

**Total estimated cost: Less than $1/month**

## Deployment Options

### Option 1: Netlify (Easiest)
1. Push code to GitHub
2. Connect Netlify to your repo
3. Add environment variables in Netlify dashboard
4. Deploy

### Option 2: Vercel
Similar to Netlify

### Option 3: AWS S3 + CloudFront
1. Build the app: `npm run build`
2. Upload `build/` folder to S3
3. Enable static website hosting
4. Configure CloudFront for HTTPS
5. Set environment variables at build time

## Support

For issues or questions, check:
- Browser console for errors
- AWS CloudWatch logs
- Network tab in browser dev tools

## Future Enhancements

Possible improvements:
- Multi-user authentication
- Export to CSV/Excel
- Email integration
- Calendar integration for follow-ups
- Automated reminders
- Analytics dashboard
