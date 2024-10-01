import {AnimationObject} from 'lottie-react-native';

import PlanSvg from '@assets/svg/plan.svg';
import KnowMoneySvg from '@assets/svg/knowMoneyGoes.svg';
import ControlMoneySvg from '@assets/svg/controlMoney.svg';
import {JSXElementConstructor, ReactElement, SVGProps} from 'react';
import {StatusBar, StatusBarStyle} from 'react-native';

export interface OnboardingData {
  id: number;
  imageSrc: (
    props: SVGProps<SVGSVGElement>,
  ) => ReactElement<any, string | JSXElementConstructor<any>>;
  mainText: string;
  subText: string;
  textColor: string;
  backgroundColor: string;
  animationBg: string;
  barStyle: StatusBarStyle;
}

const data: OnboardingData[] = [
  {
    id: 1,
    imageSrc: ControlMoneySvg,
    mainText: 'Gain total control of your money',
    subText: 'Become your own money manager and make every cent count',
    textColor: '#ffffff',
    backgroundColor: '#fcb7d7',
    animationBg: '#ffffff',
    barStyle: 'light-content',
  },
  {
    id: 2,
    imageSrc: KnowMoneySvg,
    mainText: 'Know where your money goes',
    subText:
      'Track your transaction easily, with categories and financial report ',
    textColor: '#000000',
    backgroundColor: '#ffffff',
    animationBg: '#003cc9',
    barStyle: 'dark-content',
  },
  {
    id: 3,
    imageSrc: PlanSvg,
    mainText: 'Planning ahead',
    subText: 'Setup your budget for each category so you in control',
    textColor: '#ffffff',
    backgroundColor: '#003cc9',
    animationBg: '#fcb7d7',
    barStyle: 'light-content',
  },
];

export default data;
