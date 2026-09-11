// Consider sessionStorage Javascript 

const generateBtn = document.getElementById("generateBtn");
const container = document.getElementById("container");
const common = document.getElementById("common");
const unique = document.getElementById("unique");
const test = document.getElementById("test");

async function handleCalculate()
{
    const num = document.getElementById("numUsers").value;
    const sim_type = document.getElementById("status").value;
    var users = [];

    common.innerHTML = "";
    unique.innerHTML = "";

    for(let i = 1; i <= num; i++)
    {
        users.push(document.getElementById(`textbox-${i}`).value)
    }

    var user_lists = await get_lists(users);
    if (!user_lists) {
        console.error("No data returned, aborting calculate.");
        return;
    }

    var partition = await calculate(users, sim_type, user_lists);

    var num_unique = [];
    Object.keys(partition['unique']).forEach(key => {
        num_unique.push(Object.keys(partition['unique'][key]).length);
    });

    console.log("UNQIUE ", num_unique);
    console.log("COMMON ", Object.keys(partition['common']).length);
    console.log(partition['common'])

    display_stats(users, user_lists['user_list'], num_unique, Object.keys(partition['common']).length);
    display_common(partition['common']);
    display_unique(partition['unique'], num, users);  
}

async function get_lists(users)
{
    const list_url = "http://127.0.0.1:8000/get_list";

    try {
        const response = await fetch(list_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                users: users,
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
        var data = await response.json(); // Parses the JSON response from the server

        return data   
    } catch (error) {
        console.error('Error sending POST request:', error);
    }
}

async function calculate(users, sim_type, lists)
{
    const calc_url = "http://127.0.0.1:8000/calculate"; //Needs the 8000 bc uvicorn hosts server on port 8000

    try {
        const response = await fetch(calc_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                users: users,
                status: sim_type,
                data: lists
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
        
        return data;
    } catch (error) {
        console.error('Error sending POST request:', error);
    }
}

async function display_stats(users, anime_lists, num_unique, common_length)
{
    const stat_url = "http://127.0.0.1:8000/get_stats";
    try {
        const response = await fetch(stat_url, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                users: users,
                data: anime_lists
            })
        });

        if(!response.ok)
        {
            console.log("AAAAAAAAHHHHHHHHHHHHHHHHHHHHHHHHHHHHH")
        }

        const data = await response.json();
        console.log(data);

        const share_area = document.getElementById('shared');
        share_area.innerHTML = `Shared = ${common_length}`;

        const name_area = document.getElementById("username-stats");
        name_area.innerHTML = "";
        document.documentElement.style.setProperty('--grid-cols', users.length)

        const stat_area = document.getElementById("display-stats");
        stat_area.innerHTML = "";
        
        for(let i = 0; i < users.length; i ++)
        {
            const nameplate = document.createElement('h3');
            nameplate.id = `user${i + 1}`;
            nameplate.textContent = users[i];
            name_area.appendChild(nameplate);

            const user_stats = document.createElement('div');
            user_stats.id = `user${i + 1}_stats`;
            nameplate.className = "stat-elem";
            stat_area.appendChild(user_stats);
            
            renderStats(`user${i + 1}_stats`, data['stats'][users[i]], num_unique[i]);
        }
    } catch (error) {
        console.error('ERROR WITH DISPLAY_STATS');
        console.error('Error sending POST request:', error);
    }
}

function display_common(common_list) {
    // console.log("COMMON LIST");
    // console.log(common_list);
    // console.log(common_list.length);

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
        card.classList.add("card");

        const sim_img = document.createElement("div");
        sim_img.classList.add("sim_img");

        const img = document.createElement("img");
        img.classList.add("card_img");
        // console.log(common_list[anime]['node'])
        img.src = common_list[anime]['node']['main_picture']['large'];  // adjust to your actual data field
        img.alt = anime;
        sim_img.appendChild(img);

        const title_sec = document.createElement("div");
        title_sec.classList.add("card_title")

        const title = document.createElement("p");
        title.textContent = anime;
        title_sec.appendChild(title);

        card.appendChild(sim_img);
        card.appendChild(title_sec);
        grid.appendChild(card);
    });

    common.appendChild(grid);
}

function display_unique(unique_list, num, users) {
    // const unique_list = data['unique'];
    // console.log(unique_list);

    const unique_header = document.createElement("h2");
    unique_header.textContent = "Unique Anime";
    unique.appendChild(unique_header);

    for(let i = 0; i < num; i++) {
        const unique_user = document.createElement("h3");
        const user_hyperlink = document.createElement("a");

        //Sets up hyperlink
        user_hyperlink.href = `https://myanimelist.net/profile/${users[i]}`;
        user_hyperlink.target = '_blank';
        user_hyperlink.textContent = users[i];
        unique_user.appendChild(user_hyperlink);
        unique.appendChild(unique_user);
        // console.log(users[i], unique_list.length);

        // Create a grid container per user
        const grid = document.createElement("div");
        grid.classList.add("grid");

        Object.keys(unique_list[users[i]]).forEach(anime => {
            const card = document.createElement("div");
            card.classList.add("card");

            const sim_img = document.createElement("div");
            sim_img.classList.add("sim_img");

            const img = document.createElement("img");
            img.classList.add("card_img");
            img.src = unique_list[users[i]][anime]['node']['main_picture']['large'];
            img.alt = anime;
            sim_img.appendChild(img);

            const title = document.createElement("div");
            title.classList.add("card_title")
            title.textContent = anime;

            card.appendChild(sim_img);
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

test.addEventListener("click", display_stats);

function renderStats(containerId, stats, unique) {
  const container = document.getElementById(containerId);
  container.innerHTML = `
    <p>${unique} unique</p>
    <p>Mean Score = ${stats.mean_score}</p>
    <p>Total Entries = ${stats.total_entries}</p>
    <p>Watching = ${stats.watching}</p>
    <p>Completed = ${stats.completed}</p>
    <p>On Hold = ${stats.on_hold}</p>
    <p>Dropped = ${stats.dropped}</p>
    <p>Planned to watch = ${stats.plan_to_watch}</p>
    <p>Total Episodes = ${stats.episodes_watched}</p>
  `;
}