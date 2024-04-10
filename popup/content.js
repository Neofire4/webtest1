"use strict";

var intervalID;

/*setInterval(() => {
    loop();
},5000) ;*/

kickOff();

function kickOff() {

    const interval = 5000;
    const launcher = document.createElement("button");
    const holderNode = document.createElement("holder"); holderNode.style.display = "none";
    let counter = document.createElement("counter");
    
    counter.innerHTML = "1";

    launcher.innerText = "Click Me";
    document.body.appendChild(launcher);
    

    launcher.addEventListener("click", () => {
        
        let x = document.querySelector("#alertsview"); 
        const pw = window.open(window.origin + "/myext", "_blank", "popup");

        pw.onload = (event) => {
            let style = "@layer importantOverrides;body {font-family: system-ui;margin: 0;}#navholder {z-index: 1;position: fixed;display: flex;flex-direction: column;width:100%;}#navbar {background-color: #7FFFD4;width: 100%;height: 64px;margin: 0;box-shadow: inset 0 -4px #00000021;z-index: 1;}.meter {height: 8px;}#p {width: 100%;z-index: 1;display: block;height: 100%;background-color: rgb(43,194,83);position: relative;overflow: hidden;}[hide=true] {display: none;}counter {display: none;}#dummy {height:72px;order: -1;}.container {display: flex;flex-direction: column;}#alertsview {display: flex;flex-direction: column;}.alertline[linecolor='red'] {background-color: #f443364a;}@layer importantOverrides {.alertline[rowcolor='1'] {background-color: #ffffff;}.alertline[rowcolor='0'] {background-color: #f2f2f2e5;}}.host {align-self: center;font-weight: 700;}.item {display: flex;flex-direction: row;}.alertline {display: flex;flex-direction: row;opacity: 100%;animation: grow 2000ms ease;}.time {text-align: center;order: -1;font-size: .65em;align-content: center;min-width: 72px;}.alert {display: flex;flex-direction: row;padding: .5rem;border-radius: .5rem;margin: 2px 4px;flex-wrap: wrap;max-width: 45%;box-shadow: inset 2px -4px #0000001a;background-color: #808080;animation: show 600ms 100ms cubic-bezier(0.38, 0.97, 0.56, 0.76) forwards;transform-origin: top center;}.module {margin: 2px;padding: 0.2rem;border-radius: 0.2rem;align-content: center;text-align: center;outline: 2px solid #00000012;}.module[status='FAILURE'] {background-color: #FA8072;}.module[status='UNKNOWN'] {background-color: #808080;}.module[state='true'] {outline: 2px solid white;}.module[status='SUCCESS'] {background-color: #00FA9A;}.alert[overallStatus='0'] {background-color: #00FA9A;}.alert[overallStatus='1'] {background-color: #DC143C;}.alert[isnew='true'][overallStatus='1'] {animation: flashr linear 1s;animation-iteration-count: 8;animation-fill-mode: forwards;}.alert[isnew='true'][overallStatus='0'] {animation: flashg linear 1s;animation-iteration-count: 4;animation-fill-mode: forwards;}.count {margin-left: auto;padding: 6px;min-width: 28px;align-content: center;text-align: center;font-size: 60%;font-weight: 700;opacity: 40%;}@keyframes show {100% {opacity: 1;transform: none;}}@keyframes grow{0%{max-height: 0;opacity: 0;}100%{opacity: 100%;max-height: 600px;}}@keyframes flashr {0% {background-color: #DC143C;}50% {background-color: #8B0000;}100% {background-color: #DC143C;}}@keyframes flashg {0% {background-color: #00FA9A;}50% {background-color: #228B22;}100% {background-color: #00FA9A;}}@keyframes flash {0% {background-color: initial;}50% {background-color: #FFFFFF;}75%{border-color: initial;}100% {background-color: #FFFFFF;}}@keyframes rotate-gradient {to {transform: rotate(360deg)}}@keyframes expandWidth {0% {max-width: 0;}100% {max-width: 100vw;}}";
            pw.document.head.innerHTML = `<meta charset=UTF-8><meta content='width=device-width,initial-scale=1'name=viewport><meta content='ie=edge'http-equiv=X-UA-Compatible><title>My Website</title><style>${style}</style>`;
            pw.document.body.innerHTML = "<div class=container><div id=navholder><div id=navbar>Navbar</div><div class=meter></div></div><div id=alertsview><div id=dummy></div></div></div><script src=script.js></script>";
            x = pw.document.querySelector("#alertsview");
            pw.document.querySelector(".meter").innerHTML = `<span id='p' style='animation: expandWidth ${interval}ms linear infinite;''></span>`;
            pw.document.querySelector(".container").appendChild(counter);
            pw.document.body.appendChild(holderNode);
        }

        
    
        //pw.document.title = "My Extension Helper";
       
        intervalID = setInterval(() => {
            loop(x,pw,Number(counter.innerHTML),holderNode);
            pw.document.querySelector("#p").style.display = "block";
        },interval) ;
    
    }); 


    

}

