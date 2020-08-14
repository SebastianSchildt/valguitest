var speedGauge;
var powerGauge;

var SUB_ID_SPEED=0;
var SUB_ID_POW=0;
var SUB_ID_GEAR=0;

var state="INIT";
var inBoost=false;

var wscon = null;

TOKEN="eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJrdWtzYS52YWwiLCJpc3MiOiJFY2xpcHNlIEtVS1NBIERldiIsImFkbWluIjp0cnVlLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTYwNjIzOTAyMiwidzNjLXZzcyI6eyIqIjoicncifX0.bUcEW4o3HiBHZAdy71qCWcu9oBSZClntI1ZXq7HAM8i8nDtiUP4up-VXxt3S3n8AKJQOZVlHudP_ixGTb1HBKa3_CD0HFurP_Wf2Jnrgguhqi1sUItvGjgq4BPpuBsu9kV1Ds-JDmCPBBuHfRtCck353BmMyv6CHn2CCgVQH-DwW6k7wOqcFkxfxfkClO-nrUSQbad_MrxNHhrnflb3N8bc4r61BQ8gHiEyl7JJIuLhAb7bLgarjqcHABkw6T2TkwfWFsddMR2GL_PYBP4D3_r-2IHAhixiEiO758lxA2-o2D0jtte-KmTHjeEUpaWr-ryv1whZXnE243iV1lMajvjgWq5ZnsYTG4Ff7GsR_4SKyd9j6wInkog5Kkx5tFJr2P9kh7HupXQeUzbuoJ7lZAgpGyD8icxZg7c8VTpLzTs5zowjJwbxze5JAylWcXLXOA3vQKpn8E3MseD_31LoVZGEvD9p372IgVmJ0ui4qT8_ZHeGPc8bV2Iy0vDkdAhjf-4Lwf4rDGDksYpK_PO70KylGRmZ9TqiKqstUI6AWG50Jii8MPnnr8qyNO3FD8Rv7E8BnL8ioLoN5VI9eyxy1HpW2SfLKUuCaLB9iKd6fv4U_DhF1AS-Y-iu8-kOovxkTk801DhDxWJN0nyRwmhqn8exjikNB1jnW5mFWLTeagNA"

function setPow(pow)  {
    if ( pow > 100 ) {
       inBoost=true;
       $("#statetxt").html("Boost");

       $("#state_cruise").css("display","none");
       $("#state_park").css("display","none");
       $("#state_turbo").css("display","block");
       setTimeout(function() { //this will restart the animation
                $("#state_turbo").attr('src', "./turbo.gif");
            }, 0);
       $("#state_init").css("display","none");
       $("#state_reverse").css("display","none");

       setTimeout(boostEnd,2000);
    }
    if (pow < 0) {
	console.log("Negative pow "+pow)
	pow=0; 
    }
    if (pow > 220) {
	console.log("Excessive pow "+pow)
	pow=220;
    }

    powerGauge.value=pow;
//    console.log("New Pow is "+pow);
}



function stateToUI() {
    if (state == "Drive") {
       $("#statetxt").html("Cruise");

       $("#state_cruise").css("display","block");
       $("#state_park").css("display","none");
       $("#state_turbo").css("display","none");
       $("#state_init").css("display","none");
       $("#state_reverse").css("display","none");
    }
    else if (state == "Reverse") {
       $("#statetxt").html("Reverse");

       $("#state_cruise").css("display","none");
       $("#state_park").css("display","none");
       $("#state_turbo").css("display","none");
       $("#state_init").css("display","none");
       $("#state_reverse").css("display","block");
    }
    else if (state == "Park") {
       $("#statetxt").html("Park");

       $("#state_cruise").css("display","none");
       $("#state_park").css("display","block");
       $("#state_turbo").css("display","none");
       $("#state_init").css("display","none");
       $("#state_reverse").css("display","none");
    }
    else if (state == "Neutral") {
       $("#statetxt").html("Neutral");

       $("#state_cruise").css("display","block");
       $("#state_park").css("display","none");
       $("#state_turbo").css("display","none");
       $("#state_init").css("display","none");
       $("#state_reverse").css("display","none");
    }
    else if (state == "Idle") {
       $("#statetxt").html("Idle");

       $("#state_cruise").css("display","block");
       $("#state_park").css("display","none");
       $("#state_turbo").css("display","none");
       $("#state_init").css("display","none");
       $("#state_reverse").css("display","none");
    }
    else if (state == "INIT") {
       $("#statetxt").html("Ready");

       $("#state_cruise").css("display","none");
       $("#state_park").css("display","none");
       $("#state_turbo").css("display","none");
       $("#state_init").css("display","block");
       $("#state_reverse").css("display","none");
    }
   else {
       $("#statetxt").html("Unknown");

       $("#state_cruise").css("display","none");
       $("#state_park").css("display","none");
       $("#state_turbo").css("display","none");
       $("#state_init").css("display","block");
       $("#state_reverse").css("display","none");
    }

}

