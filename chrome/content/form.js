function Form(as) {
	this.extJSURL = 'http://cars.auto.ru/jsexport.php?groupName=extsearch'
	var displNoneCheckIDs =
			[['color',],['bodyt',],['yFrom','year'],['prFrom','price'],['runFrom','run'],['volFrom','volume'],['powFrom','power'],
			['gear',],['wheel'],['drvGear',],['engType',],['cond',],['cust',],['owners',],['change',],['currency_key',],['seller',],
			['pubDates',],['avail',],['output',],['sortBy',],['hasPhoto','hasPhotoBox'],['hasCert','hasCertBox']]
			//массив ID элементов для проверки на display и которые можно выключить display:none [elem name, ID to hide]
	var d = new Date(); this.year = d.getFullYear(); delete d
	
	this.init = function (vFields){
		this.selectModelsAfterJSload = this.selectRegionsAfterJSload = this.selectCityAfterJSload = false
		//флаг для выбора модели/региона/города после загрузки (virt2form)
		this.rCache = this.mCache = new Array()//сюда загрузим массивы с cars.auto.ru
		this.data = this.rData = new Array()
		this.fields = new Array()
		this.mStruc = new Array() //модели с иерарахией [id] > [parent (id), childs (array)] 
		for (var i = 0; i<vFields.length; i++) this.fields[vFields[i].name] = vFields[i] //конвертим массив в удобную форму
		this.mSel = this.fields.model.elem //ссылка на выбор модели для краткости
		this.fill()
		this.displayCheck()
		}
		
	this.fill = function(){//компилирует форму в зависимости от настроек отображения и наполняет форму возможными значениями
		var prices = new Array('50000','100000','200000', '300000', '400000', '500000', '600000', '700000', '800000', '900000', '1000000', '1500000', '2000000', '2500000', '3000000')
		for (var i = this.year; i >= 1940; i--){
			this.fields.yFrom.elem.appendItem(i,i, null)
			this.fields.yTo.elem.appendItem(i,i, null)
			}
		this.fields.prFrom.elem.removeAllItems()
		for (var i = 0; i < prices.length; i++) this.fields.prFrom.elem.appendItem(prices[i], prices[i], null)
		}

	this.displayCheck = function(){//скрывает/отображает поля формы в зависимости от настроек формы
		var k = 0; var obj
		if (!this.fields.bodyt.display) { k++ }
		if (!this.fields.color.display) { k++ }
		this.fields.model.elem.style.height = (172-29*k)+'px'; delete k
	
		var temp = as.app.prefs.get('extensions.as.form.quickYearsSelect')
		if (!temp.value) {
			obj = document.getElementById('quickYearsSelect')
			obj.style.display = 'none'
			}
		
		for (var i = 0; i<displNoneCheckIDs.length; i++){
			if (!displNoneCheckIDs[i][1]) displNoneCheckIDs[i][1] = displNoneCheckIDs[i][0]
			if (!this.fields[displNoneCheckIDs[i][0]].display) {
				obj = document.getElementById(displNoneCheckIDs[i][1])
				obj.style.display = 'none'
				}
			}
		}

	
	this.priceToCheck = function (){
		if (parseInt(this.fields.prTo.elem.value) < parseInt(this.fields.prFrom.elem.value))
				this.fields.prTo.elem.value = this.fields.prFrom.elem.value
		}

	this.yearsSet = function (toVal, fVal){ this.fields.yFrom.elem.selectedIndex = fVal; this.fields.yTo.elem.selectedIndex = toVal }
	
	this.yearToUpdate = function(){
		var yTo = this.fields.yTo.elem
		if(yTo.selectedItem !== null) var oldToVal = yTo.selectedItem.value
		else var oldToVal = 0
		yTo.selectedIndex = -1
		for (var i = yTo.itemCount-1; i>=1; i--) yTo.removeItemAt(i)
		if (this.fields.yFrom.elem.selectedItem.value != 0){
			for (var i = this.year; i >= parseInt(this.fields.yFrom.elem.selectedItem.value); i--){
				yTo.appendItem(i,i,null)
				if (oldToVal == i) yTo.selectedIndex = yTo.itemCount-1
				}
			}
		//if(yTo.selectedItem == null) yTo.selectedIndex = yTo.itemCount-1
		if(yTo.menupopup) yTo.menupopup.style.maxHeight='150px'
		}
	
	
	this.mCacheClear = function () { this.mCache.length = 0; for (var i = 0; i<this.mSel.length; i++) this.mCache[i] = false }
	
	this.getMcache = function() {
		var arr = new Array()
		for (var i = 0; i<this.mSel.length; i++) arr[i] = this.mSel.options[i].selected
		return arr
		}
		
	this.shiftGroup = function(id){for (var i = 0; i<this.mStruc[id][1].length; i++) this.mSel.options[this.mStruc[id][1][i]].selected =  this.mSel.options[id].selected }
	
	this.shiftGroupName = function(id){ this.mSel.options[this.mStruc[id][0]].selected = this.mSel.options[id].selected }

	this.lastSelectedInGroup = function (id) {
		var parentId = this.mStruc[id][0]
		for (var i = 0; i<this.mStruc[parentId][1].length; i++)
			if (this.mCache[this.mStruc[parentId][1][i]] == false && this.mStruc[parentId][1][i] != id) return false
		return true
		}

	this.onModelsChange = function(){//выделяем членов группы при выборе группы и наоборот
		function loadPrevious(mCache){ for (var j = 0; j < obj.options.length; j++) obj.options[j].selected = mCache[j] }
		var selected = lastSelId = 0 //кол-во выбранных на selectе
		var obj = this.mSel
		var tmpCache = new Array() //"свежий" массив с выбранными в селекте элементами
		tmpCache = this.getMcache()
		for (var i = 0; i<tmpCache.length; i++) if (tmpCache[i]) {selected++; lastSelId = i}
		if (tmpCache[0] && selected > 1) { loadPrevious (this.mCache); return true }
		if(!(selected == 1 && this.mStruc[lastSelId][0] != 0))
			for (var i = 0; i<tmpCache.length; i++) {
				if(tmpCache[i] != this.mCache[i]){
					if (this.mStruc[i][0] != 0){
						if ((tmpCache[i] == 1 && this.lastSelectedInGroup(i)) || (tmpCache[i] == 0 && tmpCache[this.mStruc[i][0]] == 1))
							this.shiftGroupName(i)
						}
					else if (this.mStruc[i][1].length != 0) this.shiftGroup(i)
					}
				}
		this.mCache = this.getMcache()
		}

	this.clearModels = function(){//опустошает список моделей
		this.mSel.options[0].selected = 0
		this.mSel.options.length = 1
		this.mStruc.length = 1
		this.mStruc[0] = new Array(0,new Array())//пункт "любая модель"
		}
	
	this.loadModels = function(){
		if (this.fields.brand.elem.selectedItem.value == 0) { this.clearModels(); return false } 
		var request = '&category_id=15&section_id=1&name=mark_id_parent&mark_id='+this.fields.brand.elem.selectedItem.value
		as.cons.logStringMessage(this.extJSURL+request)
		WebMethod(this.extJSURL+request, null, this.parseJSmodelsAnswer)
		}

	this.parseJSmodelsAnswer = function (response) {
		var found, regexp = /new Array\('([0-9]+?)', new Array\('([^'"]+?)','([0-9]+?)'\)\)/img
		as.form.data.length = 0
		while ((found = regexp.exec(response)) != null) as.form.data.push(new Array(found[1], found[3], found[2]))
		//as.cons.logStringMessage('загружена модель "'+found[2]+'" (id: '+found[1]+') с родителем (id) "'+found[3]+'"')
		as.form.models2form()
		if (as.form.selectModelsAfterJSload) {
			as.virt.fields[1].toForm()
			as.form.selectModelsAfterJSload = false
			as.form.onModelsChange()
			}
		}
	
	this.models2form = function(){
		var trData = new Array()//trans массив для чтения выбора с select [id, parent, name]
		var models = new Array()//упорядоченный массив с иерархией для вставки в select
		var tmp, tmp_i
		this.clearModels()
		trData = this.data
		for(var i = 0; i<trData.length; i++) {
			tmp_i = i //сортировка имён по алфавиту
			for(var j = i; j<trData.length; j++) if (trData[tmp_i][2] > trData[j][2]) tmp_i = j
			if (tmp_i != i) { tmp = trData[i]; trData[i] = trData[tmp_i]; trData[tmp_i] = tmp }
			}
		for (var i = 0; i<trData.length; i++)//распределяем по родителям
			if(trData[i][1] == 0){
				models.push(new Array(trData[i][2],trData[i][0],trData[i][1]))
				for(var j = 0; j<trData.length; j++) if (trData[j][1] == trData[i][0])
					models.push(new Array('– '+trData[j][2],trData[j][0],trData[j][1]))
			}		
		for (var i = 0; i<models.length; i++)//записываем иерархию в mStruc
			if(models[i][2] == 0){
				this.mStruc[i+1] = new Array(0, new Array())
				for(var j = 0; j<models.length; j++) if (models[j][2] == models[i][1]) {
					this.mStruc[i+1][1].push(j+1)
					this.mStruc[j+1] = new Array (i+1, new Array())
					}
				}
		for (var i = 0; i<models.length; i++) this.mSel.options[this.mSel.length] = new Option(models[i][0], models[i][1], false, false)
		this.mCacheClear()
		}

	
	this.rCacheClear = function () { this.rCache.length = 0; for (var i = 0; i<this.fields.region_id.elem.length; i++) this.rCache[i] = false }
	
	this.getRcache = function() {
		var arr = new Array()
		var obj = this.fields.region_id.elem;
		for (var i = 0; i<obj.length; i++) arr[i] = obj.options[i].selected
		return arr
		}	
	
	this.onRegionChange = function(){//проверяем чтобы не больше 3ёх было выбрано
		function loadPrevious(rCache){ for (var j = 0; j < obj.options.length; j++) obj.options[j].selected = rCache[j] }
		var obj = this.fields.region_id.elem; var k = 0
		for (var i = 0; i<obj.options.length; i++) if(obj.options[i].selected) k++
		if (obj.options[0].selected && k>1) { loadPrevious(this.rCache); return true }
		if (k < 4) for (var j = 0; j<obj.options.length; j++) this.rCache[j] = obj.options[j].selected
		else loadPrevious(this.rCache)
		if (k == 1 && obj.value != 0) this.loadCities(); else this.disableCitySelect()
		this.rCache = this.getRcache()
		}

	this.clearRegions = function(){
		var obj = this.fields.region_id.elem
		this.rCache.length = 0
		obj.disabled = false; obj.options[0].selected = false; obj.options.length = 1
		}
	
	this.loadRegions = function(){
		if (this.fields.country.elem.selectedItem.value == 0) { this.clearRegions(); return false } 
		var request = '&name=country_id&country_id='+this.fields.country.elem.selectedItem.value
		//as.cons.logStringMessage(this.extJSURL+request)
		WebMethod(this.extJSURL+request, null, this.parseJSregionsAnswer)
		}

	this.parseJSregionsAnswer = function (response) {
		var found, regexp = /new Array\('([0-9]*?)', '([^']*?)'\)/img
		as.form.rData.length = 0
		while ((found = regexp.exec(response)) != null) {
			as.form.rData.push(new Array(found[1], found[2]))
			//as.cons.logStringMessage('загружен регион/город '+found[1]+' "'+found[2]+'"')
			}
		if (response.indexOf('region_id', 20) != -1) {
			as.form.disableCitySelect()	
			as.form.regionsCities2form(1)
			as.form.rCacheClear()
			if (as.form.selectRegionsAfterJSload) {
				as.virt.fields[5].toForm()
				as.form.selectRegionsAfterJSload = false
				if (as.virt.fields[5].value.length == 1 && as.virt.fields[5].value[0] != 0) as.form.loadCities()
				as.form.rCache = as.form.getRcache()
				}
			}
		else if (response.indexOf('city_id', 20) != -1) {
			as.form.regionsCities2form(2)
			if (as.form.selectCityAfterJSload) {
				as.virt.fields[6].toForm()
				as.form.selectCityAfterJSload = false
				}
			}
		else as.cons.logStringMessage('AS.form.parseJSregionsAnswer: неизвестный формат ответа')
		}
	
	this.regionsCities2form = function (type){//вызывается после загрузки массивов регионов и городов для заполнения объектов
		var obj
		if(type == 1){//html:select региона
			as.cons.logStringMessage('AS.form.regionsCities2form: region_id, длинна массива - '+this.rData.length)
			obj = this.fields.region_id.elem
			this.clearRegions()
			if (this.rData.length > 1)	for (var i = 1; i < this.rData.length; i++)
					obj.options[i] = new Option(this.rData[i][1], this.rData[i][0], false, false)
			else {
				obj.disabled = true; obj.options[0].selected = false
				this.disableCitySelect()
				}
			}
		else if (type == 2) {//menulist города
			//as.cons.logStringMessage('AS.form.regionsCities2form: city_id, длинна массива - '+this.rData.length)
			obj = this.fields.city_id.elem
			for (var i = obj.itemCount; i>0; i--) obj.removeItemAt(i)
			if (this.rData.length > 1){
				obj.disabled = false; obj.selectedIndex = 0
				for (var i = 1; i<this.rData.length; i++) obj.appendItem(this.rData[i][1],this.rData[i][0])
				}
			}
		}
	
	this.disableCitySelect = function(){
		var obj = this.fields.city_id.elem
		obj.selectedIndex = 0
		for (var i = obj.itemCount; i>0; i--) obj.removeItemAt(i)
		obj.disabled = true
		}

	this.loadCities = function(){
		var request = '&name=region_id&country_id='+this.fields.country.elem.selectedItem.value+'&region_id='+this.fields.region_id.elem.value
		//as.cons.logStringMessage(this.extJSURL+request)
		WebMethod(this.extJSURL+request, null, this.parseJSregionsAnswer)
		}
	}

function mlSelectByVal(obj,val){
	for (var i=0; i<obj.itemCount; i++)
		if(obj.getItemAtIndex(i).value == val) { obj.selectedIndex = i; return true }
	try { as.cons.logStringMessage("AS.form.mlSelectByVal: at "+obj.id+" '"+val+"' not found") }
	catch (e) {}
	}

function lbSelectByVal(obj,val){
	for (var i=0; i<obj.itemCount; i++)
		if(obj.getItemAtIndex(i).value == val) {
			obj.addItemToSelection(obj.getItemAtIndex(i)); return true }
	try { as.cons.logStringMessage("AS.form.lbSelectByVal: at "+obj.id+" '"+val+"' not found") }
	catch (e) {}
	}

function slSelectByVals(obj,vals){
	for (var j = 0; j<vals.length; j++) for (var i = 0; i<obj.options.length; i++) 
			if (obj.options[i].value == vals[j]) obj.options[i].selected = true
	}

function checkDigit(obj){
	if (obj.value.length == 0) return false
	var key = obj.value[obj.value.length-1]
	var reg = /(^-?\d\d*$)/
	if (!reg.test(key)) obj.value = obj.value.slice(0,obj.value.length-1)
	}