async function loop(alertholder="", rootWindow="",count=1,holder) {

    if(rootWindow.closed) {
        clearInterval(intervalID);
    }

    const url = "serverhost1.json";

    let alert = document.createElement("div"); //alert element holds the timestamp, host status, and event count.
    let d = new Date(); //alert timestamp, not the module actual timestamp
    let newAlert = false;

    d = formatTime(d);


    //Alert timestamp
    alert.innerHTML = `<div class=time><b>${d[0]}<br>${d[1]} GMT</b></div>`;

    alert.setAttribute("class", "alertline");


    const fetched = await fetchData(url).then(response => response.json())
    .then(data => {
        return data;
    })
    .catch(error => {
    console.error('Error fetching data:', error);
    }); 

    console.log(fetched);

    //check if fetch is empty
    if (fetched === "") {
        console.log("Fetch Empty");
    } else {
        //for each module in the host fetched data, creates a alert entry for the host
        Object.keys(fetched).forEach((host) => {
            
            let alertStatus = document.createElement("div"); alertStatus.setAttribute("class", "alert");
            let divstr = "";

            


            divstr = `<div class=host>${host}:&nbsp;</div>`;

            if (rootWindow.document.querySelector(host) ) {
                console.log(`${host} node does exist`)
            } else {
                console.log(`${host} node does not exist`)
                holder.appendChild(document.createElement(host))
            }

            Object.keys(fetched[host]).forEach((module) => {
                
                const prevElement = rootWindow.document.querySelector(host)
                const short = fetched[host][module]["status"]


                //if (document.querySelector(host).children.length == 0) {}
                


                divstr += `<div class=module isnew=${short["isNew"]} status=${short["content"]}>${module}</div>`;

                //previous status comparison
                //switch (short["content"]) {
                //    default:
                if (count > 1)
                    console.log(CompareLastStatus(short["content"],host,module.replaceAll(' ', '_'),rootWindow));
                //}
                //prevElement.innerHTML = "";
                prevElement.innerHTML += `<div id=${module.replaceAll(' ', '_')}>
                <div>${short["content"]}</div>
                <div>${short["isNew"]}</div>
                </div>`
            });
            
            alertStatus.innerHTML = divstr;   
            alert.appendChild(alertStatus);
        });
        

        alertholder.prepend(alert);
        //if there is a new alert, append it to the alert history
        /*if(newAlert) {
        alertholder.prepend(alert);
        
        }*/

    }

    
    //increases the event counter
   //if(newAlert) {   
        alert.setAttribute("rowcolor", count % 2);
        alert.innerHTML += `<div class=count>${count}</div>`;
        count++;
        rootWindow.document.querySelector("counter").innerHTML = count;
    //}*/
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

function statusLogic(fetched,host,overallisnew) {



}

//fetch functions with delay option to prevent blasting
function fetchDataWithDelay(url, fetchdelay=100) {
    return new Promise((resolve) => {
        setTimeout(() => {
            fetch(url)
                .then((response) => response.json())
                .then((data) => resolve(data))
                .catch((error) => {
                    console.error('Error fetching data:', error);
                    resolve(null); // Handle the error case as needed
                });
        }, fetchdelay); // 100ms delay
    });
}

async function fetchAllData(fetched,urls) {
    for (const u of urls) {
        const result = await fetchDataWithDelay(u);
        if (result) {
            fetched.push(result);
        }
    }
    return fetched;
    //console.log(fetched); // Process the fetched data as required
}

//handles popuplating the holder node for comparing previous status with new one

function CompareLastStatus(newstatus,ahost, amodule, parentDoc) {
    let qstr = ahost + " > #" + amodule;
    let oldstatus = parentDoc.document.querySelector("holder");
    console.log(newstatus,oldstatus);
    if (newstatus === oldstatus)
        return true;
    else
        return false 


}