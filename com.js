var speedGauge;
var powerGauge;

var SUB_ID_SPEED=0;
var SUB_ID_POW=0;
var SUB_ID_GEAR=0;

var state="INIT";
var inBoost=false;

var wscon = null;

TOKEN="eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJrdWtzYS52YWwiLCJpc3MiOiJFY2xpcHNlIEtVS1NBIERldiIsImFkbWluIjp0cnVlLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTc2NzIyNTU5OSwia3Vrc2EtdnNzIjp7IioiOiJydyJ9fQ.QQcVR0RuRJIoasPXYsMGZhdvhLjUalk4GcRaxhh3-0_j3CtVSZ0lTbv_Z3As5BfIYzaMlwUzFGvCVOq2MXVjRK81XOAZ6wIsyKOxva16zjbZryr2V_m3yZ4twI3CPEzJch11_qnhInirHltej-tGg6ySfLaTYeAkw4xYGwENMBBhN5t9odANpScZP_xx5bNfwdW1so6FkV1WhpKlCywoxk_vYZxo187d89bbiu-xOZUa5D-ycFkd1-1rjPXLGE_g5bc4jcQBvNBc-5FDbvt4aJlTQqjpdeppxhxn_gjkPGIAacYDI7szOLC-WYajTStbksUju1iQCyli11kPx0E66me_ZVwOX07f1lRF6D2brWm1LcMAHM3bQUK0LuyVwWPxld64uSAEsvSKsRyJERc7nZUgLf7COnUrrkxgIUNjukbdT2JVN_I-3l3b4YXg6JVD7Y5g0QYBKgXEFpZrDbBVhzo7PXPAhJD6-c3DcUQyRZExbrnFV56RwWuExphw8lYnbMvxPWImiVmB9nRVgFKD0TYaw1sidPSSlZt8Uw34VZzHWIZQAQY0BMjR33fefg42XQ1YzIwPmDx4GYXLl7HNIIVbsRsibKaJnf49mz2qnLC1K272zXSPljO11Ke1MNnsnKyUH7mcwEs9nhTsnMgEOx_TyMLRYo-VEHBDLuEOiBo"

function setPow(pow)  {
    if ( pow > 100 & !inBoost ) {
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

       setTimeout(boostEnd,3000);
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
                      //unsubscripe
                      console.log("UNSUB! ")
                      unsubMsg = { action: "unsubscribe", subscriptionId: SUB_ID_SPEED, "requestId": "200" }
                      wscon.send(JSON.stringify(unsubMsg));
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
	if (wscon != null && wscon.readyState == WebSocket.OPEN) {
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

        subMsg = { action: "subscribe", path: "Vehicle.Powertrain.Transmission.Gear", "requestId": "4" }
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
            if (jsonobj['action'] == "subscription" && jsonobj.hasOwnProperty("data") ) {
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
            setSpeed(js['data']['dp']['value']);
            return;
        }
        else if (js['subscriptionId'] == SUB_ID_POW) {
            setPow(js['data']['dp']['value']);
            return;
        }
        else if (js['subscriptionId'] == SUB_ID_GEAR) {
            setState(js['data']['dp']['value']);
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
