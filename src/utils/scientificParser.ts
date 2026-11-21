/**
 * Safe recursive-descent mathematical expression evaluator.
 * Does NOT use eval() or new Function().
 */

export type AngleMode = 'deg' | 'rad';

type Token =
  | { type: 'number'; value: number }
  | { type: 'ident'; value: string }
  | { type: 'op'; value: string }
  | { type: 'lparen' }
  | { type: 'rparen' }
  | { type: 'comma' };

const ALLOWED_FUNCTIONS = new Set([
  'sin',
  'cos',
  'tan',
  'asin',
  'acos',
  'atan',
  'sinh',
  'cosh',
  'tanh',
  'log',
  'ln',
  'exp',
  'sqrt',
  'cbrt',
  'fact',
  'abs',
  'pow',
]);

export function factorial(n: number): number {
  if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) return NaN;
  if (n > 170) return NaN; // Beyond IEEE-754 double precision
  if (n === 0 || n === 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) {
    res *= i;
  }
  return res;
}

function tokenize(raw: string): Token[] {
  const input = raw
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/π/g, 'pi')
    .replace(/\*\*/g, '^')
    .replace(/Math\.PI/g, 'pi')
    .replace(/Math\.E/g, 'e');

  const tokens: Token[] = [];
  let i = 0;

  while (i < input.length) {
    const ch = input[i];

    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    // Number (including leading dot like .5 and scientific notation like 1e-5)
    if (/[0-9]/.test(ch) || (ch === '.' && i + 1 < input.length && /[0-9]/.test(input[i + 1]))) {
      let start = i;
      while (i < input.length && /[0-9.]/.test(input[i])) {
        i++;
      }
      if (i < input.length && (input[i] === 'e' || input[i] === 'E')) {
        const next = input[i + 1];
        const afterNext = input[i + 2];
        if (
          (next && /[0-9]/.test(next)) ||
          ((next === '+' || next === '-') && afterNext && /[0-9]/.test(afterNext))
        ) {
          i++;
          if (input[i] === '+' || input[i] === '-') i++;
          while (i < input.length && /[0-9]/.test(input[i])) i++;
        }
      }
      const numStr = input.slice(start, i);
      const val = Number(numStr);
      if (!Number.isFinite(val)) {
        throw new Error(`Invalid number "${numStr}"`);
      }
      tokens.push({ type: 'number', value: val });
      continue;
    }

    // Identifier (function name or constant)
    if (/[a-zA-Z_]/.test(ch)) {
      const start = i;
      while (i < input.length && /[a-zA-Z0-9_]/.test(input[i])) {
        i++;
      }
      tokens.push({ type: 'ident', value: input.slice(start, i).toLowerCase() });
      continue;
    }

    if (ch === '(') {
      tokens.push({ type: 'lparen' });
      i++;
      continue;
    }

    if (ch === ')') {
      tokens.push({ type: 'rparen' });
      i++;
      continue;
    }

    if (ch === ',') {
      tokens.push({ type: 'comma' });
      i++;
      continue;
    }

    if ('+-*/%^'.includes(ch)) {
      tokens.push({ type: 'op', value: ch });
      i++;
      continue;
    }

    throw new Error(`Unsupported character "${ch}"`);
  }

  return tokens;
}

