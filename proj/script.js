"use strict";

function kickOff(context="all") {

	const refresh = 5000;
	//const a_hosts = ["serverhost1","serverhost2","serverhost3"]
	const a_hosts = ["serverhost1"]
	const b_hosts = ["serverhost1","serverhost3"];
	const b_modules = ["Message"];
	
	document.querySelector("#bar").style.animation = "none";
	document.querySelector("#bar").offsetHeight;
	document.querySelector("#bar").style.animation = null;
	document.querySelector("#bar").style.animationDuration = `${refresh}ms`;

	document.querySelector("#context").innerText = `Monitoring Area: ${context} `;


	

	const intervalID = setInterval(() => {
		loop(intervalID,refresh,context,a_hosts);
	},refresh);


}


//the main loop function
/*
interval - the setInterval ID, used to exit the setInterval function.
refresh - the amount of time in ms before a refresh will occur. defaults 10000ms
context - the enviroment of specific hosts & rules to show alerts for. defaults "all"
hostlist - the array list of hosts to fetch alerts for. used by the fetchAllData function. defaults an empty array
special_modules - modules that have special alert rules. defaults an empty array

This function takes a list of hosts, fetches their status data and stores it in an object. It then loops through each host's fetched data and modules in the object and 
creates an alert if certain conditions are met. If conditions are met, the alert will be appended to the main web interface with each host and module status.


*/
async function loop(interval,refresh=10000,context="all",hostlist=[],special_modules=[]) {

	
	//const url = a_hosts;
	//hostlist & holder element selector declarations
	const counter = document.querySelector("#counter");
	const holder = document.querySelector("#holder");
	const timerIds = [];
	//num used for the alert count
	let num = Number(counter.innerText);

	//d is used for the alert timestamp
	let d = new Date();

	//newAlert is used for determining if there is a new alert
	let newAlert = 0;

	//alertline holds a timestamp, alertbody, and a count
	const alertline = elementCreator("div","alertline","","","data-numbering","0");
	//alertbody holds one or more alert items (one per host in fetched data)
	const alertbody = elementCreator("div","alertbody");


	//alert line time stamp format & creation
	d = formatTime(d)
	const alert_time = elementCreator("div","alert_time","",`${d[0]}\n${d[1]} GMT`);
	const alert_number = elementCreator("div","alert_number","",num);

	alertline.appendChild(alertbody);

	//console.log("Context is", context, "interval is",interval, "refresh is", refresh)

	//triggers the refresh bar to run at the start
	document.querySelector("#bar").style.animation = "none";
	document.querySelector("#bar").offsetHeight;
	document.querySelector("#bar").style.animation = null;
	document.querySelector("#bar").style.animationDuration = `${refresh}ms`;



	/*const fetched = await fetchData(url).then(response => response.json())
    .then(data => {
        return data;
    })
    .catch(error => {
    console.error('Error fetching data:', error);
    }); */


	const fetched = await fetchAllData(hostlist);


	//console.log(fetched);

	
	try {


		//loops through the hosts
		Object.keys(fetched).forEach( (host) => {

			//the overall alert color
			let overallstatus = 0;
			//declaration for previous status holder elemnt
			let prevstat = "";

			const moduleCount = {"red":0,"green":0,"other":0,"total":(Object.keys(fetched[host]).length)};

			//console.log(host, moduleCount);
			//a boolean that changes to true if the overall host status has changed
			let changed = false;
			
			//alert alertitems is the container for the host and module elements
			const alertitems = elementCreator("div","alertitems","","","data-overall","0");
			
			//alerthost is the host name element
			const alerthost = elementCreator("div","host","",host);

			

			//checks if previous comparison status node is present, if not it will create and append the node to the holder element
			document.querySelector(host) ?? holder.appendChild(elementCreator(host,"","",""));
				

			prevstat = document.querySelector(host) 
			
			//shortend reference for host previous status element
			//prevstat = document.querySelector(host);


			//loops through the each module of the host
			Object.keys(fetched[host]).forEach( (module) => {
				
				//shortened references to fetched data 
				const mod = fetched[host][module];
				const stats = fetched[host][module].status
				let modalert = false
				let newredalert = false;
				//makes the module name html compatible (removes spaces from name)
				let statm = module.replaceAll(" ", "_");

				//dynamically create a query selector for the previous status module selector
				let qstr = `${host} > ${statm}`;
			
				let qnode = document.querySelector(qstr);

				
				
				//alertmodule declaration, holds the module name
				let alertmodule = "";
				
				
				//checks if previous status module exists to compare with new status
				if (qnode) {

					//defines alermodule to new fetched status
					//

					if (mod.status.content === "FAILURE" && qnode.dataset.laststatus == "SUCCESS") {
						console.log(host,module, " SUCCESS to FAILURE detected")
						moduleCount["red"] += 1;
						modalert = true;
						newredalert = true;
						newAlert++;
					}
					else if (mod.status.content === "FAILURE" && qnode.dataset.laststatus == "FAILURE") {
						
						if (mod.statustime === qnode.dataset.lasttime){
							
							console.log(host,module, "repeat FAILURE to FAILURE detected")
						}else {
							console.log(host,module, "new FAILURE to FAILURE time detected")
							newAlert++;
							newredalert = true;
						}
						moduleCount["red"] += 1;
						modalert = true;
	

					} else if (mod.status.content === "SUCCESS" && qnode.dataset.laststatus == "FAILURE") {
						console.log(host,module, " FAILURE to SUCCESS detected")
						moduleCount["green"] += 1;
						modalert = true;
						newAlert++
					} else {
						console.log(host,module, ` ${qnode.dataset.laststatus} to ${mod.status.content} detected`)
						moduleCount["other"] += 1;
					}




					//console.log(host, moduleCount);
					//update previous status for next run
					qnode.dataset.laststatus = stats.content;
					qnode.dataset.lasttime = mod.statustime;
				
				
				
				} else {
					prevstat.appendChild( elementCreator(statm,"","","","data-laststatus",stats.content,"data-lasttime",mod.statustime) );
					
					document.querySelector(qstr).setAttribute("data-repeatfail", true)

					if(mod.status.content === "FAILURE") {
						console.log(host,module, " initial to FAILURE detected")
						alertmodule = elementCreator("div","module","",module,"data-status",mod.status.content,"data-time",mod.statustime,"data-nextrun",mod.NextRunTime)
						moduleCount["red"] += 1;
						modalert = true;
						newAlert++;
						//prevstat.setAttribute("data-lastoverall",1);
					}
					//alertmodule = elementCreator("div","module","",module,"data-status",mod.status.content,"data-time",mod.statustime,"data-nextrun",mod.NextRunTime)
				} 

				
				//if (modalert) {
					alertmodule = elementCreator("div","module","",module,"data-status",mod.status.content,"data-time",mod.statustime,"data-nextrun",mod.NextRunTime)
					alertmodule.setAttribute("data-newredalert", newredalert)
					alertitems.append(alertmodule);
					changed = true;
				//}


			}); //end module loop


			//appends elements to eachother if there has been a change in status
			//if (changed) {
				//console.log("changed",host)
				if (moduleCount["red"] > 0 || moduleCount["red"] > moduleCount["green"]) {
					prevstat.dataset.lastoverall == 1 ? alertitems.dataset.overall = 2 : alertitems.dataset.overall = 1
/*						alertitems.dataset.overall = 2
					else
						alertitems.dataset.overall = 1;*/
				}

				alertitems.prepend(alerthost);
				alertbody.appendChild(alertitems);

				prevstat.setAttribute("data-lastoverall",alertitems.dataset.overall)
			//}

			
		});// end host loop

		//if newAlert counter is 1 or more, creates a new alertline to display
		//if (newAlert > 0) {
			alertline.prepend(alert_time);
			alertline.appendChild(alertbody);
			alertline.appendChild(alert_number);

			alertline.dataset.numbering = num % 2;

			document.querySelector("#alert_holder").prepend(alertline);

			counter.innerHTML = num + 1;
		//}

		

	} catch (error) {
		console.error("there was a problem with the fetched data",error);
	}

	document.querySelector("#refreshts").innerText = `Last Refresh: ${d[0]} ${d[1]} GMT`;

}


