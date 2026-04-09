![Health Track Banner](docs/screenshots/health-track-banner.png)

## Overview ✨

**Health-Track** is a comprehensive modern healthcare management platform that integrates traditional healthcare workflows with cutting-edge AI/ML capabilities:

- **Streamlined Patient Care** – Efficient management of patient records, medical workflows, and health documents
- **AI-Powered Diagnostics** – Machine learning models for health prediction, diagnostic assistance, and report analysis
- **Clinical Workflows** – Optimized processes for hospitals, doctors, pharmacists, and healthcare staff
- **Smart Document Processing** – AI-powered summarization and analysis of medical documents and lab reports
- **Data Analytics** – Comprehensive insights, real-time statistics, and intelligent reporting for healthcare operations
- **Role-Based Access Control** – Secure multi-tier access for administrators, doctors, pharmacists, and patients
- **Microservices Architecture** – Scalable system with dedicated Express.js backend and Python FastAPI ML service
- **Modern Tech Stack** – Built with React.js, Node.js/Express, MongoDB, and Python FastAPI for optimal performance
- **Cloud Integration** – AWS S3 for secure document storage with pre-signed URLs and encryption
- **Responsive Design** – Seamless experience across all devices with Tailwind CSS


## Features 🚀

### Core Features

- **Secure Authentication**: JWT-based authentication with bcrypt password hashing and role-based access control (RBAC)
- **Role-Based Dashboards**: Dedicated, feature-rich dashboards for Admin, Doctor, Patient, and Pharmacist roles
- **Electronic Health Records (EHR)**: Comprehensive digital management of patient records, medical history, and health documents
- **AI/ML Integration**: Microservices architecture with Python FastAPI for health predictions, diagnostics, and document analysis
- **Cloud Storage**: AWS S3 integration for secure document storage with pre-signed URLs and encryption
- **Real-Time Analytics**: Live statistics, charts, and insights across all dashboards with real database data
- **Responsive Modern UI**: Built with React.js and Tailwind CSS for seamless mobile, tablet, and desktop experience
- **API Documentation**: Comprehensive REST API with clear endpoints for all operations
- **Microservices Architecture**: Separate Express.js backend and Python FastAPI ML service for scalability

### Admin Features

- **User Management**: Register and manage doctors, pharmacists, and patients with full CRUD operations
- **Organization Statistics**: Real-time dashboard with doctor count, pharmacist count, patient count, and activity metrics
- **Critical Disease Tracking**: AI-powered analysis of medical documents to track disease prevalence and trends
- **Weekly Activity Analytics**: Visual charts showing document uploads and patient registrations over time
- **Emergency Access**: Quick access to any patient's complete medical data using Patient ID or QR code for critical situations
- **API Token Management**: Generate and manage secure API tokens for external system integration
- **Interoperability Configuration**: Configure third-party integrations with token-based authentication
- **Profile Management**: Update personal information and secure password management
- **Pharmacy Inventory Oversight**: Monitor medicine stock levels and low-stock alerts
- **Audit Trail**: All emergency accesses are logged with timestamps for security and compliance

### Doctor Features

- **Patient Management**: Add and manage patients assigned to the doctor's care
- **Patient List**: View comprehensive list of all assigned patients with contact information
- **Patient Details**: Access detailed patient information, medical history, and health records
- **Document Access**: View and analyze patient medical documents and lab reports
- **Profile Management**: Update personal information, specialization, and secure password updates
- **Patient Assignment**: Accept new patients into care with proper authorization

### Pharmacist Features

- **Inventory Management**: Add, update, and remove medicines with detailed tracking (name, quantity, category, expiry date, price)
- **Medicine Dispensing**: Issue medicines to patients with automated stock deduction and validation
- **Transaction History**: Complete audit trail of all inventory operations (add, issue, remove, update) with timestamps
- **Report Generation**: Generate comprehensive PDF reports (inventory, transaction, summary) automatically stored in AWS S3
- **Report Management**: View, download, and delete generated reports with secure S3 pre-signed URLs
- **Inventory Statistics**: Real-time dashboard with total medicines, total value, low stock alerts, and out-of-stock warnings
- **Stock Alerts**: Automatic notifications for medicines below threshold or expired items
- **Profile Management**: Update personal information and secure password management
- **Search & Filter**: Quick search and filtering of medicines by name, category, or status

### Patient Features

- **Document Management**: Upload, view, and delete medical documents (lab reports, prescriptions, scans, consultation notes)
- **Secure File Storage**: Documents stored securely in AWS S3 with pre-signed URLs for time-limited access
- **Document Categorization**: Organize documents by type (lab-report, prescription, scan, consultation, other)
- **AI Document Summarization**: Get AI-powered summaries of medical documents for quick understanding
- **Access Control**: Only authorized users can access patient documents with role-based permissions
- **Health Records Access**: View and manage personal electronic health records (EHR)
- **File Download**: Secure document download with pre-signed URLs
- **Profile Management**: Update personal information and secure password management



## Screenshots 🖼️

### Homepage

![homepage-1](0_docs/screenshots/homepage-1.png)
![homepage-2](0_docs/screenshots/homepage-2.png)
![homepage-3](0_docs/screenshots/homepage-3.png)
![homepage-4](0_docs/screenshots/homepage-4.png)

### Authentication

![Sign In Page](0_docs/screenshots/sign-in.png)
![Sign Up Page](0_docs/screenshots/sign-up.png)

---

## Technologies Used 🛠️

### Frontend

| Technology       | Purpose                                                                                      |
| ---------------- | -------------------------------------------------------------------------------------------- |
| React.js 19      | Modern JavaScript library for building component-based user interfaces with hooks and state management |
| React Router 7   | Declarative routing for React applications, enabling single-page navigation and protected routes |
| Tailwind CSS 4   | Utility-first CSS framework for rapid UI development with responsive design patterns          |
| Axios            | Promise-based HTTP client for making API requests with interceptors and error handling       |
| Lucide React     | Open-source icon library providing 1000+ consistent SVG icons as React components           |
| Vite             | Next-generation frontend build tool with lightning-fast HMR and optimized production builds  |

