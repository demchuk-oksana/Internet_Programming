let range = 1000
let operations = [];
let num1, num2, operator, correctAnswer;

document.addEventListener("DOMContentLoaded", function () {
    const rangeButtons = document.querySelectorAll("#range-buttons button");
    const operandButtons = document.querySelectorAll("#operand-buttons button");
    const submitButton = document.getElementById("result");
    const hintButton = document.getElementById("hint");
    const numButtons = document.querySelectorAll("#numbers button");
    const answerInput = document.getElementById("answer");
    numButtons.forEach(button => {
        button.addEventListener("click", function(){
            let value = this.getAttribute("num"); 
            if (value === "bck") {
                answerInput.value = answerInput.value.slice(0, -1);
            } else {
                answerInput.value += value;
            }
        })
    })
    hintButton.addEventListener("click", function(){
        if(correctAnswer !== undefined){document.getElementById("hint").textContent = correctAnswer}
    })
    submitButton.addEventListener("click", function(){
        checkAnswer()
    })
    rangeButtons.forEach(button => {
        button.addEventListener("click", function () {
            if (this.classList.contains("active")) {
                this.classList.remove("active")
                setRange(1000);
            } else {
                rangeButtons.forEach(btn => btn.classList.remove("active"));
                this.classList.add("active")
                setRange(this.getAttribute("range"));
            }
        });
    });
    operandButtons.forEach(button => {
        button.addEventListener("click", function () {
            this.classList.toggle("active");
            setOperation(this.getAttribute("op"));
        });
    });
});

function setRange(newRange){
    range = newRange;
    document.getElementById("hint").textContent ='???'
    generateProblem()
}

function setOperation(operation){
    let index = operations.indexOf(operation);
    if (index !== -1){
        operations.splice(index,1);}
    else {operations.push(operation);}
    generateProblem();
}
function generateProblem(){
    if (operations.length == 0)return;
    num1 = Math.floor(Math.random() * range);
    num2 = Math.floor(Math.random() * range); 
    operator = operations[Math.floor(Math.random() * operations.length)];
    while(operator === '/' && num2==0){
        num2 = Math.floor(Math.random() * range); 
    }
    correctAnswer = Math.round(eval(`${num1} ${operator} ${num2}`) * 100) / 100;
    document.getElementById('num1').textContent = num1;
    document.getElementById('num2').textContent = num2;
    document.getElementById('eq').textContent = "=";
    document.getElementById('operator').textContent = operator;
    document.getElementById('answer').value = '';
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function checkAnswer(){
    let userAnswer = document.getElementById('answer').value;
    if (userAnswer == correctAnswer){
        document.getElementById('result').textContent = 'Corect!'
        document.getElementById("hint").textContent ='???'
        generateProblem()
        await delay(2000);
        document.getElementById('result').textContent = 'Submit'
    } else {
        document.getElementById('result').textContent = 'Wrong! Try again.'
        await delay(2000);
         document.getElementById('result').textContent = 'Submit'
    }
}
generateProblem();