//the initial set up function, if a url param is not a specified value (the ?context= value), will show a overlay for choosing the enviroment
//if invalid context is detected, will default to all
//there are 3 contexts "all", "A", "B"
//"all" shows all alerts all modules, no filtering.
//"A" shows only A specific host alerts and modules, will not show all or B alerts, excludes b_modules & b_hosts.
//"B" shows only B specific host alerts and modules, excludes a_hosts, and only alerts for specific modules in b_modules.
function setup() {
	

	let st = new Date()
	st = formatTime(st);
	const welcome = document.querySelector("#welcome");
	let  urlParams = new URLSearchParams(window.location.search);
	let con = "";

	console.log(urlParams.keys());

	//checks for url parameters to set profile
	switch(urlParams.getAll("context").length) {

		//if no url param specified, display splash selection and add event listener to buttons to launch kickoff
		case 0:
			document.querySelectorAll(".context").forEach( (btn) => {
				btn.addEventListener("click", () => {
					btn.dataset.context.match(/^(A|B)$/) ? con = btn.dataset.context : con = "all";
					document.querySelector("#welcome").className = "welcomeAni";
					kickOff(con);
				},{ once: true })
			});
			break;
		//if valid url param specified, set profile to that param (A or B) 
			case 1:
			urlParams.getAll("context")[0].match(/^(A|B)$/) ? con = urlParams.getAll("context")[0] : con = "all";
			welcome.style.display = "none";
			kickOff(con);
			break
		//if invalid param is specified, defaults to all profile
		default:
			con = "all";
			welcome.style.display = "none";
			kickOff(con);
			break

	}
	//appends the start time
	document.querySelector("#start").innerText = `Start Time: ${st[0]}, ${st[1]} GMT`;
}