### Backend

| Technology       | Purpose                                                                                      |
| ---------------- | -------------------------------------------------------------------------------------------- |
| Node.js          | JavaScript runtime built on Chrome's V8 engine for scalable server-side applications        |
| Express.js       | Minimal and flexible Node.js web framework for building REST APIs and web applications      |
| MongoDB          | NoSQL document database for flexible, schema-less data storage with high performance        |
| Mongoose         | Elegant MongoDB object modeling (ODM) with schema validation, middleware, and query building|
| JWT              | JSON Web Tokens for stateless authentication and secure information exchange                |
| bcryptjs         | Password hashing library using bcrypt algorithm for secure password storage                 |
| AWS SDK          | Amazon Web Services SDK for S3 file storage with pre-signed URLs and secure access          |
| Multer           | Node.js middleware for handling multipart/form-data for file uploads                        |
| PDFKit           | PDF document generation library for creating pharmacy reports and medical documents         |
| Twilio           | Cloud communications platform for sending SMS notifications and alerts                      |
| Crypto           | Node.js built-in module for cryptographic operations including API token generation         |

### ML/AI Microservice

| Technology       | Purpose                                                                                      |
| ---------------- | -------------------------------------------------------------------------------------------- |
| Python 3.x       | High-level programming language powering the machine learning and AI capabilities           |
| FastAPI          | Modern, fast web framework for building APIs with automatic OpenAPI documentation           |
| Uvicorn          | Lightning-fast ASGI server implementation for running FastAPI applications                  |
| Pydantic         | Data validation library using Python type annotations for request/response schemas          |
| NumPy            | Fundamental package for numerical computing and array operations in Python                  |
| Pandas           | Data manipulation and analysis library for structured data processing                       |
| Scikit-learn     | Machine learning library for classification, regression, and clustering algorithms          |
| OpenAI API       | Integration with GPT models for document summarization and natural language processing      |
| Python-dotenv    | Environment variable management for configuration and secrets                               |
| HTTPX            | Modern async HTTP client for making requests to external services                           |

### AI/ML Features

| Feature                    | Description                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------- |
| Health Prediction          | ML models predict health risks based on patient symptoms, vitals, and medical history |
| Diagnostic Assistance      | AI-powered diagnostic suggestions based on symptom analysis and pattern recognition   |
| Document Summarization     | GPT-powered summarization of medical documents, lab reports, and patient records      |
| Prescription Analysis      | Analyze prescriptions for drug interactions, dosage validation, and contraindications |
| Report Analysis            | Automated analysis of medical reports to identify abnormalities and critical findings |
| Health Recommendations     | Personalized health recommendations based on patient data and medical guidelines      |

---

## Technology Implementation & Usage 📚

### Frontend Technologies

#### React.js 19
React.js serves as the foundation of our user interface, implementing a component-based architecture that promotes code reusability and maintainability. In Health-Track, React powers all dashboard interfaces including the Admin Dashboard with real-time statistics charts, Doctor Dashboard for patient management, Pharmacist Dashboard with inventory controls, and Patient Dashboard for document management. We extensively utilize React hooks such as `useState` for managing component state (user data, inventory lists, document uploads), `useEffect` for API calls and data fetching, and `useContext` for global authentication state management. The virtual DOM ensures optimal performance even with large datasets like medicine inventories and patient lists. Custom components like `HealthPredictionExample.jsx` demonstrate reusability across different sections of the application.

#### React Router 7
React Router provides seamless single-page application (SPA) navigation throughout Health-Track. We implemented protected routes to ensure role-based access control - admins can only access admin routes (`/admin-dashboard`), doctors access doctor-specific routes (`/doctor-dashboard`), and so on. The router handles authentication redirects, automatically sending unauthenticated users to the sign-in page and preventing unauthorized access to sensitive dashboards. We use `useNavigate` for programmatic navigation after successful login/logout, and route parameters for dynamic pages like viewing specific patient details or document information. The routing structure maintains clean URLs and enables browser history management for better user experience.

#### Tailwind CSS 4
Tailwind CSS revolutionized our styling approach with utility-first classes, enabling rapid UI development without writing custom CSS. In Health-Track, we created a consistent design system with custom color schemes (blue for primary actions, green for success states, red for alerts), responsive grid layouts for dashboard statistics cards, and mobile-first responsive designs that adapt seamlessly from mobile (320px) to desktop (1920px+). Complex components like the pharmacy inventory table, medicine cards, and document upload interfaces were built entirely with Tailwind utilities. We customized the configuration in `tailwind.config.js` to include our brand colors and extended spacing for healthcare-specific UI patterns. The JIT (Just-In-Time) compiler ensures minimal CSS bundle size in production.

#### Axios
Axios serves as our HTTP client, handling all communication between the React frontend and Express.js backend. We configured Axios with base URL settings (`VITE_API_URL`), request interceptors that automatically attach JWT tokens to authenticated requests, and response interceptors for global error handling. In Health-Track, Axios powers critical operations: user authentication (sign-in/sign-up), fetching dashboard statistics, uploading medical documents to S3, managing pharmacy inventory (CRUD operations), generating and downloading reports, and communicating with the ML microservice for AI predictions. We created a centralized API service (`services/api.js`) with methods like `getCriticalDiseases()`, `getWeeklyActivity()`, and `generateApiToken()` that encapsulate all API calls with proper error handling and loading states.

#### Lucide React
Lucide React provides over 1000 consistent, customizable SVG icons used throughout Health-Track's interface. We implemented icons for navigation (Home, Users, FileText), actions (Upload, Download, Edit, Trash), status indicators (CheckCircle, AlertCircle, XCircle), and healthcare-specific symbols (Pill, Activity, FileHeart). Each dashboard uses icon-enhanced buttons and cards for better visual hierarchy - the pharmacy dashboard displays pill icons for medicines, the document management section uses file icons, and the admin panel shows user management icons. Icons are dynamically sized (`size={20}`) and colored to match Tailwind classes, maintaining consistent visual language. The lightweight SVG format ensures fast loading without compromising quality.

