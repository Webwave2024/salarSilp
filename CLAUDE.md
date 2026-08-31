Build a complete full-stack Employee Payslip CRM application using:

Frontend:
- Next.js
- TypeScript
- React
- CSS / Tailwind CSS
- Responsive design

Backend:
- Next.js App Router API routes / server-side backend
- PostgreSQL
- `pg` package with PostgreSQL Pool
- No ORM
- Use raw parameterized SQL queries

Authentication:
- Login using User ID + Password
- User ID format: WEBWAVE-XXXXX
- Example: WEBWAVE-28282
- Password must be stored as plain text because this is explicitly required for this project.
- IMPORTANT: Keep this implementation isolated so password hashing can easily be introduced later.

Database:
- PostgreSQL
- Use SQL migrations/schema
- Use foreign keys
- Use UNIQUE constraints
- Use transactions where required
- Use parameterized queries to prevent SQL injection

==================================================
CORE APPLICATION FLOW
==================================================

The application has two types of users:

1. ADMIN
2. EMPLOYEE

ADMIN:
- Can create employees
- Can view employees
- Can edit employee information
- Can manage employee salary information
- Can generate payslips

EMPLOYEE:
- Can log in using:
  - User ID
  - Password
- After login, the employee's information should automatically be fetched from PostgreSQL.
- Employee should be able to generate/view their payslip using their stored information.

==================================================
LOGIN PAGE
==================================================

Initially show ONLY the login page.

The login page must contain exactly two main fields:

1. User ID
2. Password

Example:

User ID:
[ WEBWAVE-28282 ]

Password:
[ ******** ]

[ Login ]

Design should be clean, professional and similar to a modern HR/payroll application.

Do NOT show registration on the login page.

Do NOT show employee creation on the login page.

Do NOT show unnecessary fields.

The login API should:

POST /api/auth/login

Request:

{
  "userId": "WEBWAVE-28282",
  "password": "password123"
}

Find the employee/admin using userId.

Compare the supplied password with the stored plain-text password.

If valid:
- create an authenticated session
- store the authenticated user identity securely in an HTTP-only cookie/session
- redirect to the correct dashboard

If invalid:
- show "Invalid User ID or Password"

Never trust employeeId/userId coming from the frontend after authentication.
The authenticated user must be determined from the server-side session.

==================================================
USER ID GENERATION
==================================================

When ADMIN creates an employee, User ID must be automatically generated.

Format:

WEBWAVE-XXXXX

Example:

WEBWAVE-19201
WEBWAVE-28282
WEBWAVE-91827

Use 5 numeric digits.

The User ID must be UNIQUE in PostgreSQL.

Do NOT allow the admin to manually enter the User ID.

When creating a user:

1. Generate WEBWAVE-XXXXX
2. Check uniqueness
3. If collision occurs, generate another ID
4. Insert into PostgreSQL
5. Return the generated User ID to the admin

Example response:

{
  "success": true,
  "user": {
    "userId": "WEBWAVE-28282",
    "name": "Rahul Kumar"
  }
}

==================================================
ADMIN EMPLOYEE CREATION
==================================================

Only ADMIN can create employees.

Create an Admin Dashboard.

Admin should have:

- Dashboard
- Employees
- Create Employee
- Payslips
- Logout

Create Employee form should collect necessary employee/CRM information.

Include fields such as:

Personal Information:
- Full Name
- Email
- Date of Birth
- Contact Number
- Gender
- Address

Employment Information:
- Joining Date
- Role / Designation
- Department
- Qualification
- Employment Type
- Employee Status

Salary Information:
- Annual Salary
- Monthly Salary

Documents:
- PAN Number
- Aadhaar Number
- Bank Account Number
- IFSC Code
- Other relevant document details

Login Information:
- Password

DO NOT ask the admin for User ID.

User ID is automatically generated.

After successful creation, show:

Employee Created Successfully

User ID:
WEBWAVE-28282

Password:
the password entered by admin

Make the generated User ID easy to copy.

==================================================
DATABASE DESIGN
==================================================

Create PostgreSQL tables.

Recommended structure:

users

- id UUID PRIMARY KEY
- user_id VARCHAR(20) UNIQUE NOT NULL
- password TEXT NOT NULL
- role VARCHAR(20) NOT NULL
- created_at TIMESTAMP DEFAULT NOW()
- updated_at TIMESTAMP DEFAULT NOW()

employee_profiles

- id UUID PRIMARY KEY
- user_id UUID UNIQUE REFERENCES users(id)
- full_name
- email
- dob
- contact_number
- gender
- address
- joining_date
- designation
- department
- qualification
- employment_type
- employment_status
- pan_number
- aadhaar_number
- bank_account_number
- ifsc_code
- created_at
- updated_at

