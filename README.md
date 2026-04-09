![Health Track Banner](0_docs/screenshots/health-track-banner.png)

# Health-Track
## Comprehensive Project Report (Extended Edition)

This document is written in project-report style, not just repository style. If you attach the suggested diagrams, charts, screenshots, logs, and appendix evidence, this can be converted into an 80-page academic or final-year project report without changing the core storyline.

---

## 1. Document Metadata

- Project Title: Health-Track - Intelligent Healthcare Management and AI-Assisted Clinical Workflow Platform
- Project Type: Full-stack software system with AI microservice integration
- Domain: Digital Health, Health Informatics, Clinical Operations
- Repository Structure:
  - frontend: React + Vite client
  - backend: Node.js + Express REST API
  - ml-microservice: FastAPI + ML/NLP services
- Core Database: MongoDB
- Storage Layer: AWS S3 for medical documents and generated reports
- Authentication Model: JWT-based role-bound access control
- Current Version: 1.0
- Last Updated: April 2026

---

## 2. How To Use This As An 80-Page Report

This file already gives you chapter content. To make it equivalent to a full 80-page submission:

- Keep this structure chapter-wise.
- Add all diagram placeholders listed later.
- Add at least 20 to 30 screenshots from actual modules.
- Include testing logs and API evidence in appendices.
- Add institution-mandated front pages.
- Use 12-point font, 1.5 line spacing, and justified text in your final document editor.

### Suggested Page Distribution

| Chapter | Suggested Pages | Notes |
| --- | ---: | --- |
| Front matter (title, certificate, declaration, acknowledgment, abstract, TOC) | 8-10 | University format dependent |
| Chapter 1: Introduction | 5-6 | Problem context + motivation |
| Chapter 2: Problem Statement and Objectives | 4-5 | Objective mapping table required |
| Chapter 3: Existing System and Gap Analysis | 5-6 | Add comparison chart |
| Chapter 4: Requirements and Feasibility | 6-7 | Functional + non-functional |
| Chapter 5: Architecture and Design | 9-10 | Add use case, architecture, DFD, ER diagrams |
| Chapter 6: Implementation Details | 10-12 | Frontend, backend, ML workflow |
| Chapter 7: Testing and Validation | 8-10 | Test cases + bug log + screenshots |
| Chapter 8: Deployment and Operations | 4-5 | Hosting, env vars, backups |
| Chapter 9: Results, Discussion, Limitations, Future Scope | 8-9 | Metrics + interpretation |
| References and Appendices | 8-10 | API samples, logs, screenshots |
| Total | 75-90 | Target 80 by tuning screenshot density |

---

## 3. Front Matter Draft (Ready To Copy Into Final Report)

### 3.1 Title Page Template

- Report Title: Health-Track
- Subtitle: AI-Assisted Healthcare Management and Clinical Workflow Platform
- Submitted by: [Your Name]
- Enrollment No: [Your ID]
- Department: [Department Name]
- Institution: [Institution Name]
- Session: [Academic Year]
- Guided by: [Guide Name]

### 3.2 Certificate Page (Template)

Use this structure:

- This is to certify that [Student Name] has completed the project titled Health-Track under my guidance.
- The work is original and satisfies the academic requirements of [Degree Name].
- Guide Signature, HoD Signature, Date, Seal.

### 3.3 Declaration Page (Template)

Include:

- Statement of originality.
- Confirmation that work is not copied from another thesis.
- Citation adherence statement.

### 3.4 Acknowledgment Draft

Mention:

- Project guide.
- Department faculty.
- Teammates (if any).
- Family/support system.

### 3.5 Abstract (Extended)

Health-Track is a role-oriented healthcare application designed to reduce friction in everyday clinical operations. The platform unifies patient records, doctor workflows, pharmacy inventory, and AI-assisted analysis under one modular architecture. The system combines a React frontend, an Express backend, and a FastAPI-based ML microservice, with MongoDB as the transactional data store and AWS S3 for secure document storage.

Unlike basic appointment or pharmacy apps, Health-Track attempts to connect separate health workflows into one operational graph. An administrator can manage users and monitor system-level trends. Doctors can track and update patient-level information. Pharmacists can manage inventory, issue medicines, generate reports, and view predictive demand indicators. Patients can upload health documents, view summaries, and request or reschedule appointments with AI-assisted slot recommendations.

The system applies JWT-based authentication and role checks at route level. AI endpoints are exposed through the backend and delegated to a dedicated Python service to preserve separation of concerns and future scalability. Current AI functionality includes health risk prediction, diagnostic suggestion, prescription and report analysis, recommendation generation, appointment slot recommendation, and document summarization.

From an engineering perspective, the project emphasizes modularity, practical deployment readiness, and role-driven user experience. From an academic perspective, it provides enough depth for architecture analysis, algorithm discussion, API design review, testing strategy, security discussion, and feasibility evaluation.

---

## 4. Chapter 1 - Introduction

### 4.1 Background

Healthcare software often grows in silos:

