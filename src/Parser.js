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
     *  | VariableStatement
     *  | IfStatement
     *  | IterationStatement
     *  | FunctionDeclaration
     *  | ReturnStatement
     *  ;
     */
    Statement() {
        switch (this._lookahead.type) {
            case ";":
                return this.EmptyStatement()
            case "if":
                return this.IfStatement()
            case "{":
                return this.BlockStatement()
            case "let":
                return this.VariableStatement()
            case "return":
                return this.ReturnStatement()
            case "def":
                return this.FunctionDeclaration()
            case "while":
            case "do":
            case "for":
                return this.IterationStatement()
            default:
                return this.ExpressionStatement()
        }
    }
    /**
     * FunctionDeclaration
     *  : 'def' Identifier '(' FormalParameterList ')' Block
     *  ;
     */
    FunctionDeclaration() {
        this._eat("def")
        const name = this.Identifier()
        this._eat("(")

        // OptFormalParameterList
        const params =
            this._lookahead.type !== ")" ? this.FormalParameterList() : []
        this._eat(")")

        const body = this.BlockStatement()
        return {
            type: "FunctionDeclaration",
            name,
            params,
            body,
        }
    }
    /**
     * ForamlParameterList
     *  : Identifier
     *  | FormalParameterList ',' Identifier
     *  ;
     */
    FormalParameterList() {
        const params = []
        do {
            params.push(this.Identifier())
        } while (this._lookahead.type == "," && this._eat(","))
        return params
    }
    /**
     * ReturnStatement
     *  : 'return' OptExpression ';'
     *  ;
     */
    ReturnStatement() {
        this._eat("return")
        const argument = this._lookahead.type != ";" ? this.Expression() : null
        this._eat(";")
        return {
            type: "ReturnStatement",
            argument,
        }
    }

    /**
     * IterationStatement
     *  : WhileStatement
     *  | DoWhileStatement
     *  | ForStatement
     * ;
     */
    IterationStatement() {
        switch (this._lookahead.type) {
            case "while":
                return this.WhileStatement()
            case "do":
                return this.DoWhileStatement()
            case "for":
                return this.ForStatement()
        }
    }
    /**
     * ForStatement
     *  : 'for' '(' OptForStatementInit ';' Expression ';' ForUpdate ')' Statement
     *  ;
     */
    ForStatement() {
        this._eat("for")
        this._eat("(")

        const init =
            this._lookahead.type != ";" ? this.ForStatementInit() : null
        this._eat(";")

        const test = this._lookahead.type != ";" ? this.Expression() : null
        this._eat(";")

        const update = this._lookahead.type != ")" ? this.Expression() : null
        this._eat(")")

        const body = this.Statement()

        return {
            type: "ForStatement",
            init,
            test,
            update,
            body,
        }
    }
    /**
     * ForStatementInit
     *  : VariableStatementInit
     *  | Expression
     *  ;
     */
    ForStatementInit() {
        if (this._lookahead.type == "let") {
            return this.VariableStatementInit()
        }
        return this.Expression()
    }

    /**
     * WhileStatement
     *  : 'while' '(' Expression ')' Statement
     * ;
     */
    WhileStatement() {
        this._eat("while")
        this._eat("(")
        const test = this.Expression()
        this._eat(")")
        const body = this.Statement()
        return {
            type: "WhileStatement",
            test,
            body,
        }
    }

    /**
     * DoWhileStatement
     *  : 'do' Statement 'while' '(' Expression ')' ';'
     *  ;
     */
    DoWhileStatement() {
        this._eat("do")
        const body = this.Statement()
        this._eat("while")
        this._eat("(")
        const test = this.Expression()
        this._eat(")")
        this._eat(";")
        return {
            type: "DoWhileStatement",
            body,
            test,
        }
    }
    /**
     * IfStatement
     *  : 'if' '(' Expression ')' Statement
     *  | 'if' '(' Expression ')' Statement 'else' Statement
     *  ;
     */
    IfStatement() {
        this._eat("if")
        this._eat("(")
        const test = this.Expression()
        this._eat(")")

        const consequent = this.Statement()

        const alternate =
            this._lookahead != null && this._lookahead.type === "else"
                ? this._eat("else") && this.Statement()
                : null

        return {
            type: "IfStatement",
            test,
            consequent,
            alternate,
        }
    }
    /**
     * VariableStatementInit
     *  : 'let' VariableDeclarationList
     *  ;
     */
    VariableStatementInit() {
        this._eat("let")
        const declarations = this.VariableDeclarationList()

        return {
            type: "VariableStatement",
            declarations,
        }
    }
    /**
     * VariableStatement
     *  : VariableStatementInit ';'
     *  ;
     */
    VariableStatement() {
        const variableStatement = this.VariableStatementInit()
        this._eat(";")
        return variableStatement
    }

    /**
     * VariableDeclarationList
     *  : VariableDeclaration
     *  | VariableDeclarationList ',' VariableDeclaration
     *  ;
     */
    VariableDeclarationList() {
        const declarations = []
        do {
            declarations.push(this.VariableDeclaration())
        } while (this._lookahead.type == "," && this._eat(","))
        return declarations
    }
    /**
     * VariableDeclaration
     *  : Initializer OptVariableInitializer
     *  ;
     */
    VariableDeclaration() {
        const id = this.Identifier()

        // OptVariableInitializer
        const init =
            this._lookahead.type !== ";" && this._lookahead.type !== ","
                ? this.VariableInitializer()
                : null

        return {
            type: "VariableDeclaration",
            id,
            init,
        }
    }
    /**
     * VariableInitializer
     *  : SIMPLE_ASSIGN AssignmentExpression
     *  ;
     */
    VariableInitializer() {
        this._eat("SIMPLE_ASSIGN")
        return this.AssignmentExpression()
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
     *  : LogicalORExpression
     *  | LeftHandSideExpression AssignmentOperator AssignmentExpression
     *  ;
     */
    AssignmentExpression() {
        const left = this.LogicalORExpression()

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
        if (node.type === "Identifier" || node.type === "MemberExpression") {
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

    /**g
     * AssignmentOperator
     *  : SIMPLE_ASSIGN
     *  | COMPLEX_ASSIGN
     *  ;
     */
    AssignmentOperator() {
        if (this._lookahead.type === "SIMPLE_ASSIGN") {
            return this._eat("SIMPLE_ASSIGN")
        }
        return this._eat("COMPLEX_ASSIGN")
    }

    /**
     * Logical OR expression
     *
     *  x || y
     *
     * LogicalORExpression
     *  : LogicalANDExpression LOGICAL_OR LogicalORExpression
     *  | LogicalANDExpression
     *  ;
     */
    LogicalORExpression() {
        return this._LogicalExpression("LogicalANDExpression", "LOGICAL_OR")
    }

    /**
     * Logical AND expression
     *
     *  x && y
     * LogicalANDExpression
     *  : EqualityExpression LOGICAL_AND LogicalANDExpression
     *  | EqualityExpression
     *  ;
     */
    LogicalANDExpression() {
        return this._LogicalExpression("EqualityExpression", "LOGICAL_AND")
    }

    /**
     * EQUALITY_OPERATOR: ==, !=
     *
     *  x == y
     *  x != y
     *
     * EqulityExpression
     *  : RelationalExpression EQUALITY_OPERATOR EqualityExpression
     *  | RelationalExpression
     *  ;
     */
    EqualityExpression() {
        return this._BinaryExpression(
            "RelationalExpression",
            "EQUALITY_OPERATOR"
        )
    }

    /**
     * RELATIONAL_OPERATOR: >, <, >=, <=
     *
     * x > y
     * x >= y
     * x < y
     * x <= y
     *
     * RelationalExpression
     *  : AdditiveExpression
     *  | AdditiveExpression RELATIONAL_OPERATOR RelationalExpression
     */
    RelationalExpression() {
        return this._BinaryExpression(
            "AdditiveExpression",
            "RELATIONAL_OPERATOR"
        )
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
     *  : UnaryExpression
     *  | MultiplicativeExpression MULTIPLICATIVE_OPERATOR UnaryExpression
     */
    MultiplicativeExpression() {
        return this._BinaryExpression(
            "UnaryExpression",
            "MULTIPLICATIVE_OPERATOR"
        )
    }
    /**
     * UnaryExpression
     *  : LeftHandSideExpression
     *  | ADDITIVE_OPERATOR UnaryExpression
     *  | LOGICAL_NOT UnaryExpression
     * ;
     */
    UnaryExpression() {
        let operator
        switch (this._lookahead.type) {
            case "ADDITIVE_OPERATOR":
                operator = this._eat("ADDITIVE_OPERATOR").value
                break
            case "LOGICAL_NOT":
                operator = this._eat("LOGICAL_NOT").value
                break
        }
        if (operator != null) {
            return {
                type: "UnaryExpression",
                operator,
                argument: this.UnaryExpression(),
            }
        }
        return this.LeftHandSideExpression()
    }
    /**
     * LeftHandSideExpression
     *  : MemberExpression
     *  ;
     */
    LeftHandSideExpression() {
        return this.MemberExpression()
    }
    /**
     * MemberExpression
     *  : PrimaryExpression
     *  | MemberExpression '[' Expression ']'
     *  | MemberExpression '.' Identifier
     *  ;
     */
    MemberExpression() {
        let object = this.PrimaryExpression()
        while (this._lookahead.type === "." || this._lookahead.type === "[") {
            if (this._lookahead.type == ".") {
                this._eat(".")
                const property = this.Identifier()
                object = {
                    type: "MemberExpression",
                    computed: false,
                    object,
                    property,
                }
            }
            // MemberExpression [' Expression ']
            if (this._lookahead.type == "[") {
                this._eat("[")
                const property = this.Expression()
                this._eat("]")
                object = {
                    type: "MemberExpression",
                    computed: true,
                    object,
                    property,
                }
            }
        }
        return object
    }
    /**
     * PrimaryExpression
     *  : Literal
     *  | ParenthesizedExpression
     *  | Identifier
     *  ;
     */
    PrimaryExpression() {
        if (this._isLiteral(this._lookahead.type)) {
            return this.Literal()
        }
        switch (this._lookahead.type) {
            case "(":
                return this.ParenthesizedExpression()
            case "IDENTIFIER":
                return this.Identifier()
            default:
                return this.LeftHandSideExpression()
        }
    }

    /**
     * Whether the token is a literal
     */
    _isLiteral(tokenType) {
        return (
            tokenType === "NUMBER" ||
            tokenType === "STRING" ||
            tokenType === "true" ||
            tokenType === "false" ||
            tokenType === "null"
        )
    }

    /**
     * Generic helper for LogicalExpression nodes
     */
    _LogicalExpression(builderName, operatorToken) {
        let left = this[builderName]()
        while (this._lookahead.type === operatorToken) {
            const operator = this._eat(operatorToken).value
            const right = this[builderName]()
            left = {
                type: "LogicalExpression",
                operator,
                left,
                right,
            }
        }
        return left
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
     *  | BooleanLiteral
     *  | NullLiteral
     *  ;
     */
    Literal() {
        switch (this._lookahead.type) {
            case "NUMBER":
                return this.NumericLiteral()
            case "STRING":
                return this.StringLiteral()
            case "true":
                return this.BooleanLiteral(true)
            case "false":
                return this.BooleanLiteral(false)
            case "null":
                return this.NullLiteral()
        }
        return new SyntaxError(`Literal: unexpected literal production`)
    }

    /**
     * BooleanLiteral
     *  : 'false'
     *  | 'true'
     * ;
     */
    BooleanLiteral(value) {
        this._eat(value ? "true" : "false")
        return {
            type: "BooleanLiteral",
            value,
        }
    }

    /**
     * NullLiteral
     *  : 'null'
     *  ;
     */
    NullLiteral() {
        this._eat("null")
        return {
            type: "NullLiteral",
            value: null,
        }
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
