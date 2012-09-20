function virt (){
	var self = this,
		closedId = as.app.prefs.get('extensions.as.lastClosedId'),
		autoSaveId = 999,
		clearedId = 998,
		defaultsId = 997,
		year = new Date().getFullYear(),
		fieldsObj = {};//the same as fields variable, but with text keys, not array but object
		//closedName = as.app.prefs.get('extensions.as.lastClosedName');
	//as.cons.logStringMessage(closedId.value);
	this.r_id = false;
	this.form = new Form();
	this.name = this.r_name = '';
	this.fields = [['brand',,'mark_id',1], ['model',,'groups[]',2], ['bodyt',,'body_key',1,1],
		['color',,'color_id',1,1], ['country',,'country_id',1], ['region_id',,'region[]',2],
		['city_id',,,1], ['yFrom',,'year[1]',1,1], ['yTo',,'year[2]',1], ['prFrom',,'price_usd[1]',0,1],
		['prTo',,'price_usd[2]',0], ['runFrom',,'run[1]',0,1], ['runTo',,'run[2]',0],
		['volFrom',,'engine_volume[1]',0,2], ['volTo',,'engine_volume[2]',0], ['powFrom',,'engine_power[1]',0,2],
		['powTo',,'engine_power[2]',0], ['gear',,'transmission_key',1,1], ['wheel',,'wheel_key',1,1],
		['drvGear',,'drive_key',1,1], ['engType',,'engine_key',1,1], ['cond',,'used_key',1,1],
		['cust',,'custom_key',1,1],	['owners',,'owner_pts',1,1], ['change',,'change_key',1,1],
		['currency_key','curr',,1,1], ['seller',,'client_id',1,1], ['pubDates',,'stime',1,1],
		['avail',,'available_key',1,1], ['output',,'output_format',1,1], ['sortBy',,'sort_by',1,1],
		['hasPhoto',,'has_photo',3,2], ['hasCert',,'is_certificate',3,2],
		['opt_srs',,'extras[18]',1], ['opt_sec',,'extras[16]',3], ['opt_abs',,'extras[1]',3], ['opt_tcs',,'extras[2]',3],
		['opt_esp',,'extras[23]',3], ['opt_ksen',,'extras[9]',3], ['opt_gur',,'extras[25]',1], ['opt_av',,'extras[12]',1],
		['opt_cond',,'extras[7]',1], ['opt_omivFar',,'extras[15]',3], ['opt_elZerk',,'extras[28]',3], ['opt_luk',,'extras[11]',3],
		['opt_dd',,'extras[5]',3], ['opt_ds',,'extras[6]',3], ['opt_obogZerk',,'extras[13]',3], ['opt_park',,'extras[17]',3],
		['opt_pc',,'extras[3]',3], ['opt_cz',,'extras[27]',3], ['opt_cruize',,'extras[8]',3], ['opt_int',,'extras[22]',1],
		['opt_intColor',,'extras[26]',1], ['opt_elStekl',,'extras[29]',1], ['opt_wheelAdj',,'extras[20]',1], ['opt_drvSeat',,'extras[19]',1],
		['opt_passSeat',,'extras[21]',1], ['opt_obogSid',,'extras[14]',3], ['opt_ton',,'extras[24]',3], ['opt_gbo',,'extras[4]',3],
		['opt_disks',,'extras[10]',3]] //[name and ID of elem, dbName, getName, inputType, hide type (false - none, 1 - hide elem, 2 - hide parent of elem)], !порядок элементов важен (ппц!)!
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
			opt_drvSeat: [0,49,48,50], opt_passSeat: [0,46,47]
		} //костыль для подготовки get запроса
	
	this.init = function(){
		db2defVals();
		convertFieldsFromArr2objects();
		self.form.init(fieldsObj);
		as.virt.db2form(999);
		if(closedId) { self.r_id = closedId; }
		}
	
	this.search = function(){
		form2virt();
		this.virt2get();
		}
		
	this.save = function(){
		form2virt();
		getName();
		if(this.name)	{ virt2db(); }
		}

	this.saveAsDefaults = function() {
		var confirm = window.confirm("Значения по умолчанию используются при сбросе формы и для \"скрытых\" полей.\r\nСохранить текущие значения полей формы как значения по умолчанию?")
		if (confirm) { this.saveTo(defaultsId); }
		}
	
	this.virt2get = function(){
		var getReq = 'http://cars.auto.ru/list/?category_id=15&section_id=1', i, str;
		for (i = 0; i<this.fields.length; i++) {
			str = this.fields[i].toGet();
			if (this.parseBeforeGet[this.fields[i].name] && this.parseBeforeGet[this.fields[i].name][this.fields[i].value]){ 
				str = '&' + this.fields[i].getName + '=' + this.parseBeforeGet[this.fields[i].name][this.fields[i].value];
				}//костыль для значений автору, отличных от родной формы
			getReq += str;
			};
		//as.cons.logStringMessage(getReq)
		//showResults(getReq)
		}

	this.db2virt = function (res){
		function getAndSetAutoSavedId(res){
			var row = res.getNextRow();
			self.r_id = row.getResultByName("r_id");
			self.r_name = row.getResultByName("r_name");
			}
		var row = res.getNextRow(), i, name = row.getResultByName("name");
		self.r_id = row.getResultByName("r_id");
		self.r_name = (name !== null)?name:'';
		if (!self.r_name && +closedId.value) {
			//self.r_id = closedId.value;
			var statement = as.db.createStatement("SELECT sl.r_name, s.r_id FROM `search_list` AS sl JOIN `searches` AS s ON s.r_id = sl.r_id WHERE s.r_id =:r_id LIMIT 1;");
			statement.params.r_id = closedId.value;
			statement.executeAsync({
				handleResult: function(aResultSet){ getAndSetAutoSavedId(aResultSet); },
				handleError: function(aError) {
					as.cons.logStringMessage("as.virt.db2virt Error on getting name&id of autosaved from search list: " + aError.message);},
				handleCompletion: function() { }
				});
			}
		for (i = 0; i<self.fields.length; i++){ self.fields[i].fromDB(row.getResultByName(self.fields[i].dbName)); }
		//as.cons.logStringMessage(this.fields[i].name+' ('+row.getResultByName(this.fields[i].dbName)+') = '+this.fields[i].value)
		}
	
	this.db2get = function (id){
		var statement = as.db.createStatement("SELECT sl.r_name as name,  s.* FROM `searches` as s, `search_list` as sl WHERE s.r_id=:id LIMIT 1;");
		this.r_id = statement.params.id = id;
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
		var	
			statement = as.db.createStatement("SELECT sl.r_name as name,  s.* FROM `searches` as s LEFT JOIN `search_list` as sl ON s.r_id = sl.r_id WHERE s.r_id=:id LIMIT 1;");
		statement.params.id = id;
		statement.executeAsync({
			handleResult: function(aResultSet){ as.virt.db2virt(aResultSet); },
			handleError: function(aError){ as.cons.logStringMessage("Error: " + aError.message); },
			handleCompletion: function(aReason) {
				if (aReason != Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED){
					as.cons.logStringMessage("Query canceled or aborted!");
					}
				virt2form();
				document.getElementById('tabs').selectedIndex = 0;
				}
			})
		}

	this.onClose = function(){
		if(+self.r_id){
			as.cons.logStringMessage('as.virt.onClose - записываем закрываемый id "' + self.r_id + '"');
			closedId.value = self.r_id.toString();
			}
		else{ closedId.value = autoSaveId; }

		saveTo(autoSaveId);
		}
	
	this.updReqCallBack = {
		handleResult: function(aResultSet) {},
		handleError: function(aError) { alert("Error: " + aError.message) },
		handleCompletion: function(aReason) {}}
	
	saveTo = function (id) {
		var tmpId = self.r_id;
		form2virt();
		self.r_id = id;
		virt2db();
		self.r_id = tmpId;
		}

	convertFieldsFromArr2objects = function (){
		var i;
		for (i = 0; i < self.fields.length; i++){
			self.fields[i] = new Field (self.fields[i]);
			fieldsObj[self.fields[i].name] = self.fields[i];
			}
		}
		
	form2virt = function(){
		var i;
		for (i = 0; i<self.fields.length; i++){ self.fields[i].fromForm(); }
		}
	
	virt2form = function(){
	var i;
		for (i = 0; i<self.fields.length; i++)
			if(self.fields[i].name != 'region_id' && self.fields[i].name != 'model' && self.fields[i].name != 'city_id'){
				self.fields[i].toForm();
				if (self.fields[i].name == 'brand') {
					if(self.fields[1].value.length > 0) { self.form.selectModelsAfterJSload = true; }
					self.form.loadModels();
					}
				else if (self.fields[i].name == 'country'){
					if(self.fields[5].value.length > 0) {
						self.form.selectRegionsAfterJSload = true;
						if(self.fields[6].value) { self.form.selectCityAfterJSload = true; }
						}
					self.form.loadRegions();
					}
				}
		}
	
	virt2db = function(){
		function lastInsertRowId(res) {	
			row = res.getNextRow();
			as.virt.r_id = row.getResultByName('lir');
			}
		//для записи в вирт r_id для только что вставленной строки

		function insertNewSearch(){
			var statement = as.db.createStatement("INSERT INTO `searches` (r_id, brand, model, bodyt, color, yFrom, yTo, prFrom, prTo, volFrom, volTo, powFrom, powTo, gear, wheel, drvGear, engType, cond, cust, owners, change, country, region_id, city_id, seller, pubDates, avail, output, sortBy, hasPhoto, hasCert, runFrom, runTo, curr, opt_srs, opt_sec, opt_abs, opt_tcs, opt_esp, opt_ksen, opt_gur, opt_av, opt_cond, opt_omivFar, opt_elZerk, opt_luk, opt_dd, opt_ds, opt_obogZerk, opt_park, opt_pc, opt_cz, opt_cruize, opt_int, opt_intColor, opt_elStekl, opt_wheelAdj, opt_drvSeat, opt_passSeat, opt_obogSid, opt_ton, opt_gbo, opt_disks) VALUES (last_insert_rowid(), :brand, :model, :bodyt, :color, :yFrom, :yTo, :prFrom, :prTo, :volFrom, :volTo, :powFrom, :powTo, :gear, :wheel, :drvGear, :engType, :cond, :cust, :owners, :change, :country, :region_id, :city_id, :seller, :pubDates, :avail, :output, :sortBy, :hasPhoto, :hasCert, :runFrom, :runTo, :curr, :opt_srs, :opt_sec, :opt_abs, :opt_tcs, :opt_esp, :opt_ksen, :opt_gur, :opt_av, :opt_cond, :opt_omivFar, :opt_elZerk, :opt_luk, :opt_dd, :opt_ds, :opt_obogZerk, :opt_park, :opt_pc, :opt_cz, :opt_cruize, :opt_int, :opt_intColor, :opt_elStekl, :opt_wheelAdj, :opt_drvSeat, :opt_passSeat, :opt_obogSid, :opt_ton, :opt_gbo, :opt_disks);")
			
			for (var i = 0; i<as.virt.fields.length; i++) {
				statement.params[as.virt.fields[i].dbName] = as.virt.fields[i].dbStm();
				//as.cons.logStringMessage(i+' '+as.virt.fields[i].name+" "+as.virt.fields[i].dbName+" "+as.virt.fields[i].dbStm())
				}
			statement.executeAsync();
			
			statement = as.db.createStatement("SELECT last_insert_rowid() as lir FROM `search_list`;")
			statement.executeAsync({
				handleResult: function(aResultSet){lastInsertRowId(aResultSet) },
				handleError: function(aError) { print("Error: " + aError.message); },
				handleCompletion: function(aReason) { }	
				})
			}
		
		var i, date = new Date(), statement;
		as.cons.logStringMessage("as.virt.virt2db для id:'" + self.r_id + "' с именем: '" + self.name + "'");
		if((self.r_id != '' && self.r_name == self.name) || self.r_id == autoSaveId || self.r_id == defaultsId){
			as.cons.logStringMessage("as.virt.virt2db: Update SQL query");
			var statement = as.db.createStatement("UPDATE `searches` SET brand=:brand, model=:model, bodyt=:bodyt, color=:color, yFrom=:yFrom, yTo=:yTo, prFrom=:prFrom, prTo=:prTo, volFrom=:volFrom, volTo=:volTo, powFrom=:powFrom, powTo=:powTo, gear=:gear, wheel=:wheel, drvGear=:drvGear, engType=:engType, cond=:cond, cust=:cust, owners=:owners, change=:change, country=:country, region_id=:region_id, city_id=:city_id, seller=:seller, pubDates=:pubDates, avail=:avail, output=:output, sortBy=:sortBy, hasPhoto=:hasPhoto, hasCert=:hasCert, runFrom=:runFrom, runTo=:runTo, curr=:curr, opt_srs=:opt_srs, opt_sec=:opt_sec, opt_abs=:opt_abs, opt_tcs=:opt_tcs, opt_esp=:opt_esp, opt_ksen=:opt_ksen, opt_gur=:opt_gur, opt_av=:opt_av, opt_cond=:opt_cond, opt_omivFar=:opt_omivFar, opt_elZerk=:opt_elZerk, opt_luk=:opt_luk, opt_dd=:opt_dd, opt_ds=:opt_ds, opt_obogZerk=:opt_obogZerk, opt_park=:opt_park, opt_pc=:opt_pc, opt_cz=:opt_cz, opt_cruize=:opt_cruize, opt_int=:opt_int, opt_intColor=:opt_intColor, opt_elStekl=:opt_elStekl, opt_wheelAdj=:opt_wheelAdj, opt_drvSeat=:opt_drvSeat, opt_passSeat=:opt_passSeat, opt_obogSid=:opt_obogSid, opt_ton=:opt_ton, opt_gbo=:opt_gbo, opt_disks=:opt_disks WHERE r_id=:id");
			statement.params.id = self.r_id;
			for (i = 0; i<self.fields.length; i++){
				//as.cons.logStringMessage(i+' '+as.virt.fields[i].name+" "+as.virt.fields[i].dbName+" "+as.virt.fields[i].dbStm())
				statement.params[self.fields[i].dbName] = self.fields[i].dbStm();
				}
			statement.executeAsync(as.virt.updReqCallBack);
			}
		else{
			as.cons.logStringMessage("as.virt.virt2db: Insert SQL query");
			self.r_name = self.name; //записываем имя для использования при переименовании
			statement = as.db.createStatement("INSERT INTO `search_list` (r_name,r_date) VALUES (:name,:date);");
			statement.params.name = this.name;
			statement.params.date = date.valueOf();
			statement.executeAsync({
				handleResult: function(aResultSet){ as.virt.db2virt(aResultSet) },
				handleError: function(aError) {  },
				handleCompletion: function(aReason) { insertNewSearch() }				
				})
			}
		}

	getName = function(){
		var name = this.r_name;
		try{
			name = prompt('Введите короткое (но более трёх символов) и ясное название:', name);
			while(name.length<3) {
				name = prompt('Введите короткое (но более трёх символов) и ясное название:', name);
				name = trim(name);
				}
			this.name = name;
			}
		catch (err){ alert('Фильтр не сохранён.'); this.name = false; }
		}

	db2defVals = function (){//загружаем default значения в массив fields
		var i, stm = as.db.createStatement("SELECT * FROM `searches` WHERE r_id=997 LIMIT 1;");
		stm.executeStep();
		for (i = 0; i < self.fields.length; i++) {
			self.fields[i][1] = self.fields[i][1] || self.fields[i][0];
			try { self.fields[i][5] = stm.row[self.fields[i][1]]; }
			catch(e){ as.cons.logStringMessage('as.virt.db2defVals: не найдено default (r_id=997) значение поля ' + self.fields[i][0] + ' в ответе SQLite') }
			}
		}
	
	}

