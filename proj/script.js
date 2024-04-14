"use strict";

document.addEventListener ("DOMContentLoaded", (event) => {
	setup();
});



function kickOff(context="all") {

	const refresh = 5000;
	const a_hosts = ["serverhost1","serverhost2","serverhost3"]
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

			//a boolean that changes to true if the overall host status has changed
			let changed = false;
			
			//alert alertitems is the container for the host and module elements
			const alertitems = elementCreator("div","alertitems","","","data-overall","0");
			
			//alerthost is the host name element
			const alerthost = elementCreator("div","host","",host);

			

			//checks if previous comparison status node is present, if not it will create and append the node to the holder element
			if (!(document.querySelector(host)) )
				holder.appendChild(elementCreator(host,"","",""));

			
			//shortend reference for host previous status element
			prevstat = document.querySelector(host);


			//loops through the each module of the host
			Object.keys(fetched[host]).forEach( (module) => {
				
				//shortened references to fetched data 
				const mod = fetched[host][module];
				const stats = fetched[host][module].status
				
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
					alertmodule = elementCreator("div","module","",module,"data-status",mod.status.content,"data-time",mod.statustime,"data-nextrun",mod.NextRunTime)


					//checks if the new status has changed from the previous, if true creates an alert if specific conditions are met
					if ( !( (qnode.dataset.lasttime + qnode.dataset.laststatus) === (mod.statustime + mod.status.content) )  ){
						
						if (!(mod.status.content === qnode.dataset.laststatus)) {
							changed = true;
							switch (mod.status.content) {
								case "SUCCESS":
									newAlert++;
									break;
								case "FAILURE":
									overallstatus = 1
									newAlert++;
									break;
								case "UNKNOWN":
									overallstatus = 3
									newAlert++;
									break;
								default:
									overallstatus = 0
									newAlert++;
									break;
							}
						} else {
							changed = true;
							switch (mod.status.content) {
								case "FAILURE":
									overallstatus = 1
									newAlert++;
									break;
								default:
									console.log("default", module);
									break;
							}
						}

						alertitems.dataset.overall = overallstatus;
						alertitems.appendChild(alertmodule);
					}

				
				} 

				//checks if previous status module to compare does not exist, then creates it and creates a new alert (this allows the initial alerts created on start up to display)
				if (!(qnode) ) {
					prevstat.appendChild( elementCreator(statm,"","","","data-laststatus",stats.content,"data-lasttime",mod.statustime) );
					alertmodule = elementCreator("div","module","",module,"data-status",mod.status.content,"data-time",mod.statustime,"data-nextrun",mod.NextRunTime)
					changed = true;
					newAlert++;
					
					switch (mod.status.content) {
						case "SUCCESS":
							newAlert++;
							break;
						case "FAILURE":
							overallstatus = 1
							newAlert++;
							break;
						case "UNKNOWN":
							overallstatus = 3
							newAlert++;
							break;
						default:
							console.log("new default", module);
							overallstatus = 0
							newAlert++;
							break;
					}
					
					alertitems.dataset.overall = overallstatus;
					alertitems.appendChild(alertmodule);
				} else {
					//console.log("else qnode",host)
					qnode.dataset.laststatus = stats.content;
					qnode.dataset.lasttime = mod.statustime;
				}


			}); //end module loop


			//appends elements to eachother if there has been a change in status
			if (changed) {
				console.log("changed",host)
				alertitems.prepend(alerthost);
				alertbody.appendChild(alertitems);
			}

			
		});// end host loop

		//if newAlert counter is 1 or more, creates a new alertline to display
		if (newAlert > 0) {
			alertline.prepend(alert_time);
			alertline.appendChild(alertbody);
			alertline.appendChild(alert_number);

			alertline.dataset.numbering = num % 2;

			document.querySelector("#alert_holder").prepend(alertline);

			counter.innerHTML = num + 1;
		}

		

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


	if (urlParams.getAll("context").length == 0) {


		document.querySelectorAll(".context").forEach( (btn) => {
			btn.addEventListener("click", () => {
				switch (btn.dataset.context) {

					case "A":
						con = btn.dataset.context;
						break;
					case "B":
						con = btn.dataset.context;
						break;

					default:
						//console.log("invalid context detected:", btn.dataset.context, "setting to all")
						con = "all";
						break;
				
				}

				document.querySelector("#welcome").className = "welcomeAni";
				kickOff(con);

			})


		});

	} else if (urlParams.getAll("context").length == 1) {
		
		switch (urlParams.getAll("context")[0]) {
			
			case "A":
				con = urlParams.getAll("context")[0];
				break;
			case "B":
				con = urlParams.getAll("context")[0];
				break;

			default:
				//console.log("invalid context detected:", urlParams.getAll("context")[0], "setting to all")
				con = "all";
				break;
			}
		
		
		welcome.style.display = "none";
		kickOff(con);
	
	} else {
		//console.log("Invalid context detected:", urlParams.getAll("context")[0], "setting to all")
		con = "all";
		welcome.style.display = "none";
		kickOff(con);
	}

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
	if (!(eid === "")) {newElement.id = eid.replace(" ","_");}
	if (!(aname1 === "" ) && !(aval1 === "" ) ) { newElement.setAttribute(aname1.replace(" ","_"),aval1) }
	if (!(aname2 === "" ) && !(aval2 === "" ) ) { newElement.setAttribute(aname2.replace(" ","_"),aval2) }
	if (!(aname3 === "" ) && !(aval3 === "" ) ) { newElement.setAttribute(aname3.replace(" ","_"),aval3) }
		
			
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
            fetch(window.origin + `/${url}`)
                .then((response) => response.json())
                .then((data) => {resolve(data)})
                .catch((error) => {
                    console.error('Error fetching data:', error);
                    resolve(null); // Handle the error case as needed
                });
        }, fetchdelay); // 100ms delay
    });
}



