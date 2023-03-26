import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';

const XAWS = AWSXRay.captureAWS(AWS);

// TODO: Implement the fileStogare logic

const s3BucketName = process.env.ATTACHMENTS_S3_BUCKET;
const urlExpiration = 300

export class AttachmentUtils{
   constructor(
        private readonly s3 =new XAWS.S3({signatureVersion: 'v4'}),
        private readonly bucketName=s3BucketName,
       // private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION

       ){}
      getAttachmentUrl(todoId: string){
            const url =`https://${this.bucketName}.s3.amazonaws.com/${todoId}`
            return url       
        } 
      getUploadUrl(todoId: string): string{
       const url = this.s3.getSignedUrl('putobject',{
            Bucket: this.bucketName,
            key: todoId,
            Expires: urlExpiration

 })
 return url as string
}
}


