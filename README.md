# Guard Uniform Compliance Checker

An AI-powered web application that helps security guard companies verify that their officers are dressed to the required standards at the start of their shifts.

## Features

- **Company Management**: Register and manage multiple security companies
- **Officer Registration**: Add and track security officers for each company
- **Compliance Standards**: Define custom uniform requirements for each company
- **AI-Powered Analysis**: Automatically verify uniform compliance using vision AI
- **Real-time Verification**: Officers submit photos at shift start for instant compliance checking
- **Detailed Reporting**: View compliance history and analytics

## How It Works

1. **Company Setup**: Security companies register and define their uniform standards
2. **Officer Registration**: Officers are added to the system and assigned to companies
3. **Photo Submission**: At shift start, officers take a photo of themselves
4. **AI Analysis**: The system analyzes the photo against the company's compliance standards
5. **Instant Results**: Officers receive immediate feedback on their uniform compliance

## Compliance Standards

The system can check for various uniform requirements, including:

- Hi-vis vest
- Body-worn camera
- SIA-licensed badge
- Proper shoes
- Black trousers
- No hat (or any other dress code requirements)

## Technology Stack

- **Frontend**: React 19 + Tailwind CSS 4
- **Backend**: Express 4 + tRPC 11
- **Database**: MySQL/TiDB with Drizzle ORM
- **Authentication**: Manus OAuth
- **AI Vision**: OpenAI Vision API
- **Storage**: S3-compatible storage for images
- **UI Components**: shadcn/ui

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm
- MySQL/TiDB database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/BigMacUK007/guard-uniform-checker.git
   cd guard-uniform-checker
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Configure your database connection
   - Add required API keys and secrets

4. Push database schema:
   ```bash
   pnpm db:push
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

The application will be available at `http://localhost:3000`

## Project Structure

```
guard-uniform-checker/
├── client/              # Frontend React application
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── components/  # Reusable UI components
│   │   ├── lib/         # Utility functions and tRPC client
│   │   └── contexts/    # React contexts
├── server/              # Backend Express + tRPC server
│   ├── db.ts           # Database query helpers
│   ├── routers.ts      # tRPC API routes
│   ├── storage.ts      # S3 storage helpers
│   └── _core/          # Core server infrastructure
├── drizzle/            # Database schema and migrations
│   └── schema.ts       # Database table definitions
└── shared/             # Shared types and constants
```

## API Endpoints

The application uses tRPC for type-safe API communication. Main routers include:

- **company**: Manage security companies
- **officer**: Manage security officers
- **standard**: Define and manage compliance standards
- **check**: Submit and analyze uniform checks

## Database Schema

### Companies
- `id`: Unique identifier
- `name`: Company name
- `createdAt`: Registration timestamp

### Officers
- `id`: Unique identifier
- `name`: Officer name
- `companyId`: Associated company
- `badgeNumber`: Officer badge number
- `createdAt`: Registration timestamp

### Compliance Standards
- `id`: Unique identifier
- `companyId`: Associated company
- `name`: Standard name
- `requiredItems`: JSON array of required uniform items

### Uniform Checks
- `id`: Unique identifier
- `officerId`: Officer who submitted the check
- `companyId`: Associated company
- `standardId`: Compliance standard used
- `imageUrl`: URL of the submitted photo
- `status`: Compliance status (pending, compliant, non_compliant)
- `aiAnalysis`: AI analysis results
- `submittedAt`: Submission timestamp

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.

## Acknowledgments

- Built with [Manus](https://manus.im) platform
- UI components from [shadcn/ui](https://ui.shadcn.com)
- AI vision powered by OpenAI

