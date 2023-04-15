class Cambio {
    constructor(numero, x, y, asumir, funcion) {
        this.numero = numero;       // Numero
        this.x = x;                 // Coordenadas
        this.y = y;                 // Coordenadas
        this.fueAsumido = asumir;   // Fue asumido?
        this.funcion = funcion      // Fue agregado o borrado?
    }
}

class Memoria {
    constructor() {
        this.listaCambios = [];
    }

    guardarCambio(numero, x, y, asumir, funcion) {
        this.listaCambios.push(new Cambio(numero, x, y, asumir, funcion));
    }

    deshacerCambios() {

    }
}

class Casilla {
    constructor() {
        this.numero = 0;            // 0 = Vacio | {1-9} = Valores Aceptables
        this.editable = true;   // Controla que casillas sabemos son verdaderas
        this.numerosUsados = [];    // Valores ya utilizados
    }

    borrarCasilla(){
        this.numero = 0;
        this.editable = true;
    }

    setNumero(numero) {
        if (this.editable && 0 <= numero && numero <= 9) {
            this.numero = numero;
            this.numerosUsados.push(numero);
        }
    }

    setNumeroAdmin(numero){         
        // Para cuando se desea crear un sudoku con datos ingresados y no aleatorios
        if (0 <= numero && numero <= 9) {
            this.numero = numero;
            this.numerosUsados.push(numero);
            this.editable = false;
        }
    }

    setEditable(editable) {
        this.editable = editable;
    }
}

class Sudoku {
    constructor() {
        this.juego = Array.from({ length: 21 }, () => Array.from({ length:  21 }, () => new Casilla()));   // Matriz 9*9 de Casillas con 0
        this.casillasVacias = 441;
        this.memoria = new Memoria();  
    } 

    getPosibilidadesCasilla(x, y, zona) {
        const values = [1, 2, 3, 4, 5, 6, 7, 8, 9];     // Valores que NO encontro 
        const cuadranteX = Math.floor(x / 3) * 3;       // Da el inicio del cuadrante
        const cuadranteY = Math.floor(y / 3) * 3;

        values.filter(usados => !this.juego[y][x].numerosUsados.includes(usados));  // Elimina los numeros ya usados previamente

        // Recorrer celdas en el mismo cuadrante
        for (let row = cuadranteY; row < cuadranteY + 3; row++) {
            for (let col = cuadranteX; col < cuadranteX + 3; col++) {
                if (this.juego[row][col].numero !== 0) {
                    const indice = values.indexOf(this.juego[row][col].numero);
                    if (indice !== -1) {
                        values.splice(indice, 1);
                    }
                }
            }
        }

        // Calculamos el inicio del sudoku segun la zona (No se puede calcular ya que hay cuadrantes compartidos)
        let limIzquierdoX = 0;
        let limSuperiorY = 0;
        
        switch(zona) {
            case 1:
                limIzquierdoX = 0;
                limSuperiorY = 0;
                break;
            case 2:
                limIzquierdoX = 12;
                limSuperiorY = 0;
                break;
            case 3:
                limIzquierdoX = 6;
                limSuperiorY = 6;
                break;
            case 4:
                limIzquierdoX = 0;
                limSuperiorY = 12;
                break;
            case 5:
                limIzquierdoX = 12;
                limSuperiorY = 12;
                break;
        }

        // Recorrer celdas en la misma fila y columna
        for (let i = 0; i < 9; i++) {
            if (this.juego[y][i+limIzquierdoX].numero !== 0) {
                const indice = values.indexOf(this.juego[y][i+limIzquierdoX].numero);
                if (indice !== -1) {
                    values.splice(indice, 1);
                }
            }
            if (this.juego[i+limSuperiorY][x].numero !== 0) {
                const indice = values.indexOf(this.juego[i+limSuperiorY][x].numero);
                if (indice !== -1) {
                  values.splice(indice, 1);
                }
            }
        }
    }


