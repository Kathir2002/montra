import {useWindowDimensions} from 'react-native';
import SvgChart, {SVGRenderer} from '@wuba/react-native-echarts/svgChart';

import * as echarts from 'echarts/core';

import {BarChart} from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
} from 'echarts/components';

import React, {useEffect, useRef} from 'react';
import {appColors} from '@shared/appColors';
import {gestureHandlerRootHOC} from 'react-native-gesture-handler';
import {EChartsOption} from 'echarts';
import {getCurrencySymbol} from '@src/lib/functions';

const DashBoardBarChart = (props: {chartData: number[]}) => {
  const {chartData} = props;
  const {width} = useWindowDimensions();

  // register extensions
  echarts.use([
    TitleComponent,
    TooltipComponent,
    GridComponent,
    SVGRenderer,
    BarChart,
  ]);

  const E_HEIGHT = 250;
  const E_WIDTH = width;

  const svgRef = useRef<any>(null);
  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },

      valueFormatter: function (params: any) {
        return `${getCurrencySymbol(params, false)}`;
      },
      backgroundColor: appColors.light,
      borderColor: appColors.formBorderColor,
      borderRadius: 15,
      // showContent: false
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: [
      {
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        axisTick: {
          alignWithLabel: true,
        },
        animation: false,
      },
    ],
    yAxis: [
      {
        type: 'value',
      },
    ],
    series: [
      {
        name: 'Expense',
        type: 'bar',
        color: appColors.expenseBg,
        barWidth: '60%',
        data: chartData,
      },
    ],
  };
  useEffect(() => {
    let chart: any;
    if (svgRef.current) {
      // @ts-ignore
      chart = echarts.init(svgRef.current, 'light', {
        renderer: 'svg',
        width: E_WIDTH - 30,
        height: E_HEIGHT,
      });
      chart.setOption(option);
    }
    return () => chart?.dispose();
  }, [option]);

  return <SvgChart ref={svgRef} useRNGH style={{marginTop: -40}} />;
};

export default gestureHandlerRootHOC(DashBoardBarChart);
