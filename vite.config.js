import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Environments → .env files loaded automatically by Vite based on --mode flag:
//   development  →  .env.development   (npm run dev)
//   staging      →  .env.staging       (npm run dev:staging / build:staging)
//   production   →  .env.production    (npm run build)

export default defineConfig({
  plugins: [react()],
});
