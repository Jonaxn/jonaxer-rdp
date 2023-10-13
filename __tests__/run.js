/**
 * Main test number
 */
const {Parser} = require("../src/Parser")
const assert = require("assert")

/**
 * List of tests
 */
const tests = [require("./literals-test")]

const parser = new Parser()

function exec() {
    const program = `
    /**
    * numbewr
    */
                    42
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

// Run al tests
tests.forEach((testRun) => testRun(test))
console.log("All assertions passed")
