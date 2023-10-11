// parser: recursive descent implementation
const {Tokenizer} = require("./Tokenizer")

class Parser {
    /**
     * Initializes the parser
     */
    constructor() {
        this._string = ""
        this._tokenizer = new Tokenizer()
    }

    /**
     * parses a string into an AST.
     */
    parse(string) {
        this._string = string
        this._tokenizer.init(string)

        // Prime the tokenizer to obtain the frist
        // token which is our lookahead. The lookahead is used
        // for predictive parsing
        this._lookahead = this._tokenizer.getNextToken()

        // parse recursively starting from the mian entry
        // point, the Program
        return this.Program()
    }

    /**
     * Main entry point.
     *
     * Program:
     *  :NumericLiteral
     *  ;
     */
    Program() {
        return {
            type: "Program",
            body: this.NumericLiteral(),
        }
    }

    /**
     * NumericLiteral
     *  : NUMBER
     *  ;
     */
    NumericLiteral() {
        const token = this._eat("NUMBER")
        return {
            type: "NumericLiteral",
            value: Number(token.value),
        }
    }

    /**
     * Expects a token of a given type
     */
    _eat(tokenType) {
        const token = this._lookahead
        if (token == null) {
            throw new SyntaxError(
                `Unexpected end of input, expected: "${tokenType}"`
            )
        }
        if (token.type !== tokenType) {
            throw new SyntaxError(
                `Unexpected token: "${token.value}", expected: "${tokenType}"`
            )
        }
        // advance to next token
        this._lookahead = this._tokenizer.getNextToken()
        return token
    }
}

module.exports = {
    Parser,
}
