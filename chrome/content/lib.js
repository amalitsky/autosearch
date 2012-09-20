function printObject(o) {
	var p, out = '';
	for (p in o) {
		if(o.hasOwnProperty(p)) {
			out += p + ': ' + o[p] + '\n';
			}
		}
	as.cons.logStringMessage(out);
	}

function pause(milliseconds) {
	var dt = new Date()
	while ((new Date()) - dt <= milliseconds) { /* Do nothing */ }
	}

function trim(str) {
	var regExp = /^(\s*)$/, dblSpaces= /(\s+)/;
	if(regExp.test(str)) { 
		str = str.replace(regExp, '');
		if(str.length == 0) { return str; } 
		}
	str = str.replace(/\s{2,}/g, ' ');
	//text = text.replace("\u0020{2,}", "\u0020");
	regExp = /^(\s*)([\W\w]*)(\b\s*$)/; 
	if(regExp.test(str)) { str = str.replace(regExp, '$2'); }
	return str;
	}

function showResults(url) {
  var
		wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator),
		browserEnumerator = wm.getEnumerator("navigator:browser"),
		found = false, reg = new RegExp("list"),
		browserWin, tabbrowser, numTabs, i, currentBrowser, recentWindow;
  
  // Check each browser instance for our URL  
  while (!found && browserEnumerator.hasMoreElements()) {  
		browserWin = browserEnumerator.getNext();
		tabbrowser = browserWin.gBrowser;
		// Check each tab of this browser instance  
		numTabs = tabbrowser.browsers.length;
		for (i = 0; i < numTabs; i++) {
			currentBrowser = tabbrowser.getBrowserAtIndex(i);
			if(reg.test(currentBrowser.currentURI.spec) || currentBrowser.currentURI.spec=="about:blank") {
				// The URL is already opened. Select this tab.
				tabbrowser.selectedTab = tabbrowser.tabContainer.childNodes[index];  
				// Focus *this* browser-window
				browserWin.focus();
				currentBrowser.loadURI(url);
				found = true;
				break;  
				}
			}
		}
  // Our URL isn't open. Open it now.  
	if (!found) {
		recentWindow = wm.getMostRecentWindow("navigator:browser");
		if (recentWindow) {
			// Use an existing browser window
			recentWindow.delayedOpenTab(url, null, null, null, null);
			}
		else {
			// No browser windows are open, so open a new one. 
			//window.open(url);
			}
		}  
	}

//timeDiff.setStartTime();
//alert(timeDiff.getDiff());
var timeDiff = {
	setStartTime:function (){ d = new Date(); time  = d.getTime(); },
	getDiff:function (){ d = new Date(); return (d.getTime()-time); }
	}

function checkAllPanePrefs(obj, paneName){
	"use strict";
	var
		prefPane = document.getElementById(paneName),
		arr = prefPane.getElementsByTagName('preference'),
		status = !obj.checked, i;
	for (i = 0; i<arr.length; i++) { arr[i].value = status; }
	}
	
function reloadAsSidebar(){
	var
		wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator),
		browserWindow = wm.getMostRecentWindow("navigator:browser"),
		sidebar = browserWindow.document.getElementById("sidebar").contentWindow;
	sidebar.location.reload();
	//as.virt.reload(); sidebar.as.form.init(as.virt.fields)
	return true;
	}
	
var myPrefObserver = {
	register: function() {
		var prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		this._branch = prefService.getBranch("extensions.as.form.")
		this._branch.QueryInterface(Components.interfaces.nsIPrefBranch2)
		// Finally add the observer.
		this._branch.addObserver("", this, false)
		},
		
	unregister: function() {
		if (!this._branch) return
		this._branch.removeObserver("", this)
	},

	observe: function(aSubject, aTopic, aData) {
	if(aTopic != "nsPref:changed") return
	var obj
	var obj2 = as.app.prefs.get("extensions.as.form."+aData)
	var val = obj2.value
	switch (aData) {
		case "yFrom": obj = as.app.prefs.get("extensions.as.form.yTo"); obj.value = val; break;
		case "prFrom": obj = as.app.prefs.get("extensions.as.form.prTo"); obj.value = val; break;
		case "runFrom": obj = as.app.prefs.get("extensions.as.form.runTo"); obj.value = val; break;
		case "volFrom": obj = as.app.prefs.get("extensions.as.form.volTo"); obj.value = val; break;
		case "powFrom": obj = as.app.prefs.get("extensions.as.form.powTo"); obj.value = val; break;
    }
  }
}

function WebMethod(url,request,callback){
	var
		http = new XMLHttpRequest(),
		mode = request?"POST":"GET";
	http.open(mode,url,true);
	http.setRequestHeader('Referer','http://all.auto.ru/extsearch/cars/used/');
	if(mode == "POST"){ http.setRequestHeader('Content-Type','application/x-www-form-urlencoded') }
	http.onreadystatechange = function(){ if(http.readyState == 4) { callback(http.responseText); } }
	http.send(request);
	}
	
function getElementsByTagNames(){
  "use strict";
  var res = new Array(), tmp = null, i, k;
  for(i = 0; i<arguments.length; i++){
		tmp = document.getElementsByTagName(arguments[i]);
		for(k = 0; k<tmp.length; k++) { res.push(tmp[k]); }
		}
  return res;
  }

function addTootlbarButton(){//adds an icon to the toolBarMenu after installation
	var
		navbar = as.mainWindow.document.getElementById("nav-bar"),
		tb = as.mainWindow.document.getElementById("as-toolbar-button"),
		urlbar = as.mainWindow.document.getElementById("urlbar-container");
	//&& as.app.prefs.get("extensions.as.showMenuButton")
	if (!tb){
		navbar.insertItem("as-toolbar-button", urlbar, null, null);
		try { BrowserToolboxCustomizeDone(true); } catch (e) {}
		}
	}