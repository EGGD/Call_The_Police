var yjcountold=0;
var  geoCoordMapyj={};//预警点位
var  geoCoordMap={};
var diqushuju=['永嘉县','乐清市','鹿城区','洞头区','龙湾区','瓯海区','瑞安市','文成县','平阳县','泰顺县','苍南县'];
var flag;
var center_right_ditu;

//地图
function ditu(diqu, number) {
	var quyu = diqu=="全部"?"温州":diqu; //区域
	if (number == 0) {
		flag = "";
	}

	diqu = "json/" + case_quyu(quyu) + ".json";
	$.getJSON(diqu, function(wz) {
		center_right_ditu = echarts.init(document.getElementById('container'));
		echarts.registerMap('wenzhou', wz);
		//这里从后台读取数据  然后弄到geoCoordMap这个函数中
		var quid = ""; //区ID
		if (quyu != "温州") {
			quid = quyu == "永嘉县" ? '8E65573E-E305-406D-B98B-3094C8ACD47C' : quyu == "乐清市" ? '5DFEEA51-D9EC-4BE2-84FD-BE5705B8C483' : quyu == "鹿城区" ? 'FDFDAEC3-716C-42D4-8B9C-A72E9945BF43' : quyu == "洞头区" ? 'E7B3D813-7B3E-4AA0-9628-986F87751CF1' : quyu == "龙湾区" ? '340AF15B-7E79-4DCD-BE6F-BA366343B1FE' : quyu == "瓯海区" ? '725DACE1-5402-41A9-B061-0CDE2D0E5D00' : quyu == "瑞安市" ? '311A1F14-8F22-41F4-AFB4-9919FE1CD689' : quyu == "文成县" ? '9E592D5F-B32F-4961-B20E-51256135255B' : quyu == "平阳县" ? 'FE403C23-E760-4CE3-9E76-9925C1D21410' : quyu == "泰顺县" ? '6BFB5679-7D08-4B0E-A0F2-06B9707ACA9C' : quyu == "苍南县" ? 'A67667BC-8686-4B3C-9703-D9A6ECF2B49D' : '';
		}
		// ajax_new("../xzjdq/Ajax/Aqfxdjfbdzt.ashx?Method=getDztData&ryid=" + session_dzt["ID"] + "&type=shi" + "&name=" + encodeURIComponent($('#datagrid_dzt_name').val()) +
		// 	"&address=" + encodeURIComponent($('#datagrid_dzt_address').val()) + "&person=" + encodeURIComponent($('#datagrid_dzt_person').val()) +
		// 	"&gszch=" + encodeURIComponent($('#datagrid_dzt_gszch').val()) + "&quid=" + quid, "post", false, true, null, null, function(data) {
		// 		var json = $.parseJSON(data); //转换Jeson
         //        {浙江广天化工有限公司: ["120.534318", "27.600146", "92ff9f13-14d5-4735-8226-b0a9fb23396d", "生产企业"]}
		// 		geoCoordMap = json;
		// 	},
		// 	function(XMLHttpRequest, textStatus, errorThrown) {
		// 		$.messager.alert("系统提示", "连接服务器失败", "error");
		// 	});
        geoCoordMap={浙江广天化工有限公司: ["120.534318", "27.600146", "92ff9f13-14d5-4735-8226-b0a9fb23396d", "生产企业"]};
		geoCoordMapyj={万隆化工: ["120.592458", "27.818766", "a69681f5-7928-49ba-90c7-1abdf412cb21", "生产企业"]};
		var series = [];

        series.push({
			name:'正常',
			type: 'effectScatter',
			coordinateSystem: 'geo',
			zlevel: 2,
			rippleEffect: {
				brushType: 'stroke',
                scale :3//波纹范围
			},
           // symbol:'image://../img/deng2.ico',//自定义图片
			symbolSize: 10,
			itemStyle: {
				normal: {
               	color:'#B3EE3A'
				}
			},
			data: Object.keys(geoCoordMap).map(function(dataItem) {
				  if(geoCoordMap[dataItem][3]=="生产企业"){
				return {
					name: dataItem,
					value: geoCoordMap[dataItem]
				};
                }
			})
		});
        series.push({
			name:'报警',
			type: 'effectScatter',
			coordinateSystem: 'geo',
			zlevel: 3,
			rippleEffect: {
				brushType: 'stroke' ,
                     scale :5//波纹范围
			},
			symbolSize: 10,
                     hoverAnimation: true,
			itemStyle: {
				normal: {
              color:'red'
				}
			},
			data: Object.keys(geoCoordMapyj).map(function(dataItem) {

				return {
					name: dataItem,
					value: geoCoordMapyj[dataItem]
				};

			})
		});
		series.push({
			name:'正常',
			type: 'effectScatter',
			coordinateSystem: 'geo',
			zlevel: 2,
			rippleEffect: {
				brushType: 'stroke' ,
                     scale :3//波纹范围
			},
			symbolSize: 10,
                     hoverAnimation: true,
			itemStyle: {
				normal: {
              color:'#f0ad4e'
				}
			},
			data: Object.keys(geoCoordMap).map(function(dataItem) {
            if(geoCoordMap[dataItem][3]=="经营企业"||geoCoordMap[dataItem][3]=="储存企业"){
				return {
					name: dataItem,
					value: geoCoordMap[dataItem]
				};
                }
			})
		});

          	series.push({
			name:'正常',
			type: 'effectScatter',
			coordinateSystem: 'geo',
			zlevel: 2,
			rippleEffect: {
				brushType: 'stroke',
                scale :0//波纹范围
               
			},
           //  symbol:'image://../img/deng3.ico',//自定义图片
            // showEffectOn:'emphasis',
                      hoverAnimation: true,
			symbolSize: 10,
			itemStyle: {
				normal: {
               color:'#37b7f3'
				}
			},
			data: Object.keys(geoCoordMap).map(function(dataItem) {
				  if(geoCoordMap[dataItem][3]=="使用企业"){
				return {
					name: dataItem,
					value: geoCoordMap[dataItem]
				};
                }
			})
		});

		center_right_ditu.setOption(
			option = {
				name:'pm2.5',
				type: 'scatter',
				coordinateSystem: 'geo',
				backgroundColor: '#404a59',
				legend: {
					orient: 'horizontal',
					x: '50%',
					bottom: '50',
					icon: 'map',
					data: ['正常','报警'],
					textStyle: {
						color: ['black', 'green']
					},
					selectedMode: 'multiple'
				},
				tooltip: {
					trigger: 'item',
					formatter: '{b}'
				},
				geo: {
					map: 'wenzhou',
                                   regions: [
				   {
					name: '苍南县',
					itemStyle: {
						normal: {
						 areaColor: '#c6a558'
						}
					}
				},
					{
						name: '乐清市',
						itemStyle: {
							normal: {
								areaColor: '#79c45f'

							}
						}
					},
					{
						name: '洞头区',
						itemStyle: {
							normal: {
								areaColor: '#86c6c8'

							}
						}
					},
					{
						name: '龙湾区',
						itemStyle: {
							normal: {
								areaColor: '#c6c96e'

							}
						}
					},
					{
						name: '鹿城区',
						itemStyle: {
							normal: {
								areaColor: '#c9776b'

							}
						}
					},
					{
						name: '瓯海区',
						itemStyle: {
							normal: {
								areaColor: '#736fbc'

							}
						}
					},
					{
						name: '平阳县',
						itemStyle: {
							normal: {
								areaColor: '#becb59'

							}
						}
					},
					{
						name: '泰顺县',
						itemStyle: {
							normal: {
								areaColor: '#42abac'

							}
						}
					},
					{
						name: '瑞安市',
						itemStyle: {
							normal: {
								areaColor: '#80c455'

							}
						}
					},
					{
						name: '文成县',
						itemStyle: {
							normal: {
								areaColor: '#697dba'

							}
						}
					},
					{
						name: '永嘉县',
						itemStyle: {
							normal: {
								areaColor: '#bd8c26'

							}
						}
					}
				],
									label: {
						normal: {
							show: true
						},
						emphasis: {
							show: true
						}
					},
					roam: true,
				},
				series: series
			});
		center_right_ditu.on('click', function(params) {
			var city = params.name;
			// chaozhao(city, params);
		});
	});
}
 //点击搜索
