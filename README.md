Repositorio del backend de la app fullstack de la materia desarrollo de software, UTN FRRO ISI COM 303

## Variables de entorno

Los valores sensibles (JWT_SECRET, credenciales de MySQL, claves de Stripe, etc.) deben ir en un archivo `.env` ubicado en la **raíz del proyecto** (`backendTPdsw/.env`).

- El servidor inicializa `dotenv` desde `src/app.ts` mediante `import 'dotenv/config'`, por lo que solo se lee ese `.env`.
- No coloque un segundo `.env` dentro de `src/`; fue eliminado para evitar confusiones.
- Si necesita acceder a las variables en módulos individuales no deben volver a llamar a `dotenv.config()`.

