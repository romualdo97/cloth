"use strict";


// CLASE MASA
function Masa(obj) // r, v, m, Kv, tipo, add
{
	this.r = obj.pos;
	this.v = obj.vel;
	this.m = obj.m;
	this.kv = obj.kv;
	this.tipo = obj.tipo;
	this.add = obj.add;
    this.drdt = new THREE.Vector3();
	this.dvdt = new THREE.Vector3();
	this.F = new THREE.Vector3();
	this.i = -1; // el indice de la masa

	if (this.add == 1)
		Masa.sist.addMasa(this);
}

// definiendo miembros estaticos de la clase masa
Masa.sist = 0;
Masa.fija = 1;
Masa.movil = 0;

// miembbros de instancia de la clase masa
Masa.prototype.resetF = function() {
	if (this.tipo == Masa.fija)
	{
		this.F.multiplyScalar(0);
	}
	else
	{
		var wa = new THREE.Vector3(0, 0, 0);
		// this.F = this.m * Masa.sist.g - this.kv * (this.v - Masa.sist.w + wa);
        var A = this.v.clone().add( Masa.sist.w.clone().add(wa).multiplyScalar(-1) ).multiplyScalar(-this.kv);
        this.F = Masa.sist.g.clone().multiplyScalar(this.m).add(A);
	}
};

Masa.prototype.changeR = function() {
    // this.r + this.drdt * Masa.sist.dt;
	this.r = this.r.add( this.drdt.clone().multiplyScalar(Masa.sist.dt));
};

Masa.prototype.changeV = function() {
	// this.v = this.v + this.dvdt * Masa.sist.dt;
    this.v = this.v.add( this.dvdt.clone().multiplyScalar(Masa.sist.dt));
};

Masa.prototype.move = function() {
	this.changeR();
    this.changeV();
};

Masa.prototype.addF = function(force) {
	if (this.tipo == Masa.movil)
    {
        //this.F = this.F + force;
        this.F.add(force);
    }
};

Masa.prototype.getDrDt = function() {
	this.drdt = this.v;
};

Masa.prototype.getDvDt = function() {
	// this.dvdt = this.F / this.m;
    this.dvdt = this.F.clone().multiplyScalar(1/this.m);
};

Masa.prototype.getDer = function() {
	this.getDrDt();
	this.getDvDt();
};

// CLASSE RESORTE
function Resorte() {}
//var errIndx = 0;
// miembro estatico de la clase resorte
Resorte.F = function(obj) { // r1, r2, kr, Lo
	//errIndx++;
	//console.log(errIndx);
	//console.log(obj.r1);
	var diff = new THREE.Vector3(0);
	diff.addVectors(obj.r2, obj.r1.clone().multiplyScalar(-1));
	var d = diff.length();
	var u = diff.normalize();
	var Fr = obj.kr * (d - obj.Lo);
	return [u.clone().multiplyScalar(Fr), u.clone().multiplyScalar(-Fr)];
}

// CLASE AMORTIGUADOR
function Amortiguador()
{}

// Miembro estatico de la clase amortiguador
Amortiguador.F = function (obj) { // r1,r2,v1,v2,b
	var diff = new THREE.Vector3(0);
	diff.addVectors(obj.r2, obj.r1.clone().multiplyScalar(-1));
	var d = diff.length();
	var u = diff.normalize();
	var Vrel = new THREE.Vector3(0);
	Vrel.addVectors(obj.v2, obj.v1.clone().multiplyScalar(-1));
	var Fa = u.clone().multiplyScalar(b*Vrel.dot(u)); // Calcula la fuerza que ejerce el amortiguador
	return [Fa, Fa.clone().multiplyScalar(-1)]
}


