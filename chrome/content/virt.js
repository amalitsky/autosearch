function Virt (as){
	this.init = function(){
		this.closedId = as.app.prefs.get('extensions.as.lastClosedId')
		this.closedName = as.app.prefs.get('extensions.as.lastClosedName')
		this.r_id = this.name = this.r_name = ''
		this.fields = [['brand',,'mark_id',1], ['model',,'groups[]',2], ['bodyt',,'body_key',1],
		['color',,'color_id',1], ['country',,'country_id',1], ['region_id',,'region[]',2],
		['city_id',,,1], ['yFrom',,'year[1]',1], ['yTo',,'year[2]',1], ['prFrom',,'price_usd[1]',0],
		['prTo',,'price_usd[2]',0], ['runFrom',,'run[1]',0], ['runTo',,'run[2]',0],
		['volFrom',,'engine_volume[1]',0], ['volTo',,'engine_volume[2]',0], ['powFrom',,'engine_power[1]',0],
		['powTo',,'engine_power[2]',0], ['gear',,'transmission_key',1], ['wheel',,'wheel_key',1],
		['drvGear',,'drive_key',1], ['engType',,'engine_key',1], ['cond',,'used_key',1],
		['cust',,'custom_key',1],	['owners',,'owner_pts',1], ['change',,'change_key',1],
		['currency_key','curr',,1], ['seller',,'client_id',1], ['pubDates',,'stime',1],
		['avail',,'available_key',1], ['output',,'output_format',1], ['sortBy',,'sort_by',1],
		['hasPhoto',,'has_photo',3], ['hasCert',,'is_certificate',3],
		['opt_srs',,'extras[18]',1], ['opt_sec',,'extras[16]',3], ['opt_abs',,'extras[1]',3], ['opt_tcs',,'extras[2]',3],
		['opt_esp',,'extras[23]',3], ['opt_ksen',,'extras[9]',3], ['opt_gur',,'extras[25]',1], ['opt_av',,'extras[12]',1],
		['opt_cond',,'extras[7]',1], ['opt_omivFar',,'extras[15]',3], ['opt_elZerk',,'extras[28]',3], ['opt_luk',,'extras[11]',3],
		['opt_dd',,'extras[5]',3], ['opt_ds',,'extras[6]',3], ['opt_obogZerk',,'extras[13]',3], ['opt_park',,'extras[17]',3],
		['opt_pc',,'extras[3]',3], ['opt_cz',,'extras[27]',3], ['opt_cruize',,'extras[8]',3], ['opt_int',,'extras[22]',1],
		['opt_intColor',,'extras[26]',1], ['opt_elStekl',,'extras[29]',1], ['opt_wheelAdj',,'extras[20]',1], ['opt_drvSeat',,'extras[19]',1],
		['opt_passSeat',,'extras[21]',1], ['opt_obogSid',,'extras[14]',3], ['opt_ton',,'extras[24]',3], ['opt_gbo',,'extras[4]',3],
		['opt_disks',,'extras[10]',3]] //[name, dbName, getName, inputType], !порядок важен!
		this.parseBeforeGet = {
			currency_key: ['RUR','USD','EUR'],
			output: [1,2], sortBy: [1,2,3,4], opt_sec: [0,32], opt_abs: [0,64],
			opt_tcs: [0,57], opt_esp: [0,56], opt_ksen: [0,28], opt_omivFar: [0,19],
			opt_elZerk: [0,41], opt_luk: [0,27], opt_dd: [0,24], opt_ds: [0,23],
			opt_obogZerk: [0,52], opt_park: [0,21], opt_pc: [0,35], opt_cz: [0,29],
			opt_cruize: [0,53], opt_obogSid: [0,51], opt_ton: [0,31], opt_gbo: [0,22],
			opt_disks: [0,33], opt_srs: [0,62,63,61], opt_gur: [0,30,58],
			opt_av: [0,40,38,36,39], opt_cond: [0,54,55,12,11], opt_int: [0,25,26,14,20],
			opt_intColor: [0,59,60], opt_elStekl: [0,42,43], opt_wheelAdj: [0,44,45,18], 
			opt_drvSeat: [0,49,48,50], opt_passSeat: [0,46,47]} //костыль для подготовки get запроса
		this.db2defVals()
		this.loadFields()
		}
	
	this.reload = function(){
		var tmpName = this.name; var tmpId = this.r_id
		this.init()
		this.r_id = tmpId; this.name = this.tmpName
		}
	
	this.loadFields = function (){ for (var i = 0; i<this.fields.length; i++) this.fields[i] = new Field (as,this.fields[i]) }
	
	this.search = function(){ this.form2virt(); this.virt2get() }
	this.save = function(){ this.form2virt(); this.getName(); if(this.name)	this.virt2db() }
	this.saveTo = function (id) {
		var tmpId = this.r_id;
		this.form2virt();
		this.r_id = id;
		this.virt2db();
		this.r_id = tmpId
		}
	this.saveAsDefaults = function() {
		var confirm = window.confirm("Значения по умолчанию используются при сбросе формы и для скрытых полей.\r\nСохранить текущие значения полей формы как значения по умолчанию?")
		if (confirm) this.saveTo(997)
		}
	
	this.form2virt = function(){ for (var i = 0; i<this.fields.length; i++) this.fields[i].fromForm() }
	
	this.db2virt = function (res){
		var row = res.getNextRow()
		var loadId = row.getResultByName("r_id")
		if (loadId < 997 || loadId > 999) {
			this.r_name = row.getResultByName("name")
			this.r_id = row.getResultByName("r_id")
			}
		else this.r_name = this.r_id = ''
		if (loadId == 999) { this.r_id = this.closedId.value; this.r_name = this.closedName.value }
		for (var i = 0; i<this.fields.length; i++) this.fields[i].fromDB(row.getResultByName(this.fields[i].dbName))		
		//as.cons.logStringMessage(this.fields[i].name+' ('+row.getResultByName(this.fields[i].dbName)+') = '+this.fields[i].value)
		}
		
	this.virt2form = function(){
		for (var i=0; i<this.fields.length; i++)
			if(this.fields[i].name != 'region_id' && this.fields[i].name != 'model' && this.fields[i].name != 'city_id'){
				this.fields[i].toForm()
				if (this.fields[i].name == 'brand') {
					if(this.fields[1].value.length > 0) as.form.selectModelsAfterJSload = true
					as.form.loadModels()
					}
				else if (this.fields[i].name == 'country'){
					if(this.fields[5].value.length > 0) {
						as.form.selectRegionsAfterJSload = true
						if(this.fields[6].value) as.form.selectCityAfterJSload = true
						}
					as.form.loadRegions()
					}
				}
		}
	
	this.virt2get = function(){
		var getReq = 'http://cars.auto.ru/list/?category_id=15&section_id=1'
		for (var i = 0; i<this.fields.length; i++) {
			var str = this.fields[i].toGet()
			if (this.parseBeforeGet[this.fields[i].name] && this.parseBeforeGet[this.fields[i].name][this.fields[i].value]) 
				str = '&'+this.fields[i].getName+'='+this.parseBeforeGet[this.fields[i].name][this.fields[i].value]
				//костыль для значений автору, отличных от родной формы
			getReq += str
			}
		as.cons.logStringMessage(getReq)
		//showResults(getReq)
		}

	this.virt2db = function(){
		function lastInsertRowId(res) { row = res.getNextRow(); as.virt.r_id = row.getResultByName('lir') }
		//для записи в вирт r_id для только что вставленной строки

		function insertNewSearch(){
			var statement = as.db.createStatement("INSERT INTO `searches` (r_id, brand, model, bodyt, color, yFrom, yTo, prFrom, prTo, volFrom, volTo, powFrom, powTo, gear, wheel, drvGear, engType, cond, cust, owners, change, country, region_id, city_id, seller, pubDates, avail, output, sortBy, hasPhoto, hasCert, runFrom, runTo, curr, opt_srs, opt_sec, opt_abs, opt_tcs, opt_esp, opt_ksen, opt_gur, opt_av, opt_cond, opt_omivFar, opt_elZerk, opt_luk, opt_dd, opt_ds, opt_obogZerk, opt_park, opt_pc, opt_cz, opt_cruize, opt_int, opt_intColor, opt_elStekl, opt_wheelAdj, opt_drvSeat, opt_passSeat, opt_obogSid, opt_ton, opt_gbo, opt_disks) VALUES (last_insert_rowid(), :brand, :model, :bodyt, :color, :yFrom, :yTo, :prFrom, :prTo, :volFrom, :volTo, :powFrom, :powTo, :gear, :wheel, :drvGear, :engType, :cond, :cust, :owners, :change, :country, :region_id, :city_id, :seller, :pubDates, :avail, :output, :sortBy, :hasPhoto, :hasCert, :runFrom, :runTo, :curr, :opt_srs, :opt_sec, :opt_abs, :opt_tcs, :opt_esp, :opt_ksen, :opt_gur, :opt_av, :opt_cond, :opt_omivFar, :opt_elZerk, :opt_luk, :opt_dd, :opt_ds, :opt_obogZerk, :opt_park, :opt_pc, :opt_cz, :opt_cruize, :opt_int, :opt_intColor, :opt_elStekl, :opt_wheelAdj, :opt_drvSeat, :opt_passSeat, :opt_obogSid, :opt_ton, :opt_gbo, :opt_disks);")
			
			for (var i = 0; i<as.virt.fields.length; i++) {
				statement.params[as.virt.fields[i].dbName] = as.virt.fields[i].dbStm()
				//as.cons.logStringMessage(i+' '+as.virt.fields[i].name+" "+as.virt.fields[i].dbName+" "+as.virt.fields[i].dbStm())
				}
			statement.executeAsync()
			
			statement = as.db.createStatement("SELECT last_insert_rowid() as lir FROM `search_list`;")
			statement.executeAsync({
				handleResult: function(aResultSet){lastInsertRowId(aResultSet) },
				handleError: function(aError) { print("Error: " + aError.message); },
				handleCompletion: function(aReason) { }	
				})
			}
		
		as.cons.logStringMessage("AS.virt.virt2db для id:"+this.r_id+" с именем: "+this.name)
		if((this.r_id != '' && this.r_name == this.name) || this.r_id == 999 || this.r_id == 997){
			as.cons.logStringMessage("update")
			var statement = as.db.createStatement("UPDATE `searches` SET brand=:brand, model=:model, bodyt=:bodyt, color=:color, yFrom=:yFrom, yTo=:yTo, prFrom=:prFrom, prTo=:prTo, volFrom=:volFrom, volTo=:volTo, powFrom=:powFrom, powTo=:powTo, gear=:gear, wheel=:wheel, drvGear=:drvGear, engType=:engType, cond=:cond, cust=:cust, owners=:owners, change=:change, country=:country, region_id=:region_id, city_id=:city_id, seller=:seller, pubDates=:pubDates, avail=:avail, output=:output, sortBy=:sortBy, hasPhoto=:hasPhoto, hasCert=:hasCert, runFrom=:runFrom, runTo=:runTo, curr=:curr, opt_srs=:opt_srs, opt_sec=:opt_sec, opt_abs=:opt_abs, opt_tcs=:opt_tcs, opt_esp=:opt_esp, opt_ksen=:opt_ksen, opt_gur=:opt_gur, opt_av=:opt_av, opt_cond=:opt_cond, opt_omivFar=:opt_omivFar, opt_elZerk=:opt_elZerk, opt_luk=:opt_luk, opt_dd=:opt_dd, opt_ds=:opt_ds, opt_obogZerk=:opt_obogZerk, opt_park=:opt_park, opt_pc=:opt_pc, opt_cz=:opt_cz, opt_cruize=:opt_cruize, opt_int=:opt_int, opt_intColor=:opt_intColor, opt_elStekl=:opt_elStekl, opt_wheelAdj=:opt_wheelAdj, opt_drvSeat=:opt_drvSeat, opt_passSeat=:opt_passSeat, opt_obogSid=:opt_obogSid, opt_ton=:opt_ton, opt_gbo=:opt_gbo, opt_disks=:opt_disks WHERE r_id=:id");
			statement.params.id = this.r_id
			for (var i = 0; i<this.fields.length; i++){
				//as.cons.logStringMessage(i+' '+as.virt.fields[i].name+" "+as.virt.fields[i].dbName+" "+as.virt.fields[i].dbStm())
				statement.params[this.fields[i].dbName] = this.fields[i].dbStm()
				}
			statement.executeAsync(this.updReqCallBack)
			}
		else{
			var date = new Date()
			this.r_name = this.name //записываем имя для использования при переименовании
			var statement = as.db.createStatement("INSERT INTO `search_list` (r_name,r_date) VALUES (:name,:date);")
			statement.params.name = this.name
			statement.params.date = date.valueOf()
			statement.executeAsync({
				handleResult: function(aResultSet){ as.virt.db2virt(aResultSet) },
				handleError: function(aError) {  },
				handleCompletion: function(aReason) { insertNewSearch() }				
				})
			}
		}
	
	this.db2get = function (id){
		var statement = as.db.createStatement("SELECT sl.r_name as name,  s.* FROM `searches` as s, `search_list` as sl WHERE s.r_id=:id LIMIT 1;");
		this.r_id=statement.params.id = id
		statement.executeAsync({
			handleResult: function(aResultSet){as.virt.db2virt(aResultSet);},
			handleError: function(aError) { print("Error: " + aError.message) },
			handleCompletion: function(aReason) {
				if (aReason != Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED)	print("Query canceled or aborted!")
				as.virt.virt2get()
				}
			})
		}

	this.db2form = function (id){
		//if(this.r_id != id) {
			if (id < 997 || id > 999) var statement = as.db.createStatement("SELECT sl.r_name as name,  s.* FROM `searches` as s LEFT JOIN `search_list` as sl WHERE s.r_id=sl.r_id AND s.r_id=:id LIMIT 1;")
			else statement = as.db.createStatement("SELECT * FROM `searches` WHERE r_id=:id LIMIT 1;")
			statement.params.id = id
			statement.executeAsync({
				handleResult: function(aResultSet){ as.virt.db2virt(aResultSet) },
				handleError: function(aError){ print("Error: " + aError.message) },
				handleCompletion: function(aReason) {
					if (aReason != Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED) print("Query canceled or aborted!")
					as.virt.virt2form()
					document.getElementById('tabs').selectedIndex = 0
					}
				})
		/*	}
		else {
			this.virt2form()
			document.getElementById('tabs').selectedIndex = 0
			}*/
		}

	this.getName = function(){
		var name = this.r_name
		try{
			name = prompt('Введите короткое (но более трёх символов) и ясное название:', name)
			while(name.length<3) {
				name = prompt('Введите короткое (но более трёх символов) и ясное название:', name)
				name = trim(name)
				}
			this.name = name
			}
		catch (err){ alert('Фильтр не сохранён.'); this.name = false }
		}

	this.onClose = function(){
		if(this.r_id != '' && this.r_name != ''){
			//as.cons.logStringMessage('AS.virt.onClose - записываем закрываемый id и имя '+this.r_id+' '+this.r_name)
			this.closedId.value = this.r_id+''
			this.closedName.value = this.r_name
			}
		else{  this.closedId.value = this.closedName.value = '' }
		this.saveTo(999)
		}
	
	this.db2defVals = function (){//загружаем default значения в массив fields
		var stm = as.db.createStatement("SELECT * FROM `searches` WHERE r_id=997 LIMIT 1;")
		stm.executeStep()
		for (var i = 0; i<this.fields.length; i++) {
			if (!this.fields[i][1]) this.fields[i][1] = this.fields[i][0]
			try { this.fields[i][4] = stm.row[this.fields[i][1]] }
			catch(e){ as.cons.logStringMessage('AS.virt.db2defVals: не найдено значение поля '+this.fields[i][0]) }
			}
		}
	
	this.updReqCallBack = {
		handleResult: function(aResultSet) {},
		handleError: function(aError) { alert("Error: " + aError.message) },
		handleCompletion: function(aReason) {}}
	}

