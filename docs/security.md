# Security

## Environment variables

- **Never commit `.env` files** to version control
- Use `.env.example` as a template (without sensitive values)
- Rotate secrets regularly in production
- Use different secrets for dev and prod environments

## Application security

- **Always set `DEBUG=False`** in production
- Use strong, randomly generated `SECRET_KEY` (minimum 50 characters)
- Use strong database passwords (minimum 16 characters, mixed case, numbers, symbols)
- Keep Django and all dependencies updated
- Regularly review and update `ALLOWED_HOSTS`

## SSL/TLS

- **Always use HTTPS** in production (stg/prod use CloudFront for SSL termination)
- Use strong SSL/TLS configurations (TLS 1.2+)
- Enable HTTP to HTTPS redirect (CloudFront viewer policy: Redirect HTTP to HTTPS)
- Stg/prod: no certbot on the instance; CloudFront holds the certificate

## Database security

- Use strong database passwords
- Never expose database port (5432) publicly; in stg/prod it is not exposed
- Regularly backup database
- Encrypt database backups if containing sensitive data
- Use connection pooling and limit connections where appropriate

## Server / instance security

- Keep operating system updated (`sudo apt update && sudo apt upgrade -y`)
- Firewall: only open ports 22 (SSH) and 80 (HTTP for CloudFront origin). Restrict SSH to your IP where possible
- Use SSH keys instead of passwords
- Disable unnecessary services
- Monitor logs for suspicious activity

## Code security

- Review dependencies for vulnerabilities: `pip-audit` or `safety check`
- Use Django security middleware (enabled by default)
- Implement rate limiting for API endpoints if needed
- Sanitize user inputs; use parameterized queries (Django ORM handles this)

## Lightsail sizing (reference)

- **Staging/production:** 2 GB RAM instance is typical; see [deployment/cloudfront-lightsail.md](deployment/cloudfront-lightsail.md) for cost estimate
- Restrict SSH (port 22) to your IP in the Lightsail firewall
