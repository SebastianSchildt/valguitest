var speedGauge;
var powerGauge;

var SUB_ID_SPEED=0;
var SUB_ID_POW=0;
var SUB_ID_GEAR=0;

TOKEN="eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJrdWtzYS52YWwiLCJpc3MiOiJFY2xpcHNlIEtVS1NBIERldiIsImFkbWluIjp0cnVlLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTYwNjIzOTAyMiwidzNjLXZzcyI6eyIqIjoicncifX0.bUcEW4o3HiBHZAdy71qCWcu9oBSZClntI1ZXq7HAM8i8nDtiUP4up-VXxt3S3n8AKJQOZVlHudP_ixGTb1HBKa3_CD0HFurP_Wf2Jnrgguhqi1sUItvGjgq4BPpuBsu9kV1Ds-JDmCPBBuHfRtCck353BmMyv6CHn2CCgVQH-DwW6k7wOqcFkxfxfkClO-nrUSQbad_MrxNHhrnflb3N8bc4r61BQ8gHiEyl7JJIuLhAb7bLgarjqcHABkw6T2TkwfWFsddMR2GL_PYBP4D3_r-2IHAhixiEiO758lxA2-o2D0jtte-KmTHjeEUpaWr-ryv1whZXnE243iV1lMajvjgWq5ZnsYTG4Ff7GsR_4SKyd9j6wInkog5Kkx5tFJr2P9kh7HupXQeUzbuoJ7lZAgpGyD8icxZg7c8VTpLzTs5zowjJwbxze5JAylWcXLXOA3vQKpn8E3MseD_31LoVZGEvD9p372IgVmJ0ui4qT8_ZHeGPc8bV2Iy0vDkdAhjf-4Lwf4rDGDksYpK_PO70KylGRmZ9TqiKqstUI6AWG50Jii8MPnnr8qyNO3FD8Rv7E8BnL8ioLoN5VI9eyxy1HpW2SfLKUuCaLB9iKd6fv4U_DhF1AS-Y-iu8-kOovxkTk801DhDxWJN0nyRwmhqn8exjikNB1jnW5mFWLTeagNA"

function setPow(pow)  {
    if ( pow > 100 ) {
        $("#cruise").css("display","none");
        $("#turbo").css("display","block");
        $("#statetxt").html("Boost");
        setTimeout(backToCruise,2000);
    }
    powerGauge.value=pow;
//    console.log("New Pow is "+pow);
}


//Gear in M3: 0x00 Invalid, 0x01 P, 0x02 R, 0x04 D, 0x07 SNA
function setGear(gear) {
    console.log("New Gear is "+gear);
    if (gear == "Drive") {
       $("#statetxt").html("Cruise");
       $("#cruise").css("display","block");
       $("#park").css("display","none");
    }
    else if (gear == "Reverse") {
       $("#statetxt").html("Reverse");
       $("#cruise").css("display","block");
       $("#park").css("display","none");
    }
    else if (gear == "Park") {
       $("#statetxt").html("Park");
       $("#cruise").css("display","none");
       $("#park").css("display","block");
    }
    else if (gear == "Neutral") {
       $("#statetxt").html("Neutral");
       $("#cruise").css("display","block");
       $("#park").css("display","none");
    }
    else if (gear == "Idle") {
       $("#statetxt").html("Idle");
       $("#cruise").css("display","block");
       $("#park").css("display","none");
    }
}

function setSpeed(speed) {
//    console.log("New Speed is "+speed);
    speedGauge.value=Math.abs(speed);
}

function backToCruise() {
    $("#turbo").css("display","none");
    $("#cruise").css("display","block");
    $("#statetxt").html("Cruise");
}

function testRandomSpeed() {
    speed=Math.random()*220;
    console.log("Set speed to "+speed);
    setSpeed(speed);
}

function testRandomPow() {
    pow=Math.random()*230-50;
    console.log("Set pow to "+pow);
    setPow(pow);
}

function initAll() {
    initGauges();
    initWebsocket();
}

