let currentQuestionIndex = 0;
const responses = {};

const questions = [
    {
        type: "dates",
        question: "What were the dates of your last three menstrual periods?",
        subfields: ["Most Recent", "Previous", "Third Most Recent"]
    },
    {
        type: "scale",
        question: "How would you rate the amount of excessive hair growth on your body (e.g., face, chest, back)?",
        image: "images/hirsutism-scale.jpg",
        options: [1, 2, 3, 4, 5],
        labels: ["None", "Mild", "Moderate", "Severe", "Very Severe"]
    },
    {
        type: "scale",
        question: "How would you rate the severity of acne or oily skin?",
        image: "images/acne-scale.jpg",
        options: [1, 2, 3, 4, 5],
        labels: ["None", "Mild", "Moderate", "Severe", "Very Severe"]
    },
    {
        type: "scale",
        question: "How noticeable is your hair thinning or male-pattern baldness?",
        image: "images/hairloss-scale.jpg",
        options: [1, 2, 3, 4, 5],
        labels: ["None", "Mild", "Moderate", "Severe", "Very Severe"]
    },
    {
        type: "measurements",
        question: "What is your height and weight?",
        fields: [
            { label: "Height", type: "number", unit: ["cm", "inches"] },
            { label: "Weight", type: "number", unit: ["kg", "pounds"] }
        ]
    },
    {
        question: "Have you noticed skin darkening in body folds?",
        type: "yesno",
        help: "Common areas include neck folds, groin, or underarms"
    },
    {
        question: "Please enter your body measurements",
        type: "measurements",
        fields: [
            {
                label: "Waist",
                unit: ["cm", "inches"]
            },
            {
                label: "Hip",
                unit: ["cm", "inches"]
            }
        ]
    },
    {
        type: "yesno",
        question: "Is there a history of PCOS or diabetes in your family?"
    }
    ]

const questionContainer = document.getElementById('question-container');
const progressBar = document.getElementById('progress-bar');
const prevButton = document.getElementById('prev-btn');
const nextButton = document.getElementById('next-btn');

document.addEventListener('DOMContentLoaded', () => {
    loadQuestion(currentQuestionIndex);
    updateNavigationButtons();
});

prevButton.addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion(currentQuestionIndex);
        updateNavigationButtons();
    }
});

nextButton.addEventListener('click', () => {
    if (currentQuestionIndex < questions.length - 1) {
        saveResponse();
        currentQuestionIndex++;
        loadQuestion(currentQuestionIndex);
    } else {
        saveResponse();
        submitAssessment();
    }
    updateNavigationButtons();
});

function saveResponse() {
    const question = questions[currentQuestionIndex];
    switch(question.type) {
        case "dates":
            responses[currentQuestionIndex] = question.subfields.reduce((acc, field) => {
                const inputName = `period_${field.toLowerCase().replace(' ', '_')}`;
                acc[field] = document.querySelector(`input[name="${inputName}"]`).value;
                return acc;
            }, {});
            break;
        case "scale":
            responses[currentQuestionIndex] = document.querySelector('input[name="response"]:checked')?.value;
            break;
        case "measurements":
            responses[currentQuestionIndex] = question.fields.reduce((acc, field) => {
                const value = document.querySelector(`input[name="${field.label.toLowerCase()}"]`).value;
                const unit = document.querySelector(`select[name="${field.label.toLowerCase()}_unit"]`).value;
                acc[field.label] = { value, unit };
                return acc;
            }, {});
            break;
        case "yesno":
            responses[currentQuestionIndex] = document.querySelector('input[name="response"]:checked')?.value;
            break;
    }
}

function updateNavigationButtons() {
    prevButton.disabled = currentQuestionIndex === 0;
    nextButton.textContent = currentQuestionIndex === questions.length - 1 ? 'Submit' : 'Next';
}

function submitAssessment() {
    if (!validateAllResponses()) {
        alert("Please complete all measurements");
        return;
    }
    
    console.log("Submitting responses:", responses);
    window.location.href = `results.html?data=${encodeURIComponent(JSON.stringify(responses))}`;
}

function validateAllResponses() {
    const measurementResponses = responses[6]; 
    if (!measurementResponses?.Waist?.value || !measurementResponses?.Hip?.value) {
        return false;
    }
    return true;
}


function loadQuestion(index) {
    const questionData = questions[index];
    let html = `<div class="question-card">
                    <h2>${questionData.question}</h2>`;

    switch(questionData.type) {
        case "dates":
            html += `<div class="dates-container">
                ${questionData.subfields.map(field => `
                    <div class="date-field">
                        <label>${field}</label>
                        <input type="date" name="period_${field.toLowerCase().replace(' ', '_')}">
                    </div>
                `).join('')}
            </div>`;
            break;

        case "scale":
            html += `
            <div class="scale-container">
                ${questionData.image ? `<img src="${questionData.image}" alt="Scale reference">` : ''}
                <div class="scale-options">
                    ${questionData.options.map((value, i) => `
                        <label class="scale-option">
                            <input type="radio" name="response" value="${value}">
                            <span class="scale-value">${value}</span>
                            <span class="scale-label">${questionData.labels[i]}</span>
                        </label>
                    `).join('')}
                </div>
            </div>`;
            break;

        case "measurements":
            html += `<div class="measurements-container">
                ${questionData.fields.map(field => `
                    <div class="measurement-field">
                        <label>${field.label}</label>
                        <input type="number" name="${field.label.toLowerCase()}" step="0.1">
                        <select name="${field.label.toLowerCase()}_unit">
                            ${field.unit.map(u => `<option value="${u}">${u}</option>`).join('')}
                        </select>
                    </div>
                `).join('')}
            </div>`;
            break;

        case "yesno":
            html += `<div class="yesno-container">
                <label><input type="radio" name="response" value="yes">Yes</label>
                <label><input type="radio" name="response" value="no">No</label>
            </div>`;
            break;
    }

    html += `</div>`;
    questionContainer.innerHTML = html;
    
    progressBar.style.width = `${((index + 1) / questions.length) * 100}%`;
}

loadQuestion(currentQuestionIndex);