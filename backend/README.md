# Oxymedic Backend (Express + Mongoose)

## Installation

```bash
cd backend
npm install
cp .env.example .env
# Édite .env et mets ta vraie URI MongoDB + un JWT_SECRET fort
```

## Lancement

```bash
npm run seed   # crée un compte admin par défaut
npm run dev    # démarre l'API sur http://localhost:5000
```

**Compte admin par défaut :**
- email : `admin@oxymedic.local`
- mot de passe : `admin123`

⚠️ Change-le immédiatement en production.

## Endpoints principaux

| Méthode | Route | Rôles |
|---|---|---|
| POST | `/api/auth/login` | public |
| GET | `/api/auth/me` | tous (auth) |
| POST | `/api/auth/register` | admin |
| GET/POST/PUT/DELETE | `/api/clients` | admin, employe |
| GET/POST/PUT/DELETE | `/api/equipments` | admin, employe |
| GET/POST/PUT/DELETE | `/api/units` | admin, employe |
| GET/POST | `/api/orders` | admin, employe |
| PATCH | `/api/orders/:id/status` | admin, employe, livreur |
| GET/POST | `/api/payments` | admin, caissier |
| GET/POST | `/api/deposits` | admin, caissier, employe |
| GET | `/api/dashboard/summary` | tous (auth) |

## Connexion frontend

Dans le frontend Lovable, configure la variable :
```
VITE_API_URL=http://localhost:5000/api
```
Et autorise CORS via `CORS_ORIGIN` dans le `.env` du backend.
