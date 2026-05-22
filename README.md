# QuizFlag 🚩

Jeu de quiz moderne : devinez le pays à partir de son drapeau (emoji).

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Framer Motion (animations spring + confettis)
- React Router
- `useContext` + `useReducer` + `localStorage`

## Démarrage

```bash
npm install
npm run dev
```

## Règles

- **10 questions** par partie
- **+100 pts** par bonne réponse, **+50** si réponse en moins de 3 secondes
- **5 difficultés** : Facile (20 pays) → Impossible (195+ pays et territoires)
- **3 rangs** selon le total de bonnes réponses cumulées
- **Classement** : 10 derniers scores en local

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Développement |
| `npm run build` | Production |
| `npm run preview` | Aperçu du build |
