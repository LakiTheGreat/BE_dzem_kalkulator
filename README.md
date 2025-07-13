### To run in local/dev

`npm run dev`, this will trigger compiling the code to dist on save, and then run the app from dist/index.js, not from src/index.tsx.

### Deploy

On push to main, code will automatically be deployed by Render. Entry file is dist/index.js.

### For migrations - if prisma can't connect to DB for any reason (.env file isn't loaded)

$env:DATABASE_URL='postgresql://postgres.rzxchrvirqbtbkqqnsui:k2%262Y%24HBJk.e%25QL@aws-0-eu-central-2.pooler.supabase.com:5432/postgres'
npx prisma migrate dev --name ADD_NAME_HERE
