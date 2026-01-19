# Pressupostos App

## Persistència (BBDD)

La V2 guardava dades a `localStorage` (només en aquell ordinador). Aquesta versió afegeix persistència a BBDD amb **Vercel Postgres**.

### Configurar Vercel Postgres

1. A Vercel: Projecte → **Storage** → **Postgres** → Create database
2. Connecta la BBDD al projecte (Vercel ho fa automàtic i afegeix env vars com `POSTGRES_URL`).

L'app crea les taules automàticament al primer ús.

## Importar PDFs amb IA (Gemini)

1. Crea una API key de Gemini (AI Studio).
2. A Vercel: Projecte → Settings → Environment Variables
   - `GEMINI_API_KEY` = la teva key
   - (opcional) `GEMINI_MODEL` = per defecte `gemini-1.5-pro`

Després, a **Nou Pressupost**, l'importador accepta **CSV / Excel / PDF**.