- Patient records in one tool.
- Appointment handling in another.
- Pharmacy operations in a separate system.
- Manual communication between teams.

This fragmentation increases delay, duplication, and inconsistency.

Health-Track addresses this with:

- Unified role-based dashboards.
- End-to-end document pipeline.
- AI-assisted workflows where they practically help.
- Centralized operational visibility for administrators.

### 4.2 Problem Context

Observed operational issues in conventional setups:

- Difficulty tracking complete patient context during urgent cases.
- Delays in appointment scheduling and rescheduling.
- Pharmacy stock errors due to disconnected records.
- Slow interpretation of lengthy medical reports for non-specialists.
- Limited real-time analytics for management decisions.

### 4.3 Why This Project Matters

- Reduces communication lag among care actors.
- Improves traceability of records and transactions.
- Improves response quality in emergency retrieval scenarios.
- Introduces AI support without replacing human clinical judgment.
- Creates a scalable foundation for standards-based interoperability.

### 4.4 Chapter Summary

This chapter established the need for a practical, connected healthcare platform that supports both operational discipline and AI-enabled assistance.

---

## 5. Chapter 2 - Problem Statement, Objectives, and Scope

### 5.1 Problem Statement

The healthcare workflow in many institutions is affected by fragmented tools, manual data handoff, delayed reporting, and low visibility into operational trends. There is a need for a role-aware integrated platform that combines patient records, document management, appointment handling, pharmacy operations, and AI-assisted analysis while preserving data security and access boundaries.

### 5.2 Primary Objective

- Build an integrated health management platform that supports admins, doctors, pharmacists, and patients in one controlled ecosystem.

### 5.3 Specific Objectives

- Implement secure role-based authentication.
- Provide dedicated dashboards for each role.
- Enable patient document upload, retrieval, and summarization.
- Enable doctor and patient appointment operations with AI support.
- Enable pharmacist inventory tracking, dispensing, and report generation.
- Provide administrative analytics, emergency access, and API token-based integration.
- Keep backend and ML services modular and independently deployable.

### 5.4 Scope of Project

In scope:

- Multi-role user management.
- EHR-like record handling basics.
- AI-assisted inference through microservice endpoints.
- Cloud object storage and secure URL access.
- Inventory operations and generated reporting.

Out of scope for current release:

- Direct hospital HIS integration in production.
- Regulatory certification pipeline (HIPAA certification process, etc.).
- Native mobile applications.
- Full audit-grade blockchain ledger.

### 5.5 Stakeholders

- Patients.
- Doctors.
- Pharmacists.
- Hospital administrators.
- External systems via token-based API access.

---

## 6. Chapter 3 - Existing System Review and Gap Analysis

### 6.1 Common Existing Workflow Patterns

- Spreadsheet-heavy data maintenance.
- Point solutions with no common data backbone.
- Manual appointment communication.
- Pharmacy records detached from patient context.
- No AI-assisted triage or summarization layer.

### 6.2 Comparative Analysis

| Feature | Manual / Fragmented Setup | Health-Track |
| --- | --- | --- |
| User access governance | Weak, shared credentials possible | JWT + role-bound route checks |
| Appointment handling | Phone or manual follow-up | Digital scheduling + AI slot suggestion |
| Document lifecycle | Scattered files | S3-backed upload, list, view, download |
| Admin-level visibility | Delayed and incomplete | Weekly activity + disease trend summaries |
| Pharmacy operations | Error-prone ledger style | Structured inventory + transaction history |
| AI support | Not available | Dedicated microservice endpoints |

### 6.3 Gap Identified

- Existing setups cannot easily offer end-to-end traceability with role segregation.
- Data insights are delayed and mostly retrospective.
- Emergency data access remains operationally weak.

### 6.4 Proposed Gap Closure

- Centralized yet role-restricted workflows.
- Better operational observability.
- Microservice-driven intelligence where needed.

---

## 7. Chapter 4 - Requirement Analysis and Feasibility

### 7.1 Functional Requirements

Admin:

- Register and manage doctors and pharmacists.
- Register and manage patients.
- View pharmacy inventory overview.
- View critical disease trends.
- View weekly activity dashboard.
- Generate, view, revoke API token.
- Fetch emergency patient data by patient identifier.

Doctor:

- Add and manage assigned patients.
- Manage appointment lifecycle.
- View availability and slot data.

Patient:

- View doctors grouped by specialty.
- Request appointments.
- Get AI-recommended slots.
- Cancel or reschedule appointments.
- Upload and manage documents.
- Generate and view AI summaries.

Pharmacist:

- Add, update, remove medicine records.
- Issue medicine and record transactions.
- View inventory statistics.
- Generate and download reports.
- View inventory predictions via ML integration.

### 7.2 Non-Functional Requirements

- Security: JWT validation, role filtering, protected routes.
- Availability: Separate services reduce total outage risk.
- Scalability: Frontend, backend, and ML can scale independently.
- Maintainability: Route-level modularization and service layering.
- Usability: Separate role dashboards reduce interface clutter.
- Performance: FastAPI + async calls for AI requests.

