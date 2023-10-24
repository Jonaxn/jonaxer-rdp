/**
 * Tokenizer spec.
 */
const Spec = [
    // -------------
    // Whitespace:
    [/^\s+/, null],

    // -------------
    // Comments:
    // Skip sing-line comments:
    [/^\/\/.*/, null],
    // Skip multi-line
    [/^\/\*[\s\S]*?\*\//, null],

    // -------------
    // Symbols, delimiters
    [/^;/, ";"],
    [/^\{/, "{"],
    [/^\}/, "}"],
    [/^\(/, "("],
    [/^\)/, ")"],
    [/^,/, ","],
    [/^\./, "."],
    [/^\[/, "["],
    [/^\]/, "]"],

    // -------------
    // keywords:
    [/^\blet\b/, "let"],
    [/^\bif\b/, "if"],
    [/^\belse\b/, "else"],
    [/^\btrue\b/, "true"],
    [/^\bfalse\b/, "false"],
    [/^\bnull\b/, "null"],
    [/^\bwhile\b/, "while"],
    [/^\bdo\b/, "do"],
    [/^\bfor\b/, "for"],
    [/^\breturn\b/, "return"],
    [/^\bdef\b/, "def"],

    // -------------
    // Numbers:
    [/^\d+/, "NUMBER"],

    // -------------
    // Identifiers:
    [/^\w+/, "IDENTIFIER"],

    // -------------
    // Equlity operators: ==, !=
    [/^[=!]=/, "EQUALITY_OPERATOR"],

    // --------------
    // Assignment operators: =, +=, -=, *=, /=
    [/^=/, "SIMPLE_ASSIGN"],
    [/^[\*\/\-\+]=/, "COMPLEX_ASSIGN"],

    //--------------
    // Math Operators: +, 1, *, /
    [/^[+\-]/, "ADDITIVE_OPERATOR"],
    [/^[*\/]/, "MULTIPLICATIVE_OPERATOR"],

    //--------------
    // Relational Operators: >, <, >=, <=
    [/^[><]=?/, "RELATIONAL_OPERATOR"],

    // --------------
    // Logical Operators: &&, ||
    [/^&&/, "LOGICAL_AND"],
    [/^\|\|/, "LOGICAL_OR"],
    [/^!/, "LOGICAL_NOT"],

    // -------------
    // Strings:
    [/^"[^"]*"/, "STRING"],
    [/^'[^']*'/, "STRING"],
]

/**
 * Tokenizer class
 * Lazily pulls a token from a stream
 */
class Tokenizer {
    /**
     * Initializes the string
     */
    init(string) {
        this._string = string
        this._cursor = 0
    }
    /**
     * Whether he tokenizer reached EOF
     */
    isEOF() {
        return this._cursor === this._string.length
    }

    /**
     * whether we still have more tokens
     */
    hasMoreTokens() {
        return this._cursor < this._string.length
    }

    /**
     * Obtains next token
     */
    getNextToken() {
        if (!this.hasMoreTokens()) {
            return null
        }
        let string = this._string.slice(this._cursor)
        for (const [regexp, tokenType] of Spec) {
            const tokenValue = this._match(regexp, string)

            // Cant' match this rule, coutinue.
            if (tokenValue == null) {
                continue
            }

            // Should skip token, e. g. whitespace
            if (tokenType == null) {
                return this.getNextToken()
            }

            return {
                type: tokenType,
                value: tokenValue,
            }
        }

        throw new SyntaxError(`Unexpected token: "${string[0]}"`)
    }

    _match(regexp, string) {
        let matched = regexp.exec(string)
        if (matched == null) {
            return null
        }

        this._cursor += matched[0].length
        return matched[0]
    }
}

module.exports = {
    Tokenizer,
}
