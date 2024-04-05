//var myWindow = null;
var opened = false
plug = document.createElement("button");
plug.id = "plug";
plug.innerText = "Clickee";
document.querySelector("main").appendChild(plug);
const json_url = "http://127.0.0.1:8080/resource/";


const testdata1 = {"serverhost1":{"module1":{"name":"ConnCheck","info":{"status":"SUCCESS","isnew":"1"},"body":"This is the expanded info section","time":"2024-04-04T23:09:14.018Z"},"module2":{"name":"TCP CHeck","info":{"status":"SUCCESS","isnew":"1"},"body":"This is the expanded info section","time":"2024-04-04T23:09:14.018Z"}}};
const testdata2 = {"serverhost2":{"module1":{"name":"HealthCheck","info":{"status":"SUCCESS","isnew":"1"},"body":"This is the expanded info section","time":"2024-04-04T23:09:14.018Z"},"module2":{"name":"Run CHeck","info":{"status":"SUCCESS","isnew":"1"},"body":"This is the expanded info section","time":"2024-04-04T23:09:14.018Z"}}};
const hostnames = ["serverhost1","serverhost2"];
//setTimeout(function () {

 //   myWindow = window.open(window.origin + "/resource/", "_blank", "popup");

//}, 5000);


plug.addEventListener("click", (event) => {
    //if(!myWindow) {
        //const myWindow = window.open(window.origin + "/popup", "_blank", "popup");
        main_loop();
       // myWindow.onload = (event) => {
        //    main_loop(myWindow);
        //  };


       // } else if (myWindow.closed)
        //    myWindow = window.open(window.origin + "/popup", "_blank", "popup");
  });




async function main_loop(pwindow="") {
    const db = document.querySelector("#databox");


   // const status = await getModuleStatus("serverhost1");
    
    const rstatus = [testdata1, testdata2];
    const x = rstatus.length;

    let fetchTimes = new Date()

    //document.querySelector("#fetchholder").innerHTML += ("<div>" + JSON.stringify(status) + "</div");

    //for (let i = 0; i < x;i++) {
    //createAlert(status[i],status[i],dateform());
    //createAlert(status,"serverhost1",dateform());
    //}
    createAlert(rstatus,hostnames,dateform());
}

function dateform() {
    
    function addZeroBefore(n) {
        return (n < 10 ? '0' : '') + n;
      }
    
    let stamp = "";
    let date = new Date();

    stamp = (date.getUTCFullYear() + "-" +addZeroBefore(date.getUTCDate())+ "-" + addZeroBefore(date.getUTCDay())
     + " " + addZeroBefore(date.getUTCHours()) + ":" + addZeroBefore(date.getUTCMinutes()) +":"+  addZeroBefore(date.getUTCSeconds()) + " GMT" );
    
    return stamp;
}


async function getModuleStatus(hostname="") {
    console.log("fetching " +  hostname)
    try {
        const response = await fetch(json_url + `${hostname}.json`); 
        if(!response.ok) {
            throw new Error("Response not ok");
        }
        
        const status = await response.json();
        
        //document.querySelector("#fetchholder").innerText = JSON.stringify(status);
        return status;

    } catch (error) {
        console.error("There was a problem with the request: ", error);
    }
}

//creates the alert, params take json object or array of objects, a string hostname, and a timestamp
function createAlert(statusObj="",hostname="",ctime = "") {
//    console.log(statusObj,hostnames,statusObj.length);
//    if (statusObj.length > 0) {
 //       console.log("ARRAY");
 //   } else 
  //  console.log("NOT ARRAY");

    let line = document.createElement("div"); line.setAttribute("class", "data_line");
    let timestamp = document.createElement("div"); timestamp.setAttribute("class", "dl_time"); timestamp.innerText = ctime

    
    line.appendChild(timestamp);

    


    if (statusObj.length > 0) {
        
        for (let i = 0; i <= statusObj.length-1; i++){
        localJob(statusObj[i],hostname[i],line)
        console.log("going");
        }
    } else 
        localJob(statusObj,hostname,line)
    //return line*/
}

function localJob(obj, hn,ele) {
    for (let i in obj) {
        console.log(i)
        let overall = "";
        let divStr = ""
        let status = "";
        let module = "";

        let ehostname = document.createElement("div"); ehostname.setAttribute("class", "host"); ehostname.innerText = hn;
        let holder = document.createElement("div"); holder.setAttribute("class", "sholder");

        ele.appendChild(ehostname);
        ele.appendChild(holder);
        

        for (let j in obj[hn]) {
            module = obj[hn][j]["name"]
            status = obj[hn][j]["info"]["status"];
            
            if (obj[hn][j]["info"]["status"] == "FAILURE")
                overall = "FAILURE";
            else
                overall = "SUCCESS";
            divStr += `<div class='module' status=${status}>${module}</div>`
            
        }
        holder.innerHTML = divStr;
        document.querySelector("#databox").prepend(ele)

    }
}
