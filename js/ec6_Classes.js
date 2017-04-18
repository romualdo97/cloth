.
/* **************************************
************ CLASE ENLACE ***************
****************************************/
class Enlace {

    constructor(_m1, _m2, _kr, _Lo, _b) {
        // Clase simplemente para almacenar los valores. 
        this.m1=_m1;
        this.m2=_m2;
        this.kr=_kr;
        this.Lo=_Lo;
        this.b=_b;
    }
    
    calcular() {
        Fr1 = Resorte.F(this.m1.r, this.m2.r, this.kr, this.Lo)[0];
        Fr2 = Resorte.F(this.m1.r, this.m2.r, this.kr, this.Lo)[1];
        Fb1 = Amortiguador.F(this.m1.r, this.m2.r, this.m1.v, this.m2.v, this.b)[0];
        Fb2 = Amortiguador.F(this.m1.r, this.m2.r, this.m1.v, this.m2.v, this.b)[1];
        this.m1.addF(Fr1+Fb1)
        this.m2.addF(Fr2+Fb2)
    }
}

/* **************************************
********** CLASE RESTRICCION ************
****************************************/
class Restriccion extends Enlace {
    static sist = 0;
    static Beta = 0.2;
    constructor(m1, m2, kr, Lo, b) {
        super(m1, m2, kr, Lo, b);
        //Clase que representa una restriccion de distancia constante
        this.m1 = m1
        super.m2 = m2
    }
        
    corregir(X, masas, DIM) {
        console.log("Método genérico a implementar");
    }
}

/* **************************************
********** CLASE Rest_dFija *************
****************************************/
class Rest_dFija extends Restriccion {
    constructor(m1, m2, _do=-1, kr=500, Lo=1, b=5){  
        //Clase que representa una restriccion de distancia constante
        super(m1, m2, kr, Lo, b);
        this.do = _do
    }
        
    corregir() {
        let r1 = this.m1.r
        let r2 = this.m2.r
        let v1 = this.m1.v
        let v2 = this.m2.v
        
        //let J=np.append(r1-r2, r2-r1)
        let J = [];
        let r1r2 = new THREE.Vector3(0);
        r1r2.addVectors(r1, r2.multiplyScalar(-1)); // r1 - r2
        let r2r1 = new THREE.Vector3(0);
        r2r1.addVectors(r2, r1.multiplyScalar(-1)); // r2 - r1
        J.push([r1r2.x, r1r2.y, r1r2.z, r2r1.x, r2r1.y, r2r1.z]);

        // let V = np.append(v1, v2)
        let V = [v1.x, v1.y, v1.z, v2.x, v2.y, v2.z];

        //let M = 
        //np.append(np.array([1.0, 1.0, 1.0])/this.m1.m, 
        //    np.array([1.0, 1.0, 1.0])/this.m2.m)

        let M = [1/this.m1.m, 1/this.m1.m, 1/this.m1.m, 
                 1/this.m2.m, 1/this.m2.m, 1/this.m2.m];

        // let C = (np.linalg.norm(r1-r2)**2-this.do**2)/2
        let C = (Math.pow(r1r2.length(), 2) - Math.pow(this.do, 2))/2;


        // let alpha=np.dot(np.multiply(J,J),M)
        J2wise = [J[0]*J[0], J[1]*J[1], J[2]*J[2], J[3]*J[3], J[4]*J[4], J[5]*J[5]];
        let alpha = J2wise[0] * M[0] + J2wise[1] * M[1] + J2wise[2] * M[2] + J2wise[3] * M[3] + J2wise[4] * M[4] + J2wise[5] * M[5];

        //let V2 = V - np.multiply(J,M)*(np.dot(J,V) + 
        //    C*Restriccion.Beta/this.sist.dt)/alpha
        
        // np.multiply(J,M)
        let JmulM = [J[0]*M[0], J[1]*M[1], J[2]*M[2], J[3]*M[3], J[4]*M[4], J[5]*M[5]];
        // np.dot(J,V)
        let JdotV = J[0]*V[0] + J[1]*V[1] + J[2]*V[2] + J[3]*V[3] + J[4]*V[4] + J[5]*V[5];
        let scalar = (JdotV + C * Restriccion.Beta / Masa.sist.dt) / alpha;
        let JmulMxScalar = [];
        JmulMxScalar.push([JmulM[0]*scalar, JmulM[1]*scalar, JmulM[2]*scalar]);
        JmulMxScalar.push([JmulM[3]*scalar, JmulM[4]*scalar, JmulM[5]*scalar]);

        let V2 = [];
        V2.push([V[0] - JmulMxScalar[0], V[1] - JmulMxScalar[1], V[2] - JmulMxScalar[2]]);
        V2.push([V[3] - JmulMxScalar[3], V[4] - JmulMxScalar[4], V[5] - JmulMxScalar[5]]);

        if(this.m1.tipo == Masa.movil)
            this.m1.v = new THREE.Vector3(V2[0], V2[1], V2[2]); //V2[0:3]

        if(this.m2.tipo == masa.movil)
            this.m2.v = new THREE.Vector3(V2[3], V2[4], V2[5]); //V2[3:6]
    }
}

