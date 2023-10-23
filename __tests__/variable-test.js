const {type} = require("os")

module.exports = (test) => {
    // Simple varibale declaration
    test(`let x = 42;`, {
        type: "Program",
        body: [
            {
                type: "VariableStatement",
                declarations: [
                    {
                        type: "VariableDeclaration",
                        id: {
                            type: "Identifier",
                            name: "x",
                        },
                        init: {
                            type: "NumericLiteral",
                            value: 42,
                        },
                    },
                ],
            },
        ],
    })

    // Variable declaration no inint
    test(`let x;`, {
        type: "Program",
        body: [
            {
                type: "VariableStatement",
                declarations: [
                    {
                        type: "VariableDeclaration",
                        id: {
                            type: "Identifier",
                            name: "x",
                        },
                        init: null,
                    },
                ],
            },
        ],
    })

    // Mutiple variables declarations, no init;
    test(`let x, y;`, {
        type: "Program",
        body: [
            {
                type: "VariableStatement",
                declarations: [
                    {
                        type: "VariableDeclaration",
                        id: {
                            type: "Identifier",
                            name: "x",
                        },
                        init: null,
                    },
                    {
                        type: "VariableDeclaration",
                        id: {
                            type: "Identifier",
                            name: "y",
                        },
                        init: null,
                    },
                ],
            },
        ],
    })

    // Mutiple variables declarations, with init;
    test(`let x, y = 42;`, {
        type: "Program",
        body: [
            {
                type: "VariableStatement",
                declarations: [
                    {
                        type: "VariableDeclaration",
                        id: {
                            type: "Identifier",
                            name: "x",
                        },
                        init: null,
                    },
                    {
                        type: "VariableDeclaration",
                        id: {
                            type: "Identifier",
                            name: "y",
                        },
                        init: {
                            type: "NumericLiteral",
                            value: 42,
                        },
                    },
                ],
            },
        ],
    })
}
