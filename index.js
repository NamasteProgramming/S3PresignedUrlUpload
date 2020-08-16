require('dotenv').config()
const AWS = require('aws-sdk')
const crypto = require('crypto')
const express = require('express')
const app = express()

app.set('view engine', 'ejs')

// Update AWS Settings
const config = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_BUCKET_REGION
}
AWS.config.update(config)

// Createa a reference to s3
const s3 = new AWS.S3({
  signatureVersion: 'v4',
  params: { Bucket: process.env.AWS_BUCKET_NAME }
})

/**
 * This function generates a presigned URL
 */
const uploadImage = async () => {
  /**
   * Key is filename in bucket, change it according to your projects
   * Examples
   * - users/123/profile.jpg
   * - admin/docs/13.pdf
   * - foo.exe
   */
  const key = crypto.randomBytes(16).toString('hex') + '.jpg'
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Expires: 15 * 60, // 15 minutes
    ContentType: 'image/jpeg',
    ACL: 'public-read' // ACL defines permisson of uploaded files
  }
  const url = await s3.getSignedUrlPromise('putObject', params) // Put object is upload operation
  return url
}

/**
 * Render page to upload file
 */
app.get('/', (req, res) => {
  return res.render('index')
})

/**
 * Endpoint to return signed URL.
 */
app.post('/', async (req, res) => {
  res.json(await uploadImage())
})

app.listen(3000, () => {
  console.log('Server is up & running on port 3000')
})
