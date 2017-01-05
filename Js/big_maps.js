define(function(require, exports, module){
    var $ = window.jQuery, echarts = window.echarts,basic = require('basic-min'),
        common = require('common'), r = require("request");
    var echartBind = !1,
        _chartRendering = !1;
    var _topPower = "",// 当前账户最高权限，优先参照_superUser
        _province = "", // @param 当前请求的地名（[全国|省|市|县]）
        _upperProvince = "", // 如果是市级单位，保存上一级省的名字
        _currentProvince = "", // 当前请求的省
        _currentCity= "", // 当前请求的市
        _currentPlace = "", // 当前请求的县
        _superUser = !1,// 是否为超级用户,如果是：_topPower = 1
        _alarmUnit = 0, // 报警单位
        _notAlarmUnit = 0, // 未报警单位
        _listener = null, // 是否已创建了监听
        _loading = !1; // 是否正在加载
    var provinceMapModule = {
            '安徽':'AnHui',
            '澳门':'AoMen',
            '北京':'Beijing',
            '重庆': 'ChongQing',
            '福建':'FuJian',
            '甘肃':'GanSu',
            '广东':'GuangDong',
            '广西':'GuangXi',
            '广州':'GuangZhou',
            '贵州':'GuiZhou',
            '海南':'HaiNan',
            '河北':'HeBei',
            '黑龙江':'HeiLongJiang',
            '河南': 'HeNan',
            '湖北':'HuBei',
            '湖南':'HuNan',
            '江苏':'JiangSu',
            '江西':'JiangXi',
            '吉林':'JiLin',
            '辽宁':'LiaoNing',
            '内蒙古':'NeiMengGu',
            '宁夏':'NingXia',
            '青海':'QingHai',
            '山东': 'ShanDong',
            '上海':'ShangHai',
            '陕西':'ShanXi',
            '山西':'ShanXi1',
            '四川':'SiChuan',
            '天津':'TianJin',
            '香港':'XiangGang',
            '西藏':'XiZang',
            '新疆':'XinJiang',
            '云南':'YunNan',
            '浙江':'ZheJiang',
            'china':'China'
        },
        doneRegion = [], // 已经加载过的js、json 文件名
        dicMap = {
            'china':'',
            '北京':[116.413554,39.911013],
            '上海':[121.480237,31.236305],
            '香港':[114.171994,22.281089],
            '重庆':[107.737331,29.86953],
            '澳门':[113.549403,22.192961],
            '天津':[117.205914,39.090908],
            '江苏':[119.720662,33.103567],
            '浙江':[119.654027,29.084455],

            '四川':[104.082256,30.656790],
            '江西':[115.676082,27.757258],
            '福建':[119.303040,26.106051],
            '青海':[97.16423,35.958153],
            '吉林':[126.556073,43.843512],
            '贵州':[106.713693,26.604242],
            '陕西':[109.503789,35.860026],

            '山西':[112.515496,37.866566],
            '河北':[117.220297,39.173149],
            '湖北':[112.410562,31.209316],
            '辽宁':[123.435847,41.841317],
            '湖南':[111.720664,27.695864],
            '山东':[118.527663,36.099290],
            '云南':[101.592952,24.864213],
            '河南':[113.631349,34.753488],

            '广东':[113.394818,23.408004],
            '安徽':[117.292218,31.867312],
            '甘肃':[102.194197,38.525777],
            '海南':[109.812393,19.159042],
            '黑龙江':[128.84704,47.733329],

            '内蒙古':[116.054141,43.939525],
            '新疆':[86.151584,41.770226],
            '广西':[108.924274,23.55225],
            '宁夏':[105.873736,37.435291],
            '西藏':[89.380418,30.982731]
        }; // 中心坐标
    var specialProvinces = ['北京', '上海', '香港', '重庆', '澳门', '天津', '江苏',
            '浙江', '四川', '江西', '福建', '青海', '吉林', '贵州', '陕西', '山西', '河北', '湖北',
            '辽宁', '湖南', '山东', '云南', '河南', '广东', '安徽', '甘肃', '海南', '黑龙江',
            '内蒙古', '新疆', '广西', '宁夏', '西藏'], // 可进行下钻的省名称
        specialCities = [
            '贵阳市',
            '淮安市',
            '无锡市',
            '桂林市',
            '河池市',
            '柳州市',
            '黔东南苗族侗族自治州'
        ], // 可进行下钻的市名称
        isolatedCity = ['北京', '上海', '香港', '重庆', '澳门', '天津'],
        disabledCity = ["神农架林区","仙桃市","天门市"],
        exceptions = ["加载地图数据失败,请重试"]; // 异常类型
    var levelEnum = {
            'country': {
                'content':"country",
                'label':1
            },
            'province': {
                'content':"province",
                'label':2
            },
            'city': {
                'content':"city",
                'label':3
            },
            'town': {
                'content':"town",
                'label':4
            }
        }, // 权限和请求地域的等级
        doneRegionJSON = {};

    /*  @@TEST
     *  Interface "monitor-online" of the "phone-number" is a special account
     *  [ boolean ]
     */
    var SpecialAccount = !1;

    (function(initMethod) {
        initMethod && initMethod();
        window.onload = initMethod;
        $(window).resize(function(){
            initMethod();
        });
        var SPECIAL = $.trim($('#special').val());
        var _level = $.trim($('#level').val()); // 请求地域的等级
        _topPower = levelEnum[_level]['label'];
        var mapElement = document.getElementById("container");
        var mapChart = echarts.init(mapElement);
        window.onresize = mapChart.resize;
        if($('#user_admin').val() == "2"){
            _province = 'china';
            _level = 'country';
        }else{
            if(_level == 'city'){
                _upperProvince = $.trim($('#init_province').val());
                _province = $.trim($('#init_city').val());
            }else{
                _province = $.trim($('#init_province').val());
            }
        }
        var theUpperProvince = "";
        mapStepRequest(_province, []);

        /** request map data
         *  @param String province
         *  @param Array LatiLongi
         *  &如果没有参数，默认全国地图 china
         */
        function mapStepRequest(province, LatiLongi) {
            /* @param of request
             * key : provinceName
             * value : province
             */
            if(_loading){
                return false;
            }
            _loading = !0;
            firstPillars() && unitAlarmData();
            return $.ajax({
                url: r.Request_Url_get_units,
                type: 'post',
                dataType: 'json',
                data: JSON.stringify({
                    level: _level,
                    provinceName: province || _province
                }),
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Cache-control","max-age="+2e4);
                },
                success: function (result) {
                    _province = result['province'] || province || _province;
                    _superUser = !!result['super_user'];
                    _level = result['level'] || _level;
                    var bindBtn = function(){
                            var o = $('.threeButton .append');
                            o.html('<input class="backBtn usable-btn" id="backBtn" value="后退" type="button">');
                        },
                        removeBtn = function(){
                            $('#backBtn').remove();
                        };
                    var data = result['unit_json'],
                        unit_name = result['unit_name'],
                        map_title = result['map_title'];
                    LatiLongi = LatiLongi || dicMap[_province];
                    (typeof data == "string") && (data = JSON.parse(data));
                    switch (levelEnum[_level]['label']){
                        case 2:
                            _currentProvince = _province;
                            break;
                        case 3:
                            _currentCity = _province;
                            break;
                    }
                    if(_superUser){
                        _topPower = 1;
                        if(_province.toUpperCase() != 'CHINA'){
                            bindBtn();
                        }else{
                            removeBtn();
                        }
                    }
                    else{
                        if(levelEnum[_level]['label'] > _topPower){
                            bindBtn();
                        }else{
                            removeBtn();
                        }
                    }
                    if(provinceMapModule[_province]){
                        _level = levelEnum['province']['content'];
                        if(_province.toUpperCase == 'CHINA'){
                            _level = levelEnum['country']['content'];
                        }
                        renderMap(_province, _superUser, data, unit_name, LatiLongi,map_title);
                    }else{
                        _level = levelEnum['city']['content'];
                        getGeoData(_currentProvince ||　_upperProvince,_province,function(){
                            renderMap(_province, _superUser, data, unit_name, LatiLongi,map_title);
                        });
                    }
                    /*@DEMO
                     * (!SPECIAL || SPECIAL.toString().toUpperCase() == "FALSE")
                     * ? renderMap(_province, _superUser, data, unit_name, LatiLongi,map_title)
                     * : renderAreaMap(data, _superUser, unit_name, map_title);
                     */
                    secondBox(data.length);
                    return true;
                },
                error: function (e) {
                    console.log(e);
                    return false;
                }
            });
        }

        /*
         *  渲染地图
         */
        function renderMap(cityName, superUser, recordList, userUnitName, LatiLongi,map_title) {
            $('#box_con').empty();
            _alarmUnit = 0;
            _notAlarmUnit = 0;
            var len = recordList.length,arr = [], geoCoordMap = {};
            for (var i = 0; i < len; i++) {
                var record = recordList[i];
                var name = record['name'],
                    hasAlarm = record['has_alarm'];
                if (hasAlarm == 300) {
                    _alarmUnit++;
                }
                arr.push({name: name, value: hasAlarm});
                geoCoordMap[name] = [record['latitude'], record['longitude']]
            }
            _notAlarmUnit = len - _alarmUnit;
            var convertData = function (data) {
                    var res = [];
                    for (var i = 0; i < data.length; i++) {
                        var geoCoord = geoCoordMap[data[i].name];
                        if (geoCoord) {
                            res.push({
                                name: data[i].name,
                                value: geoCoord.concat(data[i].value)
                            });
                        }
                    }
                    return res;
                },
                alarmData = function (data) {
                    var res = [];
                    for (var i = 0; i < data.length; i++) {
                        var geoCoord = geoCoordMap[data[i].name];
                        if (geoCoord) {
                            if (data[i].value == 300) {
                                res.push({
                                    name: data[i].name,
                                    value: geoCoord.concat(data[i].value)
                                });
                            }
                        }
                    }
                    return res;
                };
            common.isNil(cityName) && superUser && (cityName = 'china');
            $('#mapTitle .self-unit-name').text(userUnitName);
            $('#mapTitle .self-map-title').text(map_title || '智慧用电及电气安全大数据中心');
            var rendering = function(){
                var option = {
                    backgroundColor: '#404a59',
                    //title: {
                    //    top:'20',
                    //    text: userUnitName,
                    //    subtext: map_title || '智慧用电及电气安全大数据中心',
                    //    left: 'center',
                    //    textStyle: {
                    //        color: '#fff',
                    //        fontSize:16,
                    //        fontFamily: '黑体'
                    //    },
                    //    subtextStyle: {
                    //        fontSize:16,
                    //        color:"#fff",
                    //        fontWeight:'bold',
                    //        fontFamily: '黑体'
                    //    },
                    //    itemGap:basic.browserVersions().gecko?0:-15
                    //},
                    tooltip : {
                        trigger: 'item',
                        formatter: '{b}'
                    },
                    mapLocation: {
                        x: 'left',
                        y: 'top',
                        width: '30%'
                    },
                    legend: {
                        orient: 'horizontal',
                        x: '38%',
                        bottom: '30',
                        icon: 'map',
                        data: ['正常', '报警'],
                        textStyle: {
                            color: ['black', 'green']
                        },
                        selectedMode: 'multiple'
                    },
                    geo: {
                        map: cityName,
                        center: "",
                        zoom: 0,
                        label: {
                            emphasis: {
                                show: false
                            }
                        },
                        roam: true,
                        itemStyle: {
                            normal: {
                                areaColor: '#323c48',
                                borderColor: '#111'
                            },
                            emphasis: {
                                areaColor: '#2a333d'
                            }
                        }
                    },
                    series: [
                        {
                            name: '报警',
                            type: 'effectScatter',
                            coordinateSystem: 'geo',
                            data: alarmData(arr),
                            symbolSize: function (val) {
                                if (val[2] == 300) {
                                    return val[2] / 30;
                                }
                            },
                            showEffectOn: 'render',
                            rippleEffect: {
                                brushType: 'stroke'
                            },
                            showLegendSymbol: true,
                            hoverAnimation: true,
                            label: {
                                normal: {
                                    formatter: '{b}',
                                    position: 'right',
                                    show: false
                                }
                            },
                            itemStyle: {
                                normal: {
                                    color: 'orange',
                                    shadowBlur: 10,
                                    shadowColor: '#333'
                                }
                            }

                        },
                        {
                            name: '正常',
                            type: 'effectScatter',
                            coordinateSystem: 'geo',
                            center: [121.472644, 31.231706],
                            zoom: 20,
                            data: convertData(arr),
                            symbolSize: function (val) { //data里的value值
                                if (val[2] == 400) {
                                    return val[2] / 40;
                                }
                            },
                            showEffectOn: 'render',
                            rippleEffect: {
                                brushType: 'stroke'
                            },
                            showLegendSymbol: true,
                            hoverAnimation: true,
                            label: {
                                normal: {
                                    formatter: '{b}',
                                    position: 'left',
                                    show: false
                                },
                                emphasis: {
                                    show: true
                                }
                            },
                            itemStyle: {
                                normal: {
                                    color: '#10a762',
                                    formatter: 555,
                                    shadowBlur: 10,
                                    shadowColor: '#333'
                                }
                            }
                        }
                    ]
                };
                mapChart.setOption(option);
            };
            if(provinceMapModule[_province]){
                if(doneRegion.indexOf(cityName) >= 0){
                    rendering();
                }
                else{
                    var script = common.introduceScript('/media/js/echarts/chart/province/' + provinceMapModule[cityName] + '.js');
                    script.onload = function () {
                        if (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete') {
                            doneRegion.push(cityName);
                            rendering();
                        }
                    }
                }
            }
            else{
                rendering();
            }
            if(!echartBind){
                mapChart.on('click', function (params) {
                    if($('#container').hasClass('loading') || _chartRendering){
                        return false;
                    }
                    var event = event || window.event || arguments.callee.caller.arguments[0];
                    event.stopPropagation && event.stopPropagation();
                    if(_loading) return false;
                    if(disabledCity.indexOf(params['name']) > -1){
                        confirm("该地区地图暂未开通");
                        return false;
                    }
                    $(mapElement).addClass('loading');
                    _chartRendering = !0;
                    _province = params['name'];
                    // Safety judgment
                    if(params['region'] && params['region']['name'] == _province){
                        if( provinceMapModule[_province]){
                            $('#thirdBoxLeft').empty();
                            _level = levelEnum['province']['content'];
                            _currentProvince = _province;
                            callBack();
                        }
                        else{
                            if(_currentCity || isolatedCity.indexOf(_currentProvince) > -1){
                                window.location.href = r.Request_Url_get_device_map + '?provinceName=' + params.name + '&region='+_currentProvince;
                                return false;
                            }
                            _level = levelEnum['city']['content'];
                            _currentCity = _province;
                            if(
                                specialCities.indexOf(_province) > -1 ||
                                specialProvinces.indexOf(_currentProvince) > -1 ||
                                specialProvinces.indexOf(_currentProvince+"省") > -1
                            ){
                                getGeoData(
                                    _currentProvince,
                                    _currentCity,
                                    callBack(_province)
                                );
                            }
                            else{
                                window.location.href = r.Request_Url_get_device_map + '?provinceName=' + params.name + '&region='+_currentProvince;
                                return false;
                            }
                        }
                    }
                    else{
                        window.location.href = r.Request_Url_get_device_map + '?unit_name=' + params.name + '&region='+_currentProvince;
                        return false;
                    }
                    function callBack(provinceName){
                        mapStepRequest(provinceName);
                        /*if (_province.toUpperCase() == 'CHINA') {
                         $('.backBtn').remove();
                         } else {

                         }*/
                        //_listener && clearSetTime();
                    }
                });
                mapChart.on('mouseover',function (params) {
                    if(!params['region']){
                        return false;
                    }
                    var placeName = params.name;
                    var event = event || window.event || arguments.callee.caller.arguments[0];
                    var x = event.pageX + 40, y = event.pageY + 40,hover = $('#hintProvince');
                    hover.text(placeName),hover.css({
                        'left':x + 'px',
                        'top':y + 'px',
                        'width': placeName.length * 16 + 'px',
                        'display':'inline-block'
                    });
                    event.stopPropagation && event.stopPropagation();
                    return false;
                });
                $(document).on('mousemove',function (params) {
                    var hover = $('#hintProvince');
                    if(!hover[0] || !hover.text()){
                        return false;
                    }
                    var placeName = hover.text();
                    var event = event || window.event || arguments.callee.caller.arguments[0];
                    var x = event.pageX + 40, y = event.pageY + 40;
                    hover.css({
                        'display':'inline-block',
                        'left':x + 'px',
                        'top':y + 'px',
                        'width': placeName.length * 15 + 'px'
                    });
                    event.stopPropagation && event.stopPropagation();
                    return false;
                });
                mapChart.on('mouseout', function (params) {
                    var event = event || window.event || arguments.callee.caller.arguments[0];
                    var hover = $('#hintProvince');
                    hover.css({
                        'display':'none',
                        'bottom':0 + 'px',
                        'right':0 + 'px'
                    }),hover.text("");
                    event.stopPropagation && event.stopPropagation();
                    return false;
                });
                echartBind = !0;
            }
            window.mapChart = mapChart;
            $('#container').removeClass('loading'),
                _chartRendering = !1;
        }

        /*
         * 加载 geo json 数据
         * @param provinceName 省的名字
         * @param cityName 市的名字
         * @param callBack　渲染完成，回调函数
         */
        function getGeoData(provinceName,cityName,callBack){
            console.info(provinceName);
            console.info(cityName);
            var isFn = typeof cityName == 'function' && (callBack = cityName);
            cityName = (isFn || !cityName) ? "ALL" : cityName;
            var path = '/media/js/mapdata/';
            (cityName) && (_level = levelEnum['city']['content']);
            try{
                $.ajaxSetup({
                    error:function(x,e){
                        _currentCity = "";
                        _province = _currentProvince;
                        _level = levelEnum['province']['content'];
                        mapStepRequest(_province);
                        confirm("该地区地图暂未开通");
                        return false;
                    }
                });
                function loadChinaDone(a){
                    try{
                        if(a){
                            for(var i = 0; i <  a.features.length; i++){
                                var o = a.features[i];
                                var province = o.properties;
                                var provinceA = doneRegionJSON[province['id']];
                                //console.info("省："+province.name + ' -- ' + province.id);
                                if(common.isNil(provinceName)){
                                    if(!common.isNil(provinceA)){
                                        loadProvinceDone(provinceA);
                                    }
                                    else{
                                        $.getJSON(path + 'geometryProvince/'+ province['id'] +'.json',function(a,b,c){
                                            if(a && b.toUpperCase() == 'SUCCESS'){
                                                doneRegionJSON[province['id']] = a;
                                                loadProvinceDone(a);
                                            }
                                            else{
                                                throw exceptions[0]+"file '"+ province['name'] +"("+province['id']+").json'"
                                            }
                                        });
                                    }
                                }
                                else{
                                    if(province['name'] == provinceName || province['name'] == (provinceName+"省")){
                                        if(!common.isNil(provinceA)){
                                            loadProvinceDone(provinceA);
                                        }
                                        else{
                                            $.getJSON(path + 'geometryProvince/'+ province['id'] +'.json',function(a,b,c){
                                                if(a && b.toUpperCase() == 'SUCCESS'){
                                                    doneRegionJSON[province['id']] = a;
                                                    loadProvinceDone(a);
                                                }
                                                else{
                                                    throw exceptions[0]+"file '"+ province['name'] +"("+province['id']+").json'"
                                                }
                                            });
                                        }
                                        return true;
                                    }
                                }
                            }
                        }
                    }catch (e){
                        confirm("该地区地图暂未开通");
                    }
                }
                function loadProvinceDone(a){
                    //console.info("province\n");
                    //console.info(a);
                    try{
                        if(a){
                            var len = a.features?a.features.length:0;
                            for(var p = 0; p < len; p++) {
                                var o = a.features[p];
                                var city = o['properties'];
                                var cityA = doneRegionJSON[city['id']];
                                if (cityName.toUpperCase() == 'ALL') {
                                    if (!common.isNil(cityA)) {
                                        loadCityDone(cityA, p, len);
                                    }
                                    else {
                                        $.getJSON(path + 'geometryCouties/' + city['id'] + '00.json', function (a, b, c) {
                                            if (a && b.toUpperCase() == 'SUCCESS') {
                                                doneRegionJSON[city['id']] = a;
                                                loadCityDone(a, p, len);
                                            } else {
                                                throw exceptions[0] + "file '" + city['name'] + "(" + city['id'] + ").json'"
                                            }
                                        });
                                    }
                                }
                                else {
                                    if (city['name'] == cityName || city['name'].replace("地区","").replace("市","") == cityName.replace("地区","").replace("市","")) {
                                        if (!common.isNil(cityA)) {
                                            loadCityDone(cityA);
                                        }
                                        else {
                                            $.getJSON(path + 'geometryCouties/' + city['id'] + '00.json', function (a, b, c) {
                                                if (a && b.toUpperCase() == 'SUCCESS') {
                                                    doneRegionJSON[city['id']] = a;
                                                    loadCityDone(a);
                                                } else {
                                                    throw exceptions[0] + "file '" + city['name'] + "(" + city['id'] + ").json'"
                                                }
                                            });
                                        }
                                        return;
                                    }
                                }
                            }
                        }
                    }catch (e){
                        confirm("该地区地图暂未开通");
                    }
                }
                function loadCityDone(a,p,len){
                    //console.info("city\n");
                    //console.info(a);
                    if(a){
                        echarts.registerMap(cityName, a);
                        if(!common.isNil(p)){
                            (p == len - 1) && callBack && callBack();
                        }
                        else{
                            callBack && callBack();
                        }
                    }
                }
                (function(){
                    var a = doneRegionJSON['china'];
                    if(!common.isNil(a)){
                        loadChinaDone(a);
                    }
                    else{
                        $.getJSON(path + 'china.json',function(a,b,c){
                            if(a && b.toUpperCase() == 'SUCCESS'){
                                doneRegionJSON['china'] = a;
                                loadChinaDone(a);
                            }else{
                                throw exceptions[0]+"file 'china.json'"
                            }
                        });
                    }
                })();
            }catch (e){
                alert(e);
                return false;
            }
        }

        /** 第一图  柱状图
         *  @param alarm_count_arr 报警总数数组
         *  @param not_alarm_count_arr 未报警总数数组
         */
        function firstPillars(alarm_count_arr, not_alarm_count_arr,day_arr) {
            return $.ajax({
                url: r.Request_Url_get_alarm_data,
                type: 'post',
                dataType: 'json',
                data: JSON.stringify({
                    level: _level,
                    provinceName: _province
                }),
                success: function(result){
                    var first_report_json = JSON.parse(result['first_report_json']);
                    var alarm_count_arr = first_report_json['alarm_count_arr'],
                        day_arr = first_report_json['day_arr'],
                        not_alarm_count_arr = first_report_json['not_alarm_count_arr'],
                        not_alarm_count_sum = first_report_json['not_alarm_count_sum'],
                        not_solve_alarm_sum = first_report_json['not_solve_alarm_sum'];
                    $('#pillars').empty();
                    firstPieChart(not_solve_alarm_sum,not_alarm_count_sum);
                    var barChart = echarts.init(document.getElementById('pillars'));
                    var barOption = {
                        title: {
                            text: '图表',
                            x: 'left',
                            textStyle: {
                                fontSize: '20',
                                color: 'orange',
                                fontWeight: 'bold',
                                fontFamily: '黑体'
                            }
                        },
                        legend: {
                            data: ['报警次数', '处理次数'],
                            textStyle: {
                                color: '#fff',
                                fontFamily: '宋体'
                            },
                            y: 'bottom',
                            x: '40'
                        },
                        tooltip: {
                            trigger: 'axis',
                            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                                type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                            },
                            textStyle: {
                                color: '#fff',
                                fontStyle: 'normal',
                                fontWeight: 'normal',
                                fontFamily: '宋体',
                                fontSize: 12
                            }
                        },
                        grid: {
                            x: 40,
                            x2: 20,
                            y: 60,
                            y2: 65
                        },
                        xAxis: [
                            {
                                type: 'category',
                                data: day_arr,
                                axisLabel: {
                                    textStyle: {
                                        color: "#fff",
                                        fontWeight: 'normal',
                                        fontFamily: '宋体'
                                    },
                                    interval: 0,
                                    boundaryGap: false
                                },
                                axisTick: {
                                    show: true,
                                    lineStyle: {
                                        color: '#fff'
                                    }
                                },
                                axisLine: {
                                    lineStyle: {
                                        color: "#FFF"
                                    }
                                },
                                splitLine: {show: false}

                            }
                        ],
                        yAxis: [
                            {
                                type: 'value',
                                axisLabel: {
                                    textStyle: {
                                        color: "#fff",
                                        fontWeight: 'normal',
                                        fontFamily: '宋体'
                                    }
                                },
                                axisLine: {
                                    lineStyle: {
                                        color: "#FFF"
                                    }
                                },
                                splitLine: {show: false}
                            }
                        ],
                        series: [
                            {
                                name: '报警次数',
                                barWidth: 13,
                                barCategoryGap: '50%',
                                type: 'bar',
                                itemStyle: {
                                    normal: {
                                        color: 'red',
                                        barBorderRadius: 3
                                    }
                                },
                                data: alarm_count_arr
                            },
                            {
                                name: '处理次数',
                                type: 'line',
                                data: not_alarm_count_arr,
                                //data:[2000,1000,1500,1300,1245,1524,2655],
                                itemStyle: {
                                    normal: {
                                        color: 'green'
                                    }
                                }
                            }

                        ]
                    };
                    barChart.setOption(barOption);
                },
                error: function(error){
                    console.info(error);
                }
            });
        }
        /*  环形图
         *  @param not_solve_alarm_sum 未处理
         *  @param not_alarm_count_sum 未报警数量总和
         */
        function firstPieChart(not_solve_alarm_sum,not_alarm_count_sum){
            $('#pieChart').empty();
            var detailNum = basic.browserVersions().gecko?5:-5;
            var barChart = echarts.init(document.getElementById('pieChart'));
            var barOption = {
                title : {
                    text: '7天报警处理率',
                    x:'center',
                    y:'10',
                    textStyle: {
                        fontSize: '14',
                        color:'#fff',
                        fontWeight:'normal',
                        fontFamily: '黑体'
                    }
                },
                legend: {
                    x: '10',
                    y: '200',
                    data:['已处理','未处理'],
                    itemGap:detailNum,
                    textStyle: {
                        fontSize: '12',
                        color:'#fff',
                        fontFamily: '宋体'
                    }
                },
                color:['#e7ae05','#46a9c6'],
                series: [
                    {
                        name:'访问来源',
                        type:'pie',
                        center : ['46%', 130],
                        avoidLabelOverlap: false,
                        hoverAnimation:false,
                        itemStyle : {
                            normal: {
                                show: false,
                                position: 'center',
                                labelLine : {
                                    show : false
                                },
                                label:{
                                    show: false
                                }
                            },
                            emphasis: {
                                label : {
                                    show : true,
                                    position : 'center',
                                    formatter: "{d}%",
                                    textStyle : {
                                        color : '#fff',
                                        fontSize : '12',
                                        fontFamily : '宋体',
                                        fontWeight: 'bold'
                                    }
                                }
                            }

                        },
                        label: {
                            normal: {
                                show: false,
                                position: 'center'
                            }
                        },
                        radius: ['50%', '80%'],
                        data:[
                            {value:not_alarm_count_sum?not_alarm_count_sum:null, name:'已处理'},
                            {value:not_solve_alarm_sum?not_solve_alarm_sum:null, name:'未处理'}
                        ]
                    }
                ]
            };
            barChart.setOption(barOption);
        }

        /** 第二图  secondBox
         *  @param units 所有的单位
         */
        function secondBox(units){
            $.ajax({
                url: r.Request_Url_monitor_online,
                type:'post',
                dataType:'json',
                data:JSON.stringify({
                    level: _level,
                    provinceName: _province
                }),
                success: function(result){
                    $('#secondBoxLeft').empty();
                    $('#secondBoxRight').empty();
                    var monitors_online_json = result['monitors_online_json'],
                        unit_name = result['unit_name'],
                        phoneNumber = result['phone_number'];
                    monitors_online_json ? monitors_online_json = JSON.parse(monitors_online_json) : monitors_online_json = {};
                    var arc_status = monitors_online_json['arc_status'],
                        online_status = monitors_online_json['online_status'],
                        water_status = monitors_online_json['water_status'];
                    var monitor_counts = arc_status.length + online_status.length + water_status.length;
                    if($.trim(phoneNumber) == basic.constant.SpecialAccountValue){
                        SpecialAccount = !0,
                            $("#totalUnit").html("接入单位:2189&nbsp;接入设备:23305");
                    }else{
                        SpecialAccount = !1,
                            $("#totalUnit").html("接入单位:"+units + "&nbsp;接入设备:"+monitor_counts);
                    }
                    arc_status && (arc_status = arc_status.join());
                    online_status && (online_status = online_status.join());
                    water_status && (water_status = water_status.join());
                    var arc_status_un_line = arc_status?arc_status.split("0").length - 1:0,
                        online_status_un_line = online_status?online_status.split("0").length - 1:0,
                        water_status_un_line = water_status?water_status.split("0").length - 1:0;
                    var un_online_counts = arc_status_un_line + online_status_un_line + water_status_un_line;
                    var alarm_unit = _alarmUnit,not_alarm_unit = _notAlarmUnit;
                    thirdBox(arc_status?arc_status.split(',').length:0, online_status?online_status.split(',').length:0, water_status?water_status.split(',').length:0, arc_status_un_line, online_status_un_line, water_status_un_line);
                    var barChart = echarts.init(document.getElementById('secondBoxLeft'));
                    var barOption = {
                        title : {
                            text: '统计单位',
                            x:'left',
                            textStyle: {
                                fontSize: '20',
                                color:'orange',
                                fontWeight: 'bold'
                            }
                        },
                        tooltip: {
                            trigger: 'item',
                            formatter: "{d}%",
                            textStyle:{
                                fontStyle: 'normal',
                                fontWeight: 'normal',
                                fontFamily: '宋体'
                            }
                        },
                        legend: {
                            x: 'center',
                            y:"250",
                            data:['未报警单位','报警单位'],
                            textStyle: {
                                fontSize: '12',
                                color:'#fff',
                                fontFamily:'宋体'
                            },
                            itemGap:10
                        },
                        color:['#10a762','orange'],
                        animation:false,
                        series: [
                            {
                                name:'单位',
                                type:'pie',
                                x:'left',
                                y:'bottom',
                                center : ['48%', 180],
                                itemStyle : {
                                    normal : {
                                        label : {
                                            show : true,
                                            formatter: "{d}%"
                                        },
                                        labelLine : {
                                            show : false,
                                            length:0
                                        }
                                    }
                                },
                                radius: ['26%', '40%'],
                                data:[
                                    {value:not_alarm_unit, name:'未报警单位'},
                                    {value:alarm_unit, name:'报警单位'}
                                ]
                            }
                        ]
                    };
                    var barChart2 = echarts.init(document.getElementById('secondBoxRight'));
                    var barOption2 = {
                        title : {
                            x:'left',
                            textStyle: {
                                fontSize: '20',
                                color:'orange',
                                fontWeight: 'bold'
                            }
                        },
                        tooltip: {
                            trigger: 'item',
                            formatter: "{d}%",
                            textStyle:{
                                fontStyle: 'normal',
                                fontWeight: 'normal',
                                fontFamily: '宋体'
                            }
                        },
                        legend: {
                            x: 'center',
                            y:"250",
                            data:['总设备','在线设备'],
                            textStyle: {
                                fontSize: '12',
                                color:'#fff',
                                fontFamily:'宋体'
                            },
                            itemGap:10
                        },
                        color:['#2d5c86','#46a9c6'],
                        animation:false,
                        series: [
                            {
                                name:'设备',
                                type:'pie',
                                x:'left',
                                y:'bottom',
                                center : ['50%', 180],
                                itemStyle : {
                                    normal : {
                                        label : {
                                            show : true,
                                            formatter: "{d}%"
                                        },
                                        labelLine : {
                                            show : false,
                                            length:0
                                        }
                                    }
                                },
                                radius: ['26%', '40%'],
                                data:[
                                    {value:un_online_counts, name:'总设备'},
                                    {value:monitor_counts - un_online_counts, name:'在线设备'}
                                ]
                            }
                        ]
                    };
                    barChart.setOption(barOption);
                    barChart2.setOption(barOption2);
                },
                error: function(error){
                    console.log(error);
                    return false;
                }
            });
        }

        /** 第三个图  thirdBox
         *  @param mon_arc_all
         *  @param mon_online_all
         *  @param mon_water_all
         *  @param mon_off_arc
         *  @param mon_off_online
         *  @param mon_off_water
         *  ?? mon_arc_all,mon_online_all,mon_water_all,mon_on_arc,mon_on_online,mon_on_water
         */
        function thirdBox(mon_arc_all,mon_online_all,mon_water_all,mon_off_arc,mon_off_online,mon_off_water){
            $('#thirdBoxLeft').empty();
            var mon_on_arc = mon_arc_all - mon_off_arc, //在线的灭弧个数
                mon_on_online = mon_online_all - mon_off_online,//在线的在线设备个数
                mon_on_water = mon_water_all - mon_off_water;//在线的水位设备个数
            var unit_menu_arr = [],
                online_unit_menu_arr = [],
                unline_unit_menu_arr = [],
                isEffective = function(d){
                    if(common.isNil(d) || Number(d) <= 0){
                        return false;
                    }
                    return true;
                },
                render_arc = !1,render_online = !1,render_water = !1;
            if(SpecialAccount){
                mon_arc_all += 3000,mon_on_arc += 3000;
                mon_online_all += 4000,mon_on_online += 4000;
                mon_water_all += 3000,mon_on_water += 3000;
            }
            if(isEffective(mon_arc_all) || isEffective(mon_on_arc)){
                unit_menu_arr.push('灭弧');
                online_unit_menu_arr.push(mon_on_arc);
                unline_unit_menu_arr.push(mon_arc_all-mon_on_arc);
                render_arc = !0;
            }
            if(isEffective(mon_online_all) || isEffective(mon_on_online)){
                unit_menu_arr.push('在线监测装置');
                online_unit_menu_arr.push(mon_on_online);
                unline_unit_menu_arr.push(mon_online_all-mon_on_online);
                render_online = !0
            }
            if(isEffective(mon_water_all) || isEffective(mon_on_water)){
                unit_menu_arr.push('水位检测仪');
                online_unit_menu_arr.push(mon_on_water);
                unline_unit_menu_arr.push( mon_water_all-mon_on_water);
                render_water = !0;
            }
            onlineRate(mon_arc_all,mon_online_all,mon_water_all,mon_on_arc,mon_on_online,mon_on_water,render_arc,render_online,render_water);
            try{
                if(!render_arc && !render_online && !render_water){
                    return false;
                }
                var barChart = echarts.init(document.getElementById('thirdBoxLeft'));
                var barOption = {
                    title : {
                        text: '设备在线率',
                        textStyle: {
                            fontSize: '20',
                            color:'orange',
                            fontFamily: '黑体'
                        }
                    },
                    tooltip : {
                        trigger: 'axis',
                        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                            show:false,
                            type : 'shadow'       // 默认为直线，可选为：'line' | 'shadow'
                        },
                        textStyle: {
                            color: '#fff',
                            fontStyle: 'normal',
                            fontWeight: 'normal',
                            fontFamily: '宋体',
                            fontSize: 12
                        }
                    },
                    xAxis : [
                        {
                            type : 'value',
                            name :'设备总数',
                            nameGap: 3,
                            nameTextStyle: {
                                fontWeight: 'normal',
                                fontFamily: '宋体',
                                fontSize: 12
                            },
                            axisLine: {
                                lineStyle: {
                                    color: '#fff'
                                }
                            },
                            axisLabel:{
                                rotate:45,
                                textStyle:{
                                    color:"#fff",
                                    fontFamily: '宋体',
                                    fontSize: 12,
                                    fontWeight:'normal'
                                },
                                interval:'auto',
                                boundaryGap : false
                            },
                            splitLine:{show: false}
                        }
                    ],
                    grid: {
                        x: 92,
                        x2: 58,
                        y: 75,
                        y2: 40
                    },
                    yAxis : [
                        {
                            type : 'category',
                            name :'设备类型',
                            nameGap: 0,
                            nameTextStyle: {
                                fontWeight: 'normal',
                                fontFamily: '宋体',
                                fontSize: 12
                            },
                            data : unit_menu_arr,//['灭弧','在线监测装置','水位检测仪'],
                            axisLine: {
                                lineStyle: {
                                    color: '#fff'
                                }
                            },
                            axisLabel:{
                                textStyle:{
                                    color:"#fff",
                                    fontFamily: '宋体',
                                    fontSize: 12
                                }
                            },
                            axisTick:{
                                show:true,
                                lineStyle:{
                                    color:'#fff'
                                }
                            },
                            splitLine:{show: false}
                        }
                    ],
                    calculable:{ show:false},
                    series : [
                        {
                            name:'在线设备',
                            type:'bar',
                            data:online_unit_menu_arr,
                            barWidth:20,
                            stack: 'sum',
                            itemStyle: {
                                normal: {
                                    color: function(params) {
                                        var colorList = [
                                            '#2d5c86','#b4982d','#339894'
                                        ];
                                        return colorList[params.dataIndex]
                                    },
                                    label : {
                                        show: true, position: 'insideTop',
                                        textStyle:{
                                            fontStyle: 'normal',
                                            fontWeight: 'normal',
                                            fontFamily: '宋体'
                                        }
                                    }
                                }
                            }
                        },
                        {
                            name:'离线设备',
                            type:'bar',
                            barWidth:20,
                            stack: 'sum',
                            itemStyle: {
                                normal: {
                                    color: function(params) {
                                        var colorList = [
                                            '#2a67c0','#d8b02a','#27d2c0'
                                        ];
                                        return colorList[params.dataIndex]
                                    },
                                    label : {
                                        show: true,
                                        position: 'insideTop',
                                        formatter: '{c}',
                                        textStyle:{
                                            fontStyle: 'normal',
                                            fontWeight: 'normal',
                                            fontFamily: '宋体'
                                        }

                                    }
                                }
                            },
                            data:unline_unit_menu_arr
                        }

                    ]
                };
                barChart.setOption(barOption);
            }catch (e){}
        }
        /***** other rate ******
         *  @param mon_arc_all
         *  @param mon_online_all
         *  @param mon_water_all
         *  @param mon_on_arc
         *  @param mon_on_online
         *  @param mon_on_water
         */
        function onlineRate(mon_arc_all, mon_online_all, mon_water_all, mon_on_arc, mon_on_online, mon_on_water,render_arc,render_online,render_water) {
            if (mon_arc_all == null && mon_online_all == null && mon_water_all == null && mon_on_arc == null && mon_on_online == null && mon_on_water == null) {
                var mon_off_arc = 0; //离线的灭弧数组
                var mon_off_online = 0;//离线的在线设备数组
                var mon_off_water = 0;//离线的水位设备数组
                mon_on_arc = mon_arc_all - mon_off_arc; //在线的灭弧个数
                mon_on_online = mon_online_all - mon_off_online;//在线的在线设备个数
                mon_on_water = mon_water_all - mon_off_water;//在线的水位设备个数
            }
            $('#thirdBoxRight').empty();
            $('#circle1').empty(),$('#circle2').empty(),$('#circle3').empty();
            var renderCounts = 0;
            if(SpecialAccount){
                mon_arc_all += 3000,mon_on_arc += 3000;
                mon_online_all += 4000,mon_on_online += 4000;
                mon_water_all += 3000,mon_on_water += 3000;
            }
            try{
                if(render_arc){
                    $("#circle3").radialIndicator({
                        barColor: '#2a67c0',
                        barWidth: 5,
                        initValue:Math.round((mon_on_arc/mon_arc_all)*100) ,
                        roundCorner : true,
                        percentage: true,
                        radius:20,
                        barBgColor:"#fff"
                    });
                    renderCounts++;
                }
                if(render_online){
                    $("#circle2").radialIndicator({
                        barColor: '#d6b323',
                        barWidth: 5,
                        initValue: Math.round((mon_on_online/mon_online_all)*100) ,
                        roundCorner : true,
                        percentage: true,
                        radius:20,
                        barBgColor:"#fff" // or "#3e4154"
                    });
                    renderCounts++;
                }
                if(render_water){
                    $("#circle1").radialIndicator({
                        barColor: '#27d2c0',
                        barWidth: 5,
                        initValue:  Math.round((mon_on_water/mon_water_all)*100),
                        roundCorner : true,
                        percentage: true,
                        radius:20,
                        barBgColor:"#fff"
                    });
                    renderCounts++;
                }
            }catch(e){}
            $('.threeCicle p').show();
            if(renderCounts == 3){
                $('.circle').css("margin","5px 0px");
            }else if(renderCounts == 2){
                $('.circle').css("margin","22px 0px 25px 0px");
            }else if(renderCounts == 1){
                $('.circle').css("margin","62px 0px");
            }else if(renderCounts == 0){
                $('#thirdBoxLeft').html('<h1 class="hint-h1">暂未获取到设备信息<\/h1>');
                $('.threeCicle p').hide();
            }
        }

        /** 第四图-报警数据
         *  @param monitoring_json  报警数据
         */
        function unitAlarmData(monitoring_json){
            $.ajax({
                url: r.Request_Url_get_monitors,
                type: 'post',
                dataType: 'json',
                data: JSON.stringify({
                    level: _level,
                    provinceName: _province
                }),
                success: function (result) {
                    var alarming_json = JSON.parse(result['alarming_json']);
                    $('.monitoring').empty();$('#monitoring_self').empty();$('#monitoring_call').empty();
                    var counts = 0, hint = "单位设备报警", ulList = "";
                    for (var i = 0; i < alarming_json.length; i++) {
                        var o = alarming_json[i],
                            states = o['states'];
                        if (states && states.length > 0){
                            for(var k=0;k < states.length;k++){
                                counts++;
                                ulList +=
                                    "<a href='#' title='"+o['unit_name']+"&nbsp;&nbsp;&nbsp;"
                                    +o['name']+"&nbsp;&nbsp;&nbsp;"+states[k]+"&nbsp;&nbsp;"+o['sn_num']+"'>"
                                    +"<li>"
                                    +"<p>"+o['unit_name']+"</p>"
                                    +"<p>"+o['name']+"</p>"
                                    +"<p class='unit-name'>"
                                    +states[k]
                                    +"</p>"
                                    +"<p class='bjz'>"
                                    +o['sn_num']
                                    +"</p>"
                                    + "</li>"
                                    +"</a>";
                            }
                        }
                    }
                    $(ulList).appendTo($('.monitoring'));
                    $(".waringShow").html("单位设备报警("+counts+"条)");
                    settingScrollHeight();
                    !_listener && renderScroll("scrollData",50);
                    _loading = !1;
                    beginSetTime();
                },
                error: function (error) {
                    console.info(error);
                    _loading = !1;
                }
            });
        }

        function settingScrollHeight(){
            var liLength = $('#monitoring_self:eq(0) li').length, liHeight = 24, maxRecords = 5;
            document.getElementById("scrollData").style.height = (liLength > maxRecords ? maxRecords : liLength) * liHeight + 'px';
        }

        function renderScroll(elementId,speed){
            initScrolling();
            function addEventSimple(obj,evt,fn){
                if(obj.addEventListener){
                    obj.addEventListener(evt,fn,false);
                }
                else if(obj.attachEvent){
                    obj.attachEvent('on'+evt,fn);
                }
            }
            //addEventSimple(window,'load',initScrolling);
            var scrollingBox;
            var scrollingInterval;
            var reachedBottom = false;
            var bottom;
            function initScrolling(){
                scrollingBox = document.getElementById(elementId?elementId:"scrollData");
                scrollingInterval = setInterval(scrolling,($.isNumeric(speed) && speed < 100 && speed > 20) ? speed : 40);
                scrollingBox.onmouseover = over;
                scrollingBox.onmouseout = out;
            }
            function scrolling(){
                var origin = scrollingBox.scrollTop++;
                if(origin == scrollingBox.scrollTop){
                    if(!reachedBottom){
                        scrollingBox.innerHTML += scrollingBox.innerHTML;
                        reachedBottom = true;
                        bottom = origin;
                    }else{
                        scrollingBox.scrollTop = bottom;
                    }
                }
            }
            function over(){
                clearInterval(scrollingInterval);
            }
            function out(){
                scrollingInterval = setInterval(scrolling,($.isNumeric(speed) && speed < 100 && speed > 20) ? speed : 40);
            }
        }

        function beginSetTime(times){
            !_listener && (function(){
                $('.openBtn').removeClass('usable-btn').addClass('being-submit-btn').val("正在监控"),
                    $('.closeBtn').addClass('usable-btn').removeClass('being-submit-btn').val("关闭监控");
                _listener = setInterval(function(){
                    mapStepRequest(_province,[])
                },(times && !isNaN(times) && Number(times) >= 1E4 ) ? times : 2E4);
            })();
        }

        function clearSetTime(){
            _listener && (function(){
                clearInterval(_listener);
                _listener = null;
                $('.openBtn').addClass('usable-btn').removeClass('being-submit-btn').val("开启监控");
                $('.closeBtn').removeClass('usable-btn').addClass('being-submit-btn').val("监控已关闭");
            })();
        }

        $('.threeButton').on('click', '#backBtn', function (e) {
            var o = $(this);
            if(o.hasClass('being-submit-btn')){
                return false;
            }
            if(!common.isNil(_currentPlace)){
                _currentPlace = "";
                _province = _currentCity;
                _level = levelEnum['city']['content'];
            }
            else if(!common.isNil(_currentCity)){
                _currentCity = "";
                _province = _currentProvince;
                _level = levelEnum['province']['content'];
            }
            else if(!common.isNil(_currentProvince)){
                _currentProvince = "";
                _province = 'china';
                _level = levelEnum['country']['content'];
            }
            else{
                return false;
            }
            o.addClass('being-submit-btn');
            mapStepRequest(_province);
            e = e || window.event;
            e.stopPropagation();
        });

        $('#openBtn').on({
            click: function(e){
                beginSetTime();
                e = e || window.event;
                e.stopPropagation();
            }
        });

        $('#closeBtn').on({
            click: function(e){
                clearSetTime();
                e = e || window.event;
                e.stopPropagation();
            }
        });

    })(function(){
        var a = $('#firstBox'), c = $('#thirdBox');
        var eh = Math.floor(window.innerHeight * 2.76 / 6.43),
            ew = eh / 2.76 * 4;
        var setting = {
            'height': eh > 276 ? 276 : (eh < 230 ? 230 : eh) + 'px'
        };
        a.css(setting),a.find('#pieChart').css(setting),a.find('#pieChart div:eq(0)').css(setting),a.find('#pieChart div:eq(0) canvas').css(setting), a.find('#pillars').css(setting),a.find('#pillars div:eq(0)').css(setting),a.find('#pillars div:eq(0) canvas').css(setting);
        c.css(setting),c.find('#thirdBoxLeft').css(setting),c.find('#thirdBoxLeft div').css(setting),c.find('#thirdBoxLeft div canvas').css(setting), c.find('#thirdBoxRight').css(setting);
    });

    $(function(){
        function dblClick1(){
            var docElm = document.documentElement;
            if (docElm.requestFullscreen) {
                docElm.requestFullscreen();
            }
            else if (docElm.msRequestFullscreen) {
                docElm.msRequestFullscreen();
            }
            else if (docElm.mozRequestFullScreen) {
                docElm.mozRequestFullScreen();
            }
            else if (docElm.webkitRequestFullScreen) {
                docElm.webkitRequestFullScreen();
            }
            $('.tool-item1').css('display',"none");
            $('.tool-item2').css('display',"block");
        }
        function dblClick2(){
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
            else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            }
            else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            }
            $('.tool-item1').css('display',"block");
            $('.tool-item2').css('display',"none");
        }
        var a = 22;
        var icon_full = document.getElementById("btnFull");
        if(window.addEventListener){
            icon_full.addEventListener("click", function () {
                a=11;
                dblClick1();
                return a;
            });
        }
        else{
            icon_full.attachEvent("click", function () {
                a=11;
                dblClick1();
                return a;
            });
        }
        var btnFull2 = document.getElementById("btnFull2");
        if(window.addEventListener){
            btnFull2.addEventListener("click", function () {
                a=22;
                dblClick2();
                return a;
            });
        }
        else{
            btnFull2.attachEvent("click", function () {
                a=22;
                dblClick2();
                return a;
            });
        }
        $(document).keyup(function(event){ //键盘事件，Esc退出全屏
            switch(event.keyCode) {
                case 27:
                    $('.tool-item1').css('display',"block");
                    $('.tool-item2').css('display',"none");
            }
        });
        $("#container").dblclick(function(){
            if(a==22){a=11;dblClick1();return a;}
            if(a==11){a=22;dblClick2();return a;}
        });
        $("#mapTitle").dblclick(function(){
            if(a==22){a=11;dblClick1();return a;}
            if(a==11){a=22;dblClick2();return a;}
        });
        $("#close").click(function(){
            $(".box").animate({right:"-285px"});
            $("#arrowLeft").addClass("disBlock");
        });
        $("#arrowLeft").click(function(){
            $(".box").animate({right:"5px"},300);
            $("#arrowLeft").addClass("disNone");
        });
        // rLeft1  rRight1 firstBox secondBox thirdBox fourthBox
        function zoom1(box,rLeft,rRight,firstMonth){
            $(box).mouseover(function(){
                $(rLeft).css("display","block");
            }).mouseout(function(){
                $(rLeft).css("display",'none');
            });
            $(rLeft).click(function(){
                $(box).animate({left:"-440px"});
                $(rRight).css("display","block");
                $(firstMonth).animate({left:"-440px"});
            });
            $(rRight).click(function(){
                $(box).animate({left:"10px"});
                $(rRight).css("display",'none');
                $(firstMonth).animate({left:"125px"});
            })
        }
        zoom1($("#firstBox"),$(".rLeft1"),$(".rRight1"),$("#firstMonth"));
        $(".secondBox").mouseover(function(){
            $(".rLeft2").css("display",'block');
        }).mouseout(function(){
            $(".rLeft2").css("display",'none');
        });
        $(".rLeft2").click(function(){
            $(".secondBox").hide(300);
            $("#totalUnit").hide(300);
            $(".rRight2").css("display",'block');
            $(".rLeft2").css("display",'none');
        });
        $(".rRight2").click(function(){
            $(".secondBox").show(300);
            $("#totalUnit").show(300);
            $(".rRight2").css("display",'none');
        });
        $("#thirdBox").mouseover(function(){
            $(".rLeft3").css("display",'block');
        }).mouseout(function(){
            $(".rLeft3").css("display",'none');
        });
        $(".rLeft3").click(function(){
            $("#thirdBox").animate({left:"-440px"});
            $(".rRight3").css("display",'block');
            $(".threeCicle").animate({left:"-440px"});
        });
        $(".rRight3").click(function(){
            $("#thirdBox").animate({left:"10px"});
            $(".rRight3").css("display",'none');
            $(".threeCicle").animate({left:"300px"});
        });
        $("#fourthBox").mouseover(function(){
            $(".rLeft4").css("display","block");
        }).mouseout(function(){
            $(".rLeft4").css("display",'none');
        });
        $(".rLeft4").click(function(){
            $("#fourthBox").hide(300);
            $(".rRight4").css("display","block");
            $(".rLeft4").css("display",'none');
        });
        $(".rRight4").click(function(){
            $("#fourthBox").show(300);
            $(".rRight4").css("display",'none');
            $(".rLeft4").css("display","block");
        });
        $("#backIndex").click(function(){
            window.location.href = "/manage/homePage";
        });
    });
});