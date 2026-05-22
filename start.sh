#!/bin/bash
cd "$(dirname "$0")"
echo "Сайт запущен: http://localhost:8765"
echo "Остановка: Ctrl+C"
python3 -m http.server 8765