/////Helper functions


//formats date to a specific format
function formatTime(date="") {

	let mdy = date.toLocaleDateString('en-us', {day:"numeric", month:"short", year:"numeric", timeZone: 'Europe/London' });
	let time = date.toLocaleTimeString('en-gb', { timeZone: 'Europe/London' });

	return [mdy, time];
}

//creates a new element and allows optional setting of class, id, inner text, and 3 attributes
function elementCreator(etype="div", eclass = "", eid = "", etext="",aname1="",aval1="",aname2="",aval2="",aname3="",aval3="") {

	let newElement = document.createElement(etype);


	if (!(eclass === "")) {newElement.className = eclass}
	if (!(etext === "")) {newElement.innerText = etext}
	if (!(eid === "")) {newElement.id = eid.replaceAll(" ","_");}
	if (!(aname1 === "" ) && !(aval1 === "" ) ) { newElement.setAttribute(aname1.replaceAll(" ","_"),aval1) }
	if (!(aname2 === "" ) && !(aval2 === "" ) ) { newElement.setAttribute(aname2.replaceAll(" ","_"),aval2) }
	if (!(aname3 === "" ) && !(aval3 === "" ) ) { newElement.setAttribute(aname3.replaceAll(" ","_"),aval3) }
		
			
	return newElement
}

//fetches a single data file
function fetchData(url) {
	return fetch(window.origin + `/${url}`);

}

//fetches a multiple  data files
async function fetchAllData(urls=[]) {
    const fetched = {};
	for (const u of urls) {
		// fetched[u] = {};
        const result = await fetchDataWithDelay(u);
        if (result) {
			fetched[u] = result;
			
            //fetched.push(result);
        }
    }
    return fetched;
}


//fetch functions with delay option to prevent blasting
function fetchDataWithDelay(url, fetchdelay=100) {
    return new Promise((resolve) => {
        setTimeout(() => {
            fetch(window.origin + `/module/${url}`)
                .then((response) => response.json())
                .then((data) => {resolve(data)})
                .catch((error) => {
                    console.error('Error fetching data:', error);
                    resolve(null); // Handle the error case as needed
                });
        }, fetchdelay); // 100ms delay
    });
}


function createMe(name, attributes={},text=null) {

    let ele = document.createElement(name);

	if (text) {
		ele.innerText = text;
	}

    if (Object.keys(attributes).length > 0) {
        Object.keys(attributes).forEach((attr) => {
			let an = "";let av = "";
			switch (attr) {

				case "class":
					an = "class"
					av = String(attributes[attr])
					break
				case "id":
					an = "id";
					av = String(attributes[attr]).replaceAll(" ", "_");
					break
				default:
					an = String(attr).replaceAll(" ", "_");
					av = String(attributes[attr]).replaceAll(" ", "_");
					    
					
			}

			ele.setAttribute(an,av);

        })       
    } else {
        console.log("no attributes specified");
    }
 
	return ele
}

//When document loads, begin setup
document.addEventListener ("DOMContentLoaded", () => {
	
	let x = createMe("div",{"class":"hello 123","data-numbers":"%", "data-dog":"true"})

	document.body.appendChild(x);

	setup();
});

