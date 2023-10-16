module.exports = (test) => {
    // empty blocks:
    test(
        `
            ;       
        `,
        {
            type: "Program",
            body: [
                {
                    type: "EmptyStatement",
                },
            ],
        }
    )
}
