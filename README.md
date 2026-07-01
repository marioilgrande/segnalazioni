# Segnalazioni Negozi — Setup

App a costo zero: **Vercel** (frontend + serverless API) + **Neon** (Postgres) + auth email/password (utente singolo).

## 1) Crea il database Neon

1. Vai su https://console.neon.tech → **New Project**
2. Nome: `segnalazioni` — Region: `Europe (Frankfurt)` consigliato
3. Apri **SQL Editor**, incolla e lancia il contenuto di [`schema.sql`](./schema.sql)
4. In **Connection Details** copia la **Connection string** (formato `postgresql://…?sslmode=require`). Ti serve nel passo 3.

## 2) Prepara le variabili d'ambiente

Su Vercel, nel progetto `segnalazioni` → **Settings → Environment Variables**, aggiungi (per `Production`, `Preview`, `Development`):

| Nome | Valore |
|---|---|
| `DATABASE_URL` | connection string Neon del passo 1 |
| `AUTH_EMAIL` | `marioisernia@gmail.com` |
| `AUTH_PASSWORD` | password a piacere (usata per accedere) |
| `SESSION_SECRET` | stringa random ≥ 32 caratteri — genera con `openssl rand -base64 48` |

> Salva → **Redeploy** l'ultimo deployment perché legga le nuove variabili.

## 3) Deploy su Vercel

Struttura da caricare:

```
SEGNALAZIONI/
├── api/            ← serverless functions
├── lib/            ← helper auth
├── index.html      ← app + login
├── support.html    ← redirect legacy → /
├── package.json
├── schema.sql
└── .gitignore
```

### Se il progetto Vercel è collegato a Git

```bash
cd "/Users/marioisernia/Desktop/HTML MARIO/SEGNALAZIONI"
git init
git add .
git commit -m "migrazione a Vercel + Neon"
git branch -M main
git remote add origin <URL_REPO>
git push -u origin main
```

### Se deploy manuale con Vercel CLI

```bash
npm i -g vercel                 # solo la prima volta
cd "/Users/marioisernia/Desktop/HTML MARIO/SEGNALAZIONI"
vercel link                     # collega alla cartella al progetto esistente "segnalazioni"
vercel --prod
```

Alla prima esecuzione la CLI ti chiede se collegare a un progetto esistente → scegli `segnalazioni`.

## 4) Test locale (opzionale)

```bash
cp .env.local.example .env.local   # e compila i valori
npm install
vercel dev
```

Apri http://localhost:3000

## 5) Uso

- URL: https://segnalazioni.vercel.app/
- All'accesso ti chiede email + password (quelle impostate nelle env di Vercel).
- La sessione dura **30 giorni** (cookie httpOnly firmato).
- Ogni modifica delle celle si salva automaticamente su Neon dopo ~700 ms.
- L'import Excel **sostituisce** l'elenco corrente (con conferma).
- Puoi accedere dallo stesso account da smartphone, PC di casa, ufficio: i dati sono gli stessi.

## Cambiare password

Modifica `AUTH_PASSWORD` nelle env di Vercel → Redeploy.

## Struttura API

| Endpoint | Metodo | Descrizione |
|---|---|---|
| `/api/login` | POST | `{email,password}` → cookie sessione |
| `/api/logout` | POST | cancella cookie |
| `/api/session` | GET | `{authenticated: bool}` |
| `/api/negozi` | GET | elenco negozi |
| `/api/negozi` | POST | aggiunge un negozio, o con `{replace:true, items:[…]}` sostituisce tutto |
| `/api/negozi` | PUT | aggiorna riga per `id` |
| `/api/negozi?id=N` | DELETE | elimina riga |

Tutte le rotte tranne `login`/`logout`/`session` richiedono cookie di sessione valido.
