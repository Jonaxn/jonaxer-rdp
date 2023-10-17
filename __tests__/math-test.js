module.exports = (test) => {
    // addition:
    test(`2 + 2;`, {
        type: "Program",
        body: [
            {
                type: "ExpressionStatement",
                expression: {
                    type: "BinaryExpression",
                    operator: "+",
                    left: {
                        type: "NumericLiteral",
                        value: 2,
                    },
                    right: {
                        type: "NumericLiteral",
                        value: 2,
                    },
                },
            },
        ],
    })

    // nested addition;
    // left: 3 + 2
    // right: 2
    test(`3 + 2 - 2;`, {
        type: "Program",
        body: [
            {
                type: "ExpressionStatement",
                expression: {
                    type: "BinaryExpression",
                    operator: "-",
                    left: {
                        type: "BinaryExpression",
                        operator: "+",
                        left: {
                            type: "NumericLiteral",
                            value: 3,
                        },
                        right: {
                            type: "NumericLiteral",
                            value: 2,
                        },
                    },
                    right: {
                        type: "NumericLiteral",
                        value: 2,
                    },
                },
            },
        ],
    })

    // precedence of operators
    test(`1 + 2 * 3;`, {
        type: "Program",
        body: [
            {
                type: "ExpressionStatement",
                expression: {
                    type: "BinaryExpression",
                    operator: "+",
                    left: {
                        type: "NumericLiteral",
                        value: 1,
                    },
                    right: {
                        type: "BinaryExpression",
                        operator: "*",
                        left: {
                            type: "NumericLiteral",
                            value: 2,
                        },
                        right: {
                            type: "NumericLiteral",
                            value: 3,
                        },
                    },
                },
            },
        ],
    })

    test(`2 * 2;`, {
        type: "Program",
        body: [
            {
                type: "ExpressionStatement",
                expression: {
                    type: "BinaryExpression",
                    operator: "*",
                    left: {
                        type: "NumericLiteral",
                        value: 2,
                    },
                    right: {
                        type: "NumericLiteral",
                        value: 2,
                    },
                },
            },
        ],
    })

    test(`2 * 2 * 2;`, {
        type: "Program",
        body: [
            {
                type: "ExpressionStatement",
                expression: {
                    type: "BinaryExpression",
                    operator: "*",
                    left: {
                        type: "BinaryExpression",
                        operator: "*",
                        left: {
                            type: "NumericLiteral",
                            value: 2,
                        },
                        right: {
                            type: "NumericLiteral",
                            value: 2,
                        },
                    },
                    right: {
                        type: "NumericLiteral",
                        value: 2,
                    },
                },
            },
        ],
    })

    test(`2 * (2 + 2);`, {
        type: "Program",
        body: [
            {
                type: "ExpressionStatement",
                expression: {
                    type: "BinaryExpression",
                    operator: "*",
                    left: {
                        type: "NumericLiteral",
                        value: 2,
                    },
                    right: {
                        type: "BinaryExpression",
                        operator: "+",
                        left: {
                            type: "NumericLiteral",
                            value: 2,
                        },
                        right: {
                            type: "NumericLiteral",
                            value: 2,
                        },
                    },
                },
            },
        ],
    })
}
