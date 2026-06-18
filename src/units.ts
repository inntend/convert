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
  // pressure conversion values group
  pressure: {
    bar: {},
  },
  // temperature conversion values group
  temperature: {
    C: {},
    F: {
      to: (value: Value): Value => value.sub(32).mul(5).div(9),
      from: (value: Value): Value => value.mul(9).div(5).add(32),
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
} satisfies Units;

/**
 * All valid unit group names, derived directly from the units library.
 * This replaces a manually-maintained union type with one derived from the data.
 */
export type Group = keyof typeof units;

export default units;
