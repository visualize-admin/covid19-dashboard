export enum CantonGeoUnit {
  ZH = 'ZH',
  BE = 'BE',
  LU = 'LU',
  UR = 'UR',
  SZ = 'SZ',
  OW = 'OW',
  NW = 'NW',
  GL = 'GL',
  ZG = 'ZG',
  FR = 'FR',
  SO = 'SO',
  BS = 'BS',
  BL = 'BL',
  SH = 'SH',
  AR = 'AR',
  AI = 'AI',
  SG = 'SG',
  GR = 'GR',
  AG = 'AG',
  TG = 'TG',
  TI = 'TI',
  VD = 'VD',
  VS = 'VS',
  NE = 'NE',
  GE = 'GE',
  JU = 'JU',
  FL = 'FL',
}

export enum SwissRegionGeoUnit {
  GENEVA = 'CH01',
  MIDLAND = 'CH02',
  NORTH_WEST = 'CH03',
  ZURICH = 'CH04',
  EAST = 'CH05',
  CENTRAL = 'CH06',
  TICINO = 'CH07',
  FL = 'FL',
}

export enum TopLevelGeoUnit {
  CHFL = 'CHFL',
  CH = 'CH',
  FL = 'FL',
}

export enum SpecialGeoUnits {
  AA = 'AA',
}

export const DEFAULT_GEO_UNIT = TopLevelGeoUnit.CHFL

/**
 * Geographical unit of the data records.
 *
 * May be either one of the top level Units CHFL, CH or FL for aggregated record sets or the canton of residence when available or the administrative canton i.e. the canton in which the case was diagnosed (if the place of residence is unknown or if the patient lives abroad).
 */
export type GeoUnit = CantonGeoUnit | TopLevelGeoUnit | SwissRegionGeoUnit

/**
 *  Level of the IntGeoUnit.
 *
 *  ISO2 Two digit ISO 3166-1 country code.
 *  NUTS-1 NUTS Level 1 region (EU)
 *  NUTS-2 NUTS Level 2 region (EU)
 */
export type IntGeoUnitLevel = 'ISO2' | 'NUTS-1' | 'NUTS-2'

/**
 * International geographical unit of the data records.
 *
 * May be either an IS02 country code or a NUTS-1/NUTS-2 region code, see IntGeoUnitLevel.
 */
export type IntGeoUnit = Iso2Country | NutsLevel1 | NutsLevel2 | 'WORLD'

export enum Iso2Country {
  AF = 'AF',
  AX = 'AX',
  AL = 'AL',
  DZ = 'DZ',
  AS = 'AS',
  AD = 'AD',
  AO = 'AO',
  AI = 'AI',
  AQ = 'AQ',
  AG = 'AG',
  AR = 'AR',
  AM = 'AM',
  AW = 'AW',
  AU = 'AU',
  AT = 'AT',
  AZ = 'AZ',
  BS = 'BS',
  BH = 'BH',
  BD = 'BD',
  BB = 'BB',
  BY = 'BY',
  BE = 'BE',
  BZ = 'BZ',
  BJ = 'BJ',
  BM = 'BM',
  BT = 'BT',
  BO = 'BO',
  BQ = 'BQ',
  BA = 'BA',
  BW = 'BW',
  BV = 'BV',
  BR = 'BR',
  IO = 'IO',
  BN = 'BN',
  BG = 'BG',
  BF = 'BF',
  BI = 'BI',
  KH = 'KH',
  CM = 'CM',
  CA = 'CA',
  CV = 'CV',
  KY = 'KY',
  CF = 'CF',
  TD = 'TD',
  CL = 'CL',
  CN = 'CN',
  CX = 'CX',
  CC = 'CC',
  CO = 'CO',
  KM = 'KM',
  CG = 'CG',
  CD = 'CD',
  CK = 'CK',
  CR = 'CR',
  CI = 'CI',
  HR = 'HR',
  CU = 'CU',
  CW = 'CW',
  CY = 'CY',
  CZ = 'CZ',
  DK = 'DK',
  DJ = 'DJ',
  DM = 'DM',
  DO = 'DO',
  EC = 'EC',
  EG = 'EG',
  SV = 'SV',
  GQ = 'GQ',
  ER = 'ER',
  EE = 'EE',
  ET = 'ET',
  FK = 'FK',
  FO = 'FO',
  FJ = 'FJ',
  FI = 'FI',
  FR = 'FR',
  GF = 'GF',
  PF = 'PF',
  TF = 'TF',
  GA = 'GA',
  GM = 'GM',
  GE = 'GE',
  DE = 'DE',
  GH = 'GH',
  GI = 'GI',
  GR = 'GR',
  GL = 'GL',
  GD = 'GD',
  GP = 'GP',
  GU = 'GU',
  GT = 'GT',
  GG = 'GG',
  GN = 'GN',
  GW = 'GW',
  GY = 'GY',
  HT = 'HT',
  HM = 'HM',
  VA = 'VA',
  HN = 'HN',
  HK = 'HK',
  HU = 'HU',
  IS = 'IS',
  IN = 'IN',
  ID = 'ID',
  IR = 'IR',
  IQ = 'IQ',
  IE = 'IE',
  IM = 'IM',
  IL = 'IL',
  IT = 'IT',
  JM = 'JM',
  JP = 'JP',
  JE = 'JE',
  JO = 'JO',
  KZ = 'KZ',
  KE = 'KE',
  KI = 'KI',
  KP = 'KP',
  KR = 'KR',
  KW = 'KW',
  KG = 'KG',
  LA = 'LA',
  LV = 'LV',
  LB = 'LB',
  LS = 'LS',
  LR = 'LR',
  LY = 'LY',
  LI = 'LI',
  LT = 'LT',
  LU = 'LU',
  MO = 'MO',
  MK = 'MK',
  MG = 'MG',
  MW = 'MW',
  MY = 'MY',
  MV = 'MV',
  ML = 'ML',
  MT = 'MT',
  MH = 'MH',
  MQ = 'MQ',
  MR = 'MR',
  MU = 'MU',
  YT = 'YT',
  MX = 'MX',
  FM = 'FM',
  MD = 'MD',
  MC = 'MC',
  MN = 'MN',
  ME = 'ME',
  MS = 'MS',
  MA = 'MA',
  MZ = 'MZ',
  MM = 'MM',
  NA = 'NA',
  NR = 'NR',
  NP = 'NP',
  NL = 'NL',
  NC = 'NC',
  NZ = 'NZ',
  NI = 'NI',
  NE = 'NE',
  NG = 'NG',
  NU = 'NU',
  NF = 'NF',
  MP = 'MP',
  NO = 'NO',
  OM = 'OM',
  PK = 'PK',
  PW = 'PW',
  PS = 'PS',
  PA = 'PA',
  PG = 'PG',
  PY = 'PY',
  PE = 'PE',
  PH = 'PH',
  PN = 'PN',
  PL = 'PL',
  PT = 'PT',
  PR = 'PR',
  QA = 'QA',
  RE = 'RE',
  RO = 'RO',
  RU = 'RU',
  RW = 'RW',
  BL = 'BL',
  SH = 'SH',
  KN = 'KN',
  LC = 'LC',
  MF = 'MF',
  PM = 'PM',
  VC = 'VC',
  WS = 'WS',
  SM = 'SM',
  ST = 'ST',
  SA = 'SA',
  SN = 'SN',
  RS = 'RS',
  SC = 'SC',
  SL = 'SL',
  SG = 'SG',
  SX = 'SX',
  SK = 'SK',
  SI = 'SI',
  SB = 'SB',
  SO = 'SO',
  ZA = 'ZA',
  GS = 'GS',
  SS = 'SS',
  ES = 'ES',
  LK = 'LK',
  SD = 'SD',
  SR = 'SR',
  SJ = 'SJ',
  SZ = 'SZ',
  SE = 'SE',
  CH = 'CH',
  SY = 'SY',
  TW = 'TW',
  TJ = 'TJ',
  TZ = 'TZ',
  TH = 'TH',
  TL = 'TL',
  TG = 'TG',
  TK = 'TK',
  TO = 'TO',
  TT = 'TT',
  TN = 'TN',
  TR = 'TR',
  TM = 'TM',
  TC = 'TC',
  TV = 'TV',
  UG = 'UG',
  UA = 'UA',
  AE = 'AE',
  GB = 'GB',
  US = 'US',
  UM = 'UM',
  UY = 'UY',
  UZ = 'UZ',
  VU = 'VU',
  VE = 'VE',
  VN = 'VN',
  VG = 'VG',
  VI = 'VI',
  WF = 'WF',
  EH = 'EH',
  YE = 'YE',
  ZM = 'ZM',
  ZW = 'ZW',
}

