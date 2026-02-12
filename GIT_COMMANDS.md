# Git Commands Quick Reference

## ✅ Security Audit Complete

**Status**: PASSED - No critical vulnerabilities found. Safe to publish to GitHub.

See `SECURITY.md` for full security audit details.

---

## Initial Setup

```bash
# Navigate to the extension folder
cd HypExtension

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Nova AI Assistant Chrome Extension v1.0.0"

# Add remote repository (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/nova-chrome-extension.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

## Future Updates

```bash
# Check status
git status

# Add changes
git add .

# Commit changes
git commit -m "Description of changes"

# Push to GitHub
git push

# Create a new version tag
git tag -a v1.1.0 -m "Version 1.1.0"
git push origin v1.1.0
```

## Common Tasks

### Update README
```bash
git add README.md
git commit -m "docs: update README"
git push
```

### Fix a bug
```bash
git add .
git commit -m "fix: resolve issue with quick actions"
git push
```

### Add a feature
```bash
git add .
git commit -m "feat: add conversation export functionality"
git push
```

### Update documentation
```bash
git add *.md
git commit -m "docs: improve installation instructions"
git push
```

## Branching (Optional)

```bash
# Create a new branch for a feature
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push branch to GitHub
git push -u origin feature/new-feature

# Switch back to main
git checkout main

# Merge feature branch
git merge feature/new-feature

# Delete feature branch
git branch -d feature/new-feature
```

## Troubleshooting

### Undo last commit (keep changes)
```bash
git reset --soft HEAD~1
```

### Undo last commit (discard changes)
```bash
git reset --hard HEAD~1
```

### View commit history
```bash
git log --oneline
```

### Check remote URL
```bash
git remote -v
```

### Change remote URL
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/new-repo.git
```

## Commit Message Conventions

Use these prefixes for clear commit messages:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

### Examples:
```bash
git commit -m "feat: add streaming response support"
git commit -m "fix: resolve markdown formatting issue"
git commit -m "docs: update quick start guide"
git commit -m "style: improve button spacing"
git commit -m "refactor: simplify API call logic"
```

## Ready to Publish?

Follow the steps in [PUBLISH_CHECKLIST.md](PUBLISH_CHECKLIST.md)!
