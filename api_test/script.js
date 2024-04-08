"use strict";

document.addEventListener ("DOMContentLoaded", (event) => {

    //interval for the staus update in ms, currently 10 seconds
    const interval = 10000;
    let counter = document.createElement("counter"); //creates a counter element to help keep track of alert history counts
    document.querySelector(".container").appendChild(counter); //appends the counter element
    
    //sets inline style for the loading bar
    document.querySelector(".meter").innerHTML = `<span id='p' style='animation: expandWidth ${interval}ms linear infinite;''></span>`;


    const x = document.querySelector("#alertsview");
    
    counter.innerHTML = 1;

    setInterval(() => {
        loop(x,Number(counter.innerHTML));
        document.querySelector("#p").style.display = "block";
    },interval) ;

});

//the main loop function, takes the alertsview element, and event count variable
//fetches the status from the server, parses to a object and evaluates status to display
//based on the json object results
async function loop(alertholder="", count) {

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
                let status = fetched[host][module]["info"];
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
                switch (status["status"]) {

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
                                pwindow.document.body.innerHTML = `<h1>${module} ALERT @ ${hm["time"]} GMT </h1><div>${hm["body"]}</div>`;
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
        document.querySelector("body > div > counter").innerHTML = count;
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