employee_salary

- id UUID PRIMARY KEY
- employee_id UUID REFERENCES employee_profiles(id)
- annual_salary
- monthly_salary
- basic_percentage
- hra_percentage
- created_at
- updated_at

payslips

- id UUID PRIMARY KEY
- employee_id UUID REFERENCES employee_profiles(id)
- pay_period
- paid_days
- loss_of_pay_days
- pay_date
- gross_earnings
- total_deductions
- net_payable
- amount_in_words
- created_at

payslip_earnings

- id UUID PRIMARY KEY
- payslip_id UUID REFERENCES payslips(id)
- field_name
- amount

payslip_deductions

- id UUID PRIMARY KEY
- payslip_id UUID REFERENCES payslips(id)
- field_name
- amount

This is important because Earnings and Deductions must be dynamic.

==================================================
POSTGRESQL CONNECTION
==================================================

Use only `pg`.

Install:

npm install pg

Use:

import { Pool } from "pg";

Create:

src/lib/db.ts

Use:

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

Use:

pool.query()

for database operations.

Do NOT use Prisma.
Do NOT use Sequelize.
Do NOT use Mongoose.
Do NOT use any ORM.

DATABASE_URL must come from:

process.env.DATABASE_URL

==================================================
PAYSLIP GENERATION
==================================================

After employee login, automatically fetch the employee information from PostgreSQL.

The payslip form should NOT ask the employee to manually enter information that already exists in the database.

For example:

Employee Name:
automatically fetched

Employee ID:
automatically fetched User ID

The UI should resemble the provided payslip screenshots.

==================================================
EMPLOYEE PAY SUMMARY
==================================================

Create a section:

Employee Pay Summary *

Show:

Employee Name
Employee ID
Pay Period
Paid Days
Loss of Pay Days
Pay Date

Do NOT copy every field from the reference design.

Only use the important fields.

Example:

Employee Name : Rahul Kumar
Employee ID   : WEBWAVE-28282

Pay Period    : August 2026
Paid Days     : 22

Loss of Pay Days : 0
Pay Date         : Aug 31, 2026

Employee Name and Employee ID should be automatically populated from the logged-in employee.

Pay Period should be selectable.

Paid Days should be entered/selected.

Loss of Pay Days should be entered.

Pay Date should be selectable.

==================================================
DYNAMIC "ADD ANOTHER FIELD"
==================================================

The payslip must support dynamic fields.

For Employee Pay Summary:

[ + Add another field ]

When clicked:

Field Name: __________
Value: __________

Example:

Employee Name
Employee ID
Pay Period
Paid Days
Loss of Pay Days
Pay Date

+ Add another field

If admin adds:

Working Days = 26

Then it should appear automatically in the payslip.

These custom fields must be stored in PostgreSQL.

Do NOT hard-code a fixed number of custom fields.

==================================================
INCOME DETAILS
==================================================

Create:

Income Details *

Use a two-column table.

LEFT:
Earnings
Amount

RIGHT:
Deductions
Amount

Example:

------------------------------------------------
Earnings                 Amount
------------------------------------------------
Basic Salary             ₹25,000
House Rent Allowance     ₹12,500

+ Add Earnings

Gross Earnings           ₹37,500
------------------------------------------------

Deductions               Amount
------------------------------------------------
Income Tax / TDS         ₹X
Provident Fund           ₹X

+ Add Deductions

Total Deductions         ₹X
------------------------------------------------

==================================================
SALARY CALCULATION
==================================================

The employee has an actual salary stored in the database.

Example:

Monthly Salary = ₹50,000

Basic Salary must automatically be:

50% of monthly salary

Basic = ₹25,000

HRA must automatically be:

50% of Basic Salary

HRA = ₹12,500

Therefore:

Basic = 50% of monthly salary
HRA = 50% of Basic

Example:

Monthly Salary = ₹50,000

Basic:
₹25,000

HRA:
₹12,500

Gross Earnings:
₹37,500

Do NOT allow these automatically calculated values to be accidentally overwritten.

However, structure the code so salary rules can be changed later.

==================================================
PAID DAYS / LOSS OF PAY CALCULATION
==================================================

Support monthly attendance-based salary calculation.

Example:

Monthly Salary = ₹50,000
Working Days = 26
Paid Days = 22

Calculate payable salary according to the company's working-day policy.

The system should support:

- Working Days
- Paid Days
- Loss of Pay Days

If Loss of Pay Days > 0:

Calculate salary deduction proportionally according to the configured working-day calculation.