/* **************************************
****** CLASE Rest_dFijaSeparacion *******
****************************************/
class Rest_dFijaSeparacion extends Rest_dFija {
    constructor(m1, m2, _do, kr=500, Lo=1, b=5){
        // Clase que representa una restriccion de distancia constante
        super(m1, m2, _do, kr, Lo, b);
    }
        
    corregir() {
        let r1 = this.m1.r
        let r2 = this.m2.r
        let v1 = this.m1.v
        let v2 = this.m2.v

        let r2r1 = new THREE.Vector3(0);
        r2r1.addVectors(r2, r1.multiplyScalar(-1)); // r2 - r1
        let dist=r2r1.length();

        let v2v1 = new THREE.Vector3(0);
        v2v1.addVectors(v2, v1.multiplyScalar(-1)); // v2 - v1

        if (dist <= this.do && v2v1.dot(r2r1) < 0)
            super.corregir()
    }
}

/* **************************************
************ CLASE Sistema **************
****************************************/
class Sistema {
    constructor (dt = 0.01, g = new THREE.Vector3(0, 0, -9.8)) {
            // Definición de la topología
            this.masas=[]
            this.enlaces=[]
            this.restricciones=[]
            // Definición de parámetros de simulación
            this.g = g
            this.dt = dt
            Masa.sist = this
            Restriccion.sist=this
            this.eje=0
            // restriccion.sist=this, bloque.sist=this
            this.w=new THREE.Vector3(0.0, 0.0, 0.0); // Definicion del viento

            this.time;
    }
        
    addMasa(m){
        this.masas.push(m)
        m.i = len(this.masas) - 1;
    }
        
    conectar(m1, m2, kr=100, Lo=1, b=2) { 
        // Función para conectar dos masas por medio de un enlace
        enl = new Enlace(m1, m2, kr, Lo, b);
        this.enlaces.push(enl);
        return enl;
    }

    Restringir_dFija(m1, m2, _do=-1) {
        // Función para conectar dos masas por medio de un enlace
        if (_do == -1){
            let m1rm2r = new THREE.Vector3(0);
            m1rm2r.addVectors(m1.r, m2.r.multiplyScalar(-1)); // m1.r -m2.r
            _do = m1rm2r.length();
        }
        rest = new Rest_dFija(m1, m2, _do); // m1, m2, kr, Lo, b, _do
        this.restricciones.push(rest)
        return rest
    }

    Restringir_dFijaSeparacion(m1, m2, _do) {
        // Función para conectar dos masas por medio de un enlace
        rest = new Rest_dFijaSeparacion(m1, m2, _do)
        this.restricciones.push(rest)
        return rest
    }
            
    dXdT(t) {
        // Calculo de las fuerzas de fricción y peso por masas
        /*for i in range(len(this.masas)):
            this.masas[i].resetF() */
        this.masas.forEach((masa) => {
            masa.resetF()
        })           
        // Calculo de las fuerzas debido a los enlaces
        /*for i in range(len(this.enlaces)):
            this.enlaces[i].calcular()*/
        this.enlaces.forEach((enlace) => {
            enlace.calcular();
        })

        // Calculo de las derivadas de las masas
        /*for i in range(len(this.masas)):
            this.masas[i].getDer()*/
        this.masas.forEach((masa) => {
            masa.getDer();
        })


        // Proceso de las restricciones, cada una se corre 5 veces para corregir
        /*for j in range(5):
            for i in range(len(this.restricciones)):
                this.restricciones[i].corregir()*/
        for (let j = 0; j < 5; j++) {
            for (let i = 0; i < this.restricciones.length; i++) {
                this.restricciones[i].corregir();
            }
        }
    }
        
    pasoEuler(t) {
        this.dXdT(t) // Calculo de las derivadas del movimiento y la velocidad, cada derivada está almacenada en cada masa
        /*for i in range(len(this.masas)):
            this.masas[i].move()*/
        this.masas.forEach((masa) => {
            masa.move();
        })
    }

    correr() {
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


}