# 📖 Enostics Platform Publication Guide

This guide provides step-by-step instructions for publishing the Enostics platform to the GitHub repository at https://github.com/alsetso/enostics.

## 🚨 **IMPORTANT: Pre-Publication Checklist**

Before publishing, ensure these critical items are addressed:

### ✅ **Security & Privacy**
- [ ] Remove all sensitive API keys from codebase
- [ ] Verify `.env.local` is in `.gitignore`
- [ ] Check for any hardcoded credentials
- [ ] Review all environment variable references

### ✅ **Code Quality**
- [ ] Run `npm run lint` and fix all issues
- [ ] Run `npm run type-check` and resolve TypeScript errors
- [ ] Test production build with `npm run build`
- [ ] Verify all pages load correctly

### ✅ **Content Review**
- [ ] Review README.md for accuracy
- [ ] Update package.json version if needed
- [ ] Check all legal pages (Terms, Privacy) are complete
- [ ] Verify no placeholder content remains

## 📁 **Files to Include/Exclude**

### **✅ Include in Repository**
```
src/                    # All source code
public/                 # Public assets
.cursor/               # Cursor configuration
*.md                   # Documentation files
package.json           # Dependencies
package-lock.json      # Lock file
tsconfig.json          # TypeScript config
tailwind.config.ts     # Tailwind config
next.config.js         # Next.js config
eslint.config.mjs      # ESLint config
postcss.config.mjs     # PostCSS config
.nvmrc                 # Node version
.gitignore             # Git ignore rules
vercel.json            # Vercel deployment config
env.example            # Environment template
env.production.example # Production environment template
```

### **❌ Exclude from Repository**
```
.env.local             # Local environment variables
.env                   # Any environment files
.env.production        # Production environment files
node_modules/          # Dependencies (auto-excluded)
.next/                 # Next.js build files
dist/                  # Build output
*.log                  # Log files
.DS_Store              # MacOS files
coverage/              # Test coverage
.nyc_output/           # Coverage output
```

## 🔧 **Step-by-Step Publication Process**

### **Step 1: Prepare Local Repository**

```bash
# Navigate to your project directory
cd /path/to/Enostics

# Initialize git if not already done
git init

# Add the GitHub repository as remote
git remote add origin https://github.com/alsetso/enostics.git

# Verify remote is set correctly
git remote -v
```

### **Step 2: Review and Stage Files**

```bash
# Check current status
git status

# Add all files to staging
git add .

# Review what will be committed
git status

# If you need to exclude specific files
git reset HEAD <filename>  # Remove from staging
```

### **Step 3: Create Initial Commit**

```bash
# Create comprehensive initial commit
git commit -m "feat: Initial Enostics platform publication

- Add complete Next.js 14 platform with TypeScript
- Implement authentication system with Supabase
- Add modern homepage with responsive design
- Include registration flow (currently disabled)
- Add user dashboard framework
- Implement Terms of Use and Privacy Policy pages
- Add comprehensive component library
- Include production-ready deployment configuration
- Add documentation and development guides

Status: Pre-launch preparation phase"
```

### **Step 4: Push to GitHub**

```bash
# Push to main branch (this will replace existing content)
git push -u origin main --force

# The --force flag is needed to overwrite existing content
# Use with caution - this will replace the current repository content
```

### **Step 5: Verify Publication**

1. Visit https://github.com/alsetso/enostics
2. Verify all files are present and correct
3. Check that README.md displays properly
4. Ensure sensitive files are not visible

## 🚀 **Post-Publication Setup**

### **GitHub Repository Settings**

1. **Description**: Add repository description:
   ```
   Universal personal API platform - Every user becomes their own API
   ```

2. **Topics**: Add relevant topics:
   ```
   nextjs, typescript, supabase, api-platform, personal-api, vercel, tailwindcss
   ```

3. **Website**: Add homepage URL (when deployed):
   ```
   https://enostics.com
   ```

### **Branch Protection Rules**

1. Go to Settings → Branches
2. Add rule for `main` branch:
   - Require pull request reviews before merging
   - Require status checks to pass before merging
   - Require branches to be up to date before merging

### **Deployment Setup**

1. **Vercel Integration**:
   - Connect GitHub repository to Vercel
   - Configure automatic deployments
   - Set up environment variables in Vercel dashboard

2. **Environment Variables** (in Vercel):
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_api_key (optional)
   ```

## 📋 **Additional Considerations**

### **Backup Current Repository**
Before pushing, you may want to backup the existing repository:
```bash
# Clone existing repository to backup
git clone https://github.com/alsetso/enostics.git enostics-backup
```

### **Gradual Migration Alternative**
If you prefer a gradual approach instead of force-pushing:
```bash
# Create new branch for the platform
git checkout -b platform-migration

# Push new branch
git push -u origin platform-migration

# Create pull request on GitHub to merge into main
```

### **Team Communication**
- Notify team members about the repository change
- Update any CI/CD pipelines that reference the repository
- Update documentation links that point to the old repository

## 🔍 **Verification Commands**

Before publishing, run these commands to verify everything is ready:

```bash
# Install dependencies
npm install

# Run linting
npm run lint

# Type checking
npm run type-check

# Build for production
npm run build

# Test production build
npm start

# Check for security vulnerabilities
npm audit
```

## 📞 **Support**

If you encounter any issues during publication:
1. Check GitHub's status page for any service issues
2. Verify your GitHub permissions for the repository
3. Ensure your Git configuration is correct
4. Review the Git output for specific error messages

---

**Note**: This publication will replace the existing MCP Server content with the Enostics platform. Ensure this is intended before proceeding with the `--force` push. 