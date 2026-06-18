import { expect, it } from 'vitest';
import Convert from '../src/convert';
import UnitsLibrary from '../src/units';

it('Load conversion units.', () => {
  Convert['_convert'] = undefined;
  Convert.load({ volume: UnitsLibrary.volume });
  Convert.load({ volume: UnitsLibrary.volume }, true);
  expect((Convert['_convert'] || new Convert())['_unitsCache']).toEqual({
    liters: {
      group: 'volume',
    },
    litres: {
      group: 'volume',
    },
    'm^3': {
      base: 1000,
      display: 'm³',
      group: 'volume',
    },
  });
});

it('Clear conversion units.', () => {
  Convert['_convert'] = undefined;
  Convert.clear();
  Convert.load({ volume: UnitsLibrary.volume });
  Convert.clear('boolean');
  expect((Convert['_convert'] || new Convert())['_unitsCache']).toEqual({
    liters: {
      group: 'volume',
    },
    litres: {
      group: 'volume',
    },
    'm^3': {
      base: 1000,
      display: 'm³',
      group: 'volume',
    },
  });
});

it('Get display value.', () => {
  Convert['_convert'] = undefined;
  expect(Convert.display('invalid')).toEqual('invalid');
  Convert.load(UnitsLibrary);
  expect(Convert.display('liters/sec')).toEqual('liters/sec');
  expect(Convert.display('m^3/hour')).toEqual('m\u00b3/h');
});

it('Attempt to verify existing unit conversion.', () => {
  Convert['_convert'] = undefined;
  Convert.verifyUnit('kWh');
  Convert.verifyUnit('boolean');
});

it('Attempt to validate existing unit conversion.', () => {
  Convert['_convert'] = undefined;
  expect(Convert.isValid('kWh')).toBeTruthy();
  expect(Convert.isValid('C')).toBeTruthy();
  expect(Convert.isValid('invalid unit')).toBeFalsy();
  expect(Convert.isValid('')).toBeFalsy();
});