Do NOT simply assume every month has 30 days.

Make the calculation service configurable.

Create a dedicated service:

salaryCalculation.service.ts

Keep all salary calculation logic there.

==================================================
TDS / INCOME TAX
==================================================

TDS should be automatically calculated according to salary.

Do NOT hard-code random TDS values.

Create a configurable tax calculation system.

For example:

tax_slabs

- id
- min_income
- max_income
- tax_rate
- financial_year
- regime
- active

The application should calculate TDS based on the configured tax slabs.

Allow the tax rules to be updated without changing the payslip UI.

For the initial version, create a configurable default TDS calculation.

Clearly separate:

Gross Salary
Taxable Salary
TDS
Other Deductions

==================================================
PROVIDENT FUND
==================================================

Include Provident Fund as a deduction.

Make PF calculation configurable.

For example:

PF percentage can be configured.

Do not hard-code the percentage throughout the application.

Use a salary configuration/service.

==================================================
DYNAMIC EARNINGS
==================================================

Admin/user should be able to click:

+ Add Earnings

Then show:

Earning Name:
[ __________ ]

Amount:
[ __________ ]

Example:

Conveyance Allowance
₹2,000

Bonus
₹5,000

Overtime
₹1,500

Each dynamically added earning should:

1. appear in the table
2. contribute to Gross Earnings
3. be stored in PostgreSQL

Gross Earnings:

Basic
+ HRA
+ Other Earnings
= Gross Earnings

==================================================
DYNAMIC DEDUCTIONS
==================================================

Admin/user should be able to click:

+ Add Deductions

Example:

Professional Tax
₹200

Loan Deduction
₹1,000

Advance
₹500

Each dynamically added deduction should:

1. appear in the table
2. contribute to Total Deductions
3. be stored in PostgreSQL

Total Deductions:

TDS
+ PF
+ Other Deductions
= Total Deductions

==================================================
NET PAYABLE
==================================================

At the bottom show:

Total Net Payable

Gross Earnings - Total Deductions

Example:

Gross Earnings:
₹50,000

Total Deductions:
₹7,000

Net Payable:
₹43,000

This must update automatically whenever:

- earning changes
- deduction changes
- salary changes
- paid days changes
- loss of pay changes
- TDS changes
- PF changes

==================================================
AMOUNT IN WORDS
==================================================

Automatically convert Net Payable into words.

Example:

₹43,000

Amount in words:

Forty Three Thousand Rupees Only

Use Indian currency format.

==================================================
PAYSLIP DESIGN
==================================================

Create a professional printable payslip.

Use the provided screenshots as UI/UX reference.

Do NOT copy the exact design pixel-for-pixel.

Create a clean modern payroll design.

Top section:

COMPANY LOGO

Company Name
Company Address
City, State, PIN
Email / Contact

Right side:

Payslip for the Month
August 2026

Then:

Employee Details

Employee Name
Employee ID
Pay Period
Paid Days
Loss of Pay Days
Pay Date

Then:

Income Details

------------------------------------------------
Earnings             Amount
------------------------------------------------
Basic                ₹25,000
HRA                  ₹12,500
Other Earnings       ₹X
------------------------------------------------
Gross Earnings       ₹X

------------------------------------------------
Deductions           Amount
------------------------------------------------
TDS                  ₹X
PF                   ₹X
Other Deduction      ₹X
------------------------------------------------
Total Deductions     ₹X

Then:

================================================
Total Net Payable                         ₹XX,XXX

Gross Earnings - Total Deductions

Amount in words:
Forty Three Thousand Rupees Only
================================================

At the bottom:

Generate Payslip
Reset

==================================================
COMPANY DETAILS
==================================================

Company information should come from configuration/database instead of being hard-coded throughout the UI.

Create:

company_settings

- id
- company_name
- logo_url
- address
- city
- state
- pincode
- email
- phone
- website
- created_at
- updated_at

The payslip header should automatically use these details.

The company logo should appear at the top.

==================================================
GENERATE PAYSLIP
==================================================

When clicking:

Generate Payslip

1. Validate all required information
2. Calculate earnings
3. Calculate deductions
4. Calculate net payable
5. Convert amount to words
6. Save payslip in PostgreSQL
7. Show generated payslip
8. Allow printing
9. Allow PDF generation/download

The generated payslip must preserve the exact values used at the time of generation.

If employee salary changes later, old payslips must NOT change.

==================================================
PAYSLIP HISTORY
==================================================

Create a Payslips page.

Show:

Month
Employee
Gross Earnings
Deductions
Net Payable
Generated Date
Actions

Actions:

