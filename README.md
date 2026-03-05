# ⚡ Power One Py — Sitio Web

## Estructura del proyecto

```
poweronepy/
├── index.html        ← Sitio público + Panel Admin
├── admin.html        ← Panel de administración (separado)
├── productos.json    ← Base de datos de productos
├── netlify.toml      ← Configuración de Netlify
└── README.md
```

## 🚀 Publicar en Netlify (paso a paso)

### 1. Subir a GitHub
1. Creá un repositorio nuevo en github.com
2. Subí todos los archivos de esta carpeta
3. El repo debe ser **público** (para que Netlify pueda leerlo)

### 2. Conectar con Netlify
1. Entrá a app.netlify.com
2. "Add new site" → "Import an existing project"
3. Conectá tu cuenta de GitHub
4. Seleccioná el repositorio
5. En Build settings: dejá todo vacío (no hay build)
6. Deploy!

### 3. Configurar el Admin (GitHub API)
Para que el admin pueda guardar cambios en `productos.json`:
1. En GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token" → marcá el permiso `repo`
3. Copiá el token
4. En el admin del sitio → pestaña Config → pegá el token y el nombre del repo

### 4. Dominio personalizado
1. En Netlify → Domain settings → Add custom domain
2. Apuntá los DNS de tu dominio a Netlify

## 🔐 Acceso al Admin
- URL: `tusitio.netlify.app/admin.html`
- Contraseña por defecto: `admin123`
- Cambiala desde el panel Config

## ☁️ Cloudinary (imágenes)
- Cloud Name: `drzu2lb6c`
- Upload Preset: `poweronepy`
- Las imágenes se suben directo desde el admin
