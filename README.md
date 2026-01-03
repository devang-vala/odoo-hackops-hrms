# HRMS - Human Resource Management System

🔗 **Live Demo:** [https://odoo-hackops-hrms.vercel.app](https://odoo-hackops-hrms.vercel.app)

---

## 🚀 Features

### 🔐 Authentication
- Email/Password login with JWT
- HR self-registration
- Auto-generated Employee IDs (`OIJODO20220001`)
- **Email notifications with credentials on employee creation**
- Mandatory password change on first login

### 👥 Employee Management
- HR creates employees
- Auto-generated Employee ID format: `[Company][Name][Year][Serial]`
- Company logo upload (Cloudinary)
- Employee list & management

### ⏰ Attendance
- Check-in/Check-out system
- Manual attendance entry (HR)
- Work hours tracking
- Attendance reports

### 🏖️ Leave Management
- Leave types:  Paid (20), Sick (10), Casual (12), Unpaid
- Apply, approve/reject leaves
- Leave balance tracking
- Leave history

### 💰 Payroll
- Flexible salary structure
- Component-based (Basic, HRA, PF, Tax, etc.)
- Fixed or percentage-based calculations
- Automatic computation
- Employee payslip view (read-only)

---

## 🛠️ Tech Stack

**Frontend:** Next.js 14, React, TailwindCSS, shadcn/ui  
**Backend:** Next.js API Routes  
**Database:** PostgreSQL + Prisma  
**Auth:** JWT, bcryptjs  
**Storage:** Cloudinary  
**Email:** Nodemailer

---

## ⚡ Quick Start

```bash
# Clone
git clone https://github.com/devang-vala/odoo-hackops-hrms.git
cd hrms

# Install
npm install

# Setup . env.local
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret"
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="app-password"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Database
npx prisma generate
npx prisma migrate dev

# Run
npm run dev
```
## 📧 Email Notifications
- Automated emails sent for:

- Employee onboarding (credentials)

<br>
Built with ❤️ for HackOps
