// ==========================================
// Dashboard RTC
// ==========================================

const REFRESH_INTERVAL = 1000;


//===========================================
// Configuración de KPI
//===========================================

const KPI = {

    temperatura: {

        card: "temp-card",
        value: "temp-value",
        status: "temp-status",
        trend: "temp-trend",
        field: "temperatura",
        unit: "°C"

    },

    humedad: {

        card: "air-card",
        value: "air-value",
        status: "air-status",
        trend: "air-trend",
        field: "humedad_aire",
        unit: "%"

    },

    suelo: {

        card: "soil-card",
        value: "soil-value",
        status: "soil-status",
        trend: "soil-trend",
        field: "humedad_suelo",
        unit: "%"

    },

    ph:{
    
        card:"ph-card",
    
        value:"ph-value",
    
        status:"ph-status",
    
        trend:"ph-trend",
    
        field:"ph"
    
    },

    tds: {
    
        card: "ec-card",
    
        value: "ec-value",
    
        status: "ec-status",
    
        trend: "ec-trend",
    
        field: "tds",
    
        unit: "ppm"
    
    }

};


//===========================================
// Últimos valores
//===========================================

const ultimoValor = {};


//===========================================
// Actualizar valor
//===========================================

function actualizarValor(id, valor){

    document.getElementById(id).textContent =
        Number(valor).toFixed(1);

}


//===========================================
// Actualizar tendencia
//===========================================

function actualizarTendencia(config, valor){

    const tendencia =
        document.getElementById(config.trend);

    const anterior =
        ultimoValor[config.field];


    if(anterior === undefined){

        tendencia.textContent =
            "● Primera lectura";

        tendencia.className =
            "trend trend-stable";

    }

    else{

        const delta =
            valor - anterior;

        if(Math.abs(delta) < 0.1){

            tendencia.textContent =
                "● Estable";

            tendencia.className =
                "trend trend-stable";

        }

        else if(delta > 0){

            tendencia.textContent =
                `▲ +${delta.toFixed(1)} ${config.unit}`;

            tendencia.className =
                "trend trend-up";

        }

        else{

            tendencia.textContent =
                `▼ ${Math.abs(delta).toFixed(1)} ${config.unit}`;

            tendencia.className =
                "trend trend-down";

        }

    }

    ultimoValor[config.field] = valor;

}


//===========================================
// Actualizar estado
//===========================================

function actualizarEstado(config, timestamp){

    const card =
        document.getElementById(config.card);

    const estado =
        document.getElementById(config.status);

    const punto =
        card.querySelector(".status-dot");


    const ahora =
        new Date();

    const ultima =
        new Date(timestamp);

    const segundos =
        (ahora - ultima)/1000;


    card.classList.remove(
        "kpi-online",
        "kpi-warning",
        "kpi-offline"
    );


    if(segundos < 3){

        estado.textContent = "En línea";

        punto.style.background = "#22C55E";

        card.classList.add("kpi-online");

    }

    else if(segundos < 5){

        estado.textContent = "Sin actualización";

        punto.style.background = "#F59E0B";

        card.classList.add("kpi-warning");

    }

    else{

        estado.textContent = "Desconectado";

        punto.style.background = "#EF4444";

        card.classList.add("kpi-offline");

    }

}


//===========================================
// Actualizar una KPI
//===========================================

function actualizarKPI(config, medicion){

    actualizarValor(

        config.value,

        medicion[config.field]

    );


    actualizarTendencia(

        config,

        medicion[config.field]

    );


    actualizarEstado(

        config,

        medicion.timestamp

    );

}

//===========================================
// Actualizar KPI de pH
//===========================================

function actualizarPH(config, medicion){

    const valor =
        medicion[config.field];

    actualizarValor(

        config.value,

        valor

    );

    actualizarEstado(

        config,

        medicion.timestamp

    );

    const estado =
        document.getElementById(config.trend);


    if(valor < 5.5){

        estado.textContent = "● Muy ácido";
        estado.className = "trend trend-down";

    }

    else if(valor < 6.0){

        estado.textContent = "● Ácido";
        estado.className = "trend trend-warning";

    }

    else if(valor <= 7.5){

        estado.textContent = "● Óptimo";
        estado.className = "trend trend-up";

    }

    else{

        estado.textContent = "● Alcalino";
        estado.className = "trend trend-warning";

    }

}

//===========================================
// Actualizar dashboard
//===========================================

async function actualizarDashboard(){

    const medicion =
        await obtenerUltimaMedicion();

    if(!medicion)
        return;


    actualizarKPI(

        KPI.temperatura,

        medicion

    );

    actualizarKPI(

        KPI.humedad,

        medicion

    );

    actualizarKPI(

        KPI.suelo,

        medicion

    );

    actualizarPH(
    
        KPI.ph,
    
        medicion
    
    );

    actualizarKPI(
    
        KPI.tds,
    
        medicion
    
    );

}



//===========================================
// Inicio
//===========================================

async function iniciarDashboard(){

    await actualizarDashboard();

    setInterval(

        actualizarDashboard,

        REFRESH_INTERVAL

    );

}

iniciarDashboard();
