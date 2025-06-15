#!/bin/bash

# Setup Vercel Environment Variables for Multi-Agent Platform
set -e

echo "🔧 Configuring Vercel Environment Variables..."

# Read from .env.production file
source .env.production

# Add all environment variables to Vercel
echo "$NEXTAUTH_SECRET" | vercel env add NEXTAUTH_SECRET production --force
echo "$NEXTAUTH_URL" | vercel env add NEXTAUTH_URL production --force
echo "$DATABASE_URL" | vercel env add DATABASE_URL production --force
echo "$POLAR_ACCESS_TOKEN" | vercel env add POLAR_ACCESS_TOKEN production --force
echo "$POLAR_ORGANIZATION_ID" | vercel env add POLAR_ORGANIZATION_ID production --force
echo "$POLAR_SITE_CREATION_PRODUCT_ID" | vercel env add POLAR_SITE_CREATION_PRODUCT_ID production --force
echo "$POLAR_MAINTENANCE_PRODUCT_ID" | vercel env add POLAR_MAINTENANCE_PRODUCT_ID production --force

# Agent Configuration
echo "$ORCHESTRATOR_PORT" | vercel env add ORCHESTRATOR_PORT production --force
echo "$CORE_PLATFORM_PORT" | vercel env add CORE_PLATFORM_PORT production --force
echo "$DESIGN_IA_PORT" | vercel env add DESIGN_IA_PORT production --force
echo "$AUTOMATION_PORT" | vercel env add AUTOMATION_PORT production --force
echo "$ADS_MANAGEMENT_PORT" | vercel env add ADS_MANAGEMENT_PORT production --force

# Performance Settings
echo "$AGENT_RESPONSE_TIMEOUT" | vercel env add AGENT_RESPONSE_TIMEOUT production --force
echo "$AGENT_HEARTBEAT_INTERVAL" | vercel env add AGENT_HEARTBEAT_INTERVAL production --force
echo "$AGENT_MAX_RETRIES" | vercel env add AGENT_MAX_RETRIES production --force

echo "✅ All environment variables configured for production deployment"