### 7.3 Feasibility Study

Technical feasibility:

- Chosen stack is mature and well-supported.
- Clear service boundaries reduce coupling complexity.

Economic feasibility:

- Open-source core stack minimizes license burden.
- Cloud storage and API usage costs are variable and controllable.

Operational feasibility:

- Roles map to real healthcare actors.
- Dashboard-first UX reduces training friction.

Legal and compliance feasibility (academic stage):

- Security patterns are present.
- Formal compliance certification is future work.

Schedule feasibility:

- Modular architecture supports iterative release.

---

## 8. Chapter 5 - Architecture and System Design

### 8.1 High-Level Architecture

The platform follows a three-layer service model:

- Client layer: React application for all user roles.
- Core API layer: Express backend for business logic and authorization.
- Intelligence layer: FastAPI service for AI/ML tasks.

Supporting services:

- MongoDB for core data.
- AWS S3 for file/report objects.

### 8.2 Design Principles Followed

- Separation of concerns.
- Role-first security policy.
- API-driven communication.
- Data model extensibility.
- Replaceable AI service boundaries.

### 8.3 Module Interaction Summary

- Frontend sends role-authenticated requests to backend.
- Backend validates token and role.
- Backend performs CRUD or calls ML endpoint when required.
- Documents and reports are handled via S3 references.
- Responses are returned in role-specific payload shape.

### 8.4 Data Flow Snapshot

Document summarization path:

- Patient uploads document.
- Backend stores object in S3 and metadata in MongoDB.
- Patient requests summarization.
- Backend fetches content/context and calls ML microservice.
- Summary is saved and served via summary endpoint.

### 8.5 Security Design Snapshot

- Token extraction from headers/body/query based on route pattern.
- JWT verification and role check before sensitive operations.
- Explicit per-route access boundaries.
- Pre-signed URL mechanism for controlled document access.

---

## 9. Chapter 6 - Detailed Implementation

### 9.1 Frontend Implementation (React + Vite)

Key decisions:

- React 19 with modern functional components and hooks.
- Route segmentation for role dashboards.
- Centralized API helper in service layer.
- Local token storage and request token injection.

Implemented pages:

- Homepage.
- Sign-in and sign-up.
- Admin dashboard.
- Doctor dashboard.
- Patient dashboard.
- Pharmacist dashboard.

UX characteristics:

- Sidebar-oriented navigation.
- Modular section switching.
- Dialog-driven actions for add/edit/generate flows.
- Form-level validation and feedback messages.

### 9.2 Backend Implementation (Express + MongoDB)

Backend route groups:

- auth
- admin
- doctor
- patient
- pharmacist
- api/documents
- api/reports
- api/ai

Server behavior highlights:

- JSON body parsing.
- CORS handling.
- Health and root status endpoints.
- Not-found and error middleware.

### 9.3 ML Microservice Implementation (FastAPI)

Versioned router prefix with grouped endpoint modules:

- health-prediction
- diagnostic
- prescription
- report
- recommendations
- document
- inventory
- appointments

Model-serving behavior:

- Pydantic schema validation.
- Structured response formats.
- Endpoint-level task isolation.

### 9.4 Cloud Storage Implementation

- Medical documents uploaded to S3 bucket.
- Access through generated pre-signed URLs.
- Metadata stored in MongoDB for query and traceability.

### 9.5 Report Generation Flow

- Pharmacist requests report generation.
- Server prepares report payload and PDF stream.
- File stored in S3.
- Metadata stored in report collection.
- Download URL issued on demand.

---

## 10. Chapter 7 - Database Design and Data Dictionary

### 10.1 Core Collections

- Admin
- Doctor
- Patient
- Pharmacist
- Medicine
- Document
- Schedule
- Transaction
- Report
- HealthReport
- User

### 10.2 Relationship Snapshot

- Doctor linked to Admin.
- Patient linked to Doctor and optionally Admin.
- Medicine and transaction linked to Pharmacist and patient references.
- Schedule links doctor and patient.
- Document and report collections connect user and storage metadata.

### 10.3 Data Validation Practices

- Required fields in schema.
- Role defaults for identity models.
- Enum constraints for status and category fields.
- Timestamps for all major entities.

### 10.4 Why MongoDB Suits This Use Case

- Flexible schema for evolving health data fields.
- Easy integration with JavaScript object models.
- Good fit for nested metadata patterns.

---

## 11. Chapter 8 - API Design and Interface Contracts

### 11.1 Backend Root and Health

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | / | API status and route map |
| GET | /api/health | Uptime and health status |

### 11.2 Authentication Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | /auth/sign-up | Register admin |
| POST | /auth/sign-in | Sign in by role |

### 11.3 Admin Endpoints (Selected)

