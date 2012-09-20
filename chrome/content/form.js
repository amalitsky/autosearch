function Form() {
	var
		extJSURL = 'http://cars.auto.ru/jsexport.php?groupName=extsearch',
		regGetReq = "&name=country_id&country_id=",
		modGetReq = "&category_id=15&section_id=1&name=mark_id_parent&mark_id=",
		cityGetReq = "&name=region_id&country_id=",
		self = this,
		rCache = [], mCache = [],
		mData = [], rData = [],//array of selected items in regions and models
		year = new Date().getFullYear(),
		mStruc = [],	//hierarchy of models [id] > [parent (id), [array of childs id]] 
		mSel, rSel, //short links for appropriate XUL&HTML elements
		fields = {};
	this.selectModelsAfterJSload = false;
	this.selectRegionsAfterJSload = false;
	this.selectCityAfterJSload = false;
	
	this.init = function (fieldsObj){
		fields = fieldsObj;
		mSel = fields.model.elem;
		rSel = fields.region_id.elem;
		fillPredifenedYearsAndPrices();
		hideInputs();
		};
		
	this.priceToCheck = function (){ //form price input.onChange check
		if (parseInt(fields.prTo.elem.value,10) < parseInt(fields.prFrom.elem.value,10)){ fields.prTo.elem.value = fields.prFrom.elem.value; }
		};

	this.yearsSet = function (toVal, fVal){//quick years set buttons
		fields.yFrom.elem.selectedIndex = fVal;
		fields.yTo.elem.selectedIndex = toVal;
		};
	
	this.yearToUpdate = function(){
		"use strict";
		var oldToVal = 0, i, yTo = fields.yTo.elem;
		if(yTo.selectedItem !== null) { oldToVal = yTo.selectedItem.value; }
		yTo.selectedIndex = -1;
		for (i = yTo.itemCount - 1; i >= 1; i--) { yTo.removeItemAt(i); }
		if (+fields.yFrom.elem.selectedItem.value !== 0){
			for (i = year; i >= parseInt(fields.yFrom.elem.selectedItem.value,10); i--){
				yTo.appendItem(i, i, null);
				if (+oldToVal === i) { yTo.selectedIndex = yTo.itemCount - 1; }
				}
			}
		if(yTo.menupopup) { yTo.menupopup.style.maxHeight = '150px'; }
		};

	fillPredifenedYearsAndPrices = function(){
		"use strict";
		var prices = [50000, 100000, 200000, 300000, 400000, 500000, 600000, 700000, 800000, 900000, 1000000, 1500000, 2000000, 2500000, 3000000], i;
		for (i = year; i >= 1940; i--){
			fields.yFrom.elem.appendItem(i,i, null);
			fields.yTo.elem.appendItem(i,i, null);
			}
		fields.prFrom.elem.removeAllItems();
		for (i = 0; i < prices.length; i++) { fields.prFrom.elem.appendItem(prices[i], prices[i], null); }
		};

	hideInputs = function(){//hides form fieds (or its parents) with field.display = false and hideType != false
		"use strict";
		var k = 0, showQyearsSel = as.app.prefs.get('extensions.as.form.quickYearsSelect'), field, key;
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
		};

	/*	MODELS load, select making and JS input control	*/

	this.onModelsChange = function(){//model select control: goups + 'all' with smth more
		"use strict";
		function lastSelectedInGroup (id) {
			var parentId = mStruc[id][0], i;
			for (i = 0; i<mStruc[parentId][1].length; i++){
				if (mCache[mStruc[parentId][1][i]] === false && mStruc[parentId][1][i] !== id) { return false; }
				}
			return true;
			}
		function loadPrevious(cache){
			var i;
			for (i = 0; i < mSel.options.length; i++) { mSel.options[i].selected = cache[i] || false; }
			if(cache.length !== mSel.options.length){ as.cons.logStringMessage('as.form.onModelsChange.loadPrevious: cache is broken'); }
			}
		function toggleGroupChildren(id){
			var i;
			for (i = 0; i<mStruc[id][1].length; i++){ mSel.options[mStruc[id][1][i]].selected = mSel.options[id].selected; }
			}
		function toggleGroupName(id){ mSel.options[mStruc[id][0]].selected = mSel.options[id].selected; }
		
		var
			selectedN = 0, lastSelid = 0, //number of selected elements and it's last id
			i, selected = getMcache(); //active after model change array with selected items
		for (i = 0; i<selected.length; i++) { if (selected[i]) { selectedN++; lastSelid = i; } }
		if (selected[0] && selectedN > 1) {//can't select something with active "all models"
			if(mCache.length > 0) { loadPrevious(mCache); } 
			else { loadPrevious(new Array(mSel.options.length)); }
			}
		else{
			if(!(selectedN === 1 && mStruc[lastSelid][0] !== 0)){// if not only one child option is selected
				for (i = 0; i<selected.length; i++) {
					if(selected[i] !== mCache[i]){
						if (mStruc[i][0] === 0){ if (mStruc[i][1].length !== 0) { toggleGroupChildren(i); } }
						else if ((selected[i] === true && lastSelectedInGroup(i)) || (selected[i] === false && selected[mStruc[i][0]] === true)) { toggleGroupName(i); }
						}
					}
				}
			mCache = getMcache();
			}
		};

	this.loadModels = function(){//starts on brand selection
		"use strict";
		var request = modGetReq + fields.brand.elem.selectedItem.value;
		if (+fields.brand.elem.selectedItem.value === 0) { clearModels(); } 
		else { WebMethod(extJSURL+request, null, parseJSmodelsAnswer); }
		//as.cons.logStringMessage(this.extJSURL+request)
		};

	getMcache = function() {
		"use strict";
		var arr = [], i;
		for (i = 0; i<mSel.length; i++) { arr[i] = mSel.options[i].selected; }
		return arr;
		};		
	
	clearModels = function(){// empty model list and mStruc (for JS work in model select)
		"use strict";
		mCache.length = 0;
		mSel.options[0].selected = 0;
		mSel.options.length = 1;
		mStruc.length = 1;
		mStruc[0] = [0,[]];//any model item
		};		
		
	parseJSmodelsAnswer = function (response) {
		"use strict";
		var found, regexp = /new Array\('([0-9]+?)', new Array\('([^'"]+?)','([0-9]+?)'\)\)/img;
		mData.length = 0;
		while ((found = regexp.exec(response)) !== null) { mData.push([found[1], found[3], found[2]]); }
		models2form();
		if (self.selectModelsAfterJSload) {
			fields.model.toForm();
			self.selectModelsAfterJSload = false;
			mCache = getMcache(); //self.onModelsChange();
			}
		};
	
	models2form = function(){
		"use strict";
		function byName(a,b){
			if (String(a[2]) > String(b[2])) { return 1; }
			if (String(a[2]) < String(b[2])) { return -1; }
			}
		var
			trData = [],//trans массив для чтения выбора с select [id, parent, name]
			models = [],// for making model select only, [name, id, parent]
			i, j, childId, pId;
		clearModels();
		trData = mData;
		trData.sort(byName);

		for (i = 0; i<trData.length; i++){ //makes two arrays - "model" for input design and gloabal "mStruc" for JS group selections
			if(+trData[i][1] === 0){
				models.push([trData[i][2],trData[i][0],trData[i][1]]);
				pId = models.length - 1 + 1;
				mStruc[pId] = [0, []];
				for(j = 0; j<trData.length; j++) {
					if (trData[j][1] === trData[i][0]) {
						models.push(['– ' + trData[j][2], trData[j][0], trData[j][1]]);
						childId = models.length - 1 + 1;
						mStruc[pId][1].push(childId);
						mStruc[childId] = [pId, []];
						}
					}
				}
			}
		//printObject(models);
		for (i = 0; i<models.length; i++) { mSel.options[i+1] = new Option(models[i][0], models[i][1], false, false); }
		};

	/*	REGIONS&CITIES	*/
	
	this.onRegionChange = function(){//проверяем чтобы не больше 3ёх было выбрано
		"use strict";
		function loadPrevious(cache){
			var i;
			for (i = 0; i < rSel.options.length; i++) { rSel.options[i].selected = cache[i] || false; }
			if(cache.length !== rSel.options.length){ as.cons.logStringMessage('as.form.onRegionChange.loadPrevious: cache is broken'); }
			}
		var selN = 0, i;
		for (i = 0; i<rSel.options.length; i++) { if(rSel.options[i].selected) { selN++; } }
		if (selN > 3 || (rSel.options[0].selected && selN>1)) { loadPrevious(rCache); }
		else {
			if (selN === 1 && +rSel.value !== 0) { loadCities(); } else { disableCitySelect(); }
			rCache = getRcache();
			}
		};

	this.loadRegions = function(){
		"use strict";
		var request = regGetReq + fields.country.elem.selectedItem.value;
		if (+fields.country.elem.selectedItem.value === 0) { clearRegions(); } 
		else { WebMethod(extJSURL + request, null, parseJSregionsAnswer); }
		//as.cons.logStringMessage(this.extJSURL+request);
		};
	
	loadCities = function(){
		"use strict";
		var request = cityGetReq + fields.country.elem.selectedItem.value + '&region_id=' + fields.region_id.elem.value;
		WebMethod(extJSURL+request, null, parseJSregionsAnswer);
		//as.cons.logStringMessage(this.extJSURL+request);
		};
	
	clearRegions = function(){
		"use strict";
		rCache.length = 0;
		rSel.disabled = false;
		rSel.options[0].selected = false;
		rSel.options.length = 1;
		};
	
	getRcache = function() { //makes an array with information of selected regions
		"use strict";
		var arr = [], i;
		for (i = 0; i<rSel.length; i++) { arr[i] = rSel.options[i].selected; }
		return arr;
		};	
			
	parseJSregionsAnswer = function (response) { //works with regions and cities
		"use strict";
		var found, regexp = /new Array\('([0-9]*?)', '([^']*?)'\)/img;
		rData.length = 0;
		while ((found = regexp.exec(response)) !== null) { rData.push([found[1], found[2]]); }
		if (response.indexOf('region_id', 20) !== -1) {
			disableCitySelect();
			regionsCities2form(1);
			rCache.length = 0;
			if (self.selectRegionsAfterJSload) {
				self.selectRegionsAfterJSload = false;
				fields.region_id.toForm();
				if (fields.region_id.value.length === 1 && +fields.region_id.value[0] !== 0) { loadCities(); }
				rCache = getRcache();
				}
			}
		else if (response.indexOf('city_id', 20) !== -1) {
			regionsCities2form(2);
			if (self.selectCityAfterJSload) {
				self.selectCityAfterJSload = false;
				fields.city_id.toForm();
				}
			}
		else { as.cons.logStringMessage('as.form.parseJSregionsAnswer: неизвестный формат ответа от сервера'); }
		};
	
	regionsCities2form = function (type){// runs after regions and cities load from server
		"use strict";
		var obj, i;
		if(type === 1){//html:select of region
			//as.cons.logStringMessage('AS.form.regionsCities2form: region_id, длинна массива - ' + this.rData.length);
			clearRegions();
			if (rData.length > 1)	{ 
				for (i = 1; i < rData.length; i++){
					rSel.options[i] = new Option(rData[i][1], rData[i][0], false, false);
					}
				}
			else {
				disableCitySelect();
				rSel.options[0].selected = false;
				rSel.disabled = true;
				}
			}
		else if (type === 2) {//menulist of ci
			//as.cons.logStringMessage('AS.form.regionsCities2form: city_id, длинна массива - '+this.rData.length);
			obj = fields.city_id.elem;
			for (i = obj.itemCount; i>0; i--) { obj.removeItemAt(i); }
			if (rData.length > 1){
				obj.disabled = false; obj.selectedIndex = 0;
				for (i = 1; i<rData.length; i++) { obj.appendItem(rData[i][1],rData[i][0]); }
				}
			}
		};
	
	disableCitySelect = function(){
		"use strict";
		var obj = fields.city_id.elem, i;
		obj.selectedIndex = 0;
		for (i = obj.itemCount; i>0; i--) { obj.removeItemAt(i); }
		obj.disabled = true;
		};
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
	if (obj.value.length === 0) { return false; }
	var
		key = obj.value[obj.value.length-1],
		reg = /(^-?\d\d*$)/;
	if (!reg.test(key)) { obj.value = obj.value.slice(0,obj.value.length-1); }
	}