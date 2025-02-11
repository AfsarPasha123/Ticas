const AWS = require("aws-sdk");

async function listS3Buckets() {
    try {
        // Configure AWS SDK (if not using EC2 IAM Role)
        // AWS.config.update({
        //     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        //     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        //     region: process.env.AWS_REGION
        // });

        const s3 = new AWS.S3(); // Automatically uses EC2 IAM Role credentials

        console.log("Fetching S3 buckets...");
        const data = await s3.listBuckets().promise();
        
        if (data.Buckets && data.Buckets.length > 0) {
            console.log("S3 Buckets:");
            data.Buckets.forEach((bucket, index) => {
                console.log(`${index + 1}. ${bucket.Name} (Created: ${bucket.CreationDate})`);
            });
        } else {
            console.log("No S3 buckets found.");
        }
    } catch (error) {
        console.error("Error listing S3 buckets:", error);
        
        // Provide more specific error guidance
        if (error.code === 'CredentialsError') {
            console.error("AWS Credentials Error: Check your AWS access key and secret.");
        } else if (error.code === 'ConfigError') {
            console.error("AWS Configuration Error: Verify your AWS region and configuration.");
        }
    }
}

// Run the function
listS3Buckets();