function linkbutton_dzt_search() {
var myqu= $("#datagrid_dzt_qu").combobox("getText");
//  console.log(myqu);
 ditu(myqu, 0);
}
ditu("温州", 0);

function case_quyu(squyu){
	switch (squyu) {
	case "永嘉县":
	return "yjx";
	break;
	case "乐清市":
	return "yqs";
	break;
	case "鹿城区":
	return "lcq";
	break;
	case "洞头区":
	return "dtq";
	break;
	case "龙湾区":
	return "lwq";
	break;
	case "瓯海区":
	return "ohq";
	break;
	case "瑞安市":
	return "ras";
	break;
	  case "文成县":
	return "wcx";
	break;
	case "平阳县":
	return "pyx";
	break;
	case "苍南县":
	return "cnx";
	break;
	case "泰顺县":
	return "tsx";
	break;
	case "温州":
	return "wz";
	break;
	}
}
var not_alarm_count_sum = 0;
var not_solve_alarm_sum = 0;
// 柱形图
function pillars_ECharts() {
	var alarm_count_arr = [0, 0, 0, 0, 0, 0, 0];
	var day_arr = [22, 23, 24, 25, 26, 27, 28];
	var not_alarm_count_arr = [0, 0, 0, 0, 0, 0, 0]
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
}
// 环形图
function pieChart_ECharts() {
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
			itemGap:-5,
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
// 统计单位
function secondBox_ECharts() {
	var alarm_unit = 0;
	var not_alarm_unit = 0;
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
	var un_online_counts=0;
	var monitor_counts=0;
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
}
// 设备在线率
function thirdBox_ECarts() {
	var barChart = echarts.init(document.getElementById('thirdBoxLeft'));
	var online_unit_menu_arr = [1, 1];
	var unline_unit_menu_arr=[0,0];
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
				data : ['灭弧','在线监测装置','水位检测仪'],//['灭弧','在线监测装置','水位检测仪'],
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
}
// 单位设备报警
var counts=0;
var ulList="";
function unitAlarmData() {

	counts++;
	// ulList +=
		// "<a href='#' title='"+o['unit_name']+"&nbsp;&nbsp;&nbsp;"
		// +o['name']+"&nbsp;&nbsp;&nbsp;"+states[k]+"&nbsp;&nbsp;"+o['sn_num']+"'>"
		// +"<li>"
		// +"<p>"+o['unit_name']+"</p>"
		// +"<p>"+o['name']+"</p>"
		// +"<p class='unit-name'>"
		// +states[k]
		// +"</p>"
		// +"<p class='bjz'>"
		// +o['sn_num']
		// +"</p>"
		// + "</li>"
		// +"</a>";
	sie="111";
	ulList +=
		"<a href='#' title='"+sie+"&nbsp;&nbsp;&nbsp;"
		+sie+"&nbsp;&nbsp;&nbsp;"+sie+"&nbsp;&nbsp;"+sie+"'>"
		+"<li>"
		+"<p>"+sie+"</p>"
		+"<p>"+sie+"</p>"
		+"<p class='unit-name'>"
		+sie
		+"</p>"
		+"<p class='bjz'>"
		+sie
		+"</p>"
		+ "</li>"
		+"</a>";
	$(ulList).appendTo($('.monitoring'));
	$(".waringShow").html("单位设备报警("+counts+"条)");
	settingScrollHeight();

}
function settingScrollHeight(){
	var liLength = $('#monitoring_self:eq(0) li').length, liHeight = 24, maxRecords = 5;
	document.getElementById("scrollData").style.height = (liLength > maxRecords ? maxRecords : liLength) * liHeight + 'px';
}
// setInterval(function(){
// 	ditu("温州", 0);
// 	pillars_ECharts();
// 	pieChart_ECharts();
// 	secondBox_ECharts();
// 	thirdBox_ECarts();
// 	unitAlarmData();
// },20000);

pillars_ECharts();
pieChart_ECharts();
secondBox_ECharts();
thirdBox_ECarts();
unitAlarmData();
//上面的鼠标移动和全屏操作
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