# Front

Front React qui consomme l'API du dossier [`back/`](../back).

## Stack

- **Vite** + **React** + **TypeScript**
- **Mantine** — composants UI et formulaires
- **React Router** — navigation
- **TanStack Query** — appels à l'API (cache, chargement, erreurs)
- **Zod** — validation des formulaires

## Prérequis

- Node.js 20+

## Configuration

Créer un `.env.local` (non versionné) à partir de l'exemple fourni :

```bash
cp .env.example .env.local
```

Il contient l'URL de base de l'API :

```
VITE_API_URL=https://localhost/api
```

Le certificat HTTPS du backend est auto-signé en local : ouvrir une fois `https://localhost/api` dans le navigateur et accepter l'avertissement, sinon les appels API depuis le front échoueront.

## Démarrage

```bash
npm install       # première fois, ou après ajout d'une dépendance
npm run dev       # serveur de dev avec hot reload
```

L'app est servie sur **http://localhost:5173**.

## Autres commandes

```bash
npm run build     # build de production (type-check + bundle) dans dist/
npm run preview   # sert le build de production en local
npm run lint      # lint du code
```
