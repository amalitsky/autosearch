function AS () {
	//this.virt = new Virt();
	this.init = function(){
		this.mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIWebNavigation).QueryInterface(Components.interfaces.nsIDocShellTreeItem).rootTreeItem.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIDOMWindow);
		this.sidebar = this.mainWindow.document.getElementById("sidebar").contentWindow
		var dbFile = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);  
		dbFile.append("asplug.sqlite")
		var storageService=Components.classes["@mozilla.org/storage/service;1"].getService(Components.interfaces.mozIStorageService)
		this.cons = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService)
		this.db = storageService.openDatabase(dbFile)
		this.app = Components.classes["@mozilla.org/fuel/application;1"].getService(Components.interfaces.fuelIApplication)
		this.dbTablesCheck()
		myPrefObserver.register()
		}
	
	this.initBar = function(){ this.init(); this.setSidebarWidth() }

	this.dbTablesCheck = function(){
		if(!this.db.tableExists("search_list"))
			this.db.executeSimpleSQL('CREATE TABLE "search_list" ("r_id" INTEGER PRIMARY KEY NOT NULL ,"r_name" TEXT NOT NULL ,"r_date" INTEGER NOT NULL )');
		if(!this.db.tableExists("searches"))
			this.db.executeSimpleSQL('CREATE TABLE "searches_upd" ("r_id" INTEGER PRIMARY KEY NOT NULL, "brand" INTEGER DEFAULT "0" NOT NULL, "model" VARCHAR(255), "bodyt" INTEGER, "color" INTEGER, "yFrom" INTEGER, "yTo" INTEGER, "prFrom" INTEGER, "prTo" INTEGER, "runFrom" INTEGER, "runTo" INTEGER, "volFrom" INTEGER, "volTo" INTEGER, "powFrom" INTEGER, "powTo" INTEGER, "gear" INTEGER DEFAULT "0" NOT NULL, "wheel" INTEGER, "drvGear" INTEGER, "engType" INTEGER DEFAULT "0" NOT NULL, "cond" INTEGER, "cust" INTEGER, "owners" INTEGER, "change" INTEGER, "country" INTEGER DEFAULT "0" NOT NULL, "region_id" VARCHAR(255), "city_id" INTEGER, "seller" INTEGER DEFAULT "0" NOT NULL, "pubDates" INTEGER DEFAULT "0" NOT NULL, "avail" INTEGER, "output" INTEGER DEFAULT "1" NOT NULL, "sortBy" INTEGER DEFAULT "1" NOT NULL, "hasPhoto" BOOL DEFAULT "0" NOT NULL, "hasCert" BOOL, "curr" varchar(255) DEFAULT "RUR" NOT NULL, "opt_srs" INTEGER, "opt_sec" BOOL DEFAULT "0" NOT NULL, "opt_abs" BOOL DEFAULT "0" NOT NULL, "opt_tcs" BOOL DEFAULT "0" NOT NULL, "opt_esp" BOOL DEFAULT "0" NOT NULL, "opt_ksen" BOOL DEFAULT "0" NOT NULL, "opt_gur" INTEGER, "opt_av" INTEGER, "opt_cond" INTEGER, "opt_omivFar" BOOL DEFAULT "0" NOT NULL, "opt_elZerk" BOOL DEFAULT "0", "opt_luk" BOOL DEFAULT "0", "opt_dd" BOOL DEFAULT "0" NOT NULL, "opt_ds" BOOL DEFAULT "0" NOT NULL, "opt_obogZerk" BOOL DEFAULT "0" NOT NULL, "opt_park" BOOL DEFAULT "0" NOT NULL, "opt_pc" BOOL DEFAULT "0" NOT NULL, "opt_cz" BOOL DEFAULT "0" NOT NULL, "opt_cruize" BOOL DEFAULT "0" NOT NULL, "opt_int" INTEGER, "opt_intColor" INTEGER, "opt_elStekl" INTEGER, "opt_wheelAdj" INTEGER, "opt_drvSeat" INTEGER, "opt_passSeat" INTEGER, "opt_obogSid" BOOL DEFAULT "0" NOT NULL, "opt_ton" BOOL DEFAULT "0" NOT NULL, "opt_gbo" BOOL DEFAULT "0" NOT NULL, "opt_disks" BOOL DEFAULT "0" NOT NULL);');
		for (var i = 997; i < 1000; i++) {
			try {this.db.executeSimpleSQL('INSERT INTO "searches" (r_id) VALUES ("'+i+'");')}
			catch (e) { /*as.cons.logStringMessage('AS.dbTablesCheck уже есть системная запись с id:'+i+' в БД')*/ }
			}
		}

	this.setSidebarWidth = function(){
	  window.top.document.getElementById("sidebar-splitter").hidden = true
	  window.top.document.getElementById("sidebar-box").width = 365
	  }
	}
	
function firstRun(extensions) {
	let extension = extensions.get('asearch@icode.ru')
	if (extension.firstRun) { try { addTootlbarButton() } catch(e) {} }
	}

if (Application.extensions) firstRun(Application.extensions);
else Application.getExtensions(firstRun)