#### Vite
Vite serves as our build tool and development server, providing lightning-fast Hot Module Replacement (HMR) during development. Unlike traditional bundlers, Vite leverages native ES modules in the browser during development, resulting in instant server start regardless of application size. In Health-Track, Vite's dev server (`npm run dev`) enables real-time preview of changes without full page reloads, significantly accelerating development velocity. For production, Vite uses Rollup to create optimized bundles with code splitting, tree-shaking to remove unused code, and asset optimization. We configured Vite in `vite.config.js` to handle environment variables (`VITE_API_URL`), proxy API requests during development, and optimize build output for deployment on Vercel. Build times are under 30 seconds for the entire frontend application.

### Backend Technologies

#### Node.js
Node.js provides the JavaScript runtime environment for our backend server, leveraging Chrome's V8 engine for high-performance execution. Health-Track's backend runs entirely on Node.js, handling concurrent requests from multiple users (admins, doctors, pharmacists, patients) simultaneously through its event-driven, non-blocking I/O model. This architecture is ideal for healthcare applications with high I/O operations like database queries, file uploads to S3, and API calls to the ML microservice. Node.js's package ecosystem (npm) enabled rapid integration of libraries like Express, Mongoose, JWT, and AWS SDK. The single-threaded event loop efficiently manages thousands of concurrent connections, making it perfect for real-time healthcare dashboards that require frequent data updates. We use Node.js v18 LTS for production stability and security updates.

#### Express.js
Express.js is the web application framework that structures our RESTful API. We organized the backend into modular routes (`authRoutes.js`, `adminRoutes.js`, `doctorRoutes.js`, `pharmacistRoutes.js`, `patientRoutes.js`, `documentRoutes.js`, `aiRoutes.js`) that handle specific domain logic. Express middleware chains process requests sequentially - CORS middleware enables cross-origin requests from the React frontend, body-parser middleware parses JSON payloads, our custom `authMiddleware.js` validates JWT tokens and enforces role-based access control, and error-handling middleware catches and formats errors. We implemented over 50 API endpoints for operations like user registration, patient management, medicine inventory CRUD, document upload/download, report generation, and AI/ML predictions. Express's routing system with parameters (`:id`, `:documentId`) enables RESTful URL patterns like `/api/documents/:documentId`.

#### MongoDB
MongoDB serves as our primary NoSQL database, storing all application data in flexible JSON-like documents. Health-Track uses MongoDB for its schema flexibility - medical data often varies between patients, and MongoDB accommodates this naturally. We created 11 collections: Admin, Doctor, Patient, Pharmacist, Medicine, Document, Report, Schedule, Transaction, HealthReport, and User. MongoDB's document model aligns perfectly with JavaScript objects, eliminating impedance mismatch. We leverage MongoDB's powerful querying capabilities for complex operations like finding all patients assigned to a specific doctor, filtering medicines by expiry date, searching documents by category, and aggregating transaction statistics for pharmacy reports. MongoDB Atlas provides cloud hosting with automatic backups, while local MongoDB serves development needs. Indexing on email fields ensures fast lookups during authentication.

#### Mongoose
Mongoose is our Object Document Mapper (ODM) that adds structure and validation to MongoDB. We defined schemas for each collection with strict type definitions, required fields, default values, and custom validators. For example, the Patient schema requires `name`, `email`, and `password`, links to `doctor_id` via ObjectId reference, and includes automatic `createdAt`/`updatedAt` timestamps. Mongoose middleware (pre-save hooks) hash passwords with bcrypt before storing them. Schema methods like `Medicine.findById()` and `Document.populate('patient_id')` simplify database operations. Virtual properties enable computed fields without database storage. Mongoose validation prevents invalid data entry - email fields use regex validation, enum fields restrict values (e.g., document category: "lab-report", "prescription", "scan"), and custom validators ensure logical consistency like expiry dates being in the future.

#### JWT (JSON Web Tokens)
JWT implements our stateless authentication system across all user roles. When users sign in, the backend generates a JWT containing the user's ID, role (admin/doctor/pharmacist/patient), and expiry time, signed with a secret key from environment variables. This token is sent to the React frontend, stored in localStorage, and included in the Authorization header of subsequent requests. Our `authMiddleware.js` intercepts protected routes, verifies the JWT signature, extracts the user payload, and attaches it to `req.user`. This enables role-based access control - admin routes check `req.user.role === 'admin'`, preventing doctors or patients from accessing admin-only endpoints. JWTs eliminate the need for server-side session storage, enabling horizontal scaling. Token expiry (24 hours) balances security with user convenience. We also implemented a separate API token system using crypto for external system integration.

#### bcryptjs
bcryptjs provides cryptographic password hashing, ensuring user credentials are never stored in plain text. When users register or change passwords, bcrypt hashes the password with a salt factor of 10 rounds, producing a one-way hash that cannot be reversed. During sign-in, we hash the submitted password and compare it with the stored hash using `bcrypt.compare()`. This timing-safe comparison prevents timing attacks. Even if the database is compromised, attackers cannot retrieve original passwords. Bcrypt's adaptive function means we can increase the salt rounds in the future as computing power grows, maintaining security longevity. All four user types (Admin, Doctor, Pharmacist, Patient) use bcrypt hashing, ensuring consistent security across the platform. The Mongoose pre-save middleware automatically hashes passwords before database insertion.

#### AWS SDK (Amazon S3)
The AWS SDK integrates Amazon S3 for secure, scalable cloud storage of medical documents and pharmacy reports. Health-Track stores patient-uploaded documents (lab reports, prescriptions, medical scans) and pharmacist-generated PDF reports in S3 buckets. We configured S3 in `config/s3Config.js` with credentials from environment variables. When patients upload documents, Multer handles the multipart form data, and the AWS SDK uploads files to S3 with organized keys (`documents/${patientId}/${filename}`). For security, files are private by default - we generate pre-signed URLs with 1-hour expiration for viewing/downloading, ensuring only authorized users can access documents. S3's durability (99.999999999%) ensures medical records are never lost. Metadata like file size, type, and upload date are stored in MongoDB while actual files live in S3, separating concerns and enabling efficient database queries.