| Method | Endpoint |
| --- | --- |
| POST | /admin/add-user |
| GET | /admin/users |
| GET | /admin/patients |
| POST | /admin/add-patient |
| PUT | /admin/update-user/:id |
| DELETE | /admin/remove-user/:id |
| DELETE | /admin/remove-patient/:id |
| PUT | /admin/reset-user-password/:id |
| GET | /admin/pharmacy-inventory |
| GET | /admin/critical-diseases |
| GET | /admin/weekly-activity |
| POST | /admin/generate-api-token |
| GET | /admin/api-token |
| DELETE | /admin/api-token |
| GET | /admin/validate-token/:apiToken |
| GET | /admin/emergency/patient/:patientId |

### 11.4 Doctor Endpoints (Selected)

| Method | Endpoint |
| --- | --- |
| GET | /doctor/my-patients |
| POST | /doctor/add-patient |
| DELETE | /doctor/remove-patient/:id |
| GET | /doctor/appointments |
| POST | /doctor/appointments |
| PUT | /doctor/appointments/:id |
| DELETE | /doctor/appointments/:id |
| GET | /doctor/availability |

### 11.5 Patient Endpoints (Selected)

| Method | Endpoint |
| --- | --- |
| GET | /patient/doctors |
| POST | /patient/available-slots |
| POST | /patient/ai-suggest-slots |
| POST | /patient/request-appointment |
| GET | /patient/my-appointments |
| DELETE | /patient/cancel-appointment/:id |
| POST | /patient/reschedule-suggest/:id |
| PUT | /patient/reschedule-appointment/:id |

### 11.6 Pharmacist Endpoints (Selected)

| Method | Endpoint |
| --- | --- |
| POST | /pharmacist/add-medicine |
| GET | /pharmacist/medicines |
| PUT | /pharmacist/update-medicine/:id |
| POST | /pharmacist/issue-medicine |
| DELETE | /pharmacist/remove-medicine/:id |
| GET | /pharmacist/inventory-stats |
| GET | /pharmacist/transactions |
| GET | /pharmacist/reports |
| POST | /pharmacist/generate-report |
| GET | /pharmacist/report-download/:reportId |
| DELETE | /pharmacist/report/:reportId |
| GET | /pharmacist/ml-health |
| GET | /pharmacist/inventory-prediction |

### 11.7 Document and Report Endpoints

| Method | Endpoint |
| --- | --- |
| POST | /api/documents/upload |
| POST | /api/documents/list |
| POST | /api/documents/view/:documentId |
| POST | /api/documents/download/:documentId |
| DELETE | /api/documents/:documentId |
| POST | /api/documents/summarize/:documentId |
| POST | /api/documents/summary/:documentId |
| POST | /api/reports/generate |
| POST | /api/reports/list |
| POST | /api/reports/view/:reportId |
| POST | /api/reports/download/:reportId |

### 11.8 AI Proxy Endpoints via Backend

| Method | Endpoint |
| --- | --- |
| POST | /api/ai/health-prediction |
| POST | /api/ai/diagnostic |
| POST | /api/ai/prescription-analysis |
| POST | /api/ai/report-analysis |
| POST | /api/ai/recommendations |
| POST | /api/ai/summarize-document |
| GET | /api/ai/health |

### 11.9 FastAPI Microservice Endpoints

Base prefix (from settings): API v1 routes under configured prefix.

| Method | Endpoint Suffix |
| --- | --- |
| POST | /health-prediction/predict |
| POST | /diagnostic/diagnose |
| POST | /prescription/analyze |
| POST | /report/analyze |
| POST | /recommendations/generate |
| POST | /document/summarize |
| POST | /inventory/predict |
| POST | /inventory/predict-bulk |
| GET | /inventory/health |
| POST | /appointments/suggest-slots |
| POST | /appointments/reschedule-suggest |

---

## 12. Chapter 9 - AI and ML Logic Discussion

### 12.1 Why ML Is Decoupled

- Independent deployment and scaling.
- Easier model iteration without changing core backend.
- Cleaner fault isolation.

### 12.2 AI-Enabled Workflows in This Project

- Health prediction from clinical input patterns.
- Diagnostic support suggestions.
- Prescription analysis support.
- Report abnormality analysis support.
- Recommendation generation support.
- Medical document summarization support.
- AI-assisted appointment slot recommendation.
- Inventory demand forecast for pharmacy.

### 12.3 Practical Caution

- Predictions are advisory, not a final medical decision engine.
- Human supervision remains mandatory for clinical use.
- Explainability notes should be added in future iterations.

### 12.4 Suggested Metrics for Final Report

- Inference latency by endpoint.
- Request success/failure ratio.
- Summary quality review score by clinicians.
- Appointment acceptance ratio for AI-suggested slots.
- Inventory prediction error margin (MAPE or MAE).

---

## 13. Chapter 10 - Security, Privacy, and Governance

### 13.1 Security Controls Implemented

- JWT token verification.
- Role-based access checks.
- Protected operation routes.
- Password hashing with bcryptjs.
- Controlled file access through pre-signed URLs.

### 13.2 Risks and Mitigation

Risk: token leakage.

- Mitigation: short expiry and safe storage strategy.

