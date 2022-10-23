fs.writeFile("./test.txt", "Ciaobello", { flag: 'wx' }, function (err) {
    if (err) throw err;
    console.log("It's saved!");
});
