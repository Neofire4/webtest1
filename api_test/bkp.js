document.addEventListener ("DOMContentLoaded", (event) => {

    
    let counter = document.createElement("counter");
    document.querySelector(".container").appendChild(counter);
    
    const x = document.querySelector("#alertsview");
    
    counter.innerHTML = 1;
    let event_count = 1;


    document.querySelector("body > div > nav").innerHTML = "Loaded";
    setInterval(() => {
       loop(x,Number(counter.innerHTML));
        },5000) ;


    
//setInterval(loop,5000,x,event_count);

})


//the main loop function, takes the alertsview element, and event count variable
//fetches the status from the server, parses to a object and evaluates status to display
//based on the json object results
async function loop(sel="", count) {

    const url = "serverhost1.json"
    let ele = document.createElement("div");
    let d = new Date();
    let noupdate = false;
    d = formatTime(d);

    ele.setAttribute("class", "alertentry");

    //fetch handling
    fetched = await fetchData(url).then(response => response.json())
    .then(data => {
        return data
    })
    .catch(error => {
    console.error('Error fetching data:', error);
    }); 

    ele.innerHTML = `<div class=time><b>${d[0]}<br>${d[1]} GMT</b></div>`;
    //sel.prepend(ele);
    
    if (fetched === "") {
        console.log("Fetch Empty")
    } else {
        Object.keys(fetched).forEach((host) => {
            let alertm = document.createElement("div");
            let divstr = "";
            let overall = 0;
            let isnew = false;
            alertm.setAttribute("class", "alert");
            alertm.setAttribute("overall", overall);

            divstr = `<div class=host>${host}:&nbsp;</div>`
            //alertm.innerHTML = divstr;

            //the host modules
            Object.keys(fetched[host]).forEach( (module) => {
                let status = fetched[host][module]["info"];
                let unknown =  fetched[host][module]["info"]["status"];
                if (status["isnew"] == 1) {
                    isnew = true;
                    switch (status["status"]) {
                        
                        case "FAILURE":
                            overall = 1;
                            alertm.setAttribute("overall", overall);
                            alertm.setAttribute("new", true);
                            ele.setAttribute("linecolor","red");
                            break;
                        case "SUCCESS":
                            alertm.setAttribute("new", true);
                            break;
                        default:
                            overall = 1;
                            console.log(`status invalid, setting unknown: ${status["status"]}`)
                            alertm.setAttribute("overall", overall);
                            alertm.setAttribute("new", true);
                            ele.setAttribute("linecolor","red");
                            unknown = "UNKNOWN";
                            break;
                            
                    }
                    console.log("isnew")
                    divstr += `<div class=module status=${unknown} state=${isnew}>${module}</div>`;
                    //divstr += `<div class=module status=${status['status']} state=${isnew}>${module}</div>`;
                } else if (status["status"] === "FAILURE" | unknown === "UNKNOWN") {
                    console.log(unknown);
                    overall = 1;
                    console.log("isnew2");
                    alertm.setAttribute("overall", overall);
                    divstr += `<div class=module status=${unknown}>${module}</div>`;
                    //divstr += `<div class=module status=${status['status']}>${module}</div>`;
                }
            
            });

            alertm.innerHTML = divstr;
            
            //creates alert if there is a new status, ignores subsequent success, only repeats failures
            if (isnew | overall >= 1) {
                ele.prepend(alertm);
                console.log("isnew | overall >= 1")

            }
            //if there are no new statuses and no overall, no alerts will be made
            if (!isnew && overall == 0) {
                noupdate = true;
                console.log("!isnew && overall == 0")
            }
        })
    
    
        if (!noupdate) {
        ele.setAttribute("rowcolor", count % 2);

        ele.innerHTML += `<div class=count>${count}</div>`;
        count++;
        document.querySelector("body > div > counter").innerHTML = count;
        sel.prepend(ele);
        noupdate = false;
        } else {
            console.log("no new alerts");
            console.log(count)
        }
    }
}

//fetches the data, is called by loop()
function fetchData(url) {
   return fetch(window.origin + `/${url}`)
}

//function to format the date correctly, takes a Date() object
function formatTime(date="") {

    let mdy = date.toLocaleDateString('en-us', {day:"numeric", month:"short", year:"numeric", timeZone: 'Europe/London' });
    let time = date.toLocaleTimeString('en-gb', { timeZone: 'Europe/London' });

    return [mdy, time]
}