var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _set = function set(object, property, value, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent !== null) { set(parent, property, value, receiver); } } else if ("value" in desc && desc.writable) { desc.value = value; } else { var setter = desc.set; if (setter !== undefined) { setter.call(receiver, value); } } return value; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* **************************************
************ CLASE ENLACE ***************
****************************************/
var Enlace = function () {
    function Enlace(m1, m2, kr, Lo, b) {
        _classCallCheck(this, Enlace);
        //console.log(arguments);
        // Clase simplemente para almacenar los valores. 
        this.m1 = m1;
        this.m2 = m2;
        this.kr = kr;
        this.Lo = Lo;
        this.b = b;
    }

    _createClass(Enlace, [{
        key: "calcular",
        value: function calcular() {
            /*console.log('enlaces.calcular(): ');
            console.log(this.m1.dvdt);
            console.log(this);*/
            var Fr1 = Resorte.F({r1: this.m1.r, r2: this.m2.r,
            				kr: this.kr, Lo: this.Lo})[0];
            var Fr2 = Resorte.F({r1: this.m1.r, r2: this.m2.r,
            				kr: this.kr, Lo: this.Lo})[1];
            var Fb1 = Amortiguador.F({r1: this.m1.r, r2: this.m2.r,
            			v1: this.m1.v, v2: this.m2.v, b: this.b})[0];
            var Fb2 = Amortiguador.F({r1: this.m1.r, r2: this.m2.r,
            			v1: this.m1.v, v2: this.m2.v, b: this.b})[1];

            //this.m1.addF(Fr1 + Fb1);
            this.m1.addF(Fr1.clone().add(Fb1));

            //this.m2.addF(Fr2 + Fb2);
            this.m2.addF(Fr2.clone().add(Fb2));
        }
    }]);

    return Enlace;
}();

/* **************************************
********** CLASE RESTRICCION ************
****************************************/


var Restriccion = function (_Enlace) {
    _inherits(Restriccion, _Enlace);

    function Restriccion(m1, m2, kr, Lo, b) {
        _classCallCheck(this, Restriccion);

        //Clase que representa una restriccion de distancia constante
        var _this = _possibleConstructorReturn(this, (Restriccion.__proto__ || Object.getPrototypeOf(Restriccion)).call(this, m1, m2, kr, Lo, b));

        _this.m1 = m1;
        _set(Restriccion.prototype.__proto__ || Object.getPrototypeOf(Restriccion.prototype), "m2", m2, _this);
        return _this;
    }

    _createClass(Restriccion, [{
        key: "corregir",
        value: function corregir(X, masas, DIM) {
            console.log("Método genérico a implementar");
        }
    }]);

    return Restriccion;
}(Enlace);

/* **************************************
********** CLASE Rest_dFija *************
****************************************/


Restriccion.sist = 0;
Restriccion.Beta = 0.2;

var Rest_dFija = function (_Restriccion) {
    _inherits(Rest_dFija, _Restriccion);

    function Rest_dFija(m1, m2) {
        var _do = arguments.length <= 2 || arguments[2] === undefined ? -1 : arguments[2];

        var kr = arguments.length <= 3 || arguments[3] === undefined ? 500 : arguments[3];
        var Lo = arguments.length <= 4 || arguments[4] === undefined ? 1 : arguments[4];
        var b = arguments.length <= 5 || arguments[5] === undefined ? 5 : arguments[5];

        _classCallCheck(this, Rest_dFija);

        var _this2 = _possibleConstructorReturn(this, (Rest_dFija.__proto__ || Object.getPrototypeOf(Rest_dFija)).call(this, m1, m2, kr, Lo, b));
        //Clase que representa una restriccion de distancia constante


        _this2.do = _do;
        return _this2;
    }

    _createClass(Rest_dFija, [{
        key: "corregir",
        value: function corregir() {
            var r1 = this.m1.r;
            var r2 = this.m2.r;
            var v1 = this.m1.v;
            var v2 = this.m2.v;

            //let J=np.append(r1-r2, r2-r1)
            var J = [];
            var r1r2 = new THREE.Vector3(0);
            r1r2.addVectors(r1, r2.clone().multiplyScalar(-1)); // r1 - r2
            var r2r1 = new THREE.Vector3(0);
            r2r1.addVectors(r2, r1.clone().multiplyScalar(-1)); // r2 - r1
            J.push([r1r2.x, r1r2.y, r1r2.z, r2r1.x, r2r1.y, r2r1.z]);

            // let V = np.append(v1, v2)
            var V = [v1.x, v1.y, v1.z, v2.x, v2.y, v2.z];

            //let M = 
            //np.append(np.array([1.0, 1.0, 1.0])/this.m1.m, 
            //    np.array([1.0, 1.0, 1.0])/this.m2.m)

            var M = [1 / this.m1.m, 1 / this.m1.m, 1 / this.m1.m, 1 / this.m2.m, 1 / this.m2.m, 1 / this.m2.m];

            // let C = (np.linalg.norm(r1-r2)**2-this.do**2)/2
            var C = (Math.pow(r1r2.length(), 2) - Math.pow(this.do, 2)) / 2;

            // let alpha=np.dot(np.multiply(J,J),M)
            var J2wise = [J[0] * J[0], J[1] * J[1], J[2] * J[2], J[3] * J[3], J[4] * J[4], J[5] * J[5]];
            var alpha = J2wise[0] * M[0] + J2wise[1] * M[1] + J2wise[2] * M[2] + J2wise[3] * M[3] + J2wise[4] * M[4] + J2wise[5] * M[5];

            //let V2 = V - np.multiply(J,M)*(np.dot(J,V) + 
            //    C*Restriccion.Beta/this.sist.dt)/alpha

            // np.multiply(J,M)
            var JmulM = [J[0] * M[0], J[1] * M[1], J[2] * M[2], J[3] * M[3], J[4] * M[4], J[5] * M[5]];
            // np.dot(J,V)
            var JdotV = J[0] * V[0] + J[1] * V[1] + J[2] * V[2] + J[3] * V[3] + J[4] * V[4] + J[5] * V[5];
            var scalar = (JdotV + C * Restriccion.Beta / Masa.sist.dt) / alpha;
            var JmulMxScalar = [];
            JmulMxScalar.push([JmulM[0] * scalar, JmulM[1] * scalar, JmulM[2] * scalar]);
            JmulMxScalar.push([JmulM[3] * scalar, JmulM[4] * scalar, JmulM[5] * scalar]);

            var V2 = [];
            V2.push([V[0] - JmulMxScalar[0], V[1] - JmulMxScalar[1], V[2] - JmulMxScalar[2]]);
            V2.push([V[3] - JmulMxScalar[3], V[4] - JmulMxScalar[4], V[5] - JmulMxScalar[5]]);

            if (this.m1.tipo == Masa.movil) this.m1.v = new THREE.Vector3(V2[0], V2[1], V2[2]); //V2[0:3]

            if (this.m2.tipo == Masa.movil) this.m2.v = new THREE.Vector3(V2[3], V2[4], V2[5]); //V2[3:6]
        }
    }]);

    return Rest_dFija;
}(Restriccion);