Risk: unauthorized access to documents.

- Mitigation: no public bucket objects, temporary signed URLs.

Risk: incorrect ML interpretation.

- Mitigation: advisory labeling and clinician review.

### 13.3 Recommended Compliance Additions

- Structured audit logs with immutable retention.
- Data minimization and retention policy matrix.
- Consent records for AI-based analysis operations.

---

## 14. Chapter 11 - Testing and Validation Strategy

### 14.1 Testing Scope

- Authentication and authorization testing.
- CRUD validation testing for all role modules.
- Document upload/download path testing.
- Appointment booking collision testing.
- Report generation and download testing.
- AI endpoint request and fallback testing.

### 14.2 Test Types Used / Recommended

- Unit tests for utility functions and validators.
- API integration tests for route contracts.
- UI flow tests for key role journeys.
- Security tests for token and role misuse.
- Regression tests for release updates.

### 14.3 Representative Test Cases

| Test ID | Scenario | Expected Outcome |
| --- | --- | --- |
| TC-AUTH-01 | Valid admin sign-in | Token + role payload returned |
| TC-AUTH-02 | Wrong password | Controlled error response |
| TC-PAT-04 | Book already occupied slot | Rejection with slot unavailable message |
| TC-DOC-03 | Upload file above allowed size | Validation error |
| TC-PHAR-06 | Issue medicine exceeding stock | Operation rejected |
| TC-AI-02 | ML service unavailable | Graceful error response |
| TC-ADM-05 | Emergency patient fetch by invalid ID | Not found message |

### 14.4 Evidence To Attach In Final Report

- Screenshots of successful and failed test runs.
- Postman collection run summary.
- Frontend validation messages.
- API response payload examples.

---

## 15. Chapter 12 - Deployment, Configuration, and Operations

### 15.1 Local Development Setup

- Backend service on configurable port (default 5000).
- Frontend service via Vite (default 5173).
- ML microservice on port 8000.
- MongoDB local or cloud URI.

### 15.2 Environment Variables

Backend essentials:

- PORT
- MONGO_URI
- JWT_SECRET
- ML_SERVICE_URL
- AWS credentials and bucket config

Frontend essentials:

- VITE_API_URL
- VITE_ML_SERVICE_URL (if direct usage planned)

ML microservice essentials:

- HOST, PORT
- API keys and model options
- CORS and backend service URL

### 15.3 Deployment Readiness Notes

- Backend includes serverless-friendly export.
- Route organization supports independent scaling.
- S3 storage avoids local file persistence issues.

### 15.4 Operational Monitoring Recommendations

- Endpoint latency dashboard.
- Error-rate dashboard.
- Daily authentication anomaly report.
- Storage cost trend chart.

---

## 16. Chapter 13 - Results and Discussion

### 16.1 Functional Outcomes Observed

- Multi-role login and dashboard separation achieved.
- Role-wise operations are available and isolated.
- Document handling and retrieval pipeline operational.
- AI-assisted workflows integrated through backend proxy.
- Pharmacy transaction and report pipeline functional.

### 16.2 Operational Impact Discussion

- Reduced dependency on manual handoffs.
- Better visibility for admin oversight.
- Better continuity between doctor, patient, and pharmacy actions.
- Faster first-pass understanding of complex reports using summaries.

### 16.3 Quantitative Result Slots (Fill with Your Run Data)

Add final measured values for:

- Average API response time by module.
- Document upload and retrieval timing.
- Appointment booking completion time.
- Report generation time by report type.
- Prediction endpoint latency.

### 16.4 Discussion Framing For Viva

Talk in this order:

- Problem reality.
- Why modular architecture.
- Why AI as microservice.
- What is already robust.
- What is still experimental.

---

## 17. Chapter 14 - Limitations and Future Scope

### 17.1 Current Limitations

- Production-grade compliance framework not yet complete.
- Limited automated test coverage in current repository state.
- Model explainability views are not surfaced in UI.
- No offline-first mode for low-connectivity clinics.

### 17.2 High-Value Future Enhancements

- HL7/FHIR adapter module for interoperability.
- Consent and policy engine.
- Real-time notification bus (SMS/email/in-app).
- Explainable AI layer for risk output transparency.
- Mobile apps for field and bedside use.
- Wearable data ingestion pipeline.

### 17.3 Research Extensions

- Federated learning for privacy-preserving model improvement.
- Active learning loop using clinician feedback.
- Disease prevalence heatmap from anonymized data streams.

---

## 18. Chapter 15 - Conclusion

Health-Track demonstrates that a practical healthcare platform can be architected as a clean, role-aware, AI-augmented system without sacrificing maintainability. The project is not only a functional full-stack build; it is also a solid academic case study in modular architecture, secure API design, domain modeling, and applied AI integration.

The core value of this project is not any single dashboard or endpoint. It is the way all actors share a controlled, connected workflow where each decision is better informed than before.

---

## 19. Chapter 16 - Technology Stack Summary

### 19.1 Frontend Stack

