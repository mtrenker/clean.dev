#!/bin/bash

# Check if all required arguments are provided
if [ $# -ne 2 ]; then
    echo "Usage: $0 <destination_file> <prefix>"
    exit 1
fi

source_file="appspec.yml.t"
destination_file="$1"
prefix="$2"

# Check if the source file exists
if [ ! -f "$source_file" ]; then
    echo "Source file '$source_file' not found."
    exit 1
fi

# Copy the source file to the destination
cp "$source_file" "$destination_file"

# Get a list of environment variables with the specified prefix
env_vars=$(env | grep "^${prefix}_")

# Iterate through the environment variables and replace placeholders in the copied file
while IFS= read -r env_var; do
    var_name=$(echo "$env_var" | cut -d '=' -f 1)
    var_value=$(echo "$env_var" | cut -d '=' -f 2-)
    placeholder="$"${var_name#${prefix}_}  # Remove prefix from the variable name
    sed -i "s|${placeholder}|$var_value|g" "$destination_file"
done <<< "$env_vars"

echo "File copied to '$destination_file' with placeholders replaced."
