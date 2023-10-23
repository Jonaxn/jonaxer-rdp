module.exports = (test) => {
    test(
        `while (x > 0) {
            x -= 1;
        }`,
        {
            type: "Program",
            body: [
                {
                    type: "WhileStatement",
                    test: {
                        type: "BinaryExpression",
                        operator: ">",
                        left: {
                            type: "Identifier",
                            name: "x",
                        },
                        right: {
                            type: "NumericLiteral",
                            value: 0,
                        },
                    },
                    body: {
                        type: "BlockStatement",
                        body: [
                            {
                                type: "ExpressionStatement",
                                expression: {
                                    type: "AssignmentExpression",
                                    operator: "-=",
                                    left: {
                                        type: "Identifier",
                                        name: "x",
                                    },
                                    right: {
                                        type: "NumericLiteral",
                                        value: 1,
                                    },
                                },
                            },
                        ],
                    },
                },
            ],
        }
    )
}
