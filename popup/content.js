"use strict";

/*setInterval(() => {
    loop();
},5000) ;*/

kickOff();

function kickOff() {

    const interval = 5000;
    const launcher = document.createElement("button");
    let counter = document.createElement("counter");
    counter.innerHTML = "0";

    launcher.innerText = "Click Me";
    document.body.appendChild(launcher);

    launcher.addEventListener("click", () => {
        
        let x = ""; 
        const pw = window.open(window.origin + "/myext", "_blank", "popup");

        pw.onload = (event) => {
            let style = "@layer importantOverrides;body {font-family: system-ui;margin: 0;}#navholder {z-index: 1;position: fixed;display: flex;flex-direction: column;width:100%;}#navbar {background-color: #7FFFD4;width: 100%;height: 64px;margin: 0;box-shadow: inset 0 -4px #00000021;z-index: 1;}.meter {height: 8px;}#p {width: 100%;z-index: 1;display: block;height: 100%;background-color: rgb(43,194,83);position: relative;overflow: hidden;}[hide=true] {display: none;}counter {display: none;}#dummy {height:72px;order: -1;}.container {display: flex;flex-direction: column;}#alertsview {display: flex;flex-direction: column;}.alertline[linecolor='red'] {background-color: #f443364a;}@layer importantOverrides {.alertline[rowcolor='1'] {background-color: #ffffff;}.alertline[rowcolor='0'] {background-color: #f2f2f2e5;}}.host {align-self: center;font-weight: 700;}.item {display: flex;flex-direction: row;}.alertline {display: flex;flex-direction: row;opacity: 100%;animation: grow 2000ms ease;}.time {text-align: center;order: -1;font-size: .65em;align-content: center;min-width: 72px;}.alert {display: flex;flex-direction: row;padding: .5rem;border-radius: .5rem;margin: 2px 4px;flex-wrap: wrap;max-width: 45%;box-shadow: inset 2px -4px #0000001a;background-color: #808080;animation: show 600ms 100ms cubic-bezier(0.38, 0.97, 0.56, 0.76) forwards;transform-origin: top center;}.module {margin: 2px;padding: 0.2rem;border-radius: 0.2rem;align-content: center;text-align: center;outline: 2px solid #00000012;}.module[status='FAILURE'] {background-color: #FA8072;}.module[status='UNKNOWN'] {background-color: #808080;}.module[state='true'] {outline: 2px solid white;}.module[status='SUCCESS'] {background-color: #00FA9A;}.alert[overallStatus='0'] {background-color: #00FA9A;}.alert[overallStatus='1'] {background-color: #DC143C;}.alert[isnew='true'][overallStatus='1'] {animation: flashr linear 1s;animation-iteration-count: 8;animation-fill-mode: forwards;}.alert[isnew='true'][overallStatus='0'] {animation: flashg linear 1s;animation-iteration-count: 4;animation-fill-mode: forwards;}.count {margin-left: auto;padding: 6px;min-width: 28px;align-content: center;text-align: center;font-size: 60%;font-weight: 700;opacity: 40%;}@keyframes show {100% {opacity: 1;transform: none;}}@keyframes grow{0%{max-height: 0;opacity: 0;}100%{opacity: 100%;max-height: 600px;}}@keyframes flashr {0% {background-color: #DC143C;}50% {background-color: #8B0000;}100% {background-color: #DC143C;}}@keyframes flashg {0% {background-color: #00FA9A;}50% {background-color: #228B22;}100% {background-color: #00FA9A;}}@keyframes flash {0% {background-color: initial;}50% {background-color: #FFFFFF;}75%{border-color: initial;}100% {background-color: #FFFFFF;}}@keyframes rotate-gradient {to {transform: rotate(360deg)}}@keyframes expandWidth {0% {max-width: 0;}100% {max-width: 100vw;}}";
            pw.document.head.innerHTML = `<meta charset=UTF-8><meta content='width=device-width,initial-scale=1'name=viewport><meta content='ie=edge'http-equiv=X-UA-Compatible><title>My Website</title><style>${style}</style>`;
            pw.document.body.innerHTML = "<div class=container><div id=navholder><div id=navbar>Navbar</div><div class=meter></div></div><div id=alertsview><div id=dummy></div></div></div><script src=script.js></script>";
            x = pw.document.querySelector("#alertsview");
            pw.document.querySelector(".meter").innerHTML = `<span id='p' style='animation: expandWidth ${interval}ms linear infinite;''></span>`;
            pw.document.querySelector(".container").appendChild(counter);
        }

        
    
        //pw.document.title = "My Extension Helper";
       
        setInterval(() => {
            loop(x,pw,Number(counter.innerHTML));
            pw.document.querySelector("#p").style.display = "block";
        },interval) ;
    
    }); 


    

}

