import { GdiSubset, VaccinationVaccineInvidual, WgsVariants } from '@c19/commons'

export const COLOR_PRIMARY = '#428BD3'
export const COLOR_LINE_PRIMARY = '#428BD3'
export const COLOR_LINE_SECONDARY = '#C0D8F0'

export const COLOR_SUM_PCR = '#C0D8F0'
export const COLOR_SUM_ANTIGEN = '#428BD3'
export const COLORS_HISTOGRAM_TEST: [string, string] = [COLOR_SUM_PCR, COLOR_SUM_ANTIGEN]

export const COLOR_PER_VIRUS_VARIANTS: Record<WgsVariants, string> = {
  [GdiSubset.VARIANT_ALL_WGS]: '#ccc', // unused
  [GdiSubset.VARIANT_OTHER_WGS]: '#ccc', // unused
  [GdiSubset.VARIANT_B117]: '#112E4A',
  [GdiSubset.VARIANT_B117_E484K]: '#ccc', // unused
  [GdiSubset.VARIANT_B1351]: '#F18820',
  [GdiSubset.VARIANT_B16171]: '#B01715',
  [GdiSubset.VARIANT_B16172]: '#F9C646',
  [GdiSubset.VARIANT_P1]: '#504BAD',
  [GdiSubset.VARIANT_P2]: '#81B1E2',
  [GdiSubset.VARIANT_C37]: '#73d551',
  [GdiSubset.VARIANT_B1525]: '#548953',
  [GdiSubset.VARIANT_B1526]: '#C1327F',
  [GdiSubset.VARIANT_B11318]: '#ee00ff',
  [GdiSubset.VARIANT_B11529]: '#F2908F',
}

export const COLOR_TOTAL = '#c0d8f0'
export const COLOR_NEWLY_REPORTED = '#f18820'
export const COLOR_ROLLMEAN = '#183458' // #173D63
export const COLOR_ROLLMEAN_REF = '#225b94'
export const COLORS_HISTOGRAM_DEFAULT: [string, string] = [COLOR_TOTAL, COLOR_NEWLY_REPORTED]
export const COLORS_HISTOGRAM_MEANS: [string, string] = [COLOR_ROLLMEAN, '#428bd3']

export const COLOR_HISTOGRAM_MENU_TOTAL = '#c0d8f0'
export const COLOR_HISTOGRAM_MENU_SELECTED = '#428BD3'

export const COLOR_NO_CASE = '#e5e5e5'

export const COLOR_HOSP_CAP_COVID = '#173D63'
export const COLOR_HOSP_CAP_NON_COVID = '#428BD3'
export const COLOR_HOSP_CAP_FREE = '#CCCCCC'
export const COLORS_HOSP_CAP_BARS = ['#173D63', '#428BD3', '#CCCCCC']
export const COLORS_HOSP_CAP_LINES = ['#173D63', '#428BD3', '#CCCCCC']

export const COLORS_HISTOGRAM_LINE: [string, string] = ['#428bd3', '#c0d8f0']

export const COLORS_CHOROPLETH_SCALE = ['#c3d9ef', '#428bd3', '#112e4a']
export const COLOR_CHOROPLETH_STROKE = '#c3c3c3'
export const COLOR_CHOROPLETH_STROKE_DARKER = '#7c7c7c'
export const COLOR_CHOROPLETH_STROKE_SELECTED = '#000000'
export const COLOR_CHOROPLETH_STROKE_HOVER = '#000000'

export const COLOR_MALE = '#428bd3'
export const COLOR_FEMALE = '#81b1e2'
export const COLOR_UNKNOWN = '#b8dcff'

export const COLORS_MATRIX_HEATMAP_SCALE = ['#C0D8F0', '#8FBAE4', '#5C9BD9', '#3979B8', '#265382', '#112E4A']
export const COLORS_MATRIX_STACK = [COLOR_MALE, COLOR_UNKNOWN, COLOR_FEMALE]

export const COLOR_DIAGRAM_TICK_LINE = '#dddddd'
export const COLOR_DIAGRAM_TICK_TEXT = '#757575'

