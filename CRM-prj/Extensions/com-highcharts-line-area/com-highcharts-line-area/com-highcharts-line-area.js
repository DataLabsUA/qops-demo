define(["jquery","./highcharts","text!./simpletable.css"], function($, cssContent) {'use strict';
	$("<style>").html(cssContent).appendTo("head");
	return {
		initialProperties : {
			version: 1.0,
			qHyperCubeDef : {
				qDimensions : [],
				qMeasures : [],
				qInitialDataFetch : [{
					qWidth : 10,
					qHeight : 800
				}]
			},
			selectionMode : "CONFIRM",
		},
		
		definition : 
		{
			type : "items",
			component : "accordion",
			items : 
			{
				dimensions : 
				{
					uses : "dimensions",
					min : 2,
					max : 3
				},
				measures : 
				{
					uses : "measures",
					min : 1,
					max : 2,
					items:{
						decimalCount:{
							ref:"qDef.grf_decimals",
							label:"Cantidad de decimales",
							expression:"optional",
							type:"number",
							defaultValue:2
						},
						
					}
				},
				sorting : 
				{
					uses : "sorting"
				},
				addons: {  
					uses: "addons",  
					items: {  
						dataHandling: {  
							uses: "dataHandling"  
						}  
					}  
				},
				Pivot: 
				{
					type: "items",
					label: "Opciones del Gráfico" ,
					items: 
					{
						Title : 
						{
							ref: "grf_titulo",
							label: "Título",
							expression: "optional",
							type: "string",
							defaultValue: ""
						},
						InnerSize : 
						{
							ref: "grf_escala",
							label: "Ajustar Área de Totales en la Gráfica",
							type: "integer",
							defaultValue: 0,
							component: "slider",
							min: 0,
							max: 100,
							step: 1
						}
					}
				},
				ejeY1: 
				{
					type: "items",
					label: "Eje Y1",
					items: 
					{
						tituloX1 : 
						{
							ref: "grf_tity1",
							label: "Título para el Eje Primario",
							expression: "optional",
							type: "string",
							defaultValue: "Introduzca aquí un Título"
						},
						unidadX1 : 
						{
							ref: "grf_uny1",
							label: "Unidad de Medición para el Eje Primario (Prefijo)",
							expression: "optional",
							type: "string",
							defaultValue: ""
						},
						decimalsX1:{
							ref:"grf_decimalsY1",
							label:"Cantidad de decimales",
							expression:"optional",
							type:"number",
							defaultValue:0
						},
						tipoX1:
						{
							ref: "grf_type_grf",
							label: "Tipo de gráfico",
							defaultValue:"area",
							type:"string",
							component: "dropdown",
							options:[{
								label:"Area",
								value:"area"
							},
							{
								label:"Barra",
								value:"column"
							}],
						},
						colorX1:
						{
							ref: "grf_col1",
							label: "Color HEX",
							expression: "optional",
							type: "string",
							defaultValue: "#DADADA"
						},
						alphaX1:
						{
							ref:"grf_alph1",
							label:"Opacidad",
							component:"slider",
							type: "integer",
							defaultValue:70,
							min:0,
							max:100,
							step: 1
						}

					}
				},
				ejeY2: 
				{
					type: "items",
					label: "Eje Y2",
					items: 
					{
						tituloX2 : 
						{
							ref: "grf_tity2",
							label: "Título para el Eje Secundario",
							expression: "optional",
							type: "string",
							defaultValue: "Introduzca aquí un Título"
						},
						unidadX2 : 
						{
							ref: "grf_uny2",
							label: "Unidad de Medición para el Eje Secundario (Prefijo)",
							expression: "optional",
							type: "string",
							defaultValue: ""
						},
						decimalsX2:{
							ref:"grf_decimalsY2",
							label:"Cantidad de decimales",
							expression:"optional",
							type:"number",
							defaultValue:0
						}
					}
				}
				
				
			}
		},
		snapshot : 
		{
			canTakeSnapshot : true
		},
		paint : function($element,layout) {
			console.log('Layout Button', layout);
			//console.log('Element Button', $element);
			var qMatrix = layout.qHyperCube.qDataPages[0].qMatrix;
			var colors = Highcharts.getOptions().colors;
			var id = "div_" + layout.qInfo.qId;
			$element.html( '<div id="' + id + '"></div>' );
			$('#'+id).css({width:"100%",height:"100%"});//responsive


			var qMeasureInfo=layout.qHyperCube.qMeasureInfo;
			var qDimensionInfo = layout.qHyperCube.qDimensionInfo;
			var sumIndexByColor=0;
			var indexColor=-1;
			var colorsDimension=[];
			indexColor=qDimensionInfo
				.map(function (element) {return element.qFallbackTitle;})
				.indexOf('Colors');
			if(indexColor>-1)
			{
				sumIndexByColor=1;
			}


			var d = 0;
			var that=this;
			var catg=[];
			var tot_val=[];
			var cta_catg=0;
			var nom=[];
			var cta_nom=0;
			var ky_des=[];
			var ky_val=[];
			var cta_ky=0;
			var la_escala=layout.grf_escala;
			var max_val=0;
			la_escala*=1/100;
			la_escala+=1;
			var hex=layout.grf_col1
			var opacity=layout.grf_alph1
			var elementNumber =[]
			var formatY1 = []
			var formatY2 = []
			hex = hex.replace('#','');
			var r1 = parseInt(hex.substring(0,2), 16);
			var g1 = parseInt(hex.substring(2,4), 16);
			var b1 = parseInt(hex.substring(4,6), 16);

			var result1 = 'rgba('+r1+','+g1+','+b1+','+opacity/100+')';
			var tmpFirstValueY1=''+qMatrix[0][3+sumIndexByColor].qText
			var tmpFirstValueY2=''+qMatrix[0][2+sumIndexByColor].qText
			if(tmpFirstValueY1.includes(","))
				formatY1.push("{value:,.2f}")
			else
				formatY1.push("{value}")
			if(tmpFirstValueY1.includes("%"))
				formatY1.push("%")
			else
				formatY1.push("")


			if(tmpFirstValueY2.includes(","))
				formatY2.push("{value:,.2f}")
			else
				formatY2.push("{value}")
			if(tmpFirstValueY2.includes("%"))
				formatY2.push("%")
			else
				formatY2.push("")
			
			var totalsDecimals=qMeasureInfo[0].grf_decimals;
			var dataDecimals=qMeasureInfo[1].grf_decimals;
			var DecimalsY2=layout.grf_decimalsY2||0;
			var DecimalsY1=layout.grf_decimalsY1||0;


			console.log(indexColor)


			
			
			//------------------------- lectura del cubo --------------------------------------------------
			for(d = 0; d < qMatrix.length; d++)
			{
				var idx=catg.indexOf(qMatrix[d][0].qText); //categorias
				if(idx<0)
				{
					catg[cta_catg]=qMatrix[d][0].qText;
					if(!formatY1[1].includes("%"))
						tot_val[cta_catg]=parseFloat(qMatrix[d][3+sumIndexByColor].qNum);
					else
						tot_val[cta_catg]=parseFloat(qMatrix[d][3+sumIndexByColor].qText);
					if(max_val<tot_val[cta_catg])
						max_val=tot_val[cta_catg];
					cta_catg++;
				}
				var idx=nom.indexOf(qMatrix[d][1].qText); //nombre serie
				if(idx<0){
						//nom[cta_nom++]={text:qMatrix[d][1].qText,dato:qMatrix[d][1].qElemNumber};
					var ct_nom=cta_nom++
					nom[ct_nom]=qMatrix[d][1].qText;
					elementNumber[ct_nom]=qMatrix[d][1].qElemNumber;
					if(indexColor>-1)
					{
						colorsDimension[ct_nom]=qMatrix[d][indexColor].qText;
					}
				}
					
				var cmp_txt=qMatrix[d][1].qText + "-" + qMatrix[d][0].qText
				var idx=ky_des.indexOf(cmp_txt); // dato por llave
				if(idx<0)
				{
					ky_des[cta_ky]=cmp_txt;
					if(formatY2[1].includes("%"))
						ky_val[cta_ky]=parseFloat(qMatrix[d][2+sumIndexByColor].qText);
					else
						ky_val[cta_ky]=parseFloat(qMatrix[d][2+sumIndexByColor].qNum);
					cta_ky++;
				}
			}
			var serie_datos=[];
			var x=0;
			var y=0;
			for(x=0; x<cta_nom; x++)
			{
				var datos=[];
				for(y=0; y<cta_catg; y++)
				{
					var cmp_txt=nom[x] + "-" + catg[y];
					var idx=ky_des.indexOf(cmp_txt);
					datos[y]=ky_val[idx];
				}
				serie_datos[x]=datos;
			}
			max_val*=la_escala;	

			console.log("serie_datos antes",serie_datos);
			
			
			
			
			$('#'+id).highcharts({
				chart: 
				{
					zoomType: 'xy',
					alignTicks:false,
					lang: {
						decimalPoint: '.',
						thousandsSep: ','
					}
				},
				annotationsOptions:{
						enabledButtons:false,
					},
				plotOptions: {
            series: {
                cursor: 'pointer',
                
                    events: {
                        click: function() {
                           
							var dim=1;
							that.selectValues(dim, [this.userOptions.extraOptionBla], true);
							if(this.options.lineWidth!=5)
								this.update({lineWidth:5});
							else
								this.update({lineWidth:2});
							
							
                        }
                    }
                
            }
            },
				title: 
				{
					text: layout.grf_titulo
				},
				xAxis: 
				[
					{
						categories: catg,
						crosshair: true,
						labels: 
						{
							rotation: -45,
							style: 
							{
								fontSize: '10px',
								fontFamily: 'Verdana, sans-serif'
							}
						}					
					}
				],
				
				yAxis: 
				[
					{ // Primary yAxis
						max:max_val,
						alignTicks:false,
						endOnTick: false,
						min:0,
						labels: 
						{
							
							style: 
							{
								color: Highcharts.getOptions().colors[1]
							},
							formatter:function(){
								if(this.value>=1000000||this.value<=(-1000000))
								{
									return layout.grf_uny1+' '+Highcharts.numberFormat(this.value/1000000,DecimalsY1,'.',',')+'M'+formatY1[1];
								}
								else
								{
									return layout.grf_uny1+' '+Highcharts.numberFormat(this.value,DecimalsY1,'.',',')+formatY1[1];
								}
							}
						},
						title: 
						{
							text: layout.grf_tity1,
							style: 
							{
								color: Highcharts.getOptions().colors[1]
							}
						}
					}, 
					{ // Secondary yAxis
						lineColor: 'transparent',
						lineWidth: 0,
						tickLength: 0,
						minorTickLength: 0,
						minorGridLineWidth:0,
						gridLineWidth: 0,
						alignTicks:false,
						endOnTick: false,
						min:0,
						title: 
						{
							text: layout.grf_tity2,
							style: 
							{
								color: Highcharts.getOptions().colors[0]
							}
						},
						labels: 
						{
							
							
							style: 
							{
								color: Highcharts.getOptions().colors[0]
							},
							formatter:function(){
								if(this.value>=1000000||this.value<=(-1000000))
								{
									return layout.grf_uny2+' '+Highcharts.numberFormat(this.value/1000000,DecimalsY2,'.',',')+'M'+formatY2[1];
								}
								else
								{
									return layout.grf_uny2+' '+Highcharts.numberFormat(this.value,DecimalsY2,'.',',')+formatY2[1];
								}
							}
						},
						opposite: true
					}
				],
				tooltip: 
				{
					shared: true,
					formatter:function(){
						var points=this.points;
						var prefix='',sufix='';
						var toolTipText=' <span style="font-size: 10px">'+this.x+'</span><br/>';
						for(var i=0;i<points.length;i++)
						{
							var that=points[i];
							if(!(that.series.yAxis.opposite===undefined)&&that.series.yAxis.opposite==true){
								prefix=layout.grf_uny2;
								sufix=formatY2[1]
							}else{
								prefix=layout.grf_uny1;
								sufix=formatY1[1]
								
							}
								toolTipText+=that.series.name+': <b>'+prefix+Highcharts.numberFormat(that.y,that.series.userOptions.decimalCount,'.',',')+sufix+'</b><br/>';
							}
							return toolTipText;
					}
				}
			});
			
			
			//-----------------------ploteo de las series ---------------------------------
			var chrt=$('#'+id).highcharts();
			
			console.log("tot_val",tot_val);
			console.log("serie_datos",serie_datos);
			chrt.addSeries(
				{
					name: "TOTAL",

					type: layout.grf_type_grf,
					fillOpacity:opacity/100,
					color: result1,
					data: tot_val,
				
					marker: 
					{
						enabled: false
					}	,
					countDecimals:totalsDecimals				
				}
			);	
			console.log(colorsDimension)		
			
			for(d = 0; d < nom.length; d++)
			{
				serie_datos[d]=serie_datos[d].map(function(val){if(val==undefined) return 0; else return val;});
				console.log("Vuelta "+d,serie_datos[d]);
				console.log("Nomd",nom[d]);
				var idx=d+1;
				chrt.addSeries(
					{
						yAxis:1,
						name: nom[d],
						type: "line",
						color: colorsDimension[d]=="-"?colors[idx]:colorsDimension[d],
						data: serie_datos[d],
						/*tooltip: 
						{
							valuePrefix:""+ layout.grf_uny2,
							valueSuffix: ' '+formatY2[1],
							
						},*/
						extraOptionBla:elementNumber[d],
						countDecimals:dataDecimals
						
					}
				);					
			}
			
		
		
		}
	};
});
