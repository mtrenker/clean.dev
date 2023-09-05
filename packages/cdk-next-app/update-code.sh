#!/bin/bash

if [ $# -ne 3 ]; then
    echo "Usage: $0 <function_name> <zip_file> <appspec_destination>"
    exit 1
fi

# Define the Lambda function name and the zip file path
FUNCTION_NAME="$1"
ZIP_FILE="$2"
APPSPEC_DESTINATION="$3"

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source_file="./appspec.yml.t"

full_source_path="$script_dir/$source_file"

targetResponse=$(aws lambda update-function-code --function-name $FUNCTION_NAME --publish --zip-file fileb://$ZIP_FILE)
currentResponse=$(aws lambda get-alias --function-name $FUNCTION_NAME --name live)

targetVersion=$(echo $targetResponse | grep -o '"Version": "[^"]*' | awk -F ': "' '{print $2}')
currentVersion=$(echo $currentResponse | grep -o '"FunctionVersion": "[^"]*' | awk -F ': "' '{print $2}')

cp "$full_source_path" "$APPSPEC_DESTINATION"

// replace CURRENT_VERSION with currentVersion
sed -i "s|FUNCTION_NAME|$FUNCTION_NAME|g" "$APPSPEC_DESTINATION"
sed -i "s|CURRENT_VERSION|$currentVersion|g" "$APPSPEC_DESTINATION"
sed -i "s|TARGET_VERSION|$targetVersion|g" "$APPSPEC_DESTINATION"

echo "Lambda $FUNCTION_NAME target function version: $targetVersion"
echo "Lambda $FUNCTION_NAME current function version: $currentVersion"