- React 19
- React Router 7
- Tailwind CSS 4
- Vite
- Lucide React

### 19.2 Backend Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT + bcryptjs
- AWS SDK
- Multer
- PDFKit
- Twilio dependency present for communication extension scenarios

### 19.3 ML Stack

- FastAPI
- Uvicorn
- Pydantic
- NumPy
- Pandas
- Scikit-learn
- OpenAI SDK

---

## 20. Chapter 17 - Screenshots and Visual Evidence Plan

### 20.1 Existing Screenshots You Can Directly Use

- Homepage visuals:
  - 0_docs/screenshots/homepage-1.png
  - 0_docs/screenshots/homepage-2.png
  - 0_docs/screenshots/homepage-3.png
  - 0_docs/screenshots/homepage-4.png
- Authentication:
  - 0_docs/screenshots/sign-in.png
  - 0_docs/screenshots/sign-up.png
- Architecture visual:
  - 0_docs/screenshots/block-diagram-1.png

### 20.2 Screenshot Capture Checklist (Need To Add)

- Admin dashboard overview page.
- Critical disease chart page.
- Weekly activity chart page.
- Emergency access search and result page.
- Doctor appointment management page.
- Patient document upload and summary modal.
- Patient appointment booking with AI suggestions.
- Pharmacist inventory list and low-stock indicators.
- Pharmacist transaction history page.
- Pharmacist report generation and download flow.
- Inventory prediction panel.

---

## 21. Diagram and Infographic Placement Master Plan

This section answers your exact request: where to place diagrams and how to make them.

### 21.1 Master Placement Table

| ID | Insert In Chapter | Visual Type | What It Should Show | Suggested Tool | Final File Name |
| --- | --- | --- | --- | --- | --- |
| D-01 | Chapter 1 | Problem Context Diagram | Current fragmented healthcare workflow | draw.io | fig_d01_problem_context.png |
| D-02 | Chapter 2 | Objective Tree | Main objective broken into sub-objectives | draw.io | fig_d02_objective_tree.png |
| D-03 | Chapter 3 | Gap Analysis Matrix | Existing system vs proposed system | Figma or Canva | fig_d03_gap_matrix.png |
| D-04 | Chapter 4 | Requirement Classification Map | Functional vs non-functional requirements | draw.io | fig_d04_requirement_map.png |
| D-05 | Chapter 5 | System Context Diagram | Users, system boundary, external services | draw.io | fig_d05_system_context.png |
| D-06 | Chapter 5 | Use Case Diagram | Role-wise actions | draw.io | fig_d06_use_case.png |
| D-07 | Chapter 5 | High-Level Architecture | Frontend-backend-ML-DB-S3 | draw.io | fig_d07_architecture.png |
| D-08 | Chapter 5 | Data Flow Diagram (Level 0) | Main data movement | draw.io | fig_d08_dfd_l0.png |
| D-09 | Chapter 5 | Data Flow Diagram (Level 1) | Detailed document pipeline | draw.io | fig_d09_dfd_l1_docs.png |
| D-10 | Chapter 6 | Sequence Diagram | Patient appointment booking flow | Mermaid or draw.io | fig_d10_seq_appointment.png |
| D-11 | Chapter 6 | Sequence Diagram | Document upload and summarization flow | Mermaid or draw.io | fig_d11_seq_summarization.png |
| D-12 | Chapter 7 | ER Diagram | Collection relationships | draw.io | fig_d12_er_diagram.png |
| D-13 | Chapter 8 | API Layer Diagram | Route groups and request flow | draw.io | fig_d13_api_layer.png |
| D-14 | Chapter 9 | ML Inference Pipeline | Input, preprocessing, model, output | draw.io | fig_d14_ml_pipeline.png |
| D-15 | Chapter 10 | Security Control Map | Auth, role checks, storage security | draw.io | fig_d15_security_map.png |
| D-16 | Chapter 11 | Testing Pyramid | Unit, integration, UI testing | Canva | fig_d16_testing_pyramid.png |
| D-17 | Chapter 12 | Deployment Diagram | Local and cloud deployment topology | draw.io | fig_d17_deployment.png |
| D-18 | Chapter 14 | Future Roadmap | Enhancement timeline | PowerPoint or Figma | fig_d18_roadmap.png |
| I-01 | Chapter 3 | Comparison Infographic | Existing vs proposed (6-point compare) | Canva | info_i01_compare.png |
| I-02 | Chapter 11 | Test Case Pass/Fail Chart | Test execution summary | Excel | info_i02_test_summary.png |
| I-03 | Chapter 13 | Module Response Time Chart | Avg latency by module | Excel | info_i03_latency.png |
| I-04 | Chapter 13 | Role Utilization Chart | Usage per role | Excel | info_i04_role_usage.png |
| I-05 | Chapter 13 | Weekly Activity Trend | Documents and appointments trend | Excel | info_i05_weekly_trend.png |
| I-06 | Chapter 13 | Disease Distribution Bar Chart | Top disease categories | Excel | info_i06_disease_distribution.png |
| I-07 | Chapter 13 | Inventory Stock Status Pie Chart | In stock, low stock, out of stock | Excel | info_i07_stock_status.png |
| I-08 | Chapter 10 | Risk Heatmap | Security and operational risks | Excel or Canva | info_i08_risk_heatmap.png |

