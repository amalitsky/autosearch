// убрать ссылки на as (в основном это вывод ошибок)
function Form() {
	var
		extJSURL = 'http://cars.auto.ru/jsexport.php?groupName=extsearch',
		self = this, i,
		rCache = mCache = new Array(),//сюда загрузим массивы с cars.auto.ru
		mData = rData = new Array(),
		year = new Date().getFullYear(),
		mStruc = new Array(), //модели с иерарахией [id] > [parent (id), [array of childs id]] 
		mSel; //ссылка на выбор модели для краткости
		//year = d.getFullYear();
	this.selectModelsAfterJSload = this.selectRegionsAfterJSload = this.selectCityAfterJSload = false;
	//флаг для выбора модели/ региона/ города после загрузки (virt2form)
	fields = {};
	
	this.init = function (fieldsObj){
		fields = fieldsObj;
		mSel = fields.model.elem;
		fillPredifenedYearsAndPrices();
		hideInputs();
		}
		
	this.priceToCheck = function (){//form price input.onChange check
		if (parseInt(fields.prTo.elem.value) < parseInt(fields.prFrom.elem.value)){
				fields.prTo.elem.value = fields.prFrom.elem.value;
				}
		}

	this.yearsSet = function (toVal, fVal){//quick years set buttons
		fields.yFrom.elem.selectedIndex = fVal;
		fields.yTo.elem.selectedIndex = toVal;
		}
	
	this.yearToUpdate = function(){
		var oldToVal = 0, i, yTo = fields.yTo.elem;
		if(yTo.selectedItem !== null) { oldToVal = yTo.selectedItem.value; }
		yTo.selectedIndex = -1;
		for (i = yTo.itemCount - 1; i >= 1; i--) { yTo.removeItemAt(i); }
		if (fields.yFrom.elem.selectedItem.value != 0){
			for (i = year; i >= parseInt(fields.yFrom.elem.selectedItem.value); i--){
				yTo.appendItem(i, i, null);
				if (oldToVal == i) { yTo.selectedIndex = yTo.itemCount - 1; }
				}
			}
		if(yTo.menupopup) { yTo.menupopup.style.maxHeight = '150px'; }
		}
	
	shiftGroup = function(id){
		var i;
		for (i = 0; i<mStruc[id][1].length; i++){
			mSel.options[mStruc[id][1][i]].selected = mSel.options[id].selected;
			}
		}
	
	shiftGroupName = function(id){ mSel.options[mStruc[id][0]].selected = mSel.options[id].selected; }

	this.onModelsChange = function(){//выделяем членов группы при выборе группы и наоборот
		function getMcache() {
			var arr = new Array(), i;
			for (i = 0; i<mSel.length; i++) { arr[i] = mSel.options[i].selected; }
			return arr;
			}
		function lastSelectedInGroup (id) {
			var parentId = mStruc[id][0], i;
			for (i = 0; i<mStruc[parentId][1].length; i++){
				if (mCache[mStruc[parentId][1][i]] == false && mStruc[parentId][1][i] !== id) {
					return false;
					}
				}
			return true;
			}
		function loadPrevious(mCache){
			var i;
			for (i = 0; i < obj.options.length; i++) { obj.options[i].selected = mCache[i]; }
			}
		var
			selected = lastSelId = 0, //кол-во выбранных на selectе
			obj = mSel, i,
			tmpCache = new Array(), //"свежий" массив с выбранными в селекте элементами
			tmpCache = getMcache();
		for (i = 0; i<tmpCache.length; i++) {
			if (tmpCache[i]) { selected++; lastSelId = i; }
			}
		if (tmpCache[0] && selected > 1) { loadPrevious(mCache); return true; }
		if(!(selected === 1 && mStruc[lastSelId][0] !== 0))
			for (i = 0; i<tmpCache.length; i++) {
				if(tmpCache[i] !== mCache[i]){
					if (mStruc[i][0] !== 0){
						if ((tmpCache[i] == 1 && lastSelectedInGroup(i)) || (tmpCache[i] == 0 && tmpCache[mStruc[i][0]] == 1))
							shiftGroupName(i)
						}
					else if (mStruc[i][1].length !== 0) { shiftGroup(i); }
					}
				}
		mCache = getMcache();
		}

	/* MODELS */
	
	this.loadModels = function(){//starts on brand selection
		var request = '&category_id=15&section_id=1&name=mark_id_parent&mark_id=' + fields.brand.elem.selectedItem.value;
		if (fields.brand.elem.selectedItem.value === 0) { clearModels(); return false; } 
		else WebMethod(extJSURL+request, null, parseJSmodelsAnswer);
		//as.cons.logStringMessage(this.extJSURL+request)
		}

	clearModels = function(){//empty model list
		mSel.options[0].selected = 0;
		mSel.options.length = 1;
		mStruc.length = 1;
		mStruc[0] = new Array(0,new Array());//any model item
		}		
		
	parseJSmodelsAnswer = function (response) {
		var found, regexp = /new Array\('([0-9]+?)', new Array\('([^'"]+?)','([0-9]+?)'\)\)/img;
		mData.length = 0;
		while ((found = regexp.exec(response)) != null) {
			mData.push(new Array(found[1], found[3], found[2]));
			//as.cons.logStringMessage('загружена модель "' + found[2] + '" (id: ' + found[1] + ') с родителем (id) "' + found[3] + '"');
			}
		models2form();
		if (self.selectModelsAfterJSload) {
			fields.model.toForm();
			self.selectModelsAfterJSload = false;
			self.onModelsChange();
			}
		}
	
	models2form = function(){
		"use strict";
		function byName(a,b){
			if (String(a[2]) > String(b[2])) { return 1; }
			if (String(a[2]) < String(b[2])) { return -1; }
			}
		var
			trData = new Array(),//trans массив для чтения выбора с select [id, parent, name]
			models = new Array(),//упорядоченный массив с иерархией для вставки в select [name, id, parent]
			tmp, tmp_i, i, j, chId, pId;
		clearModels();
		trData = mData;		//printObject(mData);
		printObject(mData);
		trData.sort(byName);

		for (i = 0; i<trData.length; i++){//распределяем по родителям
			if(+trData[i][1] === 0){
				models.push(new Array(trData[i][2],trData[i][0],trData[i][1]));
				pId = models.length - 1 + 1;
				mStruc[pId] = new Array(0, new Array());
				for(j = 0; j<trData.length; j++) {
					if (trData[j][1] === trData[i][0]) {
						models.push(new Array('– ' + trData[j][2], trData[j][0], trData[j][1]));
						chId = models.length - 1 + 1;
						mStruc[pId][1].push(chId);//id этого ребёнка
						mStruc[chId] = new Array (pId, new Array());
						}
					}
				}
			}
		/*for (i = 0; i<models.length; i++)//записываем иерархию в mStruc
			if(+models[i][2] === 0){
				mStruc[i+1] = new Array(0, new Array());
				for(j = 0; j<models.length; j++) {
					if (models[j][2] == models[i][1]) {
						mStruc[i+1][1].push(j+1);
						mStruc[j+1] = new Array (i+1, new Array());
						}
					}
				}*/
		printObject(models);
		for (i = 0; i<models.length; i++) { mSel.options[i+1] = new Option(models[i][0], models[i][1], false, false); }
		mCache.length = 0;
		}

	getRcache = function() {
		var
			arr = new Array(), i,
			obj = fields.region_id.elem;
		for (i = 0; i<obj.length; i++) { arr[i] = obj.options[i].selected; }
		return arr;
		}	
	
	this.onRegionChange = function(){//проверяем чтобы не больше 3ёх было выбрано
		function loadPrevious(rCache){
			var i;
			for (i = 0; i < obj.options.length; i++) { obj.options[i].selected = rCache[i]; }
			}
		var obj = fields.region_id.elem, k = 0, i;
		for (i = 0; i<obj.options.length; i++) { if(obj.options[i].selected) { k++; } }
		if (obj.options[0].selected && k>1) { loadPrevious(rCache); return true; }
		if (k < 4) { for (i = 0; i<obj.options.length; i++) { rCache[i] = obj.options[i].selected; } }
		else { loadPrevious(rCache); }
		if (k == 1 && obj.value != 0) { loadCities(); } else { disableCitySelect(); }
		rCache = getRcache();
		}

	clearRegions = function(){
		var obj = fields.region_id.elem;
		rCache.length = 0;
		obj.disabled = false;
		obj.options[0].selected = false;
		obj.options.length = 1;
		}
	
	this.loadRegions = function(){
		var request = '&name=country_id&country_id=' + fields.country.elem.selectedItem.value;
		if (fields.country.elem.selectedItem.value == 0) { clearRegions(); return false; } 
		//as.cons.logStringMessage(this.extJSURL+request)
		WebMethod(extJSURL+request, null, parseJSregionsAnswer);
		}

	parseJSregionsAnswer = function (response) {
		var found, regexp = /new Array\('([0-9]*?)', '([^']*?)'\)/img
		rData.length = 0;
		while ((found = regexp.exec(response)) != null) {
			rData.push(new Array(found[1], found[2]));
			//as.cons.logStringMessage('загружен регион/город '+found[1]+' "'+found[2]+'"')
			}
		if (response.indexOf('region_id', 20) !== -1) {
			disableCitySelect();
			regionsCities2form(1);
			rCache.length = 0;
			if (self.selectRegionsAfterJSload) {
				fields.region_id.toForm();
				self.selectRegionsAfterJSload = false;
				if (fields.region_id.value.length == 1 && fields.region_id.value[0] != 0) { loadCities(); }
				rCache = getRcache();
				}
			}
		else if (response.indexOf('city_id', 20) != -1) {
			regionsCities2form(2);
			if (self.selectCityAfterJSload) {
				fields.city_id.toForm();
				self.selectCityAfterJSload = false;
				}
			}
		else { as.cons.logStringMessage('AS.form.parseJSregionsAnswer: неизвестный формат ответа'); }
		}
	
	regionsCities2form = function (type){//вызывается после загрузки массивов регионов и городов для заполнения объектов
		var obj, i;
		if(type === 1){//html:select региона
			//as.cons.logStringMessage('AS.form.regionsCities2form: region_id, длинна массива - ' + this.rData.length)
			obj = fields.region_id.elem;
			clearRegions();
			if (rData.length > 1)	{ 
				for (i = 1; i < rData.length; i++){
					obj.options[i] = new Option(rData[i][1], rData[i][0], false, false);
					}
				}
			else {
				obj.disabled = true;
				obj.options[0].selected = false;
				disableCitySelect();
				}
			}
		else if (type === 2) {//menulist города
			//as.cons.logStringMessage('AS.form.regionsCities2form: city_id, длинна массива - '+this.rData.length)
			obj = fields.city_id.elem
			for (i = obj.itemCount; i>0; i--) { obj.removeItemAt(i); }
			if (rData.length > 1){
				obj.disabled = false; obj.selectedIndex = 0
				for (i = 1; i<rData.length; i++) { obj.appendItem(rData[i][1],rData[i][0]); }
				}
			}
		}
	
	disableCitySelect = function(){
		var obj = fields.city_id.elem, i;
		obj.selectedIndex = 0;
		for (i = obj.itemCount; i>0; i--) { obj.removeItemAt(i); }
		obj.disabled = true;
		}

	loadCities = function(){
		var request = '&name=region_id&country_id=' + fields.country.elem.selectedItem.value + '&region_id=' + fields.region_id.elem.value;
		//as.cons.logStringMessage(this.extJSURL+request)
		WebMethod(extJSURL+request, null, parseJSregionsAnswer);
		}
	
	fillPredifenedYearsAndPrices = function(){//компилирует форму в зависимости от настроек отображения и наполняет форму возможными значениями
		var prices = new Array(50000, 100000, 200000, 300000, 400000, 500000, 600000, 700000, 800000, 900000, 1000000, 1500000, 2000000, 2500000, 3000000), i;
		for (i = year; i >= 1940; i--){
			fields.yFrom.elem.appendItem(i,i, null);
			fields.yTo.elem.appendItem(i,i, null);
			}
		fields.prFrom.elem.removeAllItems();
		for (i = 0; i < prices.length; i++) { fields.prFrom.elem.appendItem(prices[i], prices[i], null); }
		}

	hideInputs = function(){//hides form fieds (or its parents) with field.display = false and hideType != false
		var k = 0, i, showQyearsSel = as.app.prefs.get('extensions.as.form.quickYearsSelect'), field;
		if (!fields.bodyt.display) { k++; }
		if (!fields.color.display) { k++; }
		if (k) { fields.model.elem.style.height = (172 - 29 * k) + 'px'; }
	
		if (!showQyearsSel.value) { document.getElementById('quickYearsSelect').style.display = 'none'; }
		
		for (key in fields){
			if(!fields.hasOwnProperty(key)) { continue; }
			field = fields[key];
			if (field.hideType && !field.display) {
				if(field.hideType === 1) { field.elem.style.display = 'none'; }
				else if (field.hideType === 2) { field.elem.parentNode.style.display = 'none'; }
				}
			}
		}
	}

function mlSelectByVal(obj,val){
	var i;
	for (i = 0; i<obj.itemCount; i++){
		if(obj.getItemAtIndex(i).value == val) { obj.selectedIndex = i; return true; }
		}
	try { as.cons.logStringMessage("AS.form.mlSelectByVal: at '" + obj.id + "' value '" + val + "' was not found"); }
	catch (e) {}
	}

function lbSelectByVal(obj,val){
	var i;
	for (i = 0; i<obj.itemCount; i++){
		if(obj.getItemAtIndex(i).value === val) {
			obj.addItemToSelection(obj.getItemAtIndex(i));
			return true;
			}
		}
	try { as.cons.logStringMessage("AS.form.lbSelectByVal: at '" + obj.id + "' value '"+val+"' was not found"); }
	catch (e) {}
	}

function slSelectByVals(obj,vals){
	var i, j;
	for (j = 0; j<vals.length; j++) {
		for (i = 0; i<obj.options.length; i++){
			if (obj.options[i].value === vals[j]) { obj.options[i].selected = true; }
			}
		}
	}

function checkDigit(obj){
	if (obj.value.length == 0) { return false; }
	var
		key = obj.value[obj.value.length-1],
		reg = /(^-?\d\d*$)/;
	if (!reg.test(key)) { obj.value = obj.value.slice(0,obj.value.length-1); }
	}