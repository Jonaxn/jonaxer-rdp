module.exports = (test) => {
    // NumericLiteral
    const program = `
    /**
    * numbewr
    */
    42;
    // string
    "hello";
    `
    const ast = {
        type: "Program",
        body: [
            {
                type: "ExpressionStatement",
                expression: {
                    type: "NumericLiteral",
                    value: 42,
                },
            },
            {
                type: "ExpressionStatement",
                expression: {
                    type: "StringLiteral",
                    value: "hello",
                },
            },
        ],
    }
    test(program, ast)
}
