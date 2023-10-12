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

        // Numbers: \d+
        let matched = /^\d+/.exec(string)
        if (matched[0] !== null) {
            this._cursor += matched[0].length
            return {
                type: "NUMBER",
                value: matched[0],
            }
        }

        // String:
        if (string[0] === '"') {
            let s = ""
            do {
                s += string[this._cursor]
                this._cursor += 1
            } while (string[this._cursor] !== '"' && !this.isEOF())
            // may have bug here,
            // s += string[this._cursor]
            // i know why
            // input "42", current s is 42
            // but we have to add a character to the end
            // no matter the character is
            s += this._cursor
            this._cursor += 1

            return {
                type: "STRING",
                value: s,
            }
        }
        return null
    }
}

module.exports = {
    Tokenizer,
}
