import {useWindowDimensions} from 'react-native';
import SvgChart, {SVGRenderer} from '@wuba/react-native-echarts/svgChart';
import * as echarts from 'echarts/core';
import {LineChart} from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
} from 'echarts/components';

import React, {memo, useEffect, useRef} from 'react';
import {appColors} from '@shared/appColors';
import {ECharts, EChartsOption} from 'echarts';
import moment from 'moment';
import {gestureHandlerRootHOC} from 'react-native-gesture-handler';
import {getCurrencySymbol} from '@src/lib/functions';

const FinanceLineChart = (props: {
  chartData: {date: Date; amount: number}[];
}) => {
  const {chartData} = props;
  const {width} = useWindowDimensions();

  // register extensions
  echarts.use([
    TitleComponent,
    TooltipComponent,
    GridComponent,
    SVGRenderer,
    LineChart,
  ]);

  const E_HEIGHT = 300;
  const E_WIDTH = width - 30;

  const svgRef = useRef<any>(null);

  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
      },

      valueFormatter: function (params: any) {
        return getCurrencySymbol(params, false);
      },
      backgroundColor: appColors.light,
      borderColor: appColors.formBorderColor,
      borderRadius: 15,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: chartData.map(res => moment(res?.date).format('DD MMM, hh:mm A')),
      show: false,
    },
    yAxis: {
      type: 'value',
      show: false,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: false,
    },
    series: [
      {
        data: chartData.map(res => res.amount),
        type: 'line',
        symbolSize: 10,
        smooth: true,
        symbol: 'circle',
        color: appColors.primary,
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 1, 0, 0.1, [
            {
              offset: 0,
              color: 'rgba(138, 80, 255, 0.041)',
            },
            {
              offset: 1,
              color: 'rgba(138, 80, 255, 0.322)',
            },
          ]),
        },
        lineStyle: {
          width: 3,
          shadowColor: 'rgba(0,0,0,0.3)',
          shadowBlur: 10,
          shadowOffsetY: 8,
        },
      },
    ],

    emphasis: {
      focus: 'series',
    },
  };

  useEffect(() => {
    let chart: ECharts;
    if (svgRef.current) {
      // @ts-ignore
      chart = echarts.init(svgRef.current, 'light', {
        renderer: 'svg',
        width: E_WIDTH,
        height: E_HEIGHT,
      });
      chart.setOption(option);
    }
    return () => chart?.dispose();
  }, [option]);

  return <SvgChart ref={svgRef} useRNGH style={{marginTop: -40}} />;
};

export default gestureHandlerRootHOC(FinanceLineChart);
