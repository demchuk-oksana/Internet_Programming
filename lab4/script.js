function saveJsonToFile(data, filename = "data.json") {
    const jsonString = JSON.stringify(data);
    const blob = new Blob([jsonString], { type: "application/json" });
    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Event listener for button click
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("submit").addEventListener("click", function () {
        const jsonData = {
            username: document.querySelector("[name='username']").value,
            hobbies: document.querySelector("[name='hobbies']").value,
            music: document.querySelector("[name='music']").value,
            movies: document.querySelector("[name='movies']").value,
            literature: document.querySelector("[name='literature']").value
        };
        saveJsonToFile(jsonData);
    });

});
