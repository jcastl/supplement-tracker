document.addEventListener('DOMContentLoaded', function() {
    // Initial data
    const defaultSupplements = {
        breakfast: [
            { id: 'b1', name: 'D3 + K2', checked: false },
            { id: 'b2', name: 'CoQ-10 Phytosome (1 of 3)', checked: false },
            { id: 'b3', name: 'Red Yeast Rice (1 of 3)', checked: false },
            { id: 'b4', name: 'Jocko Greens', checked: false },
            { id: 'b5', name: 'Turmeric', checked: false },
            { id: 'b6', name: 'Protein Shake (if morning workout)', checked: false },
        ],
        lunch: [
            { id: 'l1', name: 'CoQ-10 Phytosome (2 of 3)', checked: false },
            { id: 'l2', name: 'Red Yeast Rice (2 of 3)', checked: false },
            { id: 'l3', name: 'Turmeric', checked: false },
            { id: 'l4', name: 'L-Leucine', checked: false },
        ],
        dinner: [
            { id: 'd1', name: 'CoQ-10 Phytosome (3 of 3)', checked: false },
            { id: 'd2', name: 'Red Yeast Rice (3 of 3)', checked: false },
            { id: 'd3', name: 'Turmeric', checked: false },
            { id: 'd4', name: 'Creatine (3 gummies)', checked: false },
            { id: 'd5', name: 'L-Leucine (1–2 pills)', checked: false },
        ],
        other: [
            { id: 'o1', name: 'Protein Shake', checked: false },
        ]
    };

    const sectionTitles = {
        breakfast: 'Breakfast',
        lunch: 'Lunch',
        dinner: 'Dinner',
        other: 'Other (Post-Workout)'
    };

    // Load state from localStorage or use defaults
    let hydrationLevel = parseInt(localStorage.getItem('hydrationLevel')) || 0;
    let hydrationGoal = parseInt(localStorage.getItem('hydrationGoal')) || 128;
    let supplements = JSON.parse(localStorage.getItem('supplements')) || defaultSupplements;

    // Initialize UI elements
    const waterSlider = document.getElementById('water-slider');
    const currentWaterDisplay = document.getElementById('current-water');
    const maxWaterDisplay = document.getElementById('max-water');
    const hydrationBar = document.getElementById('hydration-bar');
    const hydrationGoalDisplay = document.getElementById('hydration-goal');
    const decreaseWaterBtn = document.getElementById('decrease-water');
    const increaseWaterBtn = document.getElementById('increase-water');
    const editGoalBtn = document.getElementById('edit-goal-btn');
    const saveGoalBtn = document.getElementById('save-goal-btn');
    const goalInput = document.getElementById('goal-input');
    const goalContainer = document.getElementById('goal-container');
    const editGoalContainer = document.getElementById('edit-goal-container');
    const supplementChecklist = document.getElementById('supplement-checklist');
    const resetButton = document.getElementById('reset-button');

    // Initialize hydration tracker
    waterSlider.max = hydrationGoal;
    waterSlider.value = hydrationLevel;
    currentWaterDisplay.textContent = hydrationLevel;
    maxWaterDisplay.textContent = hydrationGoal;
    hydrationGoalDisplay.textContent = hydrationGoal;
    goalInput.value = hydrationGoal;
    updateHydrationBar();

    // Build supplement sections
    buildSupplementSections();

    // Event Listeners
    waterSlider.addEventListener('input', function() {
        hydrationLevel = parseInt(this.value);
        updateHydrationUI();
    });

    decreaseWaterBtn.addEventListener('click', function() {
        hydrationLevel = Math.max(0, hydrationLevel - 8);
        updateHydrationUI();
    });

    increaseWaterBtn.addEventListener('click', function() {
        hydrationLevel = Math.min(hydrationGoal, hydrationLevel + 8);
        updateHydrationUI();
    });

    editGoalBtn.addEventListener('click', function() {
        goalContainer.classList.add('hidden');
        editGoalContainer.classList.remove('hidden');
    });

    saveGoalBtn.addEventListener('click', function() {
        const newGoal = parseInt(goalInput.value, 10);
        if (!isNaN(newGoal) && newGoal > 0) {
            hydrationGoal = newGoal;
            hydrationGoalDisplay.textContent = hydrationGoal;
            maxWaterDisplay.textContent = hydrationGoal;
            waterSlider.max = hydrationGoal;
            
            // If current level exceeds new goal, adjust it
            if (hydrationLevel > hydrationGoal) {
                hydrationLevel = hydrationGoal;
                currentWaterDisplay.textContent = hydrationLevel;
                waterSlider.value = hydrationLevel;
            }
            
            updateHydrationBar();
            saveToLocalStorage();
        }
        
        goalContainer.classList.remove('hidden');
        editGoalContainer.classList.add('hidden');
    });

    resetButton.addEventListener('click', function() {
        if (confirm('Are you sure you want to reset the tracker for a new day?')) {
            hydrationLevel = 0;
            supplements = JSON.parse(JSON.stringify(defaultSupplements)); // Deep clone
            updateHydrationUI();
            buildSupplementSections();
            saveToLocalStorage();
        }
    });

    // Functions
    function updateHydrationUI() {
        waterSlider.value = hydrationLevel;
        currentWaterDisplay.textContent = hydrationLevel;
        updateHydrationBar();
        saveToLocalStorage();
    }

    function updateHydrationBar() {
        const percentage = Math.min((hydrationLevel / hydrationGoal) * 100, 100);
        hydrationBar.style.width = `${percentage}%`;

        // Update button states
        decreaseWaterBtn.disabled = hydrationLevel <= 0;
        increaseWaterBtn.disabled = hydrationLevel >= hydrationGoal;

        if (decreaseWaterBtn.disabled) {
            decreaseWaterBtn.classList.add('bg-blue-300');
            decreaseWaterBtn.classList.remove('bg-blue-500');
        } else {
            decreaseWaterBtn.classList.remove('bg-blue-300');
            decreaseWaterBtn.classList.add('bg-blue-500');
        }

        if (increaseWaterBtn.disabled) {
            increaseWaterBtn.classList.add('bg-blue-300');
            increaseWaterBtn.classList.remove('bg-blue-500');
        } else {
            increaseWaterBtn.classList.remove('bg-blue-300');
            increaseWaterBtn.classList.add('bg-blue-500');
        }
    }

    function buildSupplementSections() {
        // Clear existing sections
        const headerNode = supplementChecklist.firstElementChild;
        supplementChecklist.innerHTML = '';
        supplementChecklist.appendChild(headerNode);

        // Build each section
        Object.keys(supplements).forEach(timeOfDay => {
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'border-t border-gray-200';
            sectionDiv.innerHTML = `
                <div class="p-4 bg-green-100 flex justify-between items-center cursor-pointer section-header" data-section="${timeOfDay}">
                    <h3 class="font-semibold text-green-800">${sectionTitles[timeOfDay]}</h3>
                    <span class="expand-icon">▼</span>
                </div>
                <div class="p-4 section-content" id="${timeOfDay}-content">
                    <ul class="mb-4" id="${timeOfDay}-list">
                        ${supplements[timeOfDay].map(supplement => `
                            <li class="mb-2 flex items-center">
                                <input
                                    type="checkbox"
                                    id="${supplement.id}"
                                    data-section="${timeOfDay}"
                                    ${supplement.checked ? 'checked' : ''}
                                    class="mr-2 h-5 w-5 form-checkbox supplement-checkbox"
                                />
                                <label 
                                    for="${supplement.id}"
                                    class="${supplement.checked ? 'line-through text-gray-500' : 'text-gray-800'}"
                                >
                                    ${supplement.name}
                                </label>
                            </li>
                        `).join('')}
                    </ul>
                    <div class="flex">
                        <input
                            type="text"
                            id="${timeOfDay}-new-supplement"
                            placeholder="Add new supplement..."
                            class="flex-grow p-2 border rounded-l"
                        />
                        <button
                            data-section="${timeOfDay}"
                            class="px-4 py-2 bg-green-500 text-white rounded-r hover:bg-green-600 add-supplement-btn"
                        >
                            Add
                        </button>
                    </div>
                </div>
            `;
            supplementChecklist.appendChild(sectionDiv);
        });

        // Add event listeners to section headers for collapsing/expanding
        document.querySelectorAll('.section-header').forEach(header => {
            header.addEventListener('click', function() {
                const sectionContent = this.nextElementSibling;
                const expandIcon = this.querySelector('.expand-icon');
                
                if (sectionContent.style.display === 'none') {
                    sectionContent.style.display = 'block';
                    expandIcon.textContent = '▼';
                } else {
                    sectionContent.style.display = 'none';
                    expandIcon.textContent = '►';
                }
            });
        });

        // Add event listeners to checkboxes
        document.querySelectorAll('.supplement-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const section = this.dataset.section;
                const id = this.id;
                const index = supplements[section].findIndex(s => s.id === id);
                
                if (index !== -1) {
                    supplements[section][index].checked = this.checked;
                    
                    // Update label style
                    const label = this.nextElementSibling;
                    if (this.checked) {
                        label.classList.add('line-through', 'text-gray-500');
                        label.classList.remove('text-gray-800');
                    } else {
                        label.classList.remove('line-through', 'text-gray-500');
                        label.classList.add('text-gray-800');
                    }
                    
                    saveToLocalStorage();
                }
            });
        });

        // Add event listeners to "Add" buttons
        document.querySelectorAll('.add-supplement-btn').forEach(button => {
            button.addEventListener('click', function() {
                const section = this.dataset.section;
                const inputElement = document.getElementById(`${section}-new-supplement`);
                const supplementName = inputElement.value.trim();
                
                if (supplementName) {
                    // Add new supplement
                    const newId = `${section[0]}${Date.now()}`;
                    supplements[section].push({
                        id: newId,
                        name: supplementName,
                        checked: false
                    });
                    
                    // Add new item to the list
                    const list = document.getElementById(`${section}-list`);
                    const li = document.createElement('li');
                    li.className = 'mb-2 flex items-center';
                    li.innerHTML = `
                        <input
                            type="checkbox"
                            id="${newId}"
                            data-section="${section}"
                            class="mr-2 h-5 w-5 form-checkbox supplement-checkbox"
                        />
                        <label for="${newId}" class="text-gray-800">
                            ${supplementName}
                        </label>
                    `;
                    
                    // Add event listener to the new checkbox
                    const newCheckbox = li.querySelector('input[type="checkbox"]');
                    newCheckbox.addEventListener('change', function() {
                        const s = this.dataset.section;
                        const i = this.id;
                        const idx = supplements[s].findIndex(item => item.id === i);
                        
                        if (idx !== -1) {
                            supplements[s][idx].checked = this.checked;
                            
                            // Update label style
                            const lbl = this.nextElementSibling;
                            if (this.checked) {
                                lbl.classList.add('line-through', 'text-gray-500');
                                lbl.classList.remove('text-gray-800');
                            } else {
                                lbl.classList.remove('line-through', 'text-gray-500');
                                lbl.classList.add('text-gray-800');
                            }
                            
                            saveToLocalStorage();
                        }
                    });
                    
                    list.appendChild(li);
                    inputElement.value = '';
                    saveToLocalStorage();
                }
            });
        });
    }

    function saveToLocalStorage() {
        localStorage.setItem('hydrationLevel', hydrationLevel);
        localStorage.setItem('hydrationGoal', hydrationGoal);
        localStorage.setItem('supplements', JSON.stringify(supplements));
    }
});
