// parser: recursive descent implementation
const {log} = require("console")
const {Tokenizer} = require("./Tokenizer")

// ------------------------------------------
// Default AST node for factories
const DefaultFactory = {
    Program: (body) => {
        return {
            type: "Program",
            body,
        }
    },
    EmptyStatement() {
        return {type: "EmptyStatement"}
    },
    BlockStatement(body) {
        return {type: "BlockStatement", body}
    },
    ExpressionStatement(expression) {
        return {type: "ExpressionStatement", expression}
    },
    StringLiteral(value) {
        return {type: "StringLiteral", value}
    },
    NumericLiteral(value) {
        return {type: "NumericLiteral", value}
    },
}

// ------------------------------------------
// S-expression AST node factories
const SExpressionFactory = {
    Program: (body) => {
        return ["begin", body]
    },
    EmptyStatement() {},
    BlockStatement(body) {
        return ["begin", body]
    },
    ExpressionStatement(expression) {
        return expression
    },
    StringLiteral(value) {
        return `"${value}"`
    },
    NumericLiteral(value) {
        return value
    },
}

const AST_MODE = "default"

const factory = AST_MODE == "default" ? DefaultFactory : SExpressionFactory
// const factory = AST_MODE == "s-expression" ? DefaultFactory : SExpressionFactory

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
        return factory.Program(this.StatemengList())
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
                return this.EmptyStatement()
            default:
                return this.ExpressionStatement()
        }
    }
    /**
     * EmptyStatement
     *  : ';'
     *  ;
     */
    EmptyStatement() {
        this._eat(";")
        return factory.EmptyStatement()
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
        return factory.BlockStatement(body)
    }
    /**
     * ExpressionStatement
     *  : Expression ';'
     *
     */
    ExpressionStatement() {
        const expression = this.Expression()
        this._eat(";")
        return factory.ExpressionStatement(expression)
    }

    /**
     * Expression
     *  : Literal
     *  ;
     */
    Expression() {
        return this.AssignmentExpression()
    }

    /**
     * AssignmentExpression
     *  : AdditiveExpression
     *  | LeftHandSideExpression AssignmentOperator AssignmentExpression
     *  ;
     */
    AssignmentExpression() {
        const left = this.AdditiveExpression()

        if (!this._isAssigmentOperator(this._lookahead.type)) {
            return left
        }
        return {
            type: "AssignmentExpression",
            operator: this.AssignmentOperator().value,
            left: this._checkValidAssigmentTarget(left),
            right: this.AssignmentExpression(),
        }
    }
    /**
     * LeftHandSideExpression
     *  : Identifier
     *  ;
     */
    LeftHandSideExpression() {
        return this.Identifier()
    }

    /**
     * Identifier
     *  : IDENTIFIER
     *  ;
     */
    Identifier() {
        const name = this._eat("IDENTIFIER").value
        return {
            type: "Identifier",
            name,
        }
    }
    /**
     * Extra check whether it's valid assigment target
     */
    _checkValidAssigmentTarget(node) {
        if (node.type === "Identifier") {
            return node
        }
        throw new SyntaxError("Invalid lef-hand side in assigment expression")
    }

    /**
     * Wether the token is an assignment operator
     */
    _isAssigmentOperator(tokenType) {
        return tokenType === "SIMPLE_ASSIGN" || tokenType === "COMPLEX_ASSIGN"
    }

    /**
     * AssignmentOperator
     */
    AssignmentOperator() {
        if (this._lookahead.type === "SIMPLE_ASSIGN") {
            return this._eat("SIMPLE_ASSIGN")
        }
        return this._eat("COMPLEX_ASSIGN")
    }

    /**
     * AdditiveExpression
     *  : MultiplicativeExpression
     *  | AdditiveExpression ADDITIVE_OPERATOR Literal -> MultiplicativeExpression ADDITIVE_OPERATOR Literal
     *  ;
     */
    AdditiveExpression() {
        return this._BinaryExpression(
            "MultiplicativeExpression",
            "ADDITIVE_OPERATOR"
        )
    }
    /**
     * MultiplicativeExpression
     *  : PrimaryExpression
     *  | MultiplicativeExpression MULTIPLICATIVE_OPERATOR PrimaryExpression -> PrimaryExpression MULTIPLICATIVE_OPERATOR PrimaryExpression
     */
    MultiplicativeExpression() {
        return this._BinaryExpression(
            "PrimaryExpression",
            "MULTIPLICATIVE_OPERATOR"
        )
    }
    /**
     * PrimaryExpression
     *  : Literal
     *  | ParenthesizedExpression
     *  | LeftHandSideExpression
     *  ;
     */
    PrimaryExpression() {
        if (this._isLiteral(this._lookahead.type)) {
            return this.Literal()
        }
        switch (this._lookahead.type) {
            case "(":
                return this.ParenthesizedExpression()
            default:
                return this.LeftHandSideExpression()
        }
    }

    /**
     * Whether the token is a literal
     */
    _isLiteral(tokenType) {
        return tokenType === "NUMBER" || tokenType === "STRING"
    }

    /**
     * Generic binary expression
     */
    _BinaryExpression(builderName, operatorToken) {
        let left = this[builderName]()
        while (this._lookahead.type === operatorToken) {
            const operator = this._eat(operatorToken).value
            const right = this[builderName]()
            left = {
                type: "BinaryExpression",
                operator,
                left,
                right,
            }
        }
        return left
    }
    /**
     * ParenthesizedExpression
     *  : '(' Expression ')'
     *  ;
     */
    ParenthesizedExpression() {
        this._eat("(")
        const expression = this.Expression()
        this._eat(")")
        return expression
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
        return factory.NumericLiteral(token.value)
    }
    /**
     * StringLiteral
     *  : String
     *  ;
     */
    StringLiteral() {
        const token = this._eat("STRING")
        return factory.StringLiteral(token.value.slice(1, -1))
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
            console.log(
                `Unexpected token: "${token.value}", expected: "${tokenType}"`
            )
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