### 21.2 Where To Insert Them In Text

Use this pattern in your final report document:

- Add a line like: Figure D-07: High-Level Architecture of Health-Track.
- Insert the image below that caption.
- After image, add 5 to 8 lines explaining what the figure proves.

This alone will add depth and page value quickly.

---

## 22. Step-By-Step: How To Make Each Diagram/Infographic

### 22.1 D-01 Problem Context Diagram

Place in: Chapter 1 after problem context section.

How to make:

1. Open draw.io.
2. Put one central box: Current Healthcare Workflow.
3. Add surrounding boxes: Patient Records, Appointment Handling, Pharmacy Ledger, Manual Reporting.
4. Draw broken or dotted arrows between boxes to indicate disconnected flow.
5. Add red warning notes: delay, duplication, poor traceability.
6. Export PNG (1920x1080).

### 22.2 D-02 Objective Tree

Place in: Chapter 2 objectives section.

How to make:

1. Use draw.io tree layout.
2. Root node: Build Integrated Healthcare Platform.
3. Child nodes: security, records, appointments, pharmacy, AI, analytics.
4. Add one measurable KPI under each child.
5. Export in white background and high contrast.

### 22.3 D-03 Gap Analysis Matrix

Place in: Chapter 3 comparison section.

How to make:

1. Use Canva presentation template.
2. Create two columns: existing and proposed.
3. Add 6 rows: auth, data flow, analytics, scheduling, inventory, AI support.
4. Use red icon for weak, green icon for improved.
5. Save as PNG.

### 22.4 D-04 Requirement Map

Place in: Chapter 4 requirements.

How to make:

1. Draw two large branches from center node Requirements.
2. Left branch: functional requirements.
3. Right branch: non-functional requirements.
4. Add role tags for each functional item.
5. Add icons for security/performance/scalability on non-functional side.

### 22.5 D-05 System Context Diagram

Place in: Chapter 5 architecture beginning.

How to make:

1. Center box: Health-Track Platform.
2. External actors: Admin, Doctor, Patient, Pharmacist.
3. External systems: MongoDB, AWS S3, ML Service.
4. Draw directed arrows with labels like reads, writes, predicts, stores.
5. Keep it clean with one-line labels.

### 22.6 D-06 Use Case Diagram

Place in: Chapter 5 role flow discussion.

How to make:

1. Draw system boundary rectangle.
2. Add actors left and right.
3. Add use-cases for each role (login, manage users, upload docs, issue medicine, etc.).
4. Use include relation where common login applies.
5. Use extend relation for AI-assisted actions.

### 22.7 D-07 High-Level Architecture

Place in: Chapter 5 module interaction section.

How to make:

1. Top block: Frontend.
2. Middle block: Express API.
3. Side block: FastAPI ML service.
4. Bottom blocks: MongoDB and S3.
5. Use arrows showing request path and data persistence path.
6. Color by layer.

### 22.8 D-08 DFD Level 0

Place in: Chapter 5 data flow section.

How to make:

1. External entities: Admin, Doctor, Patient, Pharmacist.
2. Process: Health-Track Core System.
3. Data stores: User DB, Record DB, Document Store.
4. Label directional flows with verbs.

### 22.9 D-09 DFD Level 1 (Document Module)

Place in: Chapter 5 after DFD Level 0.

How to make:

1. Break module into upload, metadata save, summarize, retrieve.
2. Show S3 and MongoDB as separate stores.
3. Show patient requests and summary response path.

### 22.10 D-10 Sequence Diagram (Appointment Booking)

Place in: Chapter 6 patient appointment subsection.

How to make:

1. Actors: Patient UI, Backend, Schedule Collection, ML Service.
2. Steps: fetch doctors, request AI slots, select slot, book appointment.
3. Add alternate branch for slot collision.

### 22.11 D-11 Sequence Diagram (Document Summarization)

Place in: Chapter 6 document workflow.

How to make:

1. Actors: Patient UI, Backend, S3, Document Collection, ML Service.
2. Show upload then summarize call.
3. Return summary and store with document metadata.

### 22.12 D-12 ER Diagram

Place in: Chapter 7.

How to make:

1. Draw entities as tables.
2. Add key fields only.
3. Show one-to-many and many-to-one links.
4. Keep cardinality labels visible.

### 22.13 D-13 API Layer Diagram

Place in: Chapter 8.

How to make:

1. Create route group boxes.
2. Link route groups to corresponding models/services.
3. Highlight AI proxy routes leading to FastAPI.

### 22.14 D-14 ML Inference Pipeline

Place in: Chapter 9.

How to make:

1. Input box.
2. Validation box.
3. Feature prep box.
4. Model inference box.
5. Response formatting box.
6. Output box.

