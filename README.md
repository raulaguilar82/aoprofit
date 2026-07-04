# Albion Profit

Albion Profit es una calculadora de profit para Albion Online, con soporte para:
- crafteo de items por tier y encantamiento
- precios traídos desde una API / base de datos MongoDB
- precios manuales guardados en el navegador
- listado de compras y totales de materiales
- cálculo de costos de impuestos, nutrición, foco y diarios

## Estructura del proyecto

- `public/` -> frontend estático, incluyendo HTML, CSS, JS y datos JSON.
- `public/js/modules/` -> lógica principal de UI, precios, items, profit y lista de compras.
- `public/data/` -> datos de recetas e item-mapping.
- `server.js` -> servidor Express principal.
- `server/routes/prices.js` -> API para obtener y guardar precios.
- `server/models/price.js` -> persistencia MongoDB de precios.
- `server/config/db.js` -> conexión a MongoDB.

## Requisitos

- Node.js 18+ instalado.
- MongoDB disponible y accesible mediante `MONGO_URI`.

## Configuración

Crea un archivo `.env` en la raíz del proyecto con al menos:

```env
MONGO_URI=mongodb+srv://usuario:password@cluster.example.com/albionprofit?retryWrites=true&w=majority
```

## Uso

Instala dependencias y arranca el servidor:

```bash
npm install
npm start
```

Luego abre `http://localhost:3000`.

## Comentarios sobre el proyecto

- El frontend carga los datos de `public/data/item-mapping.json` y `public/data/recipes.json`.
- El servidor expone `/api/cached-prices` para consultar precios por IDs y para guardar precios nuevos.
- El código actual utiliza `localStorage` para almacenar precios manuales y especificaciones de focus.

## Mejoras sugeridas

- Agregar tests unitarios para la lógica de cálculo y mezcla de precios.
- Añadir validaciones más estrictas en el frontend para entradas vacías.
- Refactorizar módulos para separar UI y cálculo de negocio.