#### Multer
Multer is Node.js middleware that handles multipart/form-data, essential for file uploads in Health-Track. We configured Multer with memory storage (`multer.memoryStorage()`) for document uploads, keeping files in memory buffer before uploading to S3, avoiding local disk I/O. Multer parses the incoming file stream, extracts metadata (filename, mimetype, size), and makes it available in `req.file`. We implemented file type validation (only allowing PDFs, images) and size limits (max 10MB) to prevent abuse. In the document upload route (`/api/documents/upload`), Multer processes the file, we validate the patient is authorized, upload to S3 via AWS SDK, save metadata to MongoDB's Document collection, and return a success response. This pipeline ensures secure, validated file handling for sensitive medical documents.

#### PDFKit
PDFKit generates professional PDF reports for the pharmacy system. Pharmacists can generate three report types: inventory reports (current stock levels, expiry dates), transaction reports (all additions, issuances, removals), and summary reports (statistics and trends). We created custom PDF layouts with headers (pharmacy name, logo), tables (using precise coordinate positioning), formatted text with multiple fonts, and footers with generation timestamp. PDFKit's streaming API writes directly to S3 via AWS SDK without intermediate local files. Report generation includes data aggregation from the Transaction and Medicine collections, formatting numbers (currency, quantities), date formatting, and visual elements like borders and section dividers. Generated reports are stored in S3 with metadata in the Report collection, enabling future retrieval and deletion.

#### Twilio
Twilio integrates SMS notification capabilities for time-sensitive healthcare alerts. While configured in the environment variables, Twilio can send notifications for critical events like appointment reminders, medicine low-stock alerts for pharmacists, prescription ready notifications for patients, and emergency health alerts. The Twilio SDK connects using Account SID and Auth Token, sending SMS via REST API. We store phone numbers in user profiles (Admin, Pharmacist models have phone fields). Future enhancements include scheduled appointment reminders using Twilio's programmable messaging and two-factor authentication for enhanced security during sign-in. The asynchronous SMS sending doesn't block other operations, maintaining application responsiveness.

#### Crypto (Node.js Built-in)
Node.js's crypto module generates secure API tokens for external system integration. In the admin dashboard's interoperability section, admins can generate API tokens for third-party healthcare systems to access Health-Track APIs. We use `crypto.randomBytes(32).toString('hex')` to generate 64-character hexadecimal tokens with cryptographic randomness, ensuring unpredictability and collision resistance. These tokens are stored in the Admin model with expiry dates (365 days) and can be revoked anytime. The `/admin/validate-token/:apiToken` public endpoint allows external systems to verify token validity before making API requests. This token system enables secure interoperability with electronic health record (EHR) systems, lab systems, and other healthcare platforms while maintaining audit trails and access control.

### ML/AI Microservice Technologies

#### Python 3.x
Python powers our machine learning microservice due to its dominance in data science and AI. Health-Track's ML service uses Python 3.8+ with its rich ecosystem of scientific computing libraries. Python's readability enabled rapid development of complex ML algorithms for health prediction, diagnostic assistance, and report analysis. The interpreted nature allows easy debugging and testing of ML models. Python's extensive library support (scikit-learn, pandas, numpy) eliminates the need to implement ML algorithms from scratch. We use Python's async/await syntax with FastAPI for concurrent request handling. Type hints (Python 3.5+) improve code quality and work seamlessly with Pydantic for data validation. Virtual environments isolate dependencies, ensuring consistent behavior across development and production. Python's GIL (Global Interpreter Lock) isn't a bottleneck since our ML operations are CPU-bound and handled by optimized C extensions (NumPy, scikit-learn).

#### FastAPI
FastAPI is the modern Python web framework chosen for its performance and developer experience. Built on Starlette and Pydantic, FastAPI provides automatic request validation, serialization, and OpenAPI documentation generation. In Health-Track, FastAPI routes handle ML predictions: `/health-prediction` analyzes patient vitals, `/diagnostic` suggests diagnoses from symptoms, `/document-summarization` uses GPT for medical document analysis, `/prescription-analysis` checks drug interactions, and `/report-analysis` identifies abnormalities. FastAPI's dependency injection system manages database connections and configuration. Type hints in route functions automatically generate OpenAPI schemas visible at `/docs`, providing interactive API documentation for testing ML endpoints. FastAPI's async capabilities handle concurrent prediction requests efficiently, essential for healthcare applications requiring real-time AI insights. Input validation via Pydantic prevents malformed requests from reaching ML models.

#### Uvicorn
Uvicorn is the ASGI (Asynchronous Server Gateway Interface) server running the FastAPI application. Unlike WSGI servers (Gunicorn, uWSGI) that handle synchronous Python code, Uvicorn leverages Python's async/await for concurrent request handling. In Health-Track, Uvicorn runs on port 8000 (`uvicorn main:app --reload`), receiving HTTP requests from the Express.js backend, routing them to FastAPI endpoints, and returning ML predictions. The `--reload` flag enables hot reloading during development - code changes automatically restart the server without manual intervention. Uvicorn's performance (benchmarked at 60,000+ requests/second) ensures ML predictions return quickly even under load. In production, Uvicorn runs with multiple worker processes, utilizing all CPU cores for parallel ML inference. The server logs all requests, aiding debugging and monitoring of ML service health.

#### Pydantic
Pydantic provides data validation using Python type annotations, crucial for ML model inputs. We defined Pydantic schemas in `app/api/schemas.py` for each endpoint: `HealthPredictionRequest` validates patient data (age: int, symptoms: List[str], vitals: dict), `DiagnosticRequest` validates symptom inputs, and `DocumentSummarizationRequest` validates document text. Pydantic automatically converts request JSON to Python objects, validates data types, checks required fields, and returns detailed error messages for invalid data. This prevents malformed data from reaching ML models, which could cause crashes or incorrect predictions. Pydantic's `BaseModel` enables response serialization - ML predictions are converted to JSON automatically. Settings management via `pydantic-settings` loads environment variables with type validation, ensuring configuration errors are caught at startup rather than runtime.

