import Big from 'big.js';
import type { UnitCache, UnitKey, Units, Value } from './types';
import type { Group } from './units';
import UnitsLibrary from './units';

/**
 * The main conversion class used to perform various unit conversions according
 * to a specified collection of {@link Units}.
 */
export default class Convert<T extends Units = typeof UnitsLibrary> {
  /** The default precision number after the decimal point used for all
   * post-conversion results. */
  public PRECISION = 3;

  private _precision: number;
  private _unitsCache: Record<string, UnitCache>;
  private _unit?: string;
  private _value?: Value;

  private static _convert?: Convert<Units>;

  /**
   * Load unit definitions into the global conversion cache (singleton).
   *
   * @param {Units | Group | Group[]} units - The units to load.
   * @param {boolean} overwrite - Optional. Overwrite any existing duplicate definitions.
   */
  public static load(
    units: Units | Group | Group[],
    overwrite?: boolean,
  ): Convert<Units> {
    Convert._convert ??= new Convert<Units>({} as Units);
    Convert._convert.load(units, overwrite);
    return Convert._convert;
  }

  /**
   * Clear the specified unit group from the global cache. If not specified,
   * clears the entire cache.
   *
   * @param {Group} group - Optional. The unit group to clear.
   */
  public static clear(group?: Group): void {
    Convert._convert?.clear(group);
  }

  /**
   * Given a unit definition, retrieve its display value from the global cache.
   *
   * @param {string} unit - The unit definition.
   * @return {string} - The display representation, or the unit string itself.
   */
  public static display(unit: string): string {
    return Convert._convert?.display(unit) ?? unit;
  }

  /**
   * Verify that a given unit definition is valid in the global cache.
   *
   * @param {string} unit - The unit definition.
   * @throws {Error} - If the supplied unit definition is invalid.
   */
  public static verifyUnit(unit: string): void {
    (Convert._convert ??= new Convert() as Convert<Units>).verifyUnit(unit);
  }

  /**
   * Check if a given unit definition is valid in the global cache.
   *
   * @param {string} unit - The unit definition.
   * @returns {boolean} - True if valid, false otherwise.
   */
  public static isValid(unit: string): boolean {
    return (Convert._convert ??= new Convert() as Convert<Units>).isValid(unit);
  }

  /**
   * Create an instance of this class, optionally specifying a set of unit
   * definitions. When `units` is a `Units` object, `T` is inferred and
   * `from()`/`to()` will only accept unit names present in that object.
   *
   * @param {T | Group | Group[]} units - Optional. A units object, group name,
   *      or array of group names. Defaults to loading all of {@link UnitsLibrary}.
   */
  public constructor(units?: T | Group | Group[]) {
    this._precision = this.PRECISION;
    this._unitsCache = {};
    this.load((units ?? UnitsLibrary) as Units | Group | Group[]);
  }

  /**
   * Load unit definitions into this instance's cache.
   *
   * @param {Units | Group | Group[]} units - The units to load.
   * @param {boolean} overwrite - Optional. Overwrite any existing duplicate definitions.
   * @returns {this}
   */
  public load(units: Units | Group | Group[], overwrite?: boolean): this {
    let unitsObject: Units = {};
    if (typeof units == 'string') {
      unitsObject[units] = UnitsLibrary[units];
    } else if (Array.isArray(units)) {
      for (const group of units) {
        unitsObject[group] = UnitsLibrary[group];
      }
    } else {
      unitsObject = units;
    }

    for (const group in unitsObject) {
      for (const unitName in unitsObject[group]) {
        if (!overwrite && unitName in this._unitsCache) {
          throw Error(`Convert unit "${unitName}" is already defined.`);
        }
        this._unitsCache[unitName] = { group, ...unitsObject[group][unitName] };
      }
    }
    return this;
  }

  /**
   * Set the default precision after the decimal point.
   *
   * @param {number} precision - The precision after the decimal point.
   * @returns {this}
   */
  public precision(precision: number): this {
    this._precision = precision;
    return this;
  }

  /**
   * Clear the specified unit group from this instance's cache. If no group is
   * specified, the entire cache is cleared.
   *
   * @param {Group} group - Optional. The unit group to clear.
   * @returns {this}
   */
  public clear(group?: Group): this {
    if (group) {
      Object.entries(this._unitsCache).forEach(([key, value]) => {
        if (value.group === group) delete this._unitsCache[key];
      });
    } else {
      this._unitsCache = {};
    }
    return this;
  }

