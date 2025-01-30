// import {useWindowDimensions} from 'react-native';
// import SvgChart, {SVGRenderer} from '@wuba/react-native-echarts/svgChart';

// import * as echarts from 'echarts/core';

// import {BarChart} from 'echarts/charts';
// import {
//   TitleComponent,
//   TooltipComponent,
//   GridComponent,
// } from 'echarts/components';

// import React, {useEffect, useRef} from 'react';
// import {appColors} from '@shared/appColors';
// import {gestureHandlerRootHOC} from 'react-native-gesture-handler';
// import {EChartsOption} from 'echarts';
// import {getCurrencySymbol} from '@src/lib/functions';

// const DashBoardBarChart = (props: {chartData: number[]}) => {
//   const {chartData} = props;
//   const {width} = useWindowDimensions();

//   // register extensions
//   echarts.use([
//     TitleComponent,
//     TooltipComponent,
//     GridComponent,
//     SVGRenderer,
//     BarChart,
//   ]);

//   const E_HEIGHT = 250;
//   const E_WIDTH = width;

//   const svgRef = useRef<any>(null);
//   const option: EChartsOption = {
//     animation: false,
//     tooltip: {
//       trigger: 'axis',
//       axisPointer: {
//         type: 'shadow',
//       },

//       valueFormatter: function (params: any) {
//         return `${getCurrencySymbol(params, false)}`;
//       },
//       backgroundColor: appColors.light,
//       borderColor: appColors.formBorderColor,
//       borderRadius: 15,
//     },
//     grid: {
//       left: '3%',
//       right: '4%',
//       bottom: '3%',
//       containLabel: true,
//     },
//     xAxis: [
//       {
//         type: 'category',
//         data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
//         axisTick: {
//           alignWithLabel: true,
//         },
//       },
//     ],
//     yAxis: [
//       {
//         type: 'value',
//       },
//     ],
//     series: [
//       {
//         name: 'Expense',
//         type: 'bar',
//         color: appColors.expenseBg,
//         barWidth: '60%',
//         data: chartData,
//       },
//     ],
//   };
//   useEffect(() => {
//     let chart: any;
//     if (svgRef.current) {
//       // @ts-ignore
//       chart = echarts.init(svgRef.current, 'light', {
//         renderer: 'svg',
//         width: E_WIDTH - 30,
//         height: E_HEIGHT,
//       });
//       chart.setOption(option);
//     }
//     return () => chart?.dispose();
//   }, [option]);

//   return <SvgChart ref={svgRef} useRNGH style={{marginTop: -40}} />;
// };

// export default gestureHandlerRootHOC(DashBoardBarChart);

import {appColors} from '@shared/appColors';
import CommonText from '@shared/components/commonText/CommonText';
import {getCurrencySymbol} from '@src/lib/functions';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Text, View} from 'react-native';
import {BarChart} from 'react-native-gifted-charts';

