const AWS = require('aws-sdk');

async function checkIAMPermissions() {
    try {
        // Initialize IAM client
        const iam = new AWS.IAM();
        const sts = new AWS.STS();

        // Get current identity
        const identity = await sts.getCallerIdentity().promise();
        console.log('\nCurrent Identity:');
        console.log('----------------');
        console.log('ARN:', identity.Arn);
        console.log('Account:', identity.Account);

        // If this is an EC2 instance role, extract the role name from the ARN
        const arnParts = identity.Arn.split('/');
        const roleName = arnParts[arnParts.length - 1];

        // Get role policies
        const attachedPolicies = await iam.listAttachedRolePolicies({ RoleName: roleName }).promise();
        
        console.log('\nAttached Policies:');
        console.log('-----------------');
        
        // Get detailed policy information for each attached policy
        for (const policy of attachedPolicies.AttachedPolicies) {
            console.log(`\nPolicy Name: ${policy.PolicyName}`);
            console.log(`Policy ARN: ${policy.PolicyArn}`);

            // Get policy details
            const policyDetails = await iam.getPolicy({ PolicyArn: policy.PolicyArn }).promise();
            const policyVersion = await iam.getPolicyVersion({
                PolicyArn: policy.PolicyArn,
                VersionId: policyDetails.Policy.DefaultVersionId
            }).promise();

            console.log('Policy Document:');
            console.log(JSON.stringify(policyVersion.PolicyVersion.Document, null, 2));
        }

    } catch (error) {
        console.error('Error checking IAM permissions:', error.message);
        if (error.code === 'AccessDenied') {
            console.log('\nTIP: The IAM role might not have permissions to read its own policies.');
            console.log('You can still test specific service permissions:');
            
            // Test some common AWS services
            await testServiceAccess('s3');
            await testServiceAccess('dynamodb');
            await testServiceAccess('sns');
            await testServiceAccess('sqs');
        }
    }
}

async function testServiceAccess(service) {
    const aws = new AWS[service.toUpperCase()]();
    try {
        switch(service) {
            case 's3':
                await aws.listBuckets().promise();
                console.log('✅ Has S3 list buckets permission');
                break;
            case 'dynamodb':
                await aws.listTables().promise();
                console.log('✅ Has DynamoDB list tables permission');
                break;
            case 'sns':
                await aws.listTopics().promise();
                console.log('✅ Has SNS list topics permission');
                break;
            case 'sqs':
                await aws.listQueues().promise();
                console.log('✅ Has SQS list queues permission');
                break;
        }
    } catch (error) {
        if (error.code === 'AccessDenied') {
            console.log(`❌ No ${service.toUpperCase()} permissions`);
        } else {
            console.log(`⚠️ Error testing ${service.toUpperCase()} access:`, error.message);
        }
    }
}

// Run the checks
checkIAMPermissions();
