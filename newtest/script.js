var b1 = document.querySelector("#b1");
var db = document.querySelector("#databox");
var fh = document.querySelector("#fetchholder");
var status_result = "";
const delay = 20;
json_url = "http://127.0.0.1:8080/resource/";

async function getModuleStatus(site="US") {
    try {
        const response = await fetch(json_url + `${site}.json`); 
        if(!response.ok) {
            throw new Error("Response not ok");
        }
        
        const status = await response.json();
        
        document.querySelector("#fetchholder").innerText = JSON.stringify(status);
        return status;

    } catch (error) {
        console.error("There was a problem with the request: ", error);
    }
}

function createEle (ele="div") {

    let newEle = document.createElement(ele);
    newEle.textContent = "";
    return newEle;
}

function createModule(status) {

    let z = createEle();
    let c = 0;
    for (i in status) {
        
        let x = createEle();
        let y = createEle("label")

        x.innerText = status[i]['name'] + ":";

        if (c >= 1) { 
           // x.setAttribute("id", `${status['site']['name']}_` + `${status[i]['name']}`);
            x.appendChild(y);
            y.setAttribute("id", `${status['site']['name']}_` + `${status[i]['name']}_` + "status")
            y.innerText =`${status[i]['status']}`;

        };

        z.appendChild(x)
        c++;
    }

    document.querySelector("#databox").appendChild(z)
}



function theLoop (ele) {
    ele.appendChild(createModule());
    
}

function setModuleStatus() {

}

window.addEventListener("message", (event) => {
    console.log(`Received message: ${event.data}`);
  });

//initial load
// document.addEventListener("DOMContentLoaded", (event) => {
//     fh.textContent = "";
//     getModuleStatus("NL").then( (value) => {});
    
//     setTimeout(function(){
//         status_result = JSON.parse(fh.innerText);
//         //console.log(status_result);
//         createModule(status_result);
//         getModuleStatus("US").then( (value) => {});
//         setTimeout(function(){
//             status_result = JSON.parse(fh.innerText);
//             //console.log(status_result);
//             createModule(status_result);
//             },delay);
//         },delay);
    
    

    


    //if (fh.innerText === "") { console.log("modules not created")};

//});








//setInterval(theLoop, 1000, db);