const DashBoardBarChart = (props: {chartData: number[]}) => {
  const {chartData} = props;
  const {t} = useTranslation('transaction');
  const barDataTemplate = [
    {
      label: 'Mon',
      frontColor: '#F76E78',
      sideColor: '#D86067',
      topColor: '#FF8B92',
    },
    {
      label: 'Tue',
      frontColor: '#F76E78',
      sideColor: '#D86067',
      topColor: '#FF8B92',
    },
    {
      label: 'Wed',
      frontColor: '#F76E78',
      sideColor: '#D86067',
      topColor: '#FF8B92',
    },
    {
      label: 'Thu',
      frontColor: '#F76E78',
      sideColor: '#D86067',
      topColor: '#FF8B92',
    },
    {
      label: 'Fri',
      frontColor: '#F76E78',
      sideColor: '#D86067',
      topColor: '#FF8B92',
    },
    {
      label: 'Sat',
      frontColor: '#F76E78',
      sideColor: '#D86067',
      topColor: '#FF8B92',
    },
    {
      label: 'Sun',
      frontColor: '#F76E78',
      sideColor: '#D86067',
      topColor: '#FF8B92',
    },
  ];

  const barData = barDataTemplate.map((item, index) => ({
    ...item,
    value: chartData[index] || 0, // Ensure fallback to 0 if chartData has fewer elements
  }));
  // Ensure chartData is not empty
  if (chartData.length === 0) {
    return null; // Return null or a placeholder if there's no data
  }

  // Calculate max and min values
  const maxValue = Math.max(...chartData);
  const minValue = Math.min(...chartData); // Use Math.min to find the minimum value
  const labelCount = 5; // Desired number of Y-axis labels

  // Prevent division by zero
  if (maxValue === minValue) {
    return (
      <BarChart
        disableScroll
        yAxisThickness={0.5}
        yAxisExtraHeight={15}
        autoCenterTooltip
        showYAxisIndices
        hideRules
        autoShiftLabels={true}
        noOfSections={7}
        maxValue={Math.max(...chartData)}
        data={barData}
        barWidth={25}
        sideWidth={12}
        isThreeD
        side="right"
        renderTooltip={(item: any, index: number) => {
          const tooltipWidth = 150; // Width of the tooltip
          const maxBarHeight = 250; // Adjust based on your chart's max height
          const tooltipHeight = 50; // Estimated height of the tooltip
          const barHeight =
            (item.value / Math.max(...chartData)) * maxBarHeight;

          // Adjust tooltip position if bar height is too tall
          const isTooltipAboveBar = barHeight + tooltipHeight > maxBarHeight;
          const tooltipOffsetY = isTooltipAboveBar ? -tooltipHeight - 50 : 10; // Above or below the bar

          return (
            <View
              style={{
                position: 'absolute',
                bottom: tooltipOffsetY,
                backgroundColor: appColors.light,
                borderRadius: 15,
                borderColor: appColors?.formBorderColor,
                padding: 5,
                width: tooltipWidth,
                gap: 5,
                elevation: 2,
              }}>
              <CommonText content={item?.label} />
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <View
                  style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                  <View
                    style={{
                      height: 10,
                      width: 10,
                      borderRadius: 5,
                      backgroundColor: appColors.expenseBg,
                    }}
                  />
                  <CommonText
                    content={t('EXPENSE')}
                    color={appColors.expenseBg}
                  />
                </View>
                <CommonText
                  content={getCurrencySymbol(item?.value, false)}
                  color={appColors.expenseBg}
                  bold
                />
              </View>
            </View>
          );
        }}
      />
    );
  }

  // Calculate the step value
  const stepValue = Math.ceil((maxValue - minValue) / (labelCount - 1));

  return (
    <BarChart
      // stepValue={Number(stepValue)}
      stepValue={stepValue}
      disableScroll
      yAxisThickness={0.5}
      yAxisExtraHeight={15}
      autoCenterTooltip
      showYAxisIndices
      hideRules
      autoShiftLabels={true}
      noOfSections={7}
      maxValue={Math.max(...chartData)}
      data={barData}
      barWidth={25}
      sideWidth={12}
      isThreeD
      side="right"
      renderTooltip={(item: any, index: number) => {
        const tooltipWidth = 150; // Width of the tooltip
        const maxBarHeight = 250; // Adjust based on your chart's max height
        const tooltipHeight = 50; // Estimated height of the tooltip
        const barHeight = (item?.value / Math.max(...chartData)) * maxBarHeight;

        // Adjust tooltip position if bar height is too tall
        const isTooltipAboveBar = barHeight + tooltipHeight > maxBarHeight;
        const tooltipOffsetY = isTooltipAboveBar
          ? -tooltipHeight - 100
          : -tooltipHeight; // Above or below the bar

        return (
          <View
            style={{
              position: 'absolute',
              bottom: tooltipOffsetY,
              backgroundColor: appColors.light,
              borderRadius: 15,
              borderColor: appColors?.formBorderColor,
              padding: 5,
              width: tooltipWidth,
              gap: 5,
              elevation: 2,
              left:
                index == 0
                  ? 0
                  : index === 4
                  ? -40
                  : index === 5
                  ? -70
                  : index === 6
                  ? -120
                  : 0,
            }}>
            <CommonText content={item?.label} />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <View
                style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                <View
                  style={{
                    height: 10,
                    width: 10,
                    borderRadius: 5,
                    backgroundColor: appColors.expenseBg,
                  }}
                />
                <CommonText
                  content={t('EXPENSE')}
                  color={appColors.expenseBg}
                />
              </View>
              <CommonText
                content={getCurrencySymbol(item?.value, false)}
                color={appColors.expenseBg}
                bold
              />
            </View>
          </View>
        );
      }}
    />
  );
};

export default DashBoardBarChart;
