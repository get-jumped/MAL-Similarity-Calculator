const generateBtn = document.getElementById("generateBtn");
const container = document.getElementById("container");
const common = document.getElementById("common")

async function handleCalculate()
{
    const url = "http://127.0.0.1:8000/calculate"; //Needs the 8000 bc uvicorn hosts server on port 8000
    const num = document.getElementById("numUsers").value;
    var users = [];

    for(let i = 1; i <= num; i++)
    {
        users.push(document.getElementById(`textbox-${i}`).value)
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({users: users})
        })
        
        if(!response.ok)
        {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json(); // Parses the JSON response from the server
        //console.log('Success:', data);

        const common_list = data['common'];
        console.log(common_list);

        const common_section = document.createElement("p");
        common_section.textContent = common_list;
        common.appendChild(common_section);
    } catch (error) {
        console.error('Error sending POST request:', error);
    }
}

generateBtn.addEventListener("click", () => {
    const count = parseInt(document.getElementById("numUsers").value);

    container.innerHTML = "";

    if (isNaN(count) || count < 1) {
        alert("Please enter a valid number greater than 0.");
        return;
    }

    for (let i = 1; i <= count; i++) {
        const newTextBox = document.createElement("input");
        newTextBox.type = "text";
        newTextBox.placeholder = `Textbox #${i}`;
        newTextBox.id = `textbox-${i}`;
        newTextBox.className = "dynamic-input";
        container.appendChild(newTextBox);
    }

    const lineBreak = document.createElement('br');
    container.appendChild(lineBreak);

    const executeButton = document.createElement("button");
    executeButton.id = "calculate";
    executeButton.textContent = "Calculate";
    executeButton.style.width = '150px';
    executeButton.style.height = '50px';
    container.appendChild(executeButton);

    executeButton.addEventListener("click", handleCalculate);
});