export const COLOR_QUARANTINE = '#173D63'
export const COLOR_QUARANTINE_TO = '#428BD3'
export const COLOR_QUARANTINE_FROM = '#81B1E2'
export const COLORS_CHOROPLETH_QUARANTINE_SCALE = [COLOR_QUARANTINE_FROM, COLOR_QUARANTINE_TO, COLOR_QUARANTINE]

export const COLOR_RANGE_1 = '#F9C646'
export const COLOR_RANGE_2 = '#F18820'
export const COLOR_RANGE_3 = '#EB5957'
export const COLOR_RANGE_4 = '#B01715'
export const GRADIENT_REPRO_LEGEND =
  'linear-gradient(90deg, rgba(249,198,70,1) 40%, rgba(241,136,32,1) 60%, rgba(235,89,87,1) 80%)'
export const GRADIENT_14_D_LEGEND =
  'linear-gradient(90deg, rgba(249,198,70,1) 20%, rgba(241,136,32,1) 30%, rgba(235,89,87,1) 40%, rgba(176,23,21,1) 90%)'

export const COLORS_COMPARE = ['#C0D8F0', '#428BD3']
export const COLORS_COMPARE_REF = ['#A7BBCF', '#173D63']

export const COLOR_MALE_VACC = '#6D9B6C'
export const COLOR_FEMALE_VACC = '#98BB95'
export const COLOR_UNKNOWN_VACC = '#C2DABD'

export const COLOR_VACC_RECEIVED_TABLE = '#98BB95'
export const COLOR_VACC_ADMINISTERED_TABLE = '#98BB95'
export const COLOR_VACC_CONTINGENT_TABLE = '#C2DABD'
export const COLOR_VACC_PERSONS_FULL_TABLE = '#C2DABD'
export const COLOR_VACC_PERSONS_BOOSTER_TABLE = '#98BB95'

export const COLOR_VACC_RECEIVED = '#1A4D1B'
export const COLOR_VACC_DELIVERED = '#3E783F'
export const COLOR_VACC_ADMINISTERED = '#96B993'
export const COLOR_VACC_SYMPTOMS_ADMIN = '#1A4D1B'
export const COLOR_VACC_PERSONS = '#3C763D'

export const COLOR_VACC_RECEIVED_DEV = '#F9C646'
export const COLOR_VACC_DELIVERED_DEV = '#81B1E2'
export const COLOR_VACC_ADMINISTERED_DEV = '#699868'
export const COLOR_VACC_CONTINGENT_DEV = '#504BAD'

export const COLORS_VACC_HEATMAP = ['#c2dabd', '#96b993', '#699868', '#3e783f', '#2d642e', '#1a4d1b']
export const COLORS_VACC_RATIO_BARS = ['#3E783F', '#96B993']
export const COLOR_VACC_GRP_RISK = '#3E783F'
export const COLOR_VACC_GRP_OTHER = '#96B993'
export const COLOR_VACC_NOT_VACCINATED = '#DBDBDB'
export const COLOR_VACC_PERSONS_FULL = '#3E783F'
export const COLOR_VACC_PERSONS_BOOSTER = '#1A4D1B'
export const COLOR_VACC_PERSONS_PARTIAL = '#699868'
export const COLOR_VACC_PERSONS_MIN_ONE = '#96B993'
export const COLOR_VACC_PERSONS_NOT_VACCINATED = '#DBDBDB'
export const COLOR_VACC_SYMPTOMS_SERIOUS = '#3E783F'
export const COLOR_VACC_SYMPTOMS_NOT_SERIOUS = '#96B993'

export const COLOR_VACC_PERSONS_BOOSTER_PATTERN = '#FFFFFF'
export const COLOR_STATUS_NOT_VACCINATED = '#D5D5D5'

