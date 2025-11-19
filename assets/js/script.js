let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let nextId = JSON.parse(localStorage.getItem('nextId')) || 1;

function saveState() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('nextId', JSON.stringify(nextId));
}

function generateTaskId() {
    const id = nextId;
    nextId++;
    saveState();
    return id;
}

function createTaskCard(task) {
    const card = $('<div>')
        .addClass('card task-card')
        .attr('data-task-id', task.id);

    const cardBody = $('<div>').addClass('card-body');

    const title = $('<h5>')
        .addClass('card-title task-card-title')
        .text(task.title);

    const dueDate = $('<p>')
        .addClass('card-text task-card-meta')
        .html('<strong>Due:</strong> ' + task.dueDate);

    const description = $('<p>')
        .addClass('card-text task-card-text')
        .text(task.description);

    const deleteBtn = $('<button>')
        .addClass('btn btn-danger btn-sm')
        .text('Delete')
        .attr('data-task-id', task.id);

    const actions = $('<div>')
        .addClass('task-actions')
        .append(deleteBtn);

    cardBody.append(title, dueDate, description, actions);
    card.append(cardBody);

    if (task.status !== 'done') {
        const taskDueDate = dayjs(task.dueDate, 'YYYY-MM-DD');
        const today = dayjs().startOf('day');

        if (taskDueDate.isBefore(today, 'day')) {
            card.addClass('task-due-overdue');
        } else if (taskDueDate.diff(today, 'day') <= 3) {
            card.addClass('task-due-warning');
        }
    }

    return card;
}

function renderTaskList() {
    $('#todo-cards').empty();
    $('#in-progress-cards').empty();
    $('#done-cards').empty();

    tasks.forEach(task => {
        const card = createTaskCard(task);

        if (task.status === 'to-do') {
            $('#todo-cards').append(card);
        } else if (task.status === 'in-progress') {
            $('#in-progress-cards').append(card);
        } else if (task.status === 'done') {
            $('#done-cards').append(card);
        }
    });

    $('.task-card').draggable({
        opacity: 0.7,
        helper: 'clone',
        revert: 'invalid',
        zIndex: 1000,
        cursor: 'move'
    });
}

function handleAddTask(event) {
    event.preventDefault();

    const title = $('#taskTitle').val().trim();
    const description = $('#taskDescription').val().trim();
    const dueDate = $('#taskDueDate').val().trim();

    if (!title || !description || !dueDate) {
        alert('Please fill in all fields before saving the task.');
        return;
    }

    const newTask = {
        id: generateTaskId(),
        title: title,
        description: description,
        dueDate: dueDate,
        status: 'to-do'
    };

    tasks.push(newTask);
    saveState();
    renderTaskList();

    $('#taskForm')[0].reset();
    const modal = bootstrap.Modal.getInstance($('#taskModal')[0]);
    modal.hide();
}

function handleDeleteTask(event) {
    const taskId = parseInt($(event.target).attr('data-task-id'));
    tasks = tasks.filter(task => task.id !== taskId);
    saveState();
    renderTaskList();
}

function handleDrop(event, ui) {
    const taskId = parseInt(ui.draggable.attr('data-task-id'));
    const newStatus = $(this).parent().attr('data-status');

    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.status = newStatus;
    }

    saveState();
    renderTaskList();
}

$(function () {
    $('#current-date').text(dayjs().format('[Today:] dddd, MMM D, YYYY'));

    $('#taskDueDate').datepicker({
        dateFormat: 'yy-mm-dd',
        changeMonth: true,
        changeYear: true,
        minDate: 0,
    });

    renderTaskList();

    $('#taskForm').on('submit', handleAddTask);

    $('body').on('click', '.btn-danger', handleDeleteTask);

    $('.lane-body').droppable({
        accept: '.task-card',
        hoverClass: 'ui-droppable-hover',
        drop: handleDrop
    });
});
