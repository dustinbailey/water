class WaterTracker {
    constructor() {
        this.goalOunces = 128;
        this.entries = this.loadEntries();
        this.currentOunces = this.calculateTotalOunces();
        this.initializeElements();
        this.addEventListeners();
        this.updateDisplay();
        this.updateLogDisplay();
        this.clearDataButton = document.getElementById('clear-data');
    }

    initializeElements() {
        this.progressBar = document.getElementById('progress');
        this.currentAmountDisplay = document.getElementById('current-amount');
        this.customAmountInput = document.getElementById('custom-amount');
        this.addCustomButton = document.getElementById('add-custom');
        this.resetButton = document.getElementById('reset');
        this.presetButtons = document.querySelectorAll('.preset');
        this.logEntriesContainer = document.getElementById('log-entries');
    }

    addEventListeners() {
        this.presetButtons.forEach(button => {
            button.addEventListener('click', () => {
                const amount = parseInt(button.dataset.amount);
                this.addWater(amount);
            });
        });

        this.addCustomButton.addEventListener('click', () => {
            const amount = parseInt(this.customAmountInput.value);
            if (amount > 0) {
                this.addWater(amount);
                this.customAmountInput.value = '';
            }
        });

        this.resetButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset your progress?')) {
                this.resetProgress();
            }
        });

        this.clearDataButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all stored data? This cannot be undone.')) {
                this.clearAllData();
            }
        });
    }

    loadEntries() {
        const lastUpdated = localStorage.getItem('lastUpdated');
        const today = new Date().toDateString();
        
        if (lastUpdated !== today) {
            localStorage.setItem('lastUpdated', today);
            localStorage.setItem('entries', JSON.stringify([]));
            return [];
        }
        
        return JSON.parse(localStorage.getItem('entries')) || [];
    }

    calculateTotalOunces() {
        return this.entries.reduce((total, entry) => total + entry.amount, 0);
    }

    addWater(ounces) {
        const entry = {
            id: Date.now(),
            amount: ounces,
            timestamp: new Date().toISOString()
        };
        
        this.entries.push(entry);
        this.currentOunces = this.calculateTotalOunces();
        this.saveEntries();
        this.updateDisplay();
        this.updateLogDisplay();
    }

    deleteEntry(id) {
        this.entries = this.entries.filter(entry => entry.id !== id);
        this.currentOunces = this.calculateTotalOunces();
        this.saveEntries();
        this.updateDisplay();
        this.updateLogDisplay();
    }

    saveEntries() {
        localStorage.setItem('entries', JSON.stringify(this.entries));
    }

    resetProgress() {
        this.entries = [];
        this.currentOunces = 0;
        this.saveEntries();
        this.updateDisplay();
        this.updateLogDisplay();
    }

    updateDisplay() {
        const percentage = Math.min((this.currentOunces / this.goalOunces) * 100, 100);
        this.progressBar.style.width = `${percentage}%`;
        this.currentAmountDisplay.textContent = this.currentOunces;
    }

    clearAllData() {
        localStorage.removeItem('lastUpdated');
        localStorage.removeItem('entries');
        this.entries = [];
        this.currentOunces = 0;
        this.updateDisplay();
        this.updateLogDisplay();
    }

    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }

    updateLogDisplay() {
        this.logEntriesContainer.innerHTML = '';
        
        if (this.entries.length === 0) {
            this.logEntriesContainer.innerHTML = '<div class="no-entries">No entries yet today</div>';
            return;
        }

        // Sort entries by timestamp, newest first
        const sortedEntries = [...this.entries].sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );

        sortedEntries.forEach(entry => {
            const entryElement = document.createElement('div');
            entryElement.className = 'log-entry';
            entryElement.innerHTML = `
                <div class="entry-details">
                    <span class="entry-amount">${entry.amount} oz</span>
                    <span class="entry-timestamp">${this.formatTimestamp(entry.timestamp)}</span>
                </div>
                <button class="delete-entry" data-id="${entry.id}">Delete</button>
            `;

            const deleteButton = entryElement.querySelector('.delete-entry');
            deleteButton.addEventListener('click', () => this.deleteEntry(entry.id));

            this.logEntriesContainer.appendChild(entryElement);
        });
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WaterTracker();
}); 