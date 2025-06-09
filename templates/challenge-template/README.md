# CTF Challenge Template

This template provides a standardized structure for creating CTF challenges in the GlowCTF platform.

## Directory Structure

```
challenge-name/
├── README.md              # This file - challenge documentation
├── Dockerfile             # For dynamic challenges requiring hosting
├── docker-compose.yml     # Local testing environment
├── challenge.json         # Challenge metadata
├── src/                   # Source code and challenge files
│   ├── app/               # Web application files (for web challenges)
│   ├── binary/            # Compiled binaries (for pwn/reverse challenges)
│   ├── files/             # Static files for download
│   └── scripts/           # Helper scripts
├── solution/              # Solution files and writeup
│   ├── solve.py           # Automated solution script
│   ├── writeup.md         # Detailed solution explanation
│   └── flag.txt           # The correct flag
└── tests/                 # Automated tests
    ├── test_challenge.py  # Challenge functionality tests
    └── test_solution.py   # Solution validation tests
```

## Challenge Metadata (challenge.json)

```json
{
  "title": "Challenge Title",
  "description": "Detailed challenge description with instructions",
  "category": "web|crypto|forensics|pwn|reverse|misc",
  "difficulty": "easy|medium|hard",
  "points": 500,
  "flag": "CTF{your_flag_here}",
  "author": "Challenge Author",
  "tags": ["sql-injection", "web", "beginner"],
  "hints": [
    "First hint - available immediately",
    "Second hint - unlocked after first attempt",
    "Third hint - unlocked after multiple attempts"
  ],
  "attachments": [
    "src/files/challenge.zip",
    "src/files/source.txt"
  ],
  "requirements": {
    "hosting": true,
    "docker": true,
    "ports": [80],
    "memory": "256MB",
    "cpu": "0.5"
  },
  "validation": {
    "flagFormat": "CTF\\{[a-zA-Z0-9_]+\\}",
    "maxAttempts": 10,
    "timeLimit": 3600
  },
  "scoring": {
    "basePoints": 500,
    "firstBloodBonus": 100,
    "timeBonusEnabled": true
  }
}
```

## Challenge Types

### 1. Static Challenges
For challenges that only require file downloads (crypto, forensics, some reverse engineering):

- No Dockerfile needed
- Place all files in `src/files/`
- Users download files and solve offline
- Submit flag through web interface

### 2. Dynamic Challenges
For challenges requiring live services (web, pwn, some crypto):

- Requires Dockerfile
- Service runs in isolated container
- Users interact with live service
- Submit flag through web interface

## Dockerfile Template

```dockerfile
# Use appropriate base image
FROM ubuntu:20.04

# Install dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    nginx \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m -s /bin/bash ctfuser

# Copy challenge files
COPY src/app/ /var/www/html/
COPY src/scripts/ /opt/scripts/

# Set permissions
RUN chown -R ctfuser:ctfuser /var/www/html/
RUN chmod +x /opt/scripts/*

# Configure service
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Switch to non-root user
USER ctfuser

# Start service
CMD ["nginx", "-g", "daemon off;"]
```

## Security Guidelines

### Container Security
- Always run as non-root user
- Use read-only filesystem where possible
- Limit memory and CPU usage
- No network access to other containers
- Regular security updates for base images

### Challenge Security
- Never expose real vulnerabilities in production
- Isolate challenge environments
- Validate all user inputs
- Log security events
- Regular penetration testing

### Flag Security
- Use strong, unique flags
- Never hardcode flags in client-side code
- Rotate flags periodically for reused challenges
- Monitor for flag sharing/leaking

## Testing Guidelines

### Automated Testing
```python
# tests/test_challenge.py
import requests
import pytest

def test_challenge_accessibility():
    """Test that challenge service is accessible"""
    response = requests.get("http://localhost:8080")
    assert response.status_code == 200

def test_flag_validation():
    """Test that correct flag is accepted"""
    flag = "CTF{test_flag}"
    # Add your flag validation logic here
    assert validate_flag(flag) == True

def test_security():
    """Test that challenge is secure"""
    # Test for common vulnerabilities
    # SQL injection, XSS, etc.
    pass
```

### Manual Testing Checklist
- [ ] Challenge loads correctly
- [ ] All files are accessible
- [ ] Flag can be found through intended solution
- [ ] No unintended solutions exist
- [ ] Hints are helpful but not too revealing
- [ ] Difficulty matches category
- [ ] No sensitive information exposed

## Solution Template

### solve.py
```python
#!/usr/bin/env python3
"""
Automated solution for [Challenge Name]
Author: [Your Name]
"""

import requests
import re

def solve_challenge():
    """
    Main solution function
    Returns the flag if successful
    """
    target_url = "http://localhost:8080"
    
    # Step 1: Analyze the challenge
    response = requests.get(target_url)
    
    # Step 2: Implement solution logic
    # Add your solution steps here
    
    # Step 3: Extract flag
    flag_pattern = r'CTF\{[^}]+\}'
    flag = re.search(flag_pattern, response.text)
    
    if flag:
        return flag.group(0)
    else:
        return None

if __name__ == "__main__":
    flag = solve_challenge()
    if flag:
        print(f"Flag found: {flag}")
    else:
        print("Flag not found")
```

### writeup.md
```markdown
# Challenge Name - Writeup

## Challenge Description
[Copy the challenge description here]

## Solution Overview
[Brief overview of the solution approach]

## Detailed Solution

### Step 1: Initial Analysis
[Describe initial reconnaissance and analysis]

### Step 2: Vulnerability Discovery
[Explain how you found the vulnerability]

### Step 3: Exploitation
[Detail the exploitation process]

### Step 4: Flag Extraction
[Show how you extracted the flag]

## Alternative Solutions
[Mention any alternative approaches]

## Learning Objectives
- [What skills this challenge teaches]
- [Security concepts demonstrated]
- [Tools and techniques used]

## References
- [Relevant documentation]
- [Security advisories]
- [Educational resources]
```

## Deployment Process

### 1. Local Testing
```bash
# Build and test locally
docker build -t challenge-test .
docker run -p 8080:80 challenge-test

# Test solution
python3 solution/solve.py
```

### 2. Platform Integration
```bash
# Upload via admin panel
curl -X POST http://localhost:5000/api/admin/challenges/enhanced \
  -H "Content-Type: multipart/form-data" \
  -F "title=Challenge Title" \
  -F "description=Challenge description" \
  -F "category=web" \
  -F "difficulty=medium" \
  -F "points=500" \
  -F "flag=CTF{flag_here}" \
  -F "attachments=@src/files/challenge.zip"
```

### 3. Production Deployment
```bash
# Build challenge image
POST /api/admin/challenges/123/build

# Deploy to production
POST /api/admin/challenges/123/deploy
```

## Best Practices

### Challenge Design
- Clear, unambiguous descriptions
- Appropriate difficulty progression
- Educational value
- Realistic scenarios
- Multiple solution paths when appropriate

### Documentation
- Complete README files
- Detailed solution writeups
- Clear setup instructions
- Troubleshooting guides

### Maintenance
- Regular testing and updates
- Monitor for unintended solutions
- Update dependencies and base images
- Collect and analyze user feedback

This template ensures consistent, high-quality challenges that provide educational value while maintaining security and reliability standards.
