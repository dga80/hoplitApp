# HoplitApp 💪

Aplicación web moderna de fitness con plan de dieta y seguimiento de entrenamientos.

## 🚀 Características

- **Plan de Dieta**: Planes diferenciados para días de entrenamiento y descanso
- **Programa de Entrenamiento**: Sistema de 3 días (Lunes, Miércoles, Viernes) con ejercicios detallados
- **Seguimiento de Progreso**: 
  - Checkboxes para marcar ejercicios completados
  - Registro de pesos utilizados
  - Historial completo de entrenamientos
- **Persistencia en base de datos
- **Diseño Premium**: Interfaz moderna con glasmorphism, modo oscuro y animaciones suaves
- **Mobile-First**: Totalmente responsive y optimizado para móviles

## 📦 Instalación

```bash
npm install
```

## 🛠️ Desarrollo

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

## 🏗️ Build para Producción

```bash
npm run build
```

Los archivos estáticos se generarán en la carpeta `dist/`.

## 🌐 Despliegue en Netlify

1. Conecta tu repositorio a Netlify
2. El archivo `netlify.toml` ya está configurado
3. Netlify automáticamente ejecutará `npm run build`
4. Tu app estará disponible en tu URL de Netlify

O arrastra la carpeta `dist/` directamente a Netlify Drop.

## 📊 Estructura de Datos

La aplicación almacena:
- Ejercicios completados (checkboxes)
- Pesos registrados por ejercicio
- Historial de entrenamientos por fecha

Todo se guarda en supabase para persistencia de datos al cambiar de dispositivo

## 🎨 Tecnologías

- React 18
- Vite
- CSS Variables (Glassmorphism)
- LocalStorage API

## 📱 Optimizaciones Móviles

- Diseño responsive
- Touch-friendly UI
- Fuentes optimizadas (Inter)
- Meta tags para SEO y mobile

---

**HoplitApp © 2025** - Tu camino hacia la mejor versión de ti mismo 🔥
