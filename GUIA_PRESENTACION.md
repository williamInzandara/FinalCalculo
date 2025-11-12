# GUÍA PARA LA PRESENTACIÓN ORAL (10-15 minutos)

## ESTRUCTURA DE LA PRESENTACIÓN

### 1. INTRODUCCIÓN (2 minutos) - Integrante 1

**Diapositiva 1: Título**
- Nombre del proyecto: graFyApi
- Nombres de los integrantes
- Curso y fecha

**Diapositiva 2: Problema**
- ¿Por qué es difícil visualizar funciones de varias variables?
- Limitaciones de métodos tradicionales (papel, pizarra)
- Necesidad de herramientas interactivas

**Diapositiva 3: Solución**
- Presentar graFyApi como motor de visualización 3D
- Características principales en bullets:
  - ✅ Visualización 3D interactiva
  - ✅ 6 calculadoras matemáticas
  - ✅ 8 superficies predefinidas
  - ✅ Interfaz moderna y amigable

---

### 2. FUNDAMENTOS MATEMÁTICOS (3 minutos) - Integrante 2

**Diapositiva 4: Conceptos Implementados**
- Funciones de dos variables: z = f(x, y)
- Ejemplo visual: paraboloide

**Diapositiva 5: Derivadas y Gradiente**
- Fórmula de derivadas parciales
- Vector gradiente: dirección de máximo crecimiento
- Implementación con diferencias finitas

**Diapositiva 6: Multiplicadores de Lagrange**
- Problema de optimización con restricciones
- Condición: ∇f = λ∇g
- Aplicación práctica

**Diapositiva 7: Integración Doble**
- Cálculo de volumen, masa, centro de masa
- Método numérico: Suma de Riemann

---

### 3. ARQUITECTURA Y TECNOLOGÍAS (2 minutos) - Integrante 3

**Diapositiva 8: Stack Tecnológico**
- Frontend: Next.js 16 + React 19 + TypeScript
- 3D: Three.js + React Three Fiber
- Matemáticas: Math.js + algoritmos propios
- Estilos: Tailwind CSS v4

**Diapositiva 9: Arquitectura de Componentes**
Mostrar diagrama:
\`\`\`
App Principal (page.tsx)
├── Visualizadores 3D
│   ├── Modo Interactivo
│   ├── Campo de Gradientes
│   └── Modo Análisis
└── Calculadoras
    ├── Dominio y Rango
    ├── Límites
    ├── Derivadas
    ├── Lagrange
    ├── Integración
    └── Visualización 2D
\`\`\`

**Diapositiva 10: División de Tareas**
- Tabla mostrando quién hizo qué
- Metodología de trabajo en equipo

---

### 4. DEMOSTRACIÓN EN VIVO (5-6 minutos) - Los 3 integrantes

#### Demo 1: Modo Interactivo (1.5 min) - Integrante 1
1. Abrir aplicación en navegador
2. Mostrar interfaz principal
3. Seleccionar preset "Onda Ondulante"
4. Rotar cámara 360° para mostrar la superficie
5. Cambiar resolución y rango en vivo
6. Mostrar otro preset: "Paraboloide Hiperbólico"

#### Demo 2: Campo de Gradientes (1.5 min) - Integrante 2
1. Cambiar a modo "Gradiente"
2. Mostrar vectores de gradiente
3. Explicar: "Las flechas apuntan hacia arriba de la superficie"
4. Ajustar densidad de vectores (6x6 → 20x20)
5. Cambiar escala de flechas
6. Rotar para ver en 3D

#### Demo 3: Modo Análisis (2.5 min) - Integrante 3
1. Cambiar a modo "Análisis"
2. **Dominio y Rango**: Mostrar puntos críticos detectados
3. **Límites**: Evaluar límite en (0,0)
   - Mostrar resultado de múltiples trayectorias
4. **Derivadas Parciales**: Calcular en punto (1, 1)
   - Mostrar ∂f/∂x, ∂f/∂y y gradiente
5. **Lagrange**: 
   - Ingresar restricción: `x*x + y*y - 9`
   - Encontrar puntos críticos
6. **Integración**: Mostrar volumen calculado
7. **Visualización 2D**: Mapa de calor con restricción

#### Demo 4: Función Personalizada (30 seg) - Integrante 1
1. Ingresar nueva función: `x*x - y*y + sin(t)`
2. Mostrar que se actualiza en tiempo real
3. Cambiar parámetro t con slider




