
### 1️ Instala Node.js


### 2️ Instala Expo CLI

```bash
npm install -g expo-cli
```

### 3️ Instala dependencias del proyecto

```bash
cd abarrotes_react_native
npm install
```

### 4️ Configura la IP del backend

Edita `src/config/api.js`:
```javascript
export const API_CONFIG = {
  BASE_URL: 'http://TU_IP_AQUI:5000/api',  
};
```

### 5️ Inicia el backend

```bash
# En otra terminal
npm start
```

### 6️ Ejecuta la app

```bash
npm start
```

Se abrirá una página web con un QR.

### 7️ Instala Expo Go en tu celular 

- **Android**: https://play.google.com/store/apps/details?id=host.exp.exponent
- **iOS**: https://apps.apple.com/app/expo-go/id982107779

### 8️ Escanea el QR

Abre Expo Go y escanea el QR que aparece en tu navegador.

