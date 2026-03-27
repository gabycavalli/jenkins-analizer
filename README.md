# Jenkins Log Analyzer

Una herramienta moderna y rápida (basada en tecnologías Web y Electron) para analizar logs extraídos de Jenkins y obtener un reporte visual de los endpoints llamados, detectando automáticamente fallos críticos y mostrando su criticidad.

Al procesarse 100% de manera local, los logs sensibles nunca salen de tu ordenador.

---

## 🚀 Método 1: Uso Rápido en el Navegador (Edge / Chrome)
Como la aplicación está diseñada con tecnologías web modernas independientes (Single Page Application), no es estrictamente necesario compilarla para usarla.

1. Abre la carpeta del proyecto en el Explorador de Archivos de Windows: `C:\Users\gabri\repos\jenkins-reader`
2. Haz **doble clic** en el archivo `index.html`.
3. Se abrirá en tu navegador predeterminado (por ejemplo, Microsoft Edge).
4. Arrastra tu archivo de texto (`Build#1999...txt`) al área de escaneo para procesarlo inmediatamente.

---

## 💻 Método 2: Uso como Aplicación de Escritorio Nativa (Modo de Desarrollo)
Si prefieres verlo en su propia ventana aislada sin pestañas de navegador usando **Electron**.

**Requisitos Previos:**
- Tener instalado [Node.js](https://nodejs.org/) en tu PC.

1. Abre tu terminal (PowerShell o CMD) y navega a la carpeta del proyecto:
   ```bash
   cd c:\Users\gabri\repos\jenkins-reader
   ```
2. *(Una sola vez)* Asegúrate de que las dependencias estén instaladas:
   ```bash
   npm install
   ```
3. Ejecuta la aplicación de escritorio:
   ```bash
   npm start
   ```

---

## 📦 Embalaje: Compilar a Ejecutable (`.exe`)
Puedes empaquetar la aplicación para enviársela a tus compañeros de equipo como un archivo nativo `.exe`. Ellos no necesitarán instalar Node ni saber usar la consola.

1. Abre la consola en `c:\Users\gabri\repos\jenkins-reader`.
2. Ejecuta el empaquetador:
   ```bash
   npm run build
   ```
3. Espera un par de minutos a que **electron-builder** descargue los binarios básicos (solo en la primera compilación) y genere tu programa.
4. El programa final será colocado en una subcarpeta nueva llamada `dist` u `out` dentro del directorio. ¡Distribuye el archivo generado!. 

---

## 🎨 Características Adicionales
- **Dashboard Visual**: Resumen de peticiones exitosas (200), advertencias (400) y errores de servidor (500+).
- **Filtros en Tiempo Real**: Capacidad de buscar por status o segmento de URL con respuesta inmediata.
- **Modo Oscuro Glassmorphic**: Diseño amigable con colores de criticidad precisos.