#### NumPy
NumPy (Numerical Python) handles array operations and mathematical computations in our ML service. Health prediction models use NumPy arrays to represent patient feature vectors (age, blood pressure, heart rate, BMI) for efficient numerical processing. NumPy's vectorized operations (element-wise addition, matrix multiplication) execute in compiled C code, orders of magnitude faster than Python loops. We use NumPy for data preprocessing: normalizing vital signs to 0-1 range (`(x - min) / (max - min)`), calculating statistical measures (mean, standard deviation) for abnormality detection in medical reports, and reshaping data for ML model input. NumPy's n-dimensional arrays store batch predictions, enabling processing multiple patients simultaneously. Integration with scikit-learn is seamless as all ML libraries use NumPy array format, avoiding data structure conversions.

#### Pandas
Pandas provides data manipulation and analysis for structured healthcare data. When analyzing pharmacy transactions or patient records, Pandas DataFrames organize data in tabular format with labeled rows and columns. We use Pandas to aggregate transaction data for pharmacy reports: grouping by medicine name to calculate total quantities, filtering by date ranges for weekly/monthly summaries, and joining medicine inventory with transaction history for comprehensive reports. Pandas' time series capabilities handle temporal medical data like patient vitals over time or medicine usage trends. The `read_json()` function parses incoming request data, and `to_dict()` serializes analysis results for API responses. Pandas' data cleaning functions handle missing values in patient records (imputation, dropping nulls), ensuring ML models receive complete feature sets. Memory-efficient operations handle large datasets without performance degradation.

#### Scikit-learn
Scikit-learn is our primary machine learning library, providing implementations of classification, regression, and clustering algorithms. Health-Track's health prediction feature uses trained scikit-learn models (Random Forest, Logistic Regression) to predict disease risk based on patient symptoms and vitals. We implement diagnostic assistance using classification algorithms that map symptom combinations to probable diagnoses. The prescription analysis feature uses decision trees to identify potentially harmful drug combinations. Scikit-learn's preprocessing module standardizes input features (`StandardScaler`), ensuring consistent model performance. We use `joblib` to save trained models in the `models/` directory and load them at service startup, enabling instant predictions without retraining. Model evaluation metrics (accuracy, precision, recall, F1-score) guide model selection. Scikit-learn's consistent API (`.fit()`, `.predict()`) enables easy swapping of algorithms for experimentation.

#### OpenAI API
The OpenAI API integrates GPT language models for natural language processing tasks. Health-Track's document summarization feature sends medical documents (lab reports, consultation notes) to GPT-3.5-turbo or GPT-4, receiving concise summaries highlighting critical findings, abnormal values, and recommended actions. We crafted system prompts that instruct the model to focus on medical context: "You are a medical AI assistant. Summarize this lab report, highlighting abnormal values and clinical significance." The API key is stored securely in environment variables. We implement rate limiting and error handling for API failures. Token counting prevents exceeding context windows (4K tokens for GPT-3.5-turbo). The chat completion API maintains conversation context for follow-up questions about health recommendations. OpenAI's embeddings API could enable semantic search across medical documents. Cost monitoring tracks API usage per request for budget management.

#### Python-dotenv
Python-dotenv manages environment variables in the ML microservice, separating configuration from code. The `.env` file stores sensitive data: OpenAI API key, backend service URL, allowed CORS origins, port configuration, and model paths. At application startup, `load_dotenv()` reads the `.env` file and populates `os.environ`. We access variables via Pydantic Settings: `settings.OPENAI_API_KEY`, ensuring type safety and validation. This approach enables different configurations for development (local URLs, debug mode) and production (deployed URLs, optimizations) without code changes. Environment variables are never committed to Git (listed in `.gitignore`), protecting secrets. The `.env.example` file documents required variables for new developers. Docker deployments pass environment variables as container arguments, overriding `.env` for containerized production deployments.

#### HTTPX
HTTPX is a modern HTTP client for Python, providing both synchronous and asynchronous request capabilities. The ML microservice uses HTTPX to communicate with the Express.js backend for data validation and retrieval. When processing health predictions, the ML service queries the backend via HTTPX to fetch patient medical history, verify authorization tokens, and log predictions. HTTPX's async client (`httpx.AsyncClient()`) enables non-blocking I/O - while waiting for backend responses, the service handles other prediction requests, maximizing throughput. We configured connection pooling to reuse TCP connections, reducing latency. Timeout settings (30 seconds) prevent hanging requests. HTTPX supports HTTP/2 for improved performance over multiple requests. Error handling catches connection errors, timeouts, and HTTP error status codes, providing graceful degradation when the backend is unavailable. The API mirrors `requests` library syntax, easing migration.

### Database & Storage

#### MongoDB & Mongoose Integration
The synergy between MongoDB and Mongoose creates a robust data layer for Health-Track. MongoDB's flexible schema accommodates evolving healthcare data requirements - adding new patient fields or document types doesn't require migrations. Mongoose schemas provide structure where needed: email validation, required fields, relationships via ObjectId references. We leverage MongoDB's aggregation pipeline for complex queries: calculating weekly activity statistics (grouping documents by date), generating pharmacy inventory summaries (sum of quantities, average prices), and analyzing disease prevalence from AI-summarized documents. Mongoose query builders (`Patient.find().populate('doctor_id').sort('-createdAt')`) retrieve patients with doctor details in a single query. Indexes on `email` (unique) and `createdAt` (for time-based queries) optimize performance. MongoDB's horizontal scaling via sharding supports future growth as the healthcare platform expands.

