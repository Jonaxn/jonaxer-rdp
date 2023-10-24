/**
 * Main test number
 */
const {Parser} = require("../src/Parser")
const assert = require("assert")

/**
 * List of tests
 */
const tests = [
    require("./literals-test"),
    require("./statement-list-test"),
    require("./block-test"),
    require("./empty-statement-test"),
    require("./math-test"),
    require("./assignment-test"),
    require("./variable-test"),
    require("./if-test"),
    require("./relational-test"),
    require("./equality-test"),
    require("./logical-test"),
    require("./unary-test"),
    require("./while-test"),
    require("./do-while-test"),
    require("./for-test"),
    require("./function-declaration-test"),
]

const parser = new Parser()

function exec() {
    const program = `
    def square(x) {
        return x * x;
    }

    def empty(x, y) {
        
    }
    `

    const ast = parser.parse(program)

    console.log(JSON.stringify(ast, null, 2))
}

/**
 * Test function
 */
function test(program, expected) {
    const ast = parser.parse(program)
    assert.deepEqual(ast, expected)
}

// manul test
exec()

// Run all tests
tests.forEach((testRun) => testRun(test))
console.log("All assertions passed")
