
### Paso 1: Crear Base de Datos

```sql
-- Abre MySQL y ejecuta:
CREATE DATABASE abarrotes_db;
```

### Paso 2: Configurar Backend

```bash
# Navega a la carpeta backend
cd backend

# Instala dependencias
npm install

# Copia el archivo de configuración
cp .env.example .env

# Inicia el backend
npm start
```

### Paso 3: Configurar Frontend

```bash
# En otra terminal, navega a la carpeta frontend
cd frontend

# Instala dependencias
npm install

# Inicia el frontend
npm start