export function evaluateScientificExpression(
  expression: string,
  angleMode: AngleMode = 'deg',
  ans = 0
): number {
  const trimmed = expression.trim();
  if (!trimmed) return NaN;

  const tokens = tokenize(trimmed);
  if (tokens.length === 0) return NaN;

  let pos = 0;

  const peek = (): Token | undefined => tokens[pos];
  const consume = (): Token => tokens[pos++];

  const toRad = (angle: number) => (angleMode === 'deg' ? (angle * Math.PI) / 180 : angle);
  const fromRad = (rad: number) => (angleMode === 'deg' ? (rad * 180) / Math.PI : rad);

  const callFunction = (name: string, args: number[]): number => {
    if (!ALLOWED_FUNCTIONS.has(name)) {
      throw new Error(`Unknown function "${name}"`);
    }
    if (name === 'pow') {
      if (args.length !== 2) throw new Error('pow expects 2 arguments');
      return Math.pow(args[0], args[1]);
    }
    if (args.length !== 1) {
      throw new Error(`${name} expects 1 argument`);
    }
    const x = args[0];
    switch (name) {
      case 'sin':
        return Math.sin(toRad(x));
      case 'cos':
        return Math.cos(toRad(x));
      case 'tan': {
        if (angleMode === 'deg') {
          const mod = ((x % 180) + 180) % 180;
          if (Math.abs(mod - 90) < 1e-9) return NaN;
        }
        return Math.tan(toRad(x));
      }
      case 'asin':
        return x < -1 || x > 1 ? NaN : fromRad(Math.asin(x));
      case 'acos':
        return x < -1 || x > 1 ? NaN : fromRad(Math.acos(x));
      case 'atan':
        return fromRad(Math.atan(x));
      case 'sinh':
        return Math.sinh(x);
      case 'cosh':
        return Math.cosh(x);
      case 'tanh':
        return Math.tanh(x);
      case 'log':
        return x <= 0 ? NaN : Math.log10(x);
      case 'ln':
        return x <= 0 ? NaN : Math.log(x);
      case 'exp':
        return Math.exp(x);
      case 'sqrt':
        return x < 0 ? NaN : Math.sqrt(x);
      case 'cbrt':
        return Math.cbrt(x);
      case 'fact':
        return factorial(x);
      case 'abs':
        return Math.abs(x);
      default:
        return NaN;
    }
  };

  // Grammar:
  // expr       -> term ( ('+' | '-') term )*
  // term       -> unary ( ('*' | '/' | '%') unary )*
  // unary      -> ('+' | '-') unary | power
  // power      -> primary ( '^' unary )?   [right-associative]
  // primary    -> number | const | func '(' argList ')' | '(' expr ')'

  const parseExpr = (): number => {
    let left = parseTerm();
    while (peek()?.type === 'op' && ((peek() as { type: 'op'; value: string }).value === '+' || (peek() as { type: 'op'; value: string }).value === '-')) {
      const op = (consume() as { type: 'op'; value: string }).value;
      const right = parseTerm();
      left = op === '+' ? left + right : left - right;
    }
    return left;
  };

  const parseTerm = (): number => {
    let left = parseUnary();
    while (peek()?.type === 'op') {
      const op = (peek() as { type: 'op'; value: string }).value;
      if (op !== '*' && op !== '/' && op !== '%') break;
      consume();
      const right = parseUnary();
      if (op === '*') {
        left = left * right;
      } else if (op === '/') {
        if (right === 0) return NaN;
        left = left / right;
      } else {
        if (right === 0) return NaN;
        left = left % right;
      }
    }
    return left;
  };

  const parseUnary = (): number => {
    const tok = peek();
    if (tok?.type === 'op' && (tok.value === '+' || tok.value === '-')) {
      consume();
      const val = parseUnary();
      return tok.value === '-' ? -val : val;
    }
    return parsePower();
  };

  const parsePower = (): number => {
    const base = parsePrimary();
    const tok = peek();
    if (tok?.type === 'op' && tok.value === '^') {
      consume();
      const exp = parseUnary();
      return Math.pow(base, exp);
    }
    return base;
  };

  const parsePrimary = (): number => {
    const tok = peek();
    if (!tok) {
      throw new Error('Unexpected end of expression');
    }

    if (tok.type === 'number') {
      consume();
      return tok.value;
    }

    if (tok.type === 'ident') {
      consume();
      const name = tok.value;

      if (peek()?.type === 'lparen') {
        consume(); // '('
        const args: number[] = [];
        if (peek()?.type !== 'rparen') {
          args.push(parseExpr());
          while (peek()?.type === 'comma') {
            consume();
            args.push(parseExpr());
          }
        }
        if (peek()?.type !== 'rparen') {
          throw new Error('Missing closing parenthesis');
        }
        consume(); // ')'
        return callFunction(name, args);
      }

      if (name === 'pi') return Math.PI;
      if (name === 'e') return Math.E;
      if (name === 'ans') return Number.isFinite(ans) ? ans : 0;

      throw new Error(`Unknown identifier "${name}"`);
    }

    if (tok.type === 'lparen') {
      consume();
      const val = parseExpr();
      if (peek()?.type !== 'rparen') {
        throw new Error('Missing closing parenthesis');
      }
      consume();
      return val;
    }

    throw new Error('Unexpected token');
  };

  const value = parseExpr();
  if (pos !== tokens.length) {
    throw new Error('Unexpected trailing input');
  }
  return Number.isFinite(value) ? (Object.is(value, -0) ? 0 : value) : NaN;
}
