const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const fs = require('fs')

exports.handler = (event, context, callback) => {
  const bucket = process.env.BUCKET
  const msg = event.Records[0].Sns.Message || ''

  console.log(`uploading badges to ${bucket}`)
  const [, project, status] = msg.match(/build project '(.*)' has reached the build status of '(.*)'/i)
  const image = `badges/build-${status}.svg`
  const key = `${project}.svg`

  console.log(`Build for project "${project}" was "${status}"; uploading badge ${image} to s3://${bucket}/${key}`)

    const params = {
      Bucket: bucket,
      Key: key,
      Body: fs.readFileSync(image),
      ACL: 'public-read',
      ContentType: 'image/svg+xml'
    }

    s3.putObject(params, (err, data) => {
      if (err) {
        const message = `could not upload image to S3: ${err}`

        console.error(message)
        callback(message, null)
      } else {
        const message = 'upload complete'

        console.log(message)
        callback(null, message)
      }
    })
}