#### AWS S3 & Document Management
AWS S3 provides enterprise-grade cloud storage for Health-Track's documents. Medical documents and pharmacy reports are uploaded to S3 buckets with organized folder structures: `documents/patient_${id}/`, `reports/pharmacist_${id}/`. S3's versioning enables document history tracking - if a patient uploads a new lab report, previous versions remain accessible. Server-side encryption (SSE-S3) encrypts all files at rest, meeting healthcare data security requirements. Pre-signed URLs (`getSignedUrl()`) with 1-hour expiration enable secure, temporary access - patients can view/download their documents without making S3 buckets public. S3's lifecycle policies automatically delete old reports after retention periods, managing storage costs. Cross-region replication ensures disaster recovery. S3 event notifications could trigger Lambda functions for automatic document processing (OCR, metadata extraction). CloudFront CDN could cache frequently accessed documents for faster global access.

---

## Project Architecture 🏗️

```
Health-Track/
├── backend/                     # Express.js REST API server
│   ├── config/
│   │   └── s3Config.js          # AWS S3 configuration for file storage
│   ├── middleware/
│   │   └── authMiddleware.js    # JWT authentication middleware
│   ├── models/                  # MongoDB Mongoose schemas
│   │   ├── Admin.js             # Admin user with API token management
│   │   ├── Doctor.js            # Doctor profiles and specializations
│   │   ├── Patient.js           # Patient records and assignments
│   │   ├── Pharmacist.js        # Pharmacist profiles and inventory access
│   │   ├── Medicine.js          # Medicine inventory with stock tracking
│   │   ├── Document.js          # Medical documents with S3 storage
│   │   ├── Report.js            # Generated PDF reports
│   │   ├── Schedule.js          # Appointment scheduling
│   │   ├── Transaction.js       # Pharmacy inventory transactions
│   │   └── User.js              # Base user authentication
│   ├── routes/                  # API route handlers
│   │   ├── authRoutes.js        # Authentication (sign-up, sign-in)
│   │   ├── adminRoutes.js       # Admin operations and statistics
│   │   ├── doctorRoutes.js      # Doctor patient management
│   │   ├── pharmacistRoutes.js  # Pharmacy inventory and reports
│   │   ├── documentRoutes.js    # Document upload/download with S3
│   │   ├── patientRoutes.js     # Patient health records
│   │   └── aiRoutes.js          # AI/ML microservice integration
│   ├── db.js                    # MongoDB connection with Mongoose
│   ├── server.js                # Express server entry point
│   ├── package.json
│   └── vercel.json              # Vercel deployment config
├── frontend/                    # React.js SPA with Vite
│   ├── src/
│   │   ├── pages/               # React page components
│   │   │   ├── Homepage.jsx     # Landing page with features
│   │   │   ├── SignIn.jsx       # Multi-role authentication
│   │   │   ├── SignUp.jsx       # Admin registration
│   │   │   ├── AdminDashboard.jsx    # Admin panel with statistics
│   │   │   ├── DoctorDashboard.jsx   # Doctor patient management
│   │   │   ├── PatientDashboard.jsx  # Patient health records
│   │   │   ├── PharmacistDashboard.jsx # Pharmacy inventory system
│   │   │   └── NotFound.jsx     # 404 error page
│   │   ├── services/            # API service layer
│   │   │   ├── api.js           # Axios API client with interceptors
│   │   │   ├── authService.js   # Authentication service
│   │   │   └── aiService.js     # AI/ML service integration
│   │   ├── components/          # Reusable React components
│   │   │   └── HealthPredictionExample.jsx
│   │   ├── App.jsx              # Main app with routing and auth
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Tailwind CSS global styles
│   ├── public/
│   ├── package.json
│   └── vite.config.js           # Vite build configuration
├── ml-microservice/             # Python FastAPI ML service
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── endpoints/   # AI/ML endpoint handlers
│   │   │   │   │   ├── diagnostic.py           # Diagnostic assistance
│   │   │   │   │   ├── document_summarization.py # Document AI summarization
│   │   │   │   │   ├── health_prediction.py    # Health risk prediction
│   │   │   │   │   ├── prescription.py         # Prescription analysis
│   │   │   │   │   ├── recommendations.py      # Health recommendations
│   │   │   │   │   └── report_analysis.py      # Medical report analysis
│   │   │   │   └── router.py    # API v1 router
│   │   │   └── schemas.py       # Pydantic request/response models
│   │   ├── core/
│   │   │   ├── config.py        # FastAPI configuration
│   │   │   └── logger.py        # Structured logging setup
│   │   └── services/
│   │       └── ml_service.py    # ML model inference logic
│   ├── main.py                  # FastAPI application entry point
│   ├── requirements.txt         # Python dependencies
│   └── README.md                # ML service documentation
└── docs/
    ├── screenshots/             # Application screenshots
    └── roadmap.txt              # Development roadmap
```


## Data Structures 📊

### MongoDB Models

#### Admin Schema

```javascript
{
  fullname: String (required),
  email: String (unique, required),
  password: String (required, hashed),
  role: String (default: "admin"),
  gender: String (enum: ["male", "female", "other", ""]),
  phone: String,
  timestamps: true
}
```

#### Doctor Schema

```javascript
{
  name: String (required),
  email: String (unique, required),
  password: String (required, hashed),
  specialization: String,
  admin_id: ObjectId (ref: "Admin", required),
  role: String (default: "doctor"),
  timestamps: true
}
```

#### Patient Schema

```javascript
{
  name: String (required),
  email: String (unique, required),
  password: String (required, hashed),
  doctor_id: ObjectId (ref: "Doctor", required),
  admin_id: ObjectId (ref: "Admin"),
  role: String (default: "patient"),
  timestamps: true
}
```

#### Pharmacist Schema

```javascript
{
  name: String (required),
  email: String (unique, required),
  password: String (required, hashed),
  gender: String (enum: ["male", "female", "other", ""]),
  phone: String,
  inventory: [String],
  admin_id: ObjectId (ref: "Admin", required),
  role: String (default: "pharmacist"),
  timestamps: true
}
```

#### Medicine Schema

```javascript
{
  name: String (required),
  description: String,
  quantity: Number (default: 0),
  category: String,
  expiryDate: Date,
  price: Number,
  patient_id: ObjectId (ref: "Patient"),
  doctor_id: ObjectId (ref: "Doctor"),
  pharmacist_id: ObjectId (ref: "Pharmacist"),
  timestamps: true
}
```

