/**
 * Tokenizer spec.
 */
const Spec = [
    // -------------
    // Numbers:
    [/^\d+/, "NUMBER"],

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
