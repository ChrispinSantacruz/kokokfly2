#!/bin/bash

echo ""
echo "================================"
echo "  KOKOK THE ROACH - RED LOCAL"
echo "================================"
echo ""
echo "Iniciando servidor para red local..."
echo ""

# Instalar dependencias si no existen
if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias..."
    npm install
    echo ""
fi

# Mostrar IP local
echo "Encontrando IP local..."
node find-ip.js
echo ""

# Iniciar servidor
echo "Iniciando servidor..."
echo ""
npm start 