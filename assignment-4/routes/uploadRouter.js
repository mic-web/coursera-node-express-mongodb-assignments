const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')
const path = require('path')

const authenticate = require('../authenticate')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/images'))
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  },
})

const imageFileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|bmp)$/)) {
    return cb(new Error('Only image files allowed'), false)
  }
  cb(null, true)
}

const upload = multer({ storage, fileFilter: imageFileFilter })

const uploadRouter = express.Router()

uploadRouter.use(bodyParser.json())

uploadRouter
  .route('/')
  .get(authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403
    res.end('GET operation not supported on /imageUpload')
  })
  .post(authenticate.verifyAdmin, upload.single('imageFile'), (req, res) => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.json(req.file)
  })
  .put(authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403
    res.end('PUT operation not supported on /imageUpload')
  })
  .delete(authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403
    res.end('DELETE operation not supported on /imageUpload')
  })

module.exports = uploadRouter