/* **************************************
****** CLASE Rest_dFijaSeparacion *******
****************************************/


var Rest_dFijaSeparacion = function (_Rest_dFija) {
    _inherits(Rest_dFijaSeparacion, _Rest_dFija);

    function Rest_dFijaSeparacion(m1, m2, _do) {
        var kr = arguments.length <= 3 || arguments[3] === undefined ? 500 : arguments[3];
        var Lo = arguments.length <= 4 || arguments[4] === undefined ? 1 : arguments[4];
        var b = arguments.length <= 5 || arguments[5] === undefined ? 5 : arguments[5];

        _classCallCheck(this, Rest_dFijaSeparacion);

        // Clase que representa una restriccion de distancia constante
        return _possibleConstructorReturn(this, (Rest_dFijaSeparacion.__proto__ || Object.getPrototypeOf(Rest_dFijaSeparacion)).call(this, m1, m2, _do, kr, Lo, b));
    }

    _createClass(Rest_dFijaSeparacion, [{
        key: "corregir",
        value: function corregir() {
            var r1 = this.m1.r;
            var r2 = this.m2.r;
            var v1 = this.m1.v;
            var v2 = this.m2.v;

            var r2r1 = new THREE.Vector3(0);
            r2r1.addVectors(r2, r1.multiplyScalar(-1)); // r2 - r1
            var dist = r2r1.length();

            var v2v1 = new THREE.Vector3(0);
            v2v1.addVectors(v2, v1.multiplyScalar(-1)); // v2 - v1

            if (dist <= this.do && v2v1.dot(r2r1) < 0) _get(Rest_dFijaSeparacion.prototype.__proto__ || Object.getPrototypeOf(Rest_dFijaSeparacion.prototype), "corregir", this).call(this);
        }
    }]);

    return Rest_dFijaSeparacion;
}(Rest_dFija);

/* **************************************
************ CLASE Sistema **************
****************************************/


