import type { Units, Value } from './types';

const units = {
  // No units conversion values group
  none: { none: {} },
  // boolean conversion values group
  boolean: { boolean: {} },
  // current conversion values group
  current: {
    mA: { base: 0.001 },
    A: {},
    kA: { base: 1000 },
  },
  // thermal energy conversion values group
  energyTh: {
    'mWh(th)': { base: 0.000001 },
    'Wh(th)': { base: 0.001 },
    'kWh(th)': {},
    'MWh(th)': { base: 1000 },
    'GWh(th)': { base: 1000000 },
  },
  // electrical energy conversion values group
  energy: {
    mWh: { base: 0.000001 },
    Wh: { base: 0.001 },
    kWh: {},
    MWh: { base: 1000 },
    GWh: { base: 1000000 },
  },
  // fluid flow conversion values group
  flow: {
    'litres/sec': {},
    'liters/sec': {},
    'm^3/hour': { base: 3.6, display: 'm\u00b3/h' },
  },
  // percent conversion values group
  percent: {
    '%': {},
  },
  // thermal power conversion values group
  powerTh: {
    'W(th)': { base: 0.001 },
    'kW(th)': {},
    'MW(th)': { base: 1000 },
    'GW(th)': { base: 1000000 },
  },
  // electrical power conversion values group
  power: {
    mW: { base: 0.000001 },
    W: { base: 0.001 },
    kW: {},
    MW: { base: 1000 },
    GW: { base: 1000000 },
  },
  // pressure conversion values group (base: bar)
  pressure: {
    Pa: { base: 0.00001 },
    hPa: { base: 0.001 },
    kPa: { base: 0.01 },
    bar: {},
  },
  // temperature conversion values group (base: C)
  temperature: {
    C: { display: '°C' },
    F: {
      to: (value: Value): Value => value.sub(32).mul(5).div(9),
      from: (value: Value): Value => value.mul(9).div(5).add(32),
      display: '°F',
    },
  },
  // voltage conversion values group
  voltage: {
    mV: { base: 0.001 },
    V: {},
    kV: { base: 1000 },
  },
  // volume conversion values group
  volume: {
    litres: {},
    liters: {},
    'm^3': { base: 1000, display: 'm\u00b3' },
  },
  // length conversion values group (base: m)
  length: {
    mm: { base: 0.001 },
    cm: { base: 0.01 },
    m: {},
    km: { base: 1000 },
  },
  // speed conversion values group (base: km/h)
  speed: {
    'km/h': {},
    'm/s': { base: 3.6 },
  },
  // plane angle conversion values group (base: deg)
  angle: {
    deg: { display: '\u00b0' },
    rad: { base: 57.29577951308232 },
  },
  // irradiance (power per area) conversion values group (base: W/m2)
  irradiance: {
    'W/m2': { display: 'W/m\u00b2' },
    'kW/m2': { base: 1000, display: 'kW/m\u00b2' },
  },
  // radiant exposure (energy per area) conversion values group (base: J/m2)
  radiantExposure: {
    'J/m2': { display: 'J/m\u00b2' },
    'kJ/m2': { base: 1000, display: 'kJ/m\u00b2' },
    'MJ/m2': { base: 1000000, display: 'MJ/m\u00b2' },
    'Wh/m2': { base: 3600, display: 'Wh/m\u00b2' },
  },
  // duration conversion values group (base: s)
  duration: {
    ms: { base: 0.001 },
    s: {},
    min: { base: 60 },
    h: { base: 3600 },
  },
  // specific energy (energy per mass) conversion values group (base: J/kg)
  specificEnergy: {
    'J/kg': {},
    'kJ/kg': { base: 1000 },
  },
  // dimensionless ratio conversion values group (base: m3/m3)
  ratio: {
    'm3/m3': { display: 'm\u00b3/m\u00b3' },
  },
  // absolute timestamp conversion values group (base: unixtime, seconds)
  timestamp: {
    unixtime: {},
  },
} satisfies Units;

/**
 * All valid unit group names, derived directly from the units library.
 * This replaces a manually-maintained union type with one derived from the data.
 */
export type Group = keyof typeof units;

export default units;