function Field (as,arr) {
	this.name = arr[0]
	this.dbName = arr[1] ? arr[1] : this.name;
	this.getName = arr[2] ? arr[2] : this.name;
	this.type = arr[3]
	this.elem = document.getElementById(this.name)
	this.value = false
	this.display = true
	this.defVal = arr[4]
	this.onForm = this.elem ? true : false;
	//as.cons.logStringMessage('AS.field.value '+this.name+' = '+this.value)

	try { var temp = as.app.prefs.get("extensions.as.form."+this.name); this.display = temp.value }
	catch (e) { this.display = false }
	
	this.toGet = function () { return "&"+this.getName+'='+this.value }
	this.dbStm = function () { return this.value }
	this.fromDB = function (val) { this.value = val }
	switch (this.type) {
		case 0://textinput
			this.toForm = function() { this.elem.value = this.value }
			this.fromForm = function  () {this.value = this.elem.value}
			this.dbStm = function () { return this.value == '' ? null : this.value }
			this.fromDB = function (val) { this.value = val == null ? '' : val }
			break
		case 1://menuilist
			this.toForm = function () { mlSelectByVal(this.elem,this.value) }
			this.fromForm = function () {
				//if(!this.elem.selectedItem) as.cons.logStringMessage('fromForm: empty '+this.name)
				this.value = this.elem.selectedItem.value }
			break
		case 2://html:select (модели и регионы)
			this.value = Array()
			this.toForm = function(vals) {
				//as.cons.logStringMessage('прямой вызов toForm для '+this.name)
				slSelectByVals(this.elem,this.value)
				}
			this.fromForm = function () {
				this.value = Array()
				for (i = 0; i<this.elem.options.length; i++)
						if(this.elem.options[i].selected == true) this.value.push(this.elem.options[i].value)
						//убрал проверку модели по item.value!=0
				}
			this.toGet = function(){
				if ((this.value.length == 0) || (this.value[0] == 0 && this.value.length == 1)) return ''
				var str = ''
				for (i = 0; i<this.value.length; i++) str += '&'+this.getName+'='+this.value[i]
				return str
				}
			this.dbStm = function () {
				if (this.value.length == 0 || (this.value[0] == 0 && this.value.length == 1)) return null;
				var str=''
				for (var i = 0; i<this.value.length; i++) str+=this.value[i]+';'
				return str
				}
			this.fromDB = function (str) {	
				if (str != null) { this.value = str.split(';'); this.value.length-- }
				}
			break
		case 3://checkbox
			this.toForm = function() {this.value ? this.elem.checked = true : this.elem.checked = false}
			this.fromForm = function () {this.elem.checked ? this.value = 1 : this.value = 0}
			break
		default: alert('Field.toForm: неизвестный тип поля ввода - '+this.type+'у '+this.name);	
		}
	
	if(!this.display) {//as.cons.logStringMessage('AS.virt.Field.toForm для скрытого '+this.name) 
		this.fromDBcommon = this.fromDB
		this.fromDB = function (val) { this.fromDBcommon(this.defVal) }
		}
		
	if(!this.onForm){// используется в окне опций
		this.toFormHidden = this.toForm; this.fromFormHidden = this.fromForm
		this.toForm = this.fromForm = function() {}
		this.toFormObj = function (obj) { this.elem = obj; this.toFormHidden(); this.elem = false }
		this.fromFormObj = function (obj) { this.elem = obj; this.fromFormHidden(); this.elem = false }
		}
}