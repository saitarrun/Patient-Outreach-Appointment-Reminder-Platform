#!/bin/bash
set -e

echo "🚀 Starting Deployment Process to AWS (us-west-1)..."

# 1. Get Account ID and Region
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION="us-west-1"

echo "✅ Detected Account ID: $ACCOUNT_ID"
echo "✅ Target Region: $REGION"

# 1.5 Setup Temp Docker Config (Bypass CredsHelper for speed)
export DOCKER_CONFIG="$(pwd)/.docker_tmp"
mkdir -p "$DOCKER_CONFIG"
echo '{"auths":{}}' > "$DOCKER_CONFIG/config.json"
echo "⚠️  Using temporary Docker config at $DOCKER_CONFIG to bypass keychain..."

# 2. Login to ECR
echo "🔑 Logging into ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

# 3. Create Repositories (if they don't exist)
echo "📦 Checking/Creating ECR Repositories..."
aws ecr describe-repositories --repository-names patient-outreach-server --region $REGION || aws ecr create-repository --repository-name patient-outreach-server --region $REGION
aws ecr describe-repositories --repository-names patient-outreach-client --region $REGION || aws ecr create-repository --repository-name patient-outreach-client --region $REGION

# 3.5 Build Images for linux/amd64 (Required for Fargate)
echo "🔨 Building Images for linux/amd64..."
docker build --platform linux/amd64 -f server.Dockerfile -t patientoutreachandappointmentreminderplatform-server:latest .
docker build --platform linux/amd64 -f client.Dockerfile -t patientoutreachandappointmentreminderplatform-client:latest .

# 4. Tag and Push Server
SERVER_REPO_URL="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/patient-outreach-server"
echo "📤 Pushing Server Image to $SERVER_REPO_URL..."
docker tag patientoutreachandappointmentreminderplatform-server:latest $SERVER_REPO_URL:latest
docker push $SERVER_REPO_URL:latest

# 5. Tag and Push Client
CLIENT_REPO_URL="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/patient-outreach-client"
echo "📤 Pushing Client Image to $CLIENT_REPO_URL..."
docker tag patientoutreachandappointmentreminderplatform-client:latest $CLIENT_REPO_URL:latest
docker push $CLIENT_REPO_URL:latest

# 6. Apply Terraform
echo "🏗️ Applying Terraform Infrastructure..."
cd terraform
terraform init
terraform apply \
  -var="server_image=$SERVER_REPO_URL:latest" \
  -var="client_image=$CLIENT_REPO_URL:latest" \
  -auto-approve

echo "✅ Dpeloyment Complete!"
echo "📡 Getting Load Balancer DNS..."
terraform output -json | jq -r .alb_dns_name.value