  /**
   * Set the source conversion unit and value.
   * When `T` is a specific units object, `unit` is constrained to `UnitKey<T>` —
   * the exact set of unit names present in that object (the printUnit.ts pattern).
   *
   * @param {number} value - The source value.
   * @param {UnitKey<T>} unit - The source unit.
   * @returns {this}
   * @throws {Error} - If the supplied unit definition is invalid.
   */
  public from(value: number, unit: UnitKey<T>): this {
    this.verifyUnit(unit);
    this._unit = unit;
    this._value = new Big(value);
    return this;
  }

  /**
   * Convert to the destination unit and return the resulting value.
   *
   * @param {UnitKey<T>} unit - The destination unit.
   * @param {number} precision - Optional. Override the instance precision for this call.
   * @returns {number}
   * @throws {Error} - If the source has not been set, the unit is invalid,
   *      or the source and destination belong to different groups.
   */
  public to(unit: UnitKey<T>, precision?: number): number {
    if (!this._value || this._unit === undefined)
      throw Error('Source unit or value are not specified.');
    this.verifyUnit(unit);
    // Dimensionless ('') converts only to itself (identity) — it has no group,
    // so it can neither scale nor cross into a dimensioned unit.
    if (this._unit === '' || unit === '') {
      if (this._unit !== unit)
        throw Error(`Unit "${unit}" cannot be converted to "${this._unit}".`);
      return this._value
        .round(precision || this._precision, Big.roundHalfUp)
        .toNumber();
    }
    const source = this._unitsCache[this._unit];
    const destination = this._unitsCache[unit];
    if (source.group !== destination.group) {
      throw Error(`Unit ${unit} cannot be converted to ${this._unit}.`);
    }
    const DEFAULT_BASE = 1;
    const to_base = source.to
      ? source.to(this._value)
      : this._value.mul(source.base || DEFAULT_BASE);
    const result: Big = destination.from
      ? destination.from(to_base)
      : to_base.div(destination.base || DEFAULT_BASE);
    return result
      .round(precision || this._precision, Big.roundHalfUp)
      .toNumber();
  }

  /**
   * Perform an `addition` arithmetic operation against the source value.
   *
   * @param {number} value - The value to add.
   * @returns {this}
   */
  public add(value: number): this {
    if (!this._value) throw Error('Source value is not specified.');
    this._value = this._value.add(value);
    return this;
  }

  /**
   * Perform a `subtraction` arithmetic operation against the source value.
   *
   * @param {number} value - The value to subtract.
   * @returns {this}
   */
  public sub(value: number): this {
    if (!this._value) throw Error('Source value is not specified.');
    this._value = this._value.sub(value);
    return this;
  }

  /**
   * Perform a `multiplication` arithmetic operation against the source value.
   *
   * @param {number} value - The value to multiply by.
   * @returns {this}
   */
  public mul(value: number): this {
    if (!this._value) throw Error('Source value is not specified.');
    this._value = this._value.mul(value);
    return this;
  }

  /**
   * Perform a `division` arithmetic operation against the source value.
   *
   * @param {number} value - The value to divide by.
   * @returns {this}
   */
  public div(value: number): this {
    if (!this._value) throw Error('Source value is not specified.');
    this._value = this._value.div(value);
    return this;
  }

  /**
   * Get the current value after any arithmetic operations.
   *
   * @param {number} precision - Optional. Override the instance precision for this call.
   * @returns {number}
   * @throws {Error} - If the source has not been set.
   */
  public value(precision?: number): number {
    if (!this._value) throw Error('Source value is not specified.');
    return this._value
      .round(precision || this._precision, Big.roundHalfUp)
      .toNumber();
  }

  /**
   * Retrieve the display value for a unit, intended for presentation purposes.
   *
   * @param {string} unit - The unit definition.
   * @return {string} - The display representation, or the unit string itself,
   *      or an empty string if the unit is not in the cache.
   */
  public display(unit: string): string {
    const unitRecord = this._unitsCache[unit];
    if (!unitRecord) return '';
    return unitRecord.display ?? unit;
  }

  /**
   * Verify that a given unit definition is valid.
   *
   * @param {string} unit - The unit definition.
   * @throws {Error} - If the supplied unit definition is invalid.
   */
  public verifyUnit(unit: string): void {
    if (unit === '') return; // dimensionless — valid as an identity-only unit
    if (!unit) throw Error(`No unit was specified.`);
    if (!Object.keys(this._unitsCache).includes(unit))
      throw Error(`Unit "${unit}" is not recognized.`);
  }

  /**
   * Check if a given unit definition is valid.
   *
   * @param {string} unit - The unit definition.
   * @returns {boolean} - True if valid, false otherwise.
   */
  public isValid(unit: string): boolean {
    return unit === '' || Object.keys(this._unitsCache).includes(unit);
  }
}
