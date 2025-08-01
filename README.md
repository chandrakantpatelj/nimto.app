# Metronic 9 | All-in-One Tailwind based HTML/React/Next.js Template for Modern Web Applications

## Getting Started

The official [Metronic Next.js Documentation](https://docs.keenthemes.com/metronic-nextjs) will be released soon,
alongside the stable Metronic release, expected within the next week.

### Prerequisites

- Node.js 16.x or higher
- Npm or Yarn
- Tailwind CSS 4.x
- React 19.x
- Next.js 15.3.x
- PostgreSQL 17.4.x

## ReUI Components

Metronic now leverages [ReUI](https://reui.io), our open-source React component library.

Star the [ReUI on GitHub](https://github.com/keenthemes/reui) to help us grow the project and stay updated on new features!

### Installation

To set up the project dependencies, including those required for React 19, use the `--force` flag to resolve any dependency conflicts:

```bash
npm install --force
```

### Database Deployment

This will create the necessary tables in database for user authorization and user management apps :

```bash
npx prisma db push
```

Once your schema is deployed, you need to generate the Prisma Client:

```bash
npx prisma generate
```

### Development

Start the development server:

```bash
npm run dev
```

### Setting Up the Demo Layout

Open `app/(protected)/layout.tsx` and change `Demo1Layout` to any demo, for example, `Demo5Layout` and you will switch entire app layout to the selected demo.

```bash
<Demo5Layout>
	{children}
</Demo5Layout>
```

### Reporting Issues

If you encounter any issues or have suggestions for improvement, please contact us at [support@keenthemes.com](mailto:support@keenthemes.com).
Include a detailed description of the issue or suggestion, and we will work to address it in the next stable release.
