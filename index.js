let currentFilteredIndex = 0;
let lastDataSignature = '';

function drawViz(data) {
  // Clear the canvas area for fresh rendering
  document.body.innerHTML = '';

  const rows = data.tables.DEFAULT;
  // This automatically finds the correct internal ID for your "Name of Project" column
  const dimensionId = data.fields.dimId[0].id; 

  if (!rows || rows.length === 0) {
    document.body.innerHTML = '<div style="font-family:sans-serif;color:#666;font-size:14px;">No matching projects found.</div>';
    return;
  }

  // Create a unique fingerprint of the current dataset rows (helps detect when user changes their search)
  const currentDataSignature = rows.map(r => r['dimId'][0]).join(',');
  
  // If the user typed a new search term, reset the navigation pointer back to the 1st result
  if (currentDataSignature !== lastDataSignature) {
    currentFilteredIndex = 0;
    lastDataSignature = currentDataSignature;
  }

  // Ensure our pointer doesn't fall out of bounds
  if (currentFilteredIndex >= rows.length) {
    currentFilteredIndex = 0;
  }

  // Build the clean layout UI
  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.gap = '12px';

  // Left Arrow Button
  const btnPrev = document.createElement('button');
  btnPrev.innerText = "‹";
  btnPrev.disabled = currentFilteredIndex === 0;
  btnPrev.onclick = () => {
    if (currentFilteredIndex > 0) {
      currentFilteredIndex--;
      applyFilter(rows[currentFilteredIndex]['dimId'][0], dimensionId);
    }
  };

  // Middle Text Page Indicator (e.g., 1 of 12)
  const statusIndicator = document.createElement('span');
  statusIndicator.innerText = `${currentFilteredIndex + 1} of ${rows.length}`;
  statusIndicator.style.fontFamily = 'sans-serif';
  statusIndicator.style.fontSize = '14px';
  statusIndicator.style.color = '#333';
  statusIndicator.style.userSelect = 'none';

  // Right Arrow Button
  const btnNext = document.createElement('button');
  btnNext.innerText = "›";
  btnNext.disabled = currentFilteredIndex === rows.length - 1;
  btnNext.onclick = () => {
    if (currentFilteredIndex < rows.length - 1) {
      currentFilteredIndex++;
      applyFilter(rows[currentFilteredIndex]['dimId'][0], dimensionId);
    }
  };

  // Apply clean button styling
  [btnPrev, btnNext].forEach(btn => {
    btn.style.padding = '4px 12px';
    btn.style.fontSize = '18px';
    btn.style.fontWeight = 'bold';
    btn.style.cursor = 'pointer';
    btn.style.border = '1px solid #bdc3c7';
    btn.style.borderRadius = '4px';
    btn.style.backgroundColor = '#ffffff';
    btn.style.transition = 'background 0.2s';
    if (btn.disabled) {
      btn.style.opacity = '0.3';
      btn.style.cursor = 'not-allowed';
    }
  });

  // Assemble the nav component on screen
  container.appendChild(btnPrev);
  container.appendChild(statusIndicator);
  container.appendChild(btnNext);
  document.body.appendChild(container);

  // Send the filter immediately on load so the dashboard is constrained to the active index item
  applyFilter(rows[currentFilteredIndex]['dimId'][0], dimensionId);
}

function applyFilter(selectedValue, dimensionId) {
  const interaction = {
    concepts: [dimensionId],
    values: [[selectedValue]]
  };
  dscc.sendInteraction('FILTER', interaction);
}

// Subscribe to Looker Studio's internal data feed engine
dscc.subscribeToData(drawViz, {transform: dscc.objectTransform});