#### Document Schema

```javascript
{
  title: String (required),
  description: String,
  fileUrl: String,
  patient_id: ObjectId (ref: "Patient"),
  doctor_id: ObjectId (ref: "Doctor"),
  uploadedBy: ObjectId (ref: "Doctor"),
  fileName: String,
  originalName: String,
  fileType: String,
  fileSize: Number,
  s3Key: String,
  s3Url: String,
  category: String (enum: ["lab-report", "prescription", "scan", "consultation", "other"]),
  status: String (enum: ["pending", "verified", "under-review"]),
  timestamps: true
}
```

#### Transaction Schema

```javascript
{
  type: String (required, enum: ["add", "issue", "remove", "update"]),
  medicineName: String (required),
  medicineId: ObjectId (ref: "Medicine"),
  quantity: Number (required),
  price: Number,
  totalAmount: Number,
  patientName: String,
  notes: String,
  pharmacist_id: ObjectId (ref: "Pharmacist", required),
  previousQuantity: Number,
  newQuantity: Number,
  timestamps: true
}
```

#### Report Schema

```javascript
{
  title: String (required),
  description: String,
  reportType: String (enum: ["inventory", "transaction", "summary", "custom"]),
  pharmacist_id: ObjectId (ref: "Pharmacist", required),
  fileName: String,
  originalName: String,
  fileType: String (default: "application/pdf"),
  fileSize: Number,
  s3Key: String,
  s3Url: String,
  dateFrom: Date,
  dateTo: Date,
  generatedAt: Date,
  status: String (enum: ["generating", "completed", "failed"]),
  timestamps: true
}
```

#### Schedule Schema

```javascript
{
  doctor_id: ObjectId (ref: "Doctor"),
  patient_id: ObjectId (ref: "Patient"),
  appointmentDate: Date (required),
  notes: String,
  timestamps: true
}
```



## API Documentation 📡

### Base URL

- **Local Development**: `http://localhost:5000`
- **Production**: Your deployed API URL

### Health Check Endpoints

| Method | Endpoint       | Description                |
| ------ | -------------- | -------------------------- |
| GET    | `/`            | API status and version     |
| GET    | `/api/health`  | Health check with uptime   |

### Authentication Routes (`/auth`)

| Method | Endpoint    | Description                              | Request Body                                       |
| ------ | ----------- | ---------------------------------------- | -------------------------------------------------- |
| POST   | `/sign-up`  | Register new admin (role must be "admin")| `{ fullname, email, password, role: "admin" }`     |
| POST   | `/sign-in`  | Sign in for all roles                    | `{ email, password, role }`                        |

> **Note**: The `/sign-up` endpoint only allows admin registration. The `role` field must be set to `"admin"`. Other user types (doctors, pharmacists, patients) are created by admins through the admin routes.

**Response**: Returns JWT token and user object

### Admin Routes (`/admin`)

| Method | Endpoint               | Description                      | Auth Required |
| ------ | ---------------------- | -------------------------------- | ------------- |
| POST   | `/add-user`            | Add doctor or pharmacist         | Yes (Admin)   |
| GET    | `/users`               | Get all staff (doctors/pharmacists) | Yes (Admin)   |
| DELETE | `/remove-user/:id`     | Remove doctor or pharmacist      | Yes (Admin)   |
| GET    | `/patients`            | Get all patients                 | Yes (Admin)   |
| POST   | `/add-patient`         | Add a new patient                | Yes (Admin)   |
| DELETE | `/remove-patient/:id`  | Remove a patient                 | Yes (Admin)   |
| GET    | `/profile`             | Get admin profile                | Yes (Admin)   |
| PUT    | `/profile`             | Update admin profile             | Yes (Admin)   |
| PUT    | `/change-password`     | Change admin password            | Yes (Admin)   |

### Doctor Routes (`/doctor`)

| Method | Endpoint               | Description                      | Auth Required |
| ------ | ---------------------- | -------------------------------- | ------------- |
| GET    | `/my-patients`         | Get patients assigned to doctor  | Yes (Doctor)  |
| POST   | `/add-patient`         | Add a new patient                | Yes (Doctor)  |
| DELETE | `/remove-patient/:id`  | Remove a patient                 | Yes (Doctor)  |

### Pharmacist Routes (`/pharmacist`)

| Method | Endpoint                      | Description                        | Auth Required    |
| ------ | ----------------------------- | ---------------------------------- | ---------------- |
| POST   | `/add-medicine`               | Add medicine to inventory          | Yes (Pharmacist) |
| GET    | `/medicines`                  | Get all medicines                  | Yes (Pharmacist) |
| PUT    | `/update-medicine/:id`        | Update medicine details            | Yes (Pharmacist) |
| POST   | `/issue-medicine`             | Issue medicine to patient          | Yes (Pharmacist) |
| DELETE | `/remove-medicine/:id`        | Remove medicine from inventory     | Yes (Pharmacist) |
| GET    | `/inventory-stats`            | Get inventory statistics           | Yes (Pharmacist) |
| GET    | `/transactions`               | Get all transactions               | Yes (Pharmacist) |
| GET    | `/profile`                    | Get pharmacist profile             | Yes (Pharmacist) |
| PUT    | `/profile`                    | Update pharmacist profile          | Yes (Pharmacist) |
| PUT    | `/update-password`            | Change pharmacist password         | Yes (Pharmacist) |
| GET    | `/reports`                    | Get all generated reports          | Yes (Pharmacist) |
| POST   | `/generate-report`            | Generate a new PDF report          | Yes (Pharmacist) |
| GET    | `/report-download/:reportId`  | Get report download URL            | Yes (Pharmacist) |
| DELETE | `/report/:reportId`           | Delete a report                    | Yes (Pharmacist) |

### Document Routes (`/api/documents`)