export enum NutsLevel1 {
  DE1 = 'DE1',
  DE2 = 'DE2',
  DE3 = 'DE3',
  DE4 = 'DE4',
  DE5 = 'DE5',
  DE6 = 'DE6',
  DE7 = 'DE7',
  DE8 = 'DE8',
  DE9 = 'DE9',
  DEA = 'DEA',
  DEB = 'DEB',
  DEC = 'DEC',
  DED = 'DED',
  DEE = 'DEE',
  DEF = 'DEF',
  DEG = 'DEG',
  FR1 = 'FR1',
  FRB = 'FRB',
  FRC = 'FRC',
  FRD = 'FRD',
  FRE = 'FRE',
  FRF = 'FRF',
  FRG = 'FRG',
  FRH = 'FRH',
  FRI = 'FRI',
  FRJ = 'FRJ',
  FRK = 'FRK',
  FRL = 'FRL',
  FRM = 'FRM',
  FRY = 'FRY',
  XK = 'XK',
}

export enum NutsLevel2 {
  AT11 = 'AT11',
  AT12 = 'AT12',
  AT13 = 'AT13',
  AT21 = 'AT21',
  AT22 = 'AT22',
  AT31 = 'AT31',
  AT32 = 'AT32',
  AT33 = 'AT33',
  AT34 = 'AT34',
  ITC1 = 'ITC1',
  ITC2 = 'ITC2',
  ITC3 = 'ITC3',
  ITC4 = 'ITC4',
  ITF1 = 'ITF1',
  ITF2 = 'ITF2',
  ITF3 = 'ITF3',
  ITF4 = 'ITF4',
  ITF5 = 'ITF5',
  ITF6 = 'ITF6',
  ITG1 = 'ITG1',
  ITG2 = 'ITG2',
  ITH1 = 'ITH1',
  ITH2 = 'ITH2',
  ITH3 = 'ITH3',
  ITH4 = 'ITH4',
  ITH5 = 'ITH5',
  ITI1 = 'ITI1',
  ITI2 = 'ITI2',
  ITI3 = 'ITI3',
  ITI4 = 'ITI4',
}

export enum CantonGeoUnitNumber {
  ZH = 1,
  BE = 2,
  LU = 3,
  UR = 4,
  SZ = 5,
  OW = 6,
  NW = 7,
  GL = 8,
  ZG = 9,
  FR = 10,
  SO = 11,
  BS = 12,
  BL = 13,
  SH = 14,
  AR = 15,
  AI = 16,
  SG = 17,
  GR = 18,
  AG = 19,
  TG = 20,
  TI = 21,
  VD = 22,
  VS = 23,
  NE = 24,
  GE = 25,
  JU = 26,
  FL = 70,
}