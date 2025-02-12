const AWS = require('aws-sdk');

async function testAWSCredentials() {
    try {
        // This will use the IAM role credentials automatically on EC2
        const sts = new AWS.STS();
        const data = await sts.getCallerIdentity().promise();
        
        console.log('Successfully authenticated with AWS!');
        console.log('Account:', data.Account);
        console.log('ARN:', data.Arn);
        console.log('UserID:', data.UserId);
        
        return true;
    } catch (error) {
        console.error('Error testing AWS credentials:', error.message);
        return false;
    }
}

// Run the test
testAWSCredentials();
