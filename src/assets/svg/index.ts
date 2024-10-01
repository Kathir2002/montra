import AmazonPay from '../svg/upi/apay.svg';
import ApplePay from '../svg/upi/applePay.svg';
import GPay from '../svg/upi/gpay.svg';
import Paytm from '../svg/upi/paytm.svg';
import PhonePe from '../svg/upi/phonepe.svg';

import AmazonPayLater from '../svg/paylater/amazonPayLater.svg';

import AxisBank from '../svg/bank/axis.svg';
import BankOfBaroda from '../svg/bank/bankOfBaroda.svg';
import CanaraBank from '../svg/bank/canara.svg';
import CentralBankOfIndia from '../svg/bank/centralBankOfIndia.svg';
import CitiIndiaBank from '../svg/bank/citi.svg';
import CUB from '../svg/bank/cub.svg';
import HDFC from '../svg/bank/hdfc.svg';
import ICICI from '../svg/bank/icici.svg';
import IDBI from '../svg/bank/idbi.svg';
import IndianBank from '../svg/bank/indianBank.svg';
import IOB from '../svg/bank/iob.svg';
import Kotak from '../svg/bank/kotak.svg';
import PNB from '../svg/bank/pnb.svg';
import PostOfficeBank from '../svg/bank/postOffice.svg';
import SBI from '../svg/bank/sbi.svg';
import TMB from '../svg/bank/tmb.svg';
import YesBank from '../svg/bank/yes.svg';

import Cash from '../svg/cash/cash.svg';

export interface PaymentType {
  name: string;
  nameCode: string;
  image: (props: React.SVGProps<SVGSVGElement>) => React.ReactElement;
}

const upiData = [
  {
    name: 'Amazon Pay',
    nameCode: 'amazonPay',
    image: AmazonPay,
  },
  {
    name: 'Apple Pay',
    nameCode: 'applePay',
    image: ApplePay,
  },
  {
    name: 'Google Pay',
    nameCode: 'gPay',
    image: GPay,
  },
  {
    name: 'Paytm',
    nameCode: 'paytm',
    image: Paytm,
  },
  {
    name: 'PhonePe',
    nameCode: 'phonePe',
    image: PhonePe,
  },
];

const payLaterData = [
  {
    name: 'Amazon Pay Later',
    nameCode: 'amazonPayLater',
    image: AmazonPayLater,
  },
];

const bankData = [
  {
    name: 'Axis Bank',
    nameCode: 'axisBank',
    image: AxisBank,
  },
  {
    name: 'Bank Of Baroda',
    nameCode: 'bankOfBaroda',
    image: BankOfBaroda,
  },
  {
    name: 'Canara Bank',
    nameCode: 'canaraBank',
    image: CanaraBank,
  },
  {
    name: 'Central Bank Of India',
    nameCode: 'centralBankOfIndia',
    image: CentralBankOfIndia,
  },
  {
    name: 'Citi India Bank',
    nameCode: 'citiIndiaBank',
    image: CitiIndiaBank,
  },
  {
    name: 'Citi Union Bank',
    nameCode: 'citiUnionBank',
    image: CUB,
  },
  {
    name: 'HDFC Bank',
    nameCode: 'hdfcBank',
    image: HDFC,
  },
  {
    name: 'ICICI Bank',
    nameCode: 'iciciBank',
    image: ICICI,
  },
  {
    name: 'IDBI Bank',
    nameCode: 'idbiiBank',
    image: IDBI,
  },
  {
    name: 'Indian Bank',
    nameCode: 'indianBank',
    image: IndianBank,
  },
  {
    name: 'Indian Overseas Bank',
    nameCode: 'indianOverseasBank',
    image: IOB,
  },
  {
    name: 'Kotak Mahindra Bank',
    nameCode: 'kotakMahindraBank',
    image: Kotak,
  },
  {
    name: 'Punjab National Bank',
    nameCode: 'punjabNationalBank',
    image: PNB,
  },
  {
    name: 'India Post Payments Bank',
    nameCode: 'indiaPostPaymentsBank',
    image: PostOfficeBank,
  },
  {
    name: 'State Bank Of India',
    nameCode: 'sbi',
    image: SBI,
  },
  {
    name: 'Tamilnad Mercantile Bank',
    nameCode: 'tmb',
    image: TMB,
  },
  {
    name: 'Yes BAnk',
    nameCode: 'yesBank',
    image: YesBank,
  },
];

const cashData = [
  {
    name: 'Cash',
    nameCode: 'cash',
    image: Cash,
  },
];

export const paymentData = {
  UPI: upiData,
  PayLater: payLaterData,
  Bank: bankData,
  Cash: cashData,
};

export interface PaymentDataInterface {
  UPI: PaymentType[];
  PayLater: PaymentType[];
  Bank: PaymentType[];
  Cash: PaymentType[];
}