export const COLOR_VACCINE_STATUS_MODERNA_FULL = '#B01715'
export const COLOR_VACCINE_STATUS_MODERNA_PARTIAL = '#F2908F'
export const COLOR_VACCINE_STATUS_PFIZER_FULL = '#3979B8'
export const COLOR_VACCINE_STATUS_PFIZER_PARTIAL = '#8FBAE4'
export const COLOR_VACCINE_STATUS_JOHNSON_FULL = '#504BAD'
export const COLOR_VACCINE_STATUS_NOT_VACCINATED_MAIN = '#112E4A'
export const COLOR_VACCINE_STATUS_NOT_VACCINATED = '#D5D5D5'
export const COLOR_VACCINE_STATUS_UNKNOWN = '#D5D5D5'

export const COLOR_STATUS_LINE_NOT_VACCINATED = '#723a4c'
export const COLOR_STATUS_LINE_FULL = '#3979B8'
export const COLOR_STATUS_LINE_PARTIAL = '#8FBAE4'
export const COLOR_STATUS_LINE_UNKNOWN = '#D5D5D5'
export const COLOR_STATUS_LINE_FULL_WITH_BOOSTER = '#255481'

export const COLORS_VACC_PERS_GEO_OLD = [
  '#C2DABD',
  '#A2C29F',
  '#81AA7F',
  '#629361',
  '#447D45',
  '#346D35',
  '#265C27',
  '#1A4D1B',
  '#154215',
  '#0D380E',
]

export const COLORS_VACC_PERS_GEO = [
  '#F3F7F1',
  '#E3EDE0',
  '#D2E3CE',
  '#C1D8BB',
  '#A2C29E',
  '#79A377',
  '#508550',
  '#326934',
  '#205122',
  '#0D380F',
]

export const COLORS_INZ_SUM_CAT = ['#C0D8F0', '#82B2E1', '#4B8AC9', '#3774B1', '#2B5D90', '#1E456D', '#112E4A']

export const COLORS_CUMULATIVE = [
  '#112E4A',
  '#504BAD',
  '#81B1E2',
  '#699868',
  '#C1327F',
  '#723A4C',
  '#B01715',
  '#F18820',
  '#F9C646',
]

export const COLORS_CUMULATIVE_VACC_STRATEGY = ['#F9C646', '#F18820', '#B01715', '#504BAD']

export const COLORS_LOCATIONS = ['#F18820', '#723A4C', '#C1327F', '#699868', '#504BAD', '#ADADAD']
export const COLORS_INDICATIONS_GENERAL = ['#173D63', '#81B1E2', '#699868', '#723A4C', '#C1327F', '#ADADAD']
export const COLORS_VACCINES = ['#81B1E2', '#EB5957']

export const COLOR_PER_VACCINE: Record<VaccinationVaccineInvidual, string> = {
  [VaccinationVaccineInvidual.PFIZER_BIONTECH]: '#81B1E2',
  [VaccinationVaccineInvidual.MODERNA]: '#EB5957',
  [VaccinationVaccineInvidual.JOHNSON_JOHNSON]: '#112E4A',
}

export const COLORS_SYMPTOMS_AGE_RANGE = [
  '#F18820',
  '#723A4C',
  '#C1327F',
  '#699868',
  '#81B1E2',
  '#504BAD',
  '#112E4A',
  '#ADADAD',
]

export const COLOR_VACC_DAILY_BAR = '#C2DABD'
export const COLOR_VACC_MEAN_7D = '#1A4D1B'

export const COLOR_REPRO_TABLE_RANGE_1 = '#F3D88E'
export const COLOR_REPRO_TABLE_RANGE_1_HOVER = '#DCC789'
export const COLOR_REPRO_TABLE_RANGE_2 = '#EFB377'
export const COLOR_REPRO_TABLE_RANGE_2_HOVER = '#D8A674'
export const COLOR_REPRO_TABLE_RANGE_3 = '#EB9698'
export const COLOR_REPRO_TABLE_RANGE_3_HOVER = '#D58C92'

export const COLOR_CERTIFICATE_VACC = '#699868'
export const COLOR_CERTIFICATE_RECOVERY = '#81B1E2'
export const COLOR_CERTIFICATE_TEST = '#504BAD'
