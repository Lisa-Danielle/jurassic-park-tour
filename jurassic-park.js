document.addEventListener('DOMContentLoaded', () => {
    // Ensure the error modal is hidden immediately on page load
    document.getElementById('errorModal').style.display = 'none';
  
    const attractions = [
      { id: 'trex', name: 'T-Rex Kingdom' },
      { id: 'velociraptor', name: 'Velociraptor Paddock' },
      { id: 'brachiosaurus', name: 'Brachiosaurus River Cruise' },
      { id: 'triceratops', name: 'Triceratops Sanctuary' },
      { id: 'gallimimus', name: 'Gallimimus Valley Drive' },
      { id: 'mosasaurus', name: 'Mosasaurus Feeding Show' },
      { id: 'aviary', name: 'Pteranodon Aviary' }
    ];
  
    const attractionList = document.getElementById('attractionList');
    const itineraryList = document.getElementById('itineraryList');
    const generateSummaryBtn = document.getElementById('generateSummaryBtn');
    const summarySection = document.getElementById('summarySection');
    const tourSummaryContent = document.getElementById('tourSummaryContent');
    const startNewTourBtn = document.getElementById('startNewTourBtn');
  
    // Modal elements
    const errorModal = document.getElementById('errorModal');
    const modalMessage = document.getElementById('modalMessage');
    const closeButton = document.querySelector('.close-button');
    const modalOkButton = document.querySelector('.modal-ok-button');
  
  
    let currentItinerary = []; // Stores the attractions in the order they are added
  
    // --- Modal Control Functions ---
    function showModal(message) {
      modalMessage.textContent = message;
      errorModal.style.display = 'flex'; // Use flex to center
    }
  
    function hideModal() {
      errorModal.style.display = 'none';
    }
  
    // Close modal when clicking 'x' or 'OK' button
    closeButton.addEventListener('click', hideModal);
    modalOkButton.addEventListener('click', hideModal);
  
    // Close modal if user clicks outside of the modal content
    window.addEventListener('click', (event) => {
      if (event.target === errorModal) {
        hideModal();
      }
    });
  
  
    // --- Render Available Attractions ---
    function renderAttractions() {
      attractionList.innerHTML = ''; // Clear existing list
      attractions.forEach(attraction => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
          <span class="attraction-name">${attraction.name}</span>
          <button class="add-btn" data-id="${attraction.id}" data-name="${attraction.name}">Add</button>
        `;
        attractionList.appendChild(listItem);
      });
    }
  
    // --- Add to Itinerary ---
    attractionList.addEventListener('click', (event) => {
      if (event.target.classList.contains('add-btn')) {
        const id = event.target.dataset.id;
        const name = event.target.dataset.name;
  
        // BUG 4: Hidden Constraint for Mosasaurus Feeding Show (Now with Modal)
        if (id === 'mosasaurus') {
          const hasBrachiosaurus = currentItinerary.some(item => item.id === 'brachiosaurus');
          if (!hasBrachiosaurus) {
            // Show custom modal instead of alert()
            showModal("Error: Constraint violation. Required dependency missing (ID: brachiosaurus). Please ensure all prerequisites are satisfied.");
            return; // Stop adding Mosasaurus
          }
        }
  
        // BUG 1: Allows adding duplicates visually
        currentItinerary.push({ id, name });
        updateItineraryDisplay();
      }
    });
  
    // --- Update Itinerary Display ---
    function updateItineraryDisplay() {
      itineraryList.innerHTML = ''; // Clear only the dynamically added list items
  
      // BUG 5: The "No attractions added yet. Get planning!" message (p#itineraryInstructionsBug)
      // is now a static element in HTML and is NOT touched by this function,
      // ensuring it persists as a bug no matter what is added to the list below it.
  
      if (currentItinerary.length > 0) {
        currentItinerary.forEach(item => {
          const listItem = document.createElement('li');
          listItem.textContent = item.name;
          // BUG 2: No "remove" button here, making it hard to correct mistakes
          itineraryList.appendChild(listItem);
        });
      }
      // Hide summary if itinerary is being modified
      summarySection.style.display = 'none';
    }
  
    // --- Generate Tour Summary ---
    generateSummaryBtn.addEventListener('click', () => {
      if (currentItinerary.length === 0) {
        tourSummaryContent.innerHTML = '<p style="color:red; font-weight:bold;">Please add some attractions to your itinerary before generating a summary!</p>';
      } else {
        // Create a copy of the itinerary for sorting for Bug 3
        let summaryAttractions = [...currentItinerary];
  
        // BUG 3: Summary ignores user's order - sorts alphabetically instead
        summaryAttractions.sort((a, b) => a.name.localeCompare(b.name));
  
        // BUG 1 (Part 2): Summary consolidates duplicates - doesn't reflect actual itinerary count
        const uniqueAttractionNames = [];
        summaryAttractions.forEach(item => { // Iterate through the potentially sorted array
          if (!uniqueAttractionNames.includes(item.name)) {
            uniqueAttractionNames.push(item.name);
          }
        });
  
        let summaryHtml = '<p>Your Jurassic Park tour plan includes:</p><ul>';
        if (uniqueAttractionNames.length === 0) {
            // This case should ideally not be reached if currentItinerary.length > 0
            summaryHtml += `<li>No attractions selected.</li>`;
        } else {
            uniqueAttractionNames.forEach(name => {
                summaryHtml += `<li><strong>${name}</strong></li>`;
            });
        }
        summaryHtml += '</ul><p>Enjoy your adventure!</p>';
        tourSummaryContent.innerHTML = summaryHtml;
      }
      summarySection.style.display = 'block';
    });
  
    // --- Start New Tour ---
    startNewTourBtn.addEventListener('click', () => {
      currentItinerary = [];
      renderAttractions();
      updateItineraryDisplay(); // This will clear items from the UL, leaving the static instruction P tag
      summarySection.style.display = 'none';
      tourSummaryContent.innerHTML = '<p>Your summary will appear here after you click \'Generate Tour Summary\'.</p>';
    });
  
    // --- Initial Load ---
    renderAttractions();
    updateItineraryDisplay(); // Call to set the initial state (clears UL, leaves static P)
  });