### 22.15 D-15 Security Control Map

Place in: Chapter 10.

How to make:

1. Build a layered diagram: client, API, storage, ML service.
2. Add controls per layer: JWT, role check, hash, signed URLs.
3. Add threat tags: token theft, unauthorized access, data leak.

### 22.16 D-16 Testing Pyramid

Place in: Chapter 11.

How to make:

1. Three layers: unit, integration, E2E.
2. Add approximate percentage split.
3. Put examples from your project under each layer.

### 22.17 D-17 Deployment Diagram

Place in: Chapter 12.

How to make:

1. Add client browser block.
2. Add frontend hosting block.
3. Add backend API block.
4. Add ML service block.
5. Add MongoDB and S3 blocks.
6. Label internet and private connections.

### 22.18 D-18 Future Roadmap

Place in: Chapter 14.

How to make:

1. Create quarterly timeline.
2. Add milestones: FHIR adapter, explainable AI, mobile app, monitoring stack.
3. Use milestone icons and completion bars.

### 22.19 I-01 Existing vs Proposed Infographic

Place in: Chapter 3.

How to make:

1. Two-column visual.
2. Six feature rows with icon and short text.
3. Keep each row max 10 words.

### 22.20 I-02 Test Summary Chart

Place in: Chapter 11.

How to make:

1. Use Excel table with test IDs and status.
2. Insert stacked bar chart for pass/fail/block.
3. Mention total count in chart subtitle.

### 22.21 I-03 Latency Chart

Place in: Chapter 13.

How to make:

1. Record endpoint timings in spreadsheet.
2. Use clustered bar chart by module.
3. Add average line marker.

### 22.22 I-04 Role Usage Chart

Place in: Chapter 13.

How to make:

1. Count operations by role from logs.
2. Use donut chart.
3. Add percentage labels.

### 22.23 I-05 Weekly Trend Graph

Place in: Chapter 13.

How to make:

1. X-axis: day of week.
2. Series 1: document uploads.
3. Series 2: appointments.
4. Use line chart with markers.

### 22.24 I-06 Disease Distribution Chart

Place in: Chapter 13.

How to make:

1. Extract top disease categories from admin analytics output.
2. Use horizontal bar chart sorted descending.
3. Show exact counts at bar end.

### 22.25 I-07 Inventory Status Pie

Place in: Chapter 13.

How to make:

1. Prepare three values: in stock, low stock, out of stock.
2. Use pie chart.
3. Use color code: green, amber, red.

### 22.26 I-08 Risk Heatmap

Place in: Chapter 10.

How to make:

1. Create matrix with impact vs likelihood.
2. Plot risks: data leak, service downtime, wrong prediction, token misuse.
3. Color by severity.

---

## 23. Chapter 18 - Report Writing Style Guide (To Avoid Generic Tone)

Use this style in your final word-processor version:

- Prefer specific evidence over generic claims.
- When possible, mention endpoint names and observed behaviors.
- Keep sentences varied in length.
- Avoid repetitive phrases like robust, seamless, cutting-edge in every paragraph.
- Use active voice in implementation sections.
- Use neutral, precise voice in analysis sections.

Example pattern:

- Weak: The system is very efficient and modern.
- Better: The document retrieval workflow returns signed URLs, so private files remain inaccessible without valid request context.

---

## 24. Chapter 19 - Appendix Templates

### Appendix A - Test Case Log Template

| Test ID | Module | Input | Expected | Actual | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |

### Appendix B - API Evidence Template

For each critical endpoint, include:

- Request sample.
- Response sample.
- Error sample.
- Screenshot or terminal capture.

### Appendix C - User Manual Snapshot

Include step lists for:

- Admin onboarding.
- Doctor workflow.
- Patient document actions.
- Pharmacist inventory and report generation.

### Appendix D - Meeting and Iteration Log

| Date | Activity | Outcome | Next Step |
| --- | --- | --- | --- |

### Appendix E - Known Issues Register

| Issue ID | Description | Impact | Workaround | Planned Fix |
| --- | --- | --- | --- | --- |

---

## 25. Quick Installation and Execution Reference

### 25.1 Backend

- Go to backend folder.
- Install dependencies.
- Configure environment.
- Start server.

### 25.2 Frontend

- Go to frontend folder.
- Install dependencies.
- Set API URL env.
- Start Vite development server.

### 25.3 ML Microservice

- Go to ml-microservice folder.
- Install Python requirements.
- Configure env including API keys.
- Run FastAPI app.

---

## 26. Final Submission Checklist

Before finalizing your report PDF, verify:

- All chapter headings are numbered and consistent.
- All diagram placeholders are replaced with actual figures.
- Every figure has caption and interpretation paragraph.
- Test evidence includes both pass and fail scenarios.
- References are properly cited.
- Appendix contains screenshots and API traces.
- Page count is near target range (around 80).

---

## 27. Credits

- Abhinav Kumar
- vemkaze

---

## 28. License

This project is licensed under Apache License 2.0.
