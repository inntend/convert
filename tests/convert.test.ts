import { expect, it } from 'vitest';
import Convert from '../src/convert';
import UnitsLibrary from '../src/units';

it('Creating conversion with single unit conversion and custom precision.', () => {
  const c = new Convert('energy').precision(5);
  expect(c.from(20, 'Wh').to('MWh')).toEqual(0.00002);
  expect(c.from(20, 'Wh').to('MWh', 3)).toEqual(0);
});

it('Attempt to define existing unit conversion.', () => {
  const c = new Convert('energy');
  expect(() => c.load(UnitsLibrary)).toThrowError(
    'Convert unit "mWh" is already defined.',
  );
  c.load('energy', true);
});

it('Clear unit conversions.', () => {
  const c = new Convert(['boolean', 'current', 'energy']);
  c.clear('current');
  expect(c['_unitsCache']).toEqual({
    boolean: {
      group: 'boolean',
    },
    GWh: {
      base: 1000000,
      group: 'energy',
    },
    MWh: {
      base: 1000,
      group: 'energy',
    },
    Wh: {
      base: 0.001,
      group: 'energy',
    },
    kWh: {
      group: 'energy',
    },
    mWh: {
      base: 0.000001,
      group: 'energy',
    },
  });
  c.clear();
  expect(c['_unitsCache']).toEqual({});
});

it('Display unit.', () => {
  const c = new Convert();
  expect(c.display('unknown')).toEqual('');
  expect(c.display('liters/sec')).toEqual('liters/sec');
  expect(c.display('m^3/hour')).toEqual('m\u00b3/h');
});

it('Get Convert unit value as a number.', () => {
  const c = new Convert();
  c.from(930729103461.8732, 'V');
  expect(c.value()).toEqual(930729103461.873);
  expect(c.value(1)).toEqual(930729103461.9);
});

it('Converting from an unknown unit should throw an error.', () => {
  const c = new Convert();
  expect(() => {
    // @ts-expect-error — intentionally bypassing compile-time type safety to verify runtime validation
    c.from(12, 'unknown');
  }).toThrowError('Unit "unknown" is not recognized.');
});

it('Converting units with different unknown unit should throw an error.', () => {
  const c = new Convert();
  expect(() => c.from(1, 'Wh').to('W')).toThrowError(
    'Unit W cannot be converted to Wh.',
  );
});

it('Working without setting source should throw an error.', () => {
  const c = new Convert();
  expect(() => c.to('kW')).toThrowError(
    'Source unit or value are not specified.',
  );
  expect(() => c.add(2)).toThrowError('Source value is not specified.');
  expect(() => c.sub(2)).toThrowError('Source value is not specified.');
  expect(() => c.mul(2)).toThrowError('Source value is not specified.');
  expect(() => c.div(2)).toThrowError('Source value is not specified.');
  expect(() => c.value()).toThrowError('Source value is not specified.');
});

it('Converting to lower unit should resolve successfully.', () => {
  const c = new Convert();
  expect(c.from(12, 'GW').sub(1).mul(2).to('kW')).toEqual(22000000);
});

it('Converting to higher unit should resolve successfully.', () => {
  const c = new Convert();
  expect(c.from(12, 'kW').add(4).div(2).to('MW')).toEqual(0.008);
});

it('Temperature from 0 C to F converts successfully.', () => {
  const c = new Convert();
  expect(c.from(0, 'C').to('F')).toEqual(32);
});

it('Temperature from 0 F to C converts successfully.', () => {
  const c = new Convert();
  expect(c.from(0, 'F').to('C')).toEqual(-17.778);
});

it('Temperature from 12 C to C converts successfully.', () => {
  const c = new Convert();
  expect(c.from(12, 'C').to('C')).toEqual(12);
});

it('Temperature from 12 F to F converts successfully.', () => {
  const c = new Convert();
  expect(c.from(2, 'C').div(25).to('C')).toEqual(0.08);
});

it('Attempt to verify existing unit conversion.', () => {
  const c = new Convert();
  c.verifyUnit(''); // dimensionless — valid
  expect(() => c.verifyUnit('invalid unit')).toThrow(
    'Unit "invalid unit" is not recognized.',
  );
  c.verifyUnit('kW');
  c.verifyUnit('C');
});

it('Attempt to validate existing unit conversion.', () => {
  const c = new Convert();
  expect(c.isValid('')).toBeTruthy(); // dimensionless
  expect(c.isValid('invalid unit')).toBeFalsy();
  expect(c.isValid('kW')).toBeTruthy();
  expect(c.isValid('C')).toBeTruthy();
});

it('Dimensionless values pass through as identity.', () => {
  const c = new Convert();
  expect(c.from(7, '').to('')).toEqual(7);
  expect(c.from(0, '').to('')).toEqual(0);
});

it('Dimensionless cannot be converted to or from a dimensioned unit.', () => {
  expect(() => new Convert().from(1, '').to('kW')).toThrow(
    'Unit "kW" cannot be converted to "".',
  );
  expect(() => new Convert().from(1, 'kW').to('')).toThrow(
    'Unit "" cannot be converted to "kW".',
  );
});
