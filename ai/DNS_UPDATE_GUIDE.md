# Update DNS for aptest.prasklatechnology.com

## Current Status
- Domain: `aptest.prasklatechnology.com`
- Current IP: `147.93.17.221` ❌
- Target IP: `3.145.158.194` ✅

## Steps to Update DNS

### 1. Find Your DNS Provider

Your domain `prasklatechnology.com` is registered with a DNS provider. Common ones:
- GoDaddy
- Namecheap
- Cloudflare
- AWS Route53
- Google Domains

### 2. Update the A Record

Log into your DNS provider and:

1. **Find DNS Management** (might be called):
   - DNS Management
   - DNS Settings
   - Manage DNS
   - DNS Records

2. **Locate the A record for `aptest`**:
   - Name/Host: `aptest`
   - Type: `A`
   - Current Value: `147.93.17.221`

3. **Update the IP address**:
   - Change Value to: `3.145.158.194`
   - TTL: `300` (5 minutes) or `3600` (1 hour)

4. **Save changes**

### 3. Wait for DNS Propagation

DNS changes take time to propagate:
- Minimum: 5 minutes
- Typical: 15-30 minutes
- Maximum: 48 hours (rare)

### 4. Check DNS Propagation

Run this command to check:
```bash
cd ai
./check-dns.sh
```

Or manually:
```bash
dig aptest.prasklatechnology.com
nslookup aptest.prasklatechnology.com
```

You should see `3.145.158.194` in the response.

### 5. Once DNS is Updated

Run the HTTPS deployment:
```bash
cd ai
./deploy-with-https.sh
```

## Alternative: Use the Current IP

If `147.93.17.221` is actually your EC2 instance, update the deployment script:

```bash
# Edit deploy-with-https.sh
nano ai/deploy-with-https.sh

# Change line 5:
EC2_IP="147.93.17.221"  # instead of 3.145.158.194
```

Then run:
```bash
./deploy-with-https.sh
```

## Quick Test

To verify which IP is your EC2:

```bash
# Test IP 1
ssh -i ai/mykeypair.pem ubuntu@3.145.158.194 "echo 'This is the EC2'"

# Test IP 2
ssh -i ai/mykeypair.pem ubuntu@147.93.17.221 "echo 'This is the EC2'"
```

Whichever responds is your actual EC2 instance.

## Need Help?

If you're not sure where your DNS is managed:
```bash
whois prasklatechnology.com | grep -i "registrar"
```

Or check the nameservers:
```bash
dig NS prasklatechnology.com
```
