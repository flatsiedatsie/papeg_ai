"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Environment: () => Environment,
  Interpreter: () => Interpreter,
  Template: () => Template,
  parse: () => parse,
  tokenize: () => tokenize
});
module.exports = __toCommonJS(src_exports);

// src/lexer.ts
var TOKEN_TYPES = Object.freeze({
  Text: "Text",
  // The text between Jinja statements or expressions
  NumericLiteral: "NumericLiteral",
  // e.g., 123
  BooleanLiteral: "BooleanLiteral",
  // true or false
  NullLiteral: "NullLiteral",
  // none
  StringLiteral: "StringLiteral",
  // 'string'
  Identifier: "Identifier",
  // Variables, functions, etc.
  Equals: "Equals",
  // =
  OpenParen: "OpenParen",
  // (
  CloseParen: "CloseParen",
  // )
  OpenStatement: "OpenStatement",
  // {%
  CloseStatement: "CloseStatement",
  // %}
  OpenExpression: "OpenExpression",
  // {{
  CloseExpression: "CloseExpression",
  // }}
  OpenSquareBracket: "OpenSquareBracket",
  // [
  CloseSquareBracket: "CloseSquareBracket",
  // ]
  OpenCurlyBracket: "OpenCurlyBracket",
  // {
  CloseCurlyBracket: "CloseCurlyBracket",
  // }
  Comma: "Comma",
  // ,
  Dot: "Dot",
  // .
  Colon: "Colon",
  // :
  Pipe: "Pipe",
  // |
  CallOperator: "CallOperator",
  // ()
  AdditiveBinaryOperator: "AdditiveBinaryOperator",
  // + -
  MultiplicativeBinaryOperator: "MultiplicativeBinaryOperator",
  // * / %
  ComparisonBinaryOperator: "ComparisonBinaryOperator",
  // < > <= >= == !=
  UnaryOperator: "UnaryOperator",
  // ! - +
  // Keywords
  Set: "Set",
  If: "If",
  For: "For",
  In: "In",
  Is: "Is",
  NotIn: "NotIn",
  Else: "Else",
  EndIf: "EndIf",
  ElseIf: "ElseIf",
  EndFor: "EndFor",
  And: "And",
  Or: "Or",
  Not: "UnaryOperator",
  Macro: "Macro",
  EndMacro: "EndMacro"
});
var KEYWORDS = Object.freeze({
  set: TOKEN_TYPES.Set,
  for: TOKEN_TYPES.For,
  in: TOKEN_TYPES.In,
  is: TOKEN_TYPES.Is,
  if: TOKEN_TYPES.If,
  else: TOKEN_TYPES.Else,
  endif: TOKEN_TYPES.EndIf,
  elif: TOKEN_TYPES.ElseIf,
  endfor: TOKEN_TYPES.EndFor,
  and: TOKEN_TYPES.And,
  or: TOKEN_TYPES.Or,
  not: TOKEN_TYPES.Not,
  "not in": TOKEN_TYPES.NotIn,
  macro: TOKEN_TYPES.Macro,
  endmacro: TOKEN_TYPES.EndMacro,
  // Literals
  true: TOKEN_TYPES.BooleanLiteral,
  false: TOKEN_TYPES.BooleanLiteral,
  none: TOKEN_TYPES.NullLiteral,
  // NOTE: According to the Jinja docs: The special constants true, false, and none are indeed lowercase.
  // Because that caused confusion in the past, (True used to expand to an undefined variable that was considered false),
  // all three can now also be written in title case (True, False, and None). However, for consistency, (all Jinja identifiers are lowercase)
  // you should use the lowercase versions.
  True: TOKEN_TYPES.BooleanLiteral,
  False: TOKEN_TYPES.BooleanLiteral,
  None: TOKEN_TYPES.NullLiteral
});
var Token = class {
  /**
   * Constructs a new Token.
   * @param {string} value The raw value as seen inside the source code.
   * @param {TokenType} type The type of token.
   */
  constructor(value, type) {
    this.value = value;
    this.type = type;
  }
};
function isWord(char) {
  return /\w/.test(char);
}
function isInteger(char) {
  return /[0-9]/.test(char);
}
var ORDERED_MAPPING_TABLE = [
  // Control sequences
  ["{%", TOKEN_TYPES.OpenStatement],
  ["%}", TOKEN_TYPES.CloseStatement],
  ["{{", TOKEN_TYPES.OpenExpression],
  ["}}", TOKEN_TYPES.CloseExpression],
  // Single character tokens
  ["(", TOKEN_TYPES.OpenParen],
  [")", TOKEN_TYPES.CloseParen],
  ["{", TOKEN_TYPES.OpenCurlyBracket],
  ["}", TOKEN_TYPES.CloseCurlyBracket],
  ["[", TOKEN_TYPES.OpenSquareBracket],
  ["]", TOKEN_TYPES.CloseSquareBracket],
  [",", TOKEN_TYPES.Comma],
  [".", TOKEN_TYPES.Dot],
  [":", TOKEN_TYPES.Colon],
  ["|", TOKEN_TYPES.Pipe],
  // Comparison operators
  ["<=", TOKEN_TYPES.ComparisonBinaryOperator],
  [">=", TOKEN_TYPES.ComparisonBinaryOperator],
  ["==", TOKEN_TYPES.ComparisonBinaryOperator],
  ["!=", TOKEN_TYPES.ComparisonBinaryOperator],
  ["<", TOKEN_TYPES.ComparisonBinaryOperator],
  [">", TOKEN_TYPES.ComparisonBinaryOperator],
  // Arithmetic operators
  ["+", TOKEN_TYPES.AdditiveBinaryOperator],
  ["-", TOKEN_TYPES.AdditiveBinaryOperator],
  ["*", TOKEN_TYPES.MultiplicativeBinaryOperator],
  ["/", TOKEN_TYPES.MultiplicativeBinaryOperator],
  ["%", TOKEN_TYPES.MultiplicativeBinaryOperator],
  // Assignment operator
  ["=", TOKEN_TYPES.Equals]
];
var ESCAPE_CHARACTERS = /* @__PURE__ */ new Map([
  ["n", "\n"],
  // New line
  ["t", "	"],
  // Horizontal tab
  ["r", "\r"],
  // Carriage return
  ["b", "\b"],
  // Backspace
  ["f", "\f"],
  // Form feed
  ["v", "\v"],
  // Vertical tab
  ["'", "'"],
  // Single quote
  ['"', '"'],
  // Double quote
  ["\\", "\\"]
  // Backslash
]);
function preprocess(template, options = {}) {
  if (template.endsWith("\n")) {
    template = template.slice(0, -1);
  }
  template = template.replace(/{#.*?#}/gs, "{##}");
  if (options.lstrip_blocks) {
    template = template.replace(/^[ \t]*({[#%])/gm, "$1");
  }
  if (options.trim_blocks) {
    template = template.replace(/([#%]})\n/g, "$1");
  }
  return template.replace(/{##}/g, "").replace(/-%}\s*/g, "%}").replace(/\s*{%-/g, "{%").replace(/-}}\s*/g, "}}").replace(/\s*{{-/g, "{{");
}
function tokenize(source, options = {}) {
  const tokens = [];
  const src = preprocess(source, options);
  let cursorPosition = 0;
  const consumeWhile = (predicate) => {
    let str = "";
    while (predicate(src[cursorPosition])) {
      if (src[cursorPosition] === "\\") {
        ++cursorPosition;
        if (cursorPosition >= src.length)
          throw new SyntaxError("Unexpected end of input");
        const escaped = src[cursorPosition++];
        const unescaped = ESCAPE_CHARACTERS.get(escaped);
        if (unescaped === void 0) {
          throw new SyntaxError(`Unexpected escaped character: ${escaped}`);
        }
        str += unescaped;
        continue;
      }
      str += src[cursorPosition++];
      if (cursorPosition >= src.length)
        throw new SyntaxError("Unexpected end of input");
    }
    return str;
  };
  main:
    while (cursorPosition < src.length) {
      const lastTokenType = tokens.at(-1)?.type;
      if (lastTokenType === void 0 || lastTokenType === TOKEN_TYPES.CloseStatement || lastTokenType === TOKEN_TYPES.CloseExpression) {
        let text = "";
        while (cursorPosition < src.length && // Keep going until we hit the next Jinja statement or expression
        !(src[cursorPosition] === "{" && (src[cursorPosition + 1] === "%" || src[cursorPosition + 1] === "{"))) {
          text += src[cursorPosition++];
        }
        if (text.length > 0) {
          tokens.push(new Token(text, TOKEN_TYPES.Text));
          continue;
        }
      }
      consumeWhile((char2) => /\s/.test(char2));
      const char = src[cursorPosition];
      if (char === "-" || char === "+") {
        const lastTokenType2 = tokens.at(-1)?.type;
        if (lastTokenType2 === TOKEN_TYPES.Text || lastTokenType2 === void 0) {
          throw new SyntaxError(`Unexpected character: ${char}`);
        }
        switch (lastTokenType2) {
          case TOKEN_TYPES.Identifier:
          case TOKEN_TYPES.NumericLiteral:
          case TOKEN_TYPES.BooleanLiteral:
          case TOKEN_TYPES.NullLiteral:
          case TOKEN_TYPES.StringLiteral:
          case TOKEN_TYPES.CloseParen:
          case TOKEN_TYPES.CloseSquareBracket:
            break;
          default: {
            ++cursorPosition;
            const num = consumeWhile(isInteger);
            tokens.push(
              new Token(`${char}${num}`, num.length > 0 ? TOKEN_TYPES.NumericLiteral : TOKEN_TYPES.UnaryOperator)
            );
            continue;
          }
        }
      }
      for (const [char2, token] of ORDERED_MAPPING_TABLE) {
        const slice2 = src.slice(cursorPosition, cursorPosition + char2.length);
        if (slice2 === char2) {
          tokens.push(new Token(char2, token));
          cursorPosition += char2.length;
          continue main;
        }
      }
      if (char === "'" || char === '"') {
        ++cursorPosition;
        const str = consumeWhile((c) => c !== char);
        tokens.push(new Token(str, TOKEN_TYPES.StringLiteral));
        ++cursorPosition;
        continue;
      }
      if (isInteger(char)) {
        const num = consumeWhile(isInteger);
        tokens.push(new Token(num, TOKEN_TYPES.NumericLiteral));
        continue;
      }
      if (isWord(char)) {
        const word = consumeWhile(isWord);
        const type = Object.hasOwn(KEYWORDS, word) ? KEYWORDS[word] : TOKEN_TYPES.Identifier;
        if (type === TOKEN_TYPES.In && tokens.at(-1)?.type === TOKEN_TYPES.Not) {
          tokens.pop();
          tokens.push(new Token("not in", TOKEN_TYPES.NotIn));
        } else {
          tokens.push(new Token(word, type));
        }
        continue;
      }
      throw new SyntaxError(`Unexpected character: ${char}`);
    }
  return tokens;
}

// src/ast.ts
var Statement = class {
  type = "Statement";
};
var Program = class extends Statement {
  constructor(body) {
    super();
    this.body = body;
  }
  type = "Program";
};
var If = class extends Statement {
  constructor(test, body, alternate) {
    super();
    this.test = test;
    this.body = body;
    this.alternate = alternate;
  }
  type = "If";
};
var For = class extends Statement {
  constructor(loopvar, iterable, body, defaultBlock) {
    super();
    this.loopvar = loopvar;
    this.iterable = iterable;
    this.body = body;
    this.defaultBlock = defaultBlock;
  }
  type = "For";
};
var SetStatement = class extends Statement {
  constructor(assignee, value) {
    super();
    this.assignee = assignee;
    this.value = value;
  }
  type = "Set";
};
var Macro = class extends Statement {
  constructor(name, args, body) {
    super();
    this.name = name;
    this.args = args;
    this.body = body;
  }
  type = "Macro";
};
var Expression = class extends Statement {
  type = "Expression";
};
var MemberExpression = class extends Expression {
  constructor(object, property, computed) {
    super();
    this.object = object;
    this.property = property;
    this.computed = computed;
  }
  type = "MemberExpression";
};
var CallExpression = class extends Expression {
  constructor(callee, args) {
    super();
    this.callee = callee;
    this.args = args;
  }
  type = "CallExpression";
};
var Identifier = class extends Expression {
  /**
   * @param {string} value The name of the identifier
   */
  constructor(value) {
    super();
    this.value = value;
  }
  type = "Identifier";
};
var Literal = class extends Expression {
  constructor(value) {
    super();
    this.value = value;
  }
  type = "Literal";
};
var NumericLiteral = class extends Literal {
  type = "NumericLiteral";
};
var StringLiteral = class extends Literal {
  type = "StringLiteral";
};
var BooleanLiteral = class extends Literal {
  type = "BooleanLiteral";
};
var NullLiteral = class extends Literal {
  type = "NullLiteral";
};
var ArrayLiteral = class extends Literal {
  type = "ArrayLiteral";
};
var TupleLiteral = class extends Literal {
  type = "TupleLiteral";
};
var ObjectLiteral = class extends Literal {
  type = "ObjectLiteral";
};
var BinaryExpression = class extends Expression {
  constructor(operator, left, right) {
    super();
    this.operator = operator;
    this.left = left;
    this.right = right;
  }
  type = "BinaryExpression";
};
var FilterExpression = class extends Expression {
  constructor(operand, filter) {
    super();
    this.operand = operand;
    this.filter = filter;
  }
  type = "FilterExpression";
};
var SelectExpression = class extends Expression {
  constructor(iterable, test) {
    super();
    this.iterable = iterable;
    this.test = test;
  }
  type = "SelectExpression";
};
var TestExpression = class extends Expression {
  constructor(operand, negate, test) {
    super();
    this.operand = operand;
    this.negate = negate;
    this.test = test;
  }
  type = "TestExpression";
};
var UnaryExpression = class extends Expression {
  constructor(operator, argument) {
    super();
    this.operator = operator;
    this.argument = argument;
  }
  type = "UnaryExpression";
};
var SliceExpression = class extends Expression {
  constructor(start = void 0, stop = void 0, step = void 0) {
    super();
    this.start = start;
    this.stop = stop;
    this.step = step;
  }
  type = "SliceExpression";
};
var KeywordArgumentExpression = class extends Expression {
  constructor(key, value) {
    super();
    this.key = key;
    this.value = value;
  }
  type = "KeywordArgumentExpression";
};

// src/parser.ts
function parse(tokens) {
  const program = new Program([]);
  let current = 0;
  function expect(type, error) {
    const prev = tokens[current++];
    if (!prev || prev.type !== type) {
      throw new Error(`Parser Error: ${error}. ${prev.type} !== ${type}.`);
    }
    return prev;
  }
  function parseAny() {
    switch (tokens[current].type) {
      case TOKEN_TYPES.Text:
        return parseText();
      case TOKEN_TYPES.OpenStatement:
        return parseJinjaStatement();
      case TOKEN_TYPES.OpenExpression:
        return parseJinjaExpression();
      default:
        throw new SyntaxError(`Unexpected token type: ${tokens[current].type}`);
    }
  }
  function not(...types) {
    return current + types.length <= tokens.length && types.some((type, i) => type !== tokens[current + i].type);
  }
  function is(...types) {
    return current + types.length <= tokens.length && types.every((type, i) => type === tokens[current + i].type);
  }
  function parseText() {
    return new StringLiteral(expect(TOKEN_TYPES.Text, "Expected text token").value);
  }
  function parseJinjaStatement() {
    expect(TOKEN_TYPES.OpenStatement, "Expected opening statement token");
    let result;
    switch (tokens[current].type) {
      case TOKEN_TYPES.Set:
        ++current;
        result = parseSetStatement();
        expect(TOKEN_TYPES.CloseStatement, "Expected closing statement token");
        break;
      case TOKEN_TYPES.If:
        ++current;
        result = parseIfStatement();
        expect(TOKEN_TYPES.OpenStatement, "Expected {% token");
        expect(TOKEN_TYPES.EndIf, "Expected endif token");
        expect(TOKEN_TYPES.CloseStatement, "Expected %} token");
        break;
      case TOKEN_TYPES.Macro:
        ++current;
        result = parseMacroStatement();
        expect(TOKEN_TYPES.OpenStatement, "Expected {% token");
        expect(TOKEN_TYPES.EndMacro, "Expected endmacro token");
        expect(TOKEN_TYPES.CloseStatement, "Expected %} token");
        break;
      case TOKEN_TYPES.For:
        ++current;
        result = parseForStatement();
        expect(TOKEN_TYPES.OpenStatement, "Expected {% token");
        expect(TOKEN_TYPES.EndFor, "Expected endfor token");
        expect(TOKEN_TYPES.CloseStatement, "Expected %} token");
        break;
      default:
        throw new SyntaxError(`Unknown statement type: ${tokens[current].type}`);
    }
    return result;
  }
  function parseJinjaExpression() {
    expect(TOKEN_TYPES.OpenExpression, "Expected opening expression token");
    const result = parseExpression();
    expect(TOKEN_TYPES.CloseExpression, "Expected closing expression token");
    return result;
  }
  function parseSetStatement() {
    const left = parseExpression();
    if (is(TOKEN_TYPES.Equals)) {
      ++current;
      const value = parseSetStatement();
      return new SetStatement(left, value);
    }
    return left;
  }
  function parseIfStatement() {
    const test = parseExpression();
    expect(TOKEN_TYPES.CloseStatement, "Expected closing statement token");
    const body = [];
    const alternate = [];
    while (!(tokens[current]?.type === TOKEN_TYPES.OpenStatement && (tokens[current + 1]?.type === TOKEN_TYPES.ElseIf || tokens[current + 1]?.type === TOKEN_TYPES.Else || tokens[current + 1]?.type === TOKEN_TYPES.EndIf))) {
      body.push(parseAny());
    }
    if (tokens[current]?.type === TOKEN_TYPES.OpenStatement && tokens[current + 1]?.type !== TOKEN_TYPES.EndIf) {
      ++current;
      if (is(TOKEN_TYPES.ElseIf)) {
        expect(TOKEN_TYPES.ElseIf, "Expected elseif token");
        alternate.push(parseIfStatement());
      } else {
        expect(TOKEN_TYPES.Else, "Expected else token");
        expect(TOKEN_TYPES.CloseStatement, "Expected closing statement token");
        while (!(tokens[current]?.type === TOKEN_TYPES.OpenStatement && tokens[current + 1]?.type === TOKEN_TYPES.EndIf)) {
          alternate.push(parseAny());
        }
      }
    }
    return new If(test, body, alternate);
  }
  function parseMacroStatement() {
    const name = parsePrimaryExpression();
    if (name.type !== "Identifier") {
      throw new SyntaxError(`Expected identifier following macro statement`);
    }
    const args = parseArgs();
    expect(TOKEN_TYPES.CloseStatement, "Expected closing statement token");
    const body = [];
    while (not(TOKEN_TYPES.OpenStatement, TOKEN_TYPES.EndMacro)) {
      body.push(parseAny());
    }
    return new Macro(name, args, body);
  }
  function parseExpressionSequence(primary = false) {
    const fn = primary ? parsePrimaryExpression : parseExpression;
    const expressions = [fn()];
    const isTuple = is(TOKEN_TYPES.Comma);
    while (isTuple) {
      ++current;
      expressions.push(fn());
      if (!is(TOKEN_TYPES.Comma)) {
        break;
      }
    }
    return isTuple ? new TupleLiteral(expressions) : expressions[0];
  }
  function parseForStatement() {
    const loopVariable = parseExpressionSequence(true);
    if (!(loopVariable instanceof Identifier || loopVariable instanceof TupleLiteral)) {
      throw new SyntaxError(`Expected identifier/tuple for the loop variable, got ${loopVariable.type} instead`);
    }
    expect(TOKEN_TYPES.In, "Expected `in` keyword following loop variable");
    const iterable = parseExpression();
    expect(TOKEN_TYPES.CloseStatement, "Expected closing statement token");
    const body = [];
    while (not(TOKEN_TYPES.OpenStatement, TOKEN_TYPES.EndFor) && not(TOKEN_TYPES.OpenStatement, TOKEN_TYPES.Else)) {
      body.push(parseAny());
    }
    const alternative = [];
    if (is(TOKEN_TYPES.OpenStatement, TOKEN_TYPES.Else)) {
      ++current;
      ++current;
      expect(TOKEN_TYPES.CloseStatement, "Expected closing statement token");
      while (not(TOKEN_TYPES.OpenStatement, TOKEN_TYPES.EndFor)) {
        alternative.push(parseAny());
      }
    }
    return new For(loopVariable, iterable, body, alternative);
  }
  function parseExpression() {
    return parseIfExpression();
  }
  function parseIfExpression() {
    const a = parseLogicalOrExpression();
    if (is(TOKEN_TYPES.If)) {
      ++current;
      const predicate = parseLogicalOrExpression();
      if (is(TOKEN_TYPES.Else)) {
        ++current;
        const b = parseLogicalOrExpression();
        return new If(predicate, [a], [b]);
      } else {
        return new SelectExpression(a, predicate);
      }
    }
    return a;
  }
  function parseLogicalOrExpression() {
    let left = parseLogicalAndExpression();
    while (is(TOKEN_TYPES.Or)) {
      const operator = tokens[current];
      ++current;
      const right = parseLogicalAndExpression();
      left = new BinaryExpression(operator, left, right);
    }
    return left;
  }
  function parseLogicalAndExpression() {
    let left = parseLogicalNegationExpression();
    while (is(TOKEN_TYPES.And)) {
      const operator = tokens[current];
      ++current;
      const right = parseLogicalNegationExpression();
      left = new BinaryExpression(operator, left, right);
    }
    return left;
  }
  function parseLogicalNegationExpression() {
    let right;
    while (is(TOKEN_TYPES.Not)) {
      const operator = tokens[current];
      ++current;
      const arg = parseLogicalNegationExpression();
      right = new UnaryExpression(operator, arg);
    }
    return right ?? parseComparisonExpression();
  }
  function parseComparisonExpression() {
    let left = parseAdditiveExpression();
    while (is(TOKEN_TYPES.ComparisonBinaryOperator) || is(TOKEN_TYPES.In) || is(TOKEN_TYPES.NotIn)) {
      const operator = tokens[current];
      ++current;
      const right = parseAdditiveExpression();
      left = new BinaryExpression(operator, left, right);
    }
    return left;
  }
  function parseAdditiveExpression() {
    let left = parseMultiplicativeExpression();
    while (is(TOKEN_TYPES.AdditiveBinaryOperator)) {
      const operator = tokens[current];
      ++current;
      const right = parseMultiplicativeExpression();
      left = new BinaryExpression(operator, left, right);
    }
    return left;
  }
  function parseCallMemberExpression() {
    const member = parseMemberExpression();
    if (is(TOKEN_TYPES.OpenParen)) {
      return parseCallExpression(member);
    }
    return member;
  }
  function parseCallExpression(callee) {
    let callExpression = new CallExpression(callee, parseArgs());
    if (is(TOKEN_TYPES.OpenParen)) {
      callExpression = parseCallExpression(callExpression);
    }
    return callExpression;
  }
  function parseArgs() {
    expect(TOKEN_TYPES.OpenParen, "Expected opening parenthesis for arguments list");
    const args = parseArgumentsList();
    expect(TOKEN_TYPES.CloseParen, "Expected closing parenthesis for arguments list");
    return args;
  }
  function parseArgumentsList() {
    const args = [];
    while (!is(TOKEN_TYPES.CloseParen)) {
      let argument = parseExpression();
      if (is(TOKEN_TYPES.Equals)) {
        ++current;
        if (!(argument instanceof Identifier)) {
          throw new SyntaxError(`Expected identifier for keyword argument`);
        }
        const value = parseExpression();
        argument = new KeywordArgumentExpression(argument, value);
      }
      args.push(argument);
      if (is(TOKEN_TYPES.Comma)) {
        ++current;
      }
    }
    return args;
  }
  function parseMemberExpressionArgumentsList() {
    const slices = [];
    let isSlice = false;
    while (!is(TOKEN_TYPES.CloseSquareBracket)) {
      if (is(TOKEN_TYPES.Colon)) {
        slices.push(void 0);
        ++current;
        isSlice = true;
      } else {
        slices.push(parseExpression());
        if (is(TOKEN_TYPES.Colon)) {
          ++current;
          isSlice = true;
        }
      }
    }
    if (slices.length === 0) {
      throw new SyntaxError(`Expected at least one argument for member/slice expression`);
    }
    if (isSlice) {
      if (slices.length > 3) {
        throw new SyntaxError(`Expected 0-3 arguments for slice expression`);
      }
      return new SliceExpression(...slices);
    }
    return slices[0];
  }
  function parseMemberExpression() {
    let object = parsePrimaryExpression();
    while (is(TOKEN_TYPES.Dot) || is(TOKEN_TYPES.OpenSquareBracket)) {
      const operator = tokens[current];
      ++current;
      let property;
      const computed = operator.type !== TOKEN_TYPES.Dot;
      if (computed) {
        property = parseMemberExpressionArgumentsList();
        expect(TOKEN_TYPES.CloseSquareBracket, "Expected closing square bracket");
      } else {
        property = parsePrimaryExpression();
        if (property.type !== "Identifier") {
          throw new SyntaxError(`Expected identifier following dot operator`);
        }
      }
      object = new MemberExpression(object, property, computed);
    }
    return object;
  }
  function parseMultiplicativeExpression() {
    let left = parseTestExpression();
    while (is(TOKEN_TYPES.MultiplicativeBinaryOperator)) {
      const operator = tokens[current];
      ++current;
      const right = parseTestExpression();
      left = new BinaryExpression(operator, left, right);
    }
    return left;
  }
  function parseTestExpression() {
    let operand = parseFilterExpression();
    while (is(TOKEN_TYPES.Is)) {
      ++current;
      const negate = is(TOKEN_TYPES.Not);
      if (negate) {
        ++current;
      }
      let filter = parsePrimaryExpression();
      if (filter instanceof BooleanLiteral) {
        filter = new Identifier(filter.value.toString());
      } else if (filter instanceof NullLiteral) {
        filter = new Identifier("none");
      }
      if (!(filter instanceof Identifier)) {
        throw new SyntaxError(`Expected identifier for the test`);
      }
      operand = new TestExpression(operand, negate, filter);
    }
    return operand;
  }
  function parseFilterExpression() {
    let operand = parseCallMemberExpression();
    while (is(TOKEN_TYPES.Pipe)) {
      ++current;
      let filter = parsePrimaryExpression();
      if (!(filter instanceof Identifier)) {
        throw new SyntaxError(`Expected identifier for the filter`);
      }
      if (is(TOKEN_TYPES.OpenParen)) {
        filter = parseCallExpression(filter);
      }
      operand = new FilterExpression(operand, filter);
    }
    return operand;
  }
  function parsePrimaryExpression() {
    const token = tokens[current];
    switch (token.type) {
      case TOKEN_TYPES.NumericLiteral:
        ++current;
        return new NumericLiteral(Number(token.value));
      case TOKEN_TYPES.StringLiteral:
        ++current;
        return new StringLiteral(token.value);
      case TOKEN_TYPES.BooleanLiteral:
        ++current;
        return new BooleanLiteral(token.value.toLowerCase() === "true");
      case TOKEN_TYPES.NullLiteral:
        ++current;
        return new NullLiteral(null);
      case TOKEN_TYPES.Identifier:
        ++current;
        return new Identifier(token.value);
      case TOKEN_TYPES.OpenParen: {
        ++current;
        const expression = parseExpressionSequence();
        if (tokens[current].type !== TOKEN_TYPES.CloseParen) {
          throw new SyntaxError(`Expected closing parenthesis, got ${tokens[current].type} instead`);
        }
        ++current;
        return expression;
      }
      case TOKEN_TYPES.OpenSquareBracket: {
        ++current;
        const values = [];
        while (!is(TOKEN_TYPES.CloseSquareBracket)) {
          values.push(parseExpression());
          if (is(TOKEN_TYPES.Comma)) {
            ++current;
          }
        }
        ++current;
        return new ArrayLiteral(values);
      }
      case TOKEN_TYPES.OpenCurlyBracket: {
        ++current;
        const values = /* @__PURE__ */ new Map();
        while (!is(TOKEN_TYPES.CloseCurlyBracket)) {
          const key = parseExpression();
          expect(TOKEN_TYPES.Colon, "Expected colon between key and value in object literal");
          const value = parseExpression();
          values.set(key, value);
          if (is(TOKEN_TYPES.Comma)) {
            ++current;
          }
        }
        ++current;
        return new ObjectLiteral(values);
      }
      default:
        throw new SyntaxError(`Unexpected token: ${token.type}`);
    }
  }
  while (current < tokens.length) {
    program.body.push(parseAny());
  }
  return program;
}

// src/utils.ts
function range(start, stop, step = 1) {
  if (stop === void 0) {
    stop = start;
    start = 0;
  }
  const result = [];
  for (let i = start; i < stop; i += step) {
    result.push(i);
  }
  return result;
}
function slice(array, start, stop, step = 1) {
  const direction = Math.sign(step);
  if (direction >= 0) {
    start = (start ??= 0) < 0 ? Math.max(array.length + start, 0) : Math.min(start, array.length);
    stop = (stop ??= array.length) < 0 ? Math.max(array.length + stop, 0) : Math.min(stop, array.length);
  } else {
    start = (start ??= array.length - 1) < 0 ? Math.max(array.length + start, -1) : Math.min(start, array.length - 1);
    stop = (stop ??= -1) < -1 ? Math.max(array.length + stop, -1) : Math.min(stop, array.length - 1);
  }
  const result = [];
  for (let i = start; direction * i < direction * stop; i += step) {
    result.push(array[i]);
  }
  return result;
}
function titleCase(value) {
  return value.replace(/\b\w/g, (c) => c.toUpperCase());
}

// src/runtime.ts
var RuntimeValue = class {
  type = "RuntimeValue";
  value;
  /**
   * A collection of built-in functions for this type.
   */
  builtins = /* @__PURE__ */ new Map();
  /**
   * Creates a new RuntimeValue.
   */
  constructor(value = void 0) {
    this.value = value;
  }
  /**
   * Determines truthiness or falsiness of the runtime value.
   * This function should be overridden by subclasses if it has custom truthiness criteria.
   * @returns {BooleanValue} BooleanValue(true) if the value is truthy, BooleanValue(false) otherwise.
   */
  __bool__() {
    return new BooleanValue(!!this.value);
  }
};
var NumericValue = class extends RuntimeValue {
  type = "NumericValue";
};
var StringValue = class extends RuntimeValue {
  type = "StringValue";
  builtins = /* @__PURE__ */ new Map([
    [
      "upper",
      new FunctionValue(() => {
        return new StringValue(this.value.toUpperCase());
      })
    ],
    [
      "lower",
      new FunctionValue(() => {
        return new StringValue(this.value.toLowerCase());
      })
    ],
    [
      "strip",
      new FunctionValue(() => {
        return new StringValue(this.value.trim());
      })
    ],
    [
      "title",
      new FunctionValue(() => {
        return new StringValue(titleCase(this.value));
      })
    ],
    ["length", new NumericValue(this.value.length)],
    [
      "rstrip",
      new FunctionValue(() => {
        return new StringValue(this.value.trimEnd());
      })
    ],
    [
      "lstrip",
      new FunctionValue(() => {
        return new StringValue(this.value.trimStart());
      })
    ]
  ]);
};
var BooleanValue = class extends RuntimeValue {
  type = "BooleanValue";
};
var ObjectValue = class extends RuntimeValue {
  type = "ObjectValue";
  /**
   * NOTE: necessary to override since all JavaScript arrays are considered truthy,
   * while only non-empty Python arrays are consider truthy.
   *
   * e.g.,
   *  - JavaScript:  {} && 5 -> 5
   *  - Python:      {} and 5 -> {}
   */
  __bool__() {
    return new BooleanValue(this.value.size > 0);
  }
  builtins = /* @__PURE__ */ new Map([
    [
      "get",
      new FunctionValue(([key, defaultValue]) => {
        if (!(key instanceof StringValue)) {
          throw new Error(`Object key must be a string: got ${key.type}`);
        }
        return this.value.get(key.value) ?? defaultValue ?? new NullValue();
      })
    ],
    [
      "items",
      new FunctionValue(() => {
        return new ArrayValue(
          Array.from(this.value.entries()).map(([key, value]) => new ArrayValue([new StringValue(key), value]))
        );
      })
    ]
  ]);
};
var KeywordArgumentsValue = class extends ObjectValue {
  type = "KeywordArgumentsValue";
};
var ArrayValue = class extends RuntimeValue {
  type = "ArrayValue";
  builtins = /* @__PURE__ */ new Map([["length", new NumericValue(this.value.length)]]);
  /**
   * NOTE: necessary to override since all JavaScript arrays are considered truthy,
   * while only non-empty Python arrays are consider truthy.
   *
   * e.g.,
   *  - JavaScript:  [] && 5 -> 5
   *  - Python:      [] and 5 -> []
   */
  __bool__() {
    return new BooleanValue(this.value.length > 0);
  }
};
var TupleValue = class extends ArrayValue {
  type = "TupleValue";
};
var FunctionValue = class extends RuntimeValue {
  type = "FunctionValue";
};
var NullValue = class extends RuntimeValue {
  type = "NullValue";
};
var UndefinedValue = class extends RuntimeValue {
  type = "UndefinedValue";
};
var Environment = class {
  constructor(parent) {
    this.parent = parent;
  }
  /**
   * The variables declared in this environment.
   */
  variables = /* @__PURE__ */ new Map([
    [
      "namespace",
      new FunctionValue((args) => {
        if (args.length === 0) {
          return new ObjectValue(/* @__PURE__ */ new Map());
        }
        if (args.length !== 1 || !(args[0] instanceof ObjectValue)) {
          throw new Error("`namespace` expects either zero arguments or a single object argument");
        }
        return args[0];
      })
    ]
  ]);
  /**
   * The tests available in this environment.
   */
  tests = /* @__PURE__ */ new Map([
    ["boolean", (operand) => operand.type === "BooleanValue"],
    ["callable", (operand) => operand instanceof FunctionValue],
    [
      "odd",
      (operand) => {
        if (operand.type !== "NumericValue") {
          throw new Error(`Cannot apply test "odd" to type: ${operand.type}`);
        }
        return operand.value % 2 !== 0;
      }
    ],
    [
      "even",
      (operand) => {
        if (operand.type !== "NumericValue") {
          throw new Error(`Cannot apply test "even" to type: ${operand.type}`);
        }
        return operand.value % 2 === 0;
      }
    ],
    ["false", (operand) => operand.type === "BooleanValue" && !operand.value],
    ["true", (operand) => operand.type === "BooleanValue" && operand.value],
    ["none", (operand) => operand.type === "NullValue"],
    ["string", (operand) => operand.type === "StringValue"],
    ["number", (operand) => operand.type === "NumericValue"],
    ["integer", (operand) => operand.type === "NumericValue" && Number.isInteger(operand.value)],
    ["iterable", (operand) => operand instanceof ArrayValue || operand instanceof StringValue],
    [
      "lower",
      (operand) => {
        const str = operand.value;
        return operand.type === "StringValue" && str === str.toLowerCase();
      }
    ],
    [
      "upper",
      (operand) => {
        const str = operand.value;
        return operand.type === "StringValue" && str === str.toUpperCase();
      }
    ],
    ["none", (operand) => operand.type === "NullValue"],
    ["defined", (operand) => operand.type !== "UndefinedValue"],
    ["undefined", (operand) => operand.type === "UndefinedValue"],
    ["equalto", (a, b) => a.value === b.value],
    ["eq", (a, b) => a.value === b.value]
  ]);
  /**
   * Set the value of a variable in the current environment.
   */
  set(name, value) {
    return this.declareVariable(name, convertToRuntimeValues(value));
  }
  declareVariable(name, value) {
    if (this.variables.has(name)) {
      throw new SyntaxError(`Variable already declared: ${name}`);
    }
    this.variables.set(name, value);
    return value;
  }
  // private assignVariable(name: string, value: AnyRuntimeValue): AnyRuntimeValue {
  // 	const env = this.resolve(name);
  // 	env.variables.set(name, value);
  // 	return value;
  // }
  /**
   * Set variable in the current scope.
   * See https://jinja.palletsprojects.com/en/3.0.x/templates/#assignments for more information.
   */
  setVariable(name, value) {
    this.variables.set(name, value);
    return value;
  }
  /**
   * Resolve the environment in which the variable is declared.
   * @param {string} name The name of the variable.
   * @returns {Environment} The environment in which the variable is declared.
   */
  resolve(name) {
    if (this.variables.has(name)) {
      return this;
    }
    if (this.parent) {
      return this.parent.resolve(name);
    }
    throw new Error(`Unknown variable: ${name}`);
  }
  lookupVariable(name) {
    try {
      return this.resolve(name).variables.get(name) ?? new UndefinedValue();
    } catch {
      return new UndefinedValue();
    }
  }
};
var Interpreter = class {
  global;
  constructor(env) {
    this.global = env ?? new Environment();
  }
  /**
   * Run the program.
   */
  run(program) {
    return this.evaluate(program, this.global);
  }
  /**
   * Evaluates expressions following the binary operation type.
   */
  evaluateBinaryExpression(node, environment) {
    const left = this.evaluate(node.left, environment);
    switch (node.operator.value) {
      case "and":
        return left.__bool__().value ? this.evaluate(node.right, environment) : left;
      case "or":
        return left.__bool__().value ? left : this.evaluate(node.right, environment);
    }
    const right = this.evaluate(node.right, environment);
    switch (node.operator.value) {
      case "==":
        return new BooleanValue(left.value == right.value);
      case "!=":
        return new BooleanValue(left.value != right.value);
    }
    if (left instanceof UndefinedValue || right instanceof UndefinedValue) {
      throw new Error("Cannot perform operation on undefined values");
    } else if (left instanceof NullValue || right instanceof NullValue) {
      throw new Error("Cannot perform operation on null values");
    } else if (left instanceof NumericValue && right instanceof NumericValue) {
      switch (node.operator.value) {
        case "+":
          return new NumericValue(left.value + right.value);
        case "-":
          return new NumericValue(left.value - right.value);
        case "*":
          return new NumericValue(left.value * right.value);
        case "/":
          return new NumericValue(left.value / right.value);
        case "%":
          return new NumericValue(left.value % right.value);
        case "<":
          return new BooleanValue(left.value < right.value);
        case ">":
          return new BooleanValue(left.value > right.value);
        case ">=":
          return new BooleanValue(left.value >= right.value);
        case "<=":
          return new BooleanValue(left.value <= right.value);
      }
    } else if (left instanceof ArrayValue && right instanceof ArrayValue) {
      switch (node.operator.value) {
        case "+":
          return new ArrayValue(left.value.concat(right.value));
      }
    } else if (right instanceof ArrayValue) {
      const member = right.value.find((x) => x.value === left.value) !== void 0;
      switch (node.operator.value) {
        case "in":
          return new BooleanValue(member);
        case "not in":
          return new BooleanValue(!member);
      }
    }
    if (left instanceof StringValue || right instanceof StringValue) {
      switch (node.operator.value) {
        case "+":
          return new StringValue(left.value.toString() + right.value.toString());
      }
    }
    if (left instanceof StringValue && right instanceof StringValue) {
      switch (node.operator.value) {
        case "in":
          return new BooleanValue(right.value.includes(left.value));
        case "not in":
          return new BooleanValue(!right.value.includes(left.value));
      }
    }
    if (left instanceof StringValue && right instanceof ObjectValue) {
      switch (node.operator.value) {
        case "in":
          return new BooleanValue(right.value.has(left.value));
        case "not in":
          return new BooleanValue(!right.value.has(left.value));
      }
    }
    throw new SyntaxError(`Unknown operator "${node.operator.value}" between ${left.type} and ${right.type}`);
  }
  evaluateArguments(args, environment) {
    const positionalArguments = [];
    const keywordArguments = /* @__PURE__ */ new Map();
    for (const argument of args) {
      if (argument.type === "KeywordArgumentExpression") {
        const kwarg = argument;
        keywordArguments.set(kwarg.key.value, this.evaluate(kwarg.value, environment));
      } else {
        if (keywordArguments.size > 0) {
          throw new Error("Positional arguments must come before keyword arguments");
        }
        positionalArguments.push(this.evaluate(argument, environment));
      }
    }
    return [positionalArguments, keywordArguments];
  }
  /**
   * Evaluates expressions following the filter operation type.
   */
  evaluateFilterExpression(node, environment) {
    const operand = this.evaluate(node.operand, environment);
    if (node.filter.type === "Identifier") {
      const filter = node.filter;
      if (filter.value === "tojson") {
        return new StringValue(toJSON(operand));
      }
      if (operand instanceof ArrayValue) {
        switch (filter.value) {
          case "list":
            return operand;
          case "first":
            return operand.value[0];
          case "last":
            return operand.value[operand.value.length - 1];
          case "length":
            return new NumericValue(operand.value.length);
          case "reverse":
            return new ArrayValue(operand.value.reverse());
          case "sort":
            return new ArrayValue(
              operand.value.sort((a, b) => {
                if (a.type !== b.type) {
                  throw new Error(`Cannot compare different types: ${a.type} and ${b.type}`);
                }
                switch (a.type) {
                  case "NumericValue":
                    return a.value - b.value;
                  case "StringValue":
                    return a.value.localeCompare(b.value);
                  default:
                    throw new Error(`Cannot compare type: ${a.type}`);
                }
              })
            );
          default:
            throw new Error(`Unknown ArrayValue filter: ${filter.value}`);
        }
      } else if (operand instanceof StringValue) {
        switch (filter.value) {
          case "length":
            return new NumericValue(operand.value.length);
          case "upper":
            return new StringValue(operand.value.toUpperCase());
          case "lower":
            return new StringValue(operand.value.toLowerCase());
          case "title":
            return new StringValue(titleCase(operand.value));
          case "capitalize":
            return new StringValue(operand.value.charAt(0).toUpperCase() + operand.value.slice(1));
          case "trim":
            return new StringValue(operand.value.trim());
          case "indent":
            return new StringValue(
              operand.value.split("\n").map(
                (x, i) => (
                  // By default, don't indent the first line or empty lines
                  i === 0 || x.length === 0 ? x : "    " + x
                )
              ).join("\n")
            );
          case "string":
            return operand;
          default:
            throw new Error(`Unknown StringValue filter: ${filter.value}`);
        }
      } else if (operand instanceof NumericValue) {
        switch (filter.value) {
          case "abs":
            return new NumericValue(Math.abs(operand.value));
          default:
            throw new Error(`Unknown NumericValue filter: ${filter.value}`);
        }
      } else if (operand instanceof ObjectValue) {
        switch (filter.value) {
          case "items":
            return new ArrayValue(
              Array.from(operand.value.entries()).map(([key, value]) => new ArrayValue([new StringValue(key), value]))
            );
          case "length":
            return new NumericValue(operand.value.size);
          default:
            throw new Error(`Unknown ObjectValue filter: ${filter.value}`);
        }
      }
      throw new Error(`Cannot apply filter "${filter.value}" to type: ${operand.type}`);
    } else if (node.filter.type === "CallExpression") {
      const filter = node.filter;
      if (filter.callee.type !== "Identifier") {
        throw new Error(`Unknown filter: ${filter.callee.type}`);
      }
      const filterName = filter.callee.value;
      if (filterName === "tojson") {
        const [, kwargs] = this.evaluateArguments(filter.args, environment);
        const indent = kwargs.get("indent") ?? new NullValue();
        if (!(indent instanceof NumericValue || indent instanceof NullValue)) {
          throw new Error("If set, indent must be a number");
        }
        return new StringValue(toJSON(operand, indent.value));
      }
      if (operand instanceof ArrayValue) {
        switch (filterName) {
          case "selectattr": {
            if (operand.value.some((x) => !(x instanceof ObjectValue))) {
              throw new Error("`selectattr` can only be applied to array of objects");
            }
            if (filter.args.some((x) => x.type !== "StringLiteral")) {
              throw new Error("arguments of `selectattr` must be strings");
            }
            const [attr, testName, value] = filter.args.map((x) => this.evaluate(x, environment));
            let testFunction;
            if (testName) {
              const test = environment.tests.get(testName.value);
              if (!test) {
                throw new Error(`Unknown test: ${testName.value}`);
              }
              testFunction = test;
            } else {
              testFunction = (...x) => x[0].__bool__().value;
            }
            const filtered = operand.value.filter((item) => {
              const a = item.value.get(attr.value);
              if (a) {
                return testFunction(a, value);
              }
              return false;
            });
            return new ArrayValue(filtered);
          }
          case "map": {
            const [, kwargs] = this.evaluateArguments(filter.args, environment);
            if (kwargs.has("attribute")) {
              const attr = kwargs.get("attribute");
              if (!(attr instanceof StringValue)) {
                throw new Error("attribute must be a string");
              }
              const defaultValue = kwargs.get("default");
              const mapped = operand.value.map((item) => {
                if (!(item instanceof ObjectValue)) {
                  throw new Error("items in map must be an object");
                }
                return item.value.get(attr.value) ?? defaultValue ?? new UndefinedValue();
              });
              return new ArrayValue(mapped);
            } else {
              throw new Error("`map` expressions without `attribute` set are not currently supported.");
            }
          }
        }
        throw new Error(`Unknown ArrayValue filter: ${filterName}`);
      } else if (operand instanceof StringValue) {
        switch (filterName) {
          case "indent": {
            const [args, kwargs] = this.evaluateArguments(filter.args, environment);
            const width = args.at(0) ?? kwargs.get("width") ?? new NumericValue(4);
            if (!(width instanceof NumericValue)) {
              throw new Error("width must be a number");
            }
            const first = args.at(1) ?? kwargs.get("first") ?? new BooleanValue(false);
            const blank = args.at(2) ?? kwargs.get("blank") ?? new BooleanValue(false);
            const lines = operand.value.split("\n");
            const indent = " ".repeat(width.value);
            const indented = lines.map(
              (x, i) => !first.value && i === 0 || !blank.value && x.length === 0 ? x : indent + x
            );
            return new StringValue(indented.join("\n"));
          }
        }
        throw new Error(`Unknown StringValue filter: ${filterName}`);
      } else {
        throw new Error(`Cannot apply filter "${filterName}" to type: ${operand.type}`);
      }
    }
    throw new Error(`Unknown filter: ${node.filter.type}`);
  }
  /**
   * Evaluates expressions following the test operation type.
   */
  evaluateTestExpression(node, environment) {
    const operand = this.evaluate(node.operand, environment);
    const test = environment.tests.get(node.test.value);
    if (!test) {
      throw new Error(`Unknown test: ${node.test.value}`);
    }
    const result = test(operand);
    return new BooleanValue(node.negate ? !result : result);
  }
  /**
   * Evaluates expressions following the unary operation type.
   */
  evaluateUnaryExpression(node, environment) {
    const argument = this.evaluate(node.argument, environment);
    switch (node.operator.value) {
      case "not":
        return new BooleanValue(!argument.value);
      default:
        throw new SyntaxError(`Unknown operator: ${node.operator.value}`);
    }
  }
  evalProgram(program, environment) {
    return this.evaluateBlock(program.body, environment);
  }
  evaluateBlock(statements, environment) {
    let result = "";
    for (const statement of statements) {
      const lastEvaluated = this.evaluate(statement, environment);
      if (lastEvaluated.type !== "NullValue" && lastEvaluated.type !== "UndefinedValue") {
        result += lastEvaluated.value;
      }
    }
    return new StringValue(result);
  }
  evaluateIdentifier(node, environment) {
    return environment.lookupVariable(node.value);
  }
  evaluateCallExpression(expr, environment) {
    const [args, kwargs] = this.evaluateArguments(expr.args, environment);
    if (kwargs.size > 0) {
      args.push(new KeywordArgumentsValue(kwargs));
    }
    const fn = this.evaluate(expr.callee, environment);
    if (fn.type !== "FunctionValue") {
      throw new Error(`Cannot call something that is not a function: got ${fn.type}`);
    }
    return fn.value(args, environment);
  }
  evaluateSliceExpression(object, expr, environment) {
    if (!(object instanceof ArrayValue || object instanceof StringValue)) {
      throw new Error("Slice object must be an array or string");
    }
    const start = this.evaluate(expr.start, environment);
    const stop = this.evaluate(expr.stop, environment);
    const step = this.evaluate(expr.step, environment);
    if (!(start instanceof NumericValue || start instanceof UndefinedValue)) {
      throw new Error("Slice start must be numeric or undefined");
    }
    if (!(stop instanceof NumericValue || stop instanceof UndefinedValue)) {
      throw new Error("Slice stop must be numeric or undefined");
    }
    if (!(step instanceof NumericValue || step instanceof UndefinedValue)) {
      throw new Error("Slice step must be numeric or undefined");
    }
    if (object instanceof ArrayValue) {
      return new ArrayValue(slice(object.value, start.value, stop.value, step.value));
    } else {
      return new StringValue(slice(Array.from(object.value), start.value, stop.value, step.value).join(""));
    }
  }
  evaluateMemberExpression(expr, environment) {
    const object = this.evaluate(expr.object, environment);
    let property;
    if (expr.computed) {
      if (expr.property.type === "SliceExpression") {
        return this.evaluateSliceExpression(object, expr.property, environment);
      } else {
        property = this.evaluate(expr.property, environment);
      }
    } else {
      property = new StringValue(expr.property.value);
    }
    let value;
    if (object instanceof ObjectValue) {
      if (!(property instanceof StringValue)) {
        throw new Error(`Cannot access property with non-string: got ${property.type}`);
      }
      value = object.value.get(property.value) ?? object.builtins.get(property.value);
    } else if (object instanceof ArrayValue || object instanceof StringValue) {
      if (property instanceof NumericValue) {
        value = object.value.at(property.value);
        if (object instanceof StringValue) {
          value = new StringValue(object.value.at(property.value));
        }
      } else if (property instanceof StringValue) {
        value = object.builtins.get(property.value);
      } else {
        throw new Error(`Cannot access property with non-string/non-number: got ${property.type}`);
      }
    } else {
      if (!(property instanceof StringValue)) {
        throw new Error(`Cannot access property with non-string: got ${property.type}`);
      }
      value = object.builtins.get(property.value);
    }
    return value instanceof RuntimeValue ? value : new UndefinedValue();
  }
  evaluateSet(node, environment) {
    const rhs = this.evaluate(node.value, environment);
    if (node.assignee.type === "Identifier") {
      const variableName = node.assignee.value;
      environment.setVariable(variableName, rhs);
    } else if (node.assignee.type === "MemberExpression") {
      const member = node.assignee;
      const object = this.evaluate(member.object, environment);
      if (!(object instanceof ObjectValue)) {
        throw new Error("Cannot assign to member of non-object");
      }
      if (member.property.type !== "Identifier") {
        throw new Error("Cannot assign to member with non-identifier property");
      }
      object.value.set(member.property.value, rhs);
    } else {
      throw new Error(`Invalid LHS inside assignment expression: ${JSON.stringify(node.assignee)}`);
    }
    return new NullValue();
  }
  evaluateIf(node, environment) {
    const test = this.evaluate(node.test, environment);
    return this.evaluateBlock(test.__bool__().value ? node.body : node.alternate, environment);
  }
  evaluateFor(node, environment) {
    const scope = new Environment(environment);
    let test, iterable;
    if (node.iterable.type === "SelectExpression") {
      const select = node.iterable;
      iterable = this.evaluate(select.iterable, scope);
      test = select.test;
    } else {
      iterable = this.evaluate(node.iterable, scope);
    }
    if (!(iterable instanceof ArrayValue)) {
      throw new Error(`Expected iterable type in for loop: got ${iterable.type}`);
    }
    const items = [];
    const scopeUpdateFunctions = [];
    for (let i = 0; i < iterable.value.length; ++i) {
      const loopScope = new Environment(scope);
      const current = iterable.value[i];
      let scopeUpdateFunction;
      if (node.loopvar.type === "Identifier") {
        scopeUpdateFunction = (scope2) => scope2.setVariable(node.loopvar.value, current);
      } else if (node.loopvar.type === "TupleLiteral") {
        const loopvar = node.loopvar;
        if (current.type !== "ArrayValue") {
          throw new Error(`Cannot unpack non-iterable type: ${current.type}`);
        }
        const c = current;
        if (loopvar.value.length !== c.value.length) {
          throw new Error(`Too ${loopvar.value.length > c.value.length ? "few" : "many"} items to unpack`);
        }
        scopeUpdateFunction = (scope2) => {
          for (let j = 0; j < loopvar.value.length; ++j) {
            if (loopvar.value[j].type !== "Identifier") {
              throw new Error(`Cannot unpack non-identifier type: ${loopvar.value[j].type}`);
            }
            scope2.setVariable(loopvar.value[j].value, c.value[j]);
          }
        };
      } else {
        throw new Error(`Invalid loop variable(s): ${node.loopvar.type}`);
      }
      if (test) {
        scopeUpdateFunction(loopScope);
        const testValue = this.evaluate(test, loopScope);
        if (!testValue.__bool__().value) {
          continue;
        }
      }
      items.push(current);
      scopeUpdateFunctions.push(scopeUpdateFunction);
    }
    let result = "";
    let noIteration = true;
    for (let i = 0; i < items.length; ++i) {
      const loop = /* @__PURE__ */ new Map([
        ["index", new NumericValue(i + 1)],
        ["index0", new NumericValue(i)],
        ["revindex", new NumericValue(items.length - i)],
        ["revindex0", new NumericValue(items.length - i - 1)],
        ["first", new BooleanValue(i === 0)],
        ["last", new BooleanValue(i === items.length - 1)],
        ["length", new NumericValue(items.length)],
        ["previtem", i > 0 ? items[i - 1] : new UndefinedValue()],
        ["nextitem", i < items.length - 1 ? items[i + 1] : new UndefinedValue()]
      ]);
      scope.setVariable("loop", new ObjectValue(loop));
      scopeUpdateFunctions[i](scope);
      const evaluated = this.evaluateBlock(node.body, scope);
      result += evaluated.value;
      noIteration = false;
    }
    if (noIteration) {
      const defaultEvaluated = this.evaluateBlock(node.defaultBlock, scope);
      result += defaultEvaluated.value;
    }
    return new StringValue(result);
  }
  /**
   * See https://jinja.palletsprojects.com/en/3.1.x/templates/#macros for more information.
   */
  evaluateMacro(node, environment) {
    environment.setVariable(
      node.name.value,
      new FunctionValue((args, scope) => {
        const macroScope = new Environment(scope);
        args = args.slice();
        let kwargs;
        if (args.at(-1)?.type === "KeywordArgumentsValue") {
          kwargs = args.pop();
        }
        for (let i = 0; i < node.args.length; ++i) {
          const nodeArg = node.args[i];
          const passedArg = args[i];
          if (nodeArg.type === "Identifier") {
            const identifier = nodeArg;
            if (!passedArg) {
              throw new Error(`Missing positional argument: ${identifier.value}`);
            }
            macroScope.setVariable(identifier.value, passedArg);
          } else if (nodeArg.type === "KeywordArgumentExpression") {
            const kwarg = nodeArg;
            const value = passedArg ?? // Try positional arguments first
            kwargs?.value.get(kwarg.key.value) ?? // Look in user-passed kwargs
            this.evaluate(kwarg.value, macroScope);
            macroScope.setVariable(kwarg.key.value, value);
          } else {
            throw new Error(`Unknown argument type: ${nodeArg.type}`);
          }
        }
        return this.evaluateBlock(node.body, macroScope);
      })
    );
    return new NullValue();
  }
  evaluate(statement, environment) {
    if (statement === void 0)
      return new UndefinedValue();
    switch (statement.type) {
      case "Program":
        return this.evalProgram(statement, environment);
      case "Set":
        return this.evaluateSet(statement, environment);
      case "If":
        return this.evaluateIf(statement, environment);
      case "For":
        return this.evaluateFor(statement, environment);
      case "Macro":
        return this.evaluateMacro(statement, environment);
      case "NumericLiteral":
        return new NumericValue(Number(statement.value));
      case "StringLiteral":
        return new StringValue(statement.value);
      case "BooleanLiteral":
        return new BooleanValue(statement.value);
      case "NullLiteral":
        return new NullValue(statement.value);
      case "ArrayLiteral":
        return new ArrayValue(statement.value.map((x) => this.evaluate(x, environment)));
      case "TupleLiteral":
        return new TupleValue(statement.value.map((x) => this.evaluate(x, environment)));
      case "ObjectLiteral": {
        const mapping = /* @__PURE__ */ new Map();
        for (const [key, value] of statement.value) {
          const evaluatedKey = this.evaluate(key, environment);
          if (!(evaluatedKey instanceof StringValue)) {
            throw new Error(`Object keys must be strings: got ${evaluatedKey.type}`);
          }
          mapping.set(evaluatedKey.value, this.evaluate(value, environment));
        }
        return new ObjectValue(mapping);
      }
      case "Identifier":
        return this.evaluateIdentifier(statement, environment);
      case "CallExpression":
        return this.evaluateCallExpression(statement, environment);
      case "MemberExpression":
        return this.evaluateMemberExpression(statement, environment);
      case "UnaryExpression":
        return this.evaluateUnaryExpression(statement, environment);
      case "BinaryExpression":
        return this.evaluateBinaryExpression(statement, environment);
      case "FilterExpression":
        return this.evaluateFilterExpression(statement, environment);
      case "TestExpression":
        return this.evaluateTestExpression(statement, environment);
      default:
        throw new SyntaxError(`Unknown node type: ${statement.type}`);
    }
  }
};
function convertToRuntimeValues(input) {
  switch (typeof input) {
    case "number":
      return new NumericValue(input);
    case "string":
      return new StringValue(input);
    case "boolean":
      return new BooleanValue(input);
    case "undefined":
      return new UndefinedValue();
    case "object":
      if (input === null) {
        return new NullValue();
      } else if (Array.isArray(input)) {
        return new ArrayValue(input.map(convertToRuntimeValues));
      } else {
        return new ObjectValue(
          new Map(Object.entries(input).map(([key, value]) => [key, convertToRuntimeValues(value)]))
        );
      }
    case "function":
      return new FunctionValue((args, _scope) => {
        const result = input(...args.map((x) => x.value)) ?? null;
        return convertToRuntimeValues(result);
      });
    default:
      throw new Error(`Cannot convert to runtime value: ${input}`);
  }
}
function toJSON(input, indent, depth) {
  const currentDepth = depth ?? 0;
  switch (input.type) {
    case "NullValue":
    case "UndefinedValue":
      return "null";
    case "NumericValue":
    case "StringValue":
    case "BooleanValue":
      return JSON.stringify(input.value);
    case "ArrayValue":
    case "ObjectValue": {
      const indentValue = indent ? " ".repeat(indent) : "";
      const basePadding = "\n" + indentValue.repeat(currentDepth);
      const childrenPadding = basePadding + indentValue;
      if (input.type === "ArrayValue") {
        const core = input.value.map((x) => toJSON(x, indent, currentDepth + 1));
        return indent ? `[${childrenPadding}${core.join(`,${childrenPadding}`)}${basePadding}]` : `[${core.join(", ")}]`;
      } else {
        const core = Array.from(input.value.entries()).map(([key, value]) => {
          const v = `"${key}": ${toJSON(value, indent, currentDepth + 1)}`;
          return indent ? `${childrenPadding}${v}` : v;
        });
        return indent ? `{${core.join(",")}${basePadding}}` : `{${core.join(", ")}}`;
      }
    }
    default:
      throw new Error(`Cannot convert to JSON: ${input.type}`);
  }
}

// src/index.ts
var Template = class {
  parsed;
  /**
   * @param {string} template The template string
   */
  constructor(template) {
    const tokens = tokenize(template, {
      lstrip_blocks: true,
      trim_blocks: true
    });
    this.parsed = parse(tokens);
  }
  render(items) {
    const env = new Environment();
    env.set("false", false);
    env.set("true", true);
    env.set("raise_exception", (args) => {
      throw new Error(args);
    });
    env.set("range", range);
    for (const [key, value] of Object.entries(items)) {
      env.set(key, value);
    }
    const interpreter = new Interpreter(env);
    const result = interpreter.run(this.parsed);
    return result.value;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Environment,
  Interpreter,
  Template,
  parse,
  tokenize
});