function initWebsocket() {
    host=window.location.hostname
    var wscon = new WebSocket("ws://"+host+":8090");

    wscon.onopen = function () {
        console.log("Open. Send Auhtorize"); 
        authMsg = { action: "authorize", tokens: TOKEN, requestId: "1" }
        wscon.send(JSON.stringify(authMsg));

        subMsg = { action: "subscribe", path: "Vehicle.OBD.Speed", "requestId": "2" }
        wscon.send(JSON.stringify(subMsg));

        subMsg = { action: "subscribe", path: "Vehicle.OBD.EngineLoad", "requestId": "3" }
        wscon.send(JSON.stringify(subMsg));

        subMsg = { action: "subscribe", path: "Vehicle.Drivetrain.Transmission.Gear", "requestId": "4" }
        wscon.send(JSON.stringify(subMsg));

    };

    wscon.onerror = function () {
        console.log("Websocket error, try reconnection");
        setTimeout(initWebsocket,100);
    };

    wscon.onmessage = function (e) {
        jsonobj = JSON.parse(e.data);
        if ( jsonobj.hasOwnProperty("requestId") ) {
            if (jsonobj['requestId'] == 2) {
                SUB_ID_SPEED=jsonobj['subscriptionId'];
            }
            else if (jsonobj['requestId'] == 3) {
                SUB_ID_POW=jsonobj['subscriptionId'];
            }
            else if (jsonobj['requestId'] == 4) {
                SUB_ID_GEAR=jsonobj['subscriptionId'];
            }
        }
        if ( jsonobj.hasOwnProperty("action") ) {
            if (jsonobj['action'] == "subscribe" && jsonobj.hasOwnProperty("value") ) {
                parseData(jsonobj);
                return;
            }
        }
        console.log("Received control message "+e.data); // Send the message 'Ping' to the server
    };

}

function parseData(js) {
    if ( js.hasOwnProperty("subscriptionId") ) {
        if (js['subscriptionId'] == SUB_ID_SPEED) {
            setSpeed(js['value']);
            return;
        }
        else if (js['subscriptionId'] == SUB_ID_POW) {
            setPow(js['value']);
            return;
        }
        else if (js['subscriptionId'] == SUB_ID_GEAR) {
            setGear(js['value']);
            return;
        }

    }
    console.log("Received unknown data "+js);
}


function initGauges() {
    speedGauge = new RadialGauge({
        renderTo: 'speedG',
        width: 300,
        height: 300,
        units: "Km/h",
        minValue: 0,
        maxValue: 220,
	valueDec: 1,
        majorTicks: [
            "0",
            "20",
            "40",
            "60",
            "80",
            "100",
            "120",
            "140",
            "160",
            "180",
            "200",
            "220"
        ],
        minorTicks: 2,
        strokeTicks: true,
        highlights: [
            {
                "from": 160,
                "to": 220,
                "color": "rgba(255, 0, 0, .8)"
            }
        ],
        colorPlate: "#fff",
        borderShadowWidth: 0,
        borders: false,
        needleType: "arrow",
        needleWidth: 2,
        needleCircleSize: 7,
        needleCircleOuter: true,
        needleCircleInner: false,
	animation: false,
        animationDuration: 500,
        animationRule: "linear"
    }).draw();

    powerGauge = new LinearGauge({
        renderTo: 'powG',
        width: 1024,
        height: 160,
        units: "kW",
        title: "Inverter Power",
        minValue: -50,
        maxValue: 180,
        majorTicks: [
            -50,
            -40,
            -30,
            -20,
            -10,
            0,
            10,
            20,
            30,
            40,
            50,
            60,
            70,
            80,
            90,
            100,
            110,
            120,
            130,
            140,
            150,
            160,
            170,
            180
        ],
        minorTicks: 5,
        //strokeTicks: true,
        //ticksWidth: 15,
        //ticksWidthMinor: 7.5,
        highlights: [
            {
                "from": -50,
                "to": 0,
                "color": "rgba(0,255, 0, .8)"
            },
            {
                "from": 140,
                "to": 180,
                "color": "rgba(255, 0, 0, .8)"
            }
        ],
        //colorMajorTicks: "#ffe66a",
        //colorMinorTicks: "#ffe66a",
        //colorTitle: "#eee",
        //colorUnits: "#ccc",
        //colorNumbers: "#eee",
        needleSide: "right",
        needleType: "arrow",
        needleWidth: 5,
        colorPlate: "#fff",
        borderShadowWidth: 0,
        borders: false,
        borderRadius: 10,
        animationDuration: 500,
	animation: false,
        animationRule: "linear",
        colorNeedle: "#ff0000",
        //colorNeedleEnd: "#00ff00",
        colorBarProgress: "#ff0000",
        colorBar: "#fff",
        barStroke: 0,
        barWidth: 3,
        barBeginCircle: false
    }).draw();
    
    

}