    llenarSudokuConMatriz(matriz) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (matriz[row][col] !== 0) {
                    this.juego[row][col].setNumeroAdmin(matriz[row][col]);
                    this.casillasVacias--;
                }
            }
        }
    }

    devolverCambios() {

    }

    solucionAEstrella() {
        let lvlAsumir = 1;              // Encuentra las casillas que solo tienen <lvlAsumir> posibilidades

        while (this.casillasVacias > 0) {       // Realizara el recorido varias veces hasta completar el sudoku (Podemos agregar una bandera por si se traba)

            let menorEncontrado = 9;    // Conjunto de menor tamaño encontrado (Esto es para cuando asuma, intente no asumir en un array de 9)

            // Solo asume una vez por cuadrante
            let asumioTL = false;
            let asumioTR = false;
            let asumioCN = false;
            let asumioBL = false;
            let asumioBR = false;

            // Recorre el sudoku
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {

                    // Casilla sudoku central
                    let realRow = row + 6;
                    let realCol = col + 6;
                    if (this.juego[realRow][realCol].numero === 0 && this.juego[realRow][realCol].editable === true) {
                        const validNums = this.getPosibilidadesCasilla(realCol, realRow, 3);    // Posibilidades
                        const len = validNums.length;                                           // Cant posibilidades
                        const asumible = (!asumioCN && len <= lvlAsumir);                       // Puede asumir?
                        if (len === 1 || asumible) {
                            // Variables para siguiente iteraciones
                            if (asumible) {
                                asumioCN = false;
                            }
                            const asumio = (len !== 0);

                            // Eleccion aleatoria entre las posibilidades
                            const seleccion = Math.floor(Math.random() * len);

                            // Guardar movimiento // Aca usa el len para saber si supuso o solo habia una posibilidad
                            this.memoria.guardarCambio(this.juego[realRow][realCol].numero, realCol, realRow, asumio, "Agregar");

                            // Poner numero
                            this.juego[row][col].setNumero(validNums[seleccion]);
                        }
                        if (len === 0) {
                            this.devolverCambios();
                            continue;
                        }
                        if (len < menorEncontrado) {
                            menorEncontrado = len;
                        }
                    }

                    // Casilla sudoku superior izquierdo
                    realRow = row + 0;
                    realCol = col + 0;
                    if (this.juego[realRow][realCol].numero === 0 && this.juego[realRow][realCol].editable === true) {
                        const validNums = this.getPosibilidadesCasilla(realCol, realRow, 1);    // Posibilidades
                        const len = validNums.length;                                           // Cant posibilidades
                        const asumible = (!asumioTL && len <= lvlAsumir);                       // Puede asumir?
                        if (len === 1 || asumible) {
                            // Variables para siguiente iteraciones
                            if (asumible) {
                                asumioCN = false;
                            }
                            const asumio = (len !== 0);

                            // Eleccion aleatoria entre las posibilidades
                            const seleccion = Math.floor(Math.random() * len);

                            // Guardar movimiento // Aca usa el len para saber si supuso o solo habia una posibilidad
                            this.memoria.guardarCambio(this.juego[realRow][realCol].numero, realCol, realRow, asumio, "Agregar");

                            // Poner numero
                            this.juego[row][col].setNumero(validNums[seleccion]);
                        }
                        if (len === 0) {
                            this.devolverCambios();
                            continue;
                        }
                        if (len < menorEncontrado) {
                            menorEncontrado = len;
                        }
                    }

                    // Casilla sudoku superior derecho
                    realRow = row + 0;
                    realCol = col + 12;
                    if (this.juego[realRow][realCol].numero === 0 && this.juego[realRow][realCol].editable === true) {
                        const validNums = this.getPosibilidadesCasilla(realCol, realRow, 2);    // Posibilidades
                        const len = validNums.length;                                           // Cant posibilidades
                        const asumible = (!asumioTR && len <= lvlAsumir);                       // Puede asumir?
                        if (len === 1 || asumible) {
                            // Variables para siguiente iteraciones
                            if (asumible) {
                                asumioCN = false;
                            }
                            const asumio = (len !== 0);

                            // Eleccion aleatoria entre las posibilidades
                            const seleccion = Math.floor(Math.random() * len);

                            // Guardar movimiento // Aca usa el len para saber si supuso o solo habia una posibilidad
                            this.memoria.guardarCambio(this.juego[realRow][realCol].numero, realCol, realRow, asumio, "Agregar");

                            // Poner numero
                            this.juego[row][col].setNumero(validNums[seleccion]);
                        }
                        if (len === 0) {
                            this.devolverCambios();
                            continue;
                        }
                        if (len < menorEncontrado) {
                            menorEncontrado = len;
                        }
                    }

                    // Casilla sudoku inferior izquierdo
                    realRow = row + 12;
                    realCol = col + 0;
                    if (this.juego[realRow][realCol].numero === 0 && this.juego[realRow][realCol].editable === true) {
                        const validNums = this.getPosibilidadesCasilla(realCol, realRow, 4);    // Posibilidades
                        const len = validNums.length;                                           // Cant posibilidades
                        const asumible = (!asumioBL && len <= lvlAsumir);                       // Puede asumir?
                        if (len === 1 || asumible) {
                            // Variables para siguiente iteraciones
                            if (asumible) {
                                asumioCN = false;
                            }
                            const asumio = (len !== 0);

                            // Eleccion aleatoria entre las posibilidades
                            const seleccion = Math.floor(Math.random() * len);

                            // Guardar movimiento // Aca usa el len para saber si supuso o solo habia una posibilidad
                            this.memoria.guardarCambio(this.juego[realRow][realCol].numero, realCol, realRow, asumio, "Agregar");

                            // Poner numero
                            this.juego[row][col].setNumero(validNums[seleccion]);
                        }
                        if (len === 0) {
                            this.devolverCambios();
                            continue;
                        }
                        if (len < menorEncontrado) {
                            menorEncontrado = len;
                        }
                    }

                    // Casilla sudoku infeior derecha
                    realRow = row + 12;
                    realCol = col + 12;
                    if (this.juego[realRow][realCol].numero === 0 && this.juego[realRow][realCol].editable === true) {
                        const validNums = this.getPosibilidadesCasilla(realCol, realRow, 5);    // Posibilidades
                        const len = validNums.length;                                           // Cant posibilidades
                        const asumible = (!asumioBR && len <= lvlAsumir);                       // Puede asumir?
                        if (len === 1 || asumible) {
                            // Variables para siguiente iteraciones
                            if (asumible) {
                                asumioCN = false;
                            }
                            const asumio = (len !== 0);

                            // Eleccion aleatoria entre las posibilidades
                            const seleccion = Math.floor(Math.random() * len);

                            // Guardar movimiento // Aca usa el len para saber si supuso o solo habia una posibilidad
                            this.memoria.guardarCambio(this.juego[realRow][realCol].numero, realCol, realRow, asumio, "Agregar");

                            // Poner numero
                            this.juego[row][col].setNumero(validNums[seleccion]);
                        }
                        if (len === 0) {
                            this.devolverCambios();
                            continue;
                        }
                        if (len < menorEncontrado) {
                            menorEncontrado = len;
                        }
                    }
                }
            }

            // Actualiza la variable asumir dependiendo si encontro una casilla disponible
            lvlAsumir = menorEncontrado;
        }
    }

}