View
Print
Generate PDF

Employees should only be able to access their own payslips.

Admins can access all payslips.

==================================================
SECURITY / AUTHORIZATION
==================================================

Implement role-based authorization.

Roles:

ADMIN
EMPLOYEE

Admin-only APIs:

POST /api/admin/employees
GET /api/admin/employees
PUT /api/admin/employees/:id
DELETE /api/admin/employees/:id

Employee APIs:

GET /api/profile
GET /api/payslips
GET /api/payslips/:id

Only ADMIN can create employees.

An employee must never be able to access another employee's profile or payslip by changing an ID in the URL.

Always determine the employee from the authenticated session.

==================================================
API STRUCTURE
==================================================

Use Next.js App Router.

Example:

app/
  api/
    auth/
      login/
        route.ts
      logout/
        route.ts

    admin/
      employees/
        route.ts
      employees/[id]/
        route.ts

    profile/
      route.ts

    payslips/
      route.ts
      [id]/
        route.ts

==================================================
PROJECT STRUCTURE
==================================================

Use a clean architecture:

src/

  app/

  components/

  lib/
    db.ts
    auth.ts
    session.ts

  services/
    auth.service.ts
    employee.service.ts
    salaryCalculation.service.ts
    payslip.service.ts
    tax.service.ts

  repositories/
    user.repository.ts
    employee.repository.ts
    payslip.repository.ts

  types/
    user.ts
    employee.ts
    payslip.ts
    salary.ts

  utils/
    generateUserId.ts
    amountToWords.ts
    salaryUtils.ts

  database/
    schema.sql
    seed.sql

Keep database logic separate from business logic.

==================================================
VALIDATION
==================================================

Validate all inputs.

Examples:

- Email must be valid
- Contact number must be valid
- Salary cannot be negative
- Paid days cannot be negative
- Loss of pay days cannot be negative
- Paid days cannot exceed working days
- Earnings cannot be negative
- Deductions cannot be negative

Show useful validation messages.

==================================================
UI/UX
==================================================

Use the supplied screenshots as visual inspiration.

Important characteristics:

- White background
- Clean professional payroll UI
- Rounded cards
- Subtle borders
- Blue accent for interactive elements
- Clear typography
- Two-column employee summary
- Earnings/Deductions side-by-side
- Large Net Payable section
- Red primary "Generate Payslip" button
- Reset button
- Responsive design

Do NOT copy every field from the screenshots.

Keep the interface focused on the actual requirements.

Desktop:
Two-column layout where appropriate.

Mobile:
Stack everything into one column.

==================================================
IMPORTANT BUSINESS RULE
==================================================

There must be ONE source of truth for salary calculations.

Do not calculate salary independently in multiple React components.

All calculations must happen through:

salaryCalculation.service.ts

Frontend should receive calculated values from the backend or use the same well-defined calculation logic.

Never trust frontend-calculated salary values when saving a payslip.

The backend must recalculate and validate everything before saving.

==================================================
ERROR HANDLING
==================================================

Implement proper error handling.

Examples:

Invalid login
Employee not found
Duplicate User ID
Invalid salary
Database connection error
Unauthorized request
Forbidden request
Payslip generation error

Return appropriate HTTP status codes.

==================================================
ENVIRONMENT VARIABLES
==================================================

Create:

.env.local

DATABASE_URL="postgresql://username:password@host:5432/database"

Never hard-code database credentials.

==================================================
INITIAL ADMIN
==================================================

Create a seed script for an initial admin.

Example:

User ID:
WEBWAVE-ADMIN

Password:
admin123

Role:
ADMIN

Clearly document that this must be changed before production.

==================================================
FINAL REQUIREMENT
==================================================

Build the application as a REAL full-stack application, not a frontend demo.

All important information must persist in PostgreSQL.

Do not use mock employee data.

Do not use localStorage as the database.

Do not hard-code employee information.

Do not hard-code payslip values.

Do not use fake API responses.

Implement:

- PostgreSQL schema
- Database connection using pg Pool
- Authentication
- Authorization
- Admin employee creation
- Automatic User ID generation
- Employee profile storage
- Salary storage
- Dynamic earnings
- Dynamic deductions
- Automatic Basic calculation
- Automatic HRA calculation
- TDS calculation
- PF calculation
- Paid days / LOP calculation
- Gross earnings
- Total deductions
- Net payable
- Amount in words
- Payslip persistence
- Payslip history
- Company logo/details
- Printable payslip
- PDF generation
- Responsive UI

Start by creating the database schema and project structure, then implement backend APIs/services, then authentication, then admin employee management, then payslip calculation, and finally the UI.