let idGlobal = 0;

class Casilla{
    constructor(numero, editable){
        this.numero = numero;       // 0 = Vacio | {1-9} = Valores Aceptables
        this.editable = editable;   // Controla que casillas sabemos son verdaderas
        this.id = ++idGlobal;       // Asigna un ID por cada casilla creada
    }

    setNumero(numero){
        if (this.editable && 0 <= numero && numero <= 9) {
            this.numero = numero;
        }
    }
}

class Sudoku{
    constructor(){
        this.juego = [];

    }


}