async function loop(alertholder="", rootWindow="",count=1) {

    const url = "serverhost1.json";
    let alert = document.createElement("div"); //alert element holds the timestamp, host status, and event count.
    let d = new Date(); //alert timestamp, not the module actual timestamp
    let newAlert = false;


    d = formatTime(d);



    //Alert timestamp
    alert.innerHTML = `<div class=time><b>${d[0]}<br>${d[1]} GMT</b></div>`;

    alert.setAttribute("class", "alertline");

    //fetch handling
    const fetched = await fetchData(url).then(response => response.json())
    .then(data => {
        return data;
    })
    .catch(error => {
    console.error('Error fetching data:', error);
    }); 



    //check if fetch is empty
    if (fetched === "") {
        console.log("Fetch Empty");
    } else {
        //for each module in the host fetched data, creates a alert entry for the host
        Object.keys(fetched).forEach((host) => {
            
            
            let divstr = ""; // inner html for alertStatus
            let alertStatus = document.createElement("div"); //the element for holding the module and it's status
            let overallisnew = false; // controls new alert effects
            //overallStatus determines the host alert overall color, if 1 module is successful, and 1 is red, overall will be red.
            //default is 0, which is successful, 1 is unsuccessful
            let overallStatus = 0;

            alertStatus.setAttribute("class", "alert");
            alertStatus.setAttribute("isnew", overallisnew);

            //creates the hostname element inside the alertStatus element
            divstr = `<div class=host>${host}:&nbsp;</div>`;

            //process the module status
            Object.keys(fetched[host]).forEach( (module) => { //module is the module name
                let status = fetched[host][module]["status"];
                console.log(status);
                let hideme = false; //hides subsequent successes to not crowd the event viewer
                let newstr = "";
                let statstr = "";
                //checks if the alert status is new, will have special animation when 1.
                if (status["isnew"] == 1) {
                    overallisnew = true;
                    alertStatus.setAttribute("isnew", overallisnew);
                    newAlert = true;
                    newstr = "<label>&nbsp;&#127381;</label>";
                }

                //handles module individual status
                switch (status["content"]) {

                    case "SUCCESS":
                            if (status["isnew"] == 0) {hideme = true};
                        alertStatus.setAttribute("overallStatus", overallStatus); 
                        statstr = "SUCCESS";
                        break;
                    case "FAILURE":
                        newAlert = true;
                        overallStatus = 1;
                        alertStatus.setAttribute("overallStatus", overallStatus);
                        statstr = "FAILURE";

                        //special module alert handling, makes a popup when a specified module alerts
                        if (module === "Flow Check" && overallisnew) {
                            let pwindow = window.open(`${host}_${module}`, "_blank", "popup,width=480,height=640")
                            let hm = fetched[host][module];
                            let tstyle = "body{animation: flash 2s linear infinite;}@keyframes flash{0%,100%{background-color:#dc143c}50%{background-color:#8b0000}}";
                            pwindow.addEventListener('DOMContentLoaded', (event) => {
                                pwindow.document.head.innerHTML = `<style>${tstyle}</style>`;
                                pwindow.document.body.innerHTML = `<h1>${module} ALERT @ ${hm["statustime"]} GMT </h1><div>${hm["infosummary"]}</div>`;
                                pwindow.document.title = `${module} Critical Alert - ${host}`;
                            });
                        }

                        break;
                    default:
                        //newAlert = true;
                        overallStatus = 1;
                        alertStatus.setAttribute("overallStatus", overallStatus);
                        statstr = "UNKNOWN";
                        console.log("Unexpected Status");
                        break;


                }


                divstr += `<div class=module hide=${hideme} isnew=${status["isnew"]} status=${statstr}>${module}${newstr}</div>`;
                //divstr += `<div class=module hide=${hideme} isnew=${status["isnew"]} status=${status["status"]}>${module}${newstr}</div>`; //creates a module div to be appended inside alertStatus

            }); 

            alertStatus.innerHTML = divstr;
            
            //allows failing status to show during every interval check
            if(overallisnew || overallStatus == 1)
            alert.appendChild(alertStatus);

            
        });
    
        //if there is a new alert, append it to the alert history
        if(newAlert) {
        alertholder.prepend(alert);
        
        }

    }

    
    //increases the event counter
    if(newAlert) {   
        alert.setAttribute("rowcolor", count % 2);
        alert.innerHTML += `<div class=count>${count}</div>`;
        count++;
        rootWindow.document.querySelector("counter").innerHTML = count;
    }
}

//fetches the supplied data, is called by loop()
function fetchData(url) {
   return fetch(window.origin + `/${url}`);
}

//Formats the date for the alert timestamp correctly, takes a Date() object
function formatTime(date="") {
    
    let mdy = date.toLocaleDateString('en-us', {day:"numeric", month:"short", year:"numeric", timeZone: 'Europe/London' });
    let time = date.toLocaleTimeString('en-gb', { timeZone: 'Europe/London' });

    return [mdy, time];
}
