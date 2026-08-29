# Getting your Neon connection string

1. Go to https://neon.tech and sign up (free tier is plenty for this).
2. Create a new project — call it "do-it" or similar.
3. Neon will show you a connection string that looks like:

   postgresql://neondb_owner:AbC123xyz@ep-cool-name-12345.us-east-2.aws.neon.tech/neondb?sslmode=require

4. Copy that whole string.
5. In backend/.env (copy from .env.example), paste it as:

   DATABASE_URL=postgresql://neondb_owner:AbC123xyz@ep-cool-name-12345.us-east-2.aws.neon.tech/neondb?sslmode=require

   One catch: SQLAlchemy needs the driver name in the URL. Change
   "postgresql://" to "postgresql+psycopg://" at the start — the rest
   of the string stays exactly as Neon gave it to you.

That's it — no local Postgres install, no Docker, nothing else to run.