function Field (arr) {
	this.name = arr[0];
	this.dbName = arr[1] ? arr[1] : this.name;
	this.getName = arr[2] ? arr[2] : this.name;
	this.type = arr[3];
	this.elem = document.getElementById(this.name);
	this.value = false;
	this.display = true;
	this.hideType = arr[4];
	this.defVal = arr[5];
	var onForm = this.elem ? true : false;
	//as.cons.logStringMessage('AS.field.value '+this.name+' = '+this.value)

	try {
		var temp = as.app.prefs.get("extensions.as.form." + this.name);
		this.display = temp.value;
		}
	catch (e) { this.display = false; }
	
	this.toGet = function () { return "&" + this.getName + '=' + this.value; }
	this.dbStm = function () { return this.value; }
	this.fromDB = function (val) { this.value = val; }
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
				var i;
				this.value = [];
				for (i = 0; i<this.elem.options.length; i++)
					if(this.elem.options[i].selected == true) {
						this.value.push(this.elem.options[i].value)
						}
					//убрал проверку модели по item.value!=0
				}
			this.toGet = function(){
				var str = '', i;
				if ((this.value.length == 0) || (this.value[0] == 0 && this.value.length == 1)) { return str; }
				for (i = 0; i<this.value.length; i++) { str += '&' + this.getName + '=' + this.value[i]; }
				return str;
				}
			this.dbStm = function () {
				var str = '', i;
				if (this.value.length == 0 || (this.value[0] == 0 && this.value.length == 1)) { return null; }
				for (i = 0; i<this.value.length; i++) { str += this.value[i] + ';'; }
				return str;
				}
			this.fromDB = function (str) {	
				if (str != null) { this.value = str.split(';'); this.value.length--; }
				}
			break;
		case 3://checkbox
			this.toForm = function() { this.elem.checked = this.value?true:false; }
			this.fromForm = function () { this.value = this.elem.checked?1:0; }
			break
		default: as.cons.logStringMessage('Field.toForm: неизвестный тип поля ввода - ' + this.type + 'у ' + this.name);	
		}
	
	if(!this.display) {//as.cons.logStringMessage('AS.virt.Field.toForm для скрытого '+this.name) 
		this.fromDBcommon = this.fromDB;
		this.fromDB = function (val) { this.fromDBcommon(this.defVal); }
		}
		
	if(!onForm){// используется для полей в окне опций
		this.toFormHidden = this.toForm;
		this.fromFormHidden = this.fromForm;
		this.toForm = this.fromForm = function() {};
		this.toFormObj = function (obj) {
			this.elem = obj;
			this.toFormHidden();
			this.elem = false;
			}
		this.fromFormObj = function (obj) {
			this.elem = obj;
			this.fromFormHidden();
			this.elem = false;
			}
		}
}