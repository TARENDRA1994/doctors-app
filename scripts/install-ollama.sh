#!/bin/bash

# Update system packages
echo "Updating system packages..."
sudo apt-get update && sudo apt-get upgrade -y

# Install curl if it's not installed
echo "Installing curl..."
sudo apt-get install -y curl

# Download and install Ollama via their official script
echo "Installing Ollama..."
curl -fsSL https://ollama.com/install.sh | sh

# Enable and start the Ollama service
echo "Starting Ollama service..."
sudo systemctl enable ollama
sudo systemctl start ollama

# Pull a lightweight but powerful model suitable for 12GB RAM (CPU inference)
# Llama 3 (8B) or Mistral are great choices. We will pull Llama 3 here.
echo "Pulling Llama 3 model..."
ollama pull llama3

echo "Installation complete!"
echo "You can test it by running: ollama run llama3"
