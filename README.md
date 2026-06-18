> [!CAUTION]
> This repo is a very early experiment and everything in here is fragile and subject to change. Use at your own risk.


# @inntend/convert
A TypeScript-first unit conversion library with type safety, precise decimal arithmetic, and a fluent chainable API.

- ✅ **Type-safe by default** — `from()` and `to()` accept only unit names that actually exist in your loaded set; invalid units are caught at compile time, (but also at runtime).
- ✅ **Precise arithmetic with a single dependency** — built on [big.js](https://github.com/MikeMcl/big.js/) to avoid floating-point drift across conversions and chained operations
- ✅ **Extensible** — load any subset of the built-in library, define custom unit groups with formulas or base multipliers, and keep full type inference throughout
- ✅ **Fluent API** — chain conversions with arithmetic (`add`, `sub`, `mul`, `div`) before resolving to a number

## Compatibility

The package is published as **pure ES modules**:

| Environment | Support |
|---|---|
| Node.js ≥ 20 | ✅ Native ESM |
| Deno | ✅ Native ESM |
| Bun | ✅ Native ESM |
| React Native (Metro ≥ 0.72) | ✅ via `"exports"` field |
| Vite / webpack / rollup | ✅ Tree-shakeable ESM |
| Browsers (via bundler) | ✅ No browser-specific APIs used |

## Usage

### Installation
```
npm install @inntend/convert
```
```ts
import { Convert, UnitsLibrary } from '@inntend/convert';
```

### Class creation
Create a conversion object to work with. If no constructor parameters are specified, the default [UnitsLibrary](./src/units.ts) will be loaded.
```ts
// Instance of Convert loading all available unit group conversions
const a = new Convert();

// Load a single unit group conversion by name
const a = new Convert('energy');

// Load multiple unit group conversions by name
const a = new Convert(['temperature', 'volume']);

// Load a custom unit group library
const a = new Convert({
    // Define distance group conversions
    // ✅ type safety is inferred
    // NOTE: Unit names can be anything, but must be unique across all loaded groups
    'distance': {
        'm': {},
        'km': { base: 1000 },
        // optional display name used when calling .display()
        'mi': { base: 1609.344, display: 'mile' },
        // or provide explicit to/from formulas instead of a base multiplier
        'cm': {
            to: (value: Value): Value => value.div(1000),
            from: (value: Value): Value => value.mul(1000),
        }
    }
});
```
Parameters to `Convert<T>()`:
- group name (`Group`): One of the units groups defined in [UnitsLibrary](./src/units.ts).
- a list of group names (`Group[]`): Multiple groups to load.
- units library (`Units`): Any units object — when passed directly, `T` is inferred and `from()`/`to()` are type-safe.

### Type safety
`Convert<T>` is generic. When constructed with a units object, `from()` and `to()` accept only
`UnitKey<T>` — a compile-time union of every valid unit name in `T`. Passing an unknown unit is a
type error, not just a runtime error.

```ts
const a = new Convert(UnitsLibrary);

a.from(100, 'kW').to('MW');   // ✅ both 'kW' and 'MW' exist in UnitsLibrary
a.from(100, 'oops').to('MW'); // ❌ compile-time error: 'oops' is not a valid unit
```

You can derive the unit name union from any units object using the exported `UnitKey<T>` type:
```ts
import type { UnitKey } from '@inntend/convert';
import UnitsLibrary from '@inntend/convert';

type BuiltinUnit = UnitKey<typeof UnitsLibrary>; // 'kW' | 'MW' | 'C' | 'F' | ...
```

### Custom units
Other than using the builtin unit conversions, you can also create and import your own as follows:
```ts
const a = new Convert();
a.load({
    // Define distance group conversions
    // ✅ type safety is inferred
    // NOTE: Unit names can be anything, but must be unique across all loaded groups
    'distance': {
        'm': {},
        'km': { base: 1000 },
        // optional display name used when calling .display()
        'mi': { base: 1609.344, display: 'mile' },
        // or provide explicit to/from formulas instead of a base multiplier
        'cm': {
            to: (value: Value): Value => value.div(1000),
            from: (value: Value): Value => value.mul(1000),
        }
    }
});

// empty the units cache
a.clear();
```
_NOTE: Calling `load` appends to the existing cache. Pass `overwrite: true` as the second argument to allow replacing existing unit definitions._

### Conversion
Perform simple unit conversions.
```ts
const a = new Convert();

// returns 54.5
a.from(12.5, 'C').to('F');

// returns 72.98 (2 decimal places)
a.from(22.7643, 'C').to('F', 2);

// returns 18.29 (raw value, no conversion)
a.from(18.29, 'C').value();
// returns 18.3 (custom precision)
a.from(18.29, 'C').value(1);
```

### Precision
Set a per-instance default precision, or override it per call.
```ts
const a = new Convert();  // default precision: 3

a.precision(5);           // instance precision is now 5

a.from(18.29, 'C').value(3);  // returns 3 decimal places (call-level override)
a.from(18.29, 'C').to('F');   // returns 5 decimal places (instance default)
```

### Validation
Check whether a unit is loaded before working with it.

```ts
const a = new Convert();

// throws if unit is not in cache
a.verifyUnit('m^3');

// returns true/false
a.isValid('m^3');
```
_NOTE: All `from()`/`to()` calls automatically validate units before operating._

### Display
Retrieve the display name for a unit (useful for UI rendering).

```ts
const a = new Convert();

a.display('m^3');       // returns 'm³'
a.display('m^3/hour');  // returns 'm³/h'
a.display('kW');        // returns 'kW' (no custom display name)
```

### Global (singleton)
A set of static methods operate on a shared singleton instance for convenience.

```ts
// Load energy and volume units into the global cache
Convert.load(['energy', 'volume']);

// Verify a unit exists
Convert.verifyUnit('m^3');

// Get a display name
Convert.display('m^3');  // 'm³'

// Clear specific group or entire cache
Convert.clear('energy');
Convert.clear();
```