//Gear in M3: 0x00 Invalid, 0x01 P, 0x02 R, 0x04 D, 0x07 SNA
function setState(gear) {
    console.log("New Gear is "+gear);
    state=gear;
    if (!inBoost) {
        stateToUI();
    }
}

function setSpeed(speed) {
//    console.log("New Speed is "+speed);
    speedGauge.value=Math.abs(speed);
}

function boostEnd() {
      inBoost=false;
      stateToUI();
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

function statusMessage(msg) {
    $("#status").html(msg);
}

function keepAlive( ) {
	aliveMSG = { action: "get", path: "Vehicle.VehicleIdentification.VIN", "requestId": "99" }
	if (wscon != null) {
		wscon.send(JSON.stringify(aliveMSG));
	}
	setTimeout(keepAlive,2000); //we need to regularly send data thorugh ws to detect disconnects


}

function initWebsocket() {
    host=window.location.hostname
    wscon = new WebSocket("ws://"+host+":8090");

    statusMessage("Opening  websocket...")
    wscon.onopen = function () {
        console.log("Open. Send Auhtorize"); 
        statusMessage("Websocket open. Sending authorization & subsription request...")
        authMsg = { action: "authorize", tokens: TOKEN, requestId: "1" }
        wscon.send(JSON.stringify(authMsg));

        subMsg = { action: "subscribe", path: "Vehicle.OBD.Speed", "requestId": "2" }
        wscon.send(JSON.stringify(subMsg));

        subMsg = { action: "subscribe", path: "Vehicle.OBD.EngineLoad", "requestId": "3" }
        wscon.send(JSON.stringify(subMsg));

        subMsg = { action: "subscribe", path: "Vehicle.Drivetrain.Transmission.Gear", "requestId": "4" }
        wscon.send(JSON.stringify(subMsg));
        
        setTimeout(keepAlive,2000); //we need to regularly send data thorugh ws to detect disconnects 

    };
    

    wscon.onerror = function () {
        //console.log("Websocket error, try reconnection");
        statusMessage("Websocket connection error. Reconnecting...")
        //onclose will be called anyway
        //setTimeout(initWebsocket,500);
    };
    
    wscon.onclose = function () {
        console.log("Websocket was closed, try reconnection");
        statusMessage("Websocket unexpectedly closed. Reconnecting...")
        setTimeout(initWebsocket,500);
    };

    wscon.onmessage = function (e) {
        jsonobj = JSON.parse(e.data);
        if ( jsonobj.hasOwnProperty("requestId") ) {
            if (jsonobj['requestId'] == 2) {
                SUB_ID_SPEED=jsonobj['subscriptionId'];
                statusMessage("Speed subcription succeeded.")
            }
            else if (jsonobj['requestId'] == 3) {
                SUB_ID_POW=jsonobj['subscriptionId'];
                statusMessage("Power subcription succeeded.")
            }
            else if (jsonobj['requestId'] == 4) {
                SUB_ID_GEAR=jsonobj['subscriptionId'];
                statusMessage("Gear subcription succeeded.")
            }
            else if (jsonobj['requestId'] == 99) {
                    return 
			}

        }
        if ( jsonobj.hasOwnProperty("action") ) {
            if (jsonobj['action'] == "subscribe" && jsonobj.hasOwnProperty("value") ) {
                parseData(jsonobj);
                statusMessage("Receiving data")
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
            setState(js['value']);
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
//        minValue: -50,
	minValue: 0,
        maxValue: 210,
/*        majorTicks: [
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
        ],*/
        majorTicks: [
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
            180,
            190,
	    200,
            210
        ],

        minorTicks: 5,
        //strokeTicks: true,
        //ticksWidth: 15,
        //ticksWidthMinor: 7.5,
        highlights: [
           /* {
                "from": -50,
                "to": 0,
                "color": "rgba(0,255, 0, .8)"
            },*/
            {
                "from": 170,
                "to": 210,
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
