# Prismic Webhook Configuration Guide

## Overview

Cache invalidation for Prismic labels uses webhook events from Prismic. When you publish or unpublish label documents in Prismic, the webhook automatically invalidates the Next.js cache, ensuring fresh labels on the next request.

## Prerequisites

1. Access to Prismic repository settings
2. A deployed application with HTTPS endpoint
3. Generated webhook secret

## Step 1: Generate Webhook Secret

Create a strong random secret (at least 32 characters):

```bash
# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Example output:
```
AbCdEfGhIjKlMnOpQrStUvWxYzAbCdEfGhIjKlMnOpQrStUvWxYz==
```

## Step 2: Configure Environment Variables

### Development

Add to `.env.local`:

```bash
PRISMIC_WEBHOOK_SECRET=your-generated-secret-here
LABEL_SOURCE=prismic
IBE_DEBUG_LABEL_FLOW=true
```

### Staging / Production

Add to your deployment environment variables:

```bash
PRISMIC_WEBHOOK_SECRET=your-generated-secret-here
LABEL_SOURCE=prismic
```

## Step 3: Determine Webhook Endpoint

The webhook endpoint depends on your deployment:

| Environment | Endpoint |
|---|---|
| Local Dev | `http://localhost:3000/booking/api/prismic/revalidate` (not reachable from Prismic) |
| SIT | `https://sit.zipair.example.com/booking/api/prismic/revalidate` |
| UAT | `https://uat.zipair.example.com/booking/api/prismic/revalidate` |
| Production | `https://booking.zipair.com/booking/api/prismic/revalidate` |

**Note**: Prismic webhooks require publicly reachable HTTPS endpoints. Local development cannot receive webhooks.

## Step 4: Configure Webhook in Prismic Dashboard

### For IBE Application

1. Open your Prismic repository
2. Navigate to **Settings** → **Webhooks**
3. Click **Add Webhook**
4. Fill in the form:
   - **Name**: `IBE Label Cache Invalidation`
   - **URL**: `https://your-domain/booking/api/prismic/revalidate`
   - **Secret**: Paste your generated secret
5. Enable **Custom Triggers**:
   - ☑️ Document Published
   - ☑️ Document Unpublished
6. Click **Add this webhook**

### For TOP Application

Create a second webhook with the same secret:

1. Click **Add Webhook** again
2. Fill in the form:
   - **Name**: `TOP Label Cache Invalidation`
   - **URL**: `https://your-domain/booking/api/prismic/revalidate`
   - **Secret**: Same secret as IBE
3. Enable **Custom Triggers**:
   - ☑️ Document Published
   - ☑️ Document Unpublished
4. Click **Add this webhook**

**Rationale**: Both applications use the same endpoint because the webhook handler is environment-aware and routes invalidation based on document types (`ibe` → ibe-app, `top` → top-app).

## Step 5: Test the Webhook

### Using Prismic Dashboard

1. In Webhooks section, find your webhook
2. Click the three-dot menu → **Test Trigger**
3. Confirm you see a green checkmark (successful)
4. Confirm the response shows `"success": true`

### Manual Testing

1. Publish a label document (e.g., `common`) in Prismic
2. Check server logs for:
   ```
   [prismic-webhook] { event: 'DOCUMENT_PUBLISHED', invalidatedTags: [...], ... }
   ```
3. Refresh your application - should show fresh labels from Prismic

### Testing Invalid Secret

To verify security:

1. Send a curl request with a wrong secret:
   ```bash
   curl -X POST https://your-domain/booking/api/prismic/revalidate \
     -H "Content-Type: application/json" \
     -d '{"type":"DOCUMENT_PUBLISHED","secret":"wrong","documents":[{"type":"ibe"}]}'
   ```
2. Expect HTTP 401 response

## Cache Invalidation Behavior

| Event | Cache Behavior |
|---|---|
| Publish IBE English | Invalidates: `prismic-labels`, `prismic-labels:ibe-app`, `prismic-labels:ibe-app:en` |
| Publish IBE Japanese | Invalidates: `prismic-labels`, `prismic-labels:ibe-app`, `prismic-labels:ibe-app:ja` |
| Publish TOP English | Invalidates: `prismic-labels`, `prismic-labels:top-app`, `prismic-labels:top-app:en` |
| Unpublish any | Same invalidation as publish |

Next request after invalidation: Fetches fresh labels from Prismic.

## Troubleshooting

### Webhook Not Triggering

- Verify endpoint is publicly reachable (test with curl from internet)
- Confirm endpoint is HTTPS (not HTTP)
- Check basePath: endpoint must include `/booking`
- Verify secret matches exactly

### Cache Not Refreshing

- Enable `IBE_DEBUG_LABEL_FLOW=true` in environment
- Publish a document and check server logs
- Logs should show: `[prismic-webhook] { event: 'DOCUMENT_PUBLISHED', ... }`
- If no logs appear: webhook is not reaching the endpoint

### Labels Still Old After Publish

- Verify the webhook succeeded (green checkmark in Prismic)
- Refresh browser completely (Ctrl+Shift+R / Cmd+Shift+R)
- Check that `LABEL_SOURCE=prismic` is set (not `local`)

## Environment-Specific Setup

### SIT (Staging)

```bash
# .env for SIT deployment
PRISMIC_WEBHOOK_SECRET=your-sit-secret
PRISMIC_REPOSITORY_NAME=zipair-sit
LABEL_SOURCE=prismic
```

Prismic Webhook URL: `https://sit.zipair.example.com/booking/api/prismic/revalidate`

### Production

```bash
# .env for PROD deployment
PRISMIC_WEBHOOK_SECRET=your-prod-secret (different from SIT!)
PRISMIC_REPOSITORY_NAME=zipair-prod
LABEL_SOURCE=prismic
```

Prismic Webhook URL: `https://booking.zipair.com/booking/api/prismic/revalidate`

**Security**: Use different secrets for each environment.

## Cache Lifetime

- Default: **24 hours** (86400 seconds)
- Mechanism: On-demand invalidation via webhook
- Behavior: When label is published, cache is invalidated immediately
- Fallback: If webhook fails, label remains cached for up to 24 hours

To change cache lifetime, modify `cacheLife({ max: 86400 })` in `label-service.ts`.
