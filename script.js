let tasks = [];
let hoveredIndex = null; //klaviatura bilan o'chirish uchun,sichqoncha qaysi taskda turibdi

let taskForm = document.getElementById("taskForm");
let taskInput = document.getElementById("taskInput");
let taskList = document.getElementById("taskList");
let progressFill = document.getElementById("progress");
let numbersText = document.getElementById("numbers");
let appSubtitle = document.getElementById("appSubtitle");
let addBtn = document.getElementById("addBtn");
let prioritySelect = document.getElementById("prioritySelect");
let clearCompletedBtn = document.getElementById("clearCompletedBtn");
let themeToggle = document.getElementById("themeToggle");

let currentFilter = "all";
let filterButtons = document.querySelectorAll(".filter-btn");

//input bo'sh bo'lsa "+" tugmasini kulrang (disabled) qilish
addBtn.disabled = true;
taskInput.addEventListener("input", function () {
    if (taskInput.value.trim() === "") {
        addBtn.disabled = true;
    } else {
        addBtn.disabled = false;
    }
});

taskForm.addEventListener("submit", function (event) {
    event.preventDefault();
    let text = taskInput.value.trim();
    if (text === "") {
        return;
    }
    let newTask = {
        text: text,
        completed: false,
        date: new Date().toLocaleDateString(),
        priority: prioritySelect.value //muhim darajasi
    };
    tasks.push(newTask);
    taskInput.value = "";
    addBtn.disabled = true;
    renderTasks();
});

for (let i = 0; i < filterButtons.length; i++) {
    filterButtons[i].addEventListener("click", function () {
        currentFilter = this.dataset.filter;

        for (let j = 0; j < filterButtons.length; j++) {
            filterButtons[j].classList.remove("active");
        }
        this.classList.add("active");
        renderTasks();
    });
}

//bajarilganlarni birdaniga tozalash
clearCompletedBtn.addEventListener("click", function () {
    let remainingTasks = [];
    for (let i = 0; i < tasks.length; i++) {
        if (!tasks[i].completed) {
            remainingTasks.push(tasks[i]);
        }
    }
    tasks = remainingTasks;
    renderTasks();
});

//tungi/kunduzgi rejim
themeToggle.addEventListener("click", function () {
    document.body.classList.toggle("light-mode");
    if (document.body.classList.contains("light-mode")) {
        themeToggle.textContent = "☀️";
    } else {
        themeToggle.textContent = "🌙";
    }
});

//sichqoncha task ustida turganda "Delete" tugmasi bilan o'chirish
document.addEventListener("keydown", function (event) {
    if (event.key === "Delete" && hoveredIndex !== null) {
        deleteTask(hoveredIndex);
        hoveredIndex = null;
    }
});

//task bajarilganda kichik ovoz chiqishi
function playBeep() {
    let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    let oscillator = audioCtx.createOscillator();
    oscillator.frequency.value = 700;
    oscillator.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
}

function renderTasks() {
    taskList.innerHTML = "";

    for (let i = 0; i < tasks.length; i++) {
        let task = tasks[i];
        if (currentFilter === "active" && task.completed) {
            continue;
        }
        if (currentFilter === "completed" && !task.completed) {
            continue;
        }
        let li = document.createElement("li");
        li.classList.add("task-item");

        if (task.completed) {
            li.classList.add("completed");
        }
        if (task.priority === "high") {
            li.classList.add("priority-high"); // YANGI
        }

        li.innerHTML =
            '<label class="task-item__label">' +
            '<input type="checkbox" class="task-item__checkbox">' +
            '<span class="task-item__text">' + task.text + '</span>' +
            '<span class="task-item__date">' + task.date + '</span>' +
            '</label>' +
            '<div class="task-item__actions">' +
            '<button class="task-item__edit" type="button"><img src="img/edit.png" alt="edit"></button>' +
            '<button class="task-item__delete" type="button"><img src="img/bin.png" alt="delete"></button>' +
            '</div>';

        if (task.completed) {
            li.querySelector(".task-item__checkbox").checked = true;
        }
        li.querySelector(".task-item__checkbox").addEventListener("change", function () {
            toggleTask(i);
        });
        li.querySelector(".task-item__edit").addEventListener("click", function () {
            editTask(i);
        });
        li.querySelector(".task-item__delete").addEventListener("click", function () {
            deleteTask(i);
        });

        //hover holatini saqlash (klaviatura bilan o'chirish uchun)
        li.addEventListener("mouseenter", function () {
            hoveredIndex = i;
        });
        li.addEventListener("mouseleave", function () {
            hoveredIndex = null;
        });

        taskList.appendChild(li);
    }
    updateProgress();
}

function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    if (tasks[index].completed) {
        playBeep(); //YANGI
    }
    renderTasks();
}
function deleteTask(index) {
    tasks.splice(index, 1);
    renderTasks();
}
function editTask(index) {
    let newText = prompt("Taskni tahrirlang:", tasks[index].text);

    if (newText === null) {
        return;
    }
    newText = newText.trim();

    if (newText === "") {
        return;
    }

    tasks[index].text = newText;
    renderTasks();
}
function updateProgress() {
    let completedCount = 0;

    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].completed) {
            completedCount = completedCount + 1;
        }
    }
    let totalCount = tasks.length;
    let activeCount = totalCount - completedCount;
    let percent = 0;
    if (totalCount > 0) {
        percent = (completedCount / totalCount) * 100;
    }
    progressFill.style.width = percent + "%";
    numbersText.textContent = completedCount + " / " + totalCount;

    //progressga qarab sarlavha ostidagi matn o'zgarishi
    if (totalCount === 0) {
        appSubtitle.textContent = "Birinchi taskni qo'shing!";
    } else if (percent === 100) {
        appSubtitle.textContent = "Zo'r, hammasi tayyor! \u{1F389}";
    } else if (percent >= 50) {
        appSubtitle.textContent = "Yarim yo'ldan oshdingiz!";
    } else {
        appSubtitle.textContent = "Davom eting!";
    }

    //filter tugmalarida sonlarni ko'rsatish
    filterButtons[0].textContent = "All (" + totalCount + ")";
    filterButtons[1].textContent = "Active (" + activeCount + ")";
    filterButtons[2].textContent = "Completed (" + completedCount + ")";
}