const generateBtn = document.getElementById("generateBtn");
const container = document.getElementById("container");
const common = document.getElementById("common");
const unique = document.getElementById("unique");

async function handleCalculate()
{
    const url = "http://127.0.0.1:8000/calculate"; //Needs the 8000 bc uvicorn hosts server on port 8000
    const num = document.getElementById("numUsers").value;
    const sim_type = document.getElementById("status").value
    var users = [];

    common.innerHTML = "";
    unique.innerHTML = "";

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
            body: JSON.stringify({
                users: users,
                status: sim_type
            })
        })
        
        if(!response.ok)
        {
            const errorData = await response.json();
            
            const errorMsg = document.createElement("p");
            errorMsg.textContent = errorData.detail;
            common.appendChild(errorMsg);

            throw new Error(JSON.stringify(errorData.detail) || "Unknown error");
        }
        const data = await response.json(); // Parses the JSON response from the server

        display_common(data);

        display_unique(data, num, users);        
    } catch (error) {
        console.error('Error sending POST request:', error);
    }
}

function display_common(data) {
    const common_list = data['common'];
    console.log(common_list);

    const common_header = document.createElement("h2");
    common_header.textContent = "Common Anime";
    common.appendChild(common_header)

    common.appendChild(document.createElement("br"));

    // Create a grid container
    const grid = document.createElement("div");
    grid.classList.add("grid");

    // Add each anime as a card
    Object.keys(common_list).forEach(anime => {
        const card = document.createElement("div");

        const img = document.createElement("img");
        img.src = common_list[anime]['main_picture']['medium'];  // adjust to your actual data field
        img.alt = anime;
        img.style.width = "100%";
        img.style.aspectRatio = "2/3";
        img.style.objectFit = "cover";
        img.style.borderRadius = "6px";
        img.style.display = "block";

        const title = document.createElement("p");
        title.textContent = anime;
        title.style.marginTop = "8px";
        title.style.fontSize = "0.85rem";
        title.style.textAlign = "center";

        card.appendChild(img);
        card.appendChild(title);
        grid.appendChild(card);
    });

    common.appendChild(grid);
}

function display_unique(data, num, users) {
    const unique_list = data['unique'];
    console.log(unique_list);

    const unique_header = document.createElement("h2");
    unique_header.textContent = "Unique Anime";
    unique.appendChild(unique_header);

    for(let i = 0; i < num; i++) {
        const unique_user = document.createElement("h3");
        unique_user.textContent = users[i];
        unique.appendChild(unique_user);

        // Create a grid container per user
        const grid = document.createElement("div");
        grid.classList.add("grid");

        Object.keys(unique_list[users[i]]).forEach(anime => {
            const card = document.createElement("div");

            const img = document.createElement("img");
            img.src = unique_list[users[i]][anime]['main_picture']['medium'];  // adjust to your actual data field
            img.alt = anime;
            img.style.width = "100%";
            img.style.aspectRatio = "2/3";
            img.style.objectFit = "cover";
            img.style.borderRadius = "6px";
            img.style.display = "block";

            const title = document.createElement("p");
            title.textContent = anime;
            title.style.marginTop = "8px";
            title.style.fontSize = "0.85rem";
            title.style.textAlign = "center";

            card.appendChild(img);
            card.appendChild(title);
            grid.appendChild(card);
        });

        unique.appendChild(grid);
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