import {useWindowDimensions, View} from 'react-native';
import SvgChart, {SVGRenderer} from '@wuba/react-native-echarts/svgChart';
import * as echarts from 'echarts/core';
import {PieChart} from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components';

import React, {useEffect, useRef} from 'react';
import {ECharts, EChartsOption} from 'echarts';
import {appFonts} from '@shared/appFonts';
import {gestureHandlerRootHOC} from 'react-native-gesture-handler';
import {getCurrencySymbol} from '@src/lib/functions';

const FinancePieChart = (props: {
  chartData: {name: string; value: number}[];
  transactionType: string;
  totalTransaction: {totalExpense: number; totalIncome: number};
}) => {
  const {chartData, transactionType, totalTransaction} = props;
  const {width} = useWindowDimensions();

  // register extensions
  echarts.use([
    TitleComponent,
    TooltipComponent,
    GridComponent,
    SVGRenderer,
    PieChart,
  ]);

  const E_HEIGHT = 280;
  const E_WIDTH = width - 30;

  const svgRef = useRef<any>(null);

  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      position: 'inside',
      valueFormatter: (parms: any) => {
        return getCurrencySymbol(parms, false);
      },
    },
    series: [
      {
        name: transactionType,
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        padAngle: 2,
        itemStyle: {
          borderRadius: 10,
        },
        label: {
          show: true,
          position: 'center',
          formatter: function () {
            return getCurrencySymbol(
              transactionType == 'Expense'
                ? totalTransaction?.totalExpense
                : totalTransaction?.totalIncome,
              false,
            );
          },

          fontSize: 16,
          fontFamily: appFonts.bold,
        },
        emphasis: {
          label: {
            show: false,
          },
        },
        labelLine: {
          show: false,
        },
        data: chartData,
      },
    ],
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

  return (
    <View style={{height: E_HEIGHT}}>
      <SvgChart ref={svgRef} useRNGH />
    </View>
  );
};

export default gestureHandlerRootHOC(FinancePieChart);