| Method | Endpoint               | Description                           | Auth Required  |
| ------ | ---------------------- | ------------------------------------- | -------------- |
| POST   | `/upload`              | Upload a medical document             | Yes (Patient)  |
| POST   | `/list`                | Get all documents for patient         | Yes (Patient)  |
| POST   | `/view/:documentId`    | Get pre-signed URL to view document   | Yes (Patient)  |
| POST   | `/download/:documentId`| Get pre-signed URL to download        | Yes (Patient)  |
| DELETE | `/:documentId`         | Delete a document                     | Yes (Patient)  |

### AI/ML Routes (`/ai`)

| Method | Endpoint                   | Description                                | Auth Required  |
| ------ | -------------------------- | ------------------------------------------ | -------------- |
| POST   | `/health-prediction`       | Predict health risks from patient data     | Yes            |
| POST   | `/diagnostic`              | Get diagnostic suggestions from symptoms   | Yes            |
| POST   | `/document-summarization`  | AI-powered document summarization          | Yes            |
| POST   | `/prescription-analysis`   | Analyze prescriptions for interactions     | Yes            |
| POST   | `/report-analysis`         | Analyze medical reports for abnormalities  | Yes            |
| POST   | `/recommendations`         | Generate personalized health recommendations| Yes           |

### Admin API Token Routes (`/admin`)

| Method | Endpoint                      | Description                                    | Auth Required |
| ------ | ----------------------------- | ---------------------------------------------- | ------------- |
| POST   | `/generate-api-token`         | Generate new API token for admin               | Yes (Admin)   |
| GET    | `/api-token`                  | Get current API token info                     | Yes (Admin)   |
| DELETE | `/api-token`                  | Revoke current API token                       | Yes (Admin)   |
| GET    | `/validate-token/:apiToken`   | Validate API token (public)                    | No            |
| GET    | `/critical-diseases`          | Get disease statistics from AI                 | Yes (Admin)   |
| GET    | `/weekly-activity`            | Get 7-day activity analytics                   | Yes (Admin)   |
| GET    | `/emergency/patient/:patientId` | Get complete patient data for emergency access | Yes (Admin)   |

### Database Interaction

The application uses **Mongoose** as the ODM (Object Document Mapper) for MongoDB. Key database interactions include:

1. **Connection Management**: Singleton pattern with connection pooling (`db.js`)
2. **CRUD Operations**: Full create, read, update, delete operations for all entities
3. **References**: Documents use ObjectId references for relationships (e.g., `doctor_id` in Patient)
4. **Timestamps**: All models include automatic `createdAt` and `updatedAt` fields
5. **Indexing**: Unique indexes on email fields for fast lookups


## Getting Started 🚀

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn** package manager
- **Python** (v3.8 or higher) for ML microservice
- **pip** Python package installer
- **MongoDB** (local installation or MongoDB Atlas cloud database)
- **AWS Account** (optional, for S3 file storage)
- **OpenAI API Key** (optional, for AI document summarization)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/abhinavkumar2369/Health-Track.git
   cd Health-Track
   ```

2. **Backend Setup**

   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup**

   ```bash
   cd ../frontend
   npm install
   ```

4. **ML Microservice Setup**

   ```bash
   cd ../ml-microservice
   pip install -r requirements.txt
   # or using a virtual environment (recommended):
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

### Running the Application

1. **Start the Backend Server**

   ```bash
   cd backend
   npm start
   # or for development with hot reload:
   npm run dev
   ```

   The backend server will start at `http://localhost:5000`

2. **Start the ML Microservice**

   ```bash
   cd ml-microservice
   python main.py
   # or using uvicorn directly:
   uvicorn main:app --reload --port 8000
   ```

   The ML service will start at `http://localhost:8000`
   API documentation available at `http://localhost:8000/docs`

3. **Start the Frontend Development Server**

   ```bash
   cd frontend
   npm run dev
   ```

   The frontend will start at `http://localhost:5173` (default Vite port)

4. **Build Frontend for Production**

   ```bash
   cd frontend
   npm run build
   ```



## Environment Variables 🔐

### Backend (`backend/.env`)

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/health-track
# Or use MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/health-track

# JWT Secret (Change this in production!)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# ML Microservice Configuration
ML_SERVICE_URL=http://localhost:8000

# AWS S3 Configuration (Optional - for file storage)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_BUCKET_NAME=your_bucket_name

# Twilio Configuration (Optional - for SMS)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone
```

### Frontend (`frontend/.env`)

Create a `.env` file in the `frontend` directory:

```env
# Backend API URL
VITE_API_URL=http://localhost:5000

# ML Service URL (if directly accessed from frontend)
VITE_ML_SERVICE_URL=http://localhost:8000
```

### ML Microservice (`ml-microservice/.env`)

Create a `.env` file in the `ml-microservice` directory:

```env
# Server Configuration
PORT=8000
HOST=0.0.0.0
LOG_LEVEL=INFO

# Backend Service URL
BACKEND_SERVICE_URL=http://localhost:5000

# OpenAI API Configuration (for document summarization)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5000

# ML Model Configuration
MODEL_PATH=./models
ENABLE_GPU=false
```



## Usage 🏥

### Getting Started as an Admin

1. Visit the homepage at `http://localhost:5173`
2. Click **Sign Up** to create a new admin account
3. Fill in your details and register
4. You'll be redirected to the Admin Dashboard

### Admin Dashboard

- Add and manage doctors, pharmacists, and patients
- View organization statistics
- Update your profile and change password

### Doctor Dashboard

- Sign in with your doctor credentials
- View and manage your assigned patients
- Add new patients to your care

### Pharmacist Dashboard

- Sign in with your pharmacist credentials
- Manage medicine inventory (add, update, remove)
- Issue medicines to patients
- View transaction history
- Generate and download reports

### Patient Dashboard

- Sign in with your patient credentials
- Upload and manage medical documents
- View your health records


## License 📄

This project is licensed under the Apache License, Version 2.0. See the [LICENSE](./LICENSE) file for details.



## Credits

- [Abhinav Kumar](https://github.com/abhinavkumar2369)
- [vemkaze](https://github.com/vemkaze)