var Sistema = function () {
    function Sistema() {
        var dt = arguments.length <= 0 || arguments[0] === undefined ? 0.0001 : arguments[0];
        //var g = arguments.length <= 1 || arguments[1] === undefined ? new THREE.Vector3(0, 0, -9.8) : arguments[1];
        var g = arguments.length <= 1 || arguments[1] === undefined ? new THREE.Vector3(0, -9.8, 0) : arguments[1];

        _classCallCheck(this, Sistema);

        // Definición de la topología
        this.masas = [];
        this.enlaces = [];
        this.restricciones = [];
        // Definición de parámetros de simulación
        this.g = g;
        this.dt = dt;
        Masa.sist = this;
        Restriccion.sist = this;
        this.eje = 0;
        // restriccion.sist=this, bloque.sist=this
        this.w = new THREE.Vector3(0.0, 0.0, 0.0); // Definicion del viento

        this.time;
    }

    _createClass(Sistema, [{
        key: "addMasa",
        value: function addMasa(m) {
            this.masas.push(m);
            m.i = this.masas.length - 1;
        }
    }, {
        key: "conectar",
        value: function conectar(m1, m2) {
            var kr = arguments.length <= 2 || arguments[2] === undefined ? 100 : arguments[2];
            var Lo = arguments.length <= 3 || arguments[3] === undefined ? 1 : arguments[3];
            var b = arguments.length <= 4 || arguments[4] === undefined ? 2 : arguments[4];

            // Función para conectar dos masas por medio de un enlace
            var enl = new Enlace(m1, m2, kr, Lo, b);
            this.enlaces.push(enl);
            //console.log('Creando enlaces' + this.enlaces + 'lenght: ' + this.enlaces.length);
            //return enl;
        }
    }, {
        key: "Restringir_dFija",
        value: function Restringir_dFija(m1, m2) {
            var _do = arguments.length <= 2 || arguments[2] === undefined ? -1 : arguments[2];

            // Función para conectar dos masas por medio de un enlace
            if (_do == -1) {
                var m1rm2r = new THREE.Vector3(0);
                m1rm2r.addVectors(m1.r, m2.r.multiplyScalar(-1)); // m1.r -m2.r
                _do = m1rm2r.length();
            }
            rest = new Rest_dFija(m1, m2, _do); // m1, m2, kr, Lo, b, _do
            this.restricciones.push(rest);
            return rest;
        }
    }, {
        key: "Restringir_dFijaSeparacion",
        value: function Restringir_dFijaSeparacion(m1, m2, _do) {
            // Función para conectar dos masas por medio de un enlace
            var rest = new Rest_dFijaSeparacion(m1, m2, _do);
            this.restricciones.push(rest);
            return rest;
        }
    }, {
        key: "dXdT",
        value: function dXdT(t) {
            // Calculo de las fuerzas de fricción y peso por masas
            /*for i in range(len(this.masas)):
                this.masas[i].resetF() */
            this.masas.forEach(function (masa) {
                masa.resetF();
            });
            // Calculo de las fuerzas debido a los enlaces
            /*for i in range(len(this.enlaces)):
                this.enlaces[i].calcular()*/
            //console.log('Enlaces en dXdT' + this.enlaces + 'lenght: ' + this.enlaces.length);
            //console.log(this.enlaces[0]);
            this.enlaces.forEach(function (enlace, index) {
            	//errIndx++;
            	//console.log("sis.enalces: Enlace numero... " + index);
                enlace.calcular();
            });

            // Calculo de las derivadas de las masas
            /*for i in range(len(this.masas)):
                this.masas[i].getDer()*/
            this.masas.forEach(function (masa) {
                masa.getDer();
            });

            // Proceso de las restricciones, cada una se corre 5 veces para corregir
            /*for j in range(5):
                for i in range(len(this.restricciones)):
                    this.restricciones[i].corregir()*/
            for (var j = 0; j < 5; j++) {
                for (var i = 0; i < this.restricciones.length; i++) {
                    this.restricciones[i].corregir();
                }
            }
        }
    }, {
        key: "pasoEuler",
        value: function pasoEuler(t) {
            this.dXdT(t); // Calculo de las derivadas del movimiento y la velocidad, cada derivada está almacenada en cada masa
            /*for i in range(len(this.masas)):
                this.masas[i].move()*/
            this.masas.forEach(function (masa) {
                masa.move();
            });
        }
    }, {
        key: "correr",
        value: function correr() {
            this.time += this.dt;
            this.pasoEuler(this.time);
        }

        /*
        correr(Tm) {
            vT=np.arange(0.0,Tm,this.dt)
             for i in range(len(vT)-1):
                #this.w=np.array([0.0, -1-np.cos(3*vT[i]), 0.0])
                this.pasoEuler(vT[i])
                if(this.eje!=0):
                    this.eje.pintar()
             this.pasoEuler(vT[i])
        }*/

    }]);

    return Sistema;
}();