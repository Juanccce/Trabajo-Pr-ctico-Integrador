# Food Store

Food Store es una aplicación para consultar un menú, armar un carrito y seguir pedidos. El negocio también puede administrar productos, categorías, stock, usuarios y estados desde su panel.

El proyecto está separado en dos partes: `backend/` contiene la API y `frontend/` la aplicación web. La API usa FastAPI y SQLModel; la interfaz está hecha con React y TypeScript.

## Requisitos

- Python 3.11, 3.12 o 3.13.
- Node.js 20.19 o superior y pnpm 9 o superior.
- PostgreSQL 15 o superior para un entorno compartido. Para empezar en una computadora local se puede usar SQLite.

## Backend

Desde una terminal:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
python -m app.db.seed
uvicorn app.main:app --reload
```

En macOS o Linux, activá el entorno con `source .venv/bin/activate` y copiá las variables con `cp .env.example .env`.

La base local por defecto es `sqlite:///./foodstore.db`. Para PostgreSQL, cambiá `DATABASE_URL` en `backend/.env`; también configurá una clave `SECRET_KEY` propia de al menos 32 caracteres. `FRONTEND_ORIGIN` debe coincidir con el origen donde se inicia el frontend.

La carga inicial se puede ejecutar más de una vez: no duplica al administrador, las categorías ni los productos de muestra.

| Variable | Uso |
| --- | --- |
| `DATABASE_URL` | URL de SQLite o PostgreSQL |
| `SECRET_KEY` | Clave para firmar las sesiones |
| `ALGORITHM` | Algoritmo JWT; por defecto, `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración de la sesión; por defecto, 30 minutos |
| `FRONTEND_ORIGIN` | Origen habilitado para CORS |

La API queda en `http://localhost:8000`; la documentación interactiva está en `/docs` y `/redoc`.

## Frontend

En otra terminal, desde la carpeta raíz del proyecto:

```powershell
cd frontend
Copy-Item .env.example .env
pnpm install
pnpm dev
```

Para preparar una versión de producción, ejecutá `pnpm build`. `VITE_API_URL` indica la URL base de la API; en desarrollo, el ejemplo apunta a `http://localhost:8000/api/v1`.

## Acceso inicial

El seed crea una cuenta administradora local:

- Usuario: `admin`
- Contraseña: `Admin1234!`

Conviene cambiar esa contraseña antes de exponer el proyecto en una red. Desde la pantalla de registro se crean cuentas de cliente.

## Recorrido principal

1. Iniciá la API y cargá los datos de ejemplo con el seed.
2. Iniciá el frontend y explorá el menú, filtrá productos y armá el carrito.
3. Registrá una cuenta de cliente, iniciá sesión y confirmá una compra.
4. Entrá como `admin` para cambiar estados, administrar el catálogo y gestionar cuentas.
5. Cancelá un pedido pendiente y revisá que el stock vuelva al catálogo.

## Entrega

El proyecto y el video de demostración están disponibles en estos enlaces:

- Repositorio: [Trabajo-Pr-ctico-Integrador](https://github.com/Juanccce/Trabajo-Pr-ctico-Integrador).
- Video de demostración: [Ver en YouTube](https://youtu.be/O0e_MPnp93Y).
