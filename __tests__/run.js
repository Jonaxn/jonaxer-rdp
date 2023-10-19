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
]

const parser = new Parser()

function exec() {
    const program = ` 
    if (x) {
        x = 1;    
    } else {
        x = 2;
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
