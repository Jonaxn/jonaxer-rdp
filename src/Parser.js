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
            body: this.StatemengList(),
        }
    }

    /**
     * StatementList
     *  : Statement
     *  | StatementList Statement -> Statament Statement ...
     */
    StatemengList(stopLookahead = null) {
        const statementList = [this.Statement()]
        while (
            this._lookahead != null &&
            this._lookahead.type !== stopLookahead
        ) {
            statementList.push(this.Statement())
        }
        return statementList
    }
    /**
     *  Statement
     *  : ExpressionSatement
     *  | BlockStatement
     *  | EmptyStatement
     *  ;
     */
    Statement() {
        switch (this._lookahead.type) {
            case "{":
                return this.BlockStatement()
            case ";":
                return this.EmpptyStatement()
            default:
                return this.ExpressionStatement()
        }
    }
    /**
     * EmptyStatement
     *  : ';'
     *  ;
     */
    EmpptyStatement() {
        this._eat(";")
        return {
            type: "EmptyStatement",
        }
    }
    /**
     * BlockStatement
     *  : '{' OptStatementList '}'
     *  ;
     */
    BlockStatement() {
        //
        this._eat("{")
        const body = this._lookahead.type == "}" ? [] : this.StatemengList("}")
        this._eat("}")
        return {
            type: "BlockStatement",
            body: body,
        }
    }
    /**
     * ExpressionStatement
     *  : Expression ';'
     *
     */
    ExpressionStatement() {
        const expression = this.Expression()
        this._eat(";")
        return {
            type: "ExpressionStatement",
            expression,
        }
    }

    /**
     * Expression
     *  : Literal
     *  ;
     */
    Expression() {
        return this.Literal()
    }

    /**
     * Literal
     *  : NumericLiteral
     *  | StringLiteral
     */
    Literal() {
        switch (this._lookahead.type) {
            case "NUMBER":
                return this.NumericLiteral()
            case "STRING":
                return this.StringLiteral()
        }
        return new SyntaxError(`Literal: unexpected literal production`)
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
     * StringLiteral
     *  : String
     *  ;
     */
    StringLiteral() {
        const token = this._eat("STRING")
        return {
            type: "StringLiteral",
            value: token.value.slice(1, -1),
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
