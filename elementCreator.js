function elementCreator(etype="div", eclass = "", eid = "", etext="",aname="",aval="") {

    let newElement = document.createElement(etype);

    
        if (!(eclass === "")) {newElement.className = eclass;}
        if (!(etext === "")) {newElement.innerText = etext};
        if (!(eid === "")) {newElement.id = eid.replace(" ","_")};
        if (!(aname === "" ) && !(aval === "" ) ) { newElement.setAttribute(aname.replace(" ","_"),aval) };
            
